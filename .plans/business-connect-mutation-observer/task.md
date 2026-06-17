# BusinessConnect MutationObserver Scroll - Task 분할

> 원칙: 각 task는 1개 커밋 단위.
> plan: [plan.md](./plan.md)

## 본 작업의 스코프

- 포함: BusinessConnect 해시 스크롤 대기 로직, 관찰 root marker, 관련 유틸 테스트
- 미포함: 디자인/레이아웃 변경, 새 dependency 추가, 다른 해시 스크롤 일반화

## 의존성 순서

```text
T1 -> T2 -> T3
```

## T1 - observer 동작 테스트 추가

**보장할 동작**

섹션의 즉시 존재, 지연 삽입, timeout, root fallback 시나리오를 유틸 테스트로 고정한다.

**선행 테스트 / 선행 검증**

`npm test -- lib/__tests__/businessConnectNavigation.test.ts`가 현재 구현에서 실패해야 한다.

**작업**

`businessConnectNavigation` 테스트에 `MutationObserver`와 timer 기반 케이스를 추가한다.

**완료 기준**

새 테스트가 기존 retry 구현에서 red 상태를 만든다.

**커밋**

- `test: cover business connect observer scroll`

## T2 - MutationObserver 구현

**보장할 동작**

`scrollToBusinessConnectWhenReady`가 즉시 시도 후 root wrapper를 관찰하고 cleanup 함수를 반환한다.

**선행 테스트 / 선행 검증**

T1 테스트 red 확인.

**작업**

`lib/businessConnectNavigation.ts`를 observer 기반으로 변경하고 root marker 상수를 추가한다.

**완료 기준**

`npm test -- lib/__tests__/businessConnectNavigation.test.ts`가 green이다.

**커밋**

- `fix: observe business connect section before scrolling`

## T3 - root marker와 effect cleanup 연결

**보장할 동작**

BusinessConnect 정적 wrapper만 관찰 대상으로 사용할 수 있고, 최초 해시 처리 effect가 unmount 시 cleanup 한다.

**선행 테스트 / 선행 검증**

유틸 테스트 green.

**작업**

홈 페이지 wrapper에 marker를 추가하고 `ScrollToHash`에서 cleanup을 반환한다.

**완료 기준**

관련 테스트, type-check, lint가 통과한다.

**커밋**

- `chore: wire business connect scroll cleanup`
