-- Enable extensions
create extension if not exists "uuid-ossp";

-- ─── Core profile tables ─────────────────────────────────────────────────────

create table public.user_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('employer', 'candidate')),
  created_at   timestamptz default now()
);

create table public.employer_profiles (
  id            uuid primary key references public.user_profiles(id) on delete cascade,
  company_name  text not null,
  industry      text,
  company_size  text,
  description   text,
  location      text,
  website       text,
  plan          text default 'per_post' check (plan in ('per_post', 'unlimited')),
  updated_at    timestamptz default now()
);

create table public.candidate_profiles (
  id                uuid primary key references public.user_profiles(id) on delete cascade,
  full_name         text not null,
  title             text,
  location          text,
  bio               text,
  skills            text[] default '{}',
  experience_years  int default 0,
  availability      text default 'flexible' check (availability in ('immediate','2_weeks','1_month','flexible')),
  updated_at        timestamptz default now()
);

-- ─── Jobs ─────────────────────────────────────────────────────────────────────

create table public.job_postings (
  id            uuid primary key default gen_random_uuid(),
  employer_id   uuid not null references public.employer_profiles(id) on delete cascade,
  title         text not null,
  shift         text,
  pay_rate      text,
  location      text,
  requirements  text[] default '{}',
  description   text,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- ─── Swipes ───────────────────────────────────────────────────────────────────

create table public.swipes (
  id           uuid primary key default gen_random_uuid(),
  swiper_id    uuid not null references auth.users(id) on delete cascade,
  target_id    uuid not null,
  target_type  text not null check (target_type in ('job', 'candidate')),
  direction    text not null check (direction in ('left', 'right')),
  created_at   timestamptz default now(),
  unique (swiper_id, target_id)
);

-- ─── Matches ──────────────────────────────────────────────────────────────────

create table public.matches (
  id            uuid primary key default gen_random_uuid(),
  employer_id   uuid not null references public.employer_profiles(id),
  candidate_id  uuid not null references public.candidate_profiles(id),
  job_id        uuid not null references public.job_postings(id),
  created_at    timestamptz default now(),
  unique (employer_id, candidate_id, job_id)
);

-- ─── Messages ─────────────────────────────────────────────────────────────────

create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches(id) on delete cascade,
  sender_id  uuid not null references auth.users(id),
  content    text not null,
  created_at timestamptz default now()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.user_profiles      enable row level security;
alter table public.employer_profiles  enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.job_postings       enable row level security;
alter table public.swipes             enable row level security;
alter table public.matches            enable row level security;
alter table public.messages           enable row level security;

-- user_profiles
create policy "own profile" on public.user_profiles for all using (auth.uid() = id);

-- employer_profiles
create policy "read all employers" on public.employer_profiles for select using (true);
create policy "manage own employer" on public.employer_profiles for all using (auth.uid() = id);

-- candidate_profiles
create policy "read all candidates" on public.candidate_profiles for select using (true);
create policy "manage own candidate" on public.candidate_profiles for all using (auth.uid() = id);

-- job_postings
create policy "read active jobs" on public.job_postings for select using (is_active = true or auth.uid() = employer_id);
create policy "manage own jobs" on public.job_postings for all using (auth.uid() = employer_id);

-- swipes
create policy "own swipes" on public.swipes for all using (auth.uid() = swiper_id);

-- matches
create policy "match participants" on public.matches for select using (
  auth.uid() = employer_id or auth.uid() = candidate_id
);
create policy "system insert match" on public.matches for insert with check (true);

-- messages
create policy "message participants" on public.messages for select using (
  exists (
    select 1 from public.matches m
    where m.id = match_id
      and (m.employer_id = auth.uid() or m.candidate_id = auth.uid())
  )
);
create policy "send message" on public.messages for insert with check (
  auth.uid() = sender_id and exists (
    select 1 from public.matches m
    where m.id = match_id
      and (m.employer_id = auth.uid() or m.candidate_id = auth.uid())
  )
);

-- ─── Match trigger ────────────────────────────────────────────────────────────

create or replace function public.check_and_create_match()
returns trigger
language plpgsql
security definer
as $$
declare
  v_job           public.job_postings%rowtype;
  v_matching_job  uuid;
begin
  -- Candidate liked a job → check if employer already liked candidate
  if new.target_type = 'job' and new.direction = 'right' then
    select * into v_job from public.job_postings where id = new.target_id;
    if not found then return new; end if;

    if exists (
      select 1 from public.swipes
      where swiper_id   = v_job.employer_id
        and target_id   = new.swiper_id
        and target_type = 'candidate'
        and direction   = 'right'
    ) then
      insert into public.matches (employer_id, candidate_id, job_id)
      values (v_job.employer_id, new.swiper_id, new.target_id)
      on conflict do nothing;
    end if;
  end if;

  -- Employer liked a candidate → check if candidate liked any of employer's jobs
  if new.target_type = 'candidate' and new.direction = 'right' then
    select j.id into v_matching_job
    from public.swipes s
    join public.job_postings j on j.id = s.target_id
    where s.swiper_id   = new.target_id
      and s.target_type = 'job'
      and s.direction   = 'right'
      and j.employer_id = new.swiper_id
    limit 1;

    if v_matching_job is not null then
      insert into public.matches (employer_id, candidate_id, job_id)
      values (new.swiper_id, new.target_id, v_matching_job)
      on conflict do nothing;
    end if;
  end if;

  return new;
end;
$$;

create trigger on_swipe_insert
  after insert on public.swipes
  for each row execute function public.check_and_create_match();

-- ─── Seed demo data ───────────────────────────────────────────────────────────
-- (Run after creating auth users via Supabase dashboard or API)
-- Insert sample employer and job data via the app after sign-up.
