begin;

create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@example.test', '', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@example.test', '', now(), now(), now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is((select count(*)::integer from public.profiles), 1, 'user A sees only own profile');
select lives_ok($$ update public.profiles set display_name = 'A' where id = '10000000-0000-0000-0000-000000000001' $$, 'user A updates own profile');
select is((select count(*)::integer from public.profiles where id = '20000000-0000-0000-0000-000000000002'), 0, 'user A cannot read user B profile');

insert into public.food_entries (id, user_id, consumed_at, meal_type)
values ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', now(), 'lunch');
select is((select count(*)::integer from public.food_entries), 1, 'user A sees own food entry');
select throws_ok(
  $$ insert into public.food_entries (user_id, consumed_at, meal_type) values ('20000000-0000-0000-0000-000000000002', now(), 'lunch') $$,
  '42501',
  null,
  'user A cannot create an entry for user B'
);

insert into public.food_entry_items (
  entry_id, user_id, name, amount_grams, calories, protein, carbs, fat, source_type
) values (
  '11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Test', 100, 100, 5, 10, 2, 'user'
);
select is((select count(*)::integer from public.food_entry_items), 1, 'user A sees own food item');
select throws_ok(
  $$ insert into public.food_entry_items (entry_id, user_id, name, amount_grams, calories, protein, carbs, fat, source_type) values ('11000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Mismatch', 100, 100, 5, 10, 2, 'user') $$,
  '42501',
  null,
  'RLS rejects an item owned by user B'
);

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select is((select count(*)::integer from public.food_entries), 0, 'user B cannot read user A entries');
select is((select count(*)::integer from public.food_entry_items), 0, 'user B cannot read user A items');
select is((select count(*)::integer from public.nutrition_goals), 1, 'user B sees only own generated goal');
select lives_ok($$ delete from public.food_entries where id = '11000000-0000-0000-0000-000000000001' $$, 'hidden delete attempt does not expose data');
select is((select count(*)::integer from public.food_entries), 0, 'user B still sees no entries after hidden delete');

select * from finish();
rollback;
