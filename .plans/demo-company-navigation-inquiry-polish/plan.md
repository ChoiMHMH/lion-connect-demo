# Demo Company Navigation and Inquiry Polish

## 무엇을 / 왜

기업 데모 및 기업 랜딩에서 네비게이션 active underline, 기업 문의 anchor 이동, 활동 대학 목록 접기 애니메이션, 데모 문의 제출 실패를 수정한다.

사용자가 기대하는 동작은 다음과 같다.

- 기업 데모에서 `기업 문의`를 누른 뒤 `기업 홈`을 누르면 active underline이 기업 홈으로 즉시 돌아온다.
- 기업 홈의 `멋쟁이사자처럼 활동 대학` 목록은 더보기뿐 아니라 접기도 부드럽게 닫힌다.
- 기업 문의 폼 제출이 데모/실사용 흐름에서 오류 없이 완료된다.
- 인재 탐색/채용 등록 등 다른 기업 페이지에서 `기업 문의`를 누르면 기업 홈 상단을 거치지 않고 바로 문의 섹션으로 이동한다.
- 기업 홈에서 `기업 문의`를 누르면 smooth scroll로 이동하고, 현재보다 약 40px 더 위쪽에 멈춘다.

## 현재 상태 진단

- `components/headers/DemoHeader.tsx`가 hash 상태를 `hashchange/popstate`로 추적하지만, `router.push("/")`나 `Link href="/"` 후 hash 정리가 일관되지 않으면 기업 홈과 기업 문의 active 상태 전환이 어긋날 수 있다.
- `hooks/common/useNavigation.ts`와 `components/headers/DemoHeader.tsx`가 각각 `/#business-connect` scroll offset을 직접 계산한다. 다른 페이지에서 `router.push("/")` 후 `setTimeout`으로 섹션을 찾기 때문에 landing dynamic import 타이밍에 따라 맨 위로 먼저 보이거나 한 번 더 눌러야 하는 문제가 생길 수 있다.
- 현재 offset은 header 높이 `80px`만 빼므로 섹션 상단이 헤더에 가깝다. 요청대로 약 40px 더 위쪽에 멈추려면 `80 + 40 = 120px` offset을 적용해야 한다.
- `app/(company)/_components/UniversityGridSection/UniversityGridSection.tsx`는 접기 시 `displayedUniversities`를 즉시 28개로 줄이고 `max-h-[600px]`를 바로 적용한다. exit animation 전에 레이아웃이 잘려 닫힘이 빠르고 부자연스럽게 보인다.
- `lib/demo/mockApi.ts`는 관리자 문의 조회/상태 변경만 mock하고 `POST /inquiries` handler가 없다. 데모 인증 상태에서 공개 문의 제출도 demo API로 라우팅되어 `No demo API handler for POST /inquiries` 에러가 발생할 수 있다.
- `types/inquiry.ts`의 생성 요청은 `agreePrivacy`를 사용하지만 목록 모델은 `privacyPolicyAgreed`를 사용한다. 실제 API 계약이 어느 이름을 받는지 재확인이 필요하지만, 이번 데모 실패는 우선 mock handler 부재로 해결 가능하다.

## 해결책

- 기업 문의 anchor 이동 계산을 공통 helper로 분리하거나 기존 훅/데모 헤더 양쪽에 동일한 offset/재시도 로직을 적용한다.
- 다른 페이지에서 `기업 문의` 클릭 시 `/#business-connect` 목적지를 유지하고, 홈 렌더 후 섹션이 나타날 때까지 짧게 재시도하여 한 번의 클릭으로 바로 이동하게 한다.
- `기업 홈` 클릭 시 hash와 `currentHash`를 명시적으로 비워 `기업 문의` active underline이 남지 않게 한다.
- 대학 목록 접기는 항목 수를 즉시 줄이지 않고 컨테이너 height/max-height와 opacity/layout transition이 끝난 뒤 collapsed 목록으로 전환되게 조정한다.
- 데모 mock API에 `POST /inquiries`를 추가하고 `roleStore`에 문의 생성 함수를 추가한다. 요청 payload를 `Inquiry` 형태로 저장하고 201 또는 204 응답을 반환한다.
- 문의 제출 hook은 필요한 경우 성공 응답 형태에 의존하지 않도록 유지하고, 에러 로그는 실제 메시지가 보이도록 확인한다.

## 트레이드오프

- 섹션 도착을 재시도하는 방식은 dynamic import 타이밍에 견고하지만, 너무 긴 재시도는 클릭 후 반응이 늦어 보일 수 있다. 짧은 횟수와 간격으로 제한한다.
- 접기 애니메이션을 자연스럽게 만들려면 내부 상태가 늘어난다. 대신 기존 카드/필터 UI는 건드리지 않고 이 섹션 내부로만 범위를 제한한다.
- 실제 API 계약까지 바꾸면 백엔드 계약 확인이 필요하다. 이번 작업에서는 데모 제출 실패를 mock handler로 해결하고, 실제 API payload 필드명 변경은 네트워크 응답으로 확인되는 경우에만 최소 수정한다.

## 대안

- 대안: `scroll-margin-top` CSS만 추가하고 기존 Link/hash 기본 동작에 맡긴다.
- 기각 이유: 다른 페이지에서 dynamic section이 아직 렌더되지 않은 경우 한 번의 클릭으로 이동하지 못하는 문제를 해결하지 못한다.

- 대안: 대학 목록 접기에서 단순히 `transition-[max-height]`만 추가한다.
- 기각 이유: 현재는 항목 배열 자체가 즉시 줄어들어 exit/layout animation 전에 내용이 사라지는 문제가 남는다.

- 대안: 문의 제출 API를 실제 백엔드 endpoint만 대상으로 수정한다.
- 기각 이유: 현재 재현 조건이 기업 데모이고 demo API routing 경로가 명확하므로 mock handler 보강이 우선이다.

## 완료 기준

- [ ] 데모 기업 홈에서 `기업 문의` 클릭 후 underline이 기업 문의에 표시되고, `기업 홈` 클릭 후 기업 홈에 표시된다.
- [ ] `/talents`, `/jobs`에서 데모/기업 헤더의 `기업 문의`를 한 번 누르면 홈 상단을 거치지 않고 문의 섹션 위치로 이동한다.
- [ ] 기업 홈에서 `기업 문의` 클릭 시 smooth scroll이 적용되고, 기존보다 약 40px 위쪽 offset으로 멈춘다.
- [ ] 대학 목록 `접기`가 더보기와 비슷하게 부드럽게 닫힌다.
- [ ] 데모 기업 문의 폼 제출이 성공 alert까지 도달하고 관리자 문의 목록 mock store에 저장된다.
- [ ] 관련 unit test를 추가/수정하고 `npm run type-check`, `npm run lint`, 필요한 vitest subset을 실행한다.
