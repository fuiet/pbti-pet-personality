-- Admin dashboard support tables for user insights and backend API traffic analytics.
-- Run this in the Supabase SQL Editor before opening /admin.

create table if not exists public.api_request_logs (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  method text not null,
  status integer not null,
  duration_ms integer not null default 0,
  request_bytes bigint,
  response_bytes bigint,
  user_id uuid references auth.users(id) on delete set null,
  ip_address text,
  user_agent text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists api_request_logs_created_at_idx
  on public.api_request_logs (created_at desc);

create index if not exists api_request_logs_route_created_at_idx
  on public.api_request_logs (route, created_at desc);

create index if not exists api_request_logs_status_created_at_idx
  on public.api_request_logs (status, created_at desc);

alter table public.api_request_logs enable row level security;

drop policy if exists "No direct client access to api_request_logs" on public.api_request_logs;
create policy "No direct client access to api_request_logs"
on public.api_request_logs
for all
to authenticated
using (false)
with check (false);
