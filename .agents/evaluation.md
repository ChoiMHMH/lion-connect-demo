# Evaluation 게이트

작업 완료 전 산출물이 계획과 검증 기준을 만족하는지 확인한다. Level에 따라 필요한 stage가 다르다.

## Level별 적용

- Level 0: 기록한 검증 1개 수행
- Level 1: mini-plan의 검증 수행
- Level 2: Stage 1 + Stage 2
- Level 3: Stage 1 + Stage 2 + Stage 3

## Stage 1 — Mechanical

가능한 자동 검증을 먼저 수행한다.

기본 명령:

```bash
npm run type-check
npm run lint
npm test
```

필요 시 추가:

```bash
npm run build
npm run test:coverage
```

문서만 바뀐 작업은 제품 테스트를 생략할 수 있다. 단, 생략 사유를 PR 본문에 적는다.

## Stage 2 — Contract Review

plan/task/seed 기준으로 산출물을 대조한다.

확인 항목:

- plan의 완료 기준(DoD)을 충족했는가?
- task별 완료 기준이 충족됐는가?
- seed가 있다면 `acceptance_criteria`를 모두 만족하는가?
- `constraints`를 위반하지 않았는가?
- `non_goals`에 해당하는 작업을 하지 않았는가?
- 테스트 또는 검증 근거가 남아 있는가?

출력 형식:

```md
Contract Review:
- DoD: <pass|revise>
- task 기준: <pass|revise>
- seed 기준: <pass|revise|없음>
- 남은 리스크:
```

## Stage 3 — Adversarial Review

고위험 변경은 반대자 관점으로 다시 본다.

트리거:

- 인증/권한 변경
- API 계약 변경
- 데이터 저장/삭제/제출 흐름 변경
- 공용 상태 관리 변경
- 대규모 리팩토링
- drift score >= 0.20
- 테스트가 복잡한 mock에 크게 의존

질문:

- 이 변경이 깨뜨릴 수 있는 기존 동작은 무엇인가?
- 테스트가 검증하지 못하는 실패 경로는 무엇인가?
- 더 단순한 대안은 없는가?
- 롤백은 한 커밋 revert로 가능한가?
- AI가 암묵적으로 가정한 것은 무엇인가?

출력 형식:

```md
Adversarial Review:
- 주요 리스크:
- 누락 가능 테스트:
- 더 단순한 대안:
- 롤백 방법:
- 판정: <pass|revise|stop>
```
