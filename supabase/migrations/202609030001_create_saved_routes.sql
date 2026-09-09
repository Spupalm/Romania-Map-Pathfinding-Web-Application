create table if not exists public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  backend_id text not null,
  backend_name text not null,
  start_city text not null,
  goal_city text not null,
  route_path jsonb not null check (jsonb_typeof(route_path) = 'array'),
  workflow_steps jsonb not null check (jsonb_typeof(workflow_steps) = 'array'),
  run_mode text not null,
  path_cost_km double precision not null check (path_cost_km >= 0),
  execution_time_ms double precision not null check (execution_time_ms >= 0),
  peak_memory_kb double precision not null check (peak_memory_kb >= 0),
  saved_at timestamptz not null default now()
);

alter table public.saved_routes enable row level security;

drop policy if exists "Users can read their saved routes" on public.saved_routes;
create policy "Users can read their saved routes"
on public.saved_routes
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their saved routes" on public.saved_routes;
create policy "Users can create their saved routes"
on public.saved_routes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create index if not exists saved_routes_user_backend_saved_at_idx
on public.saved_routes (user_id, backend_id, saved_at desc);

revoke all on table public.saved_routes from anon;
grant select, insert on table public.saved_routes to authenticated;

