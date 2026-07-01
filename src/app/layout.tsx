import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "평촌 한가람 A-5구역 동의 현황",
  description: "한가람 한양·삼성·두산 통합재건축 제안 동의서 접수 현황 모니터링",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-slate-50">{children}</body>
    </html>
  );
}
