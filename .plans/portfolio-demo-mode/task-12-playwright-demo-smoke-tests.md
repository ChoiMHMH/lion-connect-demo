# T12 - Playwright Demo Smoke Tests

> depends on: T11

## 작업 Level

작업 Level: Level 3
점수: 9/12
근거:
- 변경 범위: 2 - Playwright 설정, package scripts, E2E 테스트, 검증 기록을 추가한다.
- 모호성: 1 - 데모 핵심 시나리오는 명확하지만 브라우저 테스트 범위는 실행 안정성을 보며 조정한다.
- 영향도: 1 - 운영 코드 동작이 아니라 검증 체계와 dev dependency 변경이다.
- 되돌리기 쉬움: 1 - 테스트 인프라와 lockfile 변경을 revert하면 된다.
- 테스트 가능성: 2 - 새 브라우저 실행 환경과 서버 기동 검증이 필요하다.
- 새 지식 필요: 2 - 기존 레포에 없던 Playwright 기반 E2E 도입이다.
강제 승격: 새 dependency 추가, 아키텍처/기술 선택 변경
다음 프로토콜: `.agents/planning.md`의 Level 3

Ambiguity score: 0.12

## 보장할 동작

포트폴리오 데모 모드의 핵심 브라우저 플로우가 실제 Next dev server 위에서 깨지지 않는다.

## 선행 테스트 / 선행 검증

- `cat package.json`
- 기존 Vitest 데모 테스트 범위 확인
- 데모 페이지/모달/로그 패널의 접근 가능한 텍스트 확인

## 작업

- Playwright test runner를 dev dependency로 추가한다.
- `playwright.config.ts`와 `npm run test:e2e` 스크립트를 추가한다.
- 데모 smoke spec을 추가한다.
  - 랜딩 첫 진입 안내 모달과 로그인 CTA 서버 종료 안내를 검증한다.
  - `/demo` role entry에서 인재/기업/관리자 보호 라우트 진입을 검증한다.
  - 인재 role에서 `/api/demo` 응답이 실제 브라우저 요청으로 들어오고 Demo API Log 패널에 기록되는지 검증한다.
- E2E 실행 결과와 기존 검증 수치를 기록한다.

## 완료 기준

- `npm run test:e2e`가 통과한다.
- 기존 `npm run test`가 계속 통과한다.
- PR에 브라우저 E2E 수치를 추가할 수 있다.

## 커밋

- `test: add playwright demo smoke coverage`

## 결과 기록

### 구현 결과

- `@playwright/test` 1.60.0 dev dependency 추가.
- `playwright.config.ts` 추가.
  - Chromium 1개 project.
  - `npm run dev` webServer 자동 기동.
  - `playwright-report/`, `test-results/` 산출물 분리.
- `e2e/portfolio-demo.spec.ts` 추가.
  - 랜딩 첫 진입 데모 안내와 로그인/회원가입 CTA 서버 종료 안내 검증.
  - 인재 demo role 진입, `/dashboard/profile/1` 보호 라우트 접근, `/api/demo/profile/me` 브라우저 API 로그 검증.
  - 기업 demo role 진입, `/talents` 보호 라우트와 `/api/demo/profiles/search` 응답 검증.
  - 관리자 demo role 진입, `/admin/inquiries` 보호 라우트와 `/api/demo/admin/inquiries` 응답 검증.
- Vitest가 Playwright spec을 수집하지 않도록 `e2e/**` exclude 추가.
- CI에서 `npx playwright install --with-deps chromium` 후 `npm run test:e2e`를 실행하도록 workflow 확장.

### 검증 결과

- `npx playwright test --list`: pass, 1 file / 4 browser E2E tests discovered
- `npm run type-check`: pass
- `npm run lint`: pass
- `npm run test`: pass, 23 files / 109 tests
- `npm run build`: pass with elevated permissions
  - sandbox 기본 실행은 Turbopack worker의 local port bind 제한으로 실패했다.
- `npm run test:e2e`: local blocked by host OS dependency
  - Chromium binary install: pass (`npx playwright install chromium`)
  - Actual browser launch failed because this container lacks shared libraries such as `libnspr4.so`, `libnss3.so`, `libatk-1.0.so.0`, `libgbm.so.1`.
  - `npx playwright install-deps chromium` requires sudo and failed because this environment cannot provide a sudo password.
  - CI workflow now installs browser dependencies on `ubuntu-latest`, where sudo is available.
