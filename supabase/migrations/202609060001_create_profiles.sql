-- =========================================================
-- PROFILES TABLE
-- =========================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique not null,
    email text unique not null,
    created_at timestamptz not null default now()
);


-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;


-- Users can view their own profile
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);


-- Users can update their own profile
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);


-- =========================================================
-- AUTOMATICALLY CREATE PROFILE AFTER SIGNUP
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        username,
        email
    )
    values (
        new.id,
        new.raw_user_meta_data->>'username',
        new.email
    );

    return new;
end;
$$;


drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute procedure public.handle_new_user();


-- =========================================================
-- USERNAME → EMAIL LOOKUP
-- =========================================================

create or replace function public.get_email_by_username(
    input_username text
)
returns text
language sql
security definer
set search_path = public
as $$
    select email
    from public.profiles
    where username = input_username
    limit 1;
$$;


-- Allow unauthenticated users to call ONLY this function.
-- This is needed because the login user is not authenticated yet.

revoke all on function public.get_email_by_username(text) from public;

grant execute
on function public.get_email_by_username(text)
to anon;

grant execute
on function public.get_email_by_username(text)
to authenticated;