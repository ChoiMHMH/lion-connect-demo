# T05 - Demo Header Navigation

> depends on: T04

## 보장할 동작

데모 모드에서 모든 주요 페이지 헤더가 `LionConnect Demo`로 표시되고, 선택한 역할의 하위 메뉴가 확장되며 현재 메뉴가 명확한 active 스타일로 표시된다.

## 선행 테스트 / 선행 검증

- `sed -n '1,180p' components/headers/CompanyHeader.tsx`
- `sed -n '1,180p' components/headers/MemberHeader.tsx`
- `sed -n '1,140p' components/headers/AdminHeader.tsx`
- 실제 존재하는 role별 라우트 목록 확인

## 작업

- `constants/demoRoutes.ts` 또는 동등한 route map을 만든다.
- `components/headers/DemoHeader.tsx`를 추가해 동일한 헤더 색상/톤을 유지한다.
- 역할 클릭 시 demo role을 설정하고 해당 대표 페이지로 이동한다.
- 현재 pathname 기준으로 role과 하위 메뉴 active 상태를 계산한다.
- 기존 Company/Member/AdminHeader는 보존하고 demo mode에서만 DemoHeader를 렌더링한다.
- 레이아웃별 header 분기를 적용한다.

## 완료 기준

- 로고/서비스명은 `LionConnect Demo`로 표시된다.
- 기업용 화면에서는 기업용 하위 메뉴가 확장된다.
- 인재용 화면에서는 인재용 하위 메뉴가 확장된다.
- 관리자용 화면에서는 관리자용 하위 메뉴가 확장된다.
- 현재 선택된 하위 메뉴는 underline/bold/border-bottom 등으로 명확히 표시된다.
- 헤더 색상은 역할별로 달라지지 않는다.

## 커밋

- `feat: add role aware demo header`
