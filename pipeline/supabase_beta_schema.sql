-- NoEnglish 베타 스키마 (docs/PLAN.md 6.6.0, 2026-07-19)
-- Supabase SQL Editor에 그대로 붙여넣고 실행. 베타는 단순화 버전:
--   - learning_state: 세부 테이블(badges 등)로 안 쪼개고 클라이언트 localStorage 전체를
--     하나의 jsonb로 그대로 저장(양방향 병합은 이후 P1, 지금은 게스트 1회 업로드·last-write-wins).
--   - RLS: 모든 테이블 user_id = auth.uid() 행 단위 격리.

-- 1) profiles — auth.users와 1:1
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_char text default 'char1',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "select own profile" on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2) learning_state — SRS·스트릭·포인트·레벨·뱃지·단어장·회화 이력 전체를 jsonb 한 덩어리로
create table public.learning_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.learning_state enable row level security;
create policy "select own state" on public.learning_state for select using (auth.uid() = user_id);
create policy "update own state" on public.learning_state for update using (auth.uid() = user_id);
create policy "insert own state" on public.learning_state for insert with check (auth.uid() = user_id);

-- 3) bug_reports — 로그인 여부 무관 제출 가능(로그인 시 user_id 기록), 본인 것만 조회
create table public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  page text,
  app_version text,
  created_at timestamptz not null default now()
);
alter table public.bug_reports enable row level security;
create policy "anyone can submit" on public.bug_reports for insert with check (true);
create policy "select own reports" on public.bug_reports for select using (auth.uid() = user_id);

-- 4) 신규 가입 시 profiles·learning_state 행 자동 생성(경쟁 상태 방지 — 클라이언트가
--    "내 행이 아직 없을 수도 있다"를 신경 안 써도 됨)
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.learning_state (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) 테이블 레벨 권한 부여 — "Automatically expose new tables"를 꺼뒀으므로(권장 설정) anon/
--    authenticated 롤에 기본 GRANT가 자동으로 안 붙는다. RLS 정책은 "행" 단위 필터고, 이 GRANT는
--    "그 작업을 시도라도 해볼 수 있는지"의 테이블 단위 허가라 RLS와 별개로 반드시 필요하다.
--    (실측 확인: 이걸 빼면 정책이 다 맞아도 "permission denied for table" 에러.)
grant select, insert on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;
grant select, insert on public.learning_state to anon, authenticated;
grant update on public.learning_state to authenticated;
grant select, insert on public.bug_reports to anon, authenticated;

-- 6) PostgREST(API 레이어)가 방금 준 GRANT를 스키마 캐시에 반영하도록 강제 리로드.
--    (실측: GRANT 직후 API가 곧바로 "permission denied for table"을 계속 반환 —
--    캐시가 자동 갱신될 때까지 기다리거나 이 NOTIFY로 즉시 갱신시킬 것.)
notify pgrst, 'reload schema';
