# 계획 프로토콜

모든 작업은 먼저 `.agents/routing.md`로 Level 0~3을 분류한 뒤, 이 문서의 해당 Level 프로토콜을 따른다.

## 공통 원칙

- Level 분류는 구현 허가가 아니다.
- 파일 수정은 해당 Level의 기록/승인 조건을 충족한 뒤 시작한다.
- 새 기능, 리팩토링, API/폼/상태 변경은 테스트 전략 없이 시작하지 않는다.
- 기록은 작업을 느리게 하기 위한 문서가 아니라 AI의 가정, 대안, 검증 기준을 고정하기 위한 최소 계약이다.

## 템플릿

- Level 0: `.agents/templates/mini-record.md`
- Level 1: `.agents/templates/mini-plan.md`
- Level 2 이상 plan: `.agents/templates/plan.md`
- Level 2 이상 task: `.agents/templates/task.md`

## 0단계 — Intake / 명확도 확인

Level 1 이상은 planning 전에 아래를 확인한다.

- 목표: 무엇을 바꾸는가?
- 성공 기준: 완료를 어떻게 판단하는가?
- 보존할 기존 동작: 깨지면 안 되는 동작은 무엇인가?
- 수정 범위: 어떤 파일/도메인이 영향을 받을 가능성이 있는가?
- 검증 전략: 어떤 테스트나 명령으로 확인할 수 있는가?

Level 2 이상에서 위 항목 중 하나라도 불명확하면 plan 작성을 멈추고 질문만 한다.

Level 3은 추가로 `ambiguity score`를 기록한다.

- 0.0~0.2: 진행 가능
- 0.21~0.4: 추가 질문 후 재평가
- 0.41 이상: plan/seed/task 작성 금지

## Level 0 — Mini Record

오타, 주석, 문구, 단일 라인 수정처럼 위험도가 낮은 작업.

- plan.md / task.md 생략 가능
- 파일 수정 전 3줄 기록을 남긴다.

```md
목표:
변경:
검증:
```

완료 기준:

- 변경 범위가 단일 라인 또는 단일 파일에 머문다.
- 검증 명령 또는 수동 확인 방법이 1개 이상 있다.
- 커밋은 가능하면 1개로 끝낸다.

## Level 1 — Mini Plan

단일 파일 또는 좁은 범위의 소형 수정. 작은 작업이라도 대안과 검증 기준을 짧게 남긴다.

필수 구조:

```md
## 무엇을 / 왜

## 현재 상태

## 선택한 해결책

## 대안

- 대안:
- 기각 이유:

## 검증
```

완료 기준:

- 대안 1개 이상과 기각 이유가 있다.
- 자동 테스트가 없으면 수동 검증 방법을 명시한다.
- task.md는 선택 사항이다. 커밋이 2개 이상 예상되면 Level 2로 승격한다.

## Level 2 — Full Plan + Task

여러 파일, 기능 추가, 리팩토링, API/폼/상태 변경 등 일반 PR 작업.

### 1단계 — 상위 계획 (`plan.md` 생성)

- 파일 수정 **금지**. 읽기만 OK
- 다음 구조로 `.plans/<slug>/plan.md` 생성 (또는 사용자가 지정한 경로):
  - 무엇을 / 왜
  - 현재 상태 진단
  - 해결책 (bullet 3–5개)
  - 트레이드오프 (최소 2개)
  - 대안 (최소 2개) — 기각 이유 포함
  - 완료 기준 (DoD 체크리스트)
- 작성 후 사용자 "진행" 확인 대기

### 2단계 — 상세 task 분할 (`task.md` 생성)

1단계 승인 후에만 착수.

- `.plans/<slug>/task.md` 생성:
  - 각 task = 커밋 1개 단위
  - task마다 **먼저 쓸 테스트** 또는 문서 작업이면 **선행 검증** 명시
  - task 순서는 의존성 기반
  - 각 task 완료 기준 1줄 이상
- 사용자 "좋아" 확인 후 첫 task 착수

완료 기준:

- `plan.md`와 `task.md`가 모두 있다.
- 새 기능/리팩토링은 TDD 순서를 따른다.
- Level 2 작업은 PR ready 전 `.agents/evaluation.md`의 Stage 1/2를 통과해야 한다.
- seed는 선택 사항이다. 작업 중 방향 재해석 가능성이 크면 Level 3으로 승격한다.

## Level 3 — Contract Plan

고위험/불확실 작업. 인증/권한, 대규모 리팩토링, 새 기술 선택, 아키텍처 변경, 요구사항이 불명확한 작업에 적용한다.

필수 산출물:

- `.plans/<slug>/plan.md`
- `.plans/<slug>/seed.yaml` 또는 seed 섹션
- `.plans/<slug>/task.md`
- drift/evaluation 결과 기록

추가 규칙:

- 필요 시 `ooo interview` 또는 공식 문서/웹 조사를 사용해 요구사항을 명확히 한다.
- seed에는 `goal`, `constraints`, `acceptance_criteria`, `non_goals`, `mechanical_gates`를 고정한다.
- seed는 구현 중 임의 수정하지 않는다. 변경이 필요하면 사용자 승인 후 plan/task를 갱신한다.
- 구현 중 `.agents/drift.md` 기준 drift가 임계값을 넘으면 작업을 멈추고 사용자 승인을 받는다.
- PR ready 전 `.agents/evaluation.md`의 Stage 1/2/3를 수행한다.

완료 기준:

- ambiguity score가 0.2 이하이거나, 사용자가 높은 ambiguity를 인지하고 명시 승인했다.
- seed와 task가 서로 모순되지 않는다.
- adversarial review에서 남은 리스크가 PR 본문에 기록된다.

## 금지

- Level 분류 없이 planning으로 바로 들어가기
- Level 2 이상에서 1단계 건너뛰고 2단계로 가기
- Level 2 이상에서 2단계 건너뛰고 구현 가기
- plan.md/task.md 없이 여러 파일 수정
- seed가 필요한 Level 3 작업에서 seed 없이 구현 시작

## 예외

- Level 0 초소형 수정은 plan.md/task.md 생략 가능
- 단, PR 단위 작업(여러 커밋 예상)이면 반드시 Level 2 이상으로 승격
- 작은 수정이라도 강제 승격 기준에 걸리면 `.agents/routing.md`의 최소 Level을 따른다.
