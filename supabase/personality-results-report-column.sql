-- Adds the report payload used by the PBTI result screen and account history.
-- Run this in Supabase SQL Editor for existing projects that were created before report storage was added.

alter table public.personality_results
  add column if not exists report jsonb;

alter table public.personality_results
  add column if not exists is_premium boolean not null default false;
