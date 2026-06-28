import { Router } from "express";
import type { AuthedRequest } from "../auth";
import { asyncHandler } from "../utils";

const router = Router();

const PRIORITIES = ["low", "medium", "high"];

// POST /api/tasks — créer une tâche
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { supabase } = req as AuthedRequest;
    const { column_id, title, description, priority, due_date, position } =
      req.body ?? {};

    if (!column_id || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "column_id et title sont requis" });
    }
    if (priority && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: "Priorité invalide" });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        column_id,
        title: title.trim(),
        description: description ?? "",
        priority: priority ?? "medium",
        due_date: due_date || null,
        position: position ?? 0,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  }),
);

// PATCH /api/tasks/:id — éditer une tâche
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { supabase } = req as AuthedRequest;
    const { title, description, priority, due_date } = req.body ?? {};

    const update: Record<string, unknown> = {};
    if (typeof title === "string") update.title = title.trim();
    if (typeof description === "string") update.description = description;
    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: "Priorité invalide" });
      }
      update.priority = priority;
    }
    if (due_date !== undefined) update.due_date = due_date || null;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(update)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Tâche introuvable" });
    return res.json(data);
  }),
);

// PATCH /api/tasks/:id/move — déplacer (colonne + position)
router.patch(
  "/:id/move",
  asyncHandler(async (req, res) => {
    const { supabase } = req as AuthedRequest;
    const { column_id, position } = req.body ?? {};

    if (!column_id || typeof position !== "number") {
      return res
        .status(400)
        .json({ error: "column_id et position (number) sont requis" });
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({ column_id, position })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Tâche introuvable" });
    return res.json(data);
  }),
);

// DELETE /api/tasks/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { supabase } = req as AuthedRequest;
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).send();
  }),
);

export default router;
