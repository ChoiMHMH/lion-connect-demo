import { beforeEach, describe, expect, it } from "vitest";
import { getDemoTalent, listDemoTalents, resetDemoRoleStore } from "@/lib/demo/roleStore";
import { getDemoProfile, resetDemoResumeStore, updateDemoProfile } from "@/lib/demo/resumeStore";
import type { ProfileRequest } from "@/types/talent";

function setVisibility(visibility: "PUBLIC" | "PRIVATE", overrides: Partial<ProfileRequest> = {}) {
  const profile = getDemoProfile(1);
  updateDemoProfile(1, {
    name: profile.name,
    title: profile.title,
    introduction: profile.introduction,
    storageUrl: profile.storageUrl,
    likelionCode: profile.likelionCode ?? undefined,
    status: profile.status,
    visibility,
    ...overrides,
  });
}

function publishResume() {
  setVisibility("PUBLIC");
}

function hideResume() {
  setVisibility("PRIVATE");
}

describe("인재 탐색 ↔ 이력서 동기화", () => {
  beforeEach(() => {
    resetDemoRoleStore();
    resetDemoResumeStore();
  });

  it("이력서가 비공개면 목록에서 제외되고 가짜 인재는 유지된다", () => {
    hideResume();
    const res = listDemoTalents(new URLSearchParams());

    expect(res.content.find((t) => t.id === 1)).toBeUndefined();
    expect(res.content.find((t) => t.id === 2)).toBeDefined();
    expect(res.content.find((t) => t.id === 3)).toBeDefined();
  });

  it("이력서가 공개면 합성된 값으로 목록에 포함된다", () => {
    publishResume();
    const res = listDemoTalents(new URLSearchParams());
    const me = res.content.find((t) => t.id === 1);

    expect(me).toBeDefined();
    expect(me?.name).toBe("데모 인재");
    expect(me?.jobRoles).toEqual(["프론트엔드"]);
    expect(me?.skills).toEqual(["React", "Next.js", "TypeScript"]);
  });

  it("비공개 이력서 상세는 not found로 막힌다", () => {
    hideResume();
    expect(() => getDemoTalent(1)).toThrow(/not found/);
  });

  it("공개 이력서 상세는 합성 결과를 반환한다", () => {
    publishResume();
    const detail = getDemoTalent(1);

    expect(detail.name).toBe("데모 인재");
    expect(detail.jobRoles).toEqual(["프론트엔드"]);
    expect(detail.educations).toHaveLength(1);
  });

  it("이력서 이름 수정이 목록 합성 결과에 반영된다", () => {
    setVisibility("PUBLIC", { name: "수정된 인재" });

    const res = listDemoTalents(new URLSearchParams());
    expect(res.content.find((t) => t.id === 1)?.name).toBe("수정된 인재");
  });
});
