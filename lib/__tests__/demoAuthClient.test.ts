import { beforeEach, describe, expect, it, vi } from "vitest";
import { activateDemoAuth, clearDemoAuthState } from "@/lib/demoAuthClient";
import { DEMO_AUTH_PROFILES } from "@/constants/demoAuth";
import { useAuthStore } from "@/store/authStore";

const mockSetDemoAuthCookies = vi.hoisted(() => vi.fn());
const mockClearDemoAuthCookies = vi.hoisted(() => vi.fn());

vi.mock("@/actions/demoAuth", () => ({
  setDemoAuthCookies: mockSetDemoAuthCookies,
  clearDemoAuthCookies: mockClearDemoAuthCookies,
}));

describe("demoAuthClient", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isInitialized: false,
    });
    mockSetDemoAuthCookies.mockReset();
    mockClearDemoAuthCookies.mockReset();
  });

  it("demo role 선택 시 쿠키 설정 후 authStore에 demo token과 user를 주입한다", async () => {
    const profile = await activateDemoAuth("demo_company");

    expect(mockSetDemoAuthCookies).toHaveBeenCalledWith("demo_company");
    expect(profile).toBe(DEMO_AUTH_PROFILES.demo_company);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: DEMO_AUTH_PROFILES.demo_company.accessToken,
      user: DEMO_AUTH_PROFILES.demo_company.user,
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it("데모 초기화 시 demo auth 쿠키와 클라이언트 인증 상태를 함께 정리한다", async () => {
    useAuthStore
      .getState()
      .setAuth(DEMO_AUTH_PROFILES.demo_talent.accessToken, DEMO_AUTH_PROFILES.demo_talent.user);

    await clearDemoAuthState();

    expect(mockClearDemoAuthCookies).toHaveBeenCalledOnce();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  });
});
