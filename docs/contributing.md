# Contributing — 브랜치 · 커밋 · PR · 리뷰 규칙

> 멘티 PR 스타일을 통일해 리뷰 비용을 줄이는 최소 규칙.
> 관련: [architecture.md](./architecture.md) · [components.md](./components.md) · [styling.md](./styling.md)

---

## 0. 황금 규칙

1. **이해 못 한 코드는 커밋하지 않는다.** AI가 짜줬어도 본인이 설명할 수 있어야 PR.
2. **PR 전 반드시 로컬 `npm run build` 통과 확인.** 빌드 안 돌려본 코드는 리뷰 대상 아님.
3. **PR 본문 3줄**: ① 무엇을 ② 왜 이 방식으로 ③ 어떻게 테스트했는지.
4. **기존 코드 패턴을 먼저 따른다.** 새 방식 도입 전 리드와 상의.
5. **하드코딩 금지** — 색/사이즈는 토큰([styling.md](./styling.md)), 백엔드 주소는 env(`BACKEND_URL`).

---

## 1. 브랜치 네이밍

`<타입>/<이슈번호>` 형태, base는 **`develop`**.

| 타입 | 용도 | 예 |
|---|---|---|
| `feat/` | 기능 | `feat/115` |
| `fix/` | 버그 수정 | `fix/174` |
| `refactor/` | 리팩터 | `refactor/104` |
| `chore/` | 설정·문서·잡일 | `chore/99` |
| `hotfix/` | 운영 긴급 패치 | `hotfix/2` |

---

## 2. 커밋 메시지

`<prefix>: <한글 요약>` — prefix는 `feat / fix / refactor / chore / docs / style / test`.

```
feat: 모임 참석 투표 UI 구현
fix: /report useSearchParams Suspense 경계 추가
docs: API 레이어 컨벤션 문서 추가
```
- 제목은 명령형/요약형 한 줄. 본문이 필요하면 빈 줄 후 "왜"를 적는다.
- 한 커밋엔 한 가지 관심사만.

---

## 3. PR

- **제목**: `[Feat] ...`, `[Fix] ...`, `[Refactor] ...` (기존 컨벤션 유지).
- **본문**: `.github/PULL_REQUEST_TEMPLATE.md` 사용. 최소 **무엇/왜/테스트 3줄**.
- **크기**: 작게. 663줄짜리 같은 PR은 충돌·리뷰난이도 폭증 → 기능 단위로 쪼개고 `develop` 자주 rebase.
- **WIP**: 작업 중이면 **Draft PR**로 올린다(리뷰 요청 아님). 끝나면 Ready 전환.

### PR 전 체크리스트
- [ ] `npm run build` 통과
- [ ] `npm run lint` 0 errors
- [ ] 변경 코드를 내가 설명할 수 있다(AI 생성분 포함)
- [ ] 본문 무엇/왜/테스트 3줄 작성
- [ ] 컨벤션 위반(any·하드코딩·과한 주석) 정리

---

## 4. 리뷰 & 머지

- **리뷰어**: 멘토(리드) 지정. assignee = 작업자 본인.
- **머지 기준**:
  - CodeRabbit / Vercel 등 체크 **전부 통과(초록불)**
  - 멘토 **승인 1회 이상**
  - 충돌 없음(있으면 작업자가 `develop` rebase로 해소)
- **머지 방식**: Squash merge 권장(히스토리 깔끔). 머지 후 **연결된 이슈 닫기**.

---

## 5. AI 사용 시

1. **이 레포 컨벤션 + 비슷한 기존 파일**을 컨텍스트로 준다. (예: "`study.api.ts`처럼 짜줘")
2. 생성물 그대로 붙이지 말고 **읽고 이해 → 위반 정리**.
3. `npm run build` 돌려보고 PR.
4. "왜 이렇게 했는지" 직접 쓸 수 있는지 = 이해 체크.
