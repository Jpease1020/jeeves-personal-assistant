-- Purpose: Clean Supabase schema to only operational data while using Notion as source of truth
-- Safe to run multiple times (IF NOT EXISTS guards). Strict User Isolation RLS.

-- Extensions (idempotent)
create extension if not exists pgcrypto;

-- ============================
-- Core tables to KEEP
-- ============================

-- 1) User Profiles (1:1 with auth.users)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
do $$ begin
  create policy "user_profiles_select_own" on public.user_profiles
    for select using (id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "user_profiles_insert_self" on public.user_profiles
    for insert with check (id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "user_profiles_update_own" on public.user_profiles
    for update using (id = auth.uid());
exception when duplicate_object then null; end $$;

-- 2) OAuth Tokens (Notion, Google, Oura)
create table if not exists public.oauth_tokens (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, -- e.g. 'notion' | 'google' | 'oura'
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text[],
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists idx_oauth_tokens_user_provider on public.oauth_tokens(user_id, provider);
alter table public.oauth_tokens enable row level security;
do $$ begin
  create policy "oauth_tokens_rw_own" on public.oauth_tokens
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- 3) Notifications / Outbox
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text,           -- e.g. 'push' | 'email' | 'in_app'
  title text,
  body text,
  status text not null default 'pending', -- pending | sent | failed
  delivered_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_status on public.notifications(user_id, status);
alter table public.notifications enable row level security;
do $$ begin
  create policy "notifications_rw_own" on public.notifications
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- 4) Screen Time (daily summaries from Chrome extension)
create table if not exists public.screen_time_summaries (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  total_minutes int not null default 0,
  productive_minutes int not null default 0,
  distracting_minutes int not null default 0,
  data jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists idx_screen_time_user_date on public.screen_time_summaries(user_id, date);
alter table public.screen_time_summaries enable row level security;
do $$ begin
  create policy "screen_time_rw_own" on public.screen_time_summaries
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- 5) Distraction Events (fine-grained signals)
create table if not exists public.distraction_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  category text,          -- e.g. 'social', 'adult', 'video', 'gaming'
  site_or_app text,
  duration_minutes int,
  meta jsonb
);

create index if not exists idx_distraction_events_user_time on public.distraction_events(user_id, occurred_at desc);
alter table public.distraction_events enable row level security;
do $$ begin
  create policy "distraction_events_rw_own" on public.distraction_events
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- 6) Conversation History (short retention)
create table if not exists public.conversation_history (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  message_index int,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversation_user_time on public.conversation_history(user_id, created_at);
alter table public.conversation_history enable row level security;
do $$ begin
  create policy "conversation_rw_own" on public.conversation_history
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- 7) Wake Detection Logs (event log only; no historical Oura storage)
create table if not exists public.wake_detection_logs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_time timestamptz not null,
  source text not null default 'oura',
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_wake_logs_user_time on public.wake_detection_logs(user_id, event_time desc);
alter table public.wake_detection_logs enable row level security;
do $$ begin
  create policy "wake_logs_rw_own" on public.wake_detection_logs
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ============================
-- Tables to DROP (migrated to Notion or unused)
-- ============================

-- If any legacy tables remain beyond 006_drop_notion_tables.sql, drop here safely
drop table if exists public.oura_sleep_data cascade; -- decided not to store Oura

-- (Optional) Example legacy drops; uncomment if still present in your project
-- drop table if exists public.activities cascade;
-- drop table if exists public.morning_routine_logs cascade;
-- drop table if exists public.routine_completions cascade;
-- drop table if exists public.routine_step_logs cascade;

-- ============================
-- Grants (Supabase defaults handle anon/auth roles; keep minimal)
-- ============================
-- No broad grants; rely on RLS + service key where needed.

-- Done.

