# 데모 전용 기본 Role 부트스트랩

## 무엇을 / 왜

이 프로젝트는 현재 운영 인증/권한 서비스를 제공하는 목적이 아니라 포트폴리오 데모를 보여주는 목적이다. 따라서 첫 랜딩에서 기존 운영 헤더나 실제 로그인 흐름이 보이면 안 된다.

현재는 `/demo/enter/*`에 들어간 뒤에야 demo auth cookie와 Zustand auth store가 설정된다. 그래서 첫 `/` 진입 후 안내 모달에서 `계속 랜딩 보기`를 누르면 기존 `라이언 커넥트` 헤더가 보이고, 로그인/회원가입 CTA는 서버 종료 안내만 열어 사용자가 데모에 갇힌다.

목표는 새 세션 첫 `/` 렌더링부터 기본 `demo_company` role을 부여하고, 모든 주요 화면에서 `LionConnect Demo` 헤더와 `/api/demo` mock API 흐름이 기본값이 되게 만드는 것이다.

작업 Level: Level 2
점수: 8/12
근거:
- 변경 범위: 2 - root provider, auth 초기화, role header, middleware, E2E가 함께 영향을 받는다.
- 모호성: 1 - 데모 전용 전제는 확정됐지만 기존 운영 코드 보존 범위는 최소 변경으로 잡는다.
- 영향도: 2 - 인증/권한/middleware/API 라우팅 기본값을 데모 기준으로 바꾼다.
- 되돌리기 쉬움: 1 - demo bootstrap과 middleware 우회는 revert 가능하지만 UX 기본값 영향이 크다.
- 테스트 가능성: 1 - 단위 테스트와 Playwright 회귀 테스트를 추가해야 한다.
- 새 지식 필요: 1 - Next middleware와 client auth bootstrap 순서의 race를 확인해야 한다.
강제 승격: 인증/권한 및 공용 상태 흐름 변경
다음 프로토콜: `.agents/planning.md`의 Level 2

## 현재 상태 진단

- `CompanyHeader`, `MemberHeader`, `AdminHeader`는 demo cookie 또는 Zustand store의 demo user가 있을 때만 `DemoHeader`를 렌더링한다.
- 첫 `/` 방문에는 cookie/store가 비어 있으므로 `CompanyHeader`가 기존 운영 헤더를 렌더링한다.
- `DemoGuideProvider`의 `계속 랜딩 보기`는 모달만 닫고 role을 설정하지 않는다.
- `데모 둘러보기`는 `/demo`로만 이동하고, 실제 role 설정은 `/demo/enter/[role]`에서 `activateDemoAuth(role)`가 실행될 때 발생한다.
- `apiClient`는 `isDemoAuthState(accessToken, user)`가 true일 때만 운영 API 대신 `/api/demo`로 요청한다. 즉 헤더만 데모로 바꿔서는 부족하고, 기본 demo auth state도 필요하다.
- `middleware.ts`는 원래 운영 로그인/권한용이다. 데모 전용에서는 `/talents`, `/jobs`, `/admin`, `/dashboard/profile` 접근을 막거나 `/login`으로 보내는 동작이 오히려 방해가 된다.
- `serverApiClient`도 demo cookie가 없으면 운영 API base URL을 사용한다. 서버 컴포넌트에서 public job detail 같은 API를 호출하는 경우까지 데모 기본값을 고려해야 한다.

## 선택한 해결책

- 데모 전용 플래그를 명시한다.
  - 예: `constants/demoAuth.ts` 또는 `lib/demoMode.ts`에 `DEMO_ONLY_MODE = true`.
  - 운영 코드 삭제 대신 데모 배포 기본값을 한 곳에서 확인할 수 있게 한다.
- 앱 시작 시 기본 role을 `demo_company`로 부트스트랩한다.
  - root provider 안에 `DemoAuthBootstrap` 같은 client component를 둔다.
  - store에 demo user가 없으면 `restoreDemoAuth("demo_company")`로 즉시 client auth state를 채운다.
  - 이후 `setDemoAuthCookies("demo_company")`를 호출해 middleware/server component용 cookie도 맞춘다.
  - 이미 `demo_talent`/`demo_admin` store 또는 cookie가 있으면 절대 `demo_company`로 덮어쓰지 않는다.
- 서버 레이아웃의 초기 헤더 role 기본값을 정한다.
  - `getInitialDemoRole(defaultRole)` 형태로 바꾼다.
  - `/`와 `(company)` group은 `demo_company`, `/dashboard`는 `demo_talent`, `/admin`은 `demo_admin`을 fallback으로 사용한다.
  - cookie가 있으면 cookie role이 fallback보다 우선한다.
- role 전환/deep link 용도로 `/demo/enter/*`는 유지한다.
  - 이 경로는 더 이상 “최초 데모 진입 필수 관문”이 아니라 “역할 전환 + returnTo 진입” 역할만 맡는다.
  - 데모 허브의 바로가기들은 현재처럼 `/demo/enter/*?returnTo=...`를 써도 된다.
- middleware는 데모 전용 모드에서 권한 체크를 우회한다.
  - 레거시 URL 리다이렉트처럼 UX 보정에 필요한 것만 남기고, auth required/RBAC/guest-only redirect는 early return으로 비활성화한다.
  - 이렇게 하면 cookie 세팅 전 사용자가 빠르게 `/talents` 등을 눌러도 `/login`으로 튕기지 않는다.
- server API도 데모 기본값을 쓴다.
  - `serverApiClient`는 `DEMO_ONLY_MODE`가 true면 cookie가 없어도 `/api/demo` base를 사용한다.
  - cookie가 있으면 기존처럼 role 정보와 함께 데모 요청을 유지한다.
- 기존 운영 로그인/회원가입 코드는 삭제하지 않는다.
  - 데모 전용 플래그로 우회만 한다.
  - 이후 운영 복구가 필요하면 `DEMO_ONLY_MODE`를 false로 돌리는 식으로 되돌릴 수 있게 한다.

## 구체 작업 순서

1. **실패 테스트 추가**
   - 첫 `/` 진입 후 `계속 랜딩 보기`를 눌러도 `LionConnect Demo`와 `기업 데모` active 버튼이 보이는 Playwright 테스트를 추가한다.
   - middleware 테스트에 demo-only 모드에서는 `/talents`, `/jobs`, `/admin/users`, `/login`이 redirect되지 않는 케이스를 추가한다.
   - header 초기 role 테스트에 fallback role이 cookie/store 없이도 DemoHeader를 렌더링하는 케이스를 추가한다.

2. **demo-only 상수와 기본 role 정의**
   - `DEMO_ONLY_MODE = true`
   - `DEFAULT_DEMO_ROLE = "demo_company"`
   - 필요하면 route group별 fallback role helper 추가.

3. **client auth bootstrap**
   - `Providers` 내부에서 children보다 먼저 동작하는 bootstrap component를 추가한다.
   - 현재 store user가 demo user면 그대로 둔다.
   - 일반 user나 null이면 demo-only 기준으로 `demo_company`를 기본 주입한다.
   - cookie 설정은 비동기로 보정한다.

4. **server initial role fallback**
   - `getInitialDemoRole(defaultRole?: DemoRole)`로 변경한다.
   - `app/(company)/layout.tsx`: fallback `demo_company`
   - `app/dashboard/layout.tsx`: fallback `demo_talent`
   - `app/admin/layout.tsx`: fallback `demo_admin`

5. **middleware demo-only 우회**
   - 내부 route/static/API 제외는 유지한다.
   - demo-only이면 보호 라우트/RBAC/guest-only redirect를 건너뛰게 한다.
   - 레거시 `/profile` → `/dashboard/profile` 같은 경로 보정은 유지할지 테스트 기준에 맞춰 결정한다.

6. **server API demo base 보정**
   - `serverApiClient`가 demo-only에서 cookie 없이도 `/api/demo`를 base로 사용하게 한다.
   - 서버 컴포넌트가 운영 API로 새는 경로가 없는지 검색/테스트한다.

7. **검증**
   - `npm test -- middleware.test.ts components/headers/__tests__/InitialDemoHeader.test.tsx contexts/__tests__/DemoGuideContext.test.tsx`
   - `npm run type-check`
   - `npm run lint`
   - 가능하면 `npm run test:e2e -- e2e/portfolio-demo.spec.ts`

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| 랜딩부터 기본 `demo_company`를 주입 | 첫 화면부터 데모 헤더/API가 일관된다 | 운영 모드와 완전히 같은 초기 인증 흐름은 더 이상 기본값이 아니다 |
| middleware 권한 체크를 demo-only에서 우회 | 데모 검토자가 어떤 화면도 막히지 않고 볼 수 있다 | 운영 권한 회귀는 demo-only가 false일 때 별도 검증해야 한다 |
| `/demo/enter/*`를 유지 | 기존 데모 허브/deep link/역할 전환 흐름을 재사용한다 | 코드상 진입 경로가 하나 더 남아 있다 |
| `/demo/enter/*`를 제거 | 구조가 단순해진다 | role 전환 후 특정 returnTo로 이동하는 기존 테스트/링크를 다시 짜야 한다 |
| 운영 auth 코드를 삭제하지 않고 플래그로 우회 | 되돌리기 쉽고 변경 범위가 작다 | 데모 전용 프로젝트인데도 운영 코드가 일부 남아 복잡해 보일 수 있다 |

## 대안

1. **middleware만 끄고 헤더는 기존 구조 유지**
   - 기각 이유: 첫 랜딩에서 기존 헤더가 계속 보이고, apiClient도 demo auth state가 없어 운영 API로 샐 수 있다.

2. **헤더만 항상 DemoHeader로 변경**
   - 기각 이유: 화면은 데모처럼 보이지만 auth store와 API 라우팅이 demo mode가 아니어서 실제 데이터 요청 문제가 남는다.

3. **`/demo/enter/company`로 루트 리다이렉트**
   - 기각 이유: 첫 URL이 즉시 바뀌고 랜딩 첫 paint 제어가 복잡해진다. 사용자는 `/`를 봐야 한다.

4. **운영 auth/middleware 코드를 완전 삭제**
   - 기각 이유: 이번 이슈 해결에는 과하고, 되돌리기 어려운 리팩토링이 된다.

## 완료 기준

- [ ] 새 브라우저 세션 첫 `/` 진입에서 `LionConnect Demo` 헤더가 첫 화면부터 보인다.
- [ ] `계속 랜딩 보기`를 눌러도 기존 `라이언 커넥트` 헤더가 나타나지 않는다.
- [ ] 기본 role은 `demo_company`이며, `기업 데모` 버튼이 active 상태다.
- [ ] 데모 허브에서 인재/기업/관리자 바로가기를 눌러도 선택한 role의 DemoHeader가 유지된다.
- [ ] `/talents`, `/jobs`, `/admin`, `/dashboard/profile` 직접 접근이 demo-only 모드에서 `/login`으로 redirect되지 않는다.
- [ ] client API 요청은 기본 상태에서도 운영 API가 아니라 `/api/demo`로 간다.
- [ ] server API 요청도 cookie 없는 첫 진입에서 운영 API로 새지 않는다.
- [ ] 데이터 초기화 후 다시 `/`에 들어오면 기본 `demo_company` 상태가 자동 복구된다.
- [ ] 기존 운영 auth 코드는 삭제하지 않고 demo-only 우회로 남긴다.
- [ ] 관련 unit/e2e 테스트가 이 회귀를 잡는다.
