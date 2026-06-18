# 디자인 시스템 인벤토리 (Figma → 코드)

> Figma "Component" 페이지(393개 컴포넌트)를 코드 공통 컴포넌트로 1차 정리한 문서.
> Storybook(`design/storybook-components` 브랜치)에서 실물 확인 → 머지 후 점진 이식.
>
> - ✅ **추출 완료** (코드 + Storybook 스토리 있음)
> - 🟡 **기존 컴포넌트** (이미 있음 / 스토리만 추가)
> - 📋 **스펙만** (다음 차수에 추출 예정)

실행: `npm run storybook` (포트 6006). 정적 빌드: `npm run build-storybook`.

---

## 디자인 토큰 (globals.css `@theme inline`)

Figma 색상은 이미 토큰화돼 있음. 신규로 상태색 2개 추가.

| 토큰 | 값 | 용도 (Figma) |
|---|---|---|
| `gray-0` | `#ffffff` | 배경/카드 |
| `gray-50` | `#f5f6f8` | 인풋·칩 배경 |
| `gray-100` | `#eeeff3` | 토글 트랙·태그 배경 |
| `gray-200` | `#e3e7ed` | 테두리·disabled |
| `gray-300` | `#c7cbd1` | disabled 텍스트 |
| `gray-500/600` | `#a3a8b0`/`#959aa3` | 보조 텍스트·플레이스홀더 |
| `gray-900` | `#222222` | 본문 텍스트 |
| `brand` | `#95c674` | 포인트 |
| `notice` | `#ff4e4e` | 인풋 에러 |
| **`success`** 🆕 | `#45cd89` | 모집 중·해결 배지 |
| **`danger`** 🆕 | `#fc5e6e` | 모집 완료·미해결 배지 |

> Tag_Round 팔레트(category color)는 토큰 미등록 — CategoryTag 추출 시 함께 추가 예정:
> green `#deffdd`/`#3dc344`, red `#ffdddd`/`#df5050`, gray `#eeeff3`/`#54585e` (+ yellow·mint·sky·blue·purple·violet·pink·rose·orange).

---

## Atoms (원자)

| 컴포넌트 | 상태 | Figma | 메모 |
|---|---|---|---|
| **StatusBadge** | ✅ | `Tag_모집` | success/danger · sm/lg. 카드 4종 + DetailTemplate에서 사용 |
| **Tag** | ✅ | `chip` | gray/brand. 카드 카테고리·포지션 태그 |
| **InputBox** | 🟡 | `input box_type 2` | default/focus/filled/error/disabled/success + inset label |
| **Toggle** | 🟡 | `toggle` | 세그먼트형(모집중/완료) |
| **LongBtn/ShortBtn/OutlineBtn** | 🟡 | `button`/`button2`/`버튼 2` | ⚠️ Figma에 버튼 세트 3개 혼재 → **Button 단일화 필요** (solid/ghost × default/hover/disabled, radius 12) |
| **CategoryTag** | 📋 | `Tag_Round` | 13색 × M/L 컬러 태그. 소식/네트워킹 카테고리용 |
| **Chip (full)** | 📋 | `chip` | 16px·아이콘 슬롯 버전 (Tag는 카드용 축소판) |
| **ComboBox/Select** | 📋 | `Input / ComboBox` | default/click/select/finish 상태 |
| **SearchBar** | 📋 | `search bar` | focus/type + 검색기록 팝업 |
| **Switch** | 📋 | `Toggle`(2974:11708) | on/off 스위치 (세그먼트 Toggle과 별개) |
| **Icon set** | 📋 | `icon`/`icon_round` | search/x/eye/arrow/download/check… |
| **DownloadBtn** | 📋 | `다운버튼`/`자동 추출 버튼` | 보고서 다운/추출 |

## Molecules (분자)

| 컴포넌트 | 상태 | Figma | 메모 |
|---|---|---|---|
| **StudyCard** | 🟡 | — | StatusBadge·Tag 적용 완료 |
| **ProjectCard / ProjectRow** | 🟡 | — | StatusBadge·Tag 적용 완료 |
| **Tabs** | 📋 | `Tabs`(2세트) | 소식(Notice/Event/Newsletter/IT News)·게시판(Daily/Question/Chat/Promotion) |
| **EventCard** | 📋 | `Card` | location/Date/모임/모집완료 (네트워킹) |
| **VoteCard** | 📋 | `vote/card` | 투표 카드 |
| **FileUpload** | 📋 | `보고서 파일 업로드` | default/upload |
| **AttendanceResponse** | 📋 | `참석 응답` | 참석/최종참석 |
| **Mascot** | 📋 | `Mascot` | basic/working/sad/love × s/M/L |
| **AdminStatusChip** | 📋 | `그룹 관리` | 활동중/대기중/정지 |

## Organisms (유기체)

| 컴포넌트 | 상태 | Figma | 메모 |
|---|---|---|---|
| **Header** | 🟡 | `header` | 기존 shared/Header. Figma는 focused×dropdown×login×mode×admin 매트릭스 |
| **NavigationItem / nav-Sub** | 📋 | `Navigation Item` | 헤더 카테고리·서브내비 |
| **Modal** | 📋 | `모달`/`팝` | popup_Title/Subtitle. BaseModal로 단일화 |
| **LoginForm** | 📋 | `로그인` | 로그아웃/로그인 |
| **ApplyForm** | 📋 | `신청서 작성` | |
| **AdminPageNav** | 📋 | `관리자 페이지 목록` | 회원/그룹/보고서/신청서 |

---

## 작업 순서 (제안)

1. ✅ StatusBadge·Tag + 상태색 토큰 (이번 차수)
2. ✅ Storybook 셋업 + 기존 컴포넌트 스토리(Button·Input·Toggle·카드)
3. 📋 **Button 단일화** — 혼재된 3세트를 `Button(variant, size, state)`로
4. 📋 CategoryTag + 컬러 토큰
5. 📋 ComboBox/Select·SearchBar (폼·검색 페이지)
6. 📋 Tabs·Modal (소식/게시판·공통 모달)
7. 📋 나머지 (EventCard·VoteCard·Mascot·admin…)
