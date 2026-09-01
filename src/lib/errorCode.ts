import { AxiosError } from "axios";

/**
 * 서버 에러 코드 → 사용자 문구.
 *
 * 문구는 서버 쪽에서 바뀔 수 있으니 화면에서는 상태코드가 아니라 **코드**를 먼저 본다.
 * 같은 409라도 원인이 다르면 안내가 달라야 한다(질문 키 중복 vs 동시 저장 충돌).
 */
export const API_ERROR_MESSAGES: Record<string, string> = {
  "E-COMMON-0001": "요청 값이 올바르지 않아요.",
  "E-COMMON-0002": "대상을 찾을 수 없어요.",
  "E-COMMON-0003": "이미 등록된 값이에요.",
  "E-COMMON-0009": "허용되지 않은 요청이에요.",
  "E-COMMON-0010":
    "다른 사람이 먼저 저장했어요. 최신 내용을 불러왔으니 확인 후 다시 저장해주세요.",

  "E-AUTH-0001": "로그인이 필요해요.",
  "E-AUTH-0002": "이 작업을 할 권한이 없어요.",
  "E-AUTH-0004": "가입되지 않은 학번이에요.",
  "E-AUTH-0005": "비밀번호가 일치하지 않아요.",
  "E-AUTH-0009": "이미 사용 중인 이메일이에요.",
  "E-AUTH-0010": "이미 가입된 학번이에요.",

  "E-APP-0015": "이미 사용 중인 질문 키(type)예요. 다른 값으로 입력해주세요.",
  "E-FEE-0001": "회비 안내가 아직 등록되지 않았어요.",
};

/** 응답 바디의 에러 코드. 서버가 코드를 안 내려주면 undefined. */
export function apiErrorCode(err: unknown): string | undefined {
  if (!(err instanceof AxiosError)) return undefined;
  return (err.response?.data as { code?: string } | undefined)?.code;
}

export function apiErrorStatus(err: unknown): number | undefined {
  return err instanceof AxiosError ? err.response?.status : undefined;
}

/** 코드 → 매핑 문구 → 서버 message → fallback 순으로 고른다. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const code = apiErrorCode(err);
  if (code && API_ERROR_MESSAGES[code]) return API_ERROR_MESSAGES[code];
  if (err instanceof AxiosError) {
    const message = (err.response?.data as { message?: string } | undefined)
      ?.message;
    if (message) return message;
  }
  return fallback;
}

/** 저장하려는 사이에 남이 먼저 고쳤을 때. 화면을 최신값으로 되돌려야 한다. */
export function isConcurrentModification(err: unknown): boolean {
  return apiErrorCode(err) === "E-COMMON-0010";
}
