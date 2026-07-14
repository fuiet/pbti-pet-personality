create table if not exists pet_visual_profiles (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  species text check (species in ('cat','dog','unknown')),
  breed_candidates jsonb default '[]'::jsonb,
  coat jsonb default '{}'::jsonb,
  face jsonb default '{}'::jsonb,
  body_language jsonb default '{}'::jsonb,
  visual_signals jsonb default '{}'::jsonb,
  visual_tags text[] default '{}',
  photo_quality jsonb default '{}'::jsonb,
  raw_analysis jsonb default '{}'::jsonb,
  created_at timestamp default now()
);

grant select, insert, update, delete on public.pet_visual_profiles to authenticated;
alter table public.pet_visual_profiles enable row level security;

drop policy if exists "Users can view own visual profiles" on public.pet_visual_profiles;
drop policy if exists "Users can insert own visual profiles" on public.pet_visual_profiles;
drop policy if exists "Users can update own visual profiles" on public.pet_visual_profiles;
drop policy if exists "Users can delete own visual profiles" on public.pet_visual_profiles;

create policy "Users can view own visual profiles"
on public.pet_visual_profiles
for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own visual profiles"
on public.pet_visual_profiles
for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own visual profiles"
on public.pet_visual_profiles
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own visual profiles"
on public.pet_visual_profiles
for delete to authenticated
using (auth.uid() = user_id);
