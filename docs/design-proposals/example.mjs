import { writeFileSync } from "node:fs";
const DIR = "C:/Users/PC/Desktop/workspace/hangaram/docs/design-proposals";

// 차콜+골드 최종 테마 + 골드 구간색
const GOLD = ["#ecdfb9", "#e2ce93", "#d4b86a", "#c4a24a", "#b08a34", "#957026", "#75561c", "#4a3a18"];
const bc = (r) => GOLD[Math.min(7, Math.max(0, Math.floor(r / 12.5)))];
const sans = "'Malgun Gothic','Apple SD Gothic Neo',sans-serif";
const serif = "'Nanum Myeongjo','Batang',serif";
const WM = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='330' height='200'%3E%3Ctext x='6' y='120' font-family='Arial,sans-serif' font-size='40' font-weight='bold' fill='%231c1c22' fill-opacity='0.09' transform='rotate(-27 165 100)'%3EEXAMPLE%3C/text%3E%3C/svg%3E";

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#f6f4ef;font-family:${sans};color:#2a2723}
.page{width:800px;padding:26px;position:relative}
.wm{position:absolute;inset:0;background-image:url("${WM}");background-repeat:repeat;pointer-events:none;z-index:60}
.serif{font-family:${serif};letter-spacing:-.01em}
.card{background:#fff;border:1px solid #ece7dc;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.05);padding:24px;margin-top:18px}
.header{background:#1c1c22;border-radius:16px;padding:24px 26px;position:relative;color:#f5f1e8}
.region{font-size:15px;font-weight:700;color:#c8a24a;display:flex;align-items:center;gap:8px}
.dot{width:9px;height:9px;border-radius:50%;background:#c8a24a}
.htitle{font-size:30px;font-weight:800;margin-top:6px}
.hsub{font-size:12px;margin-top:5px;color:#a99f86}
.official{position:absolute;top:24px;right:26px;text-align:right;color:#a99f86;font-size:12px}
.badge{border:1px solid #a99f86;border-radius:6px;padding:3px 9px;font-weight:700;letter-spacing:2px}
.rlabel{font-size:14px;color:#8b8578}
.bignum{font-size:64px;font-weight:800;line-height:1;color:#1c1c22}
.bignum small{font-size:30px}
.dday{background:#1c1c22;border-radius:14px;padding:10px 16px;text-align:right}
.dday b{font-size:26px;font-weight:800;display:block;line-height:1;color:#e8c977}
.dday span{font-size:11px;color:#a99f86}
.bar{position:relative;width:100%;border-radius:999px;background:#e7e1d4;overflow:hidden;margin-top:6px}
.fill{height:100%;border-radius:999px}
.ticks{position:absolute;inset:0;display:flex}.ticks i{flex:1;border-right:1px solid rgba(255,255,255,.65)}.ticks i:last-child{border:0}
.mk{position:absolute;top:0;height:100%;width:1px;background:#8b8578}
.mkl{position:absolute;top:22px;font-size:11px;color:#8b8578;transform:translateX(-50%);white-space:nowrap;font-weight:600}
.mkrow{height:20px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#ece7dc;border-radius:12px;overflow:hidden;margin-top:26px;border:1px solid #ece7dc}
.stat{background:#fff;padding:14px 12px}.stat .k{font-size:12px;color:#8b8578}.stat .v{font-size:24px;font-weight:800;margin-top:2px;color:#1c1c22}
.stat .v.acc{color:#a4791f}.stat .u{font-size:13px;color:#a99f86;font-weight:500;margin-left:2px}
h2{font-size:18px;font-weight:800;margin-bottom:14px;color:#1c1c22}
.drow{padding:8px 0}.dtop{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.dname{font-size:16px;font-weight:800}.dmeta{font-size:13px;color:#8b8578}
.dline{display:flex;align-items:center;gap:12px}.dpct{width:66px;text-align:right;font-size:19px;font-weight:800;color:#a4791f}
.legend{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:11px;color:#8b8578;align-items:center}
.lg{display:inline-flex;align-items:center;gap:6px}.sw{width:12px;height:12px;border-radius:3px}
.foot{margin-top:20px;text-align:center;font-size:12px;color:#8b8578}
/* 동별 카드 */
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dcard{position:relative;background:#fff;border:1px solid #ece7dc;border-left:4px solid #ccc;border-radius:12px;padding:14px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.dcard .top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.dcard .nm{font-size:16px;font-weight:800;color:#1c1c22}.dcard .pc{font-size:18px;font-weight:800;color:#a4791f}
.dcard .mt{font-size:12px;color:#8b8578;margin-top:8px}
.crown{position:absolute;top:-14px;right:8px;font-size:22px}
.subhead{display:flex;justify-content:space-between;align-items:flex-end}
.bigpct{font-size:34px;font-weight:800;color:#e8c977}
`;

function barFull(rate, markers = false) {
  const ticks = Array.from({ length: 20 }).map(() => "<i></i>").join("");
  const mk = markers ? `<span class="mk" style="left:50%"></span><span class="mk" style="left:81%"></span><span class="mkl" style="left:50%">과반 50%</span><span class="mkl" style="left:81%">목표 81%</span>` : "";
  return `<div style="position:relative"><div class="bar" style="height:${markers ? 16 : 12}px"><div class="fill" style="width:${rate}%;background:${bc(rate)}"></div><div class="ticks">${ticks}</div>${mk}</div>${markers ? '<div class="mkrow"></div>' : ""}</div>`;
}
function barSmall(rate) {
  return `<div class="bar" style="height:8px"><div class="fill" style="width:${rate}%;background:${bc(rate)}"></div></div>`;
}
const legend = () => `<div class="legend">${["0–12.5","12.5–25","25–37.5","37.5–50","50–62.5","62.5–75","75–87.5","87.5–100"].map((l,i)=>`<span class="lg"><span class="sw" style="background:${GOLD[i]}"></span>${l}%</span>`).join("")}<span style="margin-left:auto;color:#a99f86">막대 눈금 = 5% 단위</span></div>`;
const shell = (inner) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="page"><div class="wm"></div>${inner}</div></body></html>`;

// 종합
const 단지 = [
  { 이름: "한양", 율: 32.1, 동의: 306, 세대: 952, 동수: 8 },
  { 이름: "삼성", 율: 29.8, 동의: 211, 세대: 708, 동수: 10 },
  { 이름: "두산", 율: 31.0, 동의: 135, 세대: 436, 동수: 6 },
];
const home = shell(`
  <div class="header">
    <div class="official"><span class="badge">OFFICIAL</span><div style="margin-top:8px">갱신 2026.07.03 20:00</div></div>
    <div class="region"><span class="dot"></span>평촌 한가람 A-5구역 주민대표단</div>
    <div class="htitle serif">동의 현황 대시보드</div>
    <div class="hsub">한가람 한양 · 삼성 · 두산 통합재건축</div>
  </div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <div><div class="rlabel">전체 동의율</div><div class="bignum serif">31.2<small>%</small></div></div>
      <div class="dday"><b>D-26</b><span>접수마감 2026-07-29</span></div>
    </div>
    ${barFull(31.2, true)}
    <div class="stats">
      <div class="stat"><div class="k">총 세대수</div><div class="v">2,096<span class="u">세대</span></div></div>
      <div class="stat"><div class="k">동의 수</div><div class="v acc">654<span class="u">세대</span></div></div>
      <div class="stat"><div class="k">미동의</div><div class="v">1,442<span class="u">세대</span></div></div>
      <div class="stat"><div class="k">목표(81%)까지</div><div class="v">1,044<span class="u">명</span></div></div>
    </div>
  </div>
  <div class="card">
    <h2 class="serif">단지별 현황</h2>
    ${단지.map((c)=>`<div class="drow"><div class="dtop"><span class="dname">${c.이름} ›</span><span class="dmeta">${c.동의.toLocaleString()} / ${c.세대.toLocaleString()}명 · ${c.동수}개동</span></div><div class="dline"><div style="flex:1">${barFull(c.율)}</div><span class="dpct">${c.율}%</span></div></div>`).join("")}
  </div>
  <div class="card">${legend()}</div>
  <div class="foot">평촌 한가람 A-5구역 주민대표단 · 5~10분 간격 자동 갱신</div>
`);

// 한양 동별 (👑 경쟁)
const dongs = [
  { d: 301, r: 26.7, y: 32, n: 120 }, { d: 302, r: 21.7, y: 25, n: 115 },
  { d: 303, r: 38.7, y: 46, n: 119 }, { d: 304, r: 30.0, y: 36, n: 120 },
  { d: 305, r: 33.1, y: 39, n: 118 }, { d: 306, r: 28.3, y: 34, n: 120 },
  { d: 307, r: 35.3, y: 42, n: 119 }, { d: 308, r: 31.9, y: 38, n: 119 },
];
const top = dongs.reduce((a, b) => (b.r > a.r ? b : a)).d;
const hanyang = shell(`
  <div class="header">
    <div class="region"><span class="dot"></span>평촌 한가람 A-5구역 · 동별 동의 현황</div>
    <div class="subhead"><div><div class="htitle serif">한양</div><div class="hsub">8개동 · 동의 306 / 952명</div></div>
      <div style="text-align:right"><div class="bigpct serif">32.1%</div><div class="hsub">단지 동의율</div></div></div>
    <div style="margin-top:14px">${barFull(32.1, true)}</div>
  </div>
  <div style="margin-top:18px"><h2 class="serif" style="margin:0 0 12px 4px">동별 현황</h2>
    <div class="grid">
      ${dongs.map((x)=>`<div class="dcard" style="border-left-color:${bc(x.r)}">${x.d===top?'<span class="crown">👑</span>':''}
        <div class="top"><span class="nm">${x.d}동</span><span class="pc">${x.r}%</span></div>
        ${barSmall(x.r)}<div class="mt">${x.y} / ${x.n}명</div></div>`).join("")}
    </div>
  </div>
  <div class="card">${legend()}</div>
  <div class="foot">평촌 한가람 A-5구역 주민대표단 · 5~10분 간격 자동 갱신</div>
`);

writeFileSync(`${DIR}/example_home.html`, home, "utf8");
writeFileSync(`${DIR}/example_hanyang.html`, hanyang, "utf8");
console.log("wrote example_home, example_hanyang");
