import { isDemoOnlyMode } from "@/lib/demoMode";

const DEMO_SW_URL = "/demo-sw.js";

/**
 * 데모 업로드(`/api/demo/uploads/*`)를 IndexedDB로 영속·서빙하는 Service Worker를 등록한다.
 *
 * - 데모 모드가 아니거나 `serviceWorker` 미지원 환경이면 아무것도 하지 않고 `null`을 반환한다.
 * - 등록이 실패해도 서버 라우트 폴백으로 graceful degrade되므로 조용히 `null`로 흡수한다.
 * - SW는 `/api/demo/uploads/*` 외 요청은 절대 건드리지 않으므로 scope `/` 로 등록해도 안전하다.
 */
export function registerDemoServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isDemoOnlyMode()) return Promise.resolve(null);
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker.register(DEMO_SW_URL, { scope: "/" }).catch(() => null);
}
