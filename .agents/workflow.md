# 이슈 → 브랜치 → PR 워크플로우

## 단계 1. 계획 1단계 합의 직후 — 이슈 생성

```bash
gh issue create \
  --title "<한 줄 요약>" \
  --body "$(cat <<'EOF'
## 배경
<plan.md Why 요약>

## 계획
<plan.md 해결책 bullet>

## 완료 기준
<DoD>
EOF
)"
```

## 단계 2. 이슈 번호 수령 직후 — 브랜치 생성

```bash
git checkout -b <type>/<issue-num>-<kebab-slug>
```

type: `feat` | `refactor` | `test` | `docs` | `chore`

## 단계 3. 첫 커밋 push 직후 — Draft PR 생성

```bash
gh pr create --draft \
  --title "<type>: <한 줄 요약> (#<issue-num>)" \
  --body "$(cat <<'EOF'
Closes #<issue-num>

## 요약
<무엇을 왜 바꿨는지 1-3줄>

## 변경 사항
<리뷰어가 알아야 할 변경만 간단히 작성>
- 변경 내용:

## 검증
<실행한 테스트, 타입체크, 린트, 빌드, rg 계약 검증 명령>
- [ ] npm run type-check
EOF
)"
```

## 단계 4. task 완료마다 — 본문 체크박스 업데이트

```bash
gh pr edit <pr-num> --body "<updated>"
```

PR 본문 작성 규칙:

- `변경 사항`에는 리뷰어가 알아야 할 변경만 적는다.
- `검증`에는 실제 실행한 명령만 적는다.
- `T1: rg 계약 체크`처럼 task와 검증이 섞인 메모는 쓰지 않는다.
- 리스크, 롤백, 스크린샷, 수치 변화는 필요한 PR에만 별도 섹션으로 추가한다.

## 단계 5. 모든 task 완료 + CI 녹색 — Ready 해제

Ready 해제 전 `.agents/evaluation.md` 기준으로 필요한 stage를 확인한다. Level 3 작업은 `.agents/drift.md` 결과와 adversarial review 결과도 PR 본문에 남긴다.

```bash
gh pr ready <pr-num>
```

## 단위 규칙

- 1 이슈 = 1 PR = N task 커밋
- Phase 하나 = 이슈 1개 (예: "Phase 2: 테스트 + CI")
- 방향 틀어지면 `gh pr close` + 브랜치 삭제, 재시도

## 금지

- PR 을 ready 상태로 바로 만들기 (반드시 `--draft` 로 시작)
- 이슈 없이 PR 생성
- main 브랜치에서 직접 작업
