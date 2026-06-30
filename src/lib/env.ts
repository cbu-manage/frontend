/**
 * 타입세이프 환경변수 로더.
 *
 * - `publicEnv` : 클라이언트/서버 공용 (NEXT_PUBLIC_* — 빌드 타임 인라인)
 * - `serverEnv` : **서버 전용** (BFF 라우트 핸들러에서만). 클라이언트 컴포넌트에서 import 금지.
 *
 * 환경변수 직접 참조(process.env.X)를 한곳으로 모아 오타·미설정을 빨리 드러내고
 * "undefined" 문자열 같은 엣지 케이스를 일관되게 처리한다.
 */

// NEXT_PUBLIC_API_URL 정규화 — 미설정이거나 문자열 "undefined"면 null(=BFF 프록시 사용)
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiUrl = rawApiUrl && rawApiUrl !== "undefined" ? rawApiUrl : null;

export const publicEnv = {
  /** 외부 API 베이스 URL. null이면 같은 오리진의 BFF 프록시(`/api/v1`)를 사용한다. */
  apiUrl,
} as const;

export const serverEnv = {
  /** BFF가 프록시할 백엔드 주소(서버 전용). 미설정이면 빈 문자열. 끝 슬래시 제거. */
  get backendUrl(): string {
    return (process.env.BACKEND_URL ?? "").replace(/\/$/, "");
  },
} as const;
