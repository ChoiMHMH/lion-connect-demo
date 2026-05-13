# T01 - Workflow Bootstrap

> plan: [plan.md](./plan.md)  
> seed: [seed.yaml](./seed.yaml)

## 보장할 동작

Level 3 계획 산출물, 이슈, 브랜치, task 분할이 고정되어 이후 구현 task를 한 개씩 진행할 수 있다.

## 선행 테스트 / 선행 검증

- `git status --short --branch`
- GitHub issue 번호 확인
- plan/seed/task 파일 경로 확인

## 작업

- `.plans/portfolio-demo-mode/plan.md`와 `seed.yaml`을 확정한다.
- `.plans/portfolio-demo-mode/task-control.md`와 개별 task 파일을 추가한다.
- GitHub issue를 생성하고 작업 브랜치를 만든다.
- 첫 커밋 후 draft PR을 생성한다.
- `task-control.md`에서 T01만 완료 표시한다.

## 완료 기준

- Issue `#19`와 작업 브랜치가 연결되어 있다.
- planning/task 산출물이 커밋되어 draft PR 생성이 가능하다.
- 구현 코드는 아직 변경하지 않는다.

## 커밋

- `docs: plan portfolio demo mode recovery`
