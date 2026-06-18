# 공통 자산 카탈로그 (갖다 쓰세요)

새로 만들기 전에 **여기 있는지 먼저 확인**. 있으면 import해서 쓰고, 없으면 [components.md](./components.md) 규칙대로 추가.

---

## 🪝 범용 훅 (`@/hooks`)

| 훅 | 뭐냐 / 언제 | 예시 |
|---|---|---|
| `useDisclosure` | 열림/닫힘 상태. **모달·드롭다운·아코디언** | `const m = useDisclosure(); m.open(); {m.isOpen && ...}` |
| `useDebounce` | 값이 멈춘 뒤 반영. **검색 입력** | `const q = useDebounce(keyword, 300)` |
| `useClickOutside` | 바깥 클릭 감지. **드롭다운·팝오버 닫기** | `const ref = useClickOutside(() => setOpen(false))` |
| `useIsAuthor` | 내 글인지 판별. **수정/삭제 버튼** | `const { canModify } = useIsAuthor(post.authorId, post.isAuthor)` |
| `useMe` | 로그인 사용자(/me) 조회 + store hydrate | `const { data } = useMe()` |

```tsx
import { useDisclosure, useDebounce, useClickOutside } from "@/hooks";
```

> 도메인 데이터 훅(`useStudyList`, `useProjectList`, `useResourceList`…)도 `@/hooks`에 있음 — 목록/조회는 새로 만들지 말고 패턴 따라 추가. ([api.md](./api.md))

---

## 🧰 유틸 (`@/lib`)

| 유틸 | 뭐냐 | 예시 |
|---|---|---|
| `cn` | 조건부 className 합성(clsx+tw-merge) | `cn("base", isActive && "text-brand")` |
| `formatDate` | 날짜 포맷(서버 ISO→문자열) | `formatDate(post.createdAt)` → `2026.06.18` |
| `formatRelativeTime` | 상대 시간 | `formatRelativeTime(post.createdAt)` → `3시간 전` |

```tsx
import { cn } from "@/lib/utils";
import { formatDate, formatRelativeTime } from "@/lib/date";
```

---

## 🧱 공통 컴포넌트 (`@/components`)

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| `StatusBadge` | common | 모집/해결 상태 배지(success/danger). 상태색 HEX 하드코딩 금지, 이거 써라 |
| `Tag` | common | 카테고리·포지션 칩(gray/brand) |
| `InputBox` | common | 폼 입력(라벨·에러·success) |
| `LongBtn` / `ShortBtn` / `OutlineBtn` | common | 버튼 변형 |
| `Toggle` | common | 토글 스위치 |
| `MultiSelect` | common | 다중 선택 |
| `LoadingSpinner` | common | 로딩 표시 |
| `ErrorFallback` | common | 에러 화면 |
| `Calendar` | common | 날짜 선택 |
| `Header` / `Footer` / `Sidebar` / `Pagination` | shared | 전역 레이아웃 |
| `Button` | ui | shadcn 프리미티브 |
| `RequireMember` / `RequireAdmin` | auth | 페이지 접근 가드 |

> 🎨 Figma 디자인 시스템 추출 진행 중 — 전체 매핑·진행 상황은 [design-system.md](./design-system.md).
> Storybook으로 실물 확인: `npm run storybook`. 버튼/칩/모달 등 추가 추출 시 중복 만들지 말고 그쪽 먼저.

---

## 원칙
- **새로 만들기 전에 이 표 확인** → 있으면 재사용.
- 색·사이즈는 토큰([styling.md](./styling.md)), API는 `@/api`+훅([api.md](./api.md)).
- 새 공통 자산 추가하면 **이 문서에도 한 줄 추가**.
