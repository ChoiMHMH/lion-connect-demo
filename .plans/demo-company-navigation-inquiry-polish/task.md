# Demo Company Navigation and Inquiry Polish - Task 분할

> 원칙: 각 task는 1개 커밋 단위.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함:
  - 기업/데모 헤더의 기업 홈과 기업 문의 active 상태 및 anchor scroll 보정
  - 다른 기업 페이지에서 기업 문의 한 번 클릭으로 문의 섹션 이동
  - 활동 대학 목록 접기 애니메이션 개선
  - 데모 `POST /inquiries` mock API와 store 저장 동작
  - 관련 unit test 및 타입/린트 검증
- 미포함:
  - 실제 백엔드 API endpoint/계약 변경
  - 기업 문의 관리자 상세 페이지 구현
  - 대학 카드 디자인/데이터 변경

## 의존성 순서

```text
T1 -> T2 -> T3 -> T4
```

## T1 - Demo inquiry submit mock

**보장할 동작**

데모 기업 문의 폼 제출이 `POST /inquiries`에서 실패하지 않고, 제출 내용이 관리자 문의 목록 mock store에 추가된다.

**선행 테스트 / 선행 검증**

- `lib/demo/__tests__/roleMockApi.test.ts`에 `POST /inquiries` 후 `GET /admin/inquiries`에서 새 문의가 보이는 실패 테스트를 먼저 추가한다.

**작업**

- `lib/demo/roleStore.ts`에 문의 생성 함수를 추가한다.
- `lib/demo/mockApi.ts`에 `POST /inquiries` handler를 추가한다.
- 필요하면 `types/inquiry.ts`의 생성 요청 타입과 store 변환에서 privacy 필드 매핑을 명확히 한다.

**완료 기준**

- 새 테스트가 통과한다.
- 데모 문의 제출 흐름이 201 또는 204 성공 응답을 반환한다.

**커밋**

- `fix: mock demo inquiry submission`

## T2 - Company anchor navigation polish

**보장할 동작**

기업 홈/기업 문의 underline이 hash 상태와 정확히 맞고, `/talents` 또는 `/jobs`에서 기업 문의 클릭 시 한 번에 문의 섹션으로 이동한다. 기업 홈에서 기업 문의 클릭은 smooth scroll이며 기존보다 약 40px 위쪽 offset으로 멈춘다.

**선행 테스트 / 선행 검증**

- `constants/__tests__/demoRoutes.test.ts`의 active route 계약을 유지한다.
- 가능하면 scroll helper를 분리해 offset 계산과 hash path 동작을 unit test한다.

**작업**

- 기업 문의 scroll offset을 header 80px + 추가 40px로 통일한다.
- dynamic import 이후 섹션이 늦게 생기는 경우를 위해 짧은 재시도 scroll을 적용한다.
- `DemoHeader`에서 기업 홈 클릭 시 hash 상태를 명시적으로 비운다.
- 일반 기업 헤더의 `useNavigation`도 같은 scroll 동작을 사용한다.

**완료 기준**

- route helper 테스트가 통과한다.
- 수동 확인 기준이 명확하다: 홈, 인재 탐색, 채용 등록에서 기업 문의 클릭 동작과 underline 전환.

**커밋**

- `fix: polish company inquiry navigation`

## T3 - University collapse animation

**보장할 동작**

활동 대학 목록 `접기`가 항목을 즉시 잘라내지 않고 자연스럽게 닫힌다.

**선행 테스트 / 선행 검증**

- 정적 테스트가 어려운 애니메이션이므로 구현 전 현재 framer-motion 상태 흐름을 확인한다.
- `npm run type-check`로 상태 타입과 motion props 오류를 확인한다.

**작업**

- `UniversityGridSection`에서 접기 상태 전환을 두 단계로 분리한다.
- 접기 중에는 전체 목록을 유지하고 컨테이너 height/max-height animation 후 축약 목록으로 전환한다.
- 버튼/gradient overlay 조건이 열림/닫힘 상태와 어긋나지 않도록 정리한다.

**완료 기준**

- 타입 체크가 통과한다.
- 수동 확인 기준이 명확하다: 더보기와 접기 모두 부드럽게 동작한다.

**커밋**

- `fix: smooth university grid collapse`

## T4 - Verification and evaluation

**보장할 동작**

변경 범위가 계획과 맞고, 기존 데모/기업 흐름을 깨지 않는다.

**선행 테스트 / 선행 검증**

- T1-T3 완료 후 실행한다.

**작업**

- 관련 vitest subset 실행
- `npm run type-check`
- `npm run lint`
- Level 2 완료 평가(Stage 1/2) 확인

**완료 기준**

- 실행한 검증 결과와 남은 리스크를 최종 응답에 기록한다.

**커밋**

- 별도 커밋 없음. 필요 시 이전 task 커밋에 포함한다.
