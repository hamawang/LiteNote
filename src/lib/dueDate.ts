/**
 * 截止时间工具函数。
 */

/** 获取某天 23:59:59.999 的时间戳 */
function endOfDay(d: Date): number {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

/** 今天 23:59:59 */
export function todayEnd(): number {
  return endOfDay(new Date());
}

/** 明天 23:59:59 */
export function tomorrowEnd(): number {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return endOfDay(d);
}

/** 本周末（本周日）23:59:59 */
export function weekendEnd(): number {
  const d = new Date();
  const day = d.getDay(); // 0=周日
  const daysToSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysToSunday);
  return endOfDay(d);
}

/**
 * 格式化截止时间为简短可读文本。
 * - 今天/明天 + 具体时间
 * - 已逾期：逾期 N天/N小时
 * - 其他：MM/DD HH:mm 或 MM/DD
 */
export function formatDueDate(ts: number, locale: "zh-CN" | "en"): string | null {
  if (!ts || ts <= 0) return null;

  const now = Date.now();
  const due = new Date(ts);
  const isEndOfDay = due.getHours() === 23 && due.getMinutes() === 59;

  // 今天
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  if (ts >= todayStart.getTime() && ts < tomorrowStart.getTime()) {
    if (ts < now) {
      const diffMs = now - ts;
      const diffHours = Math.floor(diffMs / 3600000);
      if (diffHours < 1) return locale === "zh-CN" ? "逾期不久" : "Overdue";
      if (diffHours < 24) return locale === "zh-CN" ? `逾期 ${diffHours}小时` : `Overdue ${diffHours}h`;
      const diffDays = Math.floor(diffMs / 86400000);
      return locale === "zh-CN" ? `逾期 ${diffDays}天` : `Overdue ${diffDays}d`;
    }
    if (isEndOfDay) return locale === "zh-CN" ? "今天" : "Today";
    return locale === "zh-CN"
      ? `今天 ${due.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
      : `Today ${due.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  }

  // 明天
  const dayAfterTomorrow = new Date(tomorrowStart); dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  if (ts >= tomorrowStart.getTime() && ts < dayAfterTomorrow.getTime()) {
    if (isEndOfDay) return locale === "zh-CN" ? "明天" : "Tomorrow";
    return locale === "zh-CN"
      ? `明天 ${due.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
      : `Tomorrow ${due.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  }

  // 已逾期
  if (ts < now) {
    const diffDays = Math.ceil((now - ts) / 86400000);
    return locale === "zh-CN" ? `逾期 ${diffDays}天` : `Overdue ${diffDays}d`;
  }

  // 其他将来时间
  const mmdd = `${due.getMonth() + 1}/${due.getDate()}`;
  if (isEndOfDay) return mmdd;
  return locale === "zh-CN"
    ? `${mmdd} ${due.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
    : `${mmdd} ${due.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}
