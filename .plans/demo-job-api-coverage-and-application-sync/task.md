# 데모 채용공고 API 커버리지와 지원 현황 동기화 - Task 분할

> 원칙: 각 task는 1개 커밋 단위.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함:
  - 기업 데모 채용공고 등록/수정/삭제/게시/게시 취소 mock API
  - 기업 데모 채용공고 이미지 presign/upload-complete mock API
  - 채용공고 목록/상세/지원자/지원 현황 mock 상태 동기화
  - 지원 후 `/dashboard/applications` 이동 경로 정리
  - 이력서 작성 임시 저장/작성 완료 sticky 보정
  - 기존 누적 변경/커밋/PR 상태 점검 및 정리
- 미포함:
  - 운영 API 계약 변경
  - 실제 S3 업로드 방식 변경
  - 운영 데이터 마이그레이션
  - 데모 외 인증/권한 정책 변경

## 의존성 순서

```text
T0 -> T1 -> T2 -> T3 -> T4 -> T5
```

## T0 - 현재 변경사항과 PR 상태 정리

**보장할 동작**

이전 완료 작업과 이번 작업이 섞이지 않도록 현재 uncommitted 변경, ahead 커밋, 기존 PR 상태를 확인하고 정리 방향을 고정한다.

**선행 테스트 / 선행 검증**

- `git status --short --branch`
- `git log --oneline --decorate --max-count=18`
- `gh pr status`
- 필요 시 `git fetch origin`

**작업**

- 이전 완료 작업은 별도 커밋으로 정리한다.
- 기존 PR이 merged라면 새 PR 대상 브랜치/본문 정리 방식을 결정한다.
- 새 작업 구현 전 uncommitted 변경 범위를 명확히 유지한다.

**완료 기준**

- 이전 완료 변경과 새 작업 변경이 git status에서 구분 가능하다.
- PR 정리 방향이 최종 응답에 남는다.

**커밋**

- 필요 시 이전 작업 커밋: `fix: sync demo profile image and sticky actions`

## T1 - 채용공고 mutation mock API 테스트

**보장할 동작**

누락된 기업 채용공고 데모 API가 등록/수정/삭제/게시/게시 취소/이미지 업로드 플로우를 정상 응답해야 한다.

**선행 테스트 / 선행 검증**

- `lib/demo/__tests__/roleMockApi.test.ts`에 아래 실패 테스트를 먼저 추가한다.
  - `POST /company/job-postings/images/presign-bulk`
  - `POST /company/job-postings/images`
  - `POST /company/job-postings`
  - `PUT /company/job-postings/:jobId`
  - `PATCH /company/job-postings/:jobId/publish`
  - `PATCH /company/job-postings/:jobId/unpublish`
  - `DELETE /company/job-postings/:jobId`
- `npm test -- lib/demo/__tests__/roleMockApi.test.ts`로 red를 확인한다.

**작업**

- 테스트만 추가하고 구현은 하지 않는다.

**완료 기준**

- 누락 API 때문에 테스트가 실패한다.

**커밋**

- 구현 커밋에 포함한다.

## T2 - 채용공고 mutation mock 구현

**보장할 동작**

기업 데모 채용공고 등록/수정/삭제/게시/게시 취소와 이미지 presign/upload-complete가 `/api/demo`에서 동작한다.

**선행 테스트 / 선행 검증**

- T1 실패 테스트를 기준으로 구현한다.

**작업**

- `lib/demo/roleStore.ts`에 job image, create/update/delete, publish/unpublish helper를 추가한다.
- `lib/demo/mockApi.ts`에 누락 endpoint handler를 추가한다.
- create/update/delete 시 `jobs`, `jobDetails`, `applications`, `applicants`를 일관되게 갱신한다.

**완료 기준**

- `npm test -- lib/demo/__tests__/roleMockApi.test.ts`가 통과한다.

**커밋**

- `feat: complete demo company job posting mutations`

## T3 - 지원 현황 상태 동기화

**보장할 동작**

채용공고 상세에서 지원 완료로 보이는 항목과 `/me/job-applications` 목록이 같은 mock 상태를 보여준다.

**선행 테스트 / 선행 검증**

- `roleMockApi.test.ts`에 상세 applied 상태와 지원 현황 목록의 application id/job id 일치 테스트를 추가한다.
- 지원 취소 후 상세 `applied`가 false로 돌아가는 테스트를 추가한다.

**작업**

- `applyDemoJob`와 `cancelDemoApplication`에서 job detail 상태와 applications 목록을 같은 helper로 동기화한다.
- 필요하면 seed의 초기 지원 상태를 목록/상세 기준으로 맞춘다.

**완료 기준**

- 지원/취소 후 상세와 지원 현황 목록이 일관된다.

**커밋**

- `fix: keep demo application state consistent`

## T4 - 이력서 sticky와 지원 후 경로 보정

**보장할 동작**

이력서 작성의 임시 저장/작성 완료 버튼이 스크롤 중에도 보이고, 지원 완료 후 지원 현황 이동은 `/dashboard/applications`로 간다.

**선행 테스트 / 선행 검증**

- 경로 변경은 정적 코드 확인으로 검증한다.
- sticky는 수동 확인 기준을 남긴다.

**작업**

- `TalentRegisterNav`의 우측 액션 그룹에 별도 sticky/fixed 보정을 적용한다.
- `JobBoardDetailClient`의 지원 후 이동 경로를 `/dashboard/applications`로 수정한다.

**완료 기준**

- 버튼 submit/debounce 동작을 변경하지 않는다.
- 지원 후 레거시 `/applications` 의존이 없다.

**커밋**

- `fix: polish demo resume actions and application route`

## T5 - 검증과 PR 정리

**보장할 동작**

작업 결과가 계획/DoD를 만족하고, 쌓인 커밋을 새 PR로 정리할 수 있는 상태가 된다.

**선행 테스트 / 선행 검증**

- `npm test -- lib/demo/__tests__/roleMockApi.test.ts`
- `npm test -- lib/demo/__tests__/resumeMockApi.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`

**작업**

- `.agents/evaluation.md` Stage 1/2를 수행한다.
- GitHub 원격 상태를 fetch하고, 새 PR 생성/업데이트 방향을 정리한다.

**완료 기준**

- 자동 검증이 통과한다.
- Contract Review 결과가 최종 응답에 포함된다.
- PR을 만들었거나, 만들 수 없는 경우 이유와 다음 명령을 남긴다.

**커밋**

- 필요 시 `docs: record demo job api task plan`
