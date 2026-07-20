alter table public.pets
  add column if not exists gender text;

alter table public.pets
  drop constraint if exists pets_gender_check;

alter table public.pets
  add constraint pets_gender_check
  check (gender is null or gender in ('male', 'female'));

notify pgrst, 'reload schema';
