# 데모 이력서 이미지, 고정 액션 버튼, 드롭다운 스크롤 안정화 - Task 분할

> 원칙: 각 task는 1개 커밋 단위.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함:
  - 데모 이력서 썸네일 업로드 완료 후 기업 데모 인재 탐색 목록/상세 썸네일 동기화
  - 기업 채용 공고 등록/수정 submit 버튼 sticky 처리
  - 인재 이력서 작성 임시 저장/작성 완료 영역 sticky 처리
  - 공통 Select 드롭다운 open 시 스크롤바 영역 유지
  - 관련 mock API 테스트와 타입/린트 검증
- 미포함:
  - 운영 API 계약 변경
  - 실제 파일 저장소/S3 동작 변경
  - 데모 seed의 인물 사진 자산 추가
  - Header/전체 레이아웃 리디자인

## 의존성 순서

```text
T1 -> T2 -> T3 -> T4
```

## T1 - 데모 썸네일 동기화

**보장할 동작**

인재 데모에서 `/profile/:id/thumbnail` 업로드 완료 API를 호출하면 같은 `profileId`의 기업 데모 인재 목록과 상세 응답의 `thumbnailUrl`이 업로드 URL로 바뀐다.

**선행 테스트 / 선행 검증**

- `lib/demo/__tests__/resumeMockApi.test.ts`에 thumbnail complete 이후 `/profiles/search`와 `/profiles/:id` 응답이 업로드 URL을 내려주는 실패 테스트를 먼저 추가한다.
- `npm test -- lib/demo/__tests__/resumeMockApi.test.ts`로 red를 확인한다.

**작업**

- `lib/demo/roleStore.ts`에 데모 인재 썸네일 갱신 함수를 추가한다.
- `lib/demo/resumeStore.ts`의 thumbnail complete 처리에서 profile `storageUrl`과 updatedAt을 갱신한다.
- `lib/demo/mockApi.ts`에서 thumbnail complete 이후 role store 동기화 함수를 호출한다.

**완료 기준**

- 추가한 테스트가 green이다.
- 기존 portfolio upload complete 테스트가 깨지지 않는다.

**커밋**

- `feat: sync demo resume thumbnail to talent search`

## T2 - 채용 공고 폼 submit 버튼 sticky 처리

**보장할 동작**

기업 데모 채용 공고 등록/수정 버튼은 기존 우측 위치에서 시작하고, 폼을 스크롤하면 viewport 상단에서 일정 간격을 두고 계속 보인다.

**선행 테스트 / 선행 검증**

- 변경 전 `components/job/JobForm.tsx`의 submit 버튼 컨테이너 위치와 disabled/submitting 조건을 확인한다.
- UI class 변경 중심이라 별도 단위 테스트 대신 `npm run type-check` 대상에 포함한다.

**작업**

- submit 버튼을 감싼 우측 컬럼에 `sticky`, `top-*`, `self-start` 계열 class를 적용한다.
- 기존 disabled/data-state/isSubmitting 로직은 유지한다.

**완료 기준**

- submit 버튼의 텍스트, disabled 조건, submit type이 변경되지 않는다.
- sticky class가 우측 버튼 컨테이너에만 적용된다.

**커밋**

- `feat: keep job submit action sticky while scrolling`

## T3 - 이력서 작성 액션 nav sticky 처리

**보장할 동작**

인재 데모 이력서 작성 화면의 임시 저장/작성 완료 버튼은 기존 상단 nav 위치에서 시작하고, 스크롤 시 상단 간격을 두고 계속 보인다.

**선행 테스트 / 선행 검증**

- `TalentRegisterNav`의 debounce 임시 저장, form submit 연결, 제목 input register 흐름을 확인한다.
- UI class 변경 중심이라 별도 단위 테스트 대신 기존 submit integration 테스트와 type-check 영향만 확인한다.

**작업**

- `app/dashboard/profile/[profileId]/_components/TalentRegisterNav.tsx` nav에 sticky/top/z-index/background class를 적용한다.
- absolute 중앙 제목 input이 sticky nav 안에서 기존처럼 동작하는지 class 충돌을 점검한다.

**완료 기준**

- 임시 저장 debounce와 작성 완료 submit 연결이 변경되지 않는다.
- nav가 스크롤 중 다른 섹션 뒤로 묻히지 않는다.

**커밋**

- `feat: keep resume form actions sticky while scrolling`

## T4 - Select 드롭다운 scroll gutter 유지

**보장할 동작**

공통 Radix Select 드롭다운을 열어도 body/html 스크롤바 영역이 유지되어 화면 폭이 변하지 않는다.

**선행 테스트 / 선행 검증**

- `components/ui/select.tsx`와 `app/globals.css`에서 Radix Select Portal 및 현재 `scrollbar-gutter` 설정을 확인한다.
- CSS/overlay 동작이라 단위 테스트 대신 `npm run type-check`, `npm run lint`, 수동 확인 기준으로 검증한다.

**작업**

- `SelectContent`에 필요한 Radix prop을 추가해 드롭다운 자체 동작은 유지한다.
- `app/globals.css`에 Radix scroll lock 상태에서도 `html`/`body`가 scroll gutter를 유지하는 전역 보정을 추가한다.
- Select 외 overlay 영향이 커지지 않도록 selector를 Radix가 body에 부여하는 scroll lock attribute 중심으로 제한한다.

**완료 기준**

- 공통 Select 사용처에서 추가 prop 없이 적용된다.
- type-check와 lint를 통과한다.
- 수동 확인: 인재 탐색 필터/이력서 직무 선택/채용 공고 직무 선택 dropdown open 시 화면 폭 흔들림이 없어야 한다.

**커밋**

- `fix: preserve scrollbar gutter while select is open`

## 최종 검증

- `npm test -- lib/demo/__tests__/resumeMockApi.test.ts`
- `npm run type-check`
- `npm run lint`
- Contract Review: `.agents/evaluation.md` Stage 2 형식으로 plan/task DoD를 대조한다.
