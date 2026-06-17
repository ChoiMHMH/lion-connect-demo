# API 호출 계층 정합성 리팩토링

> 근거 분석: [docs/분석/API-호출-계층화-설계-분석.md](../../docs/분석/API-호출-계층화-설계-분석.md)
> Level: 2 (점수 7/12, 강제 승격: 리팩토링/공용 유틸/인증)

## 무엇을 / 왜

현재 3계층 구조(`constants/api.ts` + `lib/apiClient.ts` + `lib/api/*`)는 방향이 옳지만,
"공통 관심사는 apiClient에 한 번만 구현된다"는 설계 원칙이 코드에서 일부 깨져 있다.

- query string 조립(`URLSearchParams`)이 도메인 함수 5개 파일에 거의 복붙으로 반복된다.
- 백엔드 API인 `loginAPI`·`refreshAccessToken`이 공통 클라이언트를 우회해 직접 `fetch`를 쓴다.
  특히 `loginAPI`는 `ApiError`가 아닌 일반 `Error`를 던져 에러 타입이 일관되지 않는다.
- `apiRequest` 내부의 응답 파싱 로직이 정상 경로(354-386)와 401 재시도 경로(316-342)에 통째로 중복돼 있다.

이 리팩토링의 목표는 새 구조 도입이 아니라 **기존 구조의 원칙을 코드와 일치시키는 것**이다.
외부 동작(API 요청/응답 결과)은 바꾸지 않는다.

## 현재 상태 진단

- `lib/api/jobPostings.ts`: `fetchPublicJobPostings`, `fetchJobApplicants`, `fetchAdminJobPostings`,
  `fetchAdminJobApplicants` 4개 함수가 page/size/sort 조립을 각자 반복.
- `lib/api/serverJobPostings.ts`, `adminUsers.ts`, `inquiries.ts`, `talents.ts`도 동일 패턴 반복.
- `lib/apiClient.ts:178` `refreshAccessToken`: 직접 `fetch` + 자체 에러 처리(timeout/ApiError 우회).
- `lib/api/auth.ts:34` `loginAPI`: 직접 `fetch`, 응답 헤더(`Authorization`) 접근 위해 raw 필요.
  실패 시 `throw new Error(...)` → UI의 `instanceof ApiError` 분기에서 누락됨.
- `lib/apiClient.ts:316-342` vs `354-386`: 204/빈 응답/JSON 파싱 로직이 두 번 거의 동일하게 존재.
- S3 presigned 업로드 4곳(`profilePortfolio`, `profileResume`, `profileThumbnail`, `jobPostings`)은
  외부 URL이므로 **흡수 대상에서 제외**(현 상태 유지).

## 해결책

- `lib/http/query.ts`에 `withQuery(endpoint, params)` 유틸 추가. `undefined`/빈 배열은 생략,
  배열은 반복 append(sort 등), 기존 동작과 1:1 동일하게. 5개 파일에 적용.
- `lib/apiClient.ts`에 `parseResponse<T>(response)` 내부 함수 추출 → 정상/재시도 경로 공유.
- `lib/apiClient.ts`에 `apiRawRequest(endpoint, options): Promise<Response>` 추가.
  base URL/timeout/demo URL resolution/`ApiError` 네트워크·타임아웃 변환은 공유하되 응답 본문은 파싱하지 않고 raw `Response` 반환.
- `refreshAccessToken`과 `loginAPI`를 `apiRawRequest` 위로 이전. `loginAPI` 실패 경로를 `ApiError`로 통일.
- 변경 근거와 전/후를 `docs/분석/`에 설명 문서로 작성.

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| `withQuery` 공통 유틸 도입 | 5개 파일 중복 제거, 규칙 1곳 관리 | 얇은 추상화 1개 추가, 각 호출부 가독성은 약간 암묵적 |
| `apiRawRequest`로 raw fetch 흡수 | 인증 경로도 공통 정책(timeout/error/demo) 공유, 에러 타입 통일 | apiClient 표면적 1개 증가, login/refresh 동작 회귀 위험 → 테스트로 방어 |
| `parseResponse` 추출 | 파싱 규칙 1곳, 재시도 경로 drift 제거 | apiRequest 내부 호출 흐름 한 단계 추가 |

## 대안

1. **현 상태 유지(아무것도 안 함)**
   - 기각 이유: 포폴 문구("공통 관심사는 한 번만 구현")가 코드와 불일치. `loginAPI` 에러 타입 불일치는 실제 버그 리스크.

2. **도메인별 폴더 분리 + queryKeys까지 재구성(분석 문서의 "중규모" 안)**
   - 기각 이유: 현재 규모에 과함. 외부 동작 변화 없는 정합성 작업 범위를 넘어 위험·비용이 큼. 분석 문서도 "나중"으로 분류.

3. **`apiRawRequest` 없이 login/refresh를 그대로 두고 query 유틸만 적용**
   - 기각 이유: 가장 실질적 리스크(에러 타입 불일치)를 남김. 포폴 서사의 핵심("우회 경로 흡수")도 약해짐.

## 완료 기준 (DoD)

- [ ] `withQuery` 유틸 + 단위 테스트(undefined 생략/배열 반복/빈 배열 처리) 통과
- [ ] 5개 도메인 파일이 `withQuery` 사용, 생성되는 query string이 변경 전과 동일
- [ ] `parseResponse` 추출, 정상·재시도 경로 공유, 204/빈 응답/JSON 파싱 테스트 통과
- [ ] `apiRawRequest` 추가 + 테스트(헤더 접근 가능, timeout/네트워크 에러가 `ApiError`로 변환)
- [ ] `refreshAccessToken`·`loginAPI`가 `apiRawRequest` 사용, `loginAPI` 실패 시 `ApiError`
- [ ] `npm run type-check`, `npm run lint`, `npm run test` 녹색
- [ ] `docs/분석/`에 전/후 설명 문서 작성
- [ ] 포폴 발표용 회고 슬라이드 초안 작성(Before 1장 + 회고 1장)
- [ ] `.agents/evaluation.md` Stage 1/2 통과
```
