import type { TodoColorId } from "@/types/todo";

/** 列表左侧圆点填充 */
export const COLOR_DOT_STYLE: Record<TodoColorId, { background: string }> = {
  none: { background: "var(--ln-todo-p-none)" },
  attention: { background: "var(--ln-todo-p-attention)" },
  important: { background: "var(--ln-todo-p-important)" },
  urgent: { background: "var(--ln-todo-p-urgent)" },
};
