# 데모 프로필/인재탐색 표시 및 미리보기 동기화

## 작업 Level

작업 Level: Level 2
점수: 8/12
근거:
- 변경 범위: 2 - `/talents`, `/talents/[id]`, `/dashboard/profile/[id]`, demo seed/store/adapter, 공고 seed와 테스트가 함께 영향받음
- 모호성: 1 - 목표는 명확하나 `/dashboard` 초기 공고 이미지 매칭과 `test.pdf` 파일명은 로컬 파일 기준 확인 필요
- 영향도: 2 - 폼 저장, React Query 캐시, demo mock 데이터 합성/노출 정책에 영향
- 되돌리기 쉬움: 1 - 데모 모드 한정 변경이지만 여러 파일에 걸쳐 revert 필요
- 테스트 가능성: 1 - 기존 Vitest/mock API 테스트 패턴으로 고정 가능, 일부 화면 반영은 수동 확인 필요
- 새 지식 필요: 1 - 새 라이브러리는 없지만 브라우저 PDF embed 동작과 기존 캐시 정책 확인 필요
강제 승격: 데이터 저장/제출, 공용 상태 관리 변경 → 최소 Level 2
다음 프로토콜: `.agents/planning.md`의 Level 2

## 무엇을 / 왜

데모 모드에서 이력서 편집과 기업 인재 탐색 화면이 같은 데이터를 보는 것처럼 동작하게 보정한다.

요청 범위는 다음 6개다.

- `/talents`와 `/talents/2` 등 인재 카드/상세의 이름이 `데모...`, `데모 백엔드 ...`처럼 줄임표로 축약되지 않고 전체 표시된다.
- `/dashboard/profile/1`의 직무 관련 경험 선택값(부트캠프 경험자, 창업 경험자, 자격증 보유자, 전공자)이 저장 후 인재 탐색에 반영된다.
- `/dashboard/profile/1` 저장 뒤 `/talents`, `/talents/1`에 새로고침 없이 최신 값이 보인다.
- 포트폴리오 미리보기는 `public/demo`의 PDF를 사용한다. profile id=1(홍길동)은 `/demo/mock_portfolio_frontend_honggildong.pdf`, 나머지 인재는 `/demo/mock_portfolio_frontend_test.pdf`를 사용한다.
- `/dashboard` 초기 공고 카드/상세 이미지가 새 demo 이미지(`frontent-demo.png`, `backend-demo.png`, `designer-demo.png`, 기존 cover류)를 참고해 공고별로 다르게 보인다.
- 수정 가능한 이력서 profile id=1의 초기값은 이름 `홍길동`, 프로필 사진 `/demo/profile-demo.png`가 된다.
- 새로 추가된 `public/demo` 이미지/PDF 에셋도 구현 커밋에 포함해 GitHub에 올라가도록 한다.

## 현재 상태 진단

- `IntroduceCard`는 `nameMaxChars` prop과 `truncate`/`maxWidth: ch`로 이름을 강제로 축약한다. 목록은 `nameMaxChars={5}`, 상세는 기본 9라서 긴 이름이 줄임표로 보인다.
- `lib/demo/roleStore.ts`는 id=1 talent를 `resumeStore` 스냅샷으로 합성하는 구조가 이미 있다. 다만 `lib/demo/talentAdapter.ts`가 `expTags`를 `experiences`로 변환하지 않아 직무 관련 경험 수정이 `/talents` 배지에 반영되지 않을 가능성이 높다.
- `useTalentDetail`은 `staleTime: 5 * 60 * 1000`이고, `/dashboard/profile/[profileId]`의 임시저장/최종저장은 `["talents", "search"]`, `["talent", "detail", "1"]` 캐시를 무효화하지 않는다. 한 번 본 목록/상세는 라우팅 후에도 이전 캐시를 보여줄 수 있다.
- `demoResumeSeed`와 `demoTalentDetails`의 포트폴리오 URL은 `/demo-assets/profile-1/portfolio.pdf`로 남아 있다. 실제 로컬 에셋은 `public/demo/mock_portfolio_frontend_honggildong.pdf`, `public/demo/mock_portfolio_frontend_test.pdf`가 존재한다.
- `PortfolioCard`는 PDF URL이면 `<object type="application/pdf">`로 미리보기한다. 경로만 실제 public 파일로 맞추면 기본 미리보기는 동작해야 하지만, fallback 링크도 함께 확인해야 한다.
- `demoResumeSeed`의 profile id=1 이름은 `데모 인재`, `storageUrl`은 PDF 경로다. 프로필 사진 초기값으로 쓰려면 `storageUrl` 또는 THUMBNAIL profile link/adapter 경로를 `/demo/profile-demo.png`로 일관되게 맞춰야 한다.
- `demoPublicJobs`/`demoJobDetails`의 초기 공고 이미지는 `/demo/demo-cover.png`, `/demo/demo-cover2.png` 두 장이 반복된다. `/dashboard`와 공고 상세 모두 이 seed 값을 통해 렌더링된다.
- 사용자는 “test.pdf”라고 표현했지만 로컬에는 `test.pdf`가 없고 `mock_portfolio_frontend_test.pdf`가 있다. 구현에서는 현존 파일 기준으로 사용하고, 파일명이 추가되면 plan/task에서 조정한다.

## 해결책

- 이름 축약 제거: `IntroduceCard`의 이름 영역에서 `truncate`, `maxWidth` 기반 줄임표 정책을 제거하고, 목록/상세 레이아웃이 깨지지 않도록 `min-w-0`, wrapping 또는 충분한 폭을 적용한다. `nameMaxChars` prop은 제거하거나 deprecated 처리한다.
- 직무 관련 경험 동기화: `talentAdapter`에서 `snapshot.expTags`를 기업 인재 탐색의 표준 경험 라벨(`부트캠프 경험자`, `창업 경험자`, `자격증 보유자`, `전공자`)로 변환해 list/detail의 `experiences`를 덮어쓴다. 필요하면 `EXP_TAG_ID_MAP`의 역매핑을 재사용한다.
- 저장 후 즉시 반영: `/dashboard/profile/[profileId]/page.tsx` 저장 성공 시 React Query `queryClient.invalidateQueries` 또는 `refetchQueries`로 `["talents"]`, `["talent", "detail", String(profileId)]`, profile/register 관련 캐시를 갱신한다. 상세 hook의 stale 정책도 데모 UX에 맞춰 조정한다.
- 포트폴리오 seed 정리: profile id=1은 `mock_portfolio_frontend_honggildong.pdf`, id=2/3은 `mock_portfolio_frontend_test.pdf`로 `portfolioUrl`, `storageUrl`, `profileLinks`를 맞춘다. `talentAdapter`도 `profileLinks`의 `PORTFOLIO` URL을 상세 응답에 반영한다.
- 초기 홍길동 데이터: `demoResumeSeed`와 id=1 role seed/base talent의 이름을 `홍길동`으로 맞추고, 초기 프로필 사진은 `/demo/profile-demo.png`가 목록/상세/프로필 폼에 표시되도록 seed와 adapter를 정리한다.
- `/dashboard` 공고 이미지 다양화: `demoPublicJobs`와 `demoJobDetails.images`를 공고 직무에 맞춰 새 demo 이미지로 분산한다. 예: 프론트엔드 공고는 `/demo/frontent-demo.png`, 백엔드는 `/demo/backend-demo.png`, 디자인은 `/demo/designer-demo.png`, 마케팅/기타는 기존 cover를 사용한다.
- 에셋 Git 추적: 새 이미지/PDF가 `.gitignore`에 걸리지 않는 것을 확인했고 크기도 약 70KB~1.8MB 범위라 Git에 직접 포함한다. 구현 커밋 또는 별도 chore 커밋에서 `public/demo/backend-demo.png`, `designer-demo.png`, `frontent-demo.png`, `profile-demo.png`, `mock_portfolio_frontend_honggildong.pdf`, `mock_portfolio_frontend_test.pdf`를 stage한다.
- 테스트: adapter, mock API, 컴포넌트 표시, 저장 후 캐시 무효화 동작을 기존 테스트 구조 안에서 추가한다.

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| 이름 축약을 완전히 제거 | 사용자 요구와 정확히 일치, 목록/상세 모두 전체 이름 확인 가능 | 긴 이름에서 카드 높이나 배지 줄바꿈이 늘 수 있음 |
| `talentAdapter`에서 이력서 스냅샷을 더 적극적으로 반영 | `/dashboard/profile/1`이 기업 화면의 단일 소스처럼 동작 | adapter 책임이 커지고 seed/base talent와 중복 필드 관리 필요 |
| 저장 성공 시 관련 React Query 캐시 무효화 | 새로고침 없이 최신 값 반영 | 저장 페이지가 기업 화면 쿼리 키를 알아야 해서 결합이 생김 |
| public PDF를 seed URL로 직접 사용 | 업로드 없이 데모 미리보기 안정화 | 실제 업로드 플로우와는 다른 고정 데모 데이터 경로 |
| 공고 이미지를 seed에서 직접 지정 | `/dashboard`와 상세가 동시에 일관되게 바뀜 | 이미지-공고 매칭 정책이 seed에 하드코딩됨 |
| 에셋을 Git에 직접 포함 | GitHub 배포/리뷰 환경에서 바로 렌더링됨 | 저장소 용량이 몇 MB 증가함 |

## 대안

1. **CSS만 늘려서 줄임표가 덜 보이게 하기**
   - 기각 이유: “축약하지 않도록” 요구를 만족하지 못한다. 긴 이름에서는 다시 `...`가 생긴다.

2. **저장 후 `router.refresh()`만 호출하기**
   - 기각 이유: 현재 화면의 서버 컴포넌트 갱신에는 도움이 될 수 있지만 `/talents`와 `/talents/[id]`의 React Query 캐시를 직접 해결하지 못한다.

3. **roleSeed의 id=1 talent만 홍길동으로 바꾸기**
   - 기각 이유: 이력서 수정 후 다시 어긋난다. `resumeStore` → `talentAdapter` 합성 경로를 고치는 편이 재발 방지에 맞다.

4. **PDF를 업로드 mock API에 미리 주입하기**
   - 기각 이유: 현재 요청은 public demo PDF를 사용하라는 고정 에셋 요구다. upload map 주입은 변경 범위가 크고 미리보기 안정화에 불필요하다.

## 완료 기준 (DoD)

- [ ] `/talents` 목록에서 모든 인재 이름이 `...` 없이 전체 표시된다.
- [ ] `/talents/1`, `/talents/2`, `/talents/3` 상세 소개 카드에서 이름이 `...` 없이 전체 표시된다.
- [ ] `/dashboard/profile/1`에서 직무 관련 경험을 바꾸고 저장하면 `/talents`와 `/talents/1`의 경험 배지가 바뀐다.
- [ ] `/dashboard/profile/1`에서 이름/소개/직무/스킬/경험/프로필 사진/포트폴리오 관련 값 저장 후 새로고침 없이 `/talents`, `/talents/1`에 최신 값이 표시된다.
- [ ] 초기 수정 가능 이력서 id=1의 이름은 `홍길동`이고 프로필 사진은 `/demo/profile-demo.png`다.
- [ ] id=1 포트폴리오 미리보기는 `/demo/mock_portfolio_frontend_honggildong.pdf`를 사용한다.
- [ ] id=2/3 포트폴리오 미리보기는 `/demo/mock_portfolio_frontend_test.pdf`를 사용한다.
- [ ] `/dashboard` 초기 공고 카드와 상세 이미지가 공고별로 다르게 표시된다.
- [ ] 새 demo 이미지/PDF 에셋 6개가 Git 추적 대상에 포함되어 GitHub push 대상이 된다.
- [ ] 기존 demo auth/mock API 흐름과 인재 검색 필터가 깨지지 않는다.
- [ ] 관련 단위/통합 테스트가 추가 또는 갱신되고 통과한다.

## 검증 전략

- 단위: `talentAdapter`가 `expTags`를 `experiences`로 매핑하고, profileLinks/thumbnail/portfolio URL을 talent list/detail에 반영하는지 테스트한다.
- 단위: `IntroduceCard`가 긴 이름을 줄임표 없이 렌더링하는지 컴포넌트 테스트를 갱신한다.
- Mock API: `/profiles/search`, `/profiles/1`, `/profiles/2`, `/profiles/3` 응답의 이름/경험/포트폴리오/썸네일 URL을 검증한다.
- 저장 플로우: submit 성공 후 query invalidation이 `["talents"]`, `["talent", "detail", "1"]`에 걸리는지 테스트하거나 통합 테스트에서 경로 이동 후 최신 데이터를 확인한다.
- 수동: dev server에서 `/dashboard/profile/1` 수정/저장 → `/talents` → `/talents/1` 이동, 새로고침 없이 반영되는지 확인한다.
- 수동: `/dashboard`와 `/dashboard/job-board/[jobId]`에서 공고 이미지가 서로 다르게 보이는지 확인한다.
- 기계: `npm run lint`, `npm run type-check`, 관련 `npm test -- <pattern>`, 가능하면 `npm run build`.

## 리스크와 대응

- 긴 이름 전체 표시로 카드의 배지/본문이 밀릴 수 있다. 구현 시 카드 내부 폭, wrapping, gap을 함께 조정하고 화면 확인을 한다.
- `profile-demo.png`가 profile image인지 portfolio `storageUrl`인지 기존 타입 의미가 혼재되어 있다. seed와 adapter에서 thumbnail/profileLinks/portfolio 각각의 의미를 분리해 반영한다.
- React Query 키가 여러 곳에 흩어져 있다. 구현 task에서 실제 사용 키를 먼저 확인하고 최소 범위만 무효화한다.
- `frontent-demo.png` 파일명은 오타처럼 보이지만 실제 파일명이므로 그대로 사용한다.

## 승인 대기

이 계획은 Level 2의 1단계 상위 계획이다. 사용자 승인 후 `.plans/demo-profile-talent-preview-refresh/task.md`를 작성하고, task 승인 후 구현을 시작한다.
