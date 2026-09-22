/** 이 서비스는 학교 메일만 사용한다. 도메인은 화면이 고정하고 사용자는 아이디만 입력한다. */
export const SCHOOL_EMAIL_DOMAIN = "tukorea.ac.kr";

export const FOREIGN_DOMAIN_NOTICE = `학교 메일(@${SCHOOL_EMAIL_DOMAIN})만 사용할 수 있어요. 아이디만 입력해주세요.`;

/**
 * 입력값에서 학교 메일 아이디만 남긴다.
 *
 * 무엇을 붙여넣든 아이디만 취하되, 학교 도메인이 아닌 주소를 넣었을 때는
 * 조용히 잘라내지 않고 알려줄 수 있게 따로 표시한다.
 */
export function parseSchoolEmailId(value: string): {
  id: string;
  hasForeignDomain: boolean;
} {
  const [id = "", domain = ""] = value.split("@");
  const typedDomain = domain.trim().toLowerCase();
  return {
    id: id.trim(),
    hasForeignDomain:
      value.includes("@") &&
      typedDomain !== "" &&
      typedDomain !== SCHOOL_EMAIL_DOMAIN,
  };
}
