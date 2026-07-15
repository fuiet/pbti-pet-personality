-- Run once in the Supabase SQL Editor before deploying automatic portrait generation.
-- Keeps the first saved portrait for a pet/style and prevents duplicate generation
-- when the same report is opened in multiple browser tabs.

delete from public.pet_portraits as duplicate
using public.pet_portraits as keeper
where duplicate.pet_id = keeper.pet_id
  and duplicate.style_id = keeper.style_id
  and (
    duplicate.created_at > keeper.created_at
    or (duplicate.created_at = keeper.created_at and duplicate.id > keeper.id)
  );

create unique index if not exists pet_portraits_pet_style_unique
  on public.pet_portraits (pet_id, style_id);

notify pgrst, 'reload schema';
