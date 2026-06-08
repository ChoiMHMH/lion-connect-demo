# 랜딩 첫 화면 이미지와 데모 UX 개선 - Task 분할

> 원칙: 각 task는 1개 커밋 단위.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함:
  - 기업용 랜딩 히어로 이미지 첫 paint 개선
  - 히어로/스크롤 버튼 header offset 보정
  - Demo API Log 기본 펼침
  - portfolio 데모 안내 모달 CTA 우선순위와 문구 변경
  - 전/후 자산 크기와 로컬 로딩 지표 기록
  - 관련 unit/e2e 테스트 갱신
- 미포함:
  - 운영 인증/권한 흐름 변경
  - 데모 API 계약 변경
  - 랜딩 전체 디자인 개편
  - 기존 히어로 원본 삭제

## 의존성 순서

```text
T1 -> T2 -> T3 -> T4 -> T5
```

## T1 - 기준 수치와 회귀 테스트 고정

**보장할 동작**

현재 문제를 수치와 테스트로 고정한다. 히어로 원본 크기, 첫 화면 스크롤 버튼 가시성, Demo API Log 기본 open, 데모 안내 CTA 문구/우선순위를 검증 기준으로 남긴다.

**선행 테스트 / 선행 검증**

- `du -h public/images/hero-image.png`
- `file public/images/hero-image.png`
- `npm test -- contexts/__tests__/DemoGuideContext.test.tsx components/demo/__tests__/DemoApiLogPanel.test.tsx`

**작업**

- `contexts/__tests__/DemoGuideContext.test.tsx`에서 portfolio 모달의 주 버튼이 `계속 랜딩 보기`, 보조 이동 버튼이 `데모 설명 보기`임을 기대하도록 테스트를 바꾼다.
- `components/demo/__tests__/DemoApiLogPanel.test.tsx`에서 demo mode 렌더 직후 로그 리스트 영역이 보이는 기대를 추가한다.
- 가능하면 `e2e/portfolio-demo.spec.ts`에 첫 랜딩에서 `다음 섹션으로 스크롤` 버튼이 visible인 기대를 추가한다.
- 기준 자산 크기와 이미지 메타데이터를 작업 기록에 남긴다.

**완료 기준**

- 변경된 테스트가 현재 구현의 계약 불일치를 드러낸다.
- 기준 수치가 최종 전/후 비교에 사용할 수 있게 남아 있다.

**커밋**

- `test: cover landing first paint demo ui contracts`

## T2 - 히어로 경량 자산 생성과 SSR 첫 표시 개선

**보장할 동작**

랜딩 첫 화면 배경은 기존 43M PNG가 아니라 경량 히어로 자산으로 렌더링되고, 이미지 자체는 첫 paint부터 opacity 1로 보인다.

**선행 테스트 / 선행 검증**

- T1 테스트
- 신규 자산 생성 전후 `du -h` 비교

**작업**

- 기존 `public/images/hero-image.png`는 보존한다.
- 동일 이미지를 랜딩용 해상도로 축소한 WebP 자산을 생성한다.
- `HeroSection`의 기본 `backgroundImage`를 신규 경량 자산으로 바꾼다.
- `Image`에 `priority`, `fetchPriority="high"`, 적절한 `sizes`를 유지/명시한다.
- 이미지 자체의 opacity 0 시작 애니메이션을 제거하거나 첫 paint를 막지 않는 스타일로 줄인다.

**완료 기준**

- 신규 자산 크기가 기존 43M보다 현저히 작다.
- `/` 서버 렌더 markup에서 히어로 이미지 preload 경로가 신규 자산을 가리킨다.
- 히어로 배경이 로딩 애니메이션 때문에 의도적으로 숨겨지지 않는다.

**커밋**

- `refactor: use lightweight landing hero image`

## T3 - 히어로 높이와 스크롤 버튼 보정

**보장할 동작**

fixed header가 있는 상태에서도 첫 viewport 안에 히어로 CTA와 `다음 섹션으로 스크롤` 버튼이 보이고, 버튼 클릭 시 다음 섹션이 header 아래로 이동한다.

**선행 테스트 / 선행 검증**

- T1 e2e 또는 수동 Playwright 확인
- `npm test --` 관련 컴포넌트 테스트가 있으면 함께 실행

**작업**

- `HeroSection` 높이를 `h-screen` 고정에서 header 높이를 고려한 `min-h-[calc(100svh-80px)]` 계열로 보정한다.
- 모바일 viewport도 깨지지 않도록 `svh`/fallback 조합을 검토한다.
- `ScrollDownButton`의 초기 SSR 상태를 visible 기준으로 바꾸거나 hydration 전 숨김을 제거한다.
- 스크롤 offset을 fixed header 높이 기준으로 명확히 정리한다.

**완료 기준**

- desktop viewport에서 스크롤 버튼이 첫 화면에 visible이다.
- 버튼 클릭 후 `benefits-section`이 header에 가리지 않는다.
- 히어로 내용과 버튼이 서로 겹치지 않는다.

**커밋**

- `fix: keep landing scroll cue in first viewport`

## T4 - Demo API Log와 데모 안내 CTA 수정

**보장할 동작**

Demo API Log는 처음부터 열려 있고, portfolio 데모 안내 모달은 `계속 랜딩 보기`를 주황색 주 버튼으로 표시한다. `/demo` 이동 문구는 `데모 설명 보기`다.

**선행 테스트 / 선행 검증**

- `npm test -- contexts/__tests__/DemoGuideContext.test.tsx components/demo/__tests__/DemoApiLogPanel.test.tsx`

**작업**

- `components/demo/DemoApiLogPanel.tsx`의 `isOpen` 기본값을 `true`로 바꾼다.
- `contexts/DemoGuideContext.tsx`에서 portfolio 모달의 primary action을 닫기, secondary action을 `/demo` 이동으로 분리한다.
- portfolio `/demo` 이동 버튼 문구를 `데모 설명 보기`로 바꾼다.
- serverClosed 모달의 기존 primary 이동 액션은 유지한다.

**완료 기준**

- Demo API Log 렌더 직후 리스트 영역 또는 빈 상태 문구가 보인다.
- `계속 랜딩 보기` 클릭 시 모달이 닫히고 router push는 호출되지 않는다.
- `데모 설명 보기` 클릭 시 `/demo`로 이동한다.
- `데모 페이지로 이동` serverClosed 동작은 유지된다.

**커밋**

- `fix: open demo log and prioritize landing cta`

## T5 - 전후 수치화와 전체 검증

**보장할 동작**

변경 후 성능/크기 개선과 UI 계약을 검증하고, Level 2 evaluation Stage 1/2를 통과한다.

**선행 테스트 / 선행 검증**

- T1~T4 완료

**작업**

- 기존/신규 히어로 자산 byte size를 비교한다.
- production build 또는 dev 서버 + Playwright로 히어로 이미지 request timing을 측정한다.
- 가능하면 desktop viewport screenshot으로 첫 화면 버튼 가시성을 확인한다.
- `npm run type-check`
- `npm run lint`
- `npm test -- contexts/__tests__/DemoGuideContext.test.tsx components/demo/__tests__/DemoApiLogPanel.test.tsx`
- 필요 시 `npm run test:e2e -- e2e/portfolio-demo.spec.ts`
- `.agents/evaluation.md` Stage 1/2 형식으로 계약 검토를 남긴다.

**완료 기준**

- 전/후 수치가 최종 응답에 포함된다.
- type-check/lint/관련 unit test가 통과한다.
- e2e를 실행하지 못하면 이유와 대체 검증을 남긴다.

**커밋**

- `test: verify landing first paint polish`
