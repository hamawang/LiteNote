import { getDb } from "@/lib/db";

/** 是否启用截止时间提醒 */
const ENABLE_REMINDER = true;

let _polling = false;

/**
 * 启动截止时间提醒轮询。
 *
 * 每 30 秒扫描一次 todos 表，找到 `due_date > 0 且 due_date <= now`
 * 且 `reminded = 0` 的待办，发送系统通知后标记为已提醒。
 *
 * 调用时机：App 初始化完成后。
 */
export function startReminderPoll(): void {
  if (!ENABLE_REMINDER) return;
  if (_polling) return;
  _polling = true;

  let intervalId: ReturnType<typeof setInterval> | null = null;

  const check = async () => {
    try {
      const db = await getDb();
      const now = Date.now();

      const rows = await db.select<
        Array<{
          id: string;
          text: string;
          due_date: number;
        }>
      >(
        "SELECT id, text, due_date FROM todos WHERE due_date > 0 AND due_date <= $1 AND reminded = 0",
        [now],
      );

      if (rows.length === 0) return;

      const { sendNotification, isPermissionGranted, requestPermission } =
        await import("@tauri-apps/plugin-notification");

      let permitted = await isPermissionGranted();
      if (!permitted) {
        const result = await requestPermission();
        permitted = result === "granted";
      }
      if (!permitted) return;

      for (const row of rows) {
        const text = row.text || "(空)";
        sendNotification({
          title: "轻签 · 待办提醒",
          body: text.length > 40 ? text.slice(0, 40) + "…" : text,
        });

        // 标记为已提醒，避免重复通知
        await db.execute(
          "UPDATE todos SET reminded = 1 WHERE id = $1",
          [row.id],
        );
      }
    } catch {
      // 轮询失败静默处理
    }
  };

  // 首次延迟 5 秒，之后每 30 秒检查
  intervalId = setInterval(check, 30_000);
  setTimeout(check, 5_000);

  // 组件卸载时清理
  window.addEventListener("beforeunload", () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    _polling = false;
  });
}
