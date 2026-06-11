# 데모 업로드 영속화 — Service Worker + IndexedDB (이슈 #37)

데모 모드에서 사용자가 올린 이미지/포트폴리오가 **새로고침 후에도 유지**되도록 한 설계와,
구현 중 내린 결정·주의사항을 기록한다. (PR #38)

## 배경 (근본 원인)

- 배포는 Vercel(서버리스, 다중 인스턴스). 인메모리 데모 스토어는 인스턴스 간 공유되지 않는다.
- PR #36에서 데모 **JSON 상태**를 브라우저 단일 소스(localStorage)로 옮겼지만, **업로드 바이너리**는
  여전히 서버 라우트(인메모리)에 저장돼 새로고침/인스턴스 전환 시 사라졌다.
- 따라서 업로드 바이너리도 브라우저(IndexedDB)로 옮겨 단일 소스를 완성한다.

## 아키텍처

```
업로드 PUT  /api/demo/uploads/{objectKey}   ─┐
이미지 GET  /api/demo/uploads/{objectKey}   ─┤→ [Service Worker] ⇄ IndexedDB(demo-uploads/blobs)
                                              └→ (SW 미등록/IDB 미스 시) 서버 라우트 폴백
```

- **`public/demo-sw.js`** (무의존 plain JS): `/api/demo/uploads/*` 만 `fetch` 가로채기
  - `PUT`/`POST`: 요청 body(Blob)를 IndexedDB에 저장 → `204`
  - `GET`: IndexedDB에서 서빙, 없으면 `fetch(request)`로 서버 라우트 폴백
  - 그 외 경로/메서드는 **respondWith 호출 안 함** → 기본 네트워크 동작(절대 안 건드림)
- **등록**: `lib/demo/registerDemoServiceWorker.ts` → `components/demo/DemoServiceWorkerRegistrar.tsx`
  (`app/providers.tsx`에 마운트). 데모 모드 + `serviceWorker` 지원 시에만 등록, 실패는 폴백으로 흡수.
- **무변경**: `apiClient`의 uploads 폴스루, `uploadThumbnailToS3`의 raw `fetch`, `<img>` 네이티브 요청.
  SW가 네트워크 레벨에서 투명하게 가로채므로 호출 코드를 바꿀 필요가 없다.

### IndexedDB 스키마는 반드시 한 곳과 일치

`public/demo-sw.js`와 `lib/demo/persistence.ts`는 **동일** 스키마를 써야 한다.

| 항목 | 값 |
| --- | --- |
| DB 이름 | `demo-uploads` |
| 버전 | `1` |
| objectStore | `blobs` |
| 키 | `objectKey` (`/api/demo/uploads/` 뒤 경로) |

그래야 `/demo/reset`의 `clearDemoBlobs()`가 **SW가 쓴 blob까지** 같은 스토어에서 비운다.
SW는 무의존이라 상수를 import 할 수 없으므로, `__tests__/uploadSchemaSync.test.ts`가
SW 파일 텍스트와 `persistence.ts` 상수의 일치를 **고정**한다.

## next/image 함정 (이미지가 alt로 깨져 보이던 원인)

`next/image`는 기본적으로 `/_next/image?url=...` 경유로 **서버 사이드에서** src를 fetch해 최적화한다.
그런데 데모 업로드 blob은 **브라우저 IndexedDB에만** 존재한다. 서버 옵티마이저가
`/api/demo/uploads/...`를 서버에서 가져오면 빈 인메모리 라우트로 가 404 → **깨진 이미지(alt 노출)**.
`blob:`/`data:` objectURL(파일 선택 직후 미리보기)도 서버가 가져올 수 없어 동일하게 깨진다.

**해결**: 클라이언트에서만 서빙되는 src는 `unoptimized`로 렌더해 `/_next/image` 프록시를 우회하고
브라우저가 직접 요청하게 한다(→ SW가 IndexedDB에서 서빙).

- 판정 헬퍼: `utils/imageSrc.ts`의 `isClientServedImage(src)`
  (`blob:` / `data:` / `/api/demo/uploads/` → `true`. 정적 에셋·외부 https에는 무영향.)
- 적용: `ProfileImageSection`, `IntroduceCard`, `JobImageCarousel`, `JobCard`(job-board), `ImageUpload`
- `PortfolioCard`는 `<iframe>`/`<object>`로 직접 요청 → SW가 가로채므로 추가 변경 불필요.

## SW 런타임 검증 전략 (e2e 대신 단위 + 수동/배포)

**결정: Playwright e2e를 추가하지 않고, 등록 유틸 테스트 + 스키마 동기화 테스트 + 수동/배포 검증으로 커버한다.**

- 이유:
  - SW 런타임(install/activate/fetch 가로채기)은 **jsdom에서 단위 테스트가 불가능**하다.
  - Playwright로 SW를 검증하려면 실제 dev 서버 + 복잡한 썸네일 업로드 UI 흐름을 구동해야 해 **ROI가 낮다**.
  - 회귀 방지의 핵심(스키마 불일치 시 reset 누락)은 이미 **스키마 동기화 테스트**가 고정한다.
- 자동 검증:
  - `registerDemoServiceWorker.test.ts`: 데모+지원 시 등록 / 미지원·비데모 no-op / 등록 실패 흡수
  - `uploadSchemaSync.test.ts`: SW ↔ `persistence.ts` 스키마 일치 고정
  - `imageSrc.test.ts`: `unoptimized` 판정
- 수동/배포 검증 체크리스트:
  1. 썸네일 업로드 → 새로고침 → 이미지 200 유지(깨지지 않음)
  2. 포트폴리오(PDF) 업로드 → 새로고침 → 미리보기 유지
  3. `/demo/reset` 후 업로드 이미지가 기본 상태로 복원
  4. SW 미지원/실패 시 서버 라우트 폴백으로 graceful degrade(앱 안 깨짐)

## 주의사항

- SW는 한 번 등록되면 끈질기게 남는다. **최소·무캐시**로 작성하고 `/api/demo/uploads/*` 외 요청은 절대 건드리지 않는다.
- 캐시버스터 쿼리(`?v=...`)는 SW가 `pathname`만 보고 objectKey를 뽑으므로 영향 없다.
- 스키마(DB명/버전/스토어명)를 바꿀 때는 `public/demo-sw.js`와 `lib/demo/persistence.ts`를 **함께** 바꿔야 한다(테스트가 막아준다).
