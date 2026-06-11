# Task 분할 - 인재 탐색 상세 최신화와 이름 전체 표시

각 task는 1개 커밋 단위가 원칙이나, 사용자가 최종 단일 커밋을 요청했으므로 구현 완료 후 하나의 `fix` 커밋으로 묶는다.

## Task 1 - 이름 축약 제거

보장할 동작: 인재 목록/상세 카드 이름이 `...` 없이 전체 렌더링된다.

선행 테스트:
- `IntroduceCard` 테스트를 먼저 실패하도록 갱신한다. 긴 이름 heading에 `truncate`가 없고 ch 기반 maxWidth가 없어야 한다.

작업:
- `IntroduceCard`의 `nameMaxChars`, `truncate`, inline maxWidth 사용을 제거한다.
- 목록 호출부의 `nameMaxChars={5}`를 제거한다.
- 이름/배지 행이 wrap되도록 레이아웃을 조정한다.

완료 기준:
- 컴포넌트 테스트 통과.
- 이름 heading에 줄임표 유발 class/style이 없다.

## Task 2 - 이력서 경험 태그를 인재 응답 배지로 합성

보장할 동작: 이력서의 직무 관련 경험 선택값 4개가 list/detail `experiences`에 모두 반영된다.

선행 테스트:
- `talentAdapter` 또는 `talentSync` 테스트에 expTags 4개가 `부트캠프 경험자`, `창업 경험자`, `자격증 보유자`, `전공자`로 매핑되어야 한다는 실패 테스트를 추가한다.

작업:
- `DemoResumeSnapshot`에 expTags를 포함한다.
- `talentAdapter`에서 expTags를 표준 experience label로 변환해 list/detail 응답에 반영한다.

완료 기준:
- adapter/sync 테스트 통과.
- `/profiles/search`, `/profiles/1` mock 응답이 수정된 경험 배지 라벨을 반환한다.

## Task 3 - 저장 후 인재 탐색 캐시 최신화

보장할 동작: 이력서 저장 후 `/talents`와 `/talents/1`이 새로고침 없이 최신 데이터를 다시 조회한다.

선행 테스트/검증:
- 기존 저장 플로우 테스트 구조를 확인하고, 가능한 범위에서 query invalidation 테스트를 추가한다.
- 테스트가 과도하면 관련 query key를 명시적으로 구현하고 타입 체크/수동 검증 항목으로 남긴다.

작업:
- `TalentRegisterPage`에 `useQueryClient`를 추가한다.
- 임시저장/작성완료 성공 시 `["talents"]`, `["talent", "detail", String(profileId)]`를 invalidate한다.
- `useTalentDetail`의 `staleTime`을 0으로 낮춘다.

완료 기준:
- 저장 성공 경로마다 invalidate가 실행된다.
- 상세 페이지 재진입 시 stale 상세 캐시가 유지되지 않는다.

## Task 4 - 검증과 커밋

검증:
- `npm test -- lib/demo/__tests__/talentAdapter.test.ts lib/demo/__tests__/talentSync.test.ts`
- `npm test -- 'app/(company)/talents/[talentId]/_components/__tests__/IntroduceCard.test.tsx'`
- `npm run type-check`

커밋:
- `fix: 이력서 수정값 인재 탐색 반영`
