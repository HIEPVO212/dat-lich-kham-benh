alter table public.reviews
  drop constraint if exists reviews_one_per_user;