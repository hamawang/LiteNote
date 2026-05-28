import { getDb } from "@/lib/db";
import { computeNextDueDate } from "@/lib/recurrence";
import type { RecurrenceType } from "@/types/todo";

/** 是否启用截止时间提醒 */
const ENABLE_REMINDER = true;

/** 提前提醒量（毫秒），默认 15 分钟 */
const REMIND_ADVANCE_MS = 15 * 60 * 1000;

let _polling = false;

/**
 * 启动截止时间提醒轮询 + 循环待办自动推进。
 *
 * 每 30 秒扫描一次：
 * 1. 提醒逻辑：找到截止时间在提醒窗口内（提前15分钟）
 *    且 `reminded = 0` 的待办，发送系统通知后标记为已提醒。
 * 2. 推进逻辑：找到循环待办中 `due_date < now` 的项，自动计算下一轮时间并更新。
 *
 * 调用时机：App 初始化完成后。
 * 注意：Rust 端有独立的后台提醒轮询作为主力，此前端轮询作为双保险。
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
      const threshold = now + REMIND_ADVANCE_MS;

      // 1. 提醒检查
      const rows = await db.select<
        Array<{
          id: string;
          text: string;
          due_date: number;
        }>
      >(
        "SELECT id, text, due_date FROM todos WHERE due_date > 0 AND due_date - $1 <= $2 AND reminded = 0",
        [REMIND_ADVANCE_MS, threshold],
      );

      if (rows.length > 0) {
        const { sendNotification, isPermissionGranted, requestPermission } =
          await import("@tauri-apps/plugin-notification");

        let permitted = await isPermissionGranted();
        if (!permitted) {
          const result = await requestPermission();
          permitted = result === "granted";
        }
        if (permitted) {
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
        }
      }

      // 2. 循环待办自动推进：due_date < now 且 is_recurring = 1
      const overdueRecurring = await db.select<
        Array<{
          id: string;
          due_date: number;
          recurrence_type: string;
          recurrence_config: string;
        }>
      >(
        "SELECT id, due_date, recurrence_type, recurrence_config FROM todos WHERE is_recurring = 1 AND due_date > 0 AND due_date < $1",
        [now],
      );

      for (const row of overdueRecurring) {
        const nextDue = computeNextDueDate(
          row.due_date,
          row.recurrence_type as RecurrenceType,
          row.recurrence_config,
        );

        if (nextDue > 0) {
          await db.execute(
            "UPDATE todos SET due_date = $2, reminded = 0, update_time = $3 WHERE id = $1",
            [row.id, nextDue, now],
          );
          console.log(
            `[LiteNote] 循环待办 ${row.id} 自动推进到 ${new Date(nextDue).toLocaleString()}`,
          );
        }
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
