// URL slug ↔ 단지 이름 매핑
export const SLUG_TO_NAME: Record<string, string> = {
  hanyang: "한양",
  samsung: "삼성",
  doosan: "두산",
};

export const NAME_TO_SLUG: Record<string, string> = {
  한양: "hanyang",
  삼성: "samsung",
  두산: "doosan",
};

export const DANJI_SLUGS = Object.keys(SLUG_TO_NAME);

function range(a: number, b: number): string[] {
  return Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
}

// 각 단지의 기본 아파트 동 목록 (데이터가 없어도 카드로 항상 표시)
export const DANJI_DONG: Record<string, string[]> = {
  한양: range(301, 308),
  삼성: range(201, 210),
  두산: range(101, 106),
};
