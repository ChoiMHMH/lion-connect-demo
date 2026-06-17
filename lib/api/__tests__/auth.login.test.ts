import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: { accessToken: null as string | null, user: null as unknown },
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: { getState: () => mockAuth },
}));

import { loginAPI } from "@/lib/api/auth";
import { ApiError } from "@/lib/apiClient";

const fetchMock = vi.fn();
const jsonHeaders = (extra: Record<string, string> = {}) => ({
  "content-type": "application/json",
  ...extra,
});

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

const credentials = { email: "a@b.c", password: "pw" };

describe("loginAPI", () => {
  it("extracts the access token from the Authorization header on success", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ user: { id: 1, email: "a@b.c" } }), {
        status: 200,
        headers: jsonHeaders({ Authorization: "Bearer issued-token" }),
      })
    );

    const res = await loginAPI(credentials);

    expect(res.accessToken).toBe("issued-token");
    expect(res.user).toEqual({ id: 1, email: "a@b.c" });
    expect(fetchMock.mock.calls[0][0] as string).toContain("/auth/login");
  });

  it("throws ApiError (not a plain Error) when the response is not ok", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "비밀번호가 틀렸습니다" }), {
        status: 401,
        headers: jsonHeaders(),
      })
    );

    await expect(loginAPI(credentials)).rejects.toBeInstanceOf(ApiError);
  });

  it("throws ApiError when no access token is returned", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ user: { id: 1 } }), {
        status: 200,
        headers: jsonHeaders(),
      })
    );

    await expect(loginAPI(credentials)).rejects.toBeInstanceOf(ApiError);
  });

  it("throws ApiError when user info is missing", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: jsonHeaders({ Authorization: "Bearer issued-token" }),
      })
    );

    await expect(loginAPI(credentials)).rejects.toBeInstanceOf(ApiError);
  });
});
