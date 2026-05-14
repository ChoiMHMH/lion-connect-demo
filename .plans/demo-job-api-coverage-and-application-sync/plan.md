# 데모 채용공고 API 커버리지와 지원 현황 동기화

## 무엇을 / 왜

기업 데모에서 채용공고 수정/등록/삭제/게시/게시 취소가 실제 운영 API 대신 `/api/demo` mock Route Handler로 정상 동작하게 한다. 인재 데모에서는 채용공고 상세의 지원 완료 상태와 지원 현황 목록이 서로 같은 mock 상태를 바라보게 한다. 이전 작업에서 이력서 작성 버튼 sticky가 체감되지 않은 문제도 버튼 그룹 중심으로 다시 보정한다.

작업 Level: Level 2
점수: 8/12
근거:
- 변경 범위: 2 - demo role store, mock API, seed/test, 이력서 UI가 함께 변경된다.
- 모호성: 1 - 누락 endpoint는 확인됐지만 UI에서 "2곳 지원"이 보이는 정확한 화면은 추정이 필요하다.
- 영향도: 2 - 데모 데이터 저장/수정/삭제/상태 전환 흐름을 추가한다.
- 되돌리기 쉬움: 1 - 데모 전용 코드라 커밋 revert로 가능하다.
- 테스트 가능성: 1 - mock API 테스트로 핵심 상태 전이를 검증 가능하고 sticky는 수동 확인이 필요하다.
- 새 지식 필요: 1 - 기존 API request/response 타입에 맞춰 mock 응답을 맞추면 된다.
강제 승격: 데이터 저장/삭제/제출 흐름 변경 - 최소 Level 2
다음 프로토콜: `.agents/planning.md`의 Level 2

## 현재 상태 진단

- 현재 데모 Route Handler에 구현된 기업 채용공고 API는 아래뿐이다.
  - `GET /company/job-postings/me`
  - `GET /company/job-postings/:jobId`
  - `GET /company/job-postings/:jobId/applications`
- 현재 데모 Route Handler에서 빠진 기업 채용공고 API는 아래다.
  - `POST /company/job-postings`
  - `PUT /company/job-postings/:jobId`
  - `DELETE /company/job-postings/:jobId`
  - `PATCH /company/job-postings/:jobId/publish`
  - `PATCH /company/job-postings/:jobId/unpublish`
  - `POST /company/job-postings/images/presign-bulk`
  - `POST /company/job-postings/images`
- `lib/api/jobPostings.ts`는 등록/수정 시 이미지가 있으면 image presign -> `/uploads/...` PUT -> image complete -> job create/update 순서로 호출한다.
- `roleStore`의 `store.jobs`와 `store.jobDetails`는 별도 배열이라 create/update/delete/publish/unpublish 시 둘 다 동기화해야 한다.
- 지원 현황 관련 현재 구현 API는 `GET /me/job-applications`, `POST /job-postings/:id/apply`, `PATCH /me/job-applications/:id/cancel`이다. 다만 seed/상세/목록 상태가 분리되어 있어 한 화면에서 지원 완료로 보이는 항목과 지원 현황 목록이 어긋날 수 있다.
- `JobBoardDetailClient`는 지원 후 `/applications`로 이동한다. middleware가 `/dashboard/applications`로 리다이렉트하지만 직접 라우팅은 현재 네비게이션과 맞지 않는다.
- 이전 sticky 변경은 `TalentRegisterNav` 전체에 적용했지만 사용자가 체감하지 못했다. 버튼 그룹 자체를 viewport 기준으로 고정되게 보정할 필요가 있다.

## 해결책

- `roleStore`에 채용공고 이미지 presign/complete, create, update, delete, publish, unpublish 함수를 추가한다.
- 채용공고 mutation은 `store.jobs`, `store.jobDetails`, `store.applications`, `store.applicants`를 함께 정리해 목록/상세/지원자 화면의 mock 상태를 일관되게 유지한다.
- 지원 현황은 `store.jobDetails[*].applied/myJobApplicationId`와 `store.applications`를 단일 helper로 동기화하고, 지원 후 이동 경로를 `/dashboard/applications`로 바로 맞춘다.
- 이력서 작성 액션은 nav 전체 sticky 외에 우측 액션 그룹에 별도 sticky/fixed 계열 class를 적용해 스크롤 중에도 임시 저장/작성 완료 버튼이 확실히 남도록 한다.
- 누락 API 목록은 테스트에 명시해 이후 추가 누락이 보이면 테스트 실패로 드러나게 한다.

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| 데모 role store에 mutation을 직접 구현 | 운영 API 없이 데모 플로우 전체를 실제처럼 체험 가능 | mock 상태 관리 코드가 커진다 |
| jobs/jobDetails/applications/applicants를 한 store에서 동기화 | 화면 간 불일치가 줄어든다 | 실제 백엔드의 세부 상태 모델과 1:1은 아니다 |
| 지원 후 경로를 `/dashboard/applications`로 수정 | 레거시 리다이렉트 의존이 사라진다 | 기존 `/applications` 링크 기대가 있다면 바뀐다 |
| 버튼 그룹 자체를 sticky/fixed 처리 | 사용자 체감 동작이 확실하다 | 화면 폭이 좁을 때 제목 input과 겹치지 않는지 확인이 필요하다 |

## 대안

1. **채용공고 mutation은 성공 응답만 반환하고 store를 갱신하지 않기**
   - 기각 이유: 등록/수정/삭제/게시 후 목록과 상세가 그대로라 데모 신뢰도가 낮다.

2. **운영 API 호출을 실패하지 않게 catch만 처리**
   - 기각 이유: 데모 모드의 목적이 API 계층을 통과한 mock 동작 확인이므로 근본 해결이 아니다.

3. **이력서 액션을 페이지 하단 fixed footer로 이동**
   - 기각 이유: 사용자가 현재 위치 자체는 좋다고 했고, 기존 nav 구조 변경이 커진다.

## 완료 기준 (DoD)

- [ ] `PUT /company/job-postings/9001`이 200 응답하고 기업 목록/상세에 수정 내용이 반영된다.
- [ ] `POST /company/job-postings`가 201 응답하고 새 공고가 기업 목록/상세에 추가된다.
- [ ] `DELETE /company/job-postings/:id`가 204 응답하고 목록/상세/지원자 상태에서 제거된다.
- [ ] `PATCH /company/job-postings/:id/publish`와 `/unpublish`가 목록/상세 상태를 각각 `PUBLISHED`/`DRAFT`로 반영한다.
- [ ] 이미지 presign-bulk/upload-complete mock이 등록/수정 플로우에서 실패하지 않는다.
- [ ] 지원 완료 상태와 `/me/job-applications` 목록이 같은 mock 상태를 보여준다.
- [ ] 지원 후 이동 경로가 `/dashboard/applications`로 맞춰진다.
- [ ] 이력서 작성의 임시 저장/작성 완료 버튼이 스크롤 중에도 보인다.
- [ ] 관련 role mock API 테스트를 추가/수정하고 통과시킨다.
- [ ] `npm run type-check`, `npm run lint`, `npm test`를 통과시킨다.
