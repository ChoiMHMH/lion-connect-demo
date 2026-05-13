# T07 - Demo API Base And Log Panel

> depends on: T04, T06

## 보장할 동작

컴포넌트와 domain API 함수는 기존 endpoint를 그대로 호출하지만, demo mode에서는 apiClient/serverApiClient가 `/api/demo`으로 요청하고 호출 로그가 UI에 기록된다.

## 선행 테스트 / 선행 검증

- `sed -n '1,260p' constants/api.ts`
- `sed -n '1,340p' lib/apiClient.ts`
- `sed -n '1,220p' lib/serverApiClient.ts`
- 기존 apiClient 테스트 목록 확인

## 작업

- demo mode 판별 helper를 추가한다.
- `constants/api.ts`에 안전한 demo API base 상수 또는 base URL resolver를 추가한다.
- `apiClient.ts`가 demo mode에서 상대 endpoint를 `/api/demo${endpoint}`로 요청하게 한다.
- `serverApiClient.ts`도 서버 렌더링 API 호출에서 demo base를 사용할 수 있게 한다.
- 운영 base URL과 refresh token 흐름은 유지한다.
- demo API 로그 store를 추가하고 method/path/status/duration/timestamp를 기록한다.
- 우측 하단 접이식 API 호출 로그 패널을 demo mode에서만 표시한다.

## 완료 기준

- domain API 함수는 mock 데이터를 직접 import하지 않는다.
- Network 탭에서 `/api/demo/...` 요청이 보인다.
- API 로그 패널에서 `GET /api/demo/profile/me 200` 같은 호출 이력을 볼 수 있다.
- 운영 모드 API base URL 로직은 기존 테스트를 통과한다.

## 커밋

- `feat: route demo api calls through client`
