-- ================================================================
-- Family Tree — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ── People ──────────────────────────────────────────────────────
create table if not exists people (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Unnamed',
  relation    text not null default '',
  birth_year  text not null default '',
  notes       text not null default '',
  photo_url   text not null default '',
  gen         int  not null default 0,
  col         numeric not null default 0,
  color_tag   text not null default 'other',
  is_root     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Relationships (edges) ────────────────────────────────────────
create table if not exists relationships (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  person_a    uuid not null references people(id) on delete cascade,
  person_b    uuid not null references people(id) on delete cascade,
  rel_type    text not null default 'parent_child',
  created_at  timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────
create index if not exists idx_people_owner on people(owner_id);
create index if not exists idx_rel_owner    on relationships(owner_id);
create index if not exists idx_rel_a        on relationships(person_a);
create index if not exists idx_rel_b        on relationships(person_b);

-- ── auto-update updated_at ───────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_people_updated_at on people;
create trigger trg_people_updated_at
  before update on people
  for each row execute function set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────
-- Each user sees and edits only their own tree.
-- This is already multi-user-safe when you add more accounts later.

alter table people        enable row level security;
alter table relationships enable row level security;

-- people policies
drop policy if exists "select own people"    on people;
drop policy if exists "insert own people"    on people;
drop policy if exists "update own people"    on people;
drop policy if exists "delete own people"    on people;

create policy "select own people"  on people for select  using (auth.uid() = owner_id);
create policy "insert own people"  on people for insert  with check (auth.uid() = owner_id);
create policy "update own people"  on people for update  using (auth.uid() = owner_id);
create policy "delete own people"  on people for delete  using (auth.uid() = owner_id);

-- relationship policies
drop policy if exists "select own relationships" on relationships;
drop policy if exists "insert own relationships" on relationships;
drop policy if exists "update own relationships" on relationships;
drop policy if exists "delete own relationships" on relationships;

create policy "select own relationships" on relationships for select  using (auth.uid() = owner_id);
create policy "insert own relationships" on relationships for insert  with check (auth.uid() = owner_id);
create policy "update own relationships" on relationships for update  using (auth.uid() = owner_id);
create policy "delete own relationships" on relationships for delete  using (auth.uid() = owner_id);

-- ── Storage bucket for avatars ───────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "upload avatars"  on storage.objects;
drop policy if exists "update avatars"  on storage.objects;
drop policy if exists "view avatars"    on storage.objects;
drop policy if exists "delete avatars"  on storage.objects;

create policy "upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "update avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "delete avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');
