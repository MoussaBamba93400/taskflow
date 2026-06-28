import { createClient } from "./supabase/client";
import type { Priority, Task } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  });

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* corps non-JSON */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type CreateTaskInput = {
  column_id: string;
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string | null;
  position?: number;
};

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "priority" | "due_date">
>;

export const api = {
  // Tâches
  createTask: (input: CreateTaskInput) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),

  updateTask: (id: string, input: UpdateTaskInput) =>
    request<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deleteTask: (id: string) =>
    request<void>(`/api/tasks/${id}`, { method: "DELETE" }),

  moveTask: (id: string, column_id: string, position: number) =>
    request<Task>(`/api/tasks/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify({ column_id, position }),
    }),

  // Colonnes
  createColumn: (project_id: string, name: string, position: number) =>
    request<{ id: string }>("/api/columns", {
      method: "POST",
      body: JSON.stringify({ project_id, name, position }),
    }),

  renameColumn: (id: string, name: string) =>
    request<void>(`/api/columns/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  deleteColumn: (id: string) =>
    request<void>(`/api/columns/${id}`, { method: "DELETE" }),
};
