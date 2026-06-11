# 인재 탐색 상세 최신화와 이름 전체 표시

## 작업 Level

작업 Level: Level 2
점수: 7/12
근거:
- 변경 범위: 2 - 이력서 저장 페이지, 인재 탐색 상세 query, 데모 adapter, 카드 UI 테스트가 함께 영향받음
- 모호성: 1 - 사용자 증상은 명확하지만 캐시와 mock 합성 원인을 함께 검증해야 함
- 영향도: 1 - 데모/인재 탐색 표시와 캐시 최신화에 영향
- 되돌리기 쉬움: 1 - 한 커밋 revert 가능하지만 여러 파일 변경
- 테스트 가능성: 1 - 기존 Vitest/mock API/컴포넌트 테스트로 고정 가능
- 새 지식 필요: 1 - 기존 React Query 키와 demo store 합성 정책 확인 필요
강제 승격: 공용 캐시/상태 흐름 변경에 가까워 Level 2
다음 프로토콜: `.agents/planning.md`의 Level 2

## 무엇을 / 왜

이력서 수정 후 기업 인재 탐색 목록과 상세가 같은 최신 데이터를 보여야 한다.

이번 범위는 사용자가 지정한 3개 문제로 제한한다.

- `/dashboard/profile/1` 수정 후 `/talents/1` 상세가 새로고침 없이 최신 이름/값을 보여야 한다.
- 직무 관련 경험 4개 선택값이 `/talents`, `/talents/1` 배지에 모두 반영되어야 한다.
- 인재 이름이 `...`으로 축약되지 않고 목록/상세에서 전체 표시되어야 한다.

## 현재 상태 진단

- `useTalentDetail`은 query key `["talent", "detail", profileId]`와 `staleTime: 5분`을 사용한다. 저장 성공 후 이 query를 무효화하지 않아 한 번 본 `/talents/1` 상세는 이전 캐시를 유지할 수 있다.
- `/dashboard/profile/[profileId]/page.tsx`는 임시저장/작성완료 성공 후 form reset과 route 이동만 수행하고, `["talents"]`, `["talent", "detail", profileId]`를 invalidate/refetch하지 않는다.
- `lib/demo/talentAdapter.ts`는 resume snapshot의 이름/소개/직무/스킬/학력 등은 합성하지만 `expTags`를 `experiences` 라벨로 반영하지 않는다. 그래서 role seed의 초기 경험 2개가 계속 보일 수 있다.
- `IntroduceCard`는 이름에 `truncate`와 `maxWidth: ${nameMaxChars}ch`를 적용한다. 목록 호출부도 `nameMaxChars={5}`를 넘겨 3~5글자 수준에서 줄임표가 생긴다.

## 해결책

- 저장 성공 후 최신화: `TalentRegisterPage`에서 `useQueryClient`를 사용해 임시저장과 작성완료 성공 시 `["talents"]`, `["talent", "detail", String(profileId)]`를 invalidate한다. 상세 query는 즉시 stale 처리되도록 `staleTime`을 0으로 낮춘다.
- 경험 배지 합성: `getDemoResumeSnapshot`이 expTags를 포함하도록 하고, `talentAdapter`가 `bootcamp/startup/certificate/major` ID를 `부트캠프 경험자/창업 경험자/자격증 보유자/전공자` 라벨로 변환해 list/detail `experiences`를 덮어쓴다.
- 이름 전체 표시: `IntroduceCard`의 이름 `truncate`와 ch 기반 maxWidth를 제거하고, 이름/배지 row가 wrap되도록 조정한다. 목록 호출부의 `nameMaxChars` 의존도 제거한다.
- 테스트: adapter/mock API 테스트로 경험 배지 4개 반영을 고정하고, `IntroduceCard` 테스트로 truncation 제거를 고정한다. 캐시 invalidate는 페이지 테스트 비용이 크면 구현과 타입 체크 중심으로 검증하고, 관련 query key를 코드로 명확히 유지한다.

## 트레이드오프

- 저장 페이지가 기업 인재 탐색 query key를 알게 된다. 대신 사용자가 보는 새로고침 없는 최신화 문제를 가장 좁게 해결한다.
- 상세 query `staleTime`을 0으로 낮추면 재진입 시 요청이 늘 수 있다. 인재 상세는 데모 수정 반영 정확성이 더 중요하다.
- 이름 전체 표시로 긴 이름에서 줄바꿈이 생길 수 있다. 하지만 `...` 제거가 명시 요구이므로 wrap으로 대응한다.

## 대안

1. `router.refresh()`만 호출
   - 기각 이유: 클라이언트 React Query 캐시가 남아 있으면 `/talents/1` 상세 stale 문제를 해결하지 못한다.
2. role seed의 초기 experiences만 4개로 수정
   - 기각 이유: 이력서 수정 후 다시 어긋난다. resume snapshot 합성 경로를 고쳐야 한다.
3. 이름 maxWidth만 크게 늘리기
   - 기각 이유: 긴 이름에서 여전히 `...`이 생겨 요구를 만족하지 못한다.

## 완료 기준

- [ ] `/dashboard/profile/1` 저장 후 `/talents/1`로 이동하면 새로고침 없이 최신 상세 query가 다시 가져와진다.
- [ ] 이력서 직무 관련 경험 4개가 `/talents`와 `/talents/1`의 `experiences`/배지로 모두 나온다.
- [ ] `IntroduceCard` 이름에 `truncate`/ch maxWidth 기반 줄임표 처리가 없다.
- [ ] 관련 Vitest가 추가/갱신되어 통과한다.
- [ ] `npm run type-check`가 통과한다.

## 검증 전략

- `npm test -- lib/demo/__tests__/talentAdapter.test.ts lib/demo/__tests__/talentSync.test.ts`
- `npm test -- 'app/(company)/talents/[talentId]/_components/__tests__/IntroduceCard.test.tsx'`
- `npm run type-check`
- 필요 시 `npm test -- lib/demo/__tests__/roleMockApi.test.ts`로 mock API 응답 회귀 확인
