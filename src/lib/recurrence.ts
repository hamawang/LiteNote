import type { RecurrenceConfig, RecurrenceType } from "@/types/todo";

/**
 * 根据当前循环规则，计算下一次到期时间戳。
 * 用于循环待办到达截止时间后自动推进到下一轮。
 *
 * @param currentDueDate 当前截止时间戳（毫秒）
 * @param type 循环类型
 * @param config 循环配置 JSON 字符串
 * @returns 下一次的截止时间戳，如果无法计算则返回 0
 */
export function computeNextDueDate(
  currentDueDate: number,
  type: RecurrenceType,
  config: string,
): number {
  if (!currentDueDate || currentDueDate <= 0 || type === "none") return 0;

  let cfg: RecurrenceConfig;
  try {
    cfg = JSON.parse(config);
  } catch {
    return 0;
  }

  const due = new Date(currentDueDate);
  const interval = Math.max(1, cfg.interval || 1);

  switch (type) {
    case "daily":
      return advanceDaily(due, interval);
    case "weekly":
      return advanceWeekly(due, interval, cfg.days || []);
    case "monthly":
      return advanceMonthly(due, interval, cfg.dayOfMonth);
    default:
      return 0;
  }
}

/** 每日：加 interval 天，保留原始时分秒 */
function advanceDaily(from: Date, interval: number): number {
  const next = new Date(from);
  next.setDate(next.getDate() + interval);
  return next.getTime();
}

/** 每周：在 days 列表中找下一个符合条件的星期几 */
function advanceWeekly(from: Date, interval: number, days: number[]): number {
  if (days.length === 0) return advanceDaily(from, interval * 7);

  const currentDay = from.getDay(); // 0=Sun
  const sorted = [...days].sort((a, b) => a - b);

  // 先在当前周内找下一个更大的 day
  let found = sorted.find((d) => d > currentDay);

  if (found !== undefined) {
    // 本周内还有
    const next = new Date(from);
    next.setDate(next.getDate() + (found - currentDay));
    return next.getTime();
  }

  // 跨越到下周（按 interval 计算周数），取最小的 day
  const next = new Date(from);
  // 距离下周第一个指定日的天数 = (7 - currentDay) + sorted[0]
  const daysToNext = (7 - currentDay) + sorted[0] + (interval - 1) * 7;
  next.setDate(next.getDate() + daysToNext);
  return next.getTime();
}

/** 每月：加 interval 月，保留原始时分秒，自动截断到月末 */
function advanceMonthly(
  from: Date,
  interval: number,
  dayOfMonth?: number,
): number {
  const targetDay = dayOfMonth || from.getDate();

  // 手动计算目标年月，避免 JS setMonth 自动滚动问题
  let y = from.getFullYear();
  let m = from.getMonth() + interval;
  while (m > 11) {
    m -= 12;
    y += 1;
  }

  // 目标月的最大天数（用下个月第 0 天 = 本月最后一天）
  const maxDay = new Date(y, m + 1, 0).getDate();
  const d = Math.min(targetDay, maxDay);

  const next = new Date(y, m, d, from.getHours(), from.getMinutes(), from.getSeconds(), from.getMilliseconds());
  return next.getTime();
}

/**
 * 格式化循环规则为可读文本。
 * 用于 UI 显示。
 */
export function formatRecurrence(
  type: RecurrenceType,
  config: string,
  locale: "zh-CN" | "en",
): string | null {
  if (type === "none" || !config) return null;

  let cfg: RecurrenceConfig;
  try {
    cfg = JSON.parse(config);
  } catch {
    return null;
  }

  const isZh = locale === "zh-CN";

  switch (type) {
    case "daily": {
      const n = cfg.interval || 1;
      if (n === 1) return isZh ? "每天重复" : "Daily";
      return isZh ? `每${n}天重复` : `Every ${n} days`;
    }
    case "weekly": {
      const days = cfg.days || [];
      const interval = cfg.interval || 1;
      const dayNames = isZh
        ? ["日", "一", "二", "三", "四", "五", "六"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      if (days.length === 0) {
        const prefix = isZh ? "每周重复" : "Weekly";
        if (interval === 1) return prefix;
        return isZh ? `每${interval}周重复` : `Every ${interval} weeks`;
      }

      const dayStr = days.map((d) => dayNames[d]).join("、");
      if (interval === 1) {
        return isZh ? `每${dayStr}` : `Every ${dayStr}`;
      }
      return isZh
        ? `每${interval}周${dayStr}`
        : `Every ${interval} weeks on ${dayStr}`;
    }
    case "monthly": {
      const day = cfg.dayOfMonth;
      const interval = cfg.interval || 1;
      if (interval === 1) {
        return day
          ? isZh
            ? `每月${day}号`
            : `Monthly on day ${day}`
          : isZh
            ? "每月重复"
            : "Monthly";
      }
      return day
        ? isZh
          ? `每${interval}月${day}号`
          : `Every ${interval} months on day ${day}`
        : isZh
          ? `每${interval}月重复`
          : `Every ${interval} months`;
    }
    default:
      return null;
  }
}
