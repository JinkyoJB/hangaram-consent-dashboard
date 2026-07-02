"use client";
import { useEffect, useState } from "react";

/** 다크/라이트 모드 토글 (localStorage 저장, 새로고침 유지) */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={dark ? "라이트 모드" : "다크 모드"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--card)] text-lg ring-1 ring-[var(--bd)] transition-colors hover:bg-[var(--hover)]"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
