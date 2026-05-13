# T06 - Demo Hub Pages

> depends on: T04, T05

## 보장할 동작

`/demo`가 포트폴리오 검토자를 위한 허브가 되고, `/demo/dev-notes`가 기술 설명 페이지로 동작한다.

## 선행 테스트 / 선행 검증

- `find app -maxdepth 3 -type f | sort | rg 'demo|page.tsx'`
- role별 대표 라우트가 실제 존재하는지 확인

## 작업

- `app/demo/page.tsx`를 추가한다.
- 기업용/인재용/관리자용 데모 카드와 핵심 페이지 링크를 제공한다.
- 운영 종료, Mock API, 외부 DB 미사용, localStorage/메모리 저장 정책을 설명한다.
- 데모 데이터 초기화 버튼을 제공한다.
- 가능하면 `app/demo/dev-notes/page.tsx`를 추가해 API 계층과 이력서 저장 흐름을 설명한다.
- `이력서 저장 플로우 체험하기` 버튼을 인재 이력서 수정 화면으로 연결한다.

## 완료 기준

- `/demo`에서 세 역할 데모 진입이 가능하다.
- `/demo/dev-notes`에서 `ResumeForm -> useMutation -> domain API -> apiClient -> endpoint constants -> /api/demo Route Handler -> mock DB/localStorage` 흐름을 볼 수 있다.
- 실제 DB에 저장되지 않는다는 안내가 명확하다.

## 커밋

- `feat: add demo hub pages`
