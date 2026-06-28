import dotenv from "dotenv";

// Importé en TOUT PREMIER dans index.ts (avant les routes/supabase).
// Charge .env.local (convention Next.js) puis .env en repli, sans écraser
// les variables déjà définies dans l'environnement.
dotenv.config({ path: ".env.local" });
dotenv.config();
