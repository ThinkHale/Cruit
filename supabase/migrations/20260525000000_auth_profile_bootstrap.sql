-- Create role-specific profile rows from Supabase Auth metadata.
-- Run this on projects that already applied the initial schema.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_name text;
begin
  v_role := case
    when new.raw_user_meta_data ->> 'role' = 'employer' then 'employer'
    else 'candidate'
  end;

  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'company_name'), ''),
    split_part(new.email, '@', 1),
    'New user'
  );

  insert into public.user_profiles (id, role)
  values (new.id, v_role)
  on conflict (id) do nothing;

  if v_role = 'employer' then
    insert into public.employer_profiles (id, company_name)
    values (new.id, v_name)
    on conflict (id) do nothing;
  else
    insert into public.candidate_profiles (id, full_name)
    values (new.id, v_name)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
