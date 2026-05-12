# LionConnect 포트폴리오 데모 모드 복구

## 작업 Level

작업 Level: Level 3
점수: 11/12
근거:
- 변경 범위: 2 - 랜딩, 공통 레이아웃/헤더, 인증 상태, middleware, API client, Route Handler, mock seed, README까지 여러 계층을 건드림
- 모호성: 1 - 목표와 우선순위는 명확하지만 실제 라우트/응답 shape별 mock 범위는 구현 중 조정 필요
- 영향도: 2 - 인증/권한/API/상태 저장/폼 제출 경로에 영향
- 되돌리기 쉬움: 2 - 데모 분기라 revert는 가능하지만 여러 도메인에 걸친 롤백 비용이 큼
- 테스트 가능성: 2 - 기존 테스트가 있으나 데모 인증, Route Handler, localStorage, route transition UI는 별도 전략 필요
- 새 지식 필요: 2 - Next.js 15 App Router Route Handler, middleware/cookie, 서버/클라이언트 base URL 분기 검증 필요
강제 승격: 인증/권한 변경, 데이터 저장/제출, API 계약 변경, 공용 유틸/상태 관리 변경, 아키텍처 변경
다음 프로토콜: `.agents/planning.md`의 Level 3

Ambiguity score: 0.18

판단: 사용자가 우선순위와 금지 조건을 충분히 고정했고, 현재 레포 구조도 확인했다. 세부 mock coverage는 task별로 실제 API shape에 맞춰 좁혀가면 된다.

## 무엇을 / 왜

운영 서버가 종료된 LionConnect MVP를 포트폴리오 검토자가 서버 없이 살펴볼 수 있는 데모 모드로 복구한다.

핵심은 "가짜 화면"을 만드는 것이 아니라, 기존 프론트엔드 구조의 강점인 RBAC, API 3계층, TanStack Query, 대규모 이력서 폼 제출 흐름을 그대로 통과시키는 것이다. 컴포넌트는 mock 데이터를 직접 몰라야 하며, 실제 운영 코드 삭제 없이 demo mode만 추가한다.

## 현재 상태 진단

- 스택은 Next.js 15 App Router, React 19, TypeScript strict, TanStack Query, Zustand, React Hook Form, Tailwind CSS 4다.
- 라우트 구조는 `(company)` 그룹이 실제 `/`, `/talents`, `/jobs`를 담당하고, 인재는 `/dashboard`, `/dashboard/profile`, `/dashboard/job-board`, `/dashboard/applications`, 관리는 `/admin/*`를 사용한다.
- 공통 루트는 `app/layout.tsx`와 `app/providers.tsx`이고 전역 loading.tsx는 없다.
- 헤더는 `components/headers/CompanyHeader.tsx`, `MemberHeader.tsx`, `AdminHeader.tsx`, `BaseHeader.tsx`가 역할별로 분리되어 있으며 로고 텍스트는 현재 `라이언 커넥트`다.
- 랜딩 CTA는 `app/(company)/_components/HeroSection.tsx`에서 `/talents`로 직접 이동하고, 헤더 로그인 버튼들은 `/login?returnTo=...`로 이동한다.
- 실제 로그인/회원가입 폼은 `app/(auth)` 아래에 있고, `LoginForm`은 `useLogin` -> `lib/api/auth.ts` -> 실제 API를 호출한다.
- 인증 상태는 `store/authStore.ts`에 user만 persist하고 accessToken은 메모리 저장한다. middleware는 `user-roles` 쿠키로 RBAC를 수행한다.
- `middleware.ts`는 `/dashboard/profile`, `/dashboard/applications`, `/talents`, `/jobs`, `/admin`을 인증 필요 경로로 보고, `/talents`, `/jobs`, `/admin`은 역할 기반으로 제한한다.
- API 계층은 `constants/api.ts` -> `lib/apiClient.ts`/`lib/serverApiClient.ts` -> `lib/api/*.ts` 구조다. 일부 서비스는 `services/jobApplicationService.ts`를 통해 같은 `apiClient`를 사용한다.
- 이력서 작성/수정 플로우는 `app/dashboard/profile/[profileId]`에서 `useTalentRegisterData`로 섹션 데이터를 읽고, `submitTalentRegister.ts`에서 dirty/defaultValues 기반으로 파일 presign, 학력/경력/활동/어학/자격증/링크/Work Driven 저장, 마지막 `updateProfile` 상태 전환을 수행한다.
- 일부 페이지는 `accessToken` 존재 여부로 query enabled를 막는다. 데모 인증은 middleware 쿠키뿐 아니라 `authStore`의 demo accessToken/user도 채워야 한다.
- 공개 채용 상세는 `serverApiClient.ts`를 통해 서버 컴포넌트에서도 API를 호출할 수 있어, client apiClient와 serverApiClient 양쪽 demo base 분기가 필요하다.
- public 자산은 이미 icons/images/landing 중심이다. README에는 GitHub 외부 이미지가 많으나 신규 데모 이미지 추가는 placeholder 경로 안내로 제한한다.
- `.env.example`은 현재 없다. 안전한 demo env 예시는 필요 시 새로 추가해야 한다.

## 해결책

- 전역 demo shell을 추가한다.
  - `app/loading.tsx`로 초기/페이지 로딩 UI를 제공하고, 필요 시 클라이언트 route transition loader는 별도 demo provider에서 추가한다.
  - `DemoGuideProvider` 성격의 클라이언트 컴포넌트를 `app/providers.tsx` 또는 RootLayout 하위에 붙여 랜딩 첫 진입 안내 모달, 좌측 하단 `Demo 안내` 버튼, 로그인/회원가입 서버 종료 안내 모달을 관리한다.
  - 모달 노출 여부는 sessionStorage 기준으로 한 세션 1회만 표시한다.

- demo auth와 데모 헤더를 기존 인증 구조 위에 얹는다.
  - `actions/demoAuth.ts` 또는 Route Handler를 통해 `user-roles`와 demo 전용 쿠키를 설정하고, `authStore`에는 `demo-access-token`과 역할별 demo user를 넣는다.
  - demo role은 실제 token과 혼동되지 않게 `demo_talent`, `demo_company`, `demo_admin` 같은 클라이언트 식별자와 실제 RBAC용 role 배열(`USER/JOINEDUSER`, `COMPANY/JOINEDCOMPANY`, `ADMIN`)을 분리한다.
  - `middleware.ts`는 demo 쿠키가 있을 때 기존 보호 라우트 접근을 허용하되, 운영 인증 흐름은 유지한다.
  - `components/headers/DemoHeader.tsx`와 `constants/demoRoutes.ts`를 만들어 모든 역할에서 동일한 헤더 색상, `LionConnect Demo` 서비스명, 역할별 확장 하위 메뉴, pathname 기반 active underline을 제공한다.

- `/demo`와 `/demo/dev-notes`를 데모 허브로 만든다.
  - `/demo`는 운영 종료, Mock API, DB 미사용, localStorage/메모리 저장, 역할별 카드, 핵심 페이지 링크, 데모 데이터 초기화 버튼을 포함한다.
  - `/demo/dev-notes`는 API 호출 계층, 이력서 저장 플로우, 이미지 placeholder 정책을 기술 설명 중심으로 정리하고 이력서 작성/수정 체험 링크를 제공한다.

- API 계층에 demo base URL 분기를 추가하고 Route Handler Mock API를 구현한다.
  - `constants/api.ts`에 demo base URL 유틸 또는 `DEMO_API_BASE_URL = "/api/demo"`를 추가한다.
  - `apiClient`와 `serverApiClient`가 demo mode일 때 endpoint를 `/api/demo` 아래로 보내도록 하되, 컴포넌트와 domain API 함수는 기존 endpoint constants를 계속 사용한다.
  - `app/api/demo/[...path]/route.ts` 또는 필요한 세그먼트별 Route Handler에서 기존 endpoint path를 받아 mock controller로 라우팅한다.
  - mock seed는 `mocks/demo` 또는 `lib/demo` 아래에 두고, 서버 Route Handler는 메모리 store를 사용한다. 브라우저 새로고침 유지가 필요한 이력서 draft는 클라이언트 localStorage와 서버 메모리 한계를 명확히 안내한다.

- 우선순위 기반 mock coverage를 적용한다.
  - 1순위: 이력서 목록/생성/조회/수정, 학력/경력 POST/PUT/DELETE, custom skills/jobs/exp-tags/profile links/work-driven/profile status, presign 응답.
  - 2순위: 공개 채용공고 목록/상세, 지원 현황, 기업 채용공고 목록/상세/지원자, 인재 검색/상세, 관리자 users/companies/job-postings/applications/inquiries 목록.
  - 3순위: 페이지 이동 중 오류를 만드는 누락 API를 보강한다.
  - 4순위: 시간이 남으면 나머지 mutation mock을 확대한다.

- demo API 호출 로그와 문서/검증을 마무리한다.
  - `store/demoApiLogStore.ts` 또는 context를 추가해 demo mode API 요청 method/path/status/time을 기록한다.
  - 우측 하단 접이식 로그 패널을 demo mode에서만 표시한다.
  - README 상단에 포트폴리오 데모 모드 설명, 저장 정책, 이미지 placeholder 경로, 실행/검증 명령을 추가한다.
  - `.env.example`이 필요하면 실제 서버 주소 없이 `NEXT_PUBLIC_DEMO_MODE=true` 같은 안전한 값만 추가한다.

## 구현 우선순위

1. 계획 승인 후 task 구조를 일반 `task.md` 하나로 만들지 않고, `task-control.md`와 `task-01-...md`부터 순차 생성한다. `task-control.md`에는 각 task의 완료 여부만 표시한다.
2. 먼저 데모 진입/안내/헤더/인증을 완성해 보호 라우트 접근을 해결한다.
3. 그 다음 API base 분기와 `/api/demo` mock 기반을 만들고, 이력서 플로우를 가장 먼저 green으로 만든다.
4. 이후 기업/인재/관리자 목록 페이지 mock coverage를 넓힌다.
5. 마지막에 API 로그 패널, dev notes, README, env example, 검증을 정리한다.

## 예상 task 분할 방향

> 상세 task는 plan 승인 후 별도 파일로 작성한다. 사용자의 요청대로 control task와 개별 task 파일을 분리한다.

- Control: `.plans/portfolio-demo-mode/task-control.md` - 완료된 task 번호와 상태만 체크
- Task 01: routing/seed 고정, 이슈/브랜치/PR 준비
- Task 02: 전역 로딩 UI와 데모 안내/서버 종료 안내 모달 shell
- Task 03: 로그인/회원가입/랜딩 CTA 차단 및 Demo 안내 고정 버튼
- Task 04: demo auth 쿠키/store 초기화와 middleware 최소 변경
- Task 05: 데모 헤더 네비게이션과 route map
- Task 06: `/demo` 및 `/demo/dev-notes`
- Task 07: API base 분기와 demo API 로그 store/panel 기반
- Task 08: mock seed/store와 이력서 작성/수정 Route Handler
- Task 09: 인재/기업/관리자 주요 목록/상세 mock coverage
- Task 10: 이미지 placeholder 정책, README, `.env.example`
- Task 11: 통합 검증, 실패 리포트, drift/evaluation 기록

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| 기존 endpoint path를 유지하고 base URL만 `/api/demo`로 바꾸기 | 컴포넌트와 domain API 변경 최소화, Network 탭에서 실제 호출 계층 확인 가능 | Route Handler가 기존 API path들을 넓게 받아야 하므로 mock router 설계가 필요 |
| demo auth를 기존 `user-roles` 쿠키 + authStore user/accessToken으로 주입 | middleware와 React Query enabled 조건을 동시에 만족 | 실제 인증과 혼동되지 않도록 demo cookie/token 명명과 초기화 버튼이 필요 |
| mock 저장은 Route Handler 메모리 + 클라이언트 localStorage 안내로 제한 | 외부 DB 없이 안전하고 Vercel 배포도 단순 | 서버리스 환경에서는 메모리 지속성이 보장되지 않아 "새로고침 유지" 요구는 제한적 |
| `/api/demo/[...path]` catch-all 라우팅 | 많은 기존 endpoint를 한 곳에서 빠르게 커버 | 파일이 커질 수 있어 mock controller/handlers로 분리해야 유지보수 가능 |
| 데모 헤더를 새 공통 컴포넌트로 만들고 기존 헤더는 보존 | 운영 헤더 로직 삭제 없이 demo UI 일관성 확보 | 각 레이아웃에서 demo mode 분기 또는 wrapper 도입이 필요 |

## 대안

1. **컴포넌트에서 mock 데이터를 직접 import**
   - 기각 이유: 사용자가 명시적으로 금지했고, 포트폴리오에서 보여줘야 하는 API 계층 구조가 사라진다.

2. **MSW로 브라우저 fetch를 가로채기**
   - 기각 이유: 새 dependency 가능성이 있고, Next Route Handler 기반 `/api/demo` 네트워크 흐름 요구와 맞지 않는다.

3. **로그인 폼에 데모 계정을 자동 입력해 실제 auth flow처럼 처리**
   - 기각 이유: 실제 인증 요청이 발생하지 않아야 하고, 로그인/회원가입 입력 화면으로 보내지 않는 요구와 충돌한다.

4. **middleware를 demo에서 전부 우회**
   - 기각 이유: RBAC 구조 확인이라는 포트폴리오 목표가 약해진다. 기존 role cookie 기반 경로 제한을 최대한 살리는 편이 낫다.

5. **모든 API를 한 번에 mock**
   - 기각 이유: 범위가 과도하다. 사용자가 지정한 우선순위대로 이력서 플로우와 핵심 목록/상세부터 처리하는 것이 현실적이다.

## 완료 기준 (DoD)

- [ ] `app/loading.tsx` 또는 동등한 로딩 UI가 추가되어 초기/전환 로딩 빈 화면을 줄인다.
- [ ] 랜딩 첫 진입 시 `포트폴리오 데모 안내` 모달이 한 세션 1회 표시된다.
- [ ] 모든 페이지 좌측 하단에 demo mode용 `Demo 안내` 고정 버튼이 보인다.
- [ ] 로그인/회원가입/시작하기 CTA는 실제 인증 입력 화면 또는 실제 인증 요청으로 이어지지 않고 서버 종료 안내 모달 또는 `/demo`로 유도한다.
- [ ] demo mode 헤더는 `LionConnect Demo`로 표시되고 역할별 하위 메뉴 확장과 active underline을 제공한다.
- [ ] 인재/기업/관리자 데모 진입 시 기존 보호 라우트에 접근할 수 있고 실제 인증 토큰과 demo 값이 구분된다.
- [ ] `/demo` 페이지가 데모 허브 역할을 하며 역할별 주요 링크와 데이터 초기화 안내를 제공한다.
- [ ] 가능하면 `/demo/dev-notes`가 API 계층과 이력서 저장 흐름을 설명한다.
- [ ] `apiClient`와 `serverApiClient`는 demo mode에서 기존 endpoint를 `/api/demo`으로 보낸다.
- [ ] `/api/demo` Route Handler가 이력서 조회/저장 핵심 API와 주요 목록/상세 API를 기존 response shape에 맞춰 응답한다.
- [ ] mock seed 데이터는 안전한 가상 데이터만 포함하고, 외부 인물 이미지/실제 기업 로고를 추가하지 않는다.
- [ ] 이력서 작성/수정 화면에서 기본 정보 수정, 학력/경력 추가 또는 수정, 저장, profile status 전환, 성공 토스트가 확인된다.
- [ ] demo API 호출 로그 패널이 method/path/status를 demo mode에서만 표시한다.
- [ ] README 상단에 포트폴리오 데모 모드, 서버 종료, 저장 정책, 이미지 placeholder 목록, 검증 명령이 정리된다.
- [ ] `.env.example`이 필요하면 안전한 demo 값만 추가하고 민감정보를 넣지 않는다.
- [ ] `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`를 실행하고 결과를 기록한다.

## 검증 전략

- 단위/계약 테스트:
  - demo endpoint resolver가 기존 endpoint path를 `/api/demo`에서 올바른 handler로 연결하는지 테스트한다.
  - demo auth helper가 역할별 user/roles/accessToken/cookie 값을 구분해 생성하는지 테스트한다.
  - 이력서 mock handlers가 POST/PUT/DELETE 후 기존 response shape와 id 유지 정책을 만족하는지 테스트한다.

- 통합 테스트:
  - 기존 `submitTalentRegister` 테스트 패턴을 재사용해 이력서 신규/수정 분기와 마지막 `updateProfile(status)` 호출을 검증한다.
  - `apiClient` demo mode 분기 테스트를 추가해 운영 base URL 로직이 깨지지 않는지 확인한다.

- 수동 검증:
  - `/` 진입 -> 데모 안내 모달 -> 닫기/데모 이동.
  - 로그인/회원가입 CTA 클릭 -> 서버 종료 안내 모달 -> `/demo`.
  - `/demo`에서 인재/기업/관리자 카드 클릭 -> role 설정 -> 보호 라우트 접근.
  - 헤더 메뉴 active underline과 역할별 하위 메뉴 확장 확인.
  - `/dashboard/profile/1` 이력서 수정 -> 학력/경력 저장 -> API 로그 패널 확인.
  - 데이터 초기화 버튼 동작 확인.

- 기계 검증:
  - `npm run lint`
  - `npm run type-check`
  - `npm run test`
  - `npm run build`

## 리스크와 대응

- React Query enabled 조건이 `accessToken`에 묶인 페이지는 demo role cookie만으로는 데이터가 로드되지 않는다.
  - 대응: demo auth 진입 시 authStore에 demo user와 demo accessToken을 주입한다.

- middleware와 클라이언트 demo state가 불일치하면 보호 라우트 접근이 튕길 수 있다.
  - 대응: role 선택 액션에서 쿠키와 authStore를 함께 설정하고, route push 전 완료를 보장한다.

- 서버 Route Handler 메모리 저장은 Vercel 서버리스에서 지속성을 보장하지 않는다.
  - 대응: `/demo`와 README에 localStorage/메모리 정책을 명확히 쓰고, 필요한 클라이언트 상태만 localStorage에 유지한다.

- 기존 API response shape가 파일별로 조금씩 다르다.
  - 대응: `types/*`와 기존 domain API를 기준으로 mock response를 만들고, 페이지 단위로 누락 API를 보강한다.

- public README의 기존 GitHub 이미지와 신규 데모 이미지 정책이 섞일 수 있다.
  - 대응: 새로 추가하는 데모 자산은 placeholder 경로 안내만 하고, 실제 외부 이미지 추가는 하지 않는다.
