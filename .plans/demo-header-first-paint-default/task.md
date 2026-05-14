# 데모 전용 기본 Role 부트스트랩 - Task 분할

> 원칙: 각 task는 1개 커밋 단위.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함:
  - 새 세션 첫 `/` 진입부터 기본 `demo_company` 상태를 만드는 client/server bootstrap
  - demo-only 모드에서 middleware 인증/권한 redirect 우회
  - cookie가 없어도 서버 API가 `/api/demo`를 기본 base로 쓰는 보정
  - 회귀를 잡는 unit/e2e 테스트 추가
- 미포함:
  - 운영 로그인/회원가입 코드 삭제
  - `/demo/enter/*` 제거
  - 데모 데이터 seed 자체 변경
  - 랜딩/데모 허브 시각 디자인 개편

## 의존성 순서

```text
T1 -> T2 -> T3 -> T4 -> T5
```

## T1 - 회귀 테스트 고정

**보장할 동작**

첫 랜딩에서 `계속 랜딩 보기`를 눌러도 기존 운영 헤더가 아니라 `LionConnect Demo` 헤더가 보이고, demo-only 모드에서 보호 라우트가 `/login`으로 redirect되지 않는다.

**선행 테스트 / 선행 검증**

- `npm test -- middleware.test.ts components/headers/__tests__/InitialDemoHeader.test.tsx contexts/__tests__/DemoGuideContext.test.tsx`
- `npm run test:e2e -- e2e/portfolio-demo.spec.ts` 중 관련 첫 랜딩 케이스가 현재 실패하도록 테스트 추가

**작업**

- `e2e/portfolio-demo.spec.ts` 첫 테스트에 `계속 랜딩 보기` 직후 `expectDemoHeader(page, "기업 데모")` 검증을 추가한다.
- `middleware.test.ts`에 demo-only 모드에서 `/talents`, `/jobs`, `/admin/users`, `/dashboard/profile`, `/login`이 redirect되지 않는 테스트를 추가한다.
- `components/headers/__tests__/InitialDemoHeader.test.tsx`에 fallback/default role 기반 렌더링 기대치를 추가한다.

**완료 기준**

- 추가한 테스트가 현재 구현에서 의도대로 실패하거나, 기존 빈틈을 명확히 드러낸다.
- 테스트 이름이 사용자 재현 흐름을 설명한다.

**커밋**

- `test: cover default demo role bootstrap`

## T2 - 데모 전용 기본값과 클라이언트 부트스트랩

**보장할 동작**

앱이 시작되면 demo-only 기준으로 기본 `demo_company` auth state가 즉시 주입되고, 이미 선택된 demo role은 덮어쓰지 않는다.

**선행 테스트 / 선행 검증**

- T1에서 추가한 첫 랜딩/초기 헤더 테스트
- `lib/__tests__/demoAuthClient.test.ts`

**작업**

- `constants/demoAuth.ts` 또는 `lib/demoMode.ts`에 `DEMO_ONLY_MODE`, `DEFAULT_DEMO_ROLE`을 추가한다.
- `lib/demoAuthClient.ts`에 기본 role 부트스트랩 helper를 추가하거나 기존 `restoreDemoAuth`를 재사용한다.
- `app/providers.tsx`에 `DemoAuthBootstrap` 컴포넌트를 추가한다.
- store에 demo user가 있으면 유지하고, 없으면 `demo_company`를 주입한다.
- cookie 보정은 `setDemoAuthCookies(DEFAULT_DEMO_ROLE)`로 비동기 실행하되 UI 렌더링을 막지 않는다.

**완료 기준**

- 새 세션 첫 client render에서 auth store가 `demo_company` user/accessToken을 가진다.
- `demo_talent`/`demo_admin` 상태에서 새로고침 또는 route 이동해도 `demo_company`로 덮이지 않는다.
- T1의 첫 랜딩 헤더 관련 테스트가 통과한다.

**커밋**

- `feat: bootstrap default demo auth`

## T3 - 서버 초기 role fallback과 API base 보정

**보장할 동작**

서버 렌더링에서도 cookie가 없을 때 role group별 DemoHeader가 첫 paint부터 나오고, server API 요청이 운영 API로 새지 않는다.

**선행 테스트 / 선행 검증**

- `components/headers/__tests__/InitialDemoHeader.test.tsx`
- `lib/__tests__/demoMode.test.ts` 또는 신규 server API URL 결정 테스트

**작업**

- `lib/demoAuthServer.ts`의 `getInitialDemoRole`에 fallback role 인자를 추가한다.
- `app/(company)/layout.tsx`는 fallback `demo_company`를 넘긴다.
- `app/dashboard/layout.tsx`는 fallback `demo_talent`를 넘긴다.
- `app/admin/layout.tsx`는 fallback `demo_admin`을 넘긴다.
- `lib/serverApiClient.ts`는 demo-only 모드에서 cookie가 없어도 `/api/demo` base를 사용하도록 보정한다.

**완료 기준**

- cookie 없는 서버 렌더 기준으로도 `/`, `/dashboard`, `/admin` 헤더가 각각 role에 맞는 DemoHeader를 선택한다.
- 기존 demo cookie가 있으면 fallback보다 cookie role이 우선한다.
- server API base가 demo-only에서 운영 API URL을 사용하지 않는다.

**커밋**

- `feat: use demo defaults on server render`

## T4 - middleware demo-only 권한 우회

**보장할 동작**

데모 전용 모드에서는 로그인/권한 redirect가 사용자를 막지 않는다.

**선행 테스트 / 선행 검증**

- `npm test -- middleware.test.ts`

**작업**

- `middleware.ts`에서 demo-only 모드일 때 auth required, RBAC, guest-only redirect를 건너뛰는 early return을 추가한다.
- 레거시 `/profile`, `/job-board`, `/applications` redirect는 유지한다.
- 데모 public path 예외와 static file 예외가 중복되거나 의미 없어지는 부분을 정리한다.

**완료 기준**

- `/talents`, `/jobs`, `/admin/users`, `/dashboard/profile`, `/login`이 demo-only에서 redirect되지 않는다.
- 기존 레거시 redirect 테스트는 유지된다.
- middleware 코드에 demo-only 우회 이유가 짧게 남아 있다.

**커밋**

- `feat: bypass auth middleware in demo mode`

## T5 - 전체 검증과 회귀 정리

**보장할 동작**

사용자 재현 흐름과 주요 role 전환 흐름이 모두 데모 헤더와 demo API 기준으로 일관된다.

**선행 테스트 / 선행 검증**

- T1~T4 완료

**작업**

- `npm test -- middleware.test.ts components/headers/__tests__/InitialDemoHeader.test.tsx contexts/__tests__/DemoGuideContext.test.tsx lib/__tests__/demoAuthClient.test.ts lib/__tests__/demoMode.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm run test:e2e -- e2e/portfolio-demo.spec.ts`
- 실패 시 이번 변경과 직접 관련된 테스트만 수정한다.

**완료 기준**

- 첫 `/` 진입, `계속 랜딩 보기`, 데모 허브 바로가기, 직접 보호 라우트 접근이 모두 통과한다.
- type-check/lint/unit/e2e 결과를 작업 기록과 최종 응답에 남긴다.

**커밋**

- `test: verify demo default role flow`
