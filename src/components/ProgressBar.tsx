import { bucketColor } from "@/lib/format";

interface Marker {
  at: number; // 0~1
  label: string;
}

interface Props {
  rate: number; // 0~1
  markers?: Marker[];
  height?: number;
  showTicks?: boolean;
}

/** 동의율 진행바 — 구간 색상 + 5% 눈금 + 과반/목표 마커 */
export default function ProgressBar({ rate, markers = [], height = 14, showTicks = true }: Props) {
  const clamped = Math.min(1, Math.max(0, rate));
  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-full bg-slate-200/70"
        style={{ height }}
      >
        {/* 채움 */}
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${clamped * 100}%`, backgroundColor: bucketColor(clamped) }}
        />
        {/* 5% 눈금 */}
        {showTicks && (
          <div className="pointer-events-none absolute inset-0 flex">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-white/60 last:border-r-0" />
            ))}
          </div>
        )}
        {/* 마커 라인 */}
        {markers.map((m) => (
          <div
            key={m.label}
            className="absolute top-0 h-full w-px bg-slate-500/80"
            style={{ left: `${m.at * 100}%` }}
          />
        ))}
      </div>
      {/* 마커 라벨 */}
      {markers.length > 0 && (
        <div className="relative mt-1 h-4 text-[11px] font-medium text-slate-500">
          {markers.map((m) => (
            <span
              key={m.label}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${m.at * 100}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
