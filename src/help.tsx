import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";
import "./index.css";

function parseLocale(): Locale {
  const q = new URLSearchParams(window.location.search).get("lang");
  return q === "en" ? "en" : "zh-CN";
}

const isZh = (l: Locale) => l === "zh-CN";

function HelpApp() {
  const locale = parseLocale();
  const zh = isZh(locale);

  const section = "mb-4";
  const sectionTitle = "mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400";
  const row = "flex items-start gap-2 text-sm leading-relaxed text-neutral-700";
  const keyBadge =
    "shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-neutral-500";

  return (
    <ErrorBoundary>
      <div className="flex h-full min-h-0 flex-col bg-white text-neutral-800">
        <header className="shrink-0 border-b border-neutral-200 px-4 py-3">
          <h1 className="text-sm font-semibold text-neutral-900">
            {t(locale, "appName")} · {t(locale, "helpTitle")}
          </h1>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-1">

          <div className={section}>
            <h3 className={sectionTitle}>
              {zh ? "⌨ 快捷键" : "⌨ Shortcuts"}
            </h3>
            <div className="space-y-1.5">
              <div className={row}>
                <span className={keyBadge}>
                  {zh ? "Cmd+Shift+L" : "Ctrl+Shift+L"}
                </span>
                <span>{zh ? "显示 / 隐藏窗口" : "Show / hide window"}</span>
              </div>
              <div className={row}>
                <span className={keyBadge}>Enter</span>
                <span>{zh ? "保存待办内容" : "Save to-do"}</span>
              </div>
              <div className={row}>
                <span className={keyBadge}>Shift+Enter</span>
                <span>{zh ? "换行输入" : "Line break"}</span>
              </div>
              <div className={row}>
                <span className={keyBadge}>Escape</span>
                <span>{zh ? "退出编辑" : "Exit editing"}</span>
              </div>
            </div>
          </div>

          <div className={section}>
            <h3 className={sectionTitle}>
              {zh ? "🖱 操作" : "🖱 Tips"}
            </h3>
            <div className="space-y-1.5">
              <div className={row}>
                <span className="text-neutral-400 shrink-0">·</span>
                <span>{zh ? "右键待办打开菜单（置顶 / 优先级 / 截止时间 / 删除）" : "Right-click for menu (pin / priority / due date / delete)"}</span>
              </div>
              <div className={row}>
                <span className="text-neutral-400 shrink-0">·</span>
                <span>{zh ? "拖拽顶栏可移动窗口位置" : "Drag the top bar to move window"}</span>
              </div>
              <div className={row}>
                <span className="text-neutral-400 shrink-0">·</span>
                <span>{zh ? "关闭窗口将隐藏到系统托盘" : "Closing hides to system tray"}</span>
              </div>
            </div>
          </div>

          <div className={section}>
            <h3 className={sectionTitle}>
              {zh ? "📅 截止时间提醒" : "📅 Due date reminder"}
            </h3>
            <div className={row}>
              <span className="text-neutral-400 shrink-0">·</span>
              <span>{zh ? "设置截止时间后，到期会自动弹出系统通知" : "System notification when due date arrives"}</span>
            </div>
          </div>

        </div>
      </div>
    </ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelpApp />
  </React.StrictMode>,
);
