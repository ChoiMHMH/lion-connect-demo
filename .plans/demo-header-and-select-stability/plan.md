# 데모 헤더 초기 렌더링과 Select 레이아웃 안정화

## 무엇을 / 왜

데모 모드에서 새로고침 직후 일반 랜딩/대시보드 헤더가 먼저 보이다가 DemoHeader로 바뀌는 깜빡임을 제거한다. 또한 `/dashboard` 직군/직무 선택, 채용공고 직군/직무 선택, 이력서 직군/직무 선택 등 Radix Select 기반 드롭다운을 열 때 화면 전체가 좌우로 살짝 이동하는 현상을 막는다.

추가로 인재 데모에서 수정한 프로필 이미지가 기업 데모 인재 상세(`/talents/[talentId]`)에서도 목록과 동일하게 보이도록 보정하고, 인재탐색 목록에서는 데모 인재 카드 전체가 클릭 가능한 상세 진입 영역이 되도록 한다. 버튼류 인터랙션은 비활성 상태를 제외하고 기본 pointer cursor가 적용되도록 정리한다.

작업 Level: Level 2
점수: 8/12
근거:
- 변경 범위: 2 - 데모 헤더 진입 경로, 공통 Select/전역 스타일, 인재 목록/상세 카드가 함께 영향을 받을 수 있다.
- 모호성: 1 - 헤더 원인은 명확하지만 드롭다운 이동은 scroll-lock 보정의 실제 런타임 동작 확인이 필요하다.
- 영향도: 2 - 공통 UI 렌더링/레이아웃과 인재 상세 라우팅/이미지 표시 동작 변경이다.
- 되돌리기 쉬움: 0 - 커밋 revert로 복구 가능하다.
- 테스트 가능성: 1 - 헤더는 단위 테스트 가능, 드롭다운은 정적 검증과 수동 확인이 필요하다.
- 새 지식 필요: 1 - Radix Select/react-remove-scroll의 body 보정 동작을 기존 전역 CSS와 맞춰야 한다.
강제 승격: 공용 UI 동작 변경
다음 프로토콜: `.agents/planning.md`의 Level 2

## 현재 상태 진단

- `MemberHeader`, `CompanyHeader`, `AdminHeader`는 클라이언트 컴포넌트에서 Zustand `auth-store`의 `user`를 읽은 뒤 `getDemoRoleByUser(user)`로 DemoHeader 여부를 결정한다.
- 새로고침 직후에는 persist hydration과 `useInitializeAuth`가 끝나기 전 `user`가 비어 있을 수 있어 일반 헤더가 먼저 렌더링된다. 이후 auth store가 복원되면 DemoHeader로 교체되어 사용자가 과거 랜딩/대시보드 헤더를 볼 수 있다.
- 데모 역할은 `lion-connect-demo-role` HttpOnly cookie에도 저장되어 있고, `app/dashboard/layout.tsx`, `app/(company)/layout.tsx`, `app/admin/layout.tsx`는 서버 레이아웃이므로 최초 렌더링 시 cookie를 읽어 헤더에 초기 demo role을 넘길 수 있다.
- `FilterSelect`와 `JobSelector`는 `components/ui/select.tsx`의 Radix Select를 사용한다.
- `app/globals.css`에는 이미 `html { scrollbar-gutter: stable; overflow-y: scroll; }`와 `body[data-scroll-locked]` margin/overflow 보정이 있다. 그래도 이동이 남는다면 react-remove-scroll이 body padding/right CSS variable 또는 fixed-position 보정 class를 적용하는 경우까지 막아야 한다.
- 인재 목록(`/talents`)은 `IntroduceCard`에 `thumbnailUrl`을 직접 전달해 수정된 데모 썸네일이 보인다.
- 인재 상세(`/talents/[talentId]`)은 `mapTalentDataToComponents`가 `profileImageUrl: data.thumbnailUrl`로 매핑하지만, 카드 컴포넌트와 상세 props 경로가 목록과 다르다. 테스트가 store 갱신만 검증하고 있어 실제 상세 컴포넌트 props에서 수정 썸네일을 우선 사용하는지 확인이 필요하다.
- `IntroduceCard`는 `showDetailButton`이 true면 카드 전체를 Link로 감싸지 않고 버튼만 상세 링크가 된다. 따라서 목록에서는 상세 버튼 클릭 외 카드 본문 클릭으로는 라우팅되지 않는다.
- 일부 `<button>` 요소는 개별 class에 `cursor-pointer`가 없어서 hover 시 기본 cursor가 일관되지 않다.

## 해결책

- 서버 레이아웃에서 demo role cookie를 읽고 `MemberHeader`/`CompanyHeader`/`AdminHeader`에 `initialDemoRole` prop으로 전달한다.
- 각 헤더 컴포넌트는 `initialDemoRole`이 있으면 hydration 전부터 DemoHeader를 렌더링하고, 이후 auth store의 demo role이 복원되면 그 값을 우선한다.
- cookie가 없거나 일반 사용자면 기존 헤더 동작을 유지한다.
- Radix Select가 열릴 때 body scroll-lock 보정이 viewport 폭/고정 요소 위치를 바꾸지 않도록 전역 CSS에서 `data-scroll-locked`, remove-scroll bar gap class, body inline padding/right 보정을 무력화한다.
- 드롭다운 자체의 위치/폭은 기존 `SelectContent`/`FilterSelect` 패턴을 유지해 기능 변경 없이 레이아웃 이동만 막는다.
- 인재 상세 소개 카드는 `thumbnailUrl`을 명시적으로 전달하거나 매핑 경로를 정리해 목록과 상세가 같은 데모 썸네일 우선순위를 사용하게 한다.
- `IntroduceCard`를 목록 카드 전체 클릭이 가능한 구조로 바꾸되, 상세 보기 버튼이 중첩 Link가 되지 않도록 버튼 표시 방식 또는 링크 래핑 조건을 조정한다.
- 전역 base style에서 disabled가 아닌 `button`과 `role="button"`에 pointer cursor를 적용하고, disabled는 not-allowed를 유지한다.

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| 서버 레이아웃에서 demo cookie를 읽어 헤더 초기 상태를 정한다 | 새로고침 첫 paint부터 DemoHeader가 나온다 | 해당 레이아웃이 cookie 의존 dynamic 렌더링이 된다 |
| 클라이언트에서 hydration 완료 전 헤더를 숨긴다 | 일반 헤더 깜빡임은 없앨 수 있다 | 헤더가 잠깐 비어 보이고 데모 사용자가 원하는 즉시 렌더링이 아니다 |
| 전역 scroll-lock 보정을 CSS로 고정한다 | 모든 Radix Select 드롭다운 이동을 한 번에 막는다 | 다른 modal/dialog가 같은 scroll-lock 보정에 기대고 있다면 별도 확인이 필요하다 |
| 인재 카드 전체를 상세 Link로 만든다 | 사용자가 카드 어디를 눌러도 상세로 이동한다 | 내부에 별도 인터랙션이 추가되면 중첩 클릭 처리를 신경 써야 한다 |
| 전역 button cursor를 기본화한다 | 버튼마다 `cursor-pointer` 누락을 반복 수정하지 않아도 된다 | 특수 버튼에서 다른 cursor를 원하면 개별 override가 필요하다 |

## 대안

1. **DemoHeader를 root provider에서 overlay로 항상 렌더링**
   - 기각 이유: 사용자가 지적한 것처럼 기존 헤더 위에 덮어씌우는 구조가 되고, 실제 원인인 초기 헤더 선택을 해결하지 못한다.

2. **각 SelectContent에만 별도 prop/class를 추가**
   - 기각 이유: 직군/직무 Select가 여러 컴포넌트에 흩어져 있고, 원인이 Radix scroll-lock의 body 보정이면 개별 Select 수정으로 누락이 생길 수 있다.

3. **일반 헤더에서 demo localStorage를 직접 읽어 동기 초기화**
   - 기각 이유: localStorage는 서버 렌더링에서 사용할 수 없어 첫 paint 문제를 안정적으로 해결하지 못한다.

4. **인재 목록 카드의 상세 보기 버튼만 유지**
   - 기각 이유: 사용자가 카드 전체 클릭 진입을 명시했고, 현재는 큰 카드 UI에 비해 클릭 타깃이 작다.

5. **cursor-pointer 누락 버튼을 보이는 곳마다 개별 수정**
   - 기각 이유: 누락을 계속 만들기 쉬우며, 공통 base style로 처리하는 편이 더 일관적이다.

## 완료 기준 (DoD)

- [ ] 데모 cookie가 있는 상태에서 `/dashboard`, `/`, `/admin` 레이아웃 최초 렌더링부터 DemoHeader가 선택된다.
- [ ] 데모 cookie가 없는 일반 사용자/비로그인 상태의 기존 헤더 동작은 유지된다.
- [ ] `MemberHeader`, `CompanyHeader`, `AdminHeader`가 auth store hydration 전에도 `initialDemoRole`을 사용한다.
- [ ] `/dashboard` 직군 선택, 직무 선택, 이력서 직군/직무 선택에서 드롭다운을 열어도 화면 전체가 좌우 이동하지 않는다.
- [ ] 인재 데모에서 바꾼 프로필 이미지가 기업 데모 인재 목록과 `/talents/[talentId]` 상세 소개 카드에 동일하게 표시된다.
- [ ] 인재탐색 목록의 인재 카드 전체가 hover pointer 상태가 되고 클릭 시 상세 페이지로 이동한다.
- [ ] disabled가 아닌 일반 버튼류는 hover 시 pointer cursor가 적용된다.
- [ ] 관련 헤더 테스트 또는 정적 검증을 추가/수정한다.
- [ ] `npm run type-check`, `npm run lint`, `npm test`를 통과시킨다.
