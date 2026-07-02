import Image from "next/image";
import { getDashboard } from "@/lib/data";
import { dday } from "@/lib/format";
import { SUBMIT, 공통안내 } from "@/lib/submit";
import Nav from "@/components/Nav";

export const revalidate = 300;

export default async function SubmitPage() {
  const d = await getDashboard();
  const s = d.설정;
  const D = dday(s.접수마감);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--text)] sm:px-6">
      <Nav active="submit" 단지순서={s.단지순서} />

      {/* 헤더 */}
      <header className="rounded-2xl bg-[var(--header)] px-6 py-5 text-white shadow-sm">
        <div className="text-sm font-semibold tracking-tight text-[#c8a24a]">
          {s.구역명} 주민대표단
        </div>
        <h1 className="serif mt-1 text-2xl font-bold sm:text-3xl">서류 제출 방법</h1>
        <p className="mt-1 text-xs text-[#a99f86]">
          제안 동의서는 각 단지 관리사무소에서 받고 제출합니다 · 접수마감 {s.접수마감}
          {D >= 0 ? ` (D-${D})` : " (마감)"}
        </p>
      </header>

      {/* 공통 안내 */}
      <section className="mt-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="serif mb-3 text-lg font-bold">접수 안내</h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--body)]">
          <li>본인 단지의 <b>관리사무소</b>를 방문해 <b>제안 동의서</b>를 받습니다.</li>
          <li>작성·서명(날인) 후 <b>같은 관리사무소에 제출</b>합니다.</li>
          <li>제출 결과는 대표단이 확인해 이 사이트에 반영합니다(5~10분 내 자동 갱신).</li>
        </ol>
        {(공통안내.접수시간 || 공통안내.준비물.length > 0) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {공통안내.접수시간 && (
              <InfoRow label="접수 시간" value={공통안내.접수시간} />
            )}
            {공통안내.준비물.length > 0 && (
              <InfoRow label="준비물" value={공통안내.준비물.join(" · ")} />
            )}
          </div>
        )}
      </section>

      {/* 단지별 제출처 */}
      {SUBMIT.map((info) => (
        <section
          key={info.단지}
          className="mt-5 overflow-hidden rounded-2xl border border-[var(--bd)] bg-[var(--card)] shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[var(--bd)] px-6 py-4">
            <h2 className="serif text-lg font-bold">
              {info.단지} <span className="text-sm font-normal text-[var(--muted)]">관리사무소</span>
            </h2>
            {info.전화 && (
              <a
                href={`tel:${info.전화.replace(/-/g, "")}`}
                className="rounded-lg bg-[var(--tint)] px-3 py-1.5 text-sm font-bold text-[var(--gold)] ring-1 ring-[#a4791f]/30"
              >
                📞 {info.전화}
              </a>
            )}
          </div>

          <div className="p-6">
            <p className="text-sm leading-relaxed text-[var(--body)]">{info.위치설명}</p>

            {info.mapImage ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-[var(--bd)]">
                <Image
                  src={info.mapImage}
                  alt={`${info.단지} 관리사무소 위치`}
                  width={1283}
                  height={921}
                  className="h-auto w-full"
                />
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-[var(--dashed)] bg-[var(--tint)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                🗺️ 위치 지도 준비 중입니다.
              </div>
            )}

            {info.mapLink && (
              <a
                href={info.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--header)] px-4 py-2 text-sm font-semibold text-[#e8c977]"
              >
                🧭 지도앱에서 단지 위치 열기
              </a>
            )}
          </div>
        </section>
      ))}

      <p className="mt-4 rounded-xl bg-[var(--tint)] px-4 py-3 text-xs leading-relaxed text-[var(--muted)]">
        ※ 관리사무소는 지도 앱에 주소가 등록되어 있지 않을 수 있어, 실제 위치를 이미지로 안내합니다.
        정확한 <b>접수 시간·준비물</b>과 삼성·두산 <b>위치 지도</b>는 확정되는 대로 업데이트됩니다.
      </p>

      <footer className="mt-6 pb-4 text-center text-xs text-[var(--muted)]">
        {s.구역명} {s.주체} · 5~10분 간격 자동 갱신
      </footer>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--tint)] px-4 py-3">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-[var(--text)]">{value}</div>
    </div>
  );
}
