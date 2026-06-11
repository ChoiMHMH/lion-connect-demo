# 데모 프로필/인재탐색 표시 및 미리보기 동기화 - Task 분할

> 원칙: 각 task는 1개 커밋 단위.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함:
  - `/talents`, `/talents/[talentId]` 이름 전체 표시
  - `/dashboard/profile/1` 직무 관련 경험 수정값의 인재 탐색 반영
  - 이력서 저장 후 `/talents`, `/talents/1` React Query 캐시 최신화
  - 홍길동 demo 이력서 초기값, 프로필 사진, 포트폴리오 PDF seed 정리
  - `/dashboard` 초기 공고 이미지 다양화
  - 새 `public/demo` 이미지/PDF 6개 Git 추적 및 GitHub push 대상 포함
  - 관련 단위/통합 테스트와 최종 검증 기록
- 미포함:
  - 운영 API 계약 변경
  - 새 파일 업로드 기능 구현
  - 새 dependency 추가 또는 PDF viewer 라이브러리 도입
  - demo 외 실제 사용자 데이터 마이그레이션

## 사전 워크플로우

- `gh issue create`로 plan 요약 이슈를 생성한다.
- 현재 브랜치가 작업 브랜치로 적절한지 확인하고, 필요 시 이슈 번호 기반 브랜치로 전환한다.
- 첫 커밋 push 후 draft PR을 만든다.
- 네트워크/권한 문제로 `gh` 작업이 막히면 구현은 로컬 task 단위로 진행하되, 막힌 명령과 이유를 기록한다.

## 의존성 순서

```text
T1 -> T2 -> T3 -> T4 -> T5 -> T6
```

## T1 - demo 에셋 추적 및 seed 경로 정리

**보장할 동작**

새 demo 이미지/PDF가 Git 추적 대상에 포함되고, seed 데이터가 실제 `public/demo` 경로만 참조한다.

**선행 테스트 / 선행 검증**

- `git check-ignore -v public/demo/backend-demo.png public/demo/designer-demo.png public/demo/frontent-demo.png public/demo/mock_portfolio_frontend_honggildong.pdf public/demo/mock_portfolio_frontend_test.pdf public/demo/profile-demo.png`가 ignore 매칭 없이 종료되는지 확인한다.
- `find public/demo -maxdepth 1 -type f -printf '%p %s bytes\n'`로 대상 에셋 존재와 크기를 기록한다.
- `npm test -- lib/demo/__tests__/roleMockApi.test.ts lib/demo/__tests__/resumeMockApi.test.ts lib/demo/__tests__/talentAdapter.test.ts`를 먼저 실행해 현재 seed 관련 실패/통과 상태를 확인한다.

**작업**

- `public/demo/backend-demo.png`, `designer-demo.png`, `frontent-demo.png`, `profile-demo.png`, `mock_portfolio_frontend_honggildong.pdf`, `mock_portfolio_frontend_test.pdf`를 커밋 대상에 포함한다.
- `demoResumeSeed`, `demoTalentList`, `demoTalentDetails`, 문의/관리 seed 등 id=1 관련 초기 이름을 `홍길동` 기준으로 맞춘다.
- id=1 포트폴리오 URL은 `/demo/mock_portfolio_frontend_honggildong.pdf`, id=2/3 포트폴리오 URL은 `/demo/mock_portfolio_frontend_test.pdf`로 맞춘다.
- profile id=1 초기 프로필 사진/thumbnail은 `/demo/profile-demo.png`를 사용하도록 seed를 정리한다.

**완료 기준**

- 새 demo 에셋 6개가 `git status --short`에서 추적 대상 추가로 보인다.
- mock API seed 응답에서 id=1 이름/thumbnail/portfolio URL이 홍길동 demo 값으로 나온다.
- id=2/3 상세 응답의 portfolio URL이 test PDF를 가리킨다.

**커밋**

- `chore: demo 이미지와 포트폴리오 에셋 추가`

## T2 - 이름 전체 표시 UI 수정

**보장할 동작**

인재 목록과 상세 소개 카드에서 이름이 `...`로 축약되지 않고 전체 표시된다.

**선행 테스트 / 선행 검증**

- `npm test -- 'app/(company)/talents/[talentId]/_components/__tests__/IntroduceCard.test.tsx'`를 먼저 실행해 현재 컴포넌트 테스트 상태를 확인한다.
- 필요한 경우 긴 이름이 줄임표 정책 없이 렌더링되어야 한다는 실패 테스트를 먼저 추가한다.

**작업**

- `IntroduceCard`의 `truncate`, `maxWidth: nameMaxChars ch` 기반 이름 축약을 제거한다.
- 목록/상세 호출부의 `nameMaxChars` 의존을 제거하거나 무해하게 만든다.
- 긴 이름에서도 배지와 본문이 겹치지 않도록 flex/wrap/min-width를 조정한다.

**완료 기준**

- `/talents`와 `/talents/1`, `/talents/2`, `/talents/3`에서 이름 텍스트가 DOM/CSS상 줄임표 처리되지 않는다.
- 관련 컴포넌트 테스트가 통과한다.

**커밋**

- `fix: 인재 카드 이름 전체 표시`

## T3 - 이력서 경험/포트폴리오/썸네일을 talent 응답에 합성

**보장할 동작**

`/dashboard/profile/1`의 직무 관련 경험, 프로필 사진, 포트폴리오 값이 `/profiles/search`와 `/profiles/1` 응답에 반영된다.

**선행 테스트 / 선행 검증**

- `npm test -- lib/demo/__tests__/talentAdapter.test.ts lib/demo/__tests__/talentSync.test.ts`를 먼저 실행한다.
- `expTags` 변경 후 `experiences` 라벨이 바뀌는 실패 테스트를 먼저 추가한다.
- `PORTFOLIO` profile link가 `portfolioUrl`/`storageUrl`로 반영되는 실패 테스트를 먼저 추가한다.

**작업**

- `DemoResumeSnapshot`에 `expTags`를 포함하거나 adapter에서 읽을 수 있게 정리한다.
- `talentAdapter`가 `expTags`를 `부트캠프 경험자`, `창업 경험자`, `자격증 보유자`, `전공자` 라벨로 매핑하도록 한다.
- `profileLinks`의 `THUMBNAIL`/`PORTFOLIO` 또는 profile `storageUrl` 의미를 분리해 list/detail 응답에 반영한다.
- `/profiles/search`와 `/profiles/{id}` mock API 테스트 기대값을 새 seed와 합성 정책에 맞춘다.

**완료 기준**

- 직무 관련 경험 수정 mock API 호출 후 `/profiles/search`, `/profiles/1`의 `experiences`가 최신 라벨을 반환한다.
- id=1 detail의 `portfolioUrl`이 홍길동 PDF를 반환한다.
- id=1 list/detail의 `thumbnailUrl`이 `/demo/profile-demo.png` 또는 업로드 후 최신 thumbnail을 반환한다.

**커밋**

- `fix: 이력서 경험과 포트폴리오를 인재 응답에 반영`

## T4 - 이력서 저장 후 인재 탐색 캐시 최신화

**보장할 동작**

`/dashboard/profile/1`에서 저장한 뒤 새로고침 없이 `/talents`, `/talents/1`로 이동해도 최신 이력서 데이터가 보인다.

**선행 테스트 / 선행 검증**

- `npm test -- 'app/dashboard/profile/[profileId]/__tests__/submitTalentRegister.integration.test.tsx'`를 먼저 실행해 현재 저장 플로우 테스트 상태를 확인한다.
- 저장 성공 시 query invalidation이 발생해야 한다는 테스트를 먼저 추가하거나, 기존 integration harness에서 검증 가능한 방식으로 실패 테스트를 만든다.

**작업**

- `/dashboard/profile/[profileId]/page.tsx`에서 `useQueryClient`를 사용해 임시저장/최종저장 성공 후 관련 쿼리를 무효화한다.
- 최소 대상: `["talents"]`, `["talent", "detail", String(profileId)]`, 필요 시 `["talentRegister", profileId]`, `["profile", "list"]`.
- `useTalentDetail`의 `staleTime`이 즉시 반영을 방해하면 데모/기업 상세 UX에 맞춰 조정한다.
- 최종저장 후 이동 경로가 `/profile`로 되어 있는 기존 레거시 경로 문제는 이번 요구와 직접 관련될 때만 함께 보정한다.

**완료 기준**

- 저장 성공 후 인재 목록/상세 쿼리가 stale 처리되거나 refetch된다.
- `/dashboard/profile/1` → `/talents` → `/talents/1` 이동에서 새로고침 없이 최신 값이 보인다.
- 관련 저장 플로우 테스트가 통과한다.

**커밋**

- `fix: 이력서 저장 후 인재 탐색 캐시 갱신`

## T5 - `/dashboard` 초기 공고 이미지 다양화

**보장할 동작**

초기 공고 카드와 상세 페이지가 공고별로 다른 demo 이미지를 사용한다.

**선행 테스트 / 선행 검증**

- `npm test -- lib/demo/__tests__/roleMockApi.test.ts app/dashboard/job-board/_components/__tests__/JobImages.test.tsx`를 먼저 실행한다.
- 공고 목록/상세 응답의 image URL이 직무별 demo 이미지로 분산되는 실패 테스트를 먼저 추가한다.

**작업**

- `demoPublicJobs.thumbnailImageUrl`과 `demoJobDetails.images`를 공고별 이미지로 맞춘다.
- 프론트엔드 공고는 `/demo/frontent-demo.png`, 백엔드는 `/demo/backend-demo.png`, 디자인은 `/demo/designer-demo.png`, 기타는 기존 cover류를 사용한다.
- 목록 카드와 상세 이미지 테스트 기대값을 갱신한다.

**완료 기준**

- `/dashboard` 공고 목록 응답에서 같은 이미지가 과도하게 반복되지 않는다.
- 공고 상세의 image carousel/detail 이미지도 목록과 같은 공고별 이미지를 사용한다.
- 관련 mock API/컴포넌트 테스트가 통과한다.

**커밋**

- `fix: 데모 공고별 이미지 분리`

## T6 - 최종 회귀 검증 및 평가 기록

**보장할 동작**

계획의 DoD가 테스트와 수동 검증으로 확인되고, GitHub에 올릴 파일 목록이 명확하다.

**선행 테스트 / 선행 검증**

- T1~T5의 관련 테스트가 모두 green이어야 한다.

**작업**

- `npm run lint`
- `npm run type-check`
- 관련 `npm test -- <pattern>`
- 가능하면 `npm run build`
- `git status --short`로 새 에셋 6개와 코드/테스트 변경이 모두 포함되어 있는지 확인한다.
- Level 2 기준 `.agents/evaluation.md` Stage 1/2를 확인하고 결과를 작업 기록 또는 PR 본문에 반영한다.

**완료 기준**

- 실행한 검증 명령과 결과가 기록된다.
- 새 에셋 6개가 커밋에 포함되어 GitHub push 대상임이 확인된다.
- 남은 수동 확인 항목이 있으면 PR 본문에 명시된다.

**커밋**

- `test: 데모 프로필 인재탐색 회귀 검증`

## 승인 대기

이 task 분할은 Level 2의 2단계 상세 작업 계획이다. 사용자 승인 후 T1부터 TDD 순서로 구현을 시작한다.
