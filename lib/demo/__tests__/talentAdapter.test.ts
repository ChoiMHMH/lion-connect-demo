import { beforeEach, describe, expect, it } from "vitest";
import { applyResumeToTalentDetail, applyResumeToTalentListItem } from "@/lib/demo/talentAdapter";
import {
  getDemoResumeSnapshot,
  resetDemoResumeStore,
  updateDemoProfile,
} from "@/lib/demo/resumeStore";
import type { TalentListItem } from "@/lib/api/talents";
import type { TalentDetailResponse } from "@/types/talent";

const baseListItem: TalentListItem = {
  id: 1,
  name: "기존 인재",
  introduction: "기존 소개",
  email: "talent.demo@lionconnect.test",
  phoneNumber: "010-0000-0001",
  experiences: ["부트캠프 경험자"],
  tendencies: ["문제 해결"],
  education: { schoolName: "기존학교", major: "기존전공" },
  jobRoles: ["백엔드"],
  skills: ["Java"],
  thumbnailUrl: "/api/demo/uploads/demo/profile-1/profile.png",
  workDrivenLevel: 2,
};

const baseDetail: TalentDetailResponse = {
  id: 1,
  name: "기존 인재",
  title: "기존 제목",
  introduction: "기존 소개",
  email: "talent.demo@lionconnect.test",
  phoneNumber: "010-0000-0001",
  jobRoles: ["백엔드"],
  tendencies: ["문제 해결"],
  experiences: ["부트캠프 경험자"],
  skills: ["Java"],
  languages: ["TOEIC 900"],
  thumbnailUrl: "/api/demo/uploads/demo/profile-1/profile.png",
  portfolioUrl: null,
  storageUrl: null,
  likelionCertified: true,
  updatedAt: "2026-01-01T00:00:00.000Z",
  workExperiences: [],
  educations: [],
  certifications: [],
  awards: [],
  languageDetails: [],
  workDrivenLevel: 2,
};

describe("talentAdapter", () => {
  beforeEach(() => {
    resetDemoResumeStore();
  });

  it("이력서 스냅샷의 이름·직군·스킬·학력·레벨을 목록 아이템에 반영한다", () => {
    const snapshot = getDemoResumeSnapshot(1);
    expect(snapshot).not.toBeNull();

    const item = applyResumeToTalentListItem(baseListItem, snapshot!);

    expect(item.name).toBe("데모 인재");
    expect(item.jobRoles).toEqual(["프론트엔드"]);
    expect(item.skills).toEqual(["React", "Next.js", "TypeScript"]);
    expect(item.education?.schoolName).toBe("라이언대학교");
    expect(item.workDrivenLevel).toBe(4);
    // 이력서에 없는 값은 base를 유지한다
    expect(item.thumbnailUrl).toBe("/api/demo/uploads/demo/profile-1/profile.png");
    expect(item.phoneNumber).toBe("010-0000-0001");
  });

  it("이력서 스냅샷을 상세 응답에 반영한다", () => {
    const snapshot = getDemoResumeSnapshot(1)!;
    const detail = applyResumeToTalentDetail(baseDetail, snapshot);

    expect(detail.name).toBe("데모 인재");
    expect(detail.jobRoles).toEqual(["프론트엔드"]);
    expect(detail.educations).toHaveLength(1);
    expect(detail.workExperiences).toHaveLength(1);
    expect(detail.workDrivenLevel).toBe(4);
  });

  it("이력서 이름을 수정하면 합성 결과에 반영된다", () => {
    updateDemoProfile(1, {
      name: "수정된 이름",
      introduction: "수정된 소개",
      storageUrl: "/demo-assets/profile-1/portfolio.pdf",
      visibility: "PUBLIC",
    });

    const snapshot = getDemoResumeSnapshot(1)!;
    const item = applyResumeToTalentListItem(baseListItem, snapshot);

    expect(item.name).toBe("수정된 이름");
    expect(item.introduction).toBe("수정된 소개");
  });
});
