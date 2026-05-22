import type { TodoColorId } from "@/types/todo";

/** 重要程度由低到高，用于菜单展示顺序 */
export const TODO_COLOR_IMPORTANCE_ORDER: readonly TodoColorId[] = [
  "none",
  "attention",
  "important",
  "urgent",
] as const;

export const TODO_COLOR_CSS_VAR: Record<TodoColorId, string> = {
  none: "var(--ln-todo-p-none)",
  attention: "var(--ln-todo-p-attention)",
  important: "var(--ln-todo-p-important)",
  urgent: "var(--ln-todo-p-urgent)",
};
