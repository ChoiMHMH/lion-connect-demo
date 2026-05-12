# T11 - Verification And Evaluation

> depends on: T10

## 보장할 동작

구현 후 Level 3에 필요한 기계 검증, 수동 검증, drift/evaluation 기록, 최종 결과 요약이 남는다.

## 선행 테스트 / 선행 검증

- `sed -n '1,260p' .agents/drift.md`
- `sed -n '1,320p' .agents/evaluation.md`
- `cat package.json`

## 작업

- `npm run lint`를 실행하고 실패 시 원인을 수정하거나 failure report에 남긴다.
- `npm run type-check`를 실행하고 실패 시 원인을 수정하거나 failure report에 남긴다.
- `npm run test`를 실행하고 실패 시 원인을 수정하거나 failure report에 남긴다.
- `npm run build`를 실행하고 실패 시 원인을 수정하거나 failure report에 남긴다.
- 데모 플로우를 수동 확인한다.
- `.agents/drift.md` 기준 drift를 점검한다.
- `.agents/evaluation.md` Stage 1/2/3 기준으로 남은 리스크를 정리한다.
- PR 본문에 실제 검증 결과와 남은 mock coverage 한계를 반영한다.
- 모든 완료 task를 `task-control.md`에 체크한다.

## 완료 기준

- lint/type-check/test/build 결과가 기록되어 있다.
- 랜딩 안내, 로그인 차단, demo role navigation, 이력서 저장 API 로그, role별 주요 페이지를 확인했다.
- 남은 mock API와 사용자가 직접 넣어야 하는 이미지가 명확히 정리되어 있다.
- draft PR을 ready로 전환할 수 있는 상태다.

## 커밋

- `chore: verify portfolio demo mode`
