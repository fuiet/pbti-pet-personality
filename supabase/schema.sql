create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  preferred_locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  species text not null check (species in ('cat', 'dog')),
  breed text,
  age_months integer check (age_months between 0 and 600),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.personality_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  pbti_id text not null unique,
  personality_type text not null,
  scores jsonb not null default '{}'::jsonb,
  basic_report jsonb not null default '{}'::jsonb,
  premium_report jsonb,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  result_id uuid not null references public.personality_results(id) on delete restrict,
  provider text not null check (provider = 'paypal'),
  provider_order_id text not null unique,
  provider_capture_id text unique,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  status text not null default 'created' check (status in ('created', 'approved', 'captured', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pets_user_id_idx on public.pets(user_id);
create index personality_results_user_id_idx on public.personality_results(user_id);
create index personality_results_pet_id_idx on public.personality_results(pet_id);
create index payments_user_id_idx on public.payments(user_id);
create index payments_result_id_idx on public.payments(result_id);

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.personality_results enable row level security;
alter table public.payments enable row level security;

create policy "Users can read own profile" on public.profiles for select using ((select auth.uid()) = id);
create policy "Users can update own profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users can manage own pets" on public.pets for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can read own results" on public.personality_results for select using ((select auth.uid()) = user_id);
create policy "Users can create own results" on public.personality_results for insert with check ((select auth.uid()) = user_id);
create policy "Users can read own payments" on public.payments for select using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Payment rows and paid report status must only be written by trusted server-side
-- PayPal order/capture handlers using the Supabase service role.
