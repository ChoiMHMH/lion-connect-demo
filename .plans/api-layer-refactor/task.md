# API 호출 계층 정합성 리팩토링 - Task 분할

> 원칙: 각 task는 1개 커밋 단위. 새 코드/리팩토링은 실패 테스트 → green → refactor 순.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함: query string 유틸, 응답 파싱 중복 제거, raw fetch 흡수(login/refresh), 설명 문서 + 회고 슬라이드
- 미포함: 도메인 폴더 분리, queryKeys 재구성, OpenAPI 생성, S3 업로드 fetch, `serverApiClient` 변경, 외부 API 동작 변경

## 의존성 순서

```text
T1 -> T2 -> T3 -> T4 -> T5 -> T6
```

T3는 T1/T2와 독립이지만 같은 흐름 유지를 위해 순서대로 진행.

## T1 - `withQuery` 쿼리 스트링 유틸 추가

**보장할 동작**
- `undefined`/`null` 값은 query에서 생략
- 배열 값은 같은 key로 반복 append (sort 등)
- 빈 배열은 생략, 숫자는 문자열로 직렬화
- params 없으면 endpoint 그대로 반환(`?` 미부착)

**선행 테스트 / 선행 검증**
- `lib/http/__tests__/query.test.ts`: 위 4개 동작에 대한 실패 테스트 먼저 작성

**작업**
- `lib/http/query.ts`에 `withQuery(endpoint, params)` 구현

**완료 기준**
- query 테스트 green, `npm run type-check` 통과

**커밋**
- `feat: add withQuery helper for query string assembly`

## T2 - 도메인 함수에 `withQuery` 적용

**보장할 동작**
- 적용 전후 생성되는 query string이 **완전히 동일** (page/size/sort/status/jobGroupCode 등 순서·생략 규칙 보존)

**선행 테스트 / 선행 검증**
- 적용 전 각 함수가 만드는 URL을 스냅샷성 단위 테스트로 고정(가능 범위), 또는 적용 후 동일 입력→동일 string 비교 테스트

**작업**
- `jobPostings.ts`(4곳), `serverJobPostings.ts`, `adminUsers.ts`, `inquiries.ts`, `talents.ts`를 `withQuery`로 치환

**완료 기준**
- 관련 테스트 green, `npm run test`/`type-check`/`lint` 통과

**커밋**
- `refactor: use withQuery in domain api functions`

## T3 - `parseResponse` 추출 (응답 파싱 중복 제거)

**보장할 동작**
- 204 → `{}`, content-length 0/비 JSON → 빈 객체 또는 JSON 파싱, JSON 파싱 실패 → `{}`
- 정상 경로와 401 재시도 경로가 **동일한** 파싱 로직 공유

**선행 테스트 / 선행 검증**
- `lib/__tests__/apiClient.parseResponse.test.ts`: 204/빈/정상 JSON/깨진 JSON 케이스 실패 테스트 먼저

**작업**
- `apiClient.ts`에 `parseResponse<T>(response): Promise<T>` 내부 함수 추출 후 두 경로에서 호출

**완료 기준**
- 파싱 테스트 green, 기존 동작 회귀 없음

**커밋**
- `refactor: extract parseResponse to dedupe response parsing`

## T4 - `apiRawRequest` 추가

**보장할 동작**
- base URL/timeout/demo URL resolution/네트워크·타임아웃 `ApiError` 변환은 공유
- 응답 본문은 파싱하지 않고 raw `Response` 반환 → 호출부가 헤더 접근 가능
- `skipAuth` 옵션 지원(login은 토큰 불필요)

**선행 테스트 / 선행 검증**
- `lib/__tests__/apiClient.rawRequest.test.ts`: 헤더 접근 가능, AbortError→TIMEOUT, TypeError→NETWORK_ERROR 변환 실패 테스트 먼저 (`fetch` mock)

**작업**
- `apiClient.ts`에 `apiRawRequest(endpoint, options): Promise<Response>` 구현(공통 부분 `fetchWithTimeout` 재사용)

**완료 기준**
- raw 테스트 green, `type-check` 통과

**커밋**
- `feat: add apiRawRequest for raw response access`

## T5 - login/refresh를 `apiRawRequest`로 이전 + 에러 타입 통일

**보장할 동작**
- 로그인 성공: `Authorization` 헤더에서 토큰 추출, user 검증 동작 유지
- 로그인 실패: `ApiError`로 통일 (기존 `throw new Error` 제거)
- refresh: 기존 토큰 추출(헤더 우선, body 폴백)·중복 방지·실패 시 `clearAuth` 동작 유지

**선행 테스트 / 선행 검증**
- `lib/api/__tests__/auth.login.test.ts`: 성공 토큰 추출 / 실패 시 `instanceof ApiError` 실패 테스트 먼저
- refresh는 회귀 방지 테스트(성공/401 실패) 추가

**작업**
- `loginAPI`, `refreshAccessToken`을 `apiRawRequest` 기반으로 재작성

**완료 기준**
- 인증 테스트 green, 로그인/새로고침 수동 확인(데모 모드 무영향), 전체 `test`/`type-check`/`lint` 통과

**커밋**
- `refactor: route login/refresh through apiRawRequest`

## T6 - 설명 문서 + 회고 슬라이드

**보장할 동작**
- 문서는 실제 변경(전/후 코드, 커밋 근거)과 일치. TanStack Query 사용 사실 정확히 반영

**선행 검증**
- T1~T5 diff 기준으로 작성, 추측 금지

**작업**
- `docs/분석/API-호출-계층-정합성-리팩토링.md`: 문제 → 변경 → 판단 근거 → 남은 과제
- `docs/포폴/api-layer-slides.md`: Before 슬라이드 1장 + 회고 슬라이드 1장

**완료 기준**
- 문서/슬라이드 내 수치·파일·동작이 실제 코드와 일치

**커밋**
- `docs: add api layer refactor writeup and retro slides`
