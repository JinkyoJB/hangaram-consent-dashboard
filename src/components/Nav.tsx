import Link from "next/link";
import { NAME_TO_SLUG } from "@/lib/danji";
import ThemeToggle from "./ThemeToggle";

interface Props {
  active: string; // "" = 종합, 단지 이름, 또는 "submit"
  단지순서: string[];
}

/** 상단 탭 네비게이션 + 다크/라이트 토글 */
export default function Nav({ active, 단지순서 }: Props) {
  const tabs = [
    { label: "종합", href: "/", key: "" },
    ...단지순서.map((n) => ({ label: n, href: `/${NAME_TO_SLUG[n] ?? n}`, key: n })),
    { label: "제출방법", href: "/submit", key: "submit" },
  ];
  return (
    <div className="mb-4 flex items-center gap-2">
      <nav className="flex gap-1.5 overflow-x-auto">
        {tabs.map((t) => {
          const on = t.key === active;
          const isSubmit = t.key === "submit";
          const cls = on
            ? "bg-[var(--header)] text-white"
            : isSubmit
              ? "bg-[var(--card)] text-[var(--gold)] ring-1 ring-[var(--gold)] hover:bg-[var(--hover)]"
              : "bg-[var(--card)] text-[var(--muted)] ring-1 ring-[var(--bd)] hover:bg-[var(--hover)]";
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${cls}`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto shrink-0">
        <ThemeToggle />
      </div>
    </div>
  );
}
