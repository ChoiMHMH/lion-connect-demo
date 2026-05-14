# 데모 헤더 초기 렌더링과 Select 레이아웃 안정화 - Task 분할

> 원칙: 각 task는 1개 커밋 단위.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함:
  - 데모 cookie 기반 서버 초기 헤더 선택
  - `MemberHeader`, `CompanyHeader`, `AdminHeader`의 `initialDemoRole` 지원
  - Radix Select open 시 body scroll-lock 보정으로 생기는 화면 좌우 이동 방지
  - 인재 상세(`/talents/[talentId]`)에서 수정된 데모 썸네일 표시
  - 인재탐색 목록 카드 전체 클릭 라우팅
  - disabled가 아닌 버튼류 pointer cursor 기본화
  - 관련 테스트/정적 검증
- 미포함:
  - 데모 인증 모델 변경
  - 일반 로그인/토큰 복구 흐름 변경
  - Select 디자인/옵션 구조 개편
  - modal/dialog 전체 동작 재설계
  - 인재 상세 페이지 정보 구조 개편

## 의존성 순서

```text
T1 -> T2 -> T3 -> T4 -> T5
```

## T1 - 데모 헤더 초기 렌더링 테스트와 구현

**보장할 동작**

데모 cookie가 있는 서버 레이아웃에서는 클라이언트 auth store hydration 전에도 DemoHeader가 최초 렌더링된다.

**선행 테스트 / 선행 검증**

- `components/headers/__tests__/DemoHeader.test.tsx` 또는 새 헤더 테스트에서 `initialDemoRole`이 있으면 DemoHeader 브랜드/역할 메뉴가 보이는 케이스를 먼저 추가한다.
- 기존 demo header 테스트가 계속 통과하는지 확인한다.

**작업**

- `MemberHeader`, `CompanyHeader`, `AdminHeader`에 `initialDemoRole?: DemoRole | null` prop을 추가한다.
- auth store에서 복원된 demo role이 있으면 그 값을 우선하고, 없으면 `initialDemoRole`을 fallback으로 사용한다.
- `app/dashboard/layout.tsx`, `app/(company)/layout.tsx`, `app/admin/layout.tsx`에서 `cookies()`로 `DEMO_AUTH_COOKIE`를 읽고 `getDemoAuthProfile`로 유효한 role인지 확인한 뒤 헤더에 넘긴다.

**완료 기준**

- 데모 cookie가 있으면 일반 헤더를 거치지 않고 DemoHeader를 선택한다.
- cookie가 없으면 기존 일반 헤더 렌더링 경로가 유지된다.

**커밋**

- `fix: render demo header from server state`

## T2 - Select scroll-lock 레이아웃 이동 방지

**보장할 동작**

Radix Select 드롭다운을 열 때 body scroll-lock 보정이 viewport 폭이나 fixed/sticky 요소의 좌우 위치를 바꾸지 않는다.

**선행 테스트 / 선행 검증**

- `components/ui/select.tsx`, `app/globals.css`의 현재 scroll-lock 관련 구현을 정적 확인한다.
- 자동 DOM layout 검증이 어렵기 때문에 수동 확인 기준을 PR 본문에 남긴다.

**작업**

- `app/globals.css`의 `body[data-scroll-locked]` 보정을 확장해 inline `padding-right`, `margin-right`, `right` 보정 및 remove-scroll bar gap class 영향을 제거한다.
- 필요한 경우 `SelectContent` 설정은 기존 기능을 유지하는 범위에서만 조정한다.

**완료 기준**

- `/dashboard`의 직군 선택/직무 선택, 이력서 직군/직무 선택, 채용공고 직군/직무 선택 드롭다운을 열어도 화면 전체 좌우 이동이 없어야 한다.
- Select 옵션 표시/선택 동작은 기존과 동일하다.

**커밋**

- `fix: prevent select menu layout shift`

## T3 - 인재 상세 썸네일과 카드 클릭 동작 보정

**보장할 동작**

인재 데모에서 수정한 프로필 이미지가 기업 데모 인재 목록과 상세 소개 카드에 동일하게 보이고, 인재탐색 목록 카드 전체를 클릭해 상세로 이동할 수 있다.

**선행 테스트 / 선행 검증**

- 기존 `lib/demo/__tests__/resumeMockApi.test.ts`의 thumbnail upload complete 테스트가 목록과 상세 store 상태를 검증하는지 확인한다.
- `IntroduceCard` 렌더링 테스트를 추가하거나 기존 테스트가 없다면 컴포넌트 정적 검증으로 카드 전체 Link/이미지 src 우선순위를 확인한다.

**작업**

- `mapTalentDataToComponents` 또는 `IntroduceCard` props 전달을 정리해 상세 페이지에서도 `thumbnailUrl` 우선순위가 목록과 동일하게 적용되도록 한다.
- `IntroduceCard`에서 `showDetailButton`이 true인 목록 카드도 카드 전체를 상세 Link로 이동할 수 있게 한다.
- 상세 보기 CTA는 중첩 Link를 만들지 않고 카드 내 시각적 CTA로 유지하거나, 링크 래핑과 충돌하지 않는 구조로 변경한다.
- 목록 카드 hover 시 pointer cursor가 보이도록 적용한다.

**완료 기준**

- `/profiles/search`와 `/profiles/:id`가 같은 수정 썸네일 URL을 반환하고, 상세 소개 카드가 해당 URL을 이미지 source로 사용한다.
- `/talents`의 데모 인재 카드 전체가 클릭 가능한 상세 링크가 된다.

**커밋**

- `fix: sync demo talent detail card`

## T4 - 버튼 cursor 기본화

**보장할 동작**

disabled가 아닌 버튼류는 hover 시 pointer cursor가 기본 적용된다.

**선행 테스트 / 선행 검증**

- `app/globals.css` base layer에서 button cursor 규칙을 정적 확인한다.
- disabled 버튼은 `cursor-not-allowed` 또는 비활성 cursor가 유지되는지 확인한다.

**작업**

- 전역 base style에 `button:not(:disabled)` 및 필요한 role button selector의 pointer cursor를 추가한다.

**완료 기준**

- 일반 버튼류 hover cursor가 pointer로 통일된다.
- disabled 버튼의 비활성 cursor가 유지된다.

**커밋**

- `fix: normalize interactive cursors`

## T5 - 최종 검증과 PR 본문 업데이트

**보장할 동작**

추가 작업이 기존 draft PR에 반영되고 Level 2 evaluation 결과가 남는다.

**선행 테스트 / 선행 검증**

- `npm run type-check`
- `npm run lint`
- `npm test`
- `git diff --check`

**작업**

- `.agents/evaluation.md` Stage 1/2를 수행한다.
- draft PR #22 본문에 이번 추가 수정, 검증 결과, 수동 확인 기준을 업데이트한다.

**완료 기준**

- 작업트리가 깨끗하고 브랜치가 push되어 있다.
- PR #22에 변경 내용과 검증 결과가 반영되어 있다.

**커밋**

- 별도 코드 커밋 없음. 필요 시 plan/task 문서가 앞선 구현 커밋에 포함되지 않았다면 문서 커밋을 만든다.
