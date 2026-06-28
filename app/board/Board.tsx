"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
import Sidebar from "./Sidebar";
import KanbanBoard from "./KanbanBoard";
import styles from "./board.module.css";

const DEFAULT_COLUMNS = ["À faire", "En cours", "Terminé"];

export default function Board({
  initialProjects,
  userEmail,
}: {
  initialProjects: Project[];
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProjects[0]?.id ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedId) ?? null;

  const createProject = async (name: string, description: string) => {
    setError(null);
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, description })
      .select()
      .single();

    if (error || !data) {
      setError(error?.message ?? "Création du projet impossible.");
      return;
    }

    const project = data as Project;
    setProjects((prev) => [...prev, project]);
    setSelectedId(project.id);

    // Crée les colonnes par défaut via l'API Express.
    try {
      await Promise.all(
        DEFAULT_COLUMNS.map((colName, i) =>
          api.createColumn(project.id, colName, i),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? `Projet créé, mais colonnes par défaut non créées : ${err.message}`
          : "Colonnes par défaut non créées.",
      );
    }
  };

  const renameProject = async (id: string, name: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ name })
      .eq("id", id);
    if (error) return setError(error.message);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return setError(error.message);
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className={styles.shell}>
      <Sidebar
        projects={projects}
        selectedId={selectedId}
        userEmail={userEmail}
        onSelect={setSelectedId}
        onCreate={createProject}
        onRename={renameProject}
        onDelete={deleteProject}
        onSignOut={signOut}
      />

      <div className={styles.workspace}>
        {error && <div className={styles.banner}>{error}</div>}
        {selectedProject ? (
          <KanbanBoard key={selectedProject.id} project={selectedProject} />
        ) : (
          <div className={styles.empty}>
            <h2>Aucun projet</h2>
            <p>Créez votre premier projet depuis la barre latérale pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
