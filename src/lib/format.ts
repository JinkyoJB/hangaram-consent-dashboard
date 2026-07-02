// 표시용 포맷 헬퍼

export function pct(x: number, digits = 1): string {
  return `${(x * 100).toFixed(digits)}%`;
}

export function num(n: number): string {
  return n.toLocaleString("ko-KR");
}

// D-day: 마감일까지 남은 일수 (마감 당일 = D-0). 서버 타임존과 무관하게 KST 날짜 기준.
export function dday(마감: string): number {
  const [y, m, d] = 마감.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const end = Date.UTC(y, m - 1, d);
  // KST 기준 오늘 (en-CA => "YYYY-MM-DD")
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  const [ty, tm, td] = today.split("-").map(Number);
  const now = Date.UTC(ty, tm - 1, td);
  return Math.round((end - now) / 86400000);
}

// 동의율 8단계(12.5% 간격) 색상 — 참고 이미지 범례와 동일한 초록→파랑→남색 그라데이션
const BUCKETS = [
  "#cfe9d8", // 0–12.5
  "#9fd6b4", // 12.5–25
  "#5cbd8a", // 25–37.5
  "#38a86b", // 37.5–50
  "#4aa6cf", // 50–62.5
  "#3b82c4", // 62.5–75
  "#28579f", // 75–87.5
  "#1e3a6b", // 87.5–100
];

export function bucketColor(rate: number): string {
  const i = Math.min(7, Math.max(0, Math.floor(rate / 0.125)));
  return BUCKETS[i];
}

export const LEGEND = [
  { label: "0–12.5%", color: BUCKETS[0] },
  { label: "12.5–25%", color: BUCKETS[1] },
  { label: "25–37.5%", color: BUCKETS[2] },
  { label: "37.5–50%", color: BUCKETS[3] },
  { label: "50–62.5%", color: BUCKETS[4] },
  { label: "62.5–75%", color: BUCKETS[5] },
  { label: "75–87.5%", color: BUCKETS[6] },
  { label: "87.5–100%", color: BUCKETS[7] },
];
