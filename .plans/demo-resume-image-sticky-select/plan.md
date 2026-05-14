# 데모 이력서 이미지, 고정 액션 버튼, 드롭다운 스크롤 안정화

## 무엇을 / 왜

인재 데모에서 이력서 프로필 이미지를 첨부했을 때 기업 데모의 인재 탐색 목록과 상세 화면에도 같은 이미지가 보이게 한다. 기업 데모의 채용 공고 등록/수정 버튼과 인재 데모 이력서 작성의 임시 저장/작성 완료 버튼은 스크롤 중에도 상단에서 일정 간격을 두고 계속 접근 가능하게 한다. 모든 Radix Select 드롭다운을 열 때 body 스크롤 잠금으로 인한 화면 폭 흔들림을 제거한다.

작업 Level: Level 2
점수: 7/12
근거:
- 변경 범위: 2 - 데모 mock store, 채용 폼, 이력서 작성 nav, 공통 Select/전역 스타일 가능성이 있다.
- 모호성: 1 - 목표는 명확하지만 이미지 동기화 범위는 데모 store 구조를 기준으로 한 가정이 필요하다.
- 영향도: 1 - 데모 데이터와 UI 동작 변경이며 운영 API 계약은 변경하지 않는다.
- 되돌리기 쉬움: 1 - 커밋 revert로 가능하지만 공통 Select는 여러 화면에 영향을 준다.
- 테스트 가능성: 1 - mock API 단위 테스트와 타입/린트로 확인 가능하며 sticky UI는 수동 확인이 필요하다.
- 새 지식 필요: 1 - Radix Select의 scroll lock 동작 확인이 필요하다.
강제 승격: 없음
다음 프로토콜: `.agents/planning.md`의 Level 2

## 현재 상태 진단

- `lib/demo/resumeStore.ts`의 `completeDemoThumbnailUpload`는 업로드 URL만 반환하고 profile `storageUrl`이나 기업 데모용 `roleStore`의 `thumbnailUrl`을 갱신하지 않는다.
- 기업 데모 인재 탐색은 `lib/demo/roleStore.ts`의 `store.talents`/`store.talentDetails`에서 `thumbnailUrl`을 내려준다. 이 store는 이력서 작성 mock store와 별도라서 현재는 `/images/default-profile.png`가 유지된다.
- `components/job/JobForm.tsx`의 submit 버튼은 우측 컬럼에 고정 높이 없이 일반 flow로 배치되어 스크롤 시 사라진다.
- `app/dashboard/profile/[profileId]/_components/TalentRegisterNav.tsx`는 상단 nav 안에 임시 저장/작성 완료 버튼을 일반 flow로 배치한다.
- `app/globals.css`에는 `html { scrollbar-gutter: stable; }`이 있지만 `components/ui/select.tsx`의 Radix Select Portal이 열릴 때 body scroll lock이 적용되어 스크롤바가 사라지는 흔들림이 남는다.

## 해결책

- `resumeStore`에서 썸네일 업로드 완료 시 demo profile의 `storageUrl`을 업로드 URL로 갱신하고, `roleStore`에 데모 인재 썸네일 동기화 함수를 추가해 `talents`와 `talentDetails`의 `thumbnailUrl`을 함께 갱신한다.
- 데모 이미지 동기화는 mock API 내부에서만 수행하고 운영 타입/API 계약은 유지한다. 대상은 같은 `profileId`를 가진 데모 인재로 제한한다.
- `JobForm`의 우측 submit 영역에 `sticky top-* self-start`를 적용해 초기 위치는 유지하되 스크롤 후 상단 간격을 두고 고정한다.
- `TalentRegisterNav`는 전체 nav를 sticky 처리해 뒤로가기/제목/액션을 같이 보존하되, 헤더와 겹치지 않도록 z-index/background/top 간격을 맞춘다.
- 공통 `SelectContent`에 Radix Popper의 `hideWhenDetached={false}`와 함께 전역 CSS로 Radix body scroll lock 상태에서도 `overflow-y: scroll` 및 stable gutter를 유지하도록 보정한다.

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| 업로드 완료 시 role store를 직접 동기화 | 데모에서 사용자가 방금 첨부한 이미지가 인재 탐색에 즉시 반영된다 | 데모 전용 store 간 결합이 생긴다 |
| profile `storageUrl`도 썸네일 URL로 갱신 | 기존 프로필 조회/폼 초기화 흐름과 자연스럽게 맞는다 | 실제 서비스에서 `storageUrl`이 포트폴리오 URL 의미라면 데모와 운영 의미가 다를 수 있다 |
| nav/submit 영역에 CSS sticky 적용 | 구조 변경이 작고 기존 submit 흐름을 유지한다 | 부모 overflow나 화면 높이에 따라 수동 시각 검증이 필요하다 |
| Radix scroll lock을 CSS로 보정 | 모든 Select에 한 번에 적용된다 | Dialog 등 다른 overlay가 같은 data attribute를 쓰면 추가 확인이 필요하다 |

## 대안

1. **인재 탐색 응답을 매번 resumeStore에서 조합**
   - 기각 이유: `roleStore`의 seed 기반 응답 구조를 더 크게 바꾸고 목록/상세/지원자 데이터까지 영향 범위가 넓어진다.

2. **각 화면별로 버튼을 별도 fixed footer/header로 재구성**
   - 기각 이유: 기존 레이아웃과 접근성/submit 연결을 더 많이 바꿔야 하며 이번 요구는 sticky 동작만 필요하다.

3. **각 Select 사용처에서 개별적으로 scroll lock을 끄거나 class를 추가**
   - 기각 이유: 누락 가능성이 높고 "모든 드롭다운" 요구에 맞지 않는다.

## 완료 기준 (DoD)

- [ ] 인재 데모 이력서에서 프로필 이미지 업로드 완료 후 기업 데모 인재 탐색 목록 카드의 이미지가 업로드 URL로 반영된다.
- [ ] 같은 업로드 후 기업 데모 인재 상세 상단 카드 이미지도 업로드 URL로 반영된다.
- [ ] 채용 공고 등록/수정 버튼은 원래 우측 위치에서 시작하고 스크롤 시 상단 간격을 유지하며 sticky 된다.
- [ ] 이력서 작성의 임시 저장/작성 완료 버튼은 원래 상단 nav 위치에서 시작하고 스크롤 시 상단 간격을 유지하며 sticky 된다.
- [ ] Select 드롭다운을 열어도 문서 스크롤바 영역이 유지되어 화면 폭 흔들림이 없어야 한다.
- [ ] 관련 mock API 테스트를 추가/수정하고 `npm test -- lib/demo/__tests__/resumeMockApi.test.ts`를 통과시킨다.
- [ ] `npm run type-check`와 `npm run lint`를 통과시킨다.
