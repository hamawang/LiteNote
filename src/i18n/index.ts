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

export function t(locale: Locale, key: MessageKey): string {
  const pack = messages[locale];
  return pack[key] ?? String(key);
}
