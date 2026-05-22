# 잔반제로 Frontend

잔반제로는 냉장고/영수증 사진 또는 자연어 입력으로 보관 식재료를 정리하고, 소비기한이 임박한 재료를 먼저 소진하도록 레시피 추천으로 연결하는 모바일 우선 PWA 프로토타입입니다.

## 현재 범위

- React SPA 기반 모바일 PWA 셸
- Zustand + localStorage 기반 인벤토리/레시피/선택 식재료 상태 관리
- 카메라 접근, 사진 업로드, 자연어 입력 기반 식재료 후보 등록 UX
- 소비기한 기반 홈 대시보드와 캘린더
- 보유 식재료 기반 레시피 매칭/저장/소진 플로우
- 서비스워커 등록, 설치 프롬프트, 푸시 구독/테스트 알림 인프라

실제 백엔드 API, OCR/이미지 인식, AI normalize, 서버 푸시 스케줄링은 아직 연결되지 않았습니다. 상세 범위는 `PRD.md`, 디자인 토큰/원칙은 `DESIGN.md`를 참고하세요.

## 기술 스택

- React 19 + TypeScript 6
- Vite 8 + React Compiler
- Tailwind CSS 4
- Zustand 5
- framer-motion
- vite-plugin-pwa + Workbox injectManifest
- Vitest + jsdom

## 스크립트

```bash
bun run dev          # 개발 서버
bun run typecheck    # TypeScript project references 전체 타입체크
bun run lint         # ESLint(type-aware 포함)
bun run test         # Vitest 단위 테스트
bun run build        # 타입체크 후 프로덕션 빌드
bun run qa:production # dist 정적 서빙/SPA fallback/PWA asset smoke test
bun run preview      # 빌드 결과 미리보기
```

## 환경 변수

`.env.example`을 복사해 `.env`를 만들고 필요한 값만 설정합니다.

- `VITE_VAPID_PUBLIC_KEY`: Web Push VAPID 공개키. 비어 있으면 권한 요청/테스트 알림만 가능하고 서버 푸시 구독 생성은 보류됩니다.
- `VITE_API_BASE_URL`: API HTTP(S) origin only. 같은 origin에서 `/api/*`를 제공하면 비워두고, API가 별도 origin이면 `https://api.example.com`처럼 path/query/hash 없이 설정합니다.
- `VITE_DEV_SERVER_HOST`: `1`, `true`, `yes`, `on`이면 Vite 개발 서버가 외부 호스트 바인딩을 허용합니다. 로컬 네트워크 테스트에만 사용하세요.

## 품질 기준

현재 저장소는 strict TypeScript, type-aware ESLint, Vitest 단위 테스트를 기본 검증 루프로 사용합니다. 주요 로직을 수정한 경우 최소한 다음을 실행하세요.

```bash
bun run lint
bun run test
bun run build
```

## 운영/백엔드 서빙 준비

백엔드가 `dist/`를 서빙할 때 필요한 SPA fallback, service worker cache header, HTTPS/카메라 권한, PWA smoke test 절차는 `docs/production-ops.md`를 따릅니다. 백엔드 handoff 계약은 `BR_SPEC.md`에 정리되어 있습니다. 배포 전에는 `bun run qa:production`으로 backend-like static serving 시나리오를 검증하세요.
