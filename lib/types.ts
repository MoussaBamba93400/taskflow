export type Priority = "low" | "medium" | "high";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
};

export type Column = {
  id: string;
  project_id: string;
  name: string;
  position: number;
  created_at: string;
};

export type Task = {
  id: string;
  column_id: string;
  user_id: string;
  title: string;
  description: string;
  priority: Priority;
  due_date: string | null;
  position: number;
  created_at: string;
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
};

export const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"];
