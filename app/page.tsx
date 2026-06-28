import Link from "next/link";
import styles from "./landing.module.css";

export default function Landing() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <span className={styles.logo}>
          <span className={styles.logoMark} /> TaskFlow
        </span>
        <Link href="/login" className="btn btn-ghost">
          Se connecter
        </Link>
      </nav>

      <section className={styles.hero}>
        <p className={styles.badge}>Kanban · Drag &amp; drop · Priorités</p>
        <h1 className={styles.title}>
          Organisez vos projets,
          <br />
          <span className={styles.accent}>colonne par colonne.</span>
        </h1>
        <p className={styles.lead}>
          TaskFlow est un tableau Kanban minimaliste pour suivre vos tâches sans
          friction. Créez des projets, glissez-déposez vos cartes, filtrez par
          priorité — tout est instantané.
        </p>
        <div className={styles.actions}>
          <Link href="/login" className="btn btn-primary">
            Commencer gratuitement
          </Link>
          <Link href="/login?mode=signin" className="btn btn-ghost">
            J&apos;ai déjà un compte
          </Link>
        </div>
      </section>

      <section className={styles.preview}>
        <div className={styles.board}>
          {[
            { name: "À faire", color: "var(--prio-high)", count: 3 },
            { name: "En cours", color: "var(--prio-medium)", count: 2 },
            { name: "Terminé", color: "var(--prio-low)", count: 4 },
          ].map((col) => (
            <div key={col.name} className={styles.col}>
              <div className={styles.colHead}>
                <span>{col.name}</span>
                <span className={styles.colCount}>{col.count}</span>
              </div>
              {Array.from({ length: col.count }).map((_, i) => (
                <div key={i} className={styles.card}>
                  <span className={styles.dot} style={{ background: col.color }} />
                  <span className={styles.cardLine} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
