import { notFound } from "next/navigation";
import { getDashboard } from "@/lib/data";
import { SLUG_TO_NAME, DANJI_SLUGS } from "@/lib/danji";
import { pct, num } from "@/lib/format";
import ProgressBar from "@/components/ProgressBar";
import DongCard from "@/components/DongCard";
import Legend from "@/components/Legend";
import Nav from "@/components/Nav";

export const revalidate = 300;

export function generateStaticParams() {
  return DANJI_SLUGS.map((danji) => ({ danji }));
}

export default async function DanjiPage({
  params,
}: {
  params: Promise<{ danji: string }>;
}) {
  const { danji } = await params;
  const name = SLUG_TO_NAME[danji];
  if (!name) notFound();

  const d = await getDashboard();
  const c = d.단지들.find((x) => x.이름 === name);
  if (!c) notFound();

  // 👑 최고 동의율 동 (세대수 있는 동 중)
  const 후보 = c.동목록.filter((r) => r.세대수 > 0);
  const topKey =
    후보.length > 0
      ? 후보.reduce((a, b) => (b.동의수 / b.세대수 > a.동의수 / a.세대수 ? b : a)).동
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-slate-800 sm:px-6">
      {d.isMock && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          ⚠️ <b>미리보기(목업) 데이터</b>입니다. <code>SHEET_API_URL</code> 연결 시 실데이터로 전환됩니다.
        </div>
      )}

      <Nav active={name} 단지순서={d.설정.단지순서} />

      {/* 단지 요약 헤더 */}
      <header className="rounded-2xl bg-[#2b3648] px-6 py-5 text-white shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold tracking-tight text-emerald-300">
              {d.설정.구역명} · 동별 동의 현황
            </div>
            <h1 className="mt-1 text-3xl font-bold">{c.이름}</h1>
            <p className="mt-1 text-xs text-slate-300">
              {c.동수}개동 · 동의 {num(c.동의수)} / {num(c.세대수)}명
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold text-emerald-400">{pct(c.동의율)}</div>
            <div className="text-[11px] text-slate-300">단지 동의율</div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar
            rate={c.동의율}
            height={12}
            markers={[
              { at: d.설정.최소목표, label: `과반 ${pct(d.설정.최소목표, 0)}` },
              { at: d.설정.최종목표, label: `목표 ${pct(d.설정.최종목표, 0)}` },
            ]}
          />
        </div>
      </header>

      {/* 동별 카드 */}
      <section className="mt-5">
        <h2 className="mb-3 text-lg font-bold">동별 현황</h2>
        {c.동목록.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
            아직 등록된 동/호 데이터가 없습니다. 구글시트에 입력되면 표시됩니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {c.동목록.map((row) => (
              <DongCard key={row.동} row={row} isTop={row.동 === topKey} />
            ))}
          </div>
        )}
      </section>

      {/* 상가 */}
      {c.상가 && (
        <section className="mt-5">
          <h2 className="mb-3 text-lg font-bold">
            상가 <span className="text-sm font-normal text-slate-400">{c.이름} 상가</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DongCard row={c.상가} />
          </div>
        </section>
      )}

      {/* 범례 */}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Legend />
      </section>

      <footer className="mt-6 pb-4 text-center text-xs text-slate-400">
        {d.설정.구역명} {d.설정.주체} · 5~10분 간격 자동 갱신
      </footer>
    </main>
  );
}
