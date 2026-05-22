import { Solar } from "lunar-javascript";

/**
 * 农历一行：中文「正月十九」；英文前缀 + 仍用中文月日（库无英译）
 */
export function formatLunarLine(date: Date, locale: "zh-CN" | "en"): string {
  try {
    const lunar = Solar.fromDate(date).getLunar();
    const line = `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    return locale === "en" ? `Lunar ${line}` : line;
  } catch {
    return locale === "en" ? "Lunar —" : "农历 —";
  }
}
