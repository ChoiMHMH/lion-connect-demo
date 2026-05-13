import { describe, expect, it } from "vitest";
import { DEMO_API_BASE_PATH, resolveApiRequestUrl } from "@/constants/api";

describe("resolveApiRequestUrl", () => {
  it("운영 모드에서는 API base URL과 endpoint를 결합한다", () => {
    expect(
      resolveApiRequestUrl("/profile/me", {
        baseUrl: "https://api.example.test/api",
      })
    ).toEqual({
      url: "https://api.example.test/api/profile/me",
      path: "/profile/me",
      isDemoRequest: false,
    });
  });

  it("demo mode에서는 /api/demo 아래로 상대 endpoint를 보낸다", () => {
    expect(resolveApiRequestUrl("/profile/me", { demoMode: true })).toEqual({
      url: `${DEMO_API_BASE_PATH}/profile/me`,
      path: `${DEMO_API_BASE_PATH}/profile/me`,
      isDemoRequest: true,
    });
  });

  it("절대 URL은 demo mode에서도 그대로 둔다", () => {
    expect(resolveApiRequestUrl("https://files.example.test/a.png", { demoMode: true })).toEqual({
      url: "https://files.example.test/a.png",
      path: "https://files.example.test/a.png",
      isDemoRequest: false,
    });
  });
});
