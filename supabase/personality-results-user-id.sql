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
