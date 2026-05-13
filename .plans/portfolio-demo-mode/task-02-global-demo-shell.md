# T02 - Global Demo Shell

> depends on: T01

## 보장할 동작

초기 로딩과 페이지 전환 중 빈 화면 대신 LionConnect Demo 안내 로딩 UI가 보이고, 데모 안내/서버 종료 안내 모달을 전역에서 열 수 있다.

## 선행 테스트 / 선행 검증

- `rg --files app components contexts store | rg 'loading|Modal|Provider|Demo'`
- 기존 `ConfirmProvider`와 충돌하지 않는 전역 provider 위치 확인

## 작업

- `app/loading.tsx`를 추가해 CSS spinner/skeleton 기반 로딩 UI를 제공한다.
- `LionConnect Demo를 준비하고 있어요`와 `실제 서버 없이 Mock API로 페이지를 불러오는 중입니다.` 문구를 포함한다.
- 전역 demo provider/context 또는 store를 추가해 데모 안내 모달과 서버 종료 안내 모달 상태를 관리한다.
- 랜딩 첫 진입 안내는 sessionStorage 기준으로 한 세션 1회만 표시한다.
- 추후 이미지 교체 경로로 `public/demo/loading.gif` 또는 `public/demo/logo-loading.gif`를 주석이나 문서 task에 남길 수 있게 구조를 둔다.

## 완료 기준

- `/` 첫 진입 시 `포트폴리오 데모 안내` 모달이 표시된다.
- `데모 둘러보기`는 `/demo`로 이동하고, `계속 랜딩 보기`는 모달만 닫는다.
- 같은 세션에서 새로고침 시 자동 안내 모달이 반복 표시되지 않는다.
- 서버 종료 안내 모달을 전역 API로 열 수 있다.

## 커밋

- `feat: add global demo loading and modals`
