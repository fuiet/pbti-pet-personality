alter table public.pets add column if not exists photo_urls jsonb default '[]'::jsonb;

create table if not exists public.pet_portraits (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  style_id text not null,
  style_name text not null,
  image_url text not null,
  storage_path text,
  model text not null,
  prompt text not null,
  created_at timestamptz default now()
);

grant select, insert, update, delete on public.pet_portraits to authenticated;
alter table public.pet_portraits enable row level security;
drop policy if exists "Users can view own pet portraits" on public.pet_portraits;
drop policy if exists "Users can insert own pet portraits" on public.pet_portraits;
drop policy if exists "Users can delete own pet portraits" on public.pet_portraits;
create policy "Users can view own pet portraits" on public.pet_portraits for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own pet portraits" on public.pet_portraits for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete own pet portraits" on public.pet_portraits for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('pet-portraits', 'pet-portraits', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload own pet portraits" on storage.objects;
drop policy if exists "Users can view pet portraits" on storage.objects;
drop policy if exists "Users can delete own pet portraits" on storage.objects;
create policy "Users can upload own pet portraits" on storage.objects for insert to authenticated with check (bucket_id = 'pet-portraits' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can view pet portraits" on storage.objects for select to authenticated using (bucket_id = 'pet-portraits' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own pet portraits" on storage.objects for delete to authenticated using (bucket_id = 'pet-portraits' and (storage.foldername(name))[1] = auth.uid()::text);
