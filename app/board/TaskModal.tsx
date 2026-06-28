"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Priority, Task } from "@/lib/types";
import { PRIORITY_LABELS } from "@/lib/types";
import styles from "./board.module.css";

export type TaskFormValues = {
  title: string;
  description: string;
  priority: Priority;
  due_date: string | null;
};

export default function TaskModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: Task | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>
          {initial ? "Modifier la tâche" : "Nouvelle tâche"}
        </h2>

        <form className={styles.modalForm} onSubmit={submit}>
          <label className={styles.label}>
            Titre
            <input
              className="input"
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Que faut-il faire ?"
              required
            />
          </label>

          <label className={styles.label}>
            Description
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails, contexte, liens…"
            />
          </label>

          <div className={styles.modalRow}>
            <label className={styles.label}>
              Priorité
              <select
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              Échéance
              <input
                className="input"
                type="date"
                value={dueDate ?? ""}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ colorScheme: "dark" }}
              />
            </label>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Enregistrement…" : initial ? "Enregistrer" : "Créer la tâche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
