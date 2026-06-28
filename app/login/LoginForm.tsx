"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.css";

type Mode = "signin" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    params.get("mode") === "signin" ? "signin" : "signup",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Si la confirmation d'email est désactivée, une session est créée directement.
        if (data.session) {
          router.replace("/board");
          router.refresh();
          return;
        }
        setInfo(
          "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.",
        );
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.replace("/board");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark} /> TaskFlow
        </Link>

        <h1 className={styles.title}>
          {mode === "signup" ? "Créer un compte" : "Bon retour"}
        </h1>
        <p className={styles.subtitle}>
          {mode === "signup"
            ? "Quelques secondes suffisent pour démarrer."
            : "Connectez-vous pour accéder à vos tableaux."}
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label}>
            Email
            <input
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
          </label>

          <label className={styles.label}>
            Mot de passe
            <input
              className="input"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {info && <p className={styles.info}>{info}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? "Veuillez patienter…"
              : mode === "signup"
                ? "Créer mon compte"
                : "Se connecter"}
          </button>
        </form>

        <p className={styles.toggle}>
          {mode === "signup" ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
              setInfo(null);
            }}
          >
            {mode === "signup" ? "Se connecter" : "Créer un compte"}
          </button>
        </p>
      </div>
    </main>
  );
}
