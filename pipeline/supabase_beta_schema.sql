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

-- ============================================================================
-- 7) word_cache — 신규 추가(2026-07-23) — 1~6이 이미 배포된 뒤 나온 추가 테이블이라
--    이 블록만 별도로 SQL Editor에서 실행하면 됨(1~6 재실행 불필요, 오히려
--    "relation already exists" 에러만 남).
--
--    사용자가 사전에 없는 단어를 등록하면 autoLookupWord()가 Gemini로 한국어 뜻·CEFR·예문을
--    생성하는데, 같은 단어를 다른 베타테스터가 또 등록하면 매번 새로 Gemini를 호출했음
--    (API 비용 낭비). 단어 뜻은 사용자마다 달라질 이유가 없는 공개 정보라 로그인 여부와 무관하게
--    전원이 읽고 쓸 수 있는 공유 캐시로 둔다 — 특정 사용자 소유가 아니므로 RLS로 행을 user_id에
--    격리하지 않고, 대신 "새로 추가만 가능, 수정·삭제 불가"(update/delete 정책 자체를 안 만듦)로
--    한 번 캐싱된 값이 덮어써지지 않게 한다. word가 PK라 같은 단어 재삽입은 DB 유니크 제약으로
--    자동 거부(클라이언트는 이 실패를 무시하고 그냥 넘어가면 됨 — "이미 누가 캐싱해놨다"는 뜻).
create table public.word_cache (
  word text primary key,
  ipa text,
  pos text[],
  ko text not null,
  cefr text,
  ex_en text,
  ex_ko text,
  created_at timestamptz not null default now()
);
alter table public.word_cache enable row level security;
create policy "anyone can read word cache" on public.word_cache for select using (true);
create policy "anyone can add to word cache" on public.word_cache for insert with check (true);

grant select, insert on public.word_cache to anon, authenticated;

notify pgrst, 'reload schema';
