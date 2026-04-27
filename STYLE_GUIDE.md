# 스타일 가이드

반응형 타이포/스페이싱 토큰과 시맨틱 유틸리티 클래스 사용 규칙.

- 정의 위치: `src/app/globals.css`
- 기본 원칙: **Mobile-first + clamp 기반 유동 스케일**. breakpoint 없이 360~1440px 구간에서 부드럽게 증감.
- 값을 하드코딩하지 말고 유틸 클래스를 쓸 것. 토큰 바꿔야 할 일이 생기면 `globals.css` 한 곳만 수정.

---

## 1. 타이포 토큰

| 토큰 | 모바일(360px) | 데스크탑(1440px+) | 용도 |
|---|---|---|---|
| `--text-display` | 28px | 40px | 홈 hero·마케팅성 큰 타이틀 |
| `--text-h1` | 24px | 32px | 페이지 제목 |
| `--text-h2` | 20px | 24px | 섹션 제목 |
| `--text-h3` | 18px | 20px | 카드·블록 제목 |
| `--text-body` | 15px | 16px | 본문 (body 기본) |
| `--text-body-sm` | 13px | 14px | 보조 본문·메타 |
| `--text-xs` | 12px | 12px | 캡션·태그 (고정) |

line-height 토큰: `--leading-tight (1.2)`, `--leading-snug (1.35)`, `--leading-normal (1.5)`, `--leading-relaxed (1.65)`.

### 유틸 클래스

```tsx
<h1 className="text-h1">페이지 제목</h1>
<h2 className="text-h2">섹션 제목</h2>
<h3 className="text-h3 font-bold">카드 제목</h3>
<p>본문은 body 기본값 자동 적용 (별도 클래스 불필요)</p>
<p className="text-body-sm">보조 설명</p>
<span className="text-caption">2025.04.19 · 34기</span>
```

각 유틸은 `font-size + line-height`와 필요한 경우 `font-weight`, `letter-spacing`까지 포함. `font-bold`/`font-semibold` 등을 덧붙여 override 가능.

### 교체 매핑 (기존 → 신규)

| 기존 클래스 | 신규 유틸 |
|---|---|
| `text-2xl sm:text-3xl font-bold` (페이지 제목) | `text-h1` |
| `text-2xl md:text-3xl font-bold` | `text-h1` |
| `text-3xl font-bold` (상세 제목) | `text-h1` |
| `text-4xl font-bold` (큰 페이지 제목) | `text-h1` 또는 `text-display` |
| `text-base sm:text-lg font-bold` (카드 제목) | `text-h3 font-bold` |
| `text-xs sm:text-sm` | `text-body-sm` 또는 그대로 |
| `text-xs` (태그·뱃지) | `text-caption` |

---

## 2. 레이아웃/스페이싱 토큰

| 토큰 | 모바일 | 데스크탑 | 설명 |
|---|---|---|---|
| `--container-px` | 16px | 150px (≈9.375%) | 페이지 좌우 여백 |
| `--section-gap` | 32px | 64px | 섹션 사이 세로 간격 |
| `--block-gap` | 16px | 24px | 블록 내부 간격 |
| `--card-radius` | 12px | 16px | 카드 라운딩 |
| `--touch-min` | 44px | 44px | 터치 타겟 최소 크기 (고정) |

### 유틸 클래스

```tsx
<main className="container-x">  {/* 좌우 여백 자동 스케일 */}
<section className="section-y"> {/* 섹션 상하 간격 */}
<button className="touch-target"> {/* 모바일 터치 타겟 확보 */}
```

### 교체 매핑

| 기존 | 신규 |
|---|---|
| `px-[9.375%]` | `container-x` |
| `px-[15%]` | `container-x` |
| `px-4 sm:px-6 md:px-[9.375%]` | `container-x` |

---

## 3. Breakpoint

Tailwind 기본값 그대로 사용. 추가 정의 없음.

| prefix | 최소 폭 | 주 용도 |
|---|---|---|
| (base) | 0px | 모바일 |
| `sm:` | 640px | 큰 폰·소형 태블릿 |
| `md:` | 768px | 태블릿 |
| `lg:` | 1024px | 데스크탑 (현재 기본 디자인 대상) |
| `xl:` | 1280px | 넓은 데스크탑 |

**최소 지원 폭**: 360px. 이 이하에서 깨지는 건 허용하지 않음.

---

## 4. 새 컴포넌트·페이지 작성 규칙

1. **페이지 제목** → `text-h1`. `text-3xl` 이런 식으로 Tailwind 원시 사이즈 직접 쓰지 말 것.
2. **본문** → 기본값으로 OK. `text-base` 명시 불필요.
3. **컨테이너 좌우 패딩** → `container-x`. 하드코딩한 `px-[...%]` 금지.
4. **버튼/링크 터치 영역** → 모바일에서 최소 44×44px 확보 (`py-3 px-4` 조합 or `touch-target`).
5. **색상** → `text-gray-900`, `bg-brand` 등 기존 토큰 사용. 하드코딩 HEX 금지.
6. **디자인 토큰 바꿀 일** → `globals.css` `@theme inline` 블록 안에서만 수정. 컴포넌트에서 직접 값 덮어쓰지 말 것.

---

## 5. 예외 케이스

- **홈페이지 hero / 마케팅성 섹션**: `text-display` 또는 디자인 의도에 맞게 Tailwind 원시 클래스(`text-5xl` 등) 허용. 단, 각주에 의도 주석 표기.
- **이메일·SNS 로고 정렬 등 고정 픽셀 UI**: `w-[24px]` 등 하드코딩 허용.
- **임시 실험 코드**: PR에서 제거될 전제면 허용. 머지 전 토큰으로 교체.

---

## 6. 토큰 값 조정

화면 확인 후 "모바일에서 H1이 너무 크다/작다" 같은 피드백이 있을 때:

```css
/* globals.css */
--text-h1: clamp(1.5rem, 1.1rem + 1.75vw, 2rem);
/*           ↑ 모바일 최소   ↑ 스케일 속도   ↑ 데스크탑 최대 */
```

- 모바일만 크게/작게: 첫 번째 값 조정
- 데스크탑만: 세 번째 값
- 스케일 기울기: 두 번째의 `vw` 계수
