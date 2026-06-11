# 데모 스토어 영속화 + 인재탐색 첫 페인트 정리

> Level 3 / 점수 10/12. 본 문서는 1단계(상위 계획)이며 사용자 "진행" 승인 전까지 파일 수정 금지.
> 승인 후 `seed.yaml` + `task.md` 작성 → 재승인 → 구현.

## 무엇을 / 왜

데모 모드에서 이력서 수정 결과가 새로고침/페이지 이동마다 기본값(홍길동)과 수정값 사이를 오가고(#2, #4),
공개 토글이 인재탐색에 늦게 반영되며(#3), `/talents` 첫 페인트에서 Footer가 떴다가 스켈레톤이 끼어들며
레이아웃이 점프한다(#1). 사용자가 신뢰할 수 있는 데모가 되도록 4가지를 함께 고친다.

## 현재 상태 진단

### 공통 근본 원인 (#2, #4, #3 일부) — 서버 인메모리 스토어가 인스턴스 간 공유되지 않음
- `lib/demo/resumeStore.ts`, `lib/demo/roleStore.ts`는 모듈 레벨 변수에 상태를 둔다.
  - `let store = buildStore();` (resumeStore.ts:81)
  - `let store = clone(demoRoleSeed);` (roleStore.ts:107)
- 클라이언트는 `lib/apiClient.ts`에서 `fetch('/api/demo/...')` → `app/api/demo/[...path]/route.ts`
  → `handleDemoApiRequest`(mockApi.ts)로 이 모듈 스토어를 변형한다.
- `next.config.ts`에 `output: 'standalone'`/`runtime` 지정이 없고 단일 상주 서버 흔적도 없음 → 기본 서버리스(다중 인스턴스) 배포로 추정.
- 결과: PUT(수정)은 인스턴스 A의 store를, 이후 GET(조회)은 인스턴스 B의 store(아직 시드=홍길동)를 읽는다.
  새로고침마다 라우팅되는 인스턴스가 달라져 **값이 왔다갔다(#2)**, 목록으로 오면 시드로 되돌아간다(#4).
  사용자의 "초기화를 계속 하는 것 같다"는 직관이 사실상 정확함(인스턴스마다 `buildStore()`로 재시드).
- #3도 같은 뿌리: `listDemoTalents`/상세는 `getDemoResumeSnapshot(visibility !== "PUBLIC" → 제외)`(roleStore.ts:554,591)을
  읽는데, 토글이 기록된 인스턴스와 인재탐색을 읽는 인스턴스가 다르면 반영이 지연된다.

### #3 추가 원인 — React Query 캐시 stale-while-revalidate
- `useTalents`는 `staleTime: 0`이라 마운트 시 재요청하지만, 직전 캐시값을 먼저 그려 "이전 값 보였다가 반영"이 된다.
- 공개 토글 mutation(`app/dashboard/profile/page.tsx:48`)은 `["profile","list",userId]`만 무효화하고
  `["talents", ...]` 캐시는 건드리지 않는다.

### #1 — `/talents` Suspense fallback 부재로 인한 Footer 플래시 + 점프
- `app/(company)/talents/page.tsx`의 `<Suspense>`에 **fallback이 없다**(page.tsx:242). `TalentsPageContent`는 `useSearchParams`로 서스펜드된다.
- `app/(company)/layout.tsx`는 `<div className="pt-20">{children}</div><Footer />` 구조라
  서스펜드 동안 children이 비어 Footer가 위로 올라왔다가, 스켈레톤 마운트 시 아래로 밀린다.
- 콘텐츠 영역에 높이 예약(min-height)도 없다.

## 해결책 (3–5)

1. **데모 데이터 계층을 브라우저 단일 소스로 영속화** — `isDemoRequest`이고 브라우저 환경이면 `apiClient`에서
   `fetch('/api/demo')` 대신 `handleDemoApiRequest`를 클라이언트에서 직접 디스패치하고, 변경마다 영속화.
   첫 접근 시 저장소가 비었을 때만 시드로 1회 초기화 → "초기화는 한 번만"(#4 요구) 충족, 인스턴스 의존 제거(#2/#4 해소).
   서버 `/api/demo` 라우트는 SSR/비브라우저 폴백으로 유지(첫 페인트는 시드로 충분).
2. **저장소를 데이터 종류별로 분리** — 용량/특성에 맞게 둘로 나눈다.
   - **구조화 JSON 상태 → localStorage**: 이력서/역할 텍스트 상태(이름·공개여부·경력 등). 수 KB라 5MB 한계 안전.
     실제 버그(#2/#4)의 원인이 전부 여기. `resumeStore`/`roleStore`에 `hydrate()`/`persist()` 경계를 만들어 JSON 동기화.
   - **업로드 바이너리 → IndexedDB**: 현재 `resumeStore`의 `uploadedFiles: Map<string, {body: ArrayBuffer}>`(presign 업로드 파일).
     Blob 그대로 IndexedDB에 저장(대용량/새로고침 후 유지). localStorage에는 절대 넣지 않음.
   - **시드 이미지/PDF는 저장 대상 아님**: `resumeSeed.ts`는 정적 URL(`/demo/...`)을 참조할 뿐 바이너리를 store에 담지 않음.
   - 두 스토어 간 단방향 의존(roleStore→resumeStore snapshot)은 유지.
3. **#3 캐시 무효화** — 공개 토글 `onSuccess`에서 `["talents"]`도 invalidate. 클라 스토어가 즉시 일관되므로
   인재탐색 복귀 시 stale 오값 대신 바로 정확값으로 수렴.
4. **#1 첫 페인트** — `<Suspense fallback={<스켈레톤 동일 레이아웃>}>` 지정 + 콘텐츠 래퍼에 min-height 예약으로
   Footer 점프/플래시 제거.
5. **회귀 방지 테스트** — 영속 라운드트립(수정→재읽기 동일값), 시드 1회 초기화, 토글 후 인재탐색 즉시 반영,
   talents Suspense fallback 렌더를 단위/통합 테스트로 고정.

## 트레이드오프

- **클라 영속화 vs 데모 단순성**: 데모 로직이 브라우저로 이동하며 SSR과 클라 데이터가 갈릴 수 있음(첫 페인트는 시드, 이후 localStorage).
  → 데모는 단일 사용자라 허용 가능. 첫 페인트 시드는 의도된 동작으로 문서화.
- **localStorage 영속 vs 리셋 편의**: 영속되면 데모를 "초기 상태로 보고 싶을 때" 리셋 수단이 필요.
  → `resetDemoResumeStore`/`resetDemoRoleStore`를 localStorage + IndexedDB 클리어까지 확장하고, 필요 시 데모 헤더/쿼리파라미터 리셋 진입점 고려(task에서 결정).
- **localStorage(JSON) + IndexedDB(바이너리) 분리 vs 단일 저장소**: 저장소가 둘로 나뉘어 hydrate/persist 경로가 두 갈래가 됨.
  → 용량·특성상 불가피(localStorage는 Blob 부적합, 5MB 한계). 경계를 얇은 어댑터로 감싸 복잡도 국소화.
- **#3 invalidate vs 스켈레톤 재노출**: `["talents"]` 무효화 시 짧은 스켈레톤이 보일 수 있음(오값보다는 나음).
  → 클라 스토어 즉시성 덕에 재요청이 매우 빨라 체감 최소.

## 대안 (각 기각 이유 포함)

- **대안 A: 서버 영속(Vercel KV/Redis)** — 인스턴스 공유 문제 자체를 서버에서 해결.
  - 기각: 포트폴리오 데모에 외부 의존성/비용/네트워크 지연 추가. 단일 사용자엔 과함.
- **대안 B: 쿠키에 데모 상태 저장** — 서버 라우트 유지하며 인스턴스 무관 영속.
  - 기각: 이력서 전체 데이터는 쿠키 4KB 한계 초과. 매 요청 직렬화 비용.
- **대안 C: #2/#4를 두고 #1/#3만 수정(RQ 캐시·UI만)** — 범위 축소.
  - 기각: 근본(인스턴스 비공유)을 남기면 수정값 소실이 계속됨. 사용자가 "진짜 큰 오류"로 지목한 #2 미해결.
- **대안 D: 단일 상주 서버(`output: standalone` + 노드 호스팅)** — 모듈 스토어가 자연히 영속.
  - 기각: 배포 인프라 변경이 더 큰 리스크. 새로고침 시 프로세스 재시작/스케일아웃에 여전히 취약.

## 완료 기준 (DoD)

- [ ] 이력서 인적사항(이름) 수정 후 새로고침 N회 반복해도 항상 수정값 표시(#2). 시드값으로 되돌아가지 않음.
- [ ] 수정→작성 완료→목록 이동 시 수정값 유지(#4). 시드 초기화는 최초 1회만 발생.
- [ ] 공개 토글 후 기업 인재탐색 진입 시 이전 값 노출 없이 즉시 정확 상태 반영(#3).
- [ ] `/talents` 새로고침 시 Footer가 먼저 떴다가 밀리는 점프/플래시 없음(#1). 첫 페인트부터 스켈레톤 자리 고정.
- [ ] 데모 리셋 경로로 초기 상태 복원 가능.
- [ ] 신규/수정 테스트 통과, 기존 `lib/demo/__tests__/*` 회귀 없음, lint/tsc 통과(`wsl bash -lc`).
- [ ] 검증은 `.agents/evaluation.md` Stage 1/2/3 + `.agents/drift.md` 확인.

## 검증 전략 (개요)

- 단위: 영속 라운드트립/시드 1회/리셋 (stores), 토글 invalidate (mutation).
- 통합: profile 수정→재조회 동일값, 토글→talents 반영 (jsdom/localStorage mock).
- 수동: dev에서 #1 시각 확인(Footer 비점프), #2/#4 새로고침 반복.

## 미해결/확인 필요 (승인 시 함께 결정)

- 배포 타깃이 실제 서버리스인지 최종 확인(README/배포 설정 추가 확認). 단, 클라 영속화는 배포 형태와 무관하게 안전.
- 데모 리셋 UX 진입점 위치(헤더 메뉴 vs 쿼리파라미터) — task 단계에서 확정.
