-- Public homepage counters. Run once in the Supabase SQL editor.
-- The launch baseline is 12,847 assessments; every new completed result increments it.

create table if not exists public.public_site_stats (
  id boolean primary key default true check (id),
  assessment_count bigint not null default 12847,
  updated_at timestamptz not null default now()
);

insert into public.public_site_stats (id, assessment_count)
values (true, 12847)
on conflict (id) do nothing;

alter table public.public_site_stats enable row level security;

create or replace function public.get_public_pbti_stats()
returns table (assessment_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select greatest(public_site_stats.assessment_count, 12847)
  from public_site_stats
  where id = true;
$$;

grant execute on function public.get_public_pbti_stats() to anon, authenticated;

create or replace function public.increment_public_assessment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public_site_stats
  set assessment_count = assessment_count + 1,
      updated_at = now()
  where id = true;
  return new;
end;
$$;

drop trigger if exists increment_public_assessment_count_on_result on public.personality_results;
create trigger increment_public_assessment_count_on_result
after insert on public.personality_results
for each row execute function public.increment_public_assessment_count();

