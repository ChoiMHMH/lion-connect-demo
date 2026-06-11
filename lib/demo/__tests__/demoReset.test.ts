import { beforeEach, describe, expect, it, vi } from "vitest";

const updatedProfile = {
  name: "홍길동222",
  title: "프론트엔드 포트폴리오 이력서",
  introduction: "수정된 소개",
  storageUrl: "/demo/profile-demo.png",
  visibility: "PUBLIC" as const,
  status: "COMPLETED" as const,
};

beforeEach(() => {
  localStorage.clear();
});

describe("resetAllDemoData", () => {
  it("리셋 후 모듈 재로드 시 이력서가 시드(홍길동)로 복원된다", async () => {
    vi.resetModules();
    const resume1 = await import("@/lib/demo/resumeStore");
    resume1.updateDemoProfile(1, updatedProfile);
    resume1.persistResumeStore();
    expect(resume1.getDemoProfile(1).name).toBe("홍길동222");

    const reset = await import("@/lib/demo/reset");
    await reset.resetAllDemoData();

    vi.resetModules();
    const resume2 = await import("@/lib/demo/resumeStore");
    expect(resume2.getDemoProfile(1).name).toBe("홍길동");
  });

  it("리셋은 IndexedDB 업로드 blob도 비운다", async () => {
    vi.resetModules();
    const persistence = await import("@/lib/demo/persistence");
    await persistence.putDemoBlob("demo/profile-1/x.png", new Blob(["x"]));
    expect(await persistence.getDemoBlob("demo/profile-1/x.png")).not.toBeNull();

    const reset = await import("@/lib/demo/reset");
    await reset.resetAllDemoData();

    expect(await persistence.getDemoBlob("demo/profile-1/x.png")).toBeNull();
  });
});
