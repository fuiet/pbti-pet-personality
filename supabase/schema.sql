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
  age integer,
  photo_url text,
  created_at timestamp default now()
);

create table personality_results (
  id uuid primary key default gen_random_uuid(),
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
