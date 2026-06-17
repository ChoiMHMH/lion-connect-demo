import { describe, it, expect, vi } from "vitest";
import { parseResponse } from "@/lib/apiClient";

const jsonResponse = (body: string, status = 200) =>
  new Response(body, { status, headers: { "content-type": "application/json" } });

describe("parseResponse", () => {
  it("returns empty object for 204 No Content", async () => {
    const res = new Response(null, { status: 204 });
    await expect(parseResponse(res)).resolves.toEqual({});
  });

  it("returns empty object when content-length is 0", async () => {
    const res = new Response("", {
      status: 200,
      headers: { "content-length": "0", "content-type": "application/json" },
    });
    await expect(parseResponse(res)).resolves.toEqual({});
  });

  it("returns empty object for non-JSON empty body", async () => {
    const res = new Response("", { status: 200, headers: { "content-type": "text/plain" } });
    await expect(parseResponse(res)).resolves.toEqual({});
  });

  it("parses JSON text even when content-type is not application/json", async () => {
    const res = new Response(JSON.stringify({ a: 1 }), {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
    await expect(parseResponse(res)).resolves.toEqual({ a: 1 });
  });

  it("parses a normal application/json body", async () => {
    await expect(parseResponse(jsonResponse(JSON.stringify({ ok: true })))).resolves.toEqual({
      ok: true,
    });
  });

  it("returns empty object when JSON body is broken", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(parseResponse(jsonResponse("{not-json"))).resolves.toEqual({});
    warn.mockRestore();
  });
});
