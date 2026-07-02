import Link from "next/link";
import { getDashboard } from "@/lib/data";
import { pct, num, dday } from "@/lib/format";
import { NAME_TO_SLUG } from "@/lib/danji";
import ProgressBar from "@/components/ProgressBar";
import Legend from "@/components/Legend";
import Nav from "@/components/Nav";

export const revalidate = 300;

export default async function Home() {
  const d = await getDashboard();
  const s = d.설정;
  const D = dday(s.접수마감);
  const 갱신 = new Date(d.갱신시각).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--text)] sm:px-6">
      {d.isMock && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          ⚠️ <b>미리보기(목업) 데이터</b>입니다. 환경변수 <code>SHEET_API_URL</code>에 구글시트 웹앱 URL을 넣으면 실데이터로 전환됩니다.
        </div>
      )}

      <Nav active="" 단지순서={s.단지순서} />

      {/* 헤더 */}
      <header className="rounded-2xl bg-[var(--header)] px-6 py-5 text-white shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#c8a24a]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#c8a24a]" />
              {s.구역명} {s.주체}
            </div>
            <h1 className="serif mt-1 text-2xl font-bold sm:text-3xl">동의 현황 대시보드</h1>
            <p className="mt-1 text-xs text-[#a99f86]">한가람 한양 · 삼성 · 두산 통합재건축</p>
          </div>
          <div className="text-right text-xs text-[#a99f86]">
            <span className="rounded border border-[#a99f86]/60 px-2 py-0.5 font-semibold tracking-widest">
              OFFICIAL
            </span>
            <div className="mt-2">갱신 {갱신}</div>
          </div>
        </div>
      </header>

      {/* 전체 동의율 */}
      <section className="mt-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-[var(--muted)]">전체 동의율</div>
            <div className="serif mt-1 text-5xl font-extrabold tracking-tight text-[var(--strong)] sm:text-6xl">
              {pct(d.전체.동의율)}
            </div>
          </div>
          <DdayBadge d={D} 마감={s.접수마감} />
        </div>

        <div className="mt-5">
          <ProgressBar
            rate={d.전체.동의율}
            height={16}
            markers={[
              { at: s.최소목표, label: `과반 ${pct(s.최소목표, 0)}` },
              { at: s.최종목표, label: `목표 ${pct(s.최종목표, 0)}` },
            ]}
          />
        </div>

        {/* 지표 4종 */}
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--bd)] bg-[var(--bd)] sm:grid-cols-4">
          <Stat label="총 세대수" value={num(d.전체.세대수)} unit="세대" />
          <Stat label="동의 수" value={num(d.전체.동의수)} unit="세대" accent />
          <Stat label="미동의" value={num(d.전체.세대수 - d.전체.동의수)} unit="세대" />
          <Stat label={`목표(${pct(s.최종목표, 0)})까지`} value={num(d.목표까지)} unit="명" />
        </div>
      </section>

      {/* 단지별 현황 */}
      <section className="mt-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-6 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="serif text-lg font-bold">단지별 현황</h2>
          <span className="text-xs text-[var(--muted)]">단지 클릭 → 동별 상세</span>
        </div>
        <div className="space-y-2">
          {d.단지들.map((c) => (
            <Link
              key={c.이름}
              href={`/${NAME_TO_SLUG[c.이름] ?? c.이름}`}
              className="-mx-2 block rounded-xl px-2 py-2 transition-colors hover:bg-[var(--hover)]"
            >
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-base font-bold">
                  {c.이름} <span className="text-slate-300">›</span>
                </span>
                <span className="text-sm text-slate-500">
                  {num(c.동의수)} / {num(c.세대수)}명 · {c.동수}개동
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar rate={c.동의율} height={12} />
                </div>
                <span className="w-16 shrink-0 text-right text-lg font-bold text-[var(--gold)]">
                  {pct(c.동의율)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 범례 */}
      <section className="mt-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-5 shadow-sm">
        <Legend />
      </section>

      <footer className="mt-6 pb-4 text-center text-xs text-slate-500">
        {s.구역명} {s.주체} · 5~10분 간격 자동 갱신
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[var(--card)] px-4 py-3">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className={`mt-0.5 text-2xl font-bold ${accent ? "text-[var(--gold)]" : "text-[var(--strong)]"}`}>
        {value}
        {unit && <span className="ml-0.5 text-sm font-medium text-[#a99f86]">{unit}</span>}
      </div>
    </div>
  );
}

function DdayBadge({ d, 마감 }: { d: number; 마감: string }) {
  const label = d > 0 ? `D-${d}` : d === 0 ? "D-DAY" : "마감";
  return (
    <div className="rounded-xl bg-[var(--header)] px-4 py-2 text-right">
      <div className="text-2xl font-extrabold leading-none text-[#e8c977]">{label}</div>
      <div className="mt-1 text-[11px] text-[#a99f86]">접수마감 {마감}</div>
    </div>
  );
}
