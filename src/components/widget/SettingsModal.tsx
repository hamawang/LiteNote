import { useEffect, useRef } from "react";
import type { Locale, LocaleMode } from "@/i18n";
import type { MessageKey } from "@/i18n/messages";
import { t } from "@/i18n";
import type { ThemeId } from "@/lib/db";

interface SettingsModalProps {
  open: boolean;
  locale: Locale;
  localeMode: LocaleMode;
  onSetLocaleMode: (m: LocaleMode) => void;
  panelOpacity: number;
  onPanelOpacityChange: (v: number) => void;
  clockCollapsed: boolean;
  onSetClockCollapsed: (v: boolean) => void;
  autoStart: boolean;
  onSetAutoStart: (v: boolean) => void;
  theme: ThemeId;
  onSetTheme: (t: ThemeId) => void;
  onClose: () => void;
}

/* ──────────── Switch 滑动开关 ──────────── */
function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span style={{ color: "var(--ln-theme-text)" }} className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-sky-400"
        style={{ background: checked ? "#0ea5e9" : "var(--ln-theme-text-muted)" }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? "translateX(20px)" : "translateX(4px)" }}
        />
      </button>
    </label>
  );
}

/* ──────────── Select 下拉 ──────────── */
function Select<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
  label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: "var(--ln-theme-text)" }} className="text-sm shrink-0 mr-3">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg px-2.5 py-1.5 text-sm border-0 outline-none cursor-pointer flex-1 max-w-[140px]"
        style={{
          background: "var(--ln-theme-surface)",
          color: "var(--ln-theme-text)",
          border: `1px solid var(--ln-theme-border)`,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function SettingsModal({
  open,
  locale,
  localeMode,
  onSetLocaleMode,
  panelOpacity,
  onPanelOpacityChange,
  clockCollapsed,
  onSetClockCollapsed,
  autoStart,
  onSetAutoStart,
  theme,
  onSetTheme,
  onClose,
}: SettingsModalProps) {
  const mk = (key: MessageKey) => t(locale, key);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "var(--ln-theme-overlay)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-[320px] max-h-[90%] overflow-y-auto rounded-2xl px-5 py-5 shadow-2xl"
        style={{ background: "var(--ln-theme-bg)", backdropFilter: "var(--ln-theme-backdrop)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: "var(--ln-theme-text)" }}>
            {mk("settings")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10"
            style={{ color: "var(--ln-theme-text-secondary)" }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 外观 */}
        <section className="mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <span style={{ color: "var(--ln-theme-text)" }} className="text-sm">{mk("opacityLabel")}</span>
            <span className="text-xs w-8 text-right" style={{ color: "var(--ln-theme-text-secondary)" }}>
              {Math.round(panelOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={100}
            value={Math.round(panelOpacity * 100)}
            onChange={(e) => onPanelOpacityChange(Number(e.target.value) / 100)}
            className="w-full h-6 rounded-full appearance-none cursor-pointer bg-transparent"
            style={{
              WebkitAppearance: "none",
              appearance: "none" as React.CSSProperties["appearance"],
            }}
          />
          <style>{`
            input[type="range"]::-webkit-slider-runnable-track {
              height: 6px;
              border-radius: 999px;
              background: var(--ln-theme-text-muted);
            }
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: white;
              margin-top: -5px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
              cursor: pointer;
            }
            input[type="range"]::-moz-range-track {
              height: 6px;
              border-radius: 999px;
              background: var(--ln-theme-text-muted);
            }
            input[type="range"]::-moz-range-thumb {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: white;
              border: none;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
              cursor: pointer;
            }
          `}</style>
        </section>

        {/* 功能开关 */}
        <section className="mb-5 space-y-4">
          <Switch
            checked={!clockCollapsed}
            onChange={(v) => onSetClockCollapsed(!v)}
            label={mk("showClockSection")}
          />
          <Switch
            checked={autoStart}
            onChange={onSetAutoStart}
            label={mk("autoStart")}
          />
        </section>

        {/* 分隔线 */}
        <div className="mb-5" style={{ borderTop: `1px solid var(--ln-theme-border-light)` }} />

        {/* 主题 */}
        <section className="mb-4">
          <Select
            label={mk("themeLabel")}
            value={theme}
            onChange={onSetTheme}
            options={[
              { value: "glass" as const, label: mk("themeGlass") },
              { value: "dark" as const, label: mk("themeDark") },
              { value: "light" as const, label: mk("themeLight") },
            ]}
          />
        </section>

        {/* 语言 */}
        <section>
          <Select
            label={mk("language")}
            value={localeMode}
            onChange={onSetLocaleMode}
            options={[
              { value: "system" as const, label: mk("langSystem") },
              { value: "zh-CN" as const, label: mk("langZh") },
              { value: "en" as const, label: mk("langEn") },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
