// 구글시트 Apps Script(doGet) 가 반환하는 JSON 구조
export type Gubun = "아파트" | "상가";

export interface DanjiInfo {
  단지: string;
  아파트세대수: number;
  상가세대수: number;
}

export interface DongRow {
  단지: string;
  구분: Gubun;
  동: string;
  세대수: number; // 고정 분모 (미확보 시 0)
  동의수: number;
}

export interface Intent {
  통합: number;
  제자리: number;
  신탁: number;
  조합: number;
}

export interface Settings {
  구역명: string;
  주체: string;
  접수마감: string; // YYYY-MM-DD
  최소목표: number; // 0.5
  최종목표: number; // 0.81
  상가포함: boolean;
  단지순서: string[];
}

export interface ApiPayload {
  갱신시각: string;
  설정: Settings;
  단지: DanjiInfo[];
  동목록: DongRow[];
  의향: { 전체: Intent } & Record<string, Intent>;
}

// 대시보드 계산 결과
export interface DanjiSummary {
  이름: string;
  세대수: number;
  동의수: number;
  동의율: number; // 0~1
  동수: number;
  동목록: DongRow[];
  상가?: DongRow;
}

export interface Dashboard {
  설정: Settings;
  갱신시각: string;
  isMock: boolean;
  전체: { 세대수: number; 동의수: number; 동의율: number };
  단지들: DanjiSummary[];
  의향: { 전체: Intent } & Record<string, Intent>;
  목표까지: number; // 최종목표 달성에 필요한 추가 동의 수
}
