# Production Ops Guide

이 문서는 백엔드가 `dist/` 산출물을 서빙하기 시작할 때 카메라, PWA, 서비스 워커, SPA 라우팅이 깨지지 않도록 확인해야 하는 운영 계약입니다.

## 배포 전 필수 검증

```bash
bun run lint
bun run test
bun run build
bun run qa:production
```

`bun run qa:production`은 `dist/`를 backend-like static server로 띄운 뒤 다음을 검증합니다.

- `/`, `/inventory`, `/lens/camera-check` deep link가 모두 `index.html`로 fallback 되는지
- `/api/*`와 존재하지 않는 static asset이 `index.html`로 잘못 fallback 되지 않는지
- `manifest.webmanifest`, `sw.js`, Vite hashed assets, manifest icon들이 모두 200으로 응답하는지
- `sw.js`가 no-cache 헤더로 응답하는지
- 기준 헤더에 `Permissions-Policy: camera=(self)`가 포함되는지
- `/sw.js`가 `Service-Worker-Allowed: /`로 루트 scope를 허용하는지

## Backend static serving contract

백엔드는 frontend build 산출물인 `dist/`를 **루트 경로(`/`)** 에 서빙하는 것을 기본 계약으로 합니다. 서브패스(`/app/`) 배포가 필요하면 Vite `base`, PWA manifest `scope/start_url`, service worker scope, backend rewrite 규칙을 함께 바꿔야 합니다.

### Required routing

| Request | Response |
| --- | --- |
| `/` | `dist/index.html` |
| `/inventory`, `/recipes`, `/lens/*` 같은 SPA deep link | `dist/index.html` |
| `/assets/*` | 실제 hashed asset 파일 |
| `/manifest.webmanifest` | manifest 파일 |
| `/sw.js` | service worker 파일 |
| `/icon*.png`, `/icon.svg` | public icon 파일 |
| `/api/*` | frontend fallback 제외, backend API route가 처리 |

### Required headers

```http
Permissions-Policy: camera=(self), microphone=(), geolocation=()
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

권장 CSP는 현재 `index.html`의 inline theme bootstrap과 Google Fonts preload를 허용해야 합니다. 더 엄격한 CSP를 원하면 inline script를 번들 코드로 이동하거나 backend가 nonce/hash를 주입해야 합니다.

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https:; worker-src 'self'; manifest-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

서비스 워커 파일에는 루트 scope를 명시합니다.

```http
Service-Worker-Allowed: /
```

HTTPS 환경에서는 HSTS도 적용합니다.

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Cache policy

| Path | Cache-Control |
| --- | --- |
| `/index.html` | `no-cache` |
| `/sw.js` | `no-cache, no-store, must-revalidate` |
| `/manifest.webmanifest` | `no-cache` 또는 짧은 TTL |
| `/assets/*` | `public, max-age=31536000, immutable` |
| `/icon*.png`, `/icon.svg` | 짧은 TTL 또는 버전 관리 TTL |

`sw.js`에 긴 immutable cache를 걸면 신규 배포 후 서비스 워커 업데이트가 지연될 수 있습니다.

## Camera permission readiness

브라우저 카메라 API(`navigator.mediaDevices.getUserMedia`)는 보안 컨텍스트에서만 동작합니다.

운영 요구사항:

1. 프로덕션은 HTTPS로만 제공한다.
2. 로컬 QA는 `localhost` 또는 HTTPS 터널에서 수행한다.
3. reverse proxy가 `Permissions-Policy: camera=(self)`를 제거하거나 `camera=()`로 덮어쓰지 않게 한다.
4. iframe 안에 앱을 넣을 경우 iframe에 `allow="camera"`를 명시한다.
5. 카메라 권한이 차단된 브라우저는 사이트 설정에서 권한을 초기화한 뒤 재테스트한다.

앱은 다음 fallback을 유지합니다.

- 카메라 권한/장치 오류 → 사진 파일 업로드 또는 자연어 입력으로 계속 진행
- 보안 컨텍스트 오류 → HTTPS/Permissions-Policy 점검 메시지 노출
- 기기 미지원 → 파일 업로드/자연어 입력 안내

## PWA / service worker readiness

- `vite.config.ts`는 `injectManifest`로 `src/sw.ts`를 빌드해 `/sw.js`를 생성합니다.
- 서비스 워커 scope는 루트(`/`) 기준입니다. 백엔드가 `/sw.js`를 루트에서 제공해야 합니다.
- `index.html`과 `sw.js`는 no-cache로 두어 새 배포가 빠르게 감지되도록 합니다.
- push subscription은 `VITE_VAPID_PUBLIC_KEY`가 설정된 뒤 활성화합니다. 비어 있으면 권한 요청과 로컬 테스트 알림까지만 동작합니다.

## API and CORS readiness

- Frontend API calls must go through `src/lib/apiClient.ts`; components/stores should not call raw `fetch` directly.
- API path는 `/api/*`를 사용합니다. 같은 origin에서 backend가 `/api/*`를 처리하면 `VITE_API_BASE_URL`은 비워둡니다.
- API가 별도 origin이면 `VITE_API_BASE_URL=https://api.example.com`처럼 HTTP(S) origin만 설정합니다. Path/query/hash가 포함된 값은 frontend API client가 거부합니다.
- Split-origin CORS 최소 요구사항:

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Vary: Origin
```

- `Access-Control-Allow-Origin: *`와 credentials 조합은 브라우저가 거부하므로 사용하지 않습니다.

## Smoke-test scenarios for ops

1. HTTPS origin에서 앱 접속 → 카메라 켜기 → 권한 prompt 표시 → 허용 후 preview 활성화
2. 카메라 권한 차단 → 앱이 차단 안내와 업로드/자연어 fallback 표시
3. HTTP 비-localhost origin 접속 → 카메라 보안 컨텍스트 오류 안내 표시
4. `/inventory` 같은 deep link 직접 접속/새로고침 → 앱 shell 렌더링
5. 설치된 PWA에서 재접속 → 최신 배포 asset 로딩 및 `sw.js` 업데이트 확인
6. My 탭 푸시 카드 → 서비스 워커 ready, VAPID 미설정 시 missing-key 안내

## Backend handoff checklist

- [ ] `dist/` 파일을 루트에 정적 서빙한다.
- [ ] 모든 SPA deep link를 `index.html`로 rewrite한다.
- [ ] `/api/*`와 존재하지 않는 static asset은 SPA fallback에서 제외한다.
- [ ] HTTPS redirect와 HSTS를 적용한다.
- [ ] CSP/CORS 정책이 inline theme script, Google Fonts, service worker, API origin을 허용하는지 확인한다.
- [ ] `Permissions-Policy: camera=(self)` 헤더를 적용한다.
- [ ] `/sw.js`와 `/index.html`은 `no-cache`로 응답한다.
- [ ] `/assets/*`는 immutable cache로 응답한다.
- [ ] `bun run qa:production`을 CI 또는 release smoke step에 추가한다.
- [ ] 실제 API/OCR/AI normalize가 붙는 시점에 API base URL, auth, error contract 문서를 별도로 추가한다.
