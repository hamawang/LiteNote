import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";
import { sortTodos } from "@/lib/todoSort";
import type { TodoItem } from "@/types/todo";
import { TodoRow } from "./TodoRow";

function withCount(template: string, n: number): string {
  return template.replace(/\{n\}/g, String(n));
}

interface TodoListProps {
  locale: Locale;
  todos: TodoItem[];
  selectedId: string | null;
  editingId: string | null;
  emptyHint: string;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onChangeText: (id: string, text: string) => void;
  onEndEdit: () => void;
  onToggleCompleted: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
}

export function TodoList({
  locale,
  todos,
  selectedId,
  editingId,
  emptyHint,
  onSelect,
  onContextMenu,
  onChangeText,
  onEndEdit,
  onToggleCompleted,
  onReorder,
}: TodoListProps) {
  const [completedExpanded, setCompletedExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { activeSorted, completedSorted, activeIds } = useMemo(() => {
    const active = todos.filter((x) => !x.completed);
    const done = todos.filter((x) => x.completed);
    return {
      activeSorted: sortTodos(active),
      completedSorted: sortTodos(done),
      activeIds: active.map((x) => x.id),
    };
  }, [todos]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        onReorder(String(active.id), String(over.id));
      }
    },
    [onReorder],
  );

  const emptyCenter =
    "flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 text-center text-sm text-white/60";

  const renderRows = (list: TodoItem[]) =>
    list.map((todo) => (
      <TodoRow
        key={todo.id}
        todo={todo}
        locale={locale}
        selected={todo.id === selectedId}
        editing={todo.id === editingId}
        onSelect={() => onSelect(todo.id)}
        onContextMenu={(e) => onContextMenu(e, todo.id)}
        onChangeText={(text) => onChangeText(todo.id, text)}
        onEndEdit={onEndEdit}
        onToggleCompleted={() => onToggleCompleted(todo.id)}
      />
    ));

  if (todos.length === 0) {
    return (
      <div className={emptyCenter}>
        {emptyHint}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeSorted.length === 0 ? (
          <div className={emptyCenter}>
            {completedSorted.length > 0
              ? t(locale, "emptyNoActive")
              : emptyHint}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeIds}
              strategy={verticalListSortingStrategy}
            >
              {renderRows(activeSorted)}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {completedSorted.length > 0 ? (
        <div
          className="shrink-0 border-t border-white/15 bg-white/[0.08]"
          data-tauri-no-drag
        >
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-white/85 hover:bg-white/[0.06]"
            aria-expanded={completedExpanded}
            onClick={() => setCompletedExpanded((v) => !v)}
          >
            <span>
              {withCount(
                t(locale, "completedSection"),
                completedSorted.length,
              )}
            </span>
            <span className="text-xs text-white/50" aria-hidden>
              {completedExpanded ? "▼" : "▶"}
            </span>
          </button>
          {completedExpanded ? (
            <div className="max-h-[min(40vh,12rem)] overflow-y-auto border-t border-white/10">
              {renderRows(completedSorted)}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
