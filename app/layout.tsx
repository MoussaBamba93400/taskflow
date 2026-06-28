import type { Metadata } from "next";
import { sans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow — Gestion de tâches Kanban",
  description:
    "TaskFlow : organisez vos projets en tableaux Kanban. Glissez-déposez vos tâches, suivez les priorités et avancez sereinement.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
