import { useCallback, useEffect, useMemo } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
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
import { TodoContextMenu } from "./TodoContextMenu";
import { TodoList } from "./TodoList";

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
    updateTodoText,
    toggleCompleted,
    menuActions,
  } = useWidgetActions();

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

        {!clockCollapsed ? <ClockSection locale={locale} /> : null}

        <TodoList
          locale={locale}
          todos={todos}
          selectedId={selectedId}
          editingId={editingId}
          emptyHint={t(locale, "emptyHint")}
          onSelect={handleSelect}
          onContextMenu={handleContextMenu}
          onChangeText={updateTodoText}
          onEndEdit={handleEndEdit}
          onToggleCompleted={toggleCompleted}
        />

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
          onClose={() => setMenu(null)}
          onPin={menuActions.onPin}
          onDelete={menuActions.onDelete}
          onToggleDone={menuActions.onToggleDone}
          onPickColor={(c: TodoColorId) => menuActions.onPickColor(c)}
          onPickDueDate={menuActions.onPickDueDate}
          onOpenCustomDueDate={menuActions.onOpenCustomDueDate}
          onClearDueDate={menuActions.onClearDueDate}
        />
      ) : null}

      <DueDatePicker
        locale={locale}
        open={dueDatePickerFor !== null}
        onConfirm={handleDueDateConfirm}
        onCancel={handleDueDateCancel}
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
