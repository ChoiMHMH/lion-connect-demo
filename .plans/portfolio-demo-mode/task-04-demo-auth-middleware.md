# T04 - Demo Auth And Middleware

> depends on: T03

## 보장할 동작

실제 로그인 없이 인재/기업/관리자 demo role을 설정하고, 기존 middleware RBAC와 React Query enabled 조건을 통과한다.

## 선행 테스트 / 선행 검증

- `sed -n '1,220p' middleware.ts`
- `sed -n '1,180p' store/authStore.ts`
- `sed -n '1,180p' actions/auth.ts`
- 보호 라우트 목록과 required role 매핑 확인

## 작업

- demo role 상수와 role별 home route를 정의한다.
- demo role 선택 시 `user-roles` 쿠키와 demo 전용 쿠키를 설정하는 server action 또는 route를 만든다.
- authStore에 demo user와 메모리 accessToken을 주입하는 클라이언트 helper를 추가한다.
- 실제 token과 혼동되지 않도록 demo token/name/cookie 값을 명확히 구분한다.
- middleware는 기존 운영 인증 로직을 보존하면서 demo 쿠키/role cookie로 보호 라우트 접근을 허용한다.
- 데모 데이터 초기화 시 demo auth state도 정리할 수 있게 한다.

## 완료 기준

- 인재 데모 진입 후 `/dashboard`, `/dashboard/profile`, `/dashboard/applications` 접근이 가능하다.
- 기업 데모 진입 후 `/talents`, `/jobs` 접근이 가능하다.
- 관리자 데모 진입 후 `/admin/*` 접근이 가능하다.
- 기존 실제 로그인/refresh/logout 코드는 삭제되지 않는다.

## 커밋

- `feat: add demo auth role bridge`
