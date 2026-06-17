import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: { accessToken: null as string | null, user: null as unknown },
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: { getState: () => mockAuth },
}));

import { apiRawRequest, ApiError } from "@/lib/apiClient";

const fetchMock = vi.fn();

beforeEach(() => {
  mockAuth.accessToken = null;
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("apiRawRequest", () => {
  it("returns the raw Response so response headers are accessible", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ user: {} }), {
        status: 200,
        headers: { Authorization: "Bearer issued-token" },
      })
    );

    const res = await apiRawRequest("/auth/login", { method: "POST", skipAuth: true });

    expect(res.headers.get("Authorization")).toBe("Bearer issued-token");
    expect(fetchMock.mock.calls[0][0] as string).toContain("/auth/login");
  });

  it("injects Authorization header when token exists and skipAuth is not set", async () => {
    mockAuth.accessToken = "tok";
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

    await apiRawRequest("/whatever", { method: "GET" });

    const init = fetchMock.mock.calls[0][1] as { headers: Record<string, string> };
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("omits Authorization when skipAuth is true", async () => {
    mockAuth.accessToken = "tok";
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

    await apiRawRequest("/auth/login", { method: "POST", skipAuth: true });

    const init = fetchMock.mock.calls[0][1] as { headers: Record<string, string> };
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("maps AbortError to ApiError with TIMEOUT code", async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error("aborted"), { name: "AbortError" }));

    await expect(apiRawRequest("/x")).rejects.toBeInstanceOf(ApiError);
    await expect(apiRawRequest("/x")).rejects.toMatchObject({ code: "TIMEOUT" });
  });

  it("maps network TypeError to ApiError with NETWORK_ERROR code", async () => {
    fetchMock.mockRejectedValue(new TypeError("network down"));

    await expect(apiRawRequest("/x")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });
});
