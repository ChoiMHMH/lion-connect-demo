# Demo Hub, Inquiry, Assets, and Next Security Patch

## 무엇을 / 왜

포트폴리오 검토용 데모에서 리뷰어가 바로 확인하는 흐름의 마찰을 줄이고, 현재 프로젝트가 해당되는 Next.js 15 보안 패치를 적용한다.

요청 범위는 다음과 같다.

- 인재 데모에서 헤더의 `데모 허브` 클릭 시 `/demo`가 아니라 `/dashboard`로 리다이렉트되는 문제 수정
- 관리자 데모의 기업 문의 목록 행 클릭으로 문의 상태를 `Done`으로 바꾸는 최소 기능 추가
- `public/demo/demo-cover.png`, `public/demo/demo-cover2.png`를 데모 채용공고 목데이터 이미지로 사용
- 데모 허브 CTA 문구를 `데모 시작`에서 `인재용 페이지 바로가기`, `기업용 페이지 바로가기`, `관리자페이지 바로가기` 계열로 변경
- Next.js 15 라인의 보안 패치 권고에 맞춰 `next`와 `eslint-config-next`를 `15.5.18`로 업데이트

## 현재 상태 진단

- `package.json`은 `next: 15.5.7`, `eslint-config-next: 15.5.6`을 사용한다. 확인한 Next.js `v15.5.18` 릴리스는 2026-05-07 보안 패치 릴리스이며, 이 프로젝트는 15 라인이므로 `15.5.18` 대상이다.
- `components/headers/DemoHeader.tsx`의 `데모 허브` 링크는 이미 `href="/demo"`다. 인재 데모에서만 `/dashboard`로 가는 직접 원인은 `middleware.ts`의 루트 하위 경로 리다이렉트 조건이다. 로그인된 인재 role이 `/demo`에 접근하면 일반 루트 하위 경로로 판단되어 `/dashboard`로 리다이렉트된다.
- 관리자 문의 목록은 `hooks/inquiry/useInquiries.ts`에 `useUpdateInquiryStatus`가 이미 있고, `lib/demo/mockApi.ts`와 `lib/demo/roleStore.ts`에도 `PATCH /admin/inquiries/{id}/status` demo handler가 이미 있다. 따라서 새 API를 만들 필요 없이 목록 행 클릭 UI만 연결하면 된다.
- `InquiryListItem`은 이미 hover 스타일과 `onClick` prop을 갖고 있지만, `InquiriesPageContent`에서 handler를 넘기지 않는다.
- `lib/demo/roleSeed.ts`의 데모 채용공고 이미지는 현재 `/images/companyLogo.png` 또는 빈 배열을 사용한다. 새 파일은 `public/demo/demo-cover.png`, `public/demo/demo-cover2.png`에 존재하지만 아직 목데이터에 연결되지 않았다.
- `app/demo/page.tsx`와 `app/demo/__tests__/page.test.tsx`는 역할별 CTA 문구를 `{summary.title} 시작`으로 기대한다.

## 해결책

- `middleware.ts`에서 `/demo` 및 `/demo/...` 경로를 데모 공개 경로로 예외 처리해, 인재 데모 인증 상태에서도 데모 허브에 접근 가능하게 한다.
- 관리자 문의 목록에서 `InquiryListItem` 클릭 시 `useUpdateInquiryStatus`로 해당 문의 상태를 `DONE`으로 변경한다. 이미 `DONE`인 행은 중복 요청을 막아 변경량과 부작용을 줄인다.
- 상태 변경 후 기존 mutation의 `invalidateQueries`를 유지해 목록이 mock store 기준으로 재조회되게 한다.
- 데모 채용공고 seed의 목록 썸네일과 상세 `images`를 `/demo/demo-cover.png`, `/demo/demo-cover2.png`로 교체한다.
- 데모 허브 역할별 CTA 문구를 역할별 고정 라벨로 바꾸고 관련 테스트 기대값을 갱신한다.
- `package.json`과 `package-lock.json`을 `next@15.5.18`, `eslint-config-next@15.5.18` 기준으로 업데이트한다.

## 트레이드오프

- 관리자 문의 Done 처리를 실제 관리자 화면에도 노출하면 변경량이 가장 작고 기존 API를 그대로 검증할 수 있다. 다만 실제 운영 정책상 행 클릭이 너무 강한 동작일 수 있는데, 현재 서비스가 실제 사용되지 않고 데모 완성도가 우선이라는 사용자 답변에 따라 수용한다.
- `/demo`를 middleware 예외로 두면 데모 인증 사용자가 언제든 허브로 돌아갈 수 있다. 대신 데모 페이지가 인증/권한 보호 흐름 밖으로 분리되므로, 데모 페이지 안에서 운영 데이터 접근을 추가하지 않는다는 전제가 필요하다.
- `eslint-config-next`까지 `15.5.18`로 맞추면 Next 패키지 계열 버전이 정렬된다. lockfile 변경 폭은 `next`만 올릴 때보다 조금 커질 수 있다.

## 대안

- 대안: `DemoHeader`의 `데모 허브` 클릭을 `router.push("/demo")`로 직접 처리한다.
- 기각 이유: middleware 리다이렉트가 원인이므로 클라이언트 라우팅 방식을 바꿔도 서버/새로고침 접근에서 같은 문제가 남는다.

- 대안: 관리자 문의 Done 기능을 별도 버튼으로 추가한다.
- 기각 이유: 요청은 hover된 행 클릭으로 처리하는 흐름이고, 현재 `InquiryListItem`이 이미 click prop과 cursor/hover UI를 갖고 있어 행 클릭 연결이 가장 작다.

- 대안: 데모 채용 이미지 파일을 새 이름으로 이동하거나 별도 assets 상수 파일을 만든다.
- 기각 이유: 사용자가 이미 `public/demo`에 넣은 두 파일을 그대로 쓰는 것이 변경량이 작고 asset churn이 없다.

- 대안: Next 16으로 올린다.
- 기각 이유: 현재 프로젝트는 Next 15 라인이며 요청에 포함된 권고도 15 사용자는 `15.5.18`로 업데이트하라는 내용이다. 16 업그레이드는 더 큰 호환성 검증이 필요하다.

## 완료 기준

- [ ] 데모 인재 인증 상태에서 헤더의 `데모 허브` 클릭 또는 `/demo` 직접 접근이 `/dashboard`로 리다이렉트되지 않는다.
- [ ] 기업/관리자 데모의 기존 `데모 허브` 이동도 유지된다.
- [ ] 관리자 문의 목록에서 `NEW` 또는 `IN_PROGRESS` 행을 클릭하면 상태가 `Done`으로 바뀐다.
- [ ] 이미 `DONE`인 문의 행 클릭은 불필요한 중복 mutation을 보내지 않는다.
- [ ] 데모 채용공고 목록/상세에서 `public/demo`의 두 이미지가 목데이터로 사용된다.
- [ ] 데모 허브 역할 CTA 문구가 `인재용 페이지 바로가기`, `기업용 페이지 바로가기`, `관리자페이지 바로가기` 계열로 표시된다.
- [ ] `next`와 `eslint-config-next`가 `15.5.18`로 업데이트되고 lockfile이 일관된다.
- [ ] 관련 unit test를 먼저 추가/수정한 뒤 통과시킨다.
- [ ] Level 2 Stage 1/2 검증으로 `npm run type-check`, `npm run lint`, 관련 vitest subset을 실행한다.
