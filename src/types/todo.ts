export const TODO_COLOR_IDS = [
  "none",
  "attention",
  "important",
  "urgent",
] as const;

export type TodoColorId = (typeof TODO_COLOR_IDS)[number];

export interface TodoItem {
  id: string;
  text: string;
  colorId: TodoColorId;
  pinned: boolean;
  completed: boolean;
  sortOrder: number;
  createTime: number;
  updateTime: number;
  /** 截止时间戳（毫秒），0 表示无截止 */
  dueDate: number;
  /** 是否已触发过提醒 */
  reminded: boolean;
}
