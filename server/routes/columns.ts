import { Router } from "express";
import type { AuthedRequest } from "../auth";
import { asyncHandler } from "../utils";

const router = Router();

// POST /api/columns — créer une colonne
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { supabase } = req as AuthedRequest;
    const { project_id, name, position } = req.body ?? {};

    if (!project_id || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "project_id et name sont requis" });
    }

    const { data, error } = await supabase
      .from("columns")
      .insert({ project_id, name: name.trim(), position: position ?? 0 })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  }),
);


// PATCH /api/columns/:id — renommer une colonne
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { supabase } = req as AuthedRequest;
    const { name } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name est requis" });
    }

    const { data, error } = await supabase
      .from("columns")
      .update({ name: name.trim() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Colonne introuvable" });
    return res.json(data);
  }),
);

// DELETE /api/columns/:id — supprimer une colonne (et ses tâches en cascade)
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { supabase } = req as AuthedRequest;
    const { error } = await supabase
      .from("columns")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).send();
  }),
);

export default router;
