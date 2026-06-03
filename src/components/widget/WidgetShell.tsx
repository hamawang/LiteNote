import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { resolveLocale, t } from "@/i18n";
import { openHelpWindow } from "@/lib/openHelpWindow";
import { openSettingsWindow } from "@/lib/openSettingsWindow";
import { useWidgetActions } from "@/hooks/useWidgetActions";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTodoStore } from "@/stores/todoStore";
import type { TodoColorId } from "@/types/todo";
import { ClockSection } from "./ClockSection";
import { ConfirmDialog } from "./ConfirmDialog";
import { DueDatePicker } from "./DueDatePicker";
import { FooterBar } from "./FooterBar";
import { HeaderBar } from "./HeaderBar";
import { RecurrencePicker } from "./RecurrencePicker";
import { TodoContextMenu } from "./TodoContextMenu";
import { TodoList } from "./TodoList";
import { WeekCalendar } from "./WeekCalendar";

/** 获取指定时间戳当天的开始时间（00:00:00） */
function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** 获取指定时间戳当天的结束时间（23:59:59.999） */
function endOfDay(ts: number): number {
  return startOfDay(ts) + 86_399_999;
}

export function WidgetShell() {
  const alwaysOnTop = useSettingsStore((s) => s.alwaysOnTop);
  const setAlwaysOnTop = useSettingsStore((s) => s.setAlwaysOnTop);
  const panelOpacity = useSettingsStore((s) => s.panelOpacity);
  const localeMode = useSettingsStore((s) => s.localeMode);
  const clockCollapsed = useSettingsStore((s) => s.clockCollapsed);
  const lastSettingsError = useSettingsStore((s) => s.lastError);
  const clearSettingsError = useSettingsStore((s) => s.clearError);
  const lastTodoError = useTodoStore((s) => s.lastError);
  const clearTodoError = useTodoStore((s) => s.clearError);

  // 周日历选中日期（null 表示不筛选）
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // 直接获取 setTodoDueDate（拖拽到日历日期时需用）
  const setTodoDueDate = useTodoStore((s) => s.setTodoDueDate);

  const lastError = lastSettingsError || lastTodoError;

  // 错误展示（自动清除）
  useEffect(() => {
    if (lastSettingsError) {
      const id = window.setTimeout(() => clearSettingsError(), 4000);
      return () => window.clearTimeout(id);
    }
  }, [lastSettingsError, clearSettingsError]);

  useEffect(() => {
    if (lastTodoError) {
      const id = window.setTimeout(() => clearTodoError(), 4000);
      return () => window.clearTimeout(id);
    }
  }, [lastTodoError, clearTodoError]);

  const locale = useMemo(() => resolveLocale(localeMode), [localeMode]);

  const {
    todos,
    completedCount,
    menuTodo,
    selectedId,
    editingId,
    menu,
    confirmClear,
    confirmDeleteId,
    dueDatePickerFor,
    recurrencePicker,
    setMenu,
    setConfirmClear,
    setConfirmDeleteId,
    handleAdd,
    handleSelect,
    handleContextMenu,
    handleEndEdit,
    handleClearCompleted,
    handleDeleteOne,
    handleDueDateConfirm,
    handleDueDateCancel,
    handleRecurrenceConfirm,
    handleRecurrenceCancel,
    updateTodoText,
    toggleCompleted,
    reorderTodos,
    menuActions,
  } = useWidgetActions();

  // 当前拖拽中的待办 id（用于 DragOverlay）
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const activeDragTodo = useMemo(
    () => (activeDragId ? todos.find((t) => t.id === activeDragId) ?? null : null),
    [activeDragId, todos],
  );

  // 根据周日历选中日期过滤待办
  const filteredTodos = useMemo(() => {
    if (selectedDate === null) return todos;
    return todos.filter((t) => {
      if (t.dueDate <= 0) return false;
      return t.dueDate >= selectedDate && t.dueDate <= endOfDay(selectedDate);
    });
  }, [todos, selectedDate]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh-CN" ? "zh-CN" : "en";
  }, [locale]);

  useEffect(() => {
    void (async () => {
      try {
        await getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
      } catch {
        /* 浏览器预览 */
      }
    })();
  }, [alwaysOnTop]);

  const handleHide = useCallback(async () => {
    try {
      await getCurrentWindow().hide();
    } catch {
      /* 非 Tauri */
    }
  }, []);

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 拖拽开始：记录被拖的待办
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  // 统一拖拽结束处理：排序 or 设置截止日期
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const overData = over.data.current as { type?: string; date?: number } | undefined;

      if (overData?.type === "day" && overData.date) {
        setTodoDueDate(activeId, overData.date);
        setSelectedDate(overData.date);
      } else if (activeId !== overId) {
        reorderTodos(activeId, overId);
      }
    },
    [setTodoDueDate, reorderTodos],
  );

  return (
    <>
      {/* 错误提示条 */}
      {lastError ? (
        <div className="absolute left-2 right-2 top-12 z-[200] rounded-lg bg-red-500/90 px-3 py-2 text-xs text-white shadow-lg">
          {lastError}
        </div>
      ) : null}

      <div
        className="flex h-full min-h-0 w-full flex-col overflow-hidden"
        data-tauri-drag-region
        style={{
          opacity: panelOpacity,
          background: "var(--ln-glass-bg)",
          backdropFilter: "blur(var(--ln-glass-blur))",
          WebkitBackdropFilter: "blur(var(--ln-glass-blur))",
        }}
      >
        <HeaderBar
          locale={locale}
          alwaysOnTop={alwaysOnTop}
          onToggleAlwaysOnTop={() => setAlwaysOnTop(!alwaysOnTop)}
          onOpenHelp={() =>
            void openHelpWindow({
              locale,
              title: `${t(locale, "appName")} · ${t(locale, "helpTitle")}`,
              fallbackAlertBody: t(locale, "helpOpenFailed"),
            })
          }
          onOpenSettings={() =>
            void openSettingsWindow({
              title: `${t(locale, "appName")} · ${t(locale, "settings")}`,
              fallbackAlertBody: t(locale, "settingsOpenFailed"),
            })
          }
          onHide={handleHide}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <WeekCalendar
            locale={locale}
            todos={todos}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {!clockCollapsed ? <ClockSection locale={locale} /> : null}

          <TodoList
            locale={locale}
            todos={filteredTodos}
            selectedId={selectedId}
            editingId={editingId}
            emptyHint={
              selectedDate !== null
                ? locale === "zh-CN"
                  ? "该日期暂无待办"
                  : "No tasks for this day"
                : t(locale, "emptyHint")
            }
            onSelect={handleSelect}
            onContextMenu={handleContextMenu}
            onChangeText={updateTodoText}
            onEndEdit={handleEndEdit}
            onToggleCompleted={toggleCompleted}
          />

          {/* 拖拽预览：便签图标 */}
          <DragOverlay dropAnimation={null}>
            {activeDragTodo ? (
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/20 backdrop-blur-md shadow-lg ring-1 ring-white/25">
                <svg className="w-4.5 h-4.5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="13" y2="17" />
                </svg>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <FooterBar
          locale={locale}
          clearCompletedDisabled={completedCount === 0}
          onAdd={handleAdd}
          onClearClick={() => setConfirmClear(true)}
        />
      </div>

      {menu && menuTodo ? (
        <TodoContextMenu
          locale={locale}
          x={menu.x}
          y={menu.y}
          completed={menuTodo.completed}
          pinned={menuTodo.pinned}
          dueDate={menuTodo.dueDate}
          isRecurring={menuTodo.isRecurring}
          onClose={() => setMenu(null)}
          onPin={menuActions.onPin}
          onDelete={menuActions.onDelete}
          onToggleDone={menuActions.onToggleDone}
          onPickColor={(c: TodoColorId) => menuActions.onPickColor(c)}
          onPickDueDate={menuActions.onPickDueDate}
          onOpenCustomDueDate={menuActions.onOpenCustomDueDate}
          onClearDueDate={menuActions.onClearDueDate}
          onSetRecurrence={menuActions.onSetRecurrence}
          onClearRecurrence={menuActions.onClearRecurrence}
        />
      ) : null}

      <DueDatePicker
        locale={locale}
        open={dueDatePickerFor !== null}
        onConfirm={handleDueDateConfirm}
        onCancel={handleDueDateCancel}
      />

      <RecurrencePicker
        locale={locale}
        open={recurrencePicker !== null}
        recurrenceType={recurrencePicker?.type ?? "none"}
        onConfirm={handleRecurrenceConfirm}
        onCancel={handleRecurrenceCancel}
      />

      <ConfirmDialog
        open={confirmClear}
        title={t(locale, "clearCompleted")}
        message={t(locale, "clearCompletedConfirm")}
        confirmLabel={t(locale, "confirm")}
        cancelLabel={t(locale, "cancel")}
        onCancel={() => setConfirmClear(false)}
        onConfirm={handleClearCompleted}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title={t(locale, "menuDelete")}
        message={t(locale, "deleteOneConfirm")}
        confirmLabel={t(locale, "confirm")}
        cancelLabel={t(locale, "cancel")}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteOne}
      />
    </>
  );
}
