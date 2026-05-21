---
version: alpha
name: janban-zero-design-system
description: 잔반제로는 식사 촬영, 잔반 리뷰, 보관 식재료, 레시피 추천을 연결하는 모바일 우선 PWA다. 브랜드는 식기와 채소 심볼을 중심으로 한 올리브-라임 계열을 사용하되, 운영형 앱답게 화면 구조는 조용하고 스캔 가능해야 한다. Primary, secondary, tertiary는 각각 #BDBB40, #9F9F30, #CDD474로 고정한다. 그 외 semantic token은 이 문서의 colors 및 darkColors 섹션을 기준으로 작성한다.

colors:
  primary: "#BDBB40"
  secondary: "#9F9F30"
  tertiary: "#CDD474"
  on-primary: "#272719"
  on-secondary: "#FFFFFF"
  on-tertiary: "#272719"
  brand-icon: "#BDBB40"
  brand-leaf: "#CDD474"

  background-base: "#FAFAFA"
  background-app: "#FAFAF1"
  background-raised: "#F4F4F5"
  background-overlay: "#FFFFFF"
  background-sunken: "#F4F4F5"

  surface-hover: "#E4E4E7"
  surface-active: "#D4D4D8"
  surface-disabled: "#F4F4F5"
  surface-brand-soft: "#F4F8DF"
  surface-warning-soft: "#FEF9C2"
  surface-danger-soft: "#FFE2E2"

  border-default: "#E4E4E7"
  border-strong: "#9F9FA9"
  border-brand: "#D8D67A"
  focus: "#BDBB40"

  content-default: "#09090B"
  content-brand: "#272719"
  content-muted: "#71717B"
  content-subtle: "#9F9FA9"
  content-inverse: "#FFFFFF"

  success: "#00C950"
  success-subtle: "#DCFCE7"
  error: "#FB2C36"
  error-subtle: "#FFE2E2"
  warning: "#F0B100"
  warning-subtle: "#FEF9C2"

darkColors:
  background-base: "#09090B"
  background-raised: "#18181B"
  background-overlay: "#18181B"
  background-sunken: "#000000"
  surface-hover: "#27272A"
  surface-active: "#3F3F47"
  surface-disabled: "#18181B"
  border-default: "#3F3F47"
  border-strong: "#52525C"
  content-default: "#FAFAFA"
  content-muted: "#9F9FA9"
  content-subtle: "#52525C"
  content-inverse: "#FFFFFF"
  accent-subtle: "#35530E"
  warning-subtle: "#432004"
  error-subtle: "#460809"

typography:
  display-xl:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: 0
  display-lg:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: 32px
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: 0
  title-lg:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: 22px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0
  title-md:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: 18px
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: 0
  title-sm:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: 0
  body-md:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  caption:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: 0
  button:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: 15px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 8px
  xl: 12px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  page-inline-mobile: 16px
  page-inline-desktop: 24px
  bottom-nav-safe-area: 88px

components:
  app-shell:
    backgroundColor: "{colors.background-app}"
    textColor: "{colors.content-brand}"
    maxWidthMobile: 520px
    maxWidthDesktop: 980px
  brand-lockup:
    logo: "/text.svg"
    fallbackIcon: "/icon.svg"
    width: 148px
    maxWidth: 44vw
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 48px
  button-secondary:
    backgroundColor: "{colors.background-overlay}"
    textColor: "{colors.content-brand}"
    borderColor: "{colors.border-brand}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 48px
  button-tertiary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 44px
  panel:
    backgroundColor: "{colors.background-overlay}"
    textColor: "{colors.content-brand}"
    borderColor: "{colors.border-default}"
    rounded: "{rounded.md}"
    padding: 16px
  metric-card:
    backgroundColor: "{colors.background-overlay}"
    textColor: "{colors.content-brand}"
    borderColor: "{colors.border-default}"
    rounded: "{rounded.md}"
    padding: 12px
  quick-action:
    backgroundColor: "{colors.background-overlay}"
    textColor: "{colors.content-brand}"
    borderColor: "{colors.border-default}"
    rounded: "{rounded.md}"
    minHeight: 104px
  camera-preview:
    backgroundColor: "{colors.content-brand}"
    textColor: "{colors.content-inverse}"
    aspectRatio: "4 / 3"
    rounded: "{rounded.md}"
  status-ready:
    backgroundColor: "{colors.surface-brand-soft}"
    borderColor: "{colors.primary}"
    textColor: "{colors.content-brand}"
  status-warning:
    backgroundColor: "{colors.warning-subtle}"
    borderColor: "{colors.warning}"
    textColor: "{colors.content-brand}"
  status-error:
    backgroundColor: "{colors.error-subtle}"
    borderColor: "{colors.error}"
    textColor: "{colors.content-brand}"
  bottom-nav:
    backgroundColor: "rgba(255,255,255,0.94)"
    textColor: "{colors.content-muted}"
    activeBackgroundColor: "{colors.surface-brand-soft}"
    activeTextColor: "{colors.content-brand}"
    borderColor: "{colors.border-default}"
    rounded: "{rounded.md}"
---

## Overview

잔반제로의 디자인 시스템은 **모바일 우선 운영 앱**이다. 사용자는 식판 또는 냉장고를 빠르게 촬영하고, 잔반 분석 결과를 확인하고, 보관 식재료와 레시피 추천을 반복해서 확인한다. 따라서 화면은 마케팅 랜딩보다 밀도 있고, 카드는 정보 단위별로 작고 명확해야 한다.

브랜딩은 `public/text.svg`를 앱 헤더의 기본 로고로 사용한다. 이 파일은 아이콘과 워드마크가 함께 들어간 완성형 로고다. `public/icon.svg`, `public/icon.png`는 favicon, PWA icon, service worker notification icon 같은 시스템 표면에서만 사용한다. 브랜드 색상은 아래 3개로 고정한다.

- **Primary**: `#BDBB40`
- **Secondary**: `#9F9F30`
- **Tertiary**: `#CDD474`

그 외 색상은 `temp/Light.tokens.json`, `temp/Dark.tokens.json`의 semantic token을 따른다. primitive palette가 필요한 경우 `temp/Mode 1.tokens.json`의 `neutral`, `stone`, `lime`, `yellow`, `green`, `red`, `orange` 계열을 사용한다.

## Principles

- **촬영 우선**: 홈의 첫 번째 실제 기능은 카메라 진입이다. 카메라 CTA는 항상 한 손 엄지 영역에 가까워야 한다.
- **상태 명확성**: 서비스 워커, 푸시, 카메라 상태는 `idle`, `checking`, `ready`, `active`, `blocked`, `unsupported`, `error`를 배지로 구분한다.
- **조용한 운영감**: 큰 장식, 마케팅식 hero, 과한 gradient는 쓰지 않는다. 식재료/잔반 데이터가 먼저 보여야 한다.
- **모바일 반복 사용**: 주요 메뉴는 bottom nav에 고정한다. 카드 radius는 8px 중심으로 유지해 도구 UI처럼 느껴지게 한다.
- **브랜드 사용 절제**: Primary는 CTA, active state, ready state, brand lockup 주변에만 쓴다. 화면 전체를 올리브색으로 채우지 않는다.

## Color System

### Brand

| Token | Value | Use |
|---|---:|---|
| `{colors.primary}` | `#BDBB40` | 주요 CTA, ready state border, 브랜드 강조 |
| `{colors.secondary}` | `#9F9F30` | active/pressed, 중요 수치 강조, 어두운 올리브 텍스트 |
| `{colors.tertiary}` | `#CDD474` | 보조 CTA, soft highlight, leaf accent |
| `{colors.on-primary}` | `#272719` | Primary 위 텍스트. 흰색보다 대비가 안정적이다. |

### Light Semantic Tokens

Light mode는 token 파일의 semantic 구조를 유지한다.

| Role | Token | Value |
|---|---|---:|
| Background | `{colors.background-base}` | `#FAFAFA` |
| Raised | `{colors.background-raised}` | `#F4F4F5` |
| Overlay | `{colors.background-overlay}` | `#FFFFFF` |
| Border | `{colors.border-default}` | `#E4E4E7` |
| Strong Border | `{colors.border-strong}` | `#9F9FA9` |
| Text | `{colors.content-default}` | `#09090B` |
| Muted Text | `{colors.content-muted}` | `#71717B` |
| Subtle Text | `{colors.content-subtle}` | `#9F9FA9` |

`{colors.background-app}`은 잔반제로 전용 warm canvas `#FAFAF1`로 둔다. 이는 `Mode 1`의 `stone.50`/`neutral.50` 계열을 브랜드에 맞게 약간 따뜻하게 변형한 값이다.

### Dark Semantic Tokens

Dark mode는 token 파일 값을 그대로 따른다.

| Role | Token | Value |
|---|---|---:|
| Background | `{darkColors.background-base}` | `#09090B` |
| Raised | `{darkColors.background-raised}` | `#18181B` |
| Overlay | `{darkColors.background-overlay}` | `#18181B` |
| Border | `{darkColors.border-default}` | `#3F3F47` |
| Strong Border | `{darkColors.border-strong}` | `#52525C` |
| Text | `{darkColors.content-default}` | `#FAFAFA` |
| Muted Text | `{darkColors.content-muted}` | `#9F9FA9` |

### Semantic Status

| Status | Solid | Subtle | Use |
|---|---:|---:|---|
| Success | `#00C950` | `#DCFCE7` | 분석 완료, 구독 완료 |
| Warning | `#F0B100` | `#FEF9C2` | 유통기한 임박, 검토 대기 |
| Error | `#FB2C36` | `#FFE2E2` | 권한 차단, 업로드 실패 |

## Typography

별도 brand font가 없으므로 system stack을 사용한다. 한글 UI에서는 글자폭과 렌더링 안정성이 더 중요하므로 letter-spacing은 0으로 고정한다.

| Token | Size | Weight | Line Height | Use |
|---|---:|---:|---:|---|
| `{typography.display-xl}` | 40px | 800 | 1.04 | 모바일 홈 hero |
| `{typography.display-lg}` | 32px | 800 | 1.08 | 큰 섹션 제목 |
| `{typography.title-lg}` | 22px | 800 | 1.2 | 패널 대표 제목 |
| `{typography.title-md}` | 18px | 800 | 1.25 | 카드 제목 |
| `{typography.title-sm}` | 16px | 700 | 1.35 | 리스트 row 제목 |
| `{typography.body-md}` | 16px | 400 | 1.5 | 기본 본문 |
| `{typography.body-sm}` | 14px | 400 | 1.45 | 설명, helper text |
| `{typography.caption}` | 12px | 700 | 1.35 | eyebrow, badge |
| `{typography.button}` | 15px | 800 | 1 | CTA |

## Layout

- **Mobile shell**: max-width 520px, side padding 16px.
- **Desktop shell**: max-width 980px, side padding 24px.
- **Bottom nav**: fixed, 4 tabs, bottom 14px, safe-area 포함해 content bottom padding 88px.
- **Mobile app flow**: `오늘 → 촬영 → 리뷰 → 보관함 → 레시피` 순서로 화면을 구성한다. 홈 상단에는 같은 순서의 horizontal flow strip을 두고, bottom nav는 반복 진입이 많은 `오늘`, `촬영`, `보관함`, `레시피` 4개만 고정한다.
- **Content grid**: mobile 1 column, desktop 2 columns. 카메라 패널은 desktop에서 2-row span 가능.
- **Card radius**: 기본 8px. 반복 카드, 버튼, preview frame 모두 8px.
- **Touch target**: 주요 버튼 48px, bottom nav item 40px 이상.

## Components

### Brand Lockup

`brand-lockup`은 `text.svg` 단일 파일을 렌더링한다. 별도 `icon.svg`를 옆에 추가하지 않는다. 모바일 헤더 기준 width는 148px, 작은 화면에서는 최대폭을 `44vw`로 제한한다.

### Primary Button

Primary button은 `{colors.primary}` 배경에 `{colors.on-primary}` 텍스트를 쓴다. 중요한 점은 흰색 텍스트를 강제하지 않는 것이다. `#BDBB40` 위에서는 진한 올리브/먹색 텍스트가 더 안정적이다.

### Secondary Button

Secondary button은 흰 배경, `{colors.border-brand}` border, `{colors.content-brand}` 텍스트를 사용한다. 알림 테스트, 취소, 보조 전환에 사용한다.

### Tertiary Button

Tertiary button은 `{colors.tertiary}` 배경으로 가벼운 추천/탐색 액션에 사용한다. primary와 같은 화면에 있을 때는 tertiary를 두 번째 강조로 쓰지 말고, 추천 카드 내부의 작은 액션에 제한한다.

### Panel

Panel은 흰 배경, 1px border, 8px radius, 16px padding이다. 촬영, 알림, 잔반 리뷰, 보관함, 레시피 추천 모두 같은 panel 구조를 공유한다. 패널 안에는 설명 텍스트를 길게 넣지 않는다.

### Camera Preview

Camera preview는 4:3 ratio를 기본으로 한다. `object-fit: cover`를 적용하고, inactive 상태에는 단순한 "Preview" placeholder만 둔다. 촬영 화면은 실제 카메라 피드가 주인공이므로 주변 장식은 최소화한다.

### Status Pill

Status pill은 상태를 빠르게 읽게 하는 운영용 컴포넌트다.

- `ready`, `active`: `{colors.surface-brand-soft}` + primary border
- `checking`: warning/subtle 계열
- `blocked`, `unsupported`, `error`: error/subtle 계열

### Metric Card

Metric card는 홈 상단의 3-up 요약에 사용한다. "이번 주 절감", "임박 식재료", "리뷰 대기"처럼 짧은 label + 굵은 value 조합만 허용한다.

### List Row

잔반 리뷰, 식재료, 레시피 추천은 같은 `list-row` 패턴을 쓴다. 좌측은 주제/보조 정보, 우측은 상태/시간/추천 여부를 둔다.

## Accessibility

- 모든 icon-only button에는 `aria-label`을 둔다.
- 브랜드 wordmark 이미지에는 `alt="잔반제로"`를 둔다.
- 카메라 preview는 `aria-label="카메라 미리보기"`를 사용한다.
- 상태 색상만으로 의미를 전달하지 않고 status text를 항상 함께 둔다.
- 알림 권한, 카메라 권한은 사용자 gesture 뒤에만 요청한다.

## Implementation Notes

- `src/config/brand.ts`를 브랜드 single source of truth로 둔다.
- PWA manifest icon은 `/icon.png`, `/icon.svg`를 사용한다.
- Service worker notification icon/badge는 `/icon.png`를 사용한다.
- Old Vite/temporary PWA assets는 사용하지 않는다.
- PRD.md가 비어 있으면 이 문서와 `src/domain/home.ts`의 domain scaffold를 임시 기준으로 삼는다.
