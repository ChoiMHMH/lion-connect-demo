# 데모 인재탐색 직군 표기 정상화 + 이력서 동기화

## 작업 Level

작업 Level: Level 2
점수: 7/12
근거:
- 변경 범위: 2 - `constants/jobs.ts`, `IntroduceCard`, `talents/page.tsx`, `mapTalentData`, `roleStore`, `resumeStore`/seed 등 여러 파일·계층
- 모호성: 1 - 핵심 목표 명확, 일부 표시/초기값 가정은 질문으로 확정
- 영향도: 2 - 데모 데이터 동기화 및 공용 store(roleStore↔resumeStore) 변경
- 되돌리기 쉬움: 1 - 데모 한정 revert 가능하나 여러 파일에 걸침
- 테스트 가능성: 1 - 기존 데모 테스트 패턴 재사용, 동기화 로직 테스트는 신규 설계
- 새 지식 필요: 0 - 기존 mock store 패턴 그대로
강제 승격: 데이터 저장/제출, 공용 상태 관리 변경 → 최소 Level 2
다음 프로토콜: `.agents/planning.md`의 Level 2

## 무엇을 / 왜

데모 모드의 `/talents`(인재 탐색)에서 두 가지 문제를 고친다.

1. **직군·직무 표기 깨짐**: 직군이 비어 `- · 프론트엔드`처럼 보인다. `개발 · 프론트엔드`로
   정상 표기되어야 한다. 또한 인재 **이름**이 카드에서 너무 길게 잘려, 목록에서는 5글자까지만
   보이고(초과 시 `...`), 상세 페이지에서는 디자인을 해치지 않는 선에서 9글자까지 보이게 한다.
2. **이력서 ↔ 인재탐색 비동기화**: 인재 데모(`/dashboard/profile`)의 이력서(profile id=1)와
   기업이 보는 `/talents`의 인재(id=1)가 별개 데이터라, 공개 여부(visibility)와 이력서 수정이
   반영되지 않는다(현재 thumbnail만 반영). **공개(PUBLIC)면 노출 / 비공개(PRIVATE)면 숨김**,
   그리고 이름·소개·직군·스킬·학력·경력 등 **수정 내용이 `/talents`에 반영**되어야 한다.

## 현재 상태 진단

### 직군 표기
- `constants/jobs.ts`의 `JOB_OPTIONS`/`JOB_ROLE_ID_BY_NAME`에 `"프론트앤드"`, `"백앤드"`(오타)로
  들어가 있다. 데모 데이터와 `constants/jobMapping.ts`(`JOB_GROUPS`)는 `"프론트엔드"`, `"백엔드"`다.
- `talents/page.tsx`와 `mapTalentData.ts`가 `findJobGroupByJobName("프론트엔드")`를 호출하면
  `JOB_OPTIONS`에서 못 찾아 `""`을 반환 → `jobGroup`이 비어 `- · 프론트엔드`로 표시된다.
- `findJobGroupByJobName`/`JOB_OPTIONS`/`JOB_ROLE_ID_BY_NAME` 사용처는 `jobs.ts` 정의 외에
  `talents/page.tsx`, `mapTalentData.ts` **2곳뿐**(grep 확인). 이력서 양식은 `jobMapping.ts`를 쓴다.
- 인재 이름: `IntroduceCard.tsx`의 `<h2 ... truncate max-w-[10ch]>`로 목록/상세가 같은 컴포넌트를
  공유한다. 현재 10글자 고정이라 목록/상세를 따로 제어할 수 없다.

### 동기화
- `lib/demo/roleStore.ts`의 `store.talents`(목록), `store.talentDetails`(상세)는 seed에서
  복제한 **독립 데이터**(id 1,2,3 하드코딩). visibility 개념이 없어 항상 노출된다.
- `lib/demo/resumeStore.ts`의 `store.profiles`는 데모 인재 이력서(id=1) 1건. `visibility: "PRIVATE"`,
  `status: "COMPLETED"`. 학력/경력/언어/자격/스킬/직군(jobCategories)/expTags/workDriven을 별도 보관.
- 두 store를 잇는 코드는 `updateDemoTalentThumbnail`(thumbnail만) 뿐이다.
- `mockApi.ts`의 `/profiles/search`→`listDemoTalents`, `/profiles/{id}`→`getDemoTalent`가
  roleStore만 본다. 이력서 수정 API는 resumeStore만 갱신한다 → 분리.

## 해결책

1. **직군 오타 정정 + 기준 통일** (결정됨): `constants/jobs.ts`의 `JOB_OPTIONS`,
   `JOB_ROLE_ID_BY_NAME` 키를 `jobMapping.ts` 기준(`프론트엔드`, `백엔드`)으로 바로잡는다.
   영향처 2곳(talents 목록/상세)은 정정 후 정상 직군을 받는다.
2. **이름 글자수 목록/상세 분리**: `IntroduceCard`에 이름 최대 글자수 prop(예: `nameMaxChars`,
   기본 9)을 추가한다. 목록(`talents/page.tsx`)은 5, 상세(`talents/[talentId]/page.tsx`)는 9를
   넘긴다. truncate(`...`)는 유지하되 폭 클래스를 prop으로 제어.
3. **이력서를 talent로 합성하는 단일 소스화**: roleStore의 talent 조회가 **id=1에 한해**
   resumeStore의 이력서(프로필+섹션)를 읽어 `TalentListItem`/`TalentDetailResponse`로 조립한다.
   - 목록(`listDemoTalents`): id=1은 합성 결과로 대체하고 **visibility==="PUBLIC"일 때만 포함**.
     id 2,3(가짜 인재)은 기존 seed 유지.
   - 상세(`getDemoTalent`): id=1은 합성 결과 반환(비공개여도 본인/기업 접근은 기존 흐름 유지하되
     노출 정책은 목록 기준으로 통일 — 상세 정책은 task에서 확정).
   - 매핑: name, introduction, jobCategories→jobRoles(직무명), customSkills→skills,
     educations→education(첫 항목)/상세 educations, experiences, languages, expTags→experience badge,
     workDrivenResults→workDrivenLevel, storageUrl/thumbnail→thumbnailUrl.
4. **초기 공개 상태 PUBLIC** (결정됨): `resumeSeed.ts`의 profile id=1 `visibility`를 `"PUBLIC"`으로
   바꿔 첫 화면부터 `/talents`에 노출. 비공개 전환 시 사라지고 재공개 시 다시 노출.
5. **테스트**: 직군 매핑(엔/앤) 회귀, 이름 글자수 prop, visibility 필터, 이력서 수정→talent 반영을
   단위 테스트로 고정한다.

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| roleStore에서 resumeStore를 읽어 합성(어댑터) | 이력서가 단일 소스, 수정/공개여부 자동 반영 | roleStore↔resumeStore 결합 발생, 합성 매핑 코드 추가 |
| id=1만 합성, id 2,3은 seed 유지 | 목록이 비지 않아 데모 UX 유지, 변경 최소 | "이력서=인재" 일대일이 id=1에 한정(데모로는 충분) |
| `jobs.ts` 오타 직접 수정 | 근본 해결, 표기 일관 | `jobMapping.ts`와 중복 상수 잔존(후속 통합 여지) |
| 이름 글자수 prop화 | 목록 5 / 상세 9 독립 제어, 컴포넌트 1개 유지 | prop 추가로 호출부 2곳 수정 |

## 대안

1. **seed의 talent(id=1)만 이력서와 같은 값으로 맞춰두기(정적 동기화)**
   - 기각: 이력서 수정 시 다시 어긋난다. "수정 반영" 요구를 만족 못 함.
2. **resumeStore에 talent 조회까지 통합(roleStore의 talent 부분 흡수)**
   - 기각: 변경 범위가 과도하고 기존 mockApi 라우팅/테스트를 크게 흔든다. 어댑터가 더 안전.
3. **`jobs.ts`를 `jobMapping.ts`로 완전 대체(파일 삭제)**
   - 기각: 사용처는 적지만 이번 작업 범위를 넘는 리팩토링. 오타 수정으로 목표 달성, 통합은 후속.
4. **visibility 필터를 컴포넌트(page.tsx)에서 처리**
   - 기각: 비공개 인재 데이터가 클라이언트로 내려가 노출 정책이 약해진다. mock API 계층에서 거른다.

## 완료 기준 (DoD)

- [ ] `/talents` 목록·상세에서 데모 인재 직군이 `개발 · 프론트엔드`로 표시된다(빈 직군 사라짐).
- [ ] `constants/jobs.ts`의 `프론트앤드`/`백앤드` 오타가 `jobMapping.ts` 기준으로 정정된다.
- [ ] 인재 이름이 목록 카드에서 5글자 초과 시 `...`, 상세에서는 9글자까지 표시된다.
- [ ] `resumeSeed`의 데모 인재(id=1) `visibility`가 `PUBLIC`이고, 초기 `/talents`에 노출된다.
- [ ] `/dashboard/profile`에서 비공개 전환 시 `/talents` 목록에서 사라지고, 재공개 시 다시 보인다.
- [ ] 이력서의 이름·소개·직군·스킬·학력·경력 수정이 `/talents` 목록·상세에 반영된다(thumbnail 외).
- [ ] id 2,3 가짜 인재는 기존대로 노출되어 목록이 비지 않는다.
- [ ] 직군 매핑/이름 글자수/visibility 필터/이력서→talent 반영 단위 테스트가 추가·통과한다.
- [ ] `npm run lint`, `npm run type-check`, `npm run test`, `npm run build` 결과를 기록한다.

## 검증 전략

- 단위: `findJobGroupByJobName("프론트엔드")==="개발"` 회귀, `IntroduceCard` 이름 prop 적용,
  `listDemoTalents`가 PRIVATE 프로필을 제외/PUBLIC 포함, resume 수정 후 `getDemoTalent` 반영.
- 통합: 이력서 섹션 수정(mockApi PUT) → `/profiles/search`·`/profiles/{id}` 응답 변화 확인.
- 수동: 인재 데모로 이력서 이름/직군/스킬 수정 + 공개 토글 → 기업 데모 `/talents`에서 확인.
- 기계: `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`.

## 리스크와 대응

- resumeStore↔roleStore 결합으로 순환 import 위험 → 합성 어댑터를 roleStore가 resumeStore를
  단방향 import 하도록 두고, resumeStore는 roleStore를 모르게 유지.
- visibility 타입(`ProfileResponse.visibility`) 값 확인 필요(PUBLIC/PRIVATE 문자열) → task 1에서 점검.
- 상세 페이지의 비공개 접근 정책(숨김 vs 접근 허용)은 데모 일관성 위해 목록과 동일 기준으로 통일.
```
