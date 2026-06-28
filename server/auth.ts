import type { NextFunction, Request, Response } from "express";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { clientForToken } from "./supabase";

export interface AuthedRequest extends Request {
  supabase: SupabaseClient;
  user: User;
}

/**
 * Middleware : valide le JWT Supabase passé dans `Authorization: Bearer <token>`
 * et attache un client Supabase authentifié + l'utilisateur à la requête.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const token = header.slice("Bearer ".length);
  const supabase = clientForToken(token);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: "Session invalide ou expirée" });
  }

  (req as AuthedRequest).supabase = supabase;
  (req as AuthedRequest).user = user;
  next();
}
