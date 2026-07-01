import type { DongRow } from "@/lib/types";
import { pct, num, bucketColor } from "@/lib/format";
import ProgressBar from "./ProgressBar";

/** 동(또는 상가) 한 개의 동의율 카드 — 👑 최고동 표시 */
export default function DongCard({ row, isTop }: { row: DongRow; isTop?: boolean }) {
  const has = row.세대수 > 0;
  const rate = has ? row.동의수 / row.세대수 : 0;
  const 이름 = row.구분 === "상가" ? row.동 : `${row.동}동`;

  return (
    <div
      className="relative rounded-xl border border-slate-200 border-l-4 bg-white p-3.5 shadow-sm"
      style={{ borderLeftColor: bucketColor(rate) }}
    >
      {isTop && (
        <span className="absolute -top-3 right-2 text-xl" title="최고 동의율">
          👑
        </span>
      )}
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-base font-bold text-slate-800">{이름}</span>
        <span className="text-lg font-extrabold text-emerald-600">
          {has ? pct(rate) : "—"}
        </span>
      </div>
      <ProgressBar rate={rate} height={8} showTicks={false} />
      <div className="mt-1.5 text-xs text-slate-500">
        {has ? `${num(row.동의수)} / ${num(row.세대수)}명` : `${num(row.동의수)}명 동의 · 세대수 미정`}
      </div>
    </div>
  );
}
