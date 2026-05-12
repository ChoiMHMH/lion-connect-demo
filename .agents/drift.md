# Drift 체크

Drift는 구현이 plan/seed의 목표와 제약에서 벗어나는 정도다. Level 2 이상에서 사용하고, Level 3은 구현 중 반복 점검한다.

## 적용 범위

- Level 0: 적용하지 않음
- Level 1: 계획 외 파일이 생기면 Level 재분류
- Level 2: task 완료 시 drift 체크
- Level 3: task 시작/완료 시 drift 체크

## 산정 항목

| 항목 | 점수 |
|---|---:|
| 계획에 없던 파일 또는 도메인 수정 | +0.15 |
| acceptance criteria 재해석 | +0.30 |
| 테스트 전략 변경 또는 테스트 누락 | +0.25 |
| 새 dependency 추가 | +0.20 |
| 인증/권한/API/데이터 흐름 변경 | +0.30 |
| non-goal에 포함된 작업 필요 | +0.30 |

## 중단 기준

- drift score >= 0.30: 구현 중단 후 사용자 승인 필요
- seed의 `goal`, `constraints`, `acceptance_criteria`, `non_goals` 변경 필요: 사용자 승인 필요
- Level 2 작업에서 drift score >= 0.30: Level 3 승격 검토

## 출력 형식

```md
Drift score: <0.00>
항목:
- <항목>: <점수> - <근거>
판정: <계속|사용자 승인 필요|Level 재분류 필요>
```

## 원칙

- drift는 실패가 아니라 방향 변경 신호다.
- drift를 숨기고 구현을 계속하지 않는다.
- 승인받은 방향 변경은 plan/task/seed에 반영한다.
