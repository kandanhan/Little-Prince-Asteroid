-- ============================================================
-- 어린왕자의 작은 소행성 (B-612) — 스키마 + RLS  [전용 스키마 격리판]
--
-- ⚠️ 반드시 "개인(kandanhan) Supabase 프로젝트"에서만 실행.
-- 이 서버는 Round Earth 등 다른 앱과 함께 쓰므로, 어린왕자는 전용 스키마
-- `little_prince` 에 완전히 격리한다. public(다른 앱)은 절대 건드리지 않음.
--
-- 적용: 개인 Supabase Dashboard → SQL Editor → 붙여넣고 Run.
-- 재실행 주의: 맨 위 drop 으로 little_prince 데이터가 초기화된다
--   (little_prince 스키마에만 영향, 다른 앱/public 무관).
-- 클라이언트(Unity) 연동 시: Settings → API → Exposed schemas 에
--   `little_prince` 추가 + 클라이언트에서 schema('little_prince') 지정.
-- ============================================================

-- 어린왕자 전용 스키마 (다른 앱과 분리)
drop schema if exists little_prince cascade;   -- LP 전용만 초기화
create schema little_prince;

-- updated_at 자동 갱신 함수 (LP 스키마 내부 — public 함수 안 건드림)
create or replace function little_prince.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ── profiles ──────────────────────────────────────────────
create table little_prince.profiles (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  prince_name       text        not null default '',
  happiness         int         not null default 0,
  visited           boolean     not null default false,
  coins             int         not null default 60,
  last_daily_gift   date,
  personality       jsonb       not null default '{"ei":0.5,"sn":0.5,"tf":0.5,"jp":0.5}'::jsonb,
  personality_set   boolean     not null default false,
  remove_ads        boolean     not null default false,
  style_level       real        not null default 0.35,
  low_spec          boolean     not null default false,
  current_planet_id uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── planets ───────────────────────────────────────────────
create table little_prince.planets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default '이름 없는 별',
  theme      text not null default 'meadow'
             check (theme in ('meadow','desert','ocean','snow','rose','night')),
  created_at timestamptz not null default now()
);
create index planets_user_idx on little_prince.planets(user_id);

alter table little_prince.profiles
  add constraint profiles_current_planet_fk
  foreign key (current_planet_id) references little_prince.planets(id) on delete set null;

-- ── items ─────────────────────────────────────────────────
create table little_prince.items (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  planet_id uuid not null references little_prince.planets(id) on delete cascade,
  kind      text not null
            check (kind in ('rose','baobab','lamp','bench','fox','sheep','star',
                            'mushroom','flower','well','volcano','tree','crystal',
                            'cat','bird','fountain','house','rainbow')),
  lat       double precision not null,
  lon       double precision not null,
  scale     real not null default 1,
  hue       real not null default 0,
  born_at   timestamptz not null default now()
);
create index items_planet_idx on little_prince.items(planet_id);
create index items_user_idx   on little_prince.items(user_id);

-- ── blocks ────────────────────────────────────────────────
create table little_prince.blocks (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  planet_id uuid not null references little_prince.planets(id) on delete cascade,
  shape     text not null
            check (shape in ('cube','slab','pillar','roof','fence','window')),
  lat       double precision not null,
  lon       double precision not null,
  height    int  not null default 0,
  color     text not null default '#e9c46a',
  rot       int  not null default 0 check (rot between 0 and 3)
);
create index blocks_planet_idx on little_prince.blocks(planet_id);
create index blocks_user_idx   on little_prince.blocks(user_id);

-- ── paintings (이미지는 Storage 'lp-paintings' 버킷) ──────────
create table little_prince.paintings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default '',
  image_path text not null,            -- <uid>/<id>.png
  created_at timestamptz not null default now()
);
create index paintings_user_idx on little_prince.paintings(user_id);

-- ── songs ─────────────────────────────────────────────────
create table little_prince.songs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  seed       bigint not null,
  title      text not null default '',
  mood       text not null default '',
  created_at timestamptz not null default now()
);
create index songs_user_idx on little_prince.songs(user_id);

-- ── journal ───────────────────────────────────────────────
create table little_prince.journal (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null default '',
  created_at timestamptz not null default now()
);
create index journal_user_idx on little_prince.journal(user_id);

create trigger profiles_set_updated_at before update on little_prince.profiles
  for each row execute function little_prince.set_updated_at();

-- ============================================================
-- RLS : 본인 데이터만
-- ============================================================
alter table little_prince.profiles  enable row level security;
alter table little_prince.planets   enable row level security;
alter table little_prince.items     enable row level security;
alter table little_prince.blocks    enable row level security;
alter table little_prince.paintings enable row level security;
alter table little_prince.songs     enable row level security;
alter table little_prince.journal   enable row level security;

create policy "profiles self"  on little_prince.profiles  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "planets self"   on little_prince.planets   for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "items self"     on little_prince.items     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "blocks self"    on little_prince.blocks    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "paintings self" on little_prince.paintings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "songs self"     on little_prince.songs     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "journal self"   on little_prince.journal   for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- PostgREST 노출용 권한 (행 접근은 RLS 가 제한; 스키마 노출은 API 설정에서 별도)
grant usage on schema little_prince to anon, authenticated, service_role;
grant all on all tables    in schema little_prince to anon, authenticated, service_role;
grant all on all routines  in schema little_prince to anon, authenticated, service_role;
grant all on all sequences in schema little_prince to anon, authenticated, service_role;
alter default privileges for role postgres in schema little_prince grant all on tables    to anon, authenticated, service_role;
alter default privileges for role postgres in schema little_prince grant all on routines  to anon, authenticated, service_role;
alter default privileges for role postgres in schema little_prince grant all on sequences to anon, authenticated, service_role;

-- ============================================================
-- Storage : LP 전용 비공개 버킷 'lp-paintings' (다른 앱과 분리)
-- 경로 규칙: <auth.uid()>/<painting_id>.png
-- (storage.objects 정책은 전역이라 'lp ' 접두사로 다른 앱 정책과 충돌 방지)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('lp-paintings', 'lp-paintings', false)
on conflict (id) do nothing;

drop policy if exists "lp paintings read own"   on storage.objects;
create policy "lp paintings read own"   on storage.objects
  for select using (bucket_id = 'lp-paintings' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "lp paintings insert own" on storage.objects;
create policy "lp paintings insert own" on storage.objects
  for insert with check (bucket_id = 'lp-paintings' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "lp paintings update own" on storage.objects;
create policy "lp paintings update own" on storage.objects
  for update using (bucket_id = 'lp-paintings' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "lp paintings delete own" on storage.objects;
create policy "lp paintings delete own" on storage.objects
  for delete using (bucket_id = 'lp-paintings' and (storage.foldername(name))[1] = auth.uid()::text);

-- 끝. (Auth: Dashboard → Authentication 에서 Email + Google 켜기)
