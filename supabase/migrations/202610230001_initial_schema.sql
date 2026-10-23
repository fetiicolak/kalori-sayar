begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  timezone text not null default 'Europe/Istanbul' check (char_length(timezone) between 1 and 80),
  units text not null default 'metric' check (units = 'metric'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.nutrition_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  valid_from date not null default current_date,
  valid_to date,
  calories numeric(7,1) not null check (calories > 0 and calories <= 20000),
  protein numeric(7,1) not null check (protein >= 0 and protein <= 2000),
  carbs numeric(7,1) not null check (carbs >= 0 and carbs <= 5000),
  fat numeric(7,1) not null check (fat >= 0 and fat <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint nutrition_goals_dates_valid check (valid_to is null or valid_to >= valid_from),
  constraint nutrition_goals_user_start_unique unique (user_id, valid_from)
);

create table public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consumed_at timestamptz not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  note text check (char_length(note) <= 500),
  client_updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint food_entries_owner_id_unique unique (user_id, id)
);

create table public.food_entry_items (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null default 0 check (position >= 0 and position < 100),
  name text not null check (char_length(name) between 1 and 160),
  amount_grams numeric(9,2) not null check (amount_grams > 0 and amount_grams <= 10000),
  calories numeric(9,1) not null check (calories >= 0 and calories <= 20000),
  protein numeric(9,1) not null check (protein >= 0 and protein <= 2000),
  carbs numeric(9,1) not null check (carbs >= 0 and carbs <= 5000),
  fat numeric(9,1) not null check (fat >= 0 and fat <= 2000),
  source_type text not null check (source_type in ('usda', 'open_food_facts', 'user', 'curated', 'ai_estimate')),
  source_ref text check (char_length(source_ref) <= 200),
  source_fetched_at timestamptz,
  ai_confidence numeric(4,3) check (ai_confidence is null or (ai_confidence >= 0 and ai_confidence <= 1)),
  user_modified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint food_entry_items_parent_owner_fk
    foreign key (user_id, entry_id)
    references public.food_entries(user_id, id)
    on delete cascade,
  constraint food_entry_items_position_unique unique (entry_id, position)
);

create table public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  calories_per_100g numeric(9,1) not null check (calories_per_100g >= 0 and calories_per_100g <= 2000),
  protein_per_100g numeric(9,1) not null check (protein_per_100g >= 0 and protein_per_100g <= 100),
  carbs_per_100g numeric(9,1) not null check (carbs_per_100g >= 0 and carbs_per_100g <= 100),
  fat_per_100g numeric(9,1) not null check (fat_per_100g >= 0 and fat_per_100g <= 100),
  source_type text not null default 'user' check (source_type in ('user', 'curated', 'ai_estimate')),
  source_note text check (char_length(source_note) <= 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint custom_foods_user_name_unique unique (user_id, name)
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type in ('gemini_photo_analysis')),
  document_version text not null check (char_length(document_version) between 1 and 40),
  granted boolean not null,
  decided_at timestamptz not null default timezone('utc', now()),
  constraint consents_decision_unique unique (user_id, consent_type, document_version)
);

create table public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consumed_at timestamptz not null,
  milliliters integer not null check (milliliters > 0 and milliliters <= 10000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null,
  kilograms numeric(6,2) not null check (kilograms > 0 and kilograms <= 1000),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index food_entries_user_consumed_idx on public.food_entries(user_id, consumed_at desc);
create index food_entry_items_entry_idx on public.food_entry_items(entry_id, position);
create index nutrition_goals_user_dates_idx on public.nutrition_goals(user_id, valid_from desc, valid_to);
create index water_entries_user_consumed_idx on public.water_entries(user_id, consumed_at desc);
create index weight_entries_user_measured_idx on public.weight_entries(user_id, measured_at desc);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger nutrition_goals_set_updated_at before update on public.nutrition_goals
for each row execute function public.set_updated_at();
create trigger food_entries_set_updated_at before update on public.food_entries
for each row execute function public.set_updated_at();
create trigger food_entry_items_set_updated_at before update on public.food_entry_items
for each row execute function public.set_updated_at();
create trigger custom_foods_set_updated_at before update on public.custom_foods
for each row execute function public.set_updated_at();
create trigger water_entries_set_updated_at before update on public.water_entries
for each row execute function public.set_updated_at();
create trigger weight_entries_set_updated_at before update on public.weight_entries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, timezone)
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80), ''),
    coalesce(nullif(left(new.raw_user_meta_data ->> 'timezone', 80), ''), 'Europe/Istanbul')
  );
  insert into public.nutrition_goals (user_id, valid_from, calories, protein, carbs, fat)
  values (new.id, current_date, 2000, 120, 230, 65);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.nutrition_goals enable row level security;
alter table public.food_entries enable row level security;
alter table public.food_entry_items enable row level security;
alter table public.custom_foods enable row level security;
alter table public.consents enable row level security;
alter table public.water_entries enable row level security;
alter table public.weight_entries enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_delete_own on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy nutrition_goals_select_own on public.nutrition_goals for select to authenticated using ((select auth.uid()) = user_id);
create policy nutrition_goals_insert_own on public.nutrition_goals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy nutrition_goals_update_own on public.nutrition_goals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy nutrition_goals_delete_own on public.nutrition_goals for delete to authenticated using ((select auth.uid()) = user_id);

create policy food_entries_select_own on public.food_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy food_entries_insert_own on public.food_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy food_entries_update_own on public.food_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy food_entries_delete_own on public.food_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy food_entry_items_select_own on public.food_entry_items for select to authenticated using ((select auth.uid()) = user_id);
create policy food_entry_items_insert_own on public.food_entry_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy food_entry_items_update_own on public.food_entry_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy food_entry_items_delete_own on public.food_entry_items for delete to authenticated using ((select auth.uid()) = user_id);

create policy custom_foods_select_own on public.custom_foods for select to authenticated using ((select auth.uid()) = user_id);
create policy custom_foods_insert_own on public.custom_foods for insert to authenticated with check ((select auth.uid()) = user_id);
create policy custom_foods_update_own on public.custom_foods for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy custom_foods_delete_own on public.custom_foods for delete to authenticated using ((select auth.uid()) = user_id);

create policy consents_select_own on public.consents for select to authenticated using ((select auth.uid()) = user_id);
create policy consents_insert_own on public.consents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy consents_update_own on public.consents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy consents_delete_own on public.consents for delete to authenticated using ((select auth.uid()) = user_id);

create policy water_entries_select_own on public.water_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy water_entries_insert_own on public.water_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy water_entries_update_own on public.water_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy water_entries_delete_own on public.water_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy weight_entries_select_own on public.weight_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy weight_entries_insert_own on public.weight_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy weight_entries_update_own on public.weight_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy weight_entries_delete_own on public.weight_entries for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.save_food_entry(
  p_id uuid,
  p_consumed_at timestamptz,
  p_meal_type text,
  p_note text,
  p_client_updated_at timestamptz,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  insert into public.food_entries (id, user_id, consumed_at, meal_type, note, client_updated_at)
  values (p_id, current_user_id, p_consumed_at, p_meal_type, p_note, p_client_updated_at)
  on conflict (id) do update set
    consumed_at = excluded.consumed_at,
    meal_type = excluded.meal_type,
    note = excluded.note,
    client_updated_at = excluded.client_updated_at
  where public.food_entries.user_id = current_user_id
    and public.food_entries.client_updated_at <= excluded.client_updated_at;

  if not exists (select 1 from public.food_entries where id = p_id and user_id = current_user_id) then
    raise exception 'entry is not owned by authenticated user' using errcode = '42501';
  end if;

  delete from public.food_entry_items where entry_id = p_id and user_id = current_user_id;

  insert into public.food_entry_items (
    id, entry_id, user_id, position, name, amount_grams, calories, protein, carbs, fat,
    source_type, source_ref, source_fetched_at, ai_confidence, user_modified
  )
  select
    item.id, p_id, current_user_id, item.position, item.name, item.amount_grams, item.calories,
    item.protein, item.carbs, item.fat, item.source_type, item.source_ref,
    item.source_fetched_at, item.ai_confidence, item.user_modified
  from jsonb_to_recordset(p_items) as item(
    id uuid,
    position integer,
    name text,
    amount_grams numeric,
    calories numeric,
    protein numeric,
    carbs numeric,
    fat numeric,
    source_type text,
    source_ref text,
    source_fetched_at timestamptz,
    ai_confidence numeric,
    user_modified boolean
  );

  return p_id;
end;
$$;

grant execute on function public.save_food_entry(uuid, timestamptz, text, text, timestamptz, jsonb) to authenticated;

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;

commit;
