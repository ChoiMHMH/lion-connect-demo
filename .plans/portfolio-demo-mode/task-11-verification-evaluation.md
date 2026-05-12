# T11 - Verification And Evaluation

> depends on: T10

## 보장할 동작

구현 후 Level 3에 필요한 기계 검증, 수동 검증, drift/evaluation 기록, 최종 결과 요약이 남는다.

## 선행 테스트 / 선행 검증

- `sed -n '1,260p' .agents/drift.md`
- `sed -n '1,320p' .agents/evaluation.md`
- `cat package.json`

## 작업

- `npm run lint`를 실행하고 실패 시 원인을 수정하거나 failure report에 남긴다.
- `npm run type-check`를 실행하고 실패 시 원인을 수정하거나 failure report에 남긴다.
- `npm run test`를 실행하고 실패 시 원인을 수정하거나 failure report에 남긴다.
- `npm run build`를 실행하고 실패 시 원인을 수정하거나 failure report에 남긴다.
- 데모 플로우를 수동 확인한다.
- `.agents/drift.md` 기준 drift를 점검한다.
- `.agents/evaluation.md` Stage 1/2/3 기준으로 남은 리스크를 정리한다.
- PR 본문에 실제 검증 결과와 남은 mock coverage 한계를 반영한다.
- 모든 완료 task를 `task-control.md`에 체크한다.

## 완료 기준

- lint/type-check/test/build 결과가 기록되어 있다.
- 랜딩 안내, 로그인 차단, demo role navigation, 이력서 저장 API 로그, role별 주요 페이지를 확인했다.
- 남은 mock API와 사용자가 직접 넣어야 하는 이미지가 명확히 정리되어 있다.
- draft PR을 ready로 전환할 수 있는 상태다.

## 커밋

- `chore: verify portfolio demo mode`

## 결과 기록

### 기계 검증

- `npm run lint`: pass
- `npm run type-check`: pass
- `npm run test`: pass, 23 files / 109 tests
- `npm run build`: pass
  - sandbox 기본 실행에서는 Turbopack 내부 worker가 local port bind를 시도하며 `Operation not permitted`로 실패했다.
  - 같은 명령을 권한 상승으로 재실행해 실제 build 오류를 확인했고, 서버 전용 API import 분리 후 통과했다.

### 수동 검증

- `npm run dev`: `http://localhost:3000` ready 확인
- `curl -I http://localhost:3000/`: 200 OK
- `curl -I http://localhost:3000/demo`: 200 OK
- `curl -I 'http://localhost:3000/demo/enter/talent?returnTo=/dashboard/profile/1'`: 200 OK
- 데모 쿠키 수동 주입 후 보호 라우트 접근:
  - talent cookie + `/dashboard/profile/1`: 200 OK
  - company cookie + `/talents`: 200 OK
  - admin cookie + `/admin`: 200 OK
- `curl -s http://localhost:3000/api/demo/profile/me?profileId=1`: demo resume profile JSON 응답 확인

브라우저 JS 클릭 흐름은 기존 테스트에서 보강했다.

- `app/demo/enter/[role]/__tests__/page.test.tsx`: role별 demo auth 진입과 `returnTo` 이동
- `lib/__tests__/apiClient.test.ts`: demo auth state에서 `/api/demo` base URL과 API log 기록
- `components/demo/__tests__/DemoApiLogPanel.test.tsx`: demo mode에서 로그 패널 표시
- `app/demo/__tests__/page.test.tsx`: demo hub 정책 문구와 role entry 링크

### Drift 점검

Drift score: 0.00

항목:

- 계획에 없던 파일 또는 도메인 수정: 0.00 - T11 검증 중 build 실패를 고치기 위해 서버 전용 API import를 분리했지만, 이는 기존 plan의 `serverApiClient` demo base 분기와 build gate 충족 범위 안에 있다.
- acceptance criteria 재해석: 0.00 - README, Mock API, RBAC, API 계층, 저장 정책, 검증 게이트 기준을 그대로 적용했다.
- 테스트 전략 변경 또는 테스트 누락: 0.00 - 지정된 lint/type-check/test/build와 HTTP 수동 검증을 수행했다.
- 새 dependency 추가: 0.00 - 없음.
- 인증/권한/API/데이터 흐름 변경: 0.00 - 새 정책 변경 없이 server-only import 경계만 분리했다.
- non-goal에 포함된 작업 필요: 0.00 - 외부 DB, 실제 인증 복구, 새 이미지 추가 없음.

판정: 계속

### Contract Review

- DoD: pass
- task 기준: pass
- seed 기준: pass
- 남은 리스크:
  - 모든 운영 API를 mock하지는 않는다. 데모 목적상 이력서 저장, 채용공고, 인재 검색, 기업/관리자 주요 목록/상세 중심으로 제한한다.
  - Route Handler 메모리 상태는 서버 프로세스 수명에 묶인다. README에 localStorage/메모리 저장 한계를 기록했다.
  - 실제 placeholder 이미지 파일은 추가하지 않았다. 필요 시 README의 `public/demo/assets/*` 선택 경로에 안전한 placeholder만 추가해야 한다.

### Adversarial Review

- 주요 리스크:
  - demo auth는 쿠키와 클라이언트 Zustand 상태가 함께 맞아야 하므로, JS가 비활성화된 환경에서는 role 진입 후 client redirect가 완료되지 않는다.
  - sitemap/opengraph 같은 서버 경로가 client API wrapper를 import하면 build 또는 static generation에서 store 접근 문제가 재발할 수 있다.
- 누락 가능 테스트:
  - 실제 브라우저 E2E로 CTA 클릭, 안내 모달, API log panel UI를 끝까지 확인하는 테스트는 없다.
  - 서버리스 배포 환경에서 Route Handler 메모리 지속성 차이를 검증하지 않았다.
- 더 단순한 대안:
  - 컴포넌트에 mock 데이터를 직접 import하면 구현은 단순하지만 seed constraint와 포트폴리오 목표(API 계층 보존)를 위반한다.
- 롤백 방법:
  - PR 전체 revert 또는 task별 커밋 revert로 가능하다. T11 build fix는 `chore: verify portfolio demo mode` 커밋에 포함된다.
- 판정: pass
