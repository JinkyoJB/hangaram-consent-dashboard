import type { Intent } from "@/lib/types";
import { pct, num } from "@/lib/format";

function Pair({
  label,
  a,
  b,
  aColor,
  bColor,
}: {
  label: string;
  a: { name: string; v: number };
  b: { name: string; v: number };
  aColor: string;
  bColor: string;
}) {
  const total = a.v + b.v;
  const ar = total > 0 ? a.v / total : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="text-slate-400">응답 {num(total)}</span>
      </div>
      <div className="flex h-6 w-full overflow-hidden rounded-md bg-slate-100 text-[11px] font-semibold text-white">
        <div
          className="flex items-center justify-start pl-2"
          style={{ width: `${ar * 100}%`, backgroundColor: aColor }}
        >
          {ar > 0.14 && <span>{a.name} {pct(ar, 0)}</span>}
        </div>
        <div
          className="flex flex-1 items-center justify-end pr-2"
          style={{ backgroundColor: bColor }}
        >
          {1 - ar > 0.14 && <span>{b.name} {pct(1 - ar, 0)}</span>}
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>{a.name} {num(a.v)}</span>
        <span>{b.name} {num(b.v)}</span>
      </div>
    </div>
  );
}

/** 통합/제자리 · 신탁/조합 의향 두 개의 스택 바 */
export default function IntentBars({ intent }: { intent: Intent }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Pair
        label="통합 / 제자리"
        a={{ name: "통합", v: intent.통합 }}
        b={{ name: "제자리", v: intent.제자리 }}
        aColor="#38a86b"
        bColor="#94a3b8"
      />
      <Pair
        label="신탁 / 조합"
        a={{ name: "신탁", v: intent.신탁 }}
        b={{ name: "조합", v: intent.조합 }}
        aColor="#3b82c4"
        bColor="#94a3b8"
      />
    </div>
  );
}
