import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const isDemoOnlyMode = vi.fn();
vi.mock("@/lib/demoMode", () => ({
  isDemoOnlyMode: () => isDemoOnlyMode(),
}));

import { registerDemoServiceWorker } from "@/lib/demo/registerDemoServiceWorker";

function setServiceWorker(value: unknown) {
  Object.defineProperty(navigator, "serviceWorker", {
    value,
    configurable: true,
  });
}

function clearServiceWorker() {
  if ("serviceWorker" in navigator) {
    delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
  }
}

describe("registerDemoServiceWorker", () => {
  beforeEach(() => {
    isDemoOnlyMode.mockReturnValue(true);
    clearServiceWorker();
  });

  afterEach(() => {
    clearServiceWorker();
    vi.restoreAllMocks();
  });

  it("데모 모드 + serviceWorker 지원 시 /demo-sw.js 를 scope / 로 등록한다", async () => {
    const register = vi.fn().mockResolvedValue({ scope: "/" });
    setServiceWorker({ register });

    const result = await registerDemoServiceWorker();

    expect(register).toHaveBeenCalledWith("/demo-sw.js", { scope: "/" });
    expect(result).toEqual({ scope: "/" });
  });

  it("serviceWorker 미지원이면 no-op 으로 null 을 반환한다", async () => {
    const result = await registerDemoServiceWorker();
    expect(result).toBeNull();
  });

  it("비데모 모드면 등록을 시도하지 않는다", async () => {
    isDemoOnlyMode.mockReturnValue(false);
    const register = vi.fn();
    setServiceWorker({ register });

    const result = await registerDemoServiceWorker();

    expect(register).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("등록 실패는 null 로 흡수한다(서버 라우트 폴백)", async () => {
    const register = vi.fn().mockRejectedValue(new Error("register failed"));
    setServiceWorker({ register });

    const result = await registerDemoServiceWorker();

    expect(register).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
