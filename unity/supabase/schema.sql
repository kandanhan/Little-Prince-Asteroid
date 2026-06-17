-- ============================================================
-- 어린왕자의 작은 소행성 (B-612) — Supabase 스키마 + RLS
--
-- ⚠️ 반드시 "개인(kandanhan) Supabase 프로젝트"에서만 실행하세요.
--    회사(Heung-A Portal System) 프로젝트에 실행하면 안 됩니다.
--
-- 적용 방법: 개인 Supabase Dashboard → SQL Editor → 붙여넣기 → Run.
-- 클라우드 세이브: 전 테이블 RLS로 '본인 데이터만' 접근.
-- ============================================================

-- 공통: updated_at 자동 갱신 트리거 함수
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ── profiles : 사용자별 단일 진행 상태 ─────────────────────
create table if not exists public.profiles (
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

-- ── planets : 여러 소행성 ──────────────────────────────────
create table if not exists public.planets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default '이름 없는 별',
  theme      text not null default 'meadow'
             check (theme in ('meadow','desert','ocean','snow','rose','night')),
  created_at timestamptz not null default now()
);
create index if not exists planets_user_idx on public.planets(user_id);

-- profiles.current_planet_id → planets.id (planets 생성 후 FK 연결)
alter table public.profiles drop constraint if exists profiles_current_planet_fk;
alter table public.profiles
  add constraint profiles_current_planet_fk
  foreign key (current_planet_id) references public.planets(id) on delete set null;

-- ── items : 행성에 심은 장식 (PlacedItem) ─────────────────
create table if not exists public.items (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  planet_id uuid not null references public.planets(id) on delete cascade,
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
create index if not exists items_planet_idx on public.items(planet_id);
create index if not exists items_user_idx   on public.items(user_id);

-- ── blocks : 조형(블록) (BuildBlock) ──────────────────────
create table if not exists public.blocks (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  planet_id uuid not null references public.planets(id) on delete cascade,
  shape     text not null
            check (shape in ('cube','slab','pillar','roof','fence','window')),
  lat       double precision not null,
  lon       double precision not null,
  height    int  not null default 0,
  color     text not null default '#e9c46a',
  rot       int  not null default 0 check (rot between 0 and 3)
);
create index if not exists blocks_planet_idx on public.blocks(planet_id);
create index if not exists blocks_user_idx   on public.blocks(user_id);

-- ── paintings : AI 그림 (이미지 파일은 Storage 'paintings' 버킷) ─
create table if not exists public.paintings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default '',
  image_path text not null,            -- storage object 경로: <uid>/<id>.png
  created_at timestamptz not null default now()
);
create index if not exists paintings_user_idx on public.paintings(user_id);

-- ── songs : AI 작곡 (시드/무드만 저장, 재생은 클라이언트가 재구성) ─
create table if not exists public.songs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  seed       bigint not null,
  title      text not null default '',
  mood       text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists songs_user_idx on public.songs(user_id);

-- ── journal : 별의 일기 ───────────────────────────────────
create table if not exists public.journal (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists journal_user_idx on public.journal(user_id);

-- updated_at 트리거 (profiles)
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS : 모든 테이블 '본인 데이터만'
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.planets   enable row level security;
alter table public.items     enable row level security;
alter table public.blocks    enable row level security;
alter table public.paintings enable row level security;
alter table public.songs     enable row level security;
alter table public.journal   enable row level security;

drop policy if exists "profiles self" on public.profiles;
create policy "profiles self" on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "planets self" on public.planets;
create policy "planets self" on public.planets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "items self" on public.items;
create policy "items self" on public.items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "blocks self" on public.blocks;
create policy "blocks self" on public.blocks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "paintings self" on public.paintings;
create policy "paintings self" on public.paintings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "songs self" on public.songs;
create policy "songs self" on public.songs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "journal self" on public.journal;
create policy "journal self" on public.journal
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- Storage : 'paintings' 버킷 (그림 PNG, 비공개) + 본인 폴더만 접근
-- 경로 규칙: <auth.uid()>/<painting_id>.png
-- ============================================================
insert into storage.buckets (id, name, public)
values ('paintings', 'paintings', false)
on conflict (id) do nothing;

drop policy if exists "paintings read own" on storage.objects;
create policy "paintings read own" on storage.objects
  for select using (
    bucket_id = 'paintings' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "paintings insert own" on storage.objects;
create policy "paintings insert own" on storage.objects
  for insert with check (
    bucket_id = 'paintings' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "paintings update own" on storage.objects;
create policy "paintings update own" on storage.objects
  for update using (
    bucket_id = 'paintings' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "paintings delete own" on storage.objects;
create policy "paintings delete own" on storage.objects
  for delete using (
    bucket_id = 'paintings' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 끝. (Auth: Dashboard → Authentication 에서 Email + Google 공급자 켜기)
