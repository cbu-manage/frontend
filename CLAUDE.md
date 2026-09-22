# CBU Frontend — 가이드 인덱스 / AI 컨벤션

> 한국공학대 씨부엉(CBU) 동아리 관리 웹. 이 문서는 **사람용 가이드 인덱스이자 AI 입력**이다.
> Claude Code는 이 파일을 자동으로 읽는다. 작업 전 아래 분야 문서 중 **관련된 것을 열어 보라.**
> 다른 AI(ChatGPT 등)를 쓸 땐 이 문서 + 관련 `docs/` 파일을 프롬프트에 붙이고 "이 컨벤션을 따르라"고 지시할 것.
> 목표: 누가/어떤 도구로 짜든 **하우스 스타일로 수렴** → 일관성↑, 충돌↓, 리뷰 쉬움.

**스택**: Next.js 16 (App Router) · React 19 · TypeScript(strict) · Zustand · TanStack Query v5 · axios · Tailwind v4 · shadcn/ui

---

## 🥇 황금 규칙 (제일 중요)

1. **이해 못 한 코드는 커밋하지 않는다.** AI가 짜줬어도 본인이 설명할 수 있어야 PR.
2. **PR 전 반드시 로컬 `npm run build` 통과 확인.** 빌드 안 돌려본 코드는 리뷰 대상 아님.
3. **PR 본문 3줄**: ① 무엇을 ② 왜 이 방식으로 ③ 어떻게 테스트했는지.
4. **기존 코드 패턴을 먼저 따른다.** 새 방식 도입 전 리드와 상의.
5. **하드코딩 금지** — 색/사이즈는 토큰, 백엔드 주소는 env(`BACKEND_URL`).

---

## 📚 분야별 문서 (`docs/`)

| 문서 | 언제 보나 |
|---|---|
| [docs/architecture.md](./docs/architecture.md) | 폴더 구조, 모듈 역할, **새 파일 어디 둘지**, 의존 방향 규칙 |
| [docs/api.md](./docs/api.md) | 서버 통신, `*.api.ts` 패턴, `ApiEnvelope`, BFF, React Query 훅 |
| [docs/components.md](./docs/components.md) | 컴포넌트 폴더 역할, **Section/PageClient 패턴**, `use client`, 분할 규칙 |
| [docs/styling.md](./docs/styling.md) | 디자인 토큰(색·타이포·스페이싱), Tailwind v4, 작성 규칙 |
| [docs/contributing.md](./docs/contributing.md) | 브랜치·커밋·PR·리뷰·머지 규칙 |

---

## ⚡ 30초 요약

- **통신**: 컴포넌트 → `hooks/useXxx` → `@/api` → BFF → `BACKEND_URL`. 401은 인터셉터가 처리. → [api.md](./docs/api.md)
- **의존**: `api ← hooks ← components`(단방향). → [architecture.md](./docs/architecture.md)
- **페이지**: `page.tsx`는 얇게, 탭/사이드바는 `*Section`으로 분할. → [components.md](./docs/components.md)
- **스타일**: 토큰만(`bg-brand`, `text-h1`, `container-x`), HEX·원시사이즈 하드코딩 X. → [styling.md](./docs/styling.md)
- **TS**: `type` 기본(컴포넌트 props만 `interface`), `any` 금지.
- **PR**: `feat/이슈번호` 브랜치 → 빌드/lint 통과 → 본문 3줄 → 멘토 승인 → squash. → [contributing.md](./docs/contributing.md)
