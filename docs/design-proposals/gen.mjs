import { writeFileSync } from "node:fs";

const DIR = "C:/Users/PC/Desktop/workspace/hangaram/docs/design-proposals";

// 시안 비교용 샘플 데이터 (관악타운 예시와 유사한 수준)
const D = {
  구역명: "평촌 한가람 A-5구역",
  주체: "주민대표단",
  갱신: "2026.07.03 20:00",
  dday: 26,
  마감: "2026-07-29",
  전체: 31.2,
  세대수: 2096,
  동의: 654,
  미동의: 1442,
  목표까지: 1044,
  단지: [
    { 이름: "한양", 율: 32.1, 동의: 306, 세대: 952, 동수: 8 },
    { 이름: "삼성", 율: 29.8, 동의: 211, 세대: 708, 동수: 10 },
    { 이름: "두산", 율: 31.0, 동의: 135, 세대: 436, 동수: 6 },
  ],
};

const LEGEND = ["#e", "0–12.5", "12.5–25", "25–37.5", "37.5–50", "50–62.5", "62.5–75", "75–87.5", "87.5–100"];

function bar(rate, t, markers = false) {
  const ticks = Array.from({ length: 20 }).map(() => `<i></i>`).join("");
  const mk = markers
    ? `<span class="mk" style="left:50%"></span><span class="mk" style="left:81%"></span>
       <span class="mkl" style="left:50%">과반 50%</span><span class="mkl" style="left:81%">목표 81%</span>`
    : "";
  return `<div class="barwrap"><div class="bar" style="height:${t.barH}px">
      <div class="fill" style="width:${rate}%"></div>
      <div class="ticks">${ticks}</div>${mk}
    </div>${markers ? '<div class="mkrow"></div>' : ""}</div>`;
}

function render(t) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${t.pageBg};font-family:${t.fontBody}}
  .page{width:800px;min-height:1360px;padding:26px}
  .card{background:${t.card};border-radius:${t.radius}px;box-shadow:${t.shadow};padding:24px;margin-top:18px;border:${t.cardBorder}}
  /* 헤더 */
  .header{${t.headerCss};border-radius:${t.radius}px;padding:24px 26px;position:relative;overflow:hidden}
  .region{font-size:15px;font-weight:700;color:${t.regionColor};letter-spacing:-.2px;display:flex;align-items:center;gap:8px}
  .dot{width:9px;height:9px;border-radius:50%;background:${t.accent}}
  .htitle{font-size:30px;font-weight:800;margin-top:6px;color:${t.headText};font-family:${t.fontHead}}
  .hsub{font-size:12px;margin-top:5px;color:${t.headSub}}
  .official{position:absolute;top:24px;right:26px;text-align:right;color:${t.headSub};font-size:12px}
  .badge{border:1px solid ${t.headSub};border-radius:6px;padding:3px 9px;font-weight:700;letter-spacing:2px}
  /* 전체율 */
  .rlabel{font-size:14px;color:${t.muted}}
  .bignum{font-size:66px;font-weight:800;line-height:1;color:${t.big};font-family:${t.fontHead};${t.bigExtra}}
  .bignum small{font-size:30px}
  .dday{background:${t.ddayBg};color:${t.ddayText};border-radius:14px;padding:10px 16px;text-align:right}
  .dday b{font-size:26px;font-weight:800;display:block;line-height:1}
  .dday span{font-size:11px;opacity:.85}
  .barwrap{position:relative;margin-top:6px}
  .bar{position:relative;width:100%;border-radius:999px;background:${t.track};overflow:hidden}
  .fill{height:100%;border-radius:999px;background:${t.barFill}}
  .ticks{position:absolute;inset:0;display:flex}
  .ticks i{flex:1;border-right:1px solid rgba(255,255,255,.65)}
  .ticks i:last-child{border:0}
  .mk{position:absolute;top:0;height:100%;width:1px;background:${t.muted}}
  .mkl{position:absolute;top:22px;font-size:11px;color:${t.muted};transform:translateX(-50%);white-space:nowrap;font-weight:600}
  .mkrow{height:20px}
  /* 지표 */
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:${t.line};border-radius:12px;overflow:hidden;margin-top:26px;border:1px solid ${t.line}}
  .stat{background:${t.card};padding:14px 12px}
  .stat .k{font-size:12px;color:${t.muted}}
  .stat .v{font-size:24px;font-weight:800;margin-top:2px}
  .stat .v.acc{color:${t.accent}}
  .stat .u{font-size:13px;color:${t.muted};font-weight:500;margin-left:2px}
  /* 단지 */
  h2{font-size:18px;font-weight:800;margin-bottom:14px;font-family:${t.fontHead};color:${t.headingColor}}
  .drow{padding:8px 0}
  .dtop{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
  .dname{font-size:16px;font-weight:800}
  .dmeta{font-size:13px;color:${t.muted}}
  .dline{display:flex;align-items:center;gap:12px}
  .dpct{width:66px;text-align:right;font-size:19px;font-weight:800;color:${t.accent}}
  /* 범례 */
  .legend{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:11px;color:${t.muted};align-items:center}
  .lg{display:inline-flex;align-items:center;gap:6px}
  .sw{width:12px;height:12px;border-radius:3px}
  .foot{margin-top:20px;text-align:center;font-size:12px;color:${t.muted}}
  .themeTag{margin:0 0 14px;font-size:13px;font-weight:800;color:${t.accent};letter-spacing:.3px}
  </style></head><body><div class="page">
    <div class="themeTag">${t.name}</div>
    <div class="header">
      <div class="official"><span class="badge">OFFICIAL</span><div style="margin-top:8px">갱신 ${D.갱신}</div></div>
      <div class="region"><span class="dot"></span>${D.구역명} ${D.주체}</div>
      <div class="htitle">동의 현황 대시보드</div>
      <div class="hsub">한가람 한양 · 삼성 · 두산 통합재건축</div>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div><div class="rlabel">전체 동의율</div><div class="bignum">${D.전체}<small>%</small></div></div>
        <div class="dday"><b>D-${D.dday}</b><span>접수마감 ${D.마감}</span></div>
      </div>
      ${bar(D.전체, t, true)}
      <div class="stats">
        <div class="stat"><div class="k">총 세대수</div><div class="v">${D.세대수.toLocaleString()}<span class="u">세대</span></div></div>
        <div class="stat"><div class="k">동의 수</div><div class="v acc">${D.동의.toLocaleString()}<span class="u">세대</span></div></div>
        <div class="stat"><div class="k">미동의</div><div class="v">${D.미동의.toLocaleString()}<span class="u">세대</span></div></div>
        <div class="stat"><div class="k">목표(81%)까지</div><div class="v">${D.목표까지.toLocaleString()}<span class="u">명</span></div></div>
      </div>
    </div>

    <div class="card">
      <h2>단지별 현황</h2>
      ${D.단지.map((c) => `<div class="drow">
        <div class="dtop"><span class="dname">${c.이름} ›</span><span class="dmeta">${c.동의.toLocaleString()} / ${c.세대.toLocaleString()}명 · ${c.동수}개동</span></div>
        <div class="dline"><div style="flex:1">${bar(c.율, t, false)}</div><span class="dpct">${c.율}%</span></div>
      </div>`).join("")}
    </div>

    <div class="card">
      <div class="legend">
        ${LEGEND.slice(1).map((l, i) => `<span class="lg"><span class="sw" style="background:${["#cfe9d8","#9fd6b4","#5cbd8a","#38a86b","#4aa6cf","#3b82c4","#28579f","#1e3a6b"][i]}"></span>${l}%</span>`).join("")}
        <span style="margin-left:auto;opacity:.7">막대 눈금 = 5%</span>
      </div>
    </div>
    <div class="foot">${D.구역명} ${D.주체} · 5~10분 간격 자동 갱신</div>
  </div></body></html>`;
}

// ---- 4가지 테마 ----
const sans = "'Malgun Gothic','Apple SD Gothic Neo',sans-serif";
const themes = [
  {
    file: "1_teal", name: "① 민트 틸 · 라이트 헤더",
    pageBg: "#eef5f4", card: "#ffffff", radius: 18, shadow: "0 1px 3px rgba(15,60,55,.08)", cardBorder: "1px solid #e2eeeb",
    fontBody: sans, fontHead: sans, headingColor: "#0f2e2b",
    headerCss: "background:#ffffff;border:1px solid #d5e8e4", headText: "#0f3d38", headSub: "#5b8a83", regionColor: "#0d9488",
    accent: "#0d9488", big: "#0f766e", bigExtra: "", muted: "#6b8f89", line: "#e2eeeb", track: "#d7ebe7",
    barFill: "linear-gradient(90deg,#2dd4bf,#0d9488)", barH: 16, headingC: "#0f2e2b",
    ddayBg: "#0f766e", ddayText: "#ffffff",
  },
  {
    file: "2_indigo", name: "② 인디고 + 코랄",
    pageBg: "#f5f4fb", card: "#ffffff", radius: 16, shadow: "0 2px 8px rgba(49,46,129,.08)", cardBorder: "1px solid #eceafc",
    fontBody: sans, fontHead: sans, headingColor: "#312e81",
    headerCss: "background:#4338ca", headText: "#ffffff", headSub: "#c7d2fe", regionColor: "#fdba74",
    accent: "#f97316", big: "#ea580c", bigExtra: "", muted: "#8785a8", line: "#eceafc", track: "#eae8f7",
    barFill: "linear-gradient(90deg,#fb923c,#f97316)", barH: 16,
    ddayBg: "#312e81", ddayText: "#ffffff",
  },
  {
    file: "3_charcoal", name: "③ 차콜 + 골드 (프리미엄/공식)",
    pageBg: "#f6f4ef", card: "#ffffff", radius: 10, shadow: "0 1px 2px rgba(0,0,0,.06)", cardBorder: "1px solid #ece7dc",
    fontBody: sans, fontHead: "'Nanum Myeongjo','Batang',serif", headingColor: "#1c1c22",
    headerCss: "background:#1c1c22", headText: "#f5f1e8", headSub: "#a99f86", regionColor: "#c8a24a",
    accent: "#a4791f", big: "#1c1c22", bigExtra: "", muted: "#8b8578", line: "#ece7dc", track: "#e7e1d4",
    barFill: "linear-gradient(90deg,#d4af4f,#a4791f)", barH: 14,
    ddayBg: "#1c1c22", ddayText: "#e8c977",
  },
  {
    file: "4_gradient", name: "④ 그라디언트 모던 (바이올렛-블루)",
    pageBg: "#f4f4fc", card: "#ffffff", radius: 20, shadow: "0 4px 14px rgba(79,70,229,.10)", cardBorder: "1px solid #ececfa",
    fontBody: sans, fontHead: sans, headingColor: "#3730a3",
    headerCss: "background:linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)", headText: "#ffffff", headSub: "#d7d5fb", regionColor: "#c4b5fd",
    accent: "#6d28d9", big: "#5b21b6", bigExtra: "background:linear-gradient(90deg,#7c3aed,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent", muted: "#847fb0", line: "#ececfa", track: "#e9e7f9",
    barFill: "linear-gradient(90deg,#8b5cf6,#3b82f6)", barH: 16,
    ddayBg: "#4c1d95", ddayText: "#ffffff",
  },
];

for (const t of themes) {
  writeFileSync(`${DIR}/${t.file}.html`, render(t), "utf8");
  console.log("wrote", t.file);
}
