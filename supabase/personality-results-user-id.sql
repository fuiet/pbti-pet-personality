-- Ensures result rows are owned by the signed-in Supabase account.
-- Run this in Supabase SQL Editor if your existing personality_results table requires user_id.

alter table public.personality_results
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

update public.personality_results as result
set user_id = pet.user_id
from public.pets as pet
where result.pet_id = pet.id
  and result.user_id is null;

alter table public.personality_results
  alter column user_id set not null;

drop policy if exists "Users can view own results" on public.personality_results;
drop policy if exists "Users can insert own results" on public.personality_results;
drop policy if exists "Users can update own results" on public.personality_results;
drop policy if exists "Users can delete own results" on public.personality_results;

create policy "Users can view own results" on public.personality_results
for select to authenticated using (
  auth.uid() = user_id
  and exists (
    select 1 from public.pets
    where pets.id = personality_results.pet_id
      and pets.user_id = auth.uid()
  )
);
create policy "Users can insert own results" on public.personality_results
for insert to authenticated with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.pets
    where pets.id = personality_results.pet_id
      and pets.user_id = auth.uid()
  )
);
create policy "Users can update own results" on public.personality_results
for update to authenticated using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
);
create policy "Users can delete own results" on public.personality_results
for delete to authenticated using (auth.uid() = user_id);

notify pgrst, 'reload schema';
