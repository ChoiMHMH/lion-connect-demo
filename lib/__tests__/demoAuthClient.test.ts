import { beforeEach, describe, expect, it, vi } from "vitest";
import { activateDemoAuth, clearDemoAuthState, ensureDefaultDemoAuth } from "@/lib/demoAuthClient";
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

  it("데모 전용 기본 인증은 기존 role이 없으면 기업 role을 주입한다", async () => {
    const profile = await ensureDefaultDemoAuth();

    expect(mockSetDemoAuthCookies).toHaveBeenCalledWith("demo_company");
    expect(profile).toBe(DEMO_AUTH_PROFILES.demo_company);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: DEMO_AUTH_PROFILES.demo_company.accessToken,
      user: DEMO_AUTH_PROFILES.demo_company.user,
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it("데모 전용 기본 인증은 이미 선택된 demo role을 덮어쓰지 않는다", async () => {
    useAuthStore
      .getState()
      .setAuth(DEMO_AUTH_PROFILES.demo_admin.accessToken, DEMO_AUTH_PROFILES.demo_admin.user);

    const profile = await ensureDefaultDemoAuth();

    expect(mockSetDemoAuthCookies).toHaveBeenCalledWith("demo_admin");
    expect(profile).toBe(DEMO_AUTH_PROFILES.demo_admin);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: DEMO_AUTH_PROFILES.demo_admin.accessToken,
      user: DEMO_AUTH_PROFILES.demo_admin.user,
      isAuthenticated: true,
    });
  });

  it("데모 초기화 시 demo-only 기본 기업 role로 즉시 복구한다", async () => {
    useAuthStore
      .getState()
      .setAuth(DEMO_AUTH_PROFILES.demo_talent.accessToken, DEMO_AUTH_PROFILES.demo_talent.user);

    await clearDemoAuthState();

    expect(mockClearDemoAuthCookies).toHaveBeenCalledOnce();
    expect(mockSetDemoAuthCookies).toHaveBeenCalledWith("demo_company");
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: DEMO_AUTH_PROFILES.demo_company.accessToken,
      user: DEMO_AUTH_PROFILES.demo_company.user,
      isAuthenticated: true,
      isInitialized: true,
    });
  });
});
