# 데모 스토어 영속화 + 인재탐색 첫 페인트 정리 - Task 분할

> 원칙: 각 task는 1개 커밋 단위. TDD(실패 테스트 → green → refactor).
> plan: [plan.md](./plan.md) / seed: [seed.yaml](./seed.yaml)

## 본 작업의 스코프

- 포함:
  - 데모 JSON 상태 localStorage 영속 (resumeStore / roleStore)
  - 브라우저에서 데모 API 클라이언트 디스패치 (`/api/demo/uploads/*` 제외, 폴스루)
  - #3 공개 토글 시 `["talents"]` 캐시 무효화
  - #1 `/talents` Suspense fallback + 높이 예약
  - 데모 리셋 경로 확장 (localStorage + IndexedDB)
  - 업로드 바이너리 IndexedDB 영속 + Service Worker 서빙(`/api/demo/uploads/*`)
- 미포함:
  - 실서버 API/계약, 인증/권한, 데모 데이터 모델 변경
  - 비데모 경로 동작 변경

## 의존성 순서

```text
T1(#1 UI) ─ 독립, 먼저 분리
T2(영속 어댑터) -> T3(stores hydrate/persist) -> T4(apiClient 클라 디스패치) -> T5(#3 캐시 무효화)
                                              -> T6(리셋 경로 확장)
T4 -> T7(업로드 IndexedDB + SW)
모든 T -> T8(통합 검증)
```

> T1은 다른 task와 독립(순수 UI). 가장 먼저 커밋해 리스크를 줄인다.
> 핵심 버그(#2/#3/#4)는 T2~T6에서 해결된다. T7(업로드)은 분리되어 있어 단독 실패해도 #1~#4에 영향 없음.

---

## T1 - /talents 첫 페인트 Footer 점프 제거 (#1)

**보장할 동작**
- `/talents` 새로고침 시 Footer가 먼저 떴다가 스켈레톤에 밀려 내려가지 않는다. 첫 프레임부터 스켈레톤 영역 높이 고정.

**선행 테스트 / 선행 검증**
- `app/(company)/talents/__tests__/page.suspense.test.tsx`(신규): Suspense fallback 렌더 시 스켈레톤(3장) + 헤더가 보이고, 콘텐츠 영역이 비어있지 않음을 assert.

**작업**
- `app/(company)/talents/page.tsx`의 `<Suspense>`에 로딩 스켈레톤과 동일 레이아웃 fallback 지정(현 `isLoading` 분기 마크업을 공용 컴포넌트로 추출해 재사용).
- 콘텐츠 래퍼에 min-height 예약(스켈레톤/빈상태/데이터 전환 시 Footer 위치 고정). layout의 `pt-20` + Footer 구조와 충돌 없는 값 사용.

**완료 기준**
- 수동: dev에서 강한 새로고침 반복 시 Footer 점프 없음.
- 신규 테스트 green, 기존 회귀 없음.

**커밋**
- `fix: prevent footer jump on talents first paint (#1)`

---

## T2 - 데모 영속 어댑터 추가 (localStorage JSON / IndexedDB Blob 경계)

**보장할 동작**
- 얇은 어댑터로 JSON(localStorage)과 Blob(IndexedDB) 영속을 캡슐화. SSR/비브라우저에서는 no-op(시드 동작 유지).

**선행 테스트 / 선행 검증**
- `lib/demo/__tests__/demoPersistence.test.ts`(신규): JSON set/get 라운드트립, 키 네임스페이스, 브라우저 미감지 시 no-op, IndexedDB put/get(블롭) 모킹.

**작업**
- `lib/demo/persistence.ts`(신규):
  - `loadDemoJson<T>(key)` / `saveDemoJson(key, value)` (localStorage, try/catch, 용량초과 graceful).
  - `putDemoBlob(objectKey, blob)` / `getDemoBlob(objectKey)` / `clearDemoBlobs()` (IndexedDB, 무의존 직접 구현).
  - `isBrowser()` 가드.

**완료 기준**
- 신규 테스트 green. tsc/lint 통과. 다른 파일 미수정.

**커밋**
- `feat: add demo persistence adapter (localStorage + indexeddb)`

---

## T3 - resumeStore / roleStore hydrate·persist 연결 (JSON 영속)

**보장할 동작**
- 스토어 변경 시 localStorage에 직렬화, 첫 접근 시 저장값으로 hydrate. 저장값 없을 때만 시드 1회.

**선행 테스트 / 선행 검증**
- `lib/demo/__tests__/resumeStore.persist.test.ts`(신규): 프로필 이름 수정 → persist → 새 모듈 로드(hydrate) → 수정값 유지. 저장소 비면 시드.
- `roleStore` 동일 패턴 1케이스(공개여부 변경 후 hydrate 일관).

**작업**
- `lib/demo/resumeStore.ts`: `buildStore()` 전 hydrate 시도, 변경 함수에서 persist 호출(또는 mutation 래퍼 1곳에 집약). `resetDemoResumeStore`가 저장소도 클리어.
- `lib/demo/roleStore.ts`: 동일하게 hydrate/persist. roleStore→resumeStore 단방향 유지.

**완료 기준**
- 신규/기존 테스트 green. 시드 1회 보장.

**커밋**
- `feat: persist demo resume/role stores to localStorage`

---

## T4 - 브라우저에서 데모 API 클라이언트 디스패치 (uploads 폴스루)

**보장할 동작**
- 브라우저 + `isDemoRequest`이면 `fetch('/api/demo')` 대신 `handleDemoApiRequest`를 클라에서 호출 → 단일 소스(localStorage)로 일관. `/api/demo/uploads/*`는 실 fetch로 폴스루(서버 서빙 유지, T7 전 회귀 방지).

**선행 테스트 / 선행 검증**
- `lib/__tests__/apiClient.demo.client.test.ts`(신규): 데모 PUT(이름 수정) → 직후 GET이 수정값 반환(네트워크 미경유, 단일 메모리/localStorage). `/uploads` 경로는 fetch로 위임됨을 assert.

**작업**
- `lib/apiClient.ts`: `isDemoRequest && isBrowser && !path.startsWith('/api/demo/uploads')`이면 `Request` 구성 후 `handleDemoApiRequest(request, segments)` 호출, 응답을 동일 파이프라인으로 처리. 데모 API 로그 기록 유지.
- `handleDemoApiRequest`/mockApi import가 클라 번들에서 안전한지 확인(서버 전용 API 미사용).

**완료 기준**
- 신규 테스트 green. 비데모 경로 영향 없음(기존 apiClient 테스트 green).

**커밋**
- `feat: dispatch demo api on client for store consistency`

---

## T5 - 공개 토글 시 인재탐색 캐시 즉시 반영 (#3)

**보장할 동작**
- 공개/비공개 토글 성공 시 `["talents"]` 캐시 무효화 → 인재탐색 복귀 시 이전 값 노출 없이 정확 상태.

**선행 테스트 / 선행 검증**
- `app/dashboard/profile/__tests__/togglePublic.invalidate.test.tsx`(신규): 토글 onSuccess가 `["profile","list",userId]`와 `["talents"]` 모두 invalidate 호출.

**작업**
- `app/dashboard/profile/page.tsx`의 `togglePublicMutation.onSuccess`에 `queryClient.invalidateQueries({ queryKey: ["talents"] })` 추가.

**완료 기준**
- 신규 테스트 green. 수동: 토글 후 /talents 진입 시 즉시 반영.

**커밋**
- `fix: invalidate talents cache on resume visibility toggle (#3)`

---

## T6 - 데모 리셋 경로 확장 (localStorage + IndexedDB)

**보장할 동작**
- `resetDemoResumeStore`/`resetDemoRoleStore`가 메모리뿐 아니라 localStorage + IndexedDB까지 초기화.

**선행 테스트 / 선행 검증**
- `lib/demo/__tests__/demoReset.test.ts`(신규): 수정 → reset → hydrate 시 시드값 복귀, IndexedDB 비워짐.

**작업**
- 리셋 함수에서 영속 어댑터 clear 호출. 데모 리셋 진입점(쿼리파라미터 vs 헤더 메뉴)은 본 task에서 최소 1개 확정 후 연결.

**완료 기준**
- 신규 테스트 green. 리셋 후 초기 상태 복원 확인.

**커밋**
- `feat: reset demo persistence (localStorage + indexeddb)`

---

## T7 - 업로드 바이너리 IndexedDB 영속 + SW 서빙

> 상태: **후속 PR로 분리(사용자 승인 2026-06-12)**. T1~T6가 보고된 버그(#1~#4)를 모두 해결하므로
> 이 PR에서는 제외한다. 업로드는 현재 서버 라우트 폴스루로 동작(회귀 없음). 별도 이슈에서 SW로 영속화.

**보장할 동작**
- 업로드한 이미지/포트폴리오가 새로고침 후에도 표시. `/api/demo/uploads/*` 요청을 Service Worker가 IndexedDB에서 서빙(컴포넌트 변경 없이 `<img src>` 동작).
- SW 미지원/실패 시 서버 라우트 폴백으로 graceful degrade.

**선행 테스트 / 선행 검증**
- `lib/demo/__tests__/uploadPersistence.test.ts`(신규): 업로드 PUT → IndexedDB 저장 → GET 조회 시 동일 blob. SW 등록 로직 단위 검증(가능 범위).

**작업**
- T4의 폴스루 해제: `/api/demo/uploads/*` PUT/GET도 클라 디스패치 → `storeDemoUpload`/`getDemoUpload`가 IndexedDB 사용.
- `public/demo-sw.js`(무의존) + 등록 유틸: 데모 모드에서만 등록, `/api/demo/uploads/*` fetch 가로채 IndexedDB 서빙.
- presign/complete 흐름이 IndexedDB 경로와 일관되는지 점검.

**완료 기준**
- 신규 테스트 green. 수동: 썸네일 교체 → 새로고침 → 이미지 유지. SW 실패 시 깨지지 않음.

**커밋**
- `feat: persist and serve demo uploads via indexeddb + service worker`

---

## T8 - 통합 검증 + 회귀 + 평가

> 스코프: T1~T6 한정(T7 제외). T7 영속 검증은 후속 PR에서 수행.

**보장할 동작**
- acceptance_criteria 전 항목 통과. evaluation Stage 1/2/3 + drift 확인.

**선행 테스트 / 선행 검증**
- 통합 시나리오(jsdom + localStorage/IndexedDB mock): 이름 수정→재조회 동일(#2/#4), 토글→talents 반영(#3).

**작업**
- 전체 `npm run type-check / lint / test`(wsl bash -lc).
- `.agents/evaluation.md` Stage 1/2/3, `.agents/drift.md` 기록. 미검증 항목 사유 PR 본문에 명시.

**완료 기준**
- 모든 mechanical_gates green. acceptance_criteria 체크 완료.

**커밋**
- `test: integration coverage for demo persistence and first paint`
