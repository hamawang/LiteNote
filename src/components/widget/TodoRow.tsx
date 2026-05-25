import { useEffect, useMemo, useRef } from "react";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";
import { COLOR_DOT_STYLE } from "@/lib/itemColors";
import { formatDueDate } from "@/lib/dueDate";
import type { TodoItem } from "@/types/todo";
import { useNow } from "@/hooks/useNow";

interface TodoRowProps {
  todo: TodoItem;
  locale: Locale;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onChangeText: (text: string) => void;
  onEndEdit: () => void;
  onToggleCompleted: () => void;
}

export function TodoRow({
  todo,
  locale,
  selected,
  editing,
  onSelect,
  onContextMenu,
  onChangeText,
  onEndEdit,
  onToggleCompleted,
}: TodoRowProps) {
  const accent = COLOR_DOT_STYLE[todo.colorId].background;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 每分钟刷新当前时间戳，确保逾期状态能自动更新
  const now = useNow(60_000);

  const dueLabel = useMemo(
    () => formatDueDate(todo.dueDate, locale === "en" ? "en" : "zh-CN"),
    [todo.dueDate, locale, now],
  );

  // 进入编辑态时，光标定位到文本末尾
  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [editing]);

  return (
    <div
      data-tauri-no-drag
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e);
      }}
      className={
        "flex min-h-12 cursor-default items-center gap-2 border-b border-white/15 px-2 transition sm:px-3 " +
        (selected ? "bg-white/18 " : "hover:bg-white/10 ")
      }
    >
      <button
        type="button"
        data-tauri-no-drag
        aria-pressed={todo.completed}
        aria-label={todo.completed ? t(locale, "menuUndone") : t(locale, "menuDone")}
        className={
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full outline-none transition " +
          "focus-visible:ring-2 focus-visible:ring-white/50"
        }
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompleted();
        }}
      >
        <span
          className={
            "flex h-[0.875rem] w-[0.875rem] items-center justify-center rounded-full border text-[0.5rem] font-semibold leading-none " +
            (todo.completed ? "border-transparent text-white" : "bg-transparent")
          }
          style={
            todo.completed
              ? { background: accent, boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.2)" }
              : { borderColor: accent }
          }
        >
          {todo.completed ? "✓" : null}
        </span>
      </button>
      <button
        type="button"
        data-tauri-no-drag
        className="flex min-w-0 flex-1 items-center py-1 text-left cursor-pointer bg-transparent border-0"
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        {editing ? (
          <textarea
            ref={textareaRef}
            data-tauri-no-drag
            className="min-h-10 w-0 flex-1 resize-none bg-transparent text-sm leading-snug text-white/90 outline-none ring-0"
            rows={2}
            value={todo.text}
            onChange={(e) => onChangeText(e.target.value)}
            onBlur={onEndEdit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                (e.target as HTMLTextAreaElement).blur();
              } else if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                (e.target as HTMLTextAreaElement).blur();
              } else if (e.key === "Enter" && e.shiftKey) {
                e.stopPropagation(); // 允许默认换行，阻止冒泡到父按钮
              }
            }}
          />
        ) : (
          <div className="flex min-w-0 flex-1 flex-col py-0.5">
            <span
              className={
                "whitespace-pre-wrap text-sm leading-snug text-white/90" +
                (todo.completed ? " opacity-50 line-through" : "")
              }
            >
              {todo.text || (locale === "zh-CN" ? "（空）" : "(empty)")}
            </span>
            {(todo.pinned || dueLabel) ? (
              <div className="mt-0.5 flex items-center gap-1.5">
                {todo.pinned ? (
                  <span className="text-xs text-sky-200/80">
                    ↑ {locale === "zh-CN" ? "置顶" : "Pinned"}
                  </span>
                ) : null}
                {dueLabel ? (
                  <span className={"text-xs " +
                    (todo.completed ? "text-white/30" : "text-white/50")
                  }>
                    {dueLabel}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </button>
    </div>
  );
}
