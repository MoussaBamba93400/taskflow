"use client";

import { useState, type FormEvent } from "react";
import type { Project } from "@/lib/types";
import styles from "./board.module.css";

type Props = {
  projects: Project[];
  selectedId: string | null;
  userEmail: string;
  onSelect: (id: string) => void;
  onCreate: (name: string, description: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSignOut: () => void;
};

export default function Sidebar({
  projects,
  selectedId,
  userEmail,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onSignOut,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [open, setOpen] = useState(false);

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name.trim(), description.trim());
    setName("");
    setDescription("");
    setCreating(false);
  };

  const submitRename = async (id: string) => {
    if (editName.trim()) await onRename(id, editName.trim());
    setEditingId(null);
  };

  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
      <div className={styles.sidebarHead}>
        <span className={styles.logo}>
          <span className={styles.logoMark} /> TaskFlow
        </span>
        <button
          className={styles.mobileToggle}
          onClick={() => setOpen((v) => !v)}
          aria-label="Basculer la barre latérale"
        >
          ☰
        </button>
      </div>

      <div className={styles.projectsHead}>
        <span>Projets</span>
        <button
          className={styles.addBtn}
          onClick={() => setCreating((v) => !v)}
          aria-label="Nouveau projet"
        >
          +
        </button>
      </div>

      {creating && (
        <form className={styles.createForm} onSubmit={submitCreate}>
          <input
            className="input"
            placeholder="Nom du projet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            className="input"
            placeholder="Description (optionnel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className={styles.createActions}>
            <button type="submit" className="btn btn-primary">
              Créer
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setCreating(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <ul className={styles.projectList}>
        {projects.map((p) => (
          <li key={p.id}>
            {editingId === p.id ? (
              <input
                className="input"
                value={editName}
                autoFocus
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => submitRename(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename(p.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
            ) : (
              <div
                className={`${styles.projectItem} ${
                  selectedId === p.id ? styles.projectActive : ""
                }`}
              >
                <button className={styles.projectName} onClick={() => onSelect(p.id)}>
                  {p.name}
                </button>
                <div className={styles.projectActions}>
                  <button
                    aria-label="Renommer"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditName(p.name);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    aria-label="Supprimer"
                    onClick={() => {
                      if (
                        confirm(`Supprimer le projet « ${p.name} » et toutes ses tâches ?`)
                      ) {
                        onDelete(p.id);
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {projects.length === 0 && !creating && (
          <li className={styles.noProjects}>Aucun projet pour l&apos;instant.</li>
        )}
      </ul>

      <div className={styles.account}>
        <span className={styles.email} title={userEmail}>
          {userEmail}
        </span>
        <button className={styles.signout} onClick={onSignOut}>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
