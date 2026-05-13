# T14 - Demo CTA and Anchor Navigation Polish

> depends on: T13

## 무엇을 / 왜

데모 진입 CTA와 기업 문의 anchor 이동을 더 명확하고 부드럽게 만들고, 기업 데모 헤더에서 기업 홈과 기업 문의 active underline이 동시에 보이는 혼선을 제거한다.

## 현재 상태

- 포트폴리오 안내 모달의 `데모 둘러보기` primary action은 `/demo`로 이동한다.
- 히어로 CTA는 안내 모달을 열고 있어 데모 허브 진입 의도가 한 단계 늦게 전달될 수 있다.
- 비데모 헤더의 기업 문의 링크는 `useNavigation`에서 smooth scroll을 처리한다.
- 데모 헤더의 기업 문의 링크는 일반 `Link href="/#business-connect"`라 hash 이동과 active 상태를 별도로 처리하지 않는다.

## 선택한 해결책

- 랜딩 히어로의 데모 CTA를 `/demo`로 직접 연결한다.
- 데모 헤더의 `/#business-connect` 클릭을 가로채서 smooth scroll로 이동한다.
- 데모 헤더에서 현재 hash를 추적해 `기업 문의`는 `#business-connect` 상태일 때만 active 처리한다.
- 기존 route active helper는 hash를 인자로 받아 기업 홈 `/`과 기업 문의 `/#business-connect`를 구분한다.

## 대안

- 대안: hash 기반 기본 브라우저 이동을 유지한다.
- 기각 이유: fixed header와 active underline 상태를 함께 제어하기 어렵고, 사용자가 말한 "너무 바로가는" 느낌을 줄이기 어렵다.

## 검증

- demo route helper 테스트로 `/`와 `#business-connect` active 상태를 구분한다.
- 데모 안내 context 테스트로 `데모 둘러보기`가 `/demo`로 이동하는 기존 계약을 유지한다.
- `npm run type-check`, `npm run lint`를 실행한다.

## 커밋

- `fix: polish demo cta and anchor navigation`
