import Link from "next/link";
import { NAME_TO_SLUG } from "@/lib/danji";

interface Props {
  active: string; // "" = 종합, 아니면 단지 이름
  단지순서: string[];
}

/** 상단 탭 네비게이션 (종합 / 한양 / 삼성 / 두산) */
export default function Nav({ active, 단지순서 }: Props) {
  const tabs = [
    { label: "종합", href: "/", key: "" },
    ...단지순서.map((n) => ({ label: n, href: `/${NAME_TO_SLUG[n] ?? n}`, key: n })),
  ];
  return (
    <nav className="mb-4 flex gap-1.5 overflow-x-auto">
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
              on
                ? "bg-[#2b3648] text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
