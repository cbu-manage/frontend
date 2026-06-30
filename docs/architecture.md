# Architecture — 폴더 구조 & 모듈 가이드

> 신규 멘티가 이 문서만 보고 **새 파일을 어디에 둘지 혼자 판단**할 수 있는 게 목표.
> 관련: [contributing.md](./contributing.md) · [api.md](./api.md) · [components.md](./components.md) · [styling.md](./styling.md)

**스택**: Next.js 16 (App Router) · React 19 · TypeScript(strict) · Zustand · TanStack Query v5 · axios · Tailwind v4 · shadcn/ui

---

## 폴더 구조

```
src/
├── app/            # 라우트 (App Router). page.tsx는 얇게 — 컴포넌트에 위임
│   ├── api/v1/[...path]/route.ts   # BFF 프록시 (백엔드로 중계) → api.md
│   ├── layout.tsx  # 폰트(Pretendard)·providers·metadata·Header/Footer
│   ├── globals.css # Tailwind v4 @theme: 색·타이포·스페이싱 토큰 (tailwind.config 없음)
│   └── error.tsx, global-error.tsx # 전역 에러 바운더리
├── api/            # 서버 통신 레이어 (*.api.ts + client.ts) → api.md
├── hooks/          # TanStack Query 래핑 + 폼/인증 커스텀 훅 (도메인별 폴더)
├── store/          # Zustand 전역 상태
├── components/     # UI 컴포넌트 (도메인/역할별 폴더) → components.md
├── lib/            # 순수 유틸 (utils.ts = cn())
└── styles/         # 색 팔레트 등 보조 스타일 상수
```

---

## 최상위 폴더 역할

| 폴더          | 역할                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `app/`        | Next.js 라우팅. 각 라우트의 `page.tsx`는 **얇게** 두고 인증가드 + `*PageClient`/`Section`에 위임. 데이터 패칭은 페이지에서 하지 않음 |
| `api/`        | 서버 통신. `client.ts`(axios+인터셉터) + 도메인별 `*.api.ts`. 앱은 `@/api` 배럴에서만 import                                         |
| `hooks/`      | 도메인별 폴더. TanStack Query 래핑 훅(서버 상태) + 폼/인증 로직 훅                                                                   |
| `store/`      | Zustand 전역 상태(`userStore` 등). 셀렉터로 필요한 필드만 구독                                                                       |
| `components/` | UI. 역할/도메인별 폴더. ui/common/shared 구분 → components.md                                                                        |
| `lib/`        | 순수 유틸(`cn()` 등). 부수효과 없는 함수만                                                                                           |
| `styles/`     | 색 팔레트 등 보조 상수. 토큰 정본은 `globals.css`                                                                                    |

### `src/store` 상세

| 스토어                   | 역할                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `userStore.ts`           | 인증/프로필 상태 + `localStorage` persist(SSR-safe 스냅샷). 액션: `setUser/setAuthStatus/updateEmail/clearUser` |
| `codingTestMetaStore.ts` | 코테 필터 메타(플랫폼/언어/카테고리)                                                                            |

사용: `useUserStore((s) => s.name)`처럼 **셀렉터로 필요한 필드만** 구독(전체 구독 금지 — 불필요 리렌더).

---

## 🔑 의존 방향 규칙 (단방향)

```
api  ←  hooks  ←  components / app
                ↘  store (hooks·components에서 구독)
```

- `api/`는 **아무것도 위로 import 하지 않는다**(순수 통신).
- `hooks/`는 `api/`·`store/`를 쓴다. 컴포넌트를 import 하지 않는다.
- `components/`·`app/`은 `hooks/`(또는 `api/`)·`store/`를 쓴다.
- **역방향 금지**: api가 hooks를, hooks가 components를 import하면 안 됨.
- `lib/`는 어디서나 쓰는 순수 의존(역방향 없음).

---

## 새 파일 어디에 둘까

| 만들 것      | 위치                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| 새 페이지    | `app/<route>/page.tsx` (얇게) + 필요시 `components/<도메인>/<X>PageClient.tsx` |
| 도메인 API   | `api/<도메인>.api.ts` + `api/index.ts`에 배럴 추가 → [api.md](./api.md)        |
| 서버 상태 훅 | `hooks/<도메인>/useXxx.ts`                                                     |
| 전역 상태    | `store/xxxStore.ts`                                                            |
| 컴포넌트     | 역할에 따라 `components/...` → [components.md](./components.md)                |
| 순수 유틸    | `lib/`                                                                         |

> 애매하면 "이게 통신인가(api) / 상태·로직인가(hooks·store) / 보이는 것인가(components)"로 판단.

---

## 상태 관리 — 무엇을 어디에 둘까

상태 라이브러리는 **2종**만 쓴다. (Jotai는 미사용 → 제거됨)

| 종류                        | 도구                   | 예시                                                                                                   |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------ |
| **서버 상태** (서버가 정본) | **TanStack Query**     | 게시글 목록/상세, 뮤테이션, 사용자 정보 패칭. `hooks/<도메인>/useXxx.ts`로 래핑                        |
| **전역 클라이언트 상태**    | **Zustand** (`store/`) | 로그인 사용자 신원(`userStore`), 화면 간 공유 메타(`codingTestMetaStore`). 셀렉터로 필요한 필드만 구독 |
| **로컬 UI 상태**            | `useState`             | 모달 열림, 입력값, 탭 선택 등 한 컴포넌트 안에서만 쓰는 것                                             |

판단 기준:

- 서버에서 온/서버가 정본인 데이터 → **React Query** (store에 복사 금지 = 중복 상태 원인)
- 여러 화면이 공유하는 클라 상태 → **Zustand store**
- 한 컴포넌트 안에서만 → **useState**

> ⚠️ 같은 값을 React Query와 store 양쪽에 두지 않는다. 서버 데이터는 React Query가 정본, store엔 식별자/파생 플래그(예: `userId`·`role`)만.
