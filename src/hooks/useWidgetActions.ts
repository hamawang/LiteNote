import { useCallback, useMemo, useState } from "react";
import type { TodoColorId } from "@/types/todo";
import { useTodoStore } from "@/stores/todoStore";

/**
 * WidgetShell 业务逻辑 hook。
 * 将状态选择、UI 交互逻辑从 WidgetShell 组件中抽取出来。
 */
export function useWidgetActions() {
  const todos = useTodoStore((s) => s.todos);

  const addTodo = useTodoStore((s) => s.addTodo);
  const updateTodoText = useTodoStore((s) => s.updateTodoText);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const clearCompletedTodos = useTodoStore((s) => s.clearCompletedTodos);
  const togglePinned = useTodoStore((s) => s.togglePinned);
  const toggleCompleted = useTodoStore((s) => s.toggleCompleted);
  const setTodoColor = useTodoStore((s) => s.setTodoColor);
  const setTodoDueDate = useTodoStore((s) => s.setTodoDueDate);
  const commitTodoEdit = useTodoStore((s) => s.commitTodoEdit);

  // ── 本地 UI 状态 ──
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dueDatePickerFor, setDueDatePickerFor] = useState<string | null>(null);

  // ── 派生数据 ──
  const menuTodo = useMemo(
    () => (menu ? todos.find((x) => x.id === menu.id) ?? null : null),
    [menu, todos],
  );

  const completedCount = useMemo(
    () => todos.filter((x) => x.completed).length,
    [todos],
  );

  // ── 操作回调 ──
  const handleAdd = useCallback(() => {
    const id = addTodo();
    setSelectedId(id);
    setEditingId(id);
  }, [addTodo]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setEditingId(id);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    setSelectedId(id);
    setMenu({ id, x: e.clientX, y: e.clientY });
  }, []);

  const handleEndEdit = useCallback(() => {
    if (editingId) commitTodoEdit(editingId);
    setEditingId(null);
  }, [editingId, commitTodoEdit]);

  const handleClearCompleted = useCallback(() => {
    const sel = selectedId;
    const wasCompleted = sel !== null && todos.some((x) => x.id === sel && x.completed);
    clearCompletedTodos();
    setConfirmClear(false);
    if (wasCompleted) {
      setSelectedId(null);
      setEditingId(null);
    }
  }, [selectedId, todos, clearCompletedTodos]);

  const handleDeleteOne = useCallback(() => {
    if (confirmDeleteId) {
      deleteTodo(confirmDeleteId);
      if (selectedId === confirmDeleteId) setSelectedId(null);
    }
    setConfirmDeleteId(null);
    setMenu(null);
  }, [confirmDeleteId, deleteTodo, selectedId]);

  const menuActions = useMemo(
    () => ({
      onPin: () => menuTodo && togglePinned(menuTodo.id),
      onDelete: () => {
        if (menuTodo) {
          setMenu(null);
          setConfirmDeleteId(menuTodo.id);
        }
      },
      onToggleDone: () => menuTodo && toggleCompleted(menuTodo.id),
      onPickColor: (c: TodoColorId) => menuTodo && setTodoColor(menuTodo.id, c),
      onPickDueDate: (ts: number) => menuTodo && setTodoDueDate(menuTodo.id, ts),
      onOpenCustomDueDate: () => {
        if (menuTodo) setDueDatePickerFor(menuTodo.id);
      },
      onClearDueDate: () => menuTodo && setTodoDueDate(menuTodo.id, 0),
    }),
    [menuTodo, togglePinned, toggleCompleted, setTodoColor, setTodoDueDate],
  );

  return {
    // 数据
    todos,
    completedCount,
    menuTodo,
    // UI 状态
    selectedId,
    editingId,
    menu,
    confirmClear,
    confirmDeleteId,
    dueDatePickerFor,
    // 设置器
    setMenu,
    setConfirmClear,
    setConfirmDeleteId,
    // 操作
    handleAdd,
    handleSelect,
    handleContextMenu,
    handleEndEdit,
    handleClearCompleted,
    handleDeleteOne,
    handleDueDateConfirm: (ts: number) => {
      if (dueDatePickerFor && ts > 0) {
        setTodoDueDate(dueDatePickerFor, ts);
      }
      setDueDatePickerFor(null);
    },
    handleDueDateCancel: () => setDueDatePickerFor(null),
    updateTodoText,
    toggleCompleted,
    menuActions,
  };
}
