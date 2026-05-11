# AI 하네스 구축 - Task 분할

> 원칙: 각 task는 1개 커밋 단위. 문서/하네스 작업이므로 실패 테스트 대신 "선행 검증"과 "계약 체크"를 먼저 정의한다.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- **포함**
  - 작업 Level 0~3 분류 규칙
  - Level별 planning 프로토콜
  - Level별 템플릿
  - Level 3 seed 계약 템플릿
  - drift/evaluation 문서
  - unstuck/retrospective 문서
  - 루트 `AGENTS.md`와 `.agents/*` 문서 간 링크 정리

- **미포함**
  - Ouroboros 설치 또는 MCP 설정
  - Claude/Codex 전용 hook 자동화
  - GitHub Actions 변경
  - 실제 제품 코드 수정
  - 자동 scoring 스크립트 구현

## 의존성 순서

```text
T1 routing + AGENTS 연결
  -> T2 planning.md Level별 재구성
      -> T3 templates 추가
          -> T4 seed 계약 정리
              -> T5 drift/evaluation 추가
                  -> T6 unstuck/retrospective 추가
                      -> T7 전체 링크/충돌 검토
```

T1이 먼저 있어야 이후 문서들이 Level 기준을 공통 언어로 사용할 수 있다. T7은 모든 문서가 생긴 뒤 중복, 충돌, 링크 누락을 정리한다.

---

## T1 - 작업 Level routing 추가 + AGENTS.md 연결

**보장할 동작**

- 모든 AI 작업은 구현 전 Level 0~3으로 먼저 분류된다.
- 루트 `AGENTS.md`의 기본 작업 흐름이 `.agents/routing.md`를 첫 진입점으로 참조한다.
- 위험도가 높은 작업은 점수와 무관하게 최소 Level 2 또는 Level 3으로 승격된다.

**선행 검증**

- 현재 `AGENTS.md`의 기본 작업 흐름이 바로 `.agents/planning.md` 1단계로 들어가는지 확인한다.
- 현재 `.agents/`에 `routing.md`가 없는지 확인한다.

**작업**

- `.agents/routing.md` 신규 작성
  - Level 0~3 정의
  - 6개 평가 항목: 변경 범위, 모호성, 영향도, 되돌리기 쉬움, 테스트 가능성, 새 지식 필요
  - 0~2점 점수표
  - 총점별 Level 기준
  - 강제 승격 기준
  - Level 판단 결과 출력 형식
- `AGENTS.md` 기본 작업 흐름 수정
  - 요청 수신 후 `.agents/routing.md` 기준으로 Level 분류
  - Level에 따라 `.agents/planning.md`의 해당 프로토콜 수행
  - 기존 금지사항은 유지

**완료 기준**

- `rg -n "routing|Level 0|Level 3|강제 승격" AGENTS.md .agents/routing.md`로 핵심 문구가 확인된다.
- `AGENTS.md`에서 `.agents/routing.md`가 `.agents/planning.md`보다 먼저 언급된다.
- 기존 절대 금지 항목이 삭제되지 않는다.

**커밋**

- `docs: 작업 Level routing 프로토콜 추가`

---

## T2 - planning.md를 Level별 기록 체계로 재구성

**보장할 동작**

- `.agents/planning.md`가 Level 0~3별로 서로 다른 기록 깊이를 정의한다.
- Level 0/1은 가볍게 기록하고, Level 2/3은 기존 plan/task 승인 흐름을 유지한다.
- Level 1 이상에는 intake 확인이 있고, Level 2 이상은 불명확하면 plan 작성을 멈춘다.

**선행 검증**

- 현재 `.agents/planning.md`가 Level 구분 없이 1단계 plan과 2단계 task만 정의하는지 확인한다.
- 기존 `plan.md` 필수 구조와 `task.md` 필수 구조를 보존해야 할 항목으로 표시한다.

**작업**

- `.agents/planning.md` 수정
  - Level 0 mini-record 규칙 추가
  - Level 1 mini-plan 규칙 추가
  - Level 2 full plan/task 규칙 추가
  - Level 3 contract-plan 규칙 추가
  - 0단계 Intake / 명확도 게이트 추가
  - Level별 사용자 승인 대기 조건 명시
- 기존 예외 규칙을 Level 0 규칙과 충돌하지 않게 정리
- plan 합의 전 파일 수정 금지, task 합의 전 구현 금지 원칙 유지

**완료 기준**

- `rg -n "Level 0|Level 1|Level 2|Level 3|Intake|mini-plan|task.md" .agents/planning.md`가 모두 매칭된다.
- Level 2의 plan/task 구조가 기존 `.agents/planning.md`의 필수 항목을 포함한다.
- Level 3이 seed, drift, evaluation을 참조한다.

**커밋**

- `docs: planning 프로토콜을 Level별 기록 체계로 재구성`

---

## T3 - Level별 템플릿 추가

**보장할 동작**

- AI가 Level별 기록을 매번 새로 만들지 않고 템플릿을 사용한다.
- 템플릿은 짧고 복사 가능한 형식이며, 각 Level의 필수 항목을 빠뜨리지 않는다.

**선행 검증**

- 현재 `.agents/templates/`가 없는지 또는 필요한 템플릿이 없는지 확인한다.
- `.agents/planning.md`에서 참조하는 템플릿 이름을 확정한다.

**작업**

- `.agents/templates/` 디렉토리 생성
- 다음 파일 추가
  - `.agents/templates/mini-record.md`
  - `.agents/templates/mini-plan.md`
  - `.agents/templates/plan.md`
  - `.agents/templates/task.md`
- 각 템플릿에 사용 Level, 필수 항목, 작성 예시를 짧게 포함
- `.agents/planning.md`에서 템플릿 경로를 참조하도록 보강

**완료 기준**

- `rg --files .agents/templates`에 4개 템플릿이 모두 보인다.
- 각 템플릿에 `목표`, `검증`, `대안` 또는 해당 Level의 필수 항목이 포함된다.
- `.agents/planning.md`가 템플릿 경로를 참조한다.

**커밋**

- `docs: Level별 하네스 템플릿 추가`

---

## T4 - Level 3 seed 계약 템플릿 추가

**보장할 동작**

- 고위험/불확실 작업은 plan과 별도로 변경하면 안 되는 실행 계약을 작성할 수 있다.
- seed는 목표, 제약, acceptance criteria, non-goals, mechanical gates를 고정한다.
- Level 2에서는 선택 사항, Level 3에서는 필수로 동작한다.

**선행 검증**

- plan.md의 seed 요구사항을 다시 확인한다.
- `.agents/planning.md`에 Level 3 seed 참조가 있는지 확인한다.

**작업**

- `.agents/templates/seed.yaml` 추가
  - `goal`
  - `risk_level`
  - `constraints`
  - `acceptance_criteria`
  - `non_goals`
  - `mechanical_gates`
  - `drift_triggers`
  - `approval_required_when`
- `.agents/planning.md` 또는 `.agents/routing.md`에서 Level 3 seed 필수 조건을 링크
- seed는 plan/task와 달리 구현 중 임의 수정 금지라는 원칙 명시

**완료 기준**

- `rg -n "seed.yaml|acceptance_criteria|non_goals|mechanical_gates|drift_triggers" .agents`로 seed 계약 필드가 확인된다.
- Level 3 문맥에서 seed가 필수라고 명시되어 있다.
- Level 2 문맥에서는 seed가 선택 사항이라고 명시되어 있다.

**커밋**

- `docs: Level 3 seed 계약 템플릿 추가`

---

## T5 - drift/evaluation 게이트 추가

**보장할 동작**

- Level 2 이상 작업은 PR ready 전 mechanical + contract review를 수행한다.
- Level 3 작업은 구현 중 drift를 점검하고, 고위험 변경은 adversarial review를 수행한다.
- drift가 기준 이상이면 구현을 멈추고 사용자 승인을 받는다.

**선행 검증**

- 현재 `.agents/drift.md`와 `.agents/evaluation.md`가 없는지 확인한다.
- 기존 `.agents/testing.md`의 테스트 명령과 `.agents/conventions.md`의 프로젝트 검증 명령을 확인한다.

**작업**

- `.agents/drift.md` 신규 작성
  - drift 산정 항목
  - score 기준
  - 중단 조건
  - 사용자 승인 필요 조건
  - Level별 적용 범위
- `.agents/evaluation.md` 신규 작성
  - Stage 1 Mechanical: type-check, lint, test, 필요 시 build
  - Stage 2 Contract Review: plan/seed acceptance criteria 충족 여부
  - Stage 3 Adversarial Review: 인증/권한/API/데이터/리팩토링 등 고위험 조건
- `.agents/planning.md`와 `.agents/workflow.md`에서 evaluation/drift 문서를 참조하도록 보강

**완료 기준**

- `rg -n "Stage 1|Stage 2|Stage 3|drift score|중단|사용자 승인" .agents/drift.md .agents/evaluation.md`가 모두 매칭된다.
- Level 2와 Level 3의 평가 범위 차이가 명시된다.
- 기존 테스트 명령(`npm run type-check`, `npm run lint`, `npm test`)이 mechanical gate에 포함된다.

**커밋**

- `docs: drift와 evaluation 게이트 추가`

---

## T6 - unstuck/retrospective 프로토콜 추가

**보장할 동작**

- 같은 실패를 반복하면 계속 코딩하지 않고 모드 전환한다.
- 작업에서 배운 실패 패턴은 일회성 회고로 끝나지 않고 `.agents/*` 규칙으로 승격된다.

**선행 검증**

- 현재 `.agents/unstuck.md`와 `.agents/retrospective.md`가 없는지 확인한다.
- `.agents/testing.md`의 "테스트 함정" 섹션을 확인해 retrospective 연결 위치를 정한다.

**작업**

- `.agents/unstuck.md` 신규 작성
  - 트리거: 같은 테스트 2회 실패, 같은 타입 에러 반복, 계획 외 파일 증가, 구현 중 구조가 계속 커짐
  - 모드: researcher, simplifier, contrarian, architect
  - 각 모드의 질문과 출력 형식
- `.agents/retrospective.md` 신규 작성
  - 기록 조건: 잘못된 AI 가정, 누락 테스트, 반복 mock 실수, CI 전용 실패, 계획 누락 리스크
  - 승격 대상: testing, conventions, workflow, planning
  - 작업 종료 시 회고 체크리스트
- `.agents/testing.md`에 retrospective 참조를 짧게 추가

**완료 기준**

- `rg -n "researcher|simplifier|contrarian|architect|retrospective|승격" .agents`가 매칭된다.
- 실패 반복 시 구현 중단 조건이 명시된다.
- `.agents/testing.md`에서 retrospective 문서를 참조한다.

**커밋**

- `docs: unstuck와 retrospective 프로토콜 추가`

---

## T7 - 전체 하네스 링크/충돌 검토

**보장할 동작**

- 루트 `AGENTS.md`에서 새 하네스 문서들이 모두 발견 가능하다.
- 새 규칙이 기존 금지사항과 충돌하지 않는다.
- 계획, 작업 분류, 테스트, workflow, evaluation, drift의 책임 경계가 중복 없이 정리된다.

**선행 검증**

- T1~T6에서 추가/수정된 문서 목록을 확인한다.
- 기존 `AGENTS.md`, `CLAUDE.md`, `.agents/*.md`의 참조 관계를 확인한다.

**작업**

- `AGENTS.md`의 "작업 유형별 상세 문서" 목록 갱신
  - routing
  - planning
  - testing
  - workflow
  - evaluation
  - drift
  - unstuck
  - retrospective
  - commit
  - conventions
- `CLAUDE.md`가 새 공용 진입점과 충돌하지 않는지 확인하고 필요한 경우 최소 수정
- `.agents/workflow.md`에 PR ready 전 evaluation 확인을 연결
- 중복 문구와 모순된 예외 규칙 정리

**완료 기준**

- `rg -n "routing.md|evaluation.md|drift.md|unstuck.md|retrospective.md" AGENTS.md .agents CLAUDE.md`로 새 문서 링크가 확인된다.
- `rg -n "plan 합의 전|task 분할|--no-verify|main" AGENTS.md .agents`로 기존 금지사항이 남아 있다.
- `rg --files .agents`에 계획된 새 문서와 템플릿이 모두 존재한다.
- 문서 변경만 있으므로 제품 테스트는 필수 실행 대상이 아니지만, 최종 검증으로 `npm run type-check`는 가능하면 실행한다.

**커밋**

- `docs: 하네스 문서 링크와 규칙 충돌 정리`

---

## 하네스 체크리스트

- [ ] plan 승인 확인
- [ ] 이슈 생성 여부 결정 (`.agents/workflow.md` 기준)
- [ ] 브랜치 생성 여부 결정
- [ ] T1~T7을 task 단위로 진행
- [ ] 각 task는 커밋 1개로 분리
- [ ] PR 본문에 Level 기반 하네스 변경 요약과 검증 방법 기록
- [ ] 최종적으로 사용자가 실제 하네스 흐름을 따라 한 번 dry-run 해볼 수 있는지 확인

## 후속 과제

- 실제 하네스 사용 사례 1~2개를 만든 뒤 `.agents/examples/` 추가 검토
- Level score를 자동 계산하는 스크립트 도입 여부 검토
- `ooo interview`를 Level 3에서 어떤 조건으로 사용할지 별도 문서화 검토
