import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import Board from "./Board";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <Board
      initialProjects={(projects as Project[]) ?? []}
      userEmail={user.email ?? "Mon compte"}
    />
  );
}
