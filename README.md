# 평촌 한가람 A-5구역 동의 현황 대시보드

한가람 한양·삼성·두산 통합재건축 **제안 동의서 접수 현황**을 실시간으로 보여주는 웹 대시보드입니다.
주민대표단이 구글시트에 입력하면 5~10분 이내로 자동 반영됩니다.

- 데이터(DB): **구글시트 + Apps Script**(`docs/sheets/Code.gs`) — 개인정보 미수집, 숫자만
- 화면: **Next.js(App Router) + Tailwind**, Vercel 배포
- 자세한 설계: [`docs/main_flow.md`](docs/main_flow.md) · 시트 구축: [`docs/sheets/구글시트_구축가이드.md`](docs/sheets/구글시트_구축가이드.md)

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # SHEET_API_URL 채우기 (비우면 목업 데이터로 미리보기)
npm run dev                  # http://localhost:3000
```

## 환경변수

| 이름 | 설명 |
|------|------|
| `SHEET_API_URL` | 구글시트 Apps Script 웹앱(doGet) URL. 비우면 목업 데이터로 렌더링 |

## 배포 (Vercel)

1. 이 저장소를 Vercel에 Import
2. 환경변수 `SHEET_API_URL` 등록
3. Deploy — 페이지는 ISR(5분 재검증)로 자동 갱신

## 구조

```
src/
  app/            # 페이지(종합 현황)
  components/     # ProgressBar, Legend, IntentBars ...
  lib/            # types, data(fetch+목업), format
docs/             # 설계 문서 + 구글시트(Code.gs, 가이드)
```
