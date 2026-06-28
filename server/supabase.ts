import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[taskflow-api] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants. " +
      "Renseignez votre fichier .env.local.",
  );
}

/**
 * Crée un client Supabase agissant pour le compte de l'utilisateur,
 * en transmettant son JWT. Les politiques RLS s'appliquent donc
 * automatiquement : chaque requête ne voit que les données de l'utilisateur.
 */
// Valeurs de repli syntaxiquement valides (le serveur démarre sans config).
const SAFE_URL = url || "http://localhost:54321";
const SAFE_KEY = anonKey || "missing-anon-key";

export function clientForToken(token: string): SupabaseClient {
  return createClient(SAFE_URL, SAFE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
