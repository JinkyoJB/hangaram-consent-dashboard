import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "평촌 한가람 A-5구역 동의 현황 (demo)",
  description: "한가람 한양·삼성·두산 통합재건축 제안 동의서 접수 현황 모니터링",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-[var(--bg)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
