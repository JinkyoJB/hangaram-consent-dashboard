import { LEGEND } from "@/lib/format";

/** 동의율 8단계 색상 범례 */
export default function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[var(--muted)]">
      {LEGEND.map((l) => (
        <span key={l.label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: l.color }}
          />
          {l.label}
        </span>
      ))}
      <span className="ml-auto text-[#a99f86]">막대 눈금 = 5% 단위</span>
    </div>
  );
}
