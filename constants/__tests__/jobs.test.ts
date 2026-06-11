import { describe, expect, it } from "vitest";
import { JOB_OPTIONS, JOB_ROLE_ID_BY_NAME, findJobGroupByJobName } from "@/constants/jobs";

describe("jobs 직군/직무 매핑", () => {
  it("개발 직군 직무명이 jobMapping 기준(엔)으로 표기된다", () => {
    expect(JOB_OPTIONS["개발"]).toContain("프론트엔드");
    expect(JOB_OPTIONS["개발"]).toContain("백엔드");
    // 오타(앤) 표기가 남아있지 않아야 한다
    expect(JOB_OPTIONS["개발"]).not.toContain("프론트앤드");
    expect(JOB_OPTIONS["개발"]).not.toContain("백앤드");
  });

  it("직무명으로 직군을 찾을 수 있다", () => {
    expect(findJobGroupByJobName("프론트엔드")).toBe("개발");
    expect(findJobGroupByJobName("백엔드")).toBe("개발");
    expect(findJobGroupByJobName("UX/UI")).toBe("디자인");
  });

  it("직무명→역할 ID 매핑이 jobMapping과 동일하다", () => {
    expect(JOB_ROLE_ID_BY_NAME["프론트엔드"]).toBe(1);
    expect(JOB_ROLE_ID_BY_NAME["백엔드"]).toBe(2);
  });
});
