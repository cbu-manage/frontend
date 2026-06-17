# API 레이어 — 통신 · BFF · React Query

> 서버 통신 컨벤션. 관련: [architecture.md](./architecture.md) · [components.md](./components.md)

---

## 통신 흐름

```
컴포넌트 → 훅(useXxx) → @/api 의 xxxApi → client.ts → (/api/v1) → BFF route.ts → BACKEND_URL
```

- 백엔드 주소는 **`BACKEND_URL` 서버 env에만** 둔다. `NEXT_PUBLIC_API_URL`은 설정하지 않음(클라 노출 방지).
- 즉 브라우저는 같은 오리진 `/api/v1/*`로만 요청 → BFF가 서버에서 백엔드로 중계.

---

## 1. `client.ts` (axios)

- `baseURL`: `NEXT_PUBLIC_API_URL`이 없으면 **`/api/v1`로 폴백**(BFF 경유).
- `withCredentials: true` — 쿠키 자동 포함(세션).
- **인터셉터**: 401/403 → `/login/refresh` → 원요청 재시도. refresh 실패 시 `clearUser()` + `/login` 이동.
- ✅ **401/403을 컴포넌트에서 직접 처리하지 말 것** — 인터셉터가 담당.

## 2. `*.api.ts` 패턴

타입 + `xxxApi` 객체(메서드 모음). 경로에 `/api/v1` **안 붙임**(baseURL이 채움). 한글 JSDoc.

```ts
/** 스터디 목록 페이징 조회 */
getList: (params?: StudyListParams) => api.get("/post/study", { params }),
create: (data: CreateRequest) => api.post("/post/study", data),
getById: (id: number) => api.get(`/post/study/${id}`),
close:   (id: number) => api.post(`/post/study/${id}/close`),
```

- 메서드명: `getList / getById / create / update / delete` → 그 외 도메인 동사(`close`, `accept`, `notifyPass`).
- 쿼리 파라미터는 `{ params }` 두 번째 인자로.
- ID 경로는 템플릿 리터럴.

## 3. 응답 봉투 `ApiEnvelope<T>`

모든 응답은 `{ code, message, data: T }` 형태. 언랩은 **`res.data.data`**.

```ts
type ApiEnvelope<T> = { code: string; message: string; data: T };
```

## 4. 배럴 `index.ts`

모든 `xxxApi`·타입·`api`를 재export. **앱 코드는 `@/api`에서만 import**(개별 `*.api.ts` 직접 import 금지).

## 5. BFF `app/api/v1/[...path]/route.ts`

- `BACKEND_URL`(서버 전용)로 모든 메서드(GET~OPTIONS) 프록시.
- host/origin/referer 헤더 제거, **복수 Set-Cookie 그대로 전달**(refresh 토큰 쿠키 패스스루).
- `BACKEND_URL` 미설정 시 502.

---

## 6. React Query 훅 (`src/hooks/<도메인>/`)

도메인별 폴더 + 각 `index.ts` 배럴. 종류:
- **서버 상태**: `useQuery`/`useMutation` 래핑 (`useStudyList`, `useMe`).
- **폼/인증 로직**: 폼 state + mutation + 에러파싱 + 라우팅을 캡슐화 (`useLogin`, `useSignUp`).

### query key
플랫 튜플, **파라미터 순서대로**. 재사용하면 상수로.
```ts
queryKey: ["studies", page, status, category, pageSize]
export const ME_QUERY_KEY = ["auth", "me"] as const;
```

### 규칙
- 응답 **언랩·정규화는 훅 안에서**(컴포넌트 아님): `res.data.data` → UI 타입 매핑.
- `enabled`로 불필요 요청 차단(예: `enabled: isLoggedIn`).
- 자주 안 바뀌는 데이터는 `staleTime` 지정(예: `useMe` 5분).
- 화면폭 따라 페이지 크기 바뀌면 **`pageSize`를 queryKey에 포함**(캐시 무효화).
