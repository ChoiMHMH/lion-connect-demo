# Task 분할 — 데모 인재탐색 직군 표기 + 이력서 동기화

각 task = 커밋 1개. TDD(실패 테스트 → green → refactor) 순서. 의존성 순.

---

## Task 1 — 직군 오타 정정(jobs.ts) + 회귀 테스트

- 선행 테스트: `constants/__tests__/jobs.test.ts`
  - `findJobGroupByJobName("프론트엔드") === "개발"`, `"백엔드" === "개발"`
  - `JOB_ROLE_ID_BY_NAME["프론트엔드"] === 1`, `["백엔드"] === 2`
- 구현: `constants/jobs.ts`의 `JOB_OPTIONS`, `JOB_ROLE_ID_BY_NAME` 키를 `jobMapping.ts` 기준
  (`프론트엔드`, `백엔드`)으로 정정.
- 완료 기준: 위 테스트 green, 기존 talents 테스트 무회귀.

## Task 2 — IntroduceCard 이름 글자수 prop화

- 선행 테스트: `IntroduceCard` 렌더 테스트 — `nameMaxChars` 미지정 시 기본(9), 지정 시 해당 폭 클래스 적용.
- 구현: `IntroduceCard.tsx`에 `nameMaxChars?: number`(기본 9) 추가, `<h2>` truncate 폭을
  prop 기반으로 적용. truncate/`...` 동작 유지.
- 호출부: `talents/page.tsx`(목록) → 5, `talents/[talentId]/page.tsx`(상세) → 9.
- 완료 기준: 목록 5 / 상세 9로 분리 적용, 테스트 green.

## Task 3 — 이력서→talent 합성 어댑터 (resumeStore 읽기 단방향)

- 선행 테스트: 합성 함수 단위 테스트 — resume 프로필+섹션을 `TalentListItem`/`TalentDetailResponse`로
  매핑(name, introduction, jobRoles, skills, education, experiences, languages, workDrivenLevel,
  thumbnailUrl) 검증.
- 구현: `lib/demo/`에 합성 어댑터 추가(roleStore가 resumeStore를 단방향 import).
  - resumeStore에 합성에 필요한 read 헬퍼가 없으면 export 추가(순환 import 금지: resumeStore는
    roleStore를 import 하지 않음).
- 완료 기준: 어댑터 단위 테스트 green. 아직 라우팅에는 미연결(다음 task).

## Task 4 — listDemoTalents/getDemoTalent에 합성 + visibility 필터 연결

- 선행 테스트: `roleStore`(또는 mockApi) 테스트
  - `listDemoTalents`: id=1 PUBLIC → 포함 + 합성값, PRIVATE → 제외, id 2·3 항상 포함.
  - `getDemoTalent(1)`: 합성값 반환.
- 구현: `listDemoTalents`는 id=1을 어댑터 합성 결과로 대체하고 visibility로 필터,
  `getDemoTalent(1)`도 합성 결과 반환. id 2·3은 seed 유지.
- 완료 기준: 위 테스트 green, 기존 검색/페이지네이션 무회귀.

## Task 5 — 초기 공개 상태 PUBLIC (seed)

- 선행 검증: `resumeStore`/seed 테스트 — 초기 profile id=1 `visibility === "PUBLIC"`.
- 구현: `lib/demo/resumeSeed.ts` profile id=1 `visibility`를 `"PUBLIC"`으로.
- 완료 기준: 초기 `listDemoTalents`에 id=1 포함, 테스트 green.

## Task 6 — 통합 검증 + 기록

- 수동: 인재 데모로 이력서 이름/직군/스킬 수정 + 공개 토글 → 기업 데모 `/talents` 목록·상세 반영 확인.
- 기계: `npm run lint`, `npm run type-check`, `npm run test`, `npm run build` 실행·기록.
- 완료 기준: DoD 전 항목 충족, 결과를 PR 본문/기록에 남김.

---

## 비고
- visibility 값 형식(`ProfileResponse.visibility`의 PUBLIC/PRIVATE 문자열)은 Task 3 착수 시 점검.
- 상세 페이지 비공개 접근 정책은 목록과 동일 기준(비공개 시 노출 안 함)으로 통일.
