/**
 * 학년 표기 변환.
 *
 * 서버는 학년을 FRESHMAN·SOPHOMORE 같은 영문 enum 으로 주고받는다.
 * 화면에는 한국어로 보여야 하는데, 변환표가 지원 폼 안에만 있어
 * 관리자 화면은 영문 값을 그대로 찍고 있었다. 여기 한 곳에 둔다.
 */
export const GRADE_TO_CODE: Record<string, string> = {
  "1학년": "FRESHMAN",
  "2학년": "SOPHOMORE",
  "3학년": "JUNIOR",
  "4학년": "SENIOR",
  졸업생: "GRADUATE",
  휴학생: "ABSENCE",
};

export const CODE_TO_GRADE: Record<string, string> = Object.fromEntries(
  Object.entries(GRADE_TO_CODE).map(([k, v]) => [v, k]),
);

/** 서버 값(영문 enum)을 화면 표기로. 모르는 값은 그대로 둔다 — 빈칸보다 낫다. */
export function gradeLabel(code?: string | null): string {
  if (!code) return "-";
  return CODE_TO_GRADE[code] ?? code;
}
