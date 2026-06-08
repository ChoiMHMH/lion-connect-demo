# 랜딩 첫 화면 이미지와 데모 UX 개선

## 무엇을 / 왜

기업용 첫 랜딩(`/`)에서 히어로 이미지가 회색으로 늦게 보이는 체감 속도를 줄이고, 첫 화면 안에서 스크롤 다운 버튼이 보이도록 레이아웃을 보정한다.

동시에 포트폴리오 데모 UX를 사용자가 요청한 기준으로 맞춘다. Demo API Log 패널은 처음부터 열려 있어야 하고, 데모 안내 모달에서는 `계속 랜딩 보기`를 주황색 주 버튼으로 우선 배치하며 `데모 둘러보기` 문구를 `데모 설명 보기`로 바꾼다.

작업 Level: Level 2
점수: 7/12
근거:
- 변경 범위: 2 - 랜딩 히어로, 데모 안내 모달, Demo API Log, 테스트와 성능 측정이 함께 영향을 받는다.
- 모호성: 1 - 목표는 명확하지만 "SSR로 이미지"의 실제 원인은 자산 크기/Next Image 최적화/애니메이션을 검증해야 한다.
- 영향도: 1 - 인증/API 계약 변경은 없고 첫 화면 UI와 데모 보조 UI 중심이다.
- 되돌리기 쉬움: 1 - 자산 교체와 컴포넌트 변경은 커밋 revert로 되돌릴 수 있다.
- 테스트 가능성: 2 - 체감 속도는 로컬 빌드/브라우저 성능 수치와 UI 테스트를 함께 설계해야 한다.
- 새 지식 필요: 1 - Next Image preload/optimizer 동작과 Playwright 측정 방식을 확인해야 한다.
강제 승격: 리팩토링
다음 프로토콜: `.agents/planning.md`의 Level 2

## 현재 상태 진단

- `app/(company)/_components/HeroSection.tsx`는 서버 컴포넌트이고 `next/image`에 `priority`를 사용한다. SSR 자체는 이미 적용되어 있다.
- 히어로 배경 원본 `public/images/hero-image.png`는 `8192x3272` PNG이고 파일 크기가 약 `43M`이다. 첫 방문에서 Next 이미지 최적화가 이 원본을 처리하면 첫 화면이 회색으로 길게 보일 수 있다.
- 히어로 이미지에 `animate-[fadeInZoom_1.5s_ease-out_forwards]`가 적용되어 시작 opacity가 `0`이다. 이미지가 준비되어도 1.5초 동안 늦게 보이는 체감이 생긴다.
- `app/(company)/layout.tsx`가 fixed header 보정으로 children 전체에 `pt-20`을 적용한다. 그런데 히어로는 `h-screen`이라 실제 첫 viewport보다 80px 더 길어져 하단 `ScrollDownButton`이 첫 화면에서 밀릴 수 있다.
- `components/demo/DemoApiLogPanel.tsx`는 `isOpen` 기본값이 `false`라 첫 진입에는 접힌 상태다.
- `contexts/DemoGuideContext.tsx`의 portfolio 안내는 `primaryLabel: "데모 둘러보기"`, `secondaryLabel: "계속 랜딩 보기"`이고 주황색 버튼은 `/demo` 이동 액션이다.
- 관련 테스트는 이미 있다.
  - `contexts/__tests__/DemoGuideContext.test.tsx`
  - `components/demo/__tests__/DemoApiLogPanel.test.tsx`
  - `e2e/portfolio-demo.spec.ts`

## 해결책

- 히어로 첫 화면은 "이미 SSR 컴포넌트" 전제를 유지하고, 병목인 43M PNG와 opacity 시작 애니메이션을 줄인다.
  - 원본은 보존하고 랜딩 히어로 전용 경량 WebP/AVIF 자산을 생성한다.
  - `next/image`는 `priority`와 명시적 `fetchPriority="high"`를 유지/추가한다.
  - 배경 이미지는 첫 paint에서 opacity 1로 렌더링하고, 필요한 경우 transform 중심의 짧은 애니메이션만 남긴다.
- 히어로 섹션 높이를 header offset에 맞춘다.
  - 랜딩 히어로 높이를 `min-h-[calc(100svh-80px)]` 계열로 조정한다.
  - `ScrollDownButton`은 첫 viewport 내부에서 보이도록 bottom 값을 보정하고, SSR 초기 markup에서도 기본 visible 상태가 되게 한다.
  - 스크롤 대상 offset은 fixed header 높이 기준으로 명확히 계산한다.
- Demo API Log는 기본 open으로 바꾼다.
  - `isOpen` 초기값을 `true`로 변경한다.
  - 기존 토글/비우기 동작은 유지한다.
- 데모 안내 모달의 portfolio CTA 우선순위를 바꾼다.
  - `계속 랜딩 보기`가 주황색 주 버튼이 되고 닫기 액션을 수행한다.
  - `/demo` 이동 버튼 문구는 `데모 설명 보기`로 바꾸고 보조 버튼 스타일로 둔다.
  - serverClosed 모달은 기존 `데모 페이지로 이동` 주 액션을 유지한다.
- 전후 수치화는 자동화 가능한 지표와 산출물 크기를 함께 기록한다.
  - 자산 byte size: 기존 PNG vs 신규 WebP/AVIF.
  - 로컬 production build 기준 첫 히어로 이미지 request 완료 시간 또는 Playwright `performance.getEntriesByName(...)`의 duration/transferSize.
  - 첫 화면 버튼 가시성은 Playwright screenshot/locator로 확인한다.

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| 경량 히어로 자산 생성 | 첫 방문 cold image optimize와 전송량을 직접 줄인다 | 새 파생 자산을 관리해야 한다 |
| Next Image 최적화만 신뢰 | 코드 변경이 작다 | 43M 원본 cold processing 문제와 첫 방문 지연이 남을 수 있다 |
| 배경 이미지 opacity 애니메이션 제거 | 이미지가 처음부터 보인다 | 기존 fade-in 연출은 약해진다 |
| 랜딩 히어로 높이를 header 제외 viewport로 조정 | 스크롤 버튼이 첫 화면 안에 들어온다 | 다른 섹션 간격과 첫 화면 구도가 약간 달라질 수 있다 |

## 대안

1. **`unoptimized`로 원본 PNG를 직접 내려준다**
   - 기각 이유: Next optimizer 비용은 줄지만 43M 전송량이 그대로라 첫 진입 속도 문제를 악화시킨다.

2. **단순히 `priority`만 유지하고 CSS만 수정한다**
   - 기각 이유: opacity 지연은 줄 수 있지만 가장 큰 병목인 43M 원본 처리가 남는다.

3. **레이아웃의 `pt-20`을 제거한다**
   - 기각 이유: 다른 기업용 하위 페이지가 fixed header 아래에 가려질 수 있어 랜딩 히어로에 국소 보정하는 편이 안전하다.

4. **DemoGuide portfolio 액션을 데이터 구조 없이 조건문으로만 뒤집는다**
   - 기각 이유: serverClosed 모달과 portfolio 모달의 액션 의미가 달라져 테스트하기 어렵다. modal type별 주/보조 액션 의미를 명시하는 쪽이 안전하다.

## 완료 기준 (DoD)

- [ ] `/` 첫 화면 히어로 배경은 회색 placeholder/fade delay 없이 처음부터 이미지로 보인다.
- [ ] 기존 `public/images/hero-image.png`보다 훨씬 작은 히어로 전용 자산이 사용된다.
- [ ] production build 기준 전/후 자산 크기와 로컬 이미지 로딩 지표가 기록된다.
- [ ] 첫 viewport에서 `다음 섹션으로 스크롤` 버튼이 header offset 때문에 가려지지 않는다.
- [ ] `다음 섹션으로 스크롤` 버튼 클릭 시 `benefits-section`이 fixed header 아래로 자연스럽게 이동한다.
- [ ] Demo API Log 패널은 데모 모드에서 처음부터 펼쳐져 있다.
- [ ] portfolio 데모 안내 모달에서 `계속 랜딩 보기`가 주황색 주 버튼이고, 클릭 시 모달을 닫는다.
- [ ] portfolio 데모 안내 모달에서 `/demo` 이동 버튼 문구는 `데모 설명 보기`다.
- [ ] serverClosed 모달의 `데모 페이지로 이동` 주 액션은 유지된다.
- [ ] 관련 unit/e2e 테스트가 변경된 UI 계약을 검증한다.
- [ ] `npm run type-check`, `npm run lint`, 관련 `npm test`가 통과한다.
