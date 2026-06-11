import { describe, expect, it, vi } from "vitest";
import { DEMO_AUTH_COOKIE } from "@/constants/demoAuth";
import { getInitialDemoRole } from "@/lib/demoAuthServer";

const mocks = vi.hoisted(() => ({
  cookieValue: null as string | null,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === DEMO_AUTH_COOKIE && mocks.cookieValue ? { value: mocks.cookieValue } : undefined,
  })),
}));

describe("getInitialDemoRole", () => {
  it("데모 전용 모드에서 옵션이 있으면 기존 demo role 쿠키보다 레이아웃 fallback role을 우선한다", async () => {
    mocks.cookieValue = "demo_talent";

    await expect(
      getInitialDemoRole("demo_company", { preferFallbackInDemoOnly: true })
    ).resolves.toBe("demo_company");
  });

  it("옵션이 없으면 기존 demo role 쿠키를 우선한다", async () => {
    mocks.cookieValue = "demo_talent";

    await expect(getInitialDemoRole("demo_company")).resolves.toBe("demo_talent");
  });
});
