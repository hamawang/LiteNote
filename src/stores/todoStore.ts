import { create } from "zustand";
import type { TodoItem, RecurrenceType } from "@/types/todo";
import {
  loadTodos,
  insertTodo,
  updateTodo,
  removeTodo,
  clearCompletedTodos as dbClearCompleted,
} from "@/lib/db";

// ──────────────── 类型定义 ────────────────

export interface TodoStoreState {
  todos: TodoItem[];
  /** 最近一次 DB 写入错误信息 */
  lastError: string | null;
}

export interface TodoStoreActions {
  init: () => Promise<void>;
  addTodo: () => string;
  /** 实时更新文本（仅内存，不写 DB） */
  updateTodoText: (id: string, text: string) => void;
  /** 提交编辑（blur / Enter 时调用）：写 DB */
  commitTodoEdit: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompletedTodos: () => void;
  togglePinned: (id: string) => void;
  toggleCompleted: (id: string) => void;
  setTodoColor: (id: string, colorId: TodoItem["colorId"]) => void;
  setTodoDueDate: (id: string, dueDate: number) => void;
  setTodoRecurrence: (
    id: string,
    isRecurring: boolean,
    type: RecurrenceType,
    config: string,
  ) => void;
  /** 直接更新一条 todo（用于自动推进循环时间等场景） */
  updateTodoDirect: (id: string, dueDate: number) => void;
  clearError: () => void;
}

function nextOrder(todos: TodoItem[]): number {
  if (todos.length === 0) return 1;
  return Math.max(...todos.map((x) => x.sortOrder)) + 1;
}

// ──────────────── 异步 DB 写（带错误反馈） ────────────────

function dbWrite(
  promise: Promise<unknown>,
  label: string,
  onError: (msg: string) => void,
): void {
  promise
    .then(() => console.log(`[LiteNote] ${label} ✅`))
    .catch((e) => {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[LiteNote] ${label} ❌`, e);
      onError(`${label} 失败: ${msg}`);
    });
}

// ──────────────── Store ────────────────

export const useTodoStore = create<TodoStoreState & TodoStoreActions>()(
  (set, get) => ({
    todos: [],
    lastError: null,

    clearError: () => set({ lastError: null }),

    init: async () => {
      const todos = await loadTodos();
      set({ todos });
    },

    // ── Todo 操作（乐观更新：同步改 state，异步写 DB） ──

    addTodo: () => {
      const now = Date.now();
      const id = crypto.randomUUID();
      const item: TodoItem = {
        id,
        text: "",
        colorId: "none",
        pinned: false,
        completed: false,
        sortOrder: nextOrder(get().todos),
        createTime: now,
        updateTime: now,
        dueDate: 0,
        reminded: false,
        isRecurring: false,
        recurrenceType: "none",
        recurrenceConfig: "",
      };
      set((s) => ({ todos: [...s.todos, item] }));
      dbWrite(
        insertTodo(item),
        "addTodo",
        (msg) => set({ lastError: msg }),
      );
      return id;
    },

    updateTodoText: (id, text) => {
      set((s) => ({
        todos: s.todos.map((x) =>
          x.id === id ? { ...x, text } : x,
        ),
      }));
    },

    commitTodoEdit: (id) => {
      const item = get().todos.find((x) => x.id === id);
      if (!item) return;
      const updated = { ...item, updateTime: Date.now() };
      dbWrite(
        updateTodo(updated),
        "updateTodo",
        (msg) => set({ lastError: msg }),
      );
    },

    deleteTodo: (id) => {
      set((s) => ({ todos: s.todos.filter((x) => x.id !== id) }));
      dbWrite(
        removeTodo(id),
        "deleteTodo",
        (msg) => set({ lastError: msg }),
      );
    },

    clearCompletedTodos: () => {
      set((s) => ({ todos: s.todos.filter((x) => !x.completed) }));
      dbWrite(
        dbClearCompleted(),
        "clearCompletedTodos",
        (msg) => set({ lastError: msg }),
      );
    },

    togglePinned: (id) => {
      const now = Date.now();
      let updated!: TodoItem;
      set((s) => ({
        todos: s.todos.map((x) =>
          x.id === id
            ? ((updated = { ...x, pinned: !x.pinned, updateTime: now }), updated)
            : x,
        ),
      }));
      if (updated) {
        dbWrite(
          updateTodo(updated),
          "togglePinned",
          (msg) => set({ lastError: msg }),
        );
      }
    },

    toggleCompleted: (id) => {
      const now = Date.now();
      let updated!: TodoItem;
      set((s) => ({
        todos: s.todos.map((x) => {
          if (x.id !== id) return x;
          const nextCompleted = !x.completed;
          return ((updated = {
            ...x,
            completed: nextCompleted,
            pinned: nextCompleted ? false : x.pinned,
            updateTime: now,
          }),
          updated);
        }),
      }));
      if (updated) {
        dbWrite(
          updateTodo(updated),
          "toggleCompleted",
          (msg) => set({ lastError: msg }),
        );
      }
    },

    setTodoColor: (id, colorId) => {
      const now = Date.now();
      let updated!: TodoItem;
      set((s) => ({
        todos: s.todos.map((x) =>
          x.id === id
            ? ((updated = { ...x, colorId, updateTime: now }), updated)
            : x,
        ),
      }));
      if (updated) {
        dbWrite(
          updateTodo(updated),
          "setTodoColor",
          (msg) => set({ lastError: msg }),
        );
      }
    },

    setTodoDueDate: (id, dueDate) => {
      const now = Date.now();
      let updated!: TodoItem;
      set((s) => ({
        todos: s.todos.map((x) =>
          x.id === id
            ? ((updated = { ...x, dueDate, updateTime: now }), updated)
            : x,
        ),
      }));
      if (updated) {
        dbWrite(
          updateTodo(updated),
          "setTodoDueDate",
          (msg) => set({ lastError: msg }),
        );
      }
    },

    setTodoRecurrence: (id, isRecurring, type, config) => {
      const now = Date.now();
      let updated!: TodoItem;
      set((s) => ({
        todos: s.todos.map((x) =>
          x.id === id
            ? ((updated = {
                ...x,
                isRecurring,
                recurrenceType: type,
                recurrenceConfig: config,
                // 设为循环时重置 reminded，确保新轮次能提醒
                reminded: isRecurring ? false : x.reminded,
                updateTime: now,
              }),
              updated)
            : x,
        ),
      }));
      if (updated) {
        dbWrite(
          updateTodo(updated),
          "setTodoRecurrence",
          (msg) => set({ lastError: msg }),
        );
      }
    },

    updateTodoDirect: (id, dueDate) => {
      const now = Date.now();
      let updated!: TodoItem;
      set((s) => ({
        todos: s.todos.map((x) =>
          x.id === id
            ? ((updated = {
                ...x,
                dueDate,
                reminded: false,
                updateTime: now,
              }),
              updated)
            : x,
        ),
      }));
      if (updated) {
        dbWrite(
          updateTodo(updated),
          "updateTodoDirect",
          (msg) => set({ lastError: msg }),
        );
      }
    },
  }),
);
