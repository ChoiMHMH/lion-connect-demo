# Demo Hub, Inquiry, Assets, and Next Security Patch - Task 분할

> 원칙: 각 task는 1개 커밋 단위.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함:
  - `/demo` middleware 예외 처리로 인재 데모의 데모 허브 리다이렉트 수정
  - 관리자 문의 목록 행 클릭으로 `DONE` 상태 업데이트
  - 데모 채용공고 seed에 `public/demo` 이미지 2장 연결
  - 데모 허브 역할 CTA 문구 변경
  - `next`, `eslint-config-next`를 `15.5.18`로 업데이트
  - 관련 unit test 및 타입/린트 검증
- 미포함:
  - 관리자 문의 상세 페이지 구현
  - 실제 백엔드 API 계약 변경
  - Next 16 업그레이드 또는 React/기타 dependency 대규모 업그레이드
  - 새 디자인 시스템/컴포넌트 도입

## 의존성 순서

```text
T1 -> T2 -> T3 -> T4 -> T5
```

## T1 - Demo hub middleware access

**보장할 동작**

데모 인재 인증 상태에서도 `/demo`와 `/demo/...` 접근이 `/dashboard`로 리다이렉트되지 않는다. 기존 인재 사용자의 일반 루트 하위 경로 보호 동작은 유지한다.

**선행 테스트 / 선행 검증**

- `middleware.ts`를 직접 검증하는 unit test를 추가한다.
- 실패 테스트: demo talent cookie/role cookie가 있는 요청에서 `/demo`가 redirect 응답이 아니어야 한다.
- 회귀 테스트: 같은 인재 role이 일반 루트 하위 경로에 접근하면 기존처럼 `/dashboard`로 redirect 되어야 한다.

**작업**

- `middleware.ts`에 데모 공개 경로 predicate를 추가한다.
- 루트 하위 경로 리다이렉트 조건에서 `/demo` 경로를 제외한다.

**완료 기준**

- 새 middleware 테스트가 통과한다.
- 기업/관리자 데모의 `/demo` 접근 동작도 그대로 통과한다.

**커밋**

- `fix: allow demo hub for talent demo`

## T2 - Admin inquiry row done action

**보장할 동작**

관리자 문의 목록에서 `NEW` 또는 `IN_PROGRESS` 상태 행을 클릭하면 기존 상태 업데이트 API를 통해 `DONE`으로 변경된다. 이미 `DONE`인 행은 중복 요청하지 않는다.

**선행 테스트 / 선행 검증**

- `InquiriesPageContent` 또는 `InquiryListItem` 중심의 component test를 추가/수정한다.
- 실패 테스트: 행 클릭 시 `useUpdateInquiryStatus` mutation이 `{ id, status: "DONE" }`으로 호출된다.
- 실패 테스트: `DONE` 행 클릭 시 mutation이 호출되지 않는다.
- 가능하면 `lib/demo/__tests__/roleMockApi.test.ts`에 `PATCH /admin/inquiries/{id}/status` 후 목록 상태가 `DONE`으로 보이는 검증을 보강한다.

**작업**

- `InquiriesPageContent`에서 `useUpdateInquiryStatus`를 사용한다.
- `InquiryListItem`에 click handler를 전달하고, pending 중 중복 클릭을 최소화한다.
- UI 문구 추가 없이 현재 hover/cursor affordance를 유지한다.

**완료 기준**

- 관련 component/mock API 테스트가 통과한다.
- 행 클릭 후 문의 badge가 `Done`으로 갱신되는 수동 확인 기준이 남는다.

**커밋**

- `feat: mark demo inquiries done from list`

## T3 - Demo job images and hub labels

**보장할 동작**

데모 채용공고 목록/상세가 `public/demo/demo-cover.png`, `public/demo/demo-cover2.png`를 사용하고, 데모 허브 역할 CTA 문구가 `데모 시작` 대신 역할별 바로가기 문구로 표시된다.

**선행 테스트 / 선행 검증**

- `app/demo/__tests__/page.test.tsx`의 CTA 문구 기대값을 먼저 바꿔 실패를 확인한다.
- `lib/demo/__tests__/roleMockApi.test.ts`에서 공개 채용공고 목록/상세 이미지 URL이 `/demo/demo-cover...`를 포함하는지 검증한다.

**작업**

- `app/demo/page.tsx`의 역할별 CTA label을 명시적 문구로 변경한다.
- `lib/demo/roleSeed.ts`의 `thumbnailImageUrl`, 상세 `images`를 새 public asset 경로로 변경한다.
- `public/demo`의 기존 파일명은 유지한다.

**완료 기준**

- 데모 허브 테스트가 새 문구로 통과한다.
- mock API 테스트에서 채용공고 이미지 경로가 새 asset을 가리킨다.

**커밋**

- `fix: update demo hub labels and job images`

## T4 - Next 15 security patch

**보장할 동작**

프로젝트가 Next.js 15 보안 패치 라인인 `15.5.18`을 사용하고, Next ESLint config도 같은 버전으로 정렬된다.

**선행 테스트 / 선행 검증**

- `package.json`과 lockfile의 현재 버전을 확인한다.
- `npm install next@15.5.18 eslint-config-next@15.5.18 --package-lock-only`로 lockfile을 일관되게 갱신한다.

**작업**

- `package.json`의 `next`, `eslint-config-next`를 `15.5.18`로 변경한다.
- `package-lock.json`을 npm으로 갱신한다.

**완료 기준**

- `package.json`과 `package-lock.json`에서 두 패키지가 `15.5.18`로 확인된다.
- 별도 major upgrade나 unrelated dependency 변경이 없다.

**커밋**

- `chore: update next security patch`

## T5 - Verification and evaluation

**보장할 동작**

구현이 계획의 완료 기준을 충족하고 기존 데모 핵심 흐름을 깨지 않는다.

**선행 테스트 / 선행 검증**

- T1-T4 완료 후 실행한다.

**작업**

- 관련 vitest subset 실행
- `npm run type-check`
- `npm run lint`
- 필요 시 `npm run build` 실행
- Level 2 evaluation Stage 1/2 결과 확인

**완료 기준**

- 실행한 검증 결과와 생략한 검증 사유가 최종 응답에 기록된다.
- Contract Review에서 DoD와 task 기준이 `pass` 또는 남은 리스크가 명확히 기록된다.

**커밋**

- 별도 커밋 없음. 필요한 수정은 해당 task 커밋에 포함한다.
