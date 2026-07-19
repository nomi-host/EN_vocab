/* ============================================================================
   NoEnglish — Vercel 서버리스: POST /api/delete-account -> { ok: true }
   ----------------------------------------------------------------------------
   계정(회원 탈퇴) 삭제. Supabase auth.users 행 삭제는 service_role 키가 있어야만
   가능한 관리자 API라 반드시 서버에서만 수행 — 클라이언트(index.html)는 이 시크릿을
   절대 갖지 않는다(레포 전체에 service_role 문자열이 한 번도 등장하지 않아야 함).

   흐름:
     1) 클라이언트가 Authorization: Bearer <자기 세션 access_token> 헤더로 요청.
     2) 이 토큰이 진짜 로그인된 사용자의 것인지 Supabase Auth API로 직접 검증
        (클라이언트가 "내 user_id는 X"라고 우기는 걸 그대로 믿지 않음 — 토큰 자체를
        Supabase에 되물어 확인된 user_id만 사용).
     3) 검증된 user_id로 admin API를 호출해 auth.users 행을 삭제 — profiles·learning_state는
        그 행을 참조하는 외래키가 on delete cascade라 자동 삭제되고, bug_reports.user_id는
        on delete set null이라 제보 내용 자체는 남되 개인 식별 연결만 끊김
        (pipeline/supabase_beta_schema.sql 참고).

   환경변수: SUPABASE_SERVICE_ROLE_KEY(필수, Supabase 대시보드 > Settings > API에서 발급),
   APP_SHARED_SECRET(권장 — api/gemini.js와 같은 값).

   *** 아직 배포 전 — SUPABASE_SERVICE_ROLE_KEY를 Vercel 환경변수에 등록해야 실제로 동작함.
   이 키는 절대 이 코드/레포에 하드코딩하지 말 것(민영님이 Vercel 대시보드에서 직접 등록). ***
============================================================================ */

const { setCors, isSecretValid } = require("./gemini.js");

const SUPABASE_URL = "https://oqmslebtjtqayyjltcpt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_s4C8mg3QafZgea9wvvA7vw_8pvNnPjr"; // 공개 키 — 클라이언트에도 이미 노출됨(RLS 전제로 안전 설계)

async function verifyUser(accessToken) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  const data = await r.json();
  return data && data.id ? data : null;
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(404).json({ error: "not found" });
  if (!isSecretValid(req)) return res.status(403).json({ error: "forbidden" });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "server not configured" });

  const auth = req.headers.authorization || "";
  const accessToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!accessToken) return res.status(401).json({ error: "no session" });

  const user = await verifyUser(accessToken).catch(() => null);
  if (!user) return res.status(401).json({ error: "invalid session" });

  const del = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
    method: "DELETE",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!del.ok) {
    const detail = await del.text().catch(() => "");
    return res.status(502).json({ error: "delete failed", detail: detail.slice(0, 300) });
  }
  return res.status(200).json({ ok: true });
};
