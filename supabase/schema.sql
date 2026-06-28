-- TaskFlow — schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase.

create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  description text default '',
  created_at timestamptz default now()
);

create table if not exists columns (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  column_id uuid references columns(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  description text default '',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  due_date date,
  position int not null default 0,
  created_at timestamptz default now()
);

create index if not exists columns_project_id_idx on columns (project_id);
create index if not exists tasks_column_id_idx on tasks (column_id);

-- Row Level Security
alter table projects enable row level security;
alter table columns enable row level security;
alter table tasks enable row level security;

drop policy if exists "Users manage own projects" on projects;
create policy "Users manage own projects" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own columns" on columns;
create policy "Users manage own columns" on columns
  for all using (
    project_id in (select id from projects where user_id = auth.uid())
  ) with check (
    project_id in (select id from projects where user_id = auth.uid())
  );

drop policy if exists "Users manage own tasks" on tasks;
create policy "Users manage own tasks" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- (Optionnel) Données de démo : exécutez ce bloc une fois connecté,
-- il s'appuie sur auth.uid() pour rattacher les données à votre compte.
-- do $$
-- declare
--   pid uuid;
--   todo uuid; doing uuid; done uuid;
-- begin
--   insert into projects (name, description) values ('Refonte du site', 'Sprint Q3')
--     returning id into pid;
--   insert into columns (project_id, name, position) values (pid, 'À faire', 0) returning id into todo;
--   insert into columns (project_id, name, position) values (pid, 'En cours', 1) returning id into doing;
--   insert into columns (project_id, name, position) values (pid, 'Terminé', 2) returning id into done;
--   insert into tasks (column_id, title, priority, position) values
--     (todo, 'Maquette de la page d''accueil', 'high', 0),
--     (todo, 'Audit SEO', 'low', 1),
--     (doing, 'Intégration du header', 'medium', 0),
--     (done, 'Choix de la palette', 'medium', 0);
-- end $$;
