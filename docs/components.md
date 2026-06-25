# 컴포넌트 — 폴더 역할 · 분할 규칙

> 관련: [architecture.md](./architecture.md) · [api.md](./api.md) · [styling.md](./styling.md)

---

## 1. 폴더별 역할

| 폴더 | 무엇이 들어가나 |
|---|---|
| `ui/` | shadcn 프리미티브(**Button**, Calendar). **디자인 토큰만**, 앱 로직 없음. 버튼은 여기 `Button(variant)` 하나만 — common에 새 버튼 만들지 말 것 |
| `common/` | 앱 공용 UI 킷 — InputBox·SearchBar·MultiSelect·Tabs·Chip·Modal·Card·Mascot·Toggle·StatusBadge·Tag·LoadingSpinner·ErrorFallback. ui/와 차이: **앱 스타일+동작 있음**. 새 UI는 직접 만들기 전 여기부터 확인 |
| `shared/` | 전역 레이아웃(Header, Footer, Sidebar, Pagination). 2+페이지에서 쓰는 것 |
| `providers/` | 전역 프로바이더(QueryProvider 등) |
| `auth/` | 라우트 가드(`RequireMember`, `RequireAdmin`) |
| `admin/` · `user/` | 관리자/마이 페이지의 **Section 컴포넌트** + `*PageClient` |
| `apply/` · `signup/` | 가입/신청 폼 필드·스텝 |
| `project/` · `study/` · `coding-test/` · `archive/` | 도메인 리스트 카드/행(`*Card`, `*Row`) |
| `detail/` | 상세 페이지 템플릿(`DetailTemplate`, `CommentSection`) |
| `icons/` | 재사용 SVG 아이콘 컴포넌트 |

**ui vs common vs shared**: `ui/`=토큰만의 원시 프리미티브 / `common/`=앱 스타일·동작 있는 재사용 컨트롤 / `shared/`=페이지 가로지르는 레이아웃 셸.

---

## 2. Section / PageClient 패턴 (핵심)

사이드바·탭 있는 페이지는 이렇게 쪼갠다:

```
app/manage/page.tsx        ← 얇음. 인증가드 + PageClient만
  └ RequireAdmin
     └ AdminPageClient ("use client")        ← 탭 state 관리
        ├ MemberManageSection ("use client") ← 독립 미니페이지(자체 훅/쿼리/폼)
        ├ GroupManageSection
        └ ...
```

**언제 Section으로 쪼개나**
1. 페이지에 탭/사이드바(상호배타 뷰)가 있다
2. 한 뷰가 100줄+ 자체 로직(쿼리·폼)을 가진다
3. Section은 props 없이 **독립**(자기 데이터는 자기가 가져옴)

---

## 3. `"use client"` 위치

- **인터랙션이 시작되는 최소 컴포넌트**에 둔다(트리 깊숙이 박지 말 것).
- `*PageClient`, `*Section`, 폼 필드, Header/Sidebar = `"use client"`.
- 순수 표시용 카드(`ProjectCard` 등) = 가능하면 서버 컴포넌트로 둔다.

---

## 4. container vs presentational

| | 컨테이너 | 프레젠테이셔널 |
|---|---|---|
| 예 | `*PageClient`, `*Section` | `*Card`, `*Template`, `*Row` |
| state·쿼리·이벤트 | 소유 | ❌ 없음 |
| API 호출 | O | **❌ 금지** |
| props | 적게 | 데이터 전부 props로 받음 |
| 훅 | useQuery 등 | useMemo 정도까지 |

---

## 5. 네이밍

| 패턴 | 예 | 용도 |
|---|---|---|
| `*Section.tsx` | `MemberManageSection` | 탭/사이드바 뷰 슬라이스(state·훅·레이아웃) |
| `*PageClient.tsx` | `AdminPageClient` | 클라 페이지 래퍼(탭/state 관리) |
| `*Card.tsx` / `*Row.tsx` | `StudyCard` | 리스트 아이템 표시 |
| `*Modal.tsx` | `ApplicantsModal` | 모달 |
| `*Template.tsx` | `DetailTemplate` | 레이아웃 템플릿 |
| `*Field.tsx` / `*Group.tsx` | `EmailVerificationField` | 복합 폼 필드 / 라디오·체크 그룹 |
| `Require*.tsx` | `RequireMember` | 인증 가드 |
| PascalCase(접미사 X) | `Header`, `Pagination` | 범용 레이아웃 |

- 단일 컴포넌트 파일은 `export default`, 타입/서브는 named export.
- props 타입은 컴포넌트 옆에 `XxxProps`로 정의.

---

## 6. 본인 게시물 수정/삭제 버튼 — `useIsAuthor`

게시판 어디서든 "내 글일 때만 수정/삭제"는 **`useIsAuthor` 훅**으로 통일한다 (직접 `userId` 비교 X).

```tsx
import { useIsAuthor } from "@/hooks/auth";

const { canModify } = useIsAuthor(post.authorId, post.isAuthor);
// ...
{canModify && <EditDeleteButtons />}
```
- 서버가 `isAuthor`를 주면(study/codingTest 등) 그걸 우선, 없으면 내 `userId === authorId` 비교.
- `canModify` = 본인 || 관리자(isAdmin).
- ⚠️ **UI 게이팅일 뿐** — 실제 권한은 서버가 401/200으로 최종 판정. 버튼 숨겼다고 끝 아님.

## 7. 새 컴포넌트 어디에?

범용 폼입력 → `common/` · 전역 레이아웃 → `shared/` · 관리자 기능 → `admin/` + `*Section` · 마이 기능 → `user/` + `*Section` · 리스트 카드 → 도메인 폴더 + `*Card` · 인증 가드 → `auth/` + `Require*` · 멀티스텝 폼 → `signup/` + `Step*` · 페이지 래퍼 → 라우트명 + `*PageClient` · SVG 아이콘 → `icons/`.
