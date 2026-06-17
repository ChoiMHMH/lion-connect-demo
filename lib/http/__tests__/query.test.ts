import { describe, it, expect } from "vitest";
import { withQuery } from "@/lib/http/query";

describe("withQuery", () => {
  it("appends provided params as a query string", () => {
    expect(withQuery("/job-postings", { page: 0, size: 20 })).toBe("/job-postings?page=0&size=20");
  });

  it("omits undefined and null values", () => {
    expect(
      withQuery("/job-postings", {
        jobGroupCode: undefined,
        jobRoleCode: null,
        page: 1,
      })
    ).toBe("/job-postings?page=1");
  });

  it("keeps empty string values (e.g. admin status='')", () => {
    expect(withQuery("/admin/job-postings", { status: "", page: 0 })).toBe(
      "/admin/job-postings?status=&page=0"
    );
  });

  it("repeats array values under the same key and skips empty arrays", () => {
    expect(withQuery("/job-postings", { sort: ["createdAt,desc", "id,asc"] })).toBe(
      "/job-postings?sort=createdAt%2Cdesc&sort=id%2Casc"
    );
    expect(withQuery("/job-postings", { sort: [] })).toBe("/job-postings");
  });

  it("serializes numbers including zero", () => {
    expect(withQuery("/profiles/search", { page: 0, size: 0 })).toBe(
      "/profiles/search?page=0&size=0"
    );
  });

  it("returns the endpoint unchanged when no params produce output (no trailing ?)", () => {
    expect(withQuery("/job-postings", {})).toBe("/job-postings");
    expect(withQuery("/job-postings", { jobGroupCode: undefined })).toBe("/job-postings");
  });

  it("preserves insertion order of keys", () => {
    expect(withQuery("/x", { b: "2", a: "1", c: "3" })).toBe("/x?b=2&a=1&c=3");
  });

  it("encodes special characters", () => {
    expect(withQuery("/x", { q: "a b&c" })).toBe("/x?q=a+b%26c");
  });
});
