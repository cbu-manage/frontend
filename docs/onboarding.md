# 멘티 온보딩 가이드

처음 들어온 멘티가 **이 문서만 보고 작업 시작**할 수 있게 한 가이드.
더 자세한 규칙은 [CLAUDE.md](../CLAUDE.md) + `docs/` 참고.

---

## 1. 처음 셋업

```bash
# 1) 최신 develop으로 맞추기 (⚠️ 히스토리 정리가 있었어서 그냥 pull 말고 reset)
git fetch origin
git checkout develop
git reset --hard origin/develop

# 2) 환경변수 — 루트에 .env.local 직접 생성 (gitignore라 레포에 없음)
#    BACKEND_URL=https://<백엔드 호스트>   ← 리드에게 값 확인
echo "BACKEND_URL=https://dev.tukcbu.com" > .env.local

# 3) 설치 & 실행 (로컬은 http://localhost:2000)
npm install
npm run dev
```
> `NEXT_PUBLIC_API_URL`은 넣지 않는다 → 자동으로 `/api/v1` BFF 경유. ([api.md](./api.md))

---

## 2. 작업 흐름

```bash
git switch develop && git pull        # 최신화
git switch -c feat/<이슈번호>          # 브랜치 (feat/fix/chore/refactor)
# ... 작업 ...
npm run build && npm run lint          # ⭐ PR 전 반드시 통과
git add -p && git commit -m "feat: ..."  # 커밋 컨벤션은 contributing.md
git push -u origin feat/<이슈번호>
gh pr create --base develop            # PR은 항상 develop으로
```

**PR 본문 3줄**: ① 무엇을 ② 왜 이 방식 ③ 어떻게 테스트했는지.
- `main`엔 직접 못 올린다(보호됨). 배포는 리드가 develop→main으로.
- 머지된 이슈는 닫기.

---

## 3. 어디에 뭘 두나 → 문서 링크

| 궁금한 것 | 문서 |
|---|---|
| 폴더 구조·새 파일 위치·의존 규칙 | [architecture.md](./architecture.md) |
| 서버 통신·API 함수·React Query | [api.md](./api.md) |
| 컴포넌트 폴더·Section 패턴·분할 | [components.md](./components.md) |
| 색·타이포·간격 토큰 | [styling.md](./styling.md) |
| 브랜치·커밋·PR·리뷰 규칙 | [contributing.md](./contributing.md) |

---

## 4. 자주 쓰는 패턴 (복붙용)

**API 호출** — 훅으로 감싸서 컴포넌트는 데이터만 받음
```tsx
// hooks/<도메인>/useXxx.ts
const { data, isLoading, isError } = useQuery({
  queryKey: ["studies", page],
  queryFn: async () => (await studyApi.getList({ page })).data.data,
});
```
- API는 `@/api`에서만 import. 경로에 `/api/v1` 안 붙임.
- **401은 신경 X** — 인터셉터가 자동 refresh/재시도.

**본인 게시물 수정/삭제 버튼**
```tsx
import { useIsAuthor } from "@/hooks/auth";
const { canModify } = useIsAuthor(post.authorId, post.isAuthor);
{canModify && <EditDeleteButtons />}
```

**로그인 사용자 정보**
```tsx
const name = useUserStore((s) => s.name);     // 필요한 필드만 셀렉터로
const isAdmin = useUserStore((s) => s.isAdmin);
```

**스타일** — 토큰만, 하드코딩 X
```tsx
<h1 className="text-h1 text-gray-900">제목</h1>
<button className="bg-brand text-white rounded-lg ...">버튼</button>
<main className="container-x section-y">...</main>
// 조건부 class는 cn()
import { cn } from "@/lib/utils";
<div className={cn("base", isActive && "text-brand")} />
```

---

## 5. 하지 말 것 ❌

- **이해 못 한 코드 커밋** (AI가 짠 것도 본인이 설명 가능해야 PR)
- **빌드 안 돌려본 PR** (`npm run build` 필수)
- **하드코딩**: HEX 색(`#xxx`), 원시 사이즈(`text-3xl`), 백엔드 URL → 전부 토큰/env
- **`any` 타입** (느슨하면 `unknown` + 체크)
- **`main`에 직접 PR/머지**, **`.env*` 커밋**

---

## 6. AI(Claude/ChatGPT) 쓸 때

[CLAUDE.md](../CLAUDE.md) + 비슷한 기존 파일을 컨텍스트로 주고 "이 컨벤션대로" 지시 → 생성물은 **읽고 이해 → 위반 정리 → 빌드** 후 PR. (Claude Code는 CLAUDE.md 자동 로드)

---

막히면 리드(@ming0o)에게! 🦉
