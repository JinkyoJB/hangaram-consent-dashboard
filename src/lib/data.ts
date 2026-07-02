import type { ApiPayload, Dashboard, DanjiSummary, DongRow, Intent } from "./types";
import { DANJI_DONG } from "./danji";

/** 대시보드 데이터 로드: SHEET_API_URL 있으면 실데이터, 없으면 목업 폴백 */
export async function getDashboard(): Promise<Dashboard> {
  const url = process.env.SHEET_API_URL;
  if (!url) return build(MOCK, true);
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as ApiPayload;
    return build(json, false);
  } catch (e) {
    console.error("[getDashboard] fetch 실패, 목업으로 대체:", e);
    return build(MOCK, true);
  }
}

function build(p: ApiPayload, isMock: boolean): Dashboard {
  const 상가포함 = p.설정.상가포함;
  const order = p.설정.단지순서?.length ? p.설정.단지순서 : p.단지.map((d) => d.단지);

  const 단지들: DanjiSummary[] = order.map((이름) => {
    const info = p.단지.find((d) => d.단지 === 이름);
    const rows = p.동목록.filter((r) => r.단지 === 이름);
    const 상가 = rows.find((r) => r.구분 === "상가");
    const 세대수 =
      (info?.아파트세대수 ?? 0) + (상가포함 ? info?.상가세대수 ?? 0 : 0);
    const 동의수 = rows
      .filter((r) => 상가포함 || r.구분 === "아파트")
      .reduce((s, r) => s + r.동의수, 0);

    // 기본 동 목록을 항상 표시: 없는 동은 0/미정으로 채우고 API 데이터로 덮어씀
    const 동map = new Map<string, DongRow>(
      (DANJI_DONG[이름] ?? []).map((동) => [
        동,
        { 단지: 이름, 구분: "아파트" as const, 동, 세대수: 0, 동의수: 0 },
      ])
    );
    for (const r of rows.filter((r) => r.구분 === "아파트")) 동map.set(r.동, r);
    const 아파트 = [...동map.values()].sort((a, b) =>
      a.동.localeCompare(b.동, "ko", { numeric: true })
    );

    return {
      이름,
      세대수,
      동의수,
      동의율: 세대수 > 0 ? 동의수 / 세대수 : 0,
      동수: 아파트.length,
      동목록: 아파트,
      상가,
    };
  });

  const 전체세대수 = 단지들.reduce((s, d) => s + d.세대수, 0);
  const 전체동의수 = 단지들.reduce((s, d) => s + d.동의수, 0);
  const 목표까지 = Math.max(
    0,
    Math.ceil(전체세대수 * p.설정.최종목표) - 전체동의수
  );

  return {
    설정: p.설정,
    갱신시각: p.갱신시각,
    isMock,
    전체: {
      세대수: 전체세대수,
      동의수: 전체동의수,
      동의율: 전체세대수 > 0 ? 전체동의수 / 전체세대수 : 0,
    },
    단지들,
    의향: p.의향,
    목표까지,
  };
}

/* ----------------- 목업 데이터 (URL 연결 전 미리보기용) ----------------- */
const DANJI_DEF: Record<string, { 동: number[]; 세대수: number }> = {
  한양: { 동: [301, 302, 303, 304, 305, 306, 307, 308], 세대수: 952 },
  삼성: { 동: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210], 세대수: 708 },
  두산: { 동: [101, 102, 103, 104, 105, 106], 세대수: 436 },
};

function mockDong(): DongRow[] {
  const rows: DongRow[] = [];
  for (const [단지, def] of Object.entries(DANJI_DEF)) {
    const per = Math.round(def.세대수 / def.동.length);
    def.동.forEach((동, i) => {
      const 세대수 = i === def.동.length - 1
        ? def.세대수 - per * (def.동.length - 1)
        : per;
      const rate = 0.2 + ((동 * 7) % 20) / 100; // 20~40% 사이 의사난수
      rows.push({ 단지, 구분: "아파트", 동: String(동), 세대수, 동의수: Math.round(세대수 * rate) });
    });
    rows.push({ 단지, 구분: "상가", 동: "상가", 세대수: 0, 동의수: 1 });
  }
  return rows;
}

function mockIntent(동목록: DongRow[]) {
  const perDanji = (단지: string): Intent => {
    const 동의 = 동목록.filter((r) => r.단지 === 단지).reduce((s, r) => s + r.동의수, 0);
    return {
      통합: Math.round(동의 * 0.62),
      제자리: Math.round(동의 * 0.28),
      신탁: Math.round(동의 * 0.55),
      조합: Math.round(동의 * 0.33),
    };
  };
  const sum = (a: Intent, b: Intent): Intent => ({
    통합: a.통합 + b.통합, 제자리: a.제자리 + b.제자리, 신탁: a.신탁 + b.신탁, 조합: a.조합 + b.조합,
  });
  const 한양 = perDanji("한양"), 삼성 = perDanji("삼성"), 두산 = perDanji("두산");
  return { 전체: sum(sum(한양, 삼성), 두산), 한양, 삼성, 두산 };
}

const MOCK_DONG = mockDong();
const MOCK: ApiPayload = {
  갱신시각: "2026-07-01T20:00:00+09:00",
  설정: {
    구역명: "평촌 한가람 A-5구역",
    주체: "주민대표단",
    접수마감: "2026-07-29",
    최소목표: 0.5,
    최종목표: 0.81,
    상가포함: true,
    단지순서: ["한양", "삼성", "두산"],
  },
  단지: [
    { 단지: "한양", 아파트세대수: 952, 상가세대수: 0 },
    { 단지: "삼성", 아파트세대수: 708, 상가세대수: 0 },
    { 단지: "두산", 아파트세대수: 436, 상가세대수: 0 },
  ],
  동목록: MOCK_DONG,
  의향: mockIntent(MOCK_DONG),
};
