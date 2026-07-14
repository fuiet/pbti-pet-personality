create table users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamp default now()
);

create table pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  species text check (species in ('cat','dog')),
  breed text,
  age text,
  photo_url text,
  created_at timestamp default now()
);

create table personality_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  pet_id uuid references pets(id) on delete cascade,
  pbti_id text unique not null,
  personality_type text not null,
  scores jsonb,
  report jsonb,
  is_premium boolean default false,
  created_at timestamp default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  result_id uuid references personality_results(id) on delete cascade,
  provider text,
  payment_id text,
  amount numeric,
  status text,
  created_at timestamp default now()
);
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users_profile to authenticated;
grant select, insert, update, delete on public.pets to authenticated;
grant select, insert, update, delete on public.personality_results to authenticated;
grant select, insert, update, delete on public.payments to authenticated;

alter table public.users_profile enable row level security;
alter table public.pets enable row level security;
alter table public.personality_results enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Users can view own profile" on public.users_profile;
drop policy if exists "Users can insert own profile" on public.users_profile;
drop policy if exists "Users can update own profile" on public.users_profile;
create policy "Users can view own profile" on public.users_profile for select to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on public.users_profile for insert to authenticated with check (auth.uid() = id);
create policy "Users can update own profile" on public.users_profile for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can view own pets" on public.pets;
drop policy if exists "Users can insert own pets" on public.pets;
drop policy if exists "Users can update own pets" on public.pets;
drop policy if exists "Users can delete own pets" on public.pets;
create policy "Users can view own pets" on public.pets for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own pets" on public.pets for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own pets" on public.pets for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own pets" on public.pets for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can view own results" on public.personality_results;
drop policy if exists "Users can insert own results" on public.personality_results;
drop policy if exists "Users can update own results" on public.personality_results;
drop policy if exists "Users can delete own results" on public.personality_results;
create policy "Users can view own results" on public.personality_results for select to authenticated using (
  exists (select 1 from public.pets where pets.id = personality_results.pet_id and pets.user_id = auth.uid())
);
create policy "Users can insert own results" on public.personality_results for insert to authenticated with check (
  exists (select 1 from public.pets where pets.id = personality_results.pet_id and pets.user_id = auth.uid())
);
create policy "Users can update own results" on public.personality_results for update to authenticated using (
  exists (select 1 from public.pets where pets.id = personality_results.pet_id and pets.user_id = auth.uid())
) with check (
  exists (select 1 from public.pets where pets.id = personality_results.pet_id and pets.user_id = auth.uid())
);
create policy "Users can delete own results" on public.personality_results for delete to authenticated using (
  exists (select 1 from public.pets where pets.id = personality_results.pet_id and pets.user_id = auth.uid())
);

drop policy if exists "Users can view own payments" on public.payments;
drop policy if exists "Users can insert own payments" on public.payments;
create policy "Users can view own payments" on public.payments for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own payments" on public.payments for insert to authenticated with check (auth.uid() = user_id);

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
create policy "Users can view own visual profiles" on public.pet_visual_profiles for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own visual profiles" on public.pet_visual_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own visual profiles" on public.pet_visual_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own visual profiles" on public.pet_visual_profiles for delete to authenticated using (auth.uid() = user_id);
