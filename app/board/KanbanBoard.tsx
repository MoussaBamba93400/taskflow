"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import type { Column, Priority, Project, Task } from "@/lib/types";
import { PRIORITY_LABELS } from "@/lib/types";
import ColumnView from "./ColumnView";
import TaskModal, { type TaskFormValues } from "./TaskModal";
import { TaskCardContent } from "./TaskCard";
import styles from "./board.module.css";

type BoardState = Record<string, Task[]>;

export default function KanbanBoard({ project }: { project: Project }) {
  const supabase = useMemo(() => createClient(), []);

  const [columns, setColumns] = useState<Column[]>([]);
  const [board, setBoardState] = useState<BoardState>({});
  const boardRef = useRef<BoardState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modal, setModal] = useState<{ columnId: string; task: Task | null } | null>(
    null,
  );

  const setBoard = useCallback((next: BoardState) => {
    boardRef.current = next;
    setBoardState(next);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: cols, error: colErr } = await supabase
      .from("columns")
      .select("*")
      .eq("project_id", project.id)
      .order("position", { ascending: true });

    if (colErr) {
      setError(colErr.message);
      setLoading(false);
      return;
    }

    const columnList = (cols as Column[]) ?? [];
    const { data: tasks, error: taskErr } = await supabase
      .from("tasks")
      .select("*")
      .in(
        "column_id",
        columnList.map((c) => c.id),
      )
      .order("position", { ascending: true });

    if (taskErr) {
      setError(taskErr.message);
      setLoading(false);
      return;
    }

    const next: BoardState = {};
    columnList.forEach((c) => (next[c.id] = []));
    (tasks as Task[] | null)?.forEach((t) => {
      (next[t.column_id] ??= []).push(t);
    });

    setColumns(columnList);
    setBoard(next);
    setLoading(false);
  }, [project.id, supabase, setBoard]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // --- Filtres (affichage uniquement) ---
  const matches = useCallback(
    (t: Task) => {
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return true;
    },
    [priorityFilter, search],
  );

  // --- Helpers DnD ---
  const findContainer = (id: string): string | undefined => {
    if (id in boardRef.current) return id;
    return Object.keys(boardRef.current).find((colId) =>
      boardRef.current[colId]!.some((t) => t.id === id),
    );
  };

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    const container = findContainer(id);
    const task = container
      ? boardRef.current[container]!.find((t) => t.id === id) ?? null
      : null;
    setActiveTask(task);
  };

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;

    const current = boardRef.current;
    const activeItems = current[activeContainer]!;
    const overItems = current[overContainer]!;
    const activeIndex = activeItems.findIndex((t) => t.id === activeId);
    const moved = activeItems[activeIndex];
    if (!moved) return;

    let overIndex: number;
    if (overId in current) {
      overIndex = overItems.length;
    } else {
      const idx = overItems.findIndex((t) => t.id === overId);
      overIndex = idx >= 0 ? idx : overItems.length;
    }

    setBoard({
      ...current,
      [activeContainer]: activeItems.filter((t) => t.id !== activeId),
      [overContainer]: [
        ...overItems.slice(0, overIndex),
        { ...moved, column_id: overContainer },
        ...overItems.slice(overIndex),
      ],
    });
  };

  const persistColumnOrder = async (columnId: string) => {
    const items = boardRef.current[columnId] ?? [];
    try {
      await Promise.all(
        items.map((t, i) =>
          t.column_id === columnId && t.position === i
            ? Promise.resolve()
            : api.moveTask(t.id, columnId, i),
        ),
      );
      // synchronise les positions locales
      setBoard({
        ...boardRef.current,
        [columnId]: items.map((t, i) => ({ ...t, column_id: columnId, position: i })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Déplacement non enregistré.");
      loadBoard();
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const overContainer = findContainer(overId);
    if (!overContainer) return;

    const items = boardRef.current[overContainer]!;
    const oldIndex = items.findIndex((t) => t.id === activeId);
    let newIndex: number;
    if (overId in boardRef.current) {
      newIndex = items.length - 1;
    } else {
      const idx = items.findIndex((t) => t.id === overId);
      newIndex = idx >= 0 ? idx : items.length - 1;
    }

    if (oldIndex !== -1 && oldIndex !== newIndex) {
      setBoard({
        ...boardRef.current,
        [overContainer]: arrayMove(items, oldIndex, newIndex),
      });
    }
    persistColumnOrder(overContainer);
  };

  // --- Tâches ---
  const handleCreateTask = async (columnId: string, values: TaskFormValues) => {
    try {
      const position = boardRef.current[columnId]?.length ?? 0;
      const task = await api.createTask({ column_id: columnId, position, ...values });
      setBoard({
        ...boardRef.current,
        [columnId]: [...(boardRef.current[columnId] ?? []), task],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création de la tâche impossible.");
    }
  };

  const handleUpdateTask = async (task: Task, values: TaskFormValues) => {
    try {
      const updated = await api.updateTask(task.id, values);
      setBoard({
        ...boardRef.current,
        [task.column_id]: (boardRef.current[task.column_id] ?? []).map((t) =>
          t.id === task.id ? { ...t, ...updated } : t,
        ),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Supprimer la tâche « ${task.title} » ?`)) return;
    try {
      await api.deleteTask(task.id);
      setBoard({
        ...boardRef.current,
        [task.column_id]: (boardRef.current[task.column_id] ?? []).filter(
          (t) => t.id !== task.id,
        ),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  // --- Colonnes ---
  const handleAddColumn = async () => {
    const name = prompt("Nom de la nouvelle colonne :", "Nouvelle colonne");
    if (!name?.trim()) return;
    try {
      await api.createColumn(project.id, name.trim(), columns.length);
      loadBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Colonne non créée.");
    }
  };

  const handleRenameColumn = async (id: string, name: string) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    try {
      await api.renameColumn(id, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Renommage impossible.");
      loadBoard();
    }
  };

  const handleDeleteColumn = async (id: string) => {
    try {
      await api.deleteColumn(id);
      loadBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  return (
    <div className={styles.boardWrap}>
      <header className={styles.boardHeader}>
        <div>
          <h1 className={styles.projectTitle}>{project.name}</h1>
          {project.description && (
            <p className={styles.projectDesc}>{project.description}</p>
          )}
        </div>

        <div className={styles.toolbar}>
          <input
            className={`input ${styles.searchInput}`}
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
          >
            <option value="all">Toutes priorités</option>
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <button className="btn btn-ghost" onClick={handleAddColumn}>
            + Colonne
          </button>
        </div>
      </header>

      {error && <div className={styles.banner}>{error}</div>}

      {loading ? (
        <p className={styles.loadingText}>Chargement du tableau…</p>
      ) : columns.length === 0 ? (
        <div className={styles.empty}>
          <h2>Tableau vide</h2>
          <p>Ajoutez une colonne pour organiser vos tâches.</p>
          <button className="btn btn-primary" onClick={handleAddColumn}>
            + Ajouter une colonne
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className={styles.columns}>
            {columns.map((col) => (
              <ColumnView
                key={col.id}
                column={col}
                tasks={(board[col.id] ?? []).filter(matches)}
                onAddTask={(columnId) => setModal({ columnId, task: null })}
                onEditTask={(task) => setModal({ columnId: task.column_id, task })}
                onDeleteTask={handleDeleteTask}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCardContent task={activeTask} dragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {modal && (
        <TaskModal
          initial={modal.task}
          onClose={() => setModal(null)}
          onSubmit={(values) =>
            modal.task
              ? handleUpdateTask(modal.task, values)
              : handleCreateTask(modal.columnId, values)
          }
        />
      )}
    </div>
  );
}
