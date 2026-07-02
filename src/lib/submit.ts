// 단지별 동의서 서류 제출처 안내 (관리사무소). 정보 확정되면 이 파일만 수정.
export interface SubmitInfo {
  단지: string;
  mapImage?: string; // /public 기준 경로. 없으면 "지도 준비 중"
  위치설명: string; // 랜드마크 기준 길안내
  전화?: string;
  접수시간?: string; // 미확정이면 비워둠
  준비물?: string[]; // 미확정이면 비워둠
  mapLink?: string; // 지도앱 열기 (아파트 검색 링크)
  준비중?: boolean;
}

export const SUBMIT: SubmitInfo[] = [
  {
    단지: "한양",
    mapImage: "/maps/hanyang.png",
    위치설명:
      "정문(학의로)으로 들어와 단지 북동측, 301동 방면 별도 관리동입니다. (아래 지도의 골드 표시 위치)",
    전화: "031-386-0193",
    mapLink: "https://map.naver.com/p/search/평촌 한가람한양아파트",
  },
  {
    단지: "삼성",
    위치설명: "관리사무소 위치 지도 준비 중입니다.",
    mapLink: "https://map.naver.com/p/search/평촌 한가람삼성아파트",
    준비중: true,
  },
  {
    단지: "두산",
    위치설명: "관리사무소 위치 지도 준비 중입니다.",
    전화: "031-382-3282",
    mapLink: "https://map.naver.com/p/search/평촌 한가람두산아파트",
    준비중: true,
  },
];

// 공통 접수 안내 (확정되면 수정)
export const 공통안내 = {
  준비물: [] as string[], // 예: ["소유자 신분증", "도장", ...] — 확정 후 기재
  접수시간: "", // 예: "평일 09:00~18:00" — 확정 후 기재
};
