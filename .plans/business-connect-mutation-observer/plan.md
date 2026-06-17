# BusinessConnect MutationObserver Scroll

## 무엇을 / 왜

`#business-connect` 해시 진입 시 dynamic import로 섹션 DOM이 늦게 삽입되는 상황을 임의 retry loop가 아니라 DOM 삽입 관찰로 처리한다. 시간 기반 polling 의존도를 줄이고, 실제 DOM 변경 시점에 반응하도록 해 스크롤 동작의 의도를 명확히 한다.

## 현재 상태 진단

- `scrollToBusinessConnectWhenReady`는 80ms 간격으로 최대 20회 `document.getElementById`를 재시도한다.
- `BusinessConnect`는 `next/dynamic`으로 로드되어 최초 해시 처리 시점에 DOM에 없을 수 있다.
- `BusinessConnect` wrapper에는 안정적인 관찰 대상 marker가 없어 `document.body` 관찰로 흐르기 쉽다.

## 해결책

- `BusinessConnect` 정적 wrapper에 `data-business-connect-root` marker를 추가한다.
- `scrollToBusinessConnectWhenReady`를 즉시 시도 후 `MutationObserver`로 root 하위 삽입을 관찰하는 방식으로 변경한다.
- 성공, timeout, unmount 시 observer와 timeout을 정리하는 cleanup 함수를 반환한다.
- 기존 호출 방식과 scroll offset/hash update 동작은 유지한다.

## 트레이드오프

| 선택 | 장점 | 단점 |
|---|---|---|
| MutationObserver + root marker | DOM 삽입에 즉시 반응하고 관찰 범위가 명확하다 | retry보다 코드가 조금 길다 |
| timeout fallback 유지 | observer 영구 유지 방지, 기존 최대 대기 UX 보존 | timeout 값 자체는 여전히 정책값이다 |

## 대안

1. **기존 retry loop 유지**
   - 기각 이유: `20회 * 80ms`처럼 고정된 재시도 횟수는 DOM 삽입 시점과 직접 연결되지 않아 유지보수 근거가 약하다.

2. **`document.body` 전체 관찰**
   - 기각 이유: 구현은 단순하지만 페이지 전체 mutation에 반응해 관찰 범위가 과하다.

## 완료 기준 (DoD)

- [ ] 섹션이 이미 있으면 observer 없이 즉시 스크롤한다.
- [ ] 섹션이 root wrapper 안에 나중에 삽입되면 observer callback으로 스크롤한다.
- [ ] 성공 또는 timeout 시 observer와 timeout이 cleanup 된다.
- [ ] root marker가 없는 경우에도 body fallback으로 동작한다.
- [ ] 기존 해시 갱신과 120px offset 계산이 유지된다.
