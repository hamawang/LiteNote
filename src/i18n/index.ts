import type { MessageKey } from "./messages";
import { messages } from "./messages";

export type Locale = "zh-CN" | "en";
export type LocaleMode = "system" | Locale;

export function getSystemLocale(): Locale {
  if (typeof navigator === "undefined") return "zh-CN";
  const l = navigator.language.toLowerCase();
  return l.startsWith("zh") ? "zh-CN" : "en";
}

export function resolveLocale(mode: LocaleMode): Locale {
  if (mode === "system") return getSystemLocale();
  return mode;
}

/**
 * 查表并做简单占位符替换：
 *   "还有 {time} 到期" + { time: "5m" } => "还有 5m 到期"
 *
 * 若未提供占位符值，则原样保留 `{xxx}`。
 */
export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const raw = messages[locale][key] ?? String(key);
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined || v === null ? `{${k}}` : String(v);
  });
}
