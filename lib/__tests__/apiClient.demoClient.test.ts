import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 데모 모드 강제 활성화
vi.mock("@/lib/demoMode", () => ({
  isDemoAuthState: () => true,
}));

import { get, put } from "@/lib/apiClient";
import { resetDemoResumeStore } from "@/lib/demo/resumeStore";

const profileBody = {
  name: "홍길동222",
  title: "프론트엔드 포트폴리오 이력서",
  introduction: "수정된 소개",
  storageUrl: "/demo/profile-demo.png",
  visibility: "PUBLIC" as const,
  status: "COMPLETED" as const,
};

describe("apiClient 데모 클라이언트 디스패치", () => {
  beforeEach(() => {
    localStorage.clear();
    resetDemoResumeStore();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("데모 요청은 네트워크(fetch) 없이 로컬 디스패치되어 단일 소스로 일관된다", async () => {
    const fetchSpy = vi.fn(() => {
      throw new Error("네트워크가 호출되면 안 된다");
    });
    vi.stubGlobal("fetch", fetchSpy);

    await put("/profile/me?profileId=1", profileBody);
    const profile = await get<{ name: string }>("/profile/me?profileId=1");

    expect(profile.name).toBe("홍길동222");
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("/uploads 경로는 서버 라우트로 폴스루(fetch)된다", async () => {
    const fetchSpy = vi.fn(
      async (..._args: Parameters<typeof fetch>) => new Response(null, { status: 204 })
    );
    vi.stubGlobal("fetch", fetchSpy);

    await put("/uploads/demo/profile-1/x.png", { ignored: true });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchSpy.mock.calls[0][0]);
    expect(calledUrl).toContain("/api/demo/uploads/");

    vi.unstubAllGlobals();
  });
});
