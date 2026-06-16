# T7 핸드오프 (이슈 #37) — 새 세션 이어가기용

> PR #36(T1~T6) 머지 완료. 이 문서는 T7(데모 업로드 IndexedDB 영속 + Service Worker 서빙)을
> 새 세션에서 이어서 진행하기 위한 컨텍스트. 새 세션에 아래 "프롬프트" 섹션을 붙여넣으면 된다.

## 프롬프트 (그대로 복사해서 새 세션에 붙여넣기)

T7(후속 이슈 #37) 작업을 이어서 진행해줘. 이전 세션에서 PR #36(T1~T6)은 머지됐고, 지금은 데모 업로드 파일을 IndexedDB에 영속화하고 Service Worker로 서빙하는 작업이야.

### 현재 상태
- 브랜치: `feat/37-demo-upload-indexeddb-sw` (main에서 이미 분기 생성, 아직 커밋 없음)
- 이슈: #37 (gh는 lion-connect-demo 레포로 라우팅됨, origin은 lion-connect redirect)
- 계획 문서: `.plans/demo-store-persistence-and-talents-paint/` 의 plan.md / seed.yaml / task.md(T7 항목)
- 명령은 `wsl bash -lc "cd /home/minhy/dev/lion-connect-frontend && ..."` 로 실행(UNC 에러 회피). main 직접 커밋 금지, --no-verify 금지.
- AGENTS.md/.agents 워크플로 준수: 첫 커밋 후 draft PR 생성(Closes #37), task 단위 커밋, TDD.

### 배경(근본 원인)
- 배포는 Vercel(서버리스, 다중 인스턴스). 인메모리 데모 스토어가 인스턴스 간 공유 안 됨 → PR #36에서 데모 데이터를 브라우저 단일 소스로 옮김.
- PR #36에서 모든 데모 API를 브라우저 로컬 디스패치(apiClient)로 처리하되, `/api/demo/uploads/*` 는 raw fetch로 폴스루시켜 둠.
- 업로드 PUT은 `lib/api/profileThumbnail.ts`의 `uploadThumbnailToS3`가 **apiClient가 아닌 raw fetch**로 `/api/demo/uploads/{objectKey}` 에 보냄. 이미지 렌더는 `<img src="/api/demo/uploads/{objectKey}">` 네이티브 요청.
- 따라서 **Service Worker가 `/api/demo/uploads/*` 의 PUT/GET을 모두 투명하게 가로채면 apiClient·업로드 코드 변경이 전혀 불필요**함(이게 핵심 설계).

### T7 설계 (이미 합의됨)
1. `public/demo-sw.js` (무의존, 직접 작성): `/api/demo/uploads/*` 가로채기
   - PUT/POST: request body를 blob으로 IndexedDB에 저장(키=`/api/demo/uploads/` 뒤 objectKey), 204 응답
   - GET: IndexedDB에서 서빙, 없으면 `fetch(event.request)`로 서버 라우트 폴백
   - install에서 skipWaiting, activate에서 clients.claim
   - **IndexedDB 스키마는 `lib/demo/persistence.ts`와 반드시 일치**: DB명 `demo-uploads`, version 1, objectStore `blobs`, 키=objectKey (그래야 `/demo/reset`의 `clearDemoBlobs()`가 같은 스토어를 비움)
2. SW 등록 유틸 + 클라이언트 컴포넌트: `app/providers.tsx`(현재 Providers 안)에 마운트해서 데모 모드 + `"serviceWorker" in navigator`일 때 `/demo-sw.js`를 scope `/`로 register. 미지원/비데모면 no-op.
3. 서버 라우트(`app/api/demo/[...path]/route.ts`의 uploads 핸들러)는 폴백으로 유지(변경 없음).
4. apiClient의 uploads 폴스루(PR #36에서 추가한 `shouldDispatchDemoLocally`의 `/api/demo/uploads` 제외)는 그대로 둠 → SW가 네트워크 레벨에서 가로챔.

### 테스트 전략
- SW 등록 유틸: 지원 시 register 호출 / 미지원·비데모 시 no-op (vitest, navigator.serviceWorker mock)
- `lib/demo/persistence.ts`가 DB명 `demo-uploads`/store `blobs`를 쓰는지(스키마 동기화) 단언하는 테스트 추가해 SW와의 일관성 고정
- SW 런타임 자체는 jsdom에서 단위 테스트 어려움 → 등록 유틸 테스트 + 수동/e2e 검증. 가능하면 Playwright e2e로 "썸네일 업로드 → 새로고침 → 이미지 200 유지" 추가 시도(업로드 UI 흐름 복잡하면 수동 검증 노트로 대체)
- 게이트: `npm run type-check`, `npm run lint`(max-warnings=0), `npm test`, 가능하면 `npx playwright test e2e/portfolio-demo.spec.ts --project=chromium`

### 참고(이전 세션에서 만든 것 / 이미 main에 있음)
- `lib/demo/persistence.ts`: `putDemoBlob/getDemoBlob/clearDemoBlobs`(IndexedDB, jsdom에선 in-memory 폴백), `isBrowser`, `loadDemoJson/saveDemoJson/removeDemoJson`
- `lib/demo/reset.ts`: `resetAllDemoData()` (스토어 시드 재빌드 + localStorage 제거 + clearDemoBlobs), `/demo/reset` 페이지
- 데모 모드 판정: `lib/demoMode.ts`의 `isDemoAuthState`, `isDemoOnlyMode` (DEMO_ONLY_MODE 기본 true)
- 주의: SW는 한번 등록되면 끈질기게 남으니 최소·무캐시로 작성하고 `/api/demo/uploads/*` 외 요청은 절대 건드리지 말 것.

먼저 task 흐름대로 진행하고, SW 런타임 검증 방법(e2e vs 수동)은 구현 중 판단해서 알려줘.
