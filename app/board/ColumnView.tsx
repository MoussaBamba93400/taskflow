"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import type { Column, Task } from "@/lib/types";
import TaskCard from "./TaskCard";
import styles from "./board.module.css";

type Props = {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onRenameColumn: (id: string, name: string) => void;
  onDeleteColumn: (id: string) => void;
};

export default function ColumnView({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onRenameColumn,
  onDeleteColumn,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const commit = () => {
    if (name.trim() && name.trim() !== column.name) {
      onRenameColumn(column.id, name.trim());
    } else {
      setName(column.name);
    }
    setEditing(false);
  };

  return (
    <section className={styles.column}>
      <header className={styles.columnHead}>
        {editing ? (
          <input
            className="input"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setName(column.name);
                setEditing(false);
              }
            }}
          />
        ) : (
          <>
            <div className={styles.columnTitle}>
              <button onDoubleClick={() => setEditing(true)} title="Double-clic pour renommer">
                {column.name}
              </button>
              <span className={styles.columnCount}>{tasks.length}</span>
            </div>
            <div className={styles.columnActions}>
              <button onClick={() => setEditing(true)} aria-label="Renommer la colonne">
                ✎
              </button>
              <button
                aria-label="Supprimer la colonne"
                onClick={() => {
                  if (confirm(`Supprimer la colonne « ${column.name} » et ses tâches ?`)) {
                    onDeleteColumn(column.id);
                  }
                }}
              >
                ×
              </button>
            </div>
          </>
        )}
      </header>

      <div
        ref={setNodeRef}
        className={`${styles.dropZone} ${isOver ? styles.dropZoneOver : ""}`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && <p className={styles.emptyCol}>Glissez une tâche ici</p>}
      </div>

      <button className={styles.addTask} onClick={() => onAddTask(column.id)}>
        + Ajouter une tâche
      </button>
    </section>
  );
}
