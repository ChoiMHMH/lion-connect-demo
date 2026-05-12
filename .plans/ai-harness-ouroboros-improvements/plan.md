# AI 하네스 구축 계획 - 작업 Level 기반 최소 기록 체계

## 무엇을 / 왜

**무엇을**

- 현재 `.agents` 기반 하네스를 "작업 Level 기반 최소 기록 체계"로 확장한다.
- 모든 작업은 기록하되, 모든 작업에 같은 무게의 plan/task/seed를 요구하지 않는다.
- 작업 전 Level 0~3으로 위험도를 분류하고, Level에 맞는 최소 기록만 남긴다.
- 핵심 도입 대상은 다음이다.
  - 작업 분류 routing 규칙
  - Level별 planning 규칙
  - pre-plan 명확도 게이트
  - 고위험 작업용 불변 실행 계약(seed)
  - 작업 중 drift 체크
  - mechanical/contract/adversarial evaluation
  - unstuck 모드 전환
  - retrospective 기반 규칙 누적

**왜**

- 현재 하네스는 `계획 -> 승인 -> task 분할 -> TDD -> 커밋/PR` 흐름을 잘 강제하지만, 작업 전 요구사항 명확도 측정과 작업 중 방향 이탈 감지는 약하다.
- 작은 작업도 목표, 대안, 장단점, 검증 기준을 짧게라도 남기면 AI의 가정과 검증 책임이 명확해진다.
- 다만 모든 작업에 full plan을 강제하면 문서가 작업보다 커질 수 있으므로, 위험도에 맞춰 기록 깊이를 조절한다.
- Ouroboros는 전체를 그대로 들여오기에는 무겁지만, "명확해질 때까지 만들지 않기", "실행 계약을 고정하기", "평가 결과를 다음 규칙으로 되먹임하기"는 현재 하네스에도 적용 가치가 있다.
- 목표는 AI가 더 자율적으로 코딩하게 만드는 것이 아니라, 더 좁은 계약 안에서 더 기계적으로 움직이게 만드는 것이다.
- 작업 리뷰와 유지보수 관점에서는 "AI를 사용했다"보다 "AI 산출물을 계획, 검증, 커밋 단위, 회고로 통제했다"는 근거를 남긴다.

## 현재 상태 진단

- 루트 `AGENTS.md`가 공용 진입점이며 `.agents/planning.md`, `.agents/testing.md`, `.agents/workflow.md`, `.agents/commit.md`, `.agents/conventions.md`로 상세 규칙이 분리되어 있다.
- `.agents/planning.md`는 1단계 plan과 2단계 task 승인을 강제한다. 다만 plan 작성 전 요구사항이 충분히 명확한지 판단하는 별도 intake 단계는 없다.
- 현재 계획 규칙은 Level 2 이상의 PR 작업에는 적합하지만, 오타/문구/단일 파일 수정 같은 작은 작업에는 과하게 무거울 수 있다.
- 반대로 인증, 권한, API, 폼 제출, 상태 관리, 리팩토링처럼 작아 보여도 위험한 작업을 별도로 승격하는 규칙은 없다.
- `.agents/testing.md`는 TDD 순서와 테스트 함정 기록을 다루지만, 작업 종료 후 "AI가 무엇을 잘못 가정했는지"를 일반 규칙으로 승격하는 회고 프로토콜은 약하다.
- `.agents/workflow.md`는 이슈/브랜치/draft PR 흐름을 정의한다. 다만 PR ready 전 seed 기준 평가나 drift 보고는 없다.
- Ouroboros는 단순 문서가 아니라 CLI, skills, MCP, event store, evaluation/evolution loop를 포함한 실행형 프레임워크다. 이 레포에는 전체 도입보다 경량 규칙 이식이 적합하다.

## 해결책

1. **작업 Level routing 추가**
   - 새 문서 `.agents/routing.md`를 추가한다.
   - 모든 요청은 먼저 Level 0~3으로 분류한다.
   - 분류 기준은 작업량보다 위험도 중심으로 둔다.
   - 평가 항목은 변경 범위, 모호성, 영향도, 되돌리기 쉬움, 테스트 가능성, 새 지식 필요 여부다.
   - 각 항목을 0~2점으로 평가해 총점으로 기본 Level을 정한다.
   - 단, 인증/권한, 데이터 삭제/저장/제출, API 계약, 공용 유틸/상태 관리, 리팩토링, 새 dependency는 점수와 무관하게 최소 Level 2로 승격한다.

2. **Level별 planning 규칙으로 재구성**
   - `.agents/planning.md`를 Level별 기록 규칙으로 재정리한다.
   - Level 0: 초소형 수정
     - 목표 1줄
     - 변경 1줄
     - 검증 1줄
     - plan/task 생략 가능
   - Level 1: 일반 소형 수정
     - mini-plan 작성
     - 무엇을/왜, 현재 상태, 선택한 해결책, 대안 1개, 검증 방법
     - task.md는 선택
   - Level 2: 일반 PR 작업
     - 기존 full plan.md + task.md 유지
     - TDD 필수
     - task = commit
   - Level 3: 고위험/불확실 작업
     - full plan.md + seed + task.md + drift/evaluation 필수
     - 필요 시 `ooo interview` 또는 공식 문서/웹 조사 사용

3. **0단계 Intake / 명확도 게이트 추가**
   - Level 1 이상에서는 plan 작성 전 목표/성공 기준/보존할 기존 동작/테스트 전략을 확인한다.
   - Level 2 이상에서는 불명확한 항목이 있으면 질문만 수행하고 plan 작성을 멈춘다.
   - Level 3에서는 `ambiguity score`를 기록하고 기준값 초과 시 seed/task 작성 금지.

4. **Seed 계약 문서 도입**
   - Level 3 작업에 `.plans/<slug>/seed.yaml` 또는 `seed.md`를 추가한다.
   - Level 2 작업은 seed를 선택 사항으로 둔다.
   - `goal`, `constraints`, `acceptance_criteria`, `non_goals`, `mechanical_gates`를 명시한다.
   - plan은 논의 문서, seed는 구현 중 변경하면 안 되는 실행 계약으로 둔다.

5. **Drift / Evaluation 게이트 추가**
   - `.agents/drift.md`에 계획 외 파일 수정, acceptance criteria 재해석, 테스트 누락, 새 dependency 추가 등 drift 산정 규칙을 둔다.
   - `.agents/evaluation.md`에 Stage 1 mechanical, Stage 2 seed contract review, Stage 3 adversarial review를 정의한다.
   - Level 2에서는 PR ready 전 mechanical + contract review를 수행한다.
   - Level 3에서는 drift check와 adversarial review까지 수행한다.
   - drift가 일정 기준 이상이면 구현을 멈추고 사용자 승인을 받도록 한다.

6. **Unstuck / Retrospective 프로토콜 추가**
   - `.agents/unstuck.md`를 추가해 같은 실패 반복 시 `researcher`, `simplifier`, `contrarian`, `architect` 모드로 전환한다.
   - `.agents/retrospective.md`를 추가해 잘못된 AI 가정, 누락 테스트, 반복된 mock 실수, CI 전용 실패를 종료 시 기록한다.
   - 기록 대상은 `.agents/testing.md`, `.agents/conventions.md`, `.agents/workflow.md` 중 가장 맞는 문서로 승격한다.

7. **템플릿 추가**
   - `.agents/templates/`를 추가한다.
   - AI가 매번 형식을 새로 만들지 않도록 Level별 템플릿을 둔다.
     - `mini-record.md`
     - `mini-plan.md`
     - `plan.md`
     - `task.md`
     - `seed.yaml`

## 작업 Level 기준

| Level | 이름 | 적용 대상 | 필요한 기록 |
|---|---|---|---|
| Level 0 | 초소형 수정 | 오타, 주석, 문구, 단일 라인 수정 | 목표/변경/검증 3줄 |
| Level 1 | 일반 소형 수정 | 단일 파일 또는 좁은 범위 수정 | mini-plan |
| Level 2 | 일반 PR 작업 | 여러 파일, 기능, 리팩토링, API/폼/상태 변경 | plan.md + task.md + TDD |
| Level 3 | 고위험/불확실 작업 | 인증/권한/대규모 리팩토링/새 기술/아키텍처 변경 | plan.md + seed + task.md + drift/evaluation |

## Level 산정 방식

각 항목을 0~2점으로 평가한다.

| 항목 | 0점 | 1점 | 2점 |
|---|---|---|---|
| 변경 범위 | 단일 라인/단일 파일 | 2~3개 파일 | 여러 도메인/여러 계층 |
| 모호성 | 목표와 성공 기준 명확 | 일부 가정 필요 | 질문 없이는 판단 어려움 |
| 영향도 | UI 문구/문서 | 단일 기능 | 인증/권한/API/데이터/상태 |
| 되돌리기 쉬움 | 커밋 revert로 충분 | 일부 데이터/동작 영향 | 롤백 비용 큼 |
| 테스트 가능성 | 검증 명령 명확 | 테스트 설계 필요 | 테스트 전략부터 불명확 |
| 새 지식 필요 | 기존 패턴 그대로 | 라이브러리 사용법 확인 필요 | 최신 문서/외부 조사 필요 |

총점 기준:

- 0~2점: Level 0
- 3~5점: Level 1
- 6~8점: Level 2
- 9점 이상: Level 3

강제 승격 기준:

- 인증/권한 변경: 최소 Level 2
- 데이터 삭제/저장/제출: 최소 Level 2
- API 계약 변경: 최소 Level 2
- 공용 유틸/상태 관리 변경: 최소 Level 2
- 리팩토링: 최소 Level 2
- 새 dependency 추가: 최소 Level 2
- 아키텍처/기술 선택 변경: 최소 Level 3

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| Ouroboros 전체 설치 대신 경량 규칙 이식 | 현재 레포 워크플로우를 유지하면서 통제력만 강화 | 자동 실행, event store, MCP 기반 평가 같은 기능은 없음 |
| 모든 작업 기록 + Level별 깊이 조절 | 작은 작업도 의사결정 기록이 남고, 큰 작업은 충분히 통제됨 | 처음에는 Level 판단 비용이 생김 |
| ambiguity/drift를 정성+점수 혼합으로 운영 | 구현 비용 낮고 바로 적용 가능 | 점수가 엄밀한 수학 모델은 아니므로 에이전트가 보수적으로 해석해야 함 |
| seed 문서를 Level 3 중심으로 사용 | 고위험 작업에서 방향 재해석을 줄임 | Level 2와 Level 3 경계 판단이 필요함 |
| adversarial review를 조건부로 실행 | 고위험 변경만 더 엄격히 봄 | 조건 판단이 애매하면 누락될 수 있음 |
| retrospective를 문서 누적으로 운영 | 하네스가 실제 실패 경험을 먹고 성장함 | 주기적으로 정리하지 않으면 문서가 산만해질 수 있음 |
| `ooo interview`를 선택 도구로 사용 | 모호한 요구사항을 빠르게 질문으로 분해 가능 | 외부 도구 버전/설정 변화에 의존할 수 있음 |

## 대안

1. **Ouroboros를 그대로 설치해 사용**
   - 장점: interview, seed, evaluate, evolve, ralph 같은 기능을 바로 활용 가능.
   - 기각 이유: 현재 레포는 이미 GitHub issue/PR/TDD 중심 하네스가 있고, Ouroboros 전체 런타임은 도입 비용과 운영 복잡도가 크다. 프론트엔드 제품 코드에서는 과한 자동 진화 루프가 오히려 방향성 위험을 키울 수 있다.

2. **현재 하네스를 유지하고 아무것도 추가하지 않음**
   - 장점: 단순하고 기존 흐름이 깨지지 않음.
   - 기각 이유: plan 이후 구현 중 drift를 잡는 장치가 약하고, 요구사항이 모호한 상태에서 plan이 작성될 수 있다.

3. **자동화 스크립트부터 작성**
   - 장점: drift/evaluation을 기계적으로 검사할 수 있음.
   - 기각 이유: 먼저 어떤 규칙을 검사할지 안정화해야 한다. 지금은 문서 규칙으로 운영하면서 반복 패턴이 쌓인 뒤 자동화하는 편이 안전하다.

4. **Claude/Codex별 전용 hook만 추가**
   - 장점: 특정 도구에서는 강제력이 높다.
   - 기각 이유: 이 레포의 공용 진입점은 `AGENTS.md`이고 Claude/Codex 양쪽을 고려한다. 도구별 hook보다 공용 규칙을 먼저 강화하는 것이 맞다.

5. **모든 작업에 full plan.md + task.md 강제**
   - 장점: 기록이 가장 풍부하고 의사결정 추적이 쉽다.
   - 기각 이유: 작은 작업에서 문서가 작업보다 커질 수 있다. 팀 작업에서도 "꼼꼼함"보다 "느림"으로 보일 위험이 있다. 대신 Level별 최소 기록으로 균형을 잡는다.

6. **작은 작업은 기록 없이 바로 수정**
   - 장점: 속도가 빠르다.
   - 기각 이유: 신입의 학습 기록, 대안 비교 습관, AI 가정 노출이라는 하네스 목적과 맞지 않는다. 단, Level 0은 3줄 기록으로 충분히 가볍게 처리한다.

## 완료 기준 (DoD)

- [ ] `AGENTS.md` 기본 작업 흐름 앞단에 Level 분류 단계가 추가된다.
- [ ] `.agents/routing.md`가 추가되고 Level 0~3 분류 기준이 명시된다.
- [ ] `.agents/planning.md`가 Level별 기록 규칙으로 재구성된다.
- [ ] `.agents/planning.md`에 0단계 Intake / 명확도 게이트가 추가된다.
- [ ] `.agents/templates/mini-record.md`가 추가된다.
- [ ] `.agents/templates/mini-plan.md`가 추가된다.
- [ ] `.agents/templates/plan.md`가 추가된다.
- [ ] `.agents/templates/task.md`가 추가된다.
- [ ] Level 3 작업용 seed 템플릿이 정의된다. 경로는 `.agents/templates/seed.yaml` 또는 `.agents/seed.md` 중 task 단계에서 확정한다.
- [ ] `.agents/drift.md`가 추가되고 drift score 기준과 중단 조건이 명시된다.
- [ ] `.agents/evaluation.md`가 추가되고 Stage 1/2/3 평가 기준이 명시된다.
- [ ] `.agents/unstuck.md`가 추가되고 실패 반복 시 모드 전환 기준이 명시된다.
- [ ] `.agents/retrospective.md`가 추가되고 실패 경험을 기존 규칙 문서로 승격하는 방식이 명시된다.
- [ ] 새 규칙이 기존 금지사항과 충돌하지 않는다.
  - main 직접 커밋 금지
  - plan 합의 전 구현 금지
  - task 분할 합의 전 구현 금지
  - 테스트 없는 기능/리팩토링 금지
  - `--no-verify` 금지

## 다음 단계

이 plan이 승인되면 `.plans/ai-harness-ouroboros-improvements/task.md`를 작성한다.

task 분할은 다음 순서를 권장한다.

1. `routing.md` 추가 + `AGENTS.md` 흐름에 Level 분류 연결
2. `planning.md`를 Level별 기록 체계로 재구성
3. `.agents/templates/` 추가
4. Level 3용 seed 템플릿 추가
5. drift/evaluation 문서 추가
6. unstuck/retrospective 문서 추가
7. 전체 하네스 문서 간 링크와 중복 정리
