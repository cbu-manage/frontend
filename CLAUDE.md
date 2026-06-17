# CBU Frontend — 개발 가이드 / AI 컨벤션

> 한국공학대 씨부엉(CBU) 동아리 관리 웹. 이 문서는 **사람용 컨벤션 가이드이자 AI 입력**이다.
> Claude Code는 이 파일을 자동으로 읽는다. 다른 AI(ChatGPT 등)를 쓸 땐 **이 문서를 프롬프트에 붙여넣고** "이 컨벤션을 따르라"고 지시할 것.
> 목표: 누가/어떤 도구로 짜든 **하우스 스타일로 수렴** → 일관성↑, 충돌↓, 리뷰 쉬움.

**스택**: Next.js 16 (App Router) · React 19 · TypeScript(strict) · Zustand · TanStack Query v5 · axios · Tailwind v4 · shadcn/ui

---

## 0. 황금 규칙 (제일 중요)

1. **이해 못 한 코드는 커밋하지 않는다.** AI가 짜줬어도 본인이 설명할 수 있어야 PR.
2. **PR 전 반드시 로컬에서 `npm run build` 통과 확인.** 빌드 안 돌려본 코드는 리뷰 대상 아님.
3. **PR 본문에 3줄**: ① 무엇을 ② 왜 이 방식으로 ③ 어떻게 테스트했는지.
4. **기존 코드를 먼저 보고 그 패턴을 따른다.** 새 방식 도입 전 리드와 상의.
5. **하드코딩 금지** — 색/사이즈는 토큰(`STYLE_GUIDE.md`), 백엔드 주소는 env(`BACKEND_URL`).

---

## 1. 폴더 구조

```
src/
├── app/            # 라우트 (App Router). page.tsx는 얇게 — 컴포넌트에 위임
│   ├── api/v1/[...path]/route.ts   # BFF 프록시 (백엔드로 중계)
│   ├── layout.tsx  # 폰트(Pretendard)·providers·metadata·Header/Footer
│   ├── globals.css # Tailwind v4 @theme: 색·타이포·스페이싱 토큰 (tailwind.config 없음)
│   └── error.tsx, global-error.tsx # 에러 바운더리
├── api/            # 서버 통신 레이어 (*.api.ts + client.ts)
├── hooks/          # TanStack Query 래핑 + 폼/인증 커스텀 훅 (도메인별 폴더)
├── store/          # Zustand 전역 상태
├── components/     # UI 컴포넌트 (도메인/역할별 폴더)
├── lib/            # 순수 유틸 (utils.ts = cn())
└── styles/         # 색 팔레트 등 보조 스타일 상수
```

**원칙**: 새 파일은 "이게 무슨 역할인가"로 폴더를 고른다. 애매하면 §5(컴포넌트) / §4(API) 규칙 참고.

---

## 2. 모듈별 가이드

### `src/api/` — 서버 통신
| 파일 | 역할 |
|---|---|
| `client.ts` | axios 인스턴스. baseURL(`NEXT_PUBLIC_API_URL` 없으면 `/api/v1` 폴백), `withCredentials`, **401/403→`/login/refresh`→원요청 재시도** 인터셉터 |
| `index.ts` | 배럴 익스포트. **앱 코드는 무조건 `@/api`에서만 import** (개별 `*.api.ts` 직접 X) |
| `*.api.ts` | 도메인별 API. 타입 + `xxxApi` 객체(메서드 모음) |
| `app/api/v1/[...path]/route.ts` | BFF. `BACKEND_URL`(서버전용)로 모든 메서드 프록시, 쿠키 패스스루 |

→ 상세 패턴은 **§4 API 레이어**.

### `src/hooks/` — 데이터/로직 훅
도메인별 폴더(`auth/ user/ mail/ project/ study/ coding-test/ archive/`), 각 폴더 `index.ts` 배럴.
- **서버 상태** = TanStack Query 래핑 훅 (`useStudyList`, `useMe` 등)
- **폼/인증 로직** = 커스텀 훅 (`useLogin`, `useSignUp`, `useChangePassword`) — 폼 state + mutation + 에러파싱 + 라우팅 캡슐화
- query key = **플랫 튜플**, 파라미터 순서대로: `["studies", page, status, category]`
- 응답 언랩/정규화는 **훅 안에서** 처리(컴포넌트 아님): `res.data.data` → UI 타입 매핑

### `src/store/` — Zustand
| 스토어 | 역할 |
|---|---|
| `userStore.ts` | 인증/프로필 상태 + `localStorage` persist (SSR-safe 스냅샷). 액션: `setUser/setAuthStatus/updateEmail/clearUser` |
| `codingTestMetaStore.ts` | 코테 필터 메타(플랫폼/언어/카테고리) |

사용: 셀렉터로 **필요한 필드만** 구독 → `useUserStore((s) => s.name)`. 전체 구독 금지(리렌더).

### `src/components/` — §5 참조

### `src/lib/` — 순수 유틸
- `utils.ts`: `cn(...)` = `twMerge(clsx(...))`. **조건부 className은 항상 `cn()`** 사용.
- 순수 함수만(부수효과 X). 날짜/포맷 유틸 추가 시 여기로.

---

## 3. 코드 컨벤션

**TypeScript**
- `type` 기본. **컴포넌트 props만 `interface`**(특히 HTML 속성 확장 시 `interface X extends React.InputHTMLAttributes<...>`).
- ✅ `any` 금지 — 느슨한 응답은 `unknown` + 런타임 체크. (PR 리뷰에서 `any` 잡음)
- strict 모드. null 가능 필드는 `T | null` 명시.

**네이밍 / 파일**
| 종류 | 규칙 | 예 |
|---|---|---|
| 컴포넌트 파일 | PascalCase | `InputBox.tsx`, `StudyCard.tsx` |
| API 파일 | `{도메인}.api.ts` → `{도메인}Api` 객체 | `study.api.ts` → `studyApi` |
| 훅 | `useXxx.ts` | `useLogin.ts` |
| 단일 컴포넌트 export | `export default` | |
| 타입/서브 export | named export | `export type ProjectStatus` |

**Import 순서** (`@/*` = `src/*`)
```ts
// 1. 외부(react, next, 라이브러리)
// 2. @/api  3. @/store  4. @/components  5. @/hooks  6. @/lib
```

**에러 처리**
- API 에러는 `AxiosError`로 잡고 메시지 우선순위: 서버 `message` > error.message > 폴백 문구.
- 401/403은 **컴포넌트에서 직접 처리하지 말 것** — `client.ts` 인터셉터가 refresh/재시도/로그아웃 담당.
- 전역 throw는 `error.tsx` → `ErrorFallback`이 받음.

---

## 4. API 레이어 패턴

**응답 봉투**: 모든 응답은 `ApiEnvelope<T> = { code, message, data: T }`. 언랩은 `res.data.data`.

**`*.api.ts` 형태** — 타입 + 객체(메서드 모음), 경로에 `/api/v1` 안 붙임(baseURL이 채움), 한글 JSDoc:
```ts
/** 스터디 목록 페이징 조회 */
getList: (params?: StudyListParams) => api.get("/post/study", { params }),
create: (data: CreateRequest) => api.post("/post/study", data),
getById: (id: number) => api.get(`/post/study/${id}`),
close: (id: number) => api.post(`/post/study/${id}/close`),
```
메서드명 규칙: `getList / getById / create / update / delete` → 그 외 도메인 동사(`close`, `accept`, `notifyPass`).

**통신 흐름**: 컴포넌트 → 훅(`useXxx`) → `@/api`의 `xxxApi` → `client.ts` → (`/api/v1`) → BFF `route.ts` → `BACKEND_URL`.
- 백엔드 주소는 **`BACKEND_URL` 서버 env에만** 둔다. `NEXT_PUBLIC_API_URL`은 설정하지 않음(클라 노출 방지).

---

## 5. 컴포넌트 분할 규칙

### 폴더별 역할
| 폴더 | 무엇이 들어가나 |
|---|---|
| `ui/` | shadcn 프리미티브(Button, Calendar). 디자인 토큰만, 앱 로직 없음 |
| `common/` | 앱 공용 UI 킷 — 폼/상태 컴포넌트(InputBox, LongBtn, MultiSelect, **LoadingSpinner, ErrorFallback**). ui/와 차이: **앱 스타일+동작 있음** |
| `shared/` | 전역 레이아웃(Header, Footer, Sidebar, Pagination). 2+페이지에서 쓰는 것 |
| `providers/` | 전역 프로바이더(QueryProvider 등) |
| `auth/` | 라우트 가드(`RequireMember`, `RequireAdmin`) |
| `admin/` `user/` | 관리자/마이 페이지의 **Section 컴포넌트** + `*PageClient` |
| `apply/` `signup/` | 가입/신청 폼 필드·스텝 |
| `project/` `study/` `coding-test/` `archive/` | 도메인 리스트 카드/행(`*Card`, `*Row`) |
| `detail/` | 상세 페이지 템플릿(`DetailTemplate`, `CommentSection`) |
| `icons/` | 재사용 SVG 아이콘 컴포넌트 |

### Section / PageClient 패턴 (핵심)
사이드바·탭 있는 페이지는 이렇게 쪼갠다:
```
app/manage/page.tsx        ← 얇음. 인증가드 + PageClient만
  └ RequireAdmin
     └ AdminPageClient ("use client")   ← 탭 state 관리
        ├ MemberManageSection ("use client")   ← 독립 미니페이지(자체 훅/쿼리/폼)
        ├ GroupManageSection
        └ ...
```
**언제 Section으로 쪼개나**: ① 페이지에 탭/사이드바(상호배타 뷰) ② 한 뷰가 100줄+ 자체 로직 ③ Section은 props 없이 독립.

### `"use client"` 위치
- **인터랙션이 시작되는 최소 컴포넌트**에 둔다(트리 깊숙이 X).
- `*PageClient`, `*Section`, 폼 필드, Header/Sidebar = `"use client"`.
- 순수 표시용 카드(`ProjectCard` 등) = 가능하면 서버 컴포넌트.

### container vs presentational
- **컨테이너**(`*PageClient`, `*Section`): state·쿼리·이벤트 소유.
- **프레젠테이셔널**(`*Card`, `*Template`): props만 받음, 훅은 `useMemo`까지, **API 호출 금지**.

### 새 컴포넌트 어디에?
범용 폼입력→`common/` · 전역레이아웃→`shared/` · 관리자기능→`admin/`+`*Section` · 마이기능→`user/`+`*Section` · 리스트카드→도메인폴더+`*Card` · 인증가드→`auth/`+`Require*` · 페이지래퍼→라우트명+`*PageClient`.

---

## 6. UI / 스타일

> 디자인 토큰·타이포·스페이싱 **상세 규칙은 `STYLE_GUIDE.md`가 정본**. 여기선 요약만.

- **Tailwind v4** — 설정은 `globals.css`의 `@theme`(별도 `tailwind.config` 없음).
- **색**: `bg-brand`(#95c674 올리브) · `text-gray-900`(#222) · `text-notice`(#ff4e4e) 등 토큰만. **HEX 하드코딩 금지.**
- **타이포**: `text-h1/h2/h3/body-sm/caption` 유틸(clamp 반응형). `text-3xl` 같은 원시 사이즈 직접 X.
- **여백**: `container-x`(좌우), `section-y`(섹션). `px-[9.375%]` 식 하드코딩 X.
- **폰트**: Pretendard. **조건부 class는 `cn()`**.
- 토큰 바꿀 일 → `globals.css` 한 곳만 수정.

---

## 7. PR / 협업

- **브랜치**: `feat/이슈번호` · `fix/...` · `chore/...`. base는 `develop`.
- **PR 전 체크**: `npm run build` ✅ + `npm run lint`(0 errors) ✅ + 본인이 코드 설명 가능 ✅.
- **PR 본문 3줄**(무엇/왜/테스트). 템플릿: `.github/PULL_REQUEST_TEMPLATE.md`.
- **작게 쪼개기**: 663줄짜리 PR은 충돌·리뷰난이도 폭증. 기능 단위로 나눠 자주 머지하고 `develop` 자주 rebase.
- 머지된 이슈는 닫기.

---

## 8. AI 사용 가이드

AI(Claude/ChatGPT)로 코드 짤 때:
1. **이 문서 + 비슷한 기존 파일**을 컨텍스트로 준다. ("이 레포 컨벤션과 `study.api.ts`처럼 짜줘")
2. 생성물 그대로 붙이지 말고 **읽고 이해 → 컨벤션 위반(any/하드코딩/과한 주석) 정리**.
3. **`npm run build` 돌려보고** PR.
4. PR에 "왜 이렇게 했는지" 직접 쓸 수 있는지 = 이해 체크.

