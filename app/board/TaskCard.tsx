"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/types";
import { PRIORITY_LABELS } from "@/lib/types";
import styles from "./board.module.css";

function formatDue(date: string | null): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function TaskCardContent({
  task,
  onEdit,
  onDelete,
  dragging,
}: {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  dragging?: boolean;
}) {
  const due = formatDue(task.due_date);
  return (
    <div className={`${styles.card} ${dragging ? styles.cardDragging : ""}`}>
      <div className={styles.cardTop}>
        <span
          className={styles.prioDot}
          style={{ background: `var(--prio-${task.priority})` }}
          title={`Priorité ${PRIORITY_LABELS[task.priority]}`}
        />
        <p className={styles.cardTitle}>{task.title}</p>
        {(onEdit || onDelete) && (
          <div className={styles.cardActions}>
            {onEdit && (
              <button onClick={onEdit} aria-label="Éditer la tâche">
                ✎
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} aria-label="Supprimer la tâche">
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {task.description && <p className={styles.cardDesc}>{task.description}</p>}

      {due && (
        <div className={styles.cardMeta}>
          <span className={styles.due}>📅 {due}</span>
        </div>
      )}
    </div>
  );
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: "task", task } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardContent task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
