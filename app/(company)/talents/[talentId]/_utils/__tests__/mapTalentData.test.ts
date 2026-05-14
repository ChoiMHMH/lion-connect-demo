import { describe, expect, it } from "vitest";
import { mapTalentDataToComponents } from "@/app/(company)/talents/[talentId]/_utils/mapTalentData";
import type { TalentDetailResponse } from "@/types/talent";

const baseTalentDetail: TalentDetailResponse = {
  id: 1,
  name: "데모 인재",
  introduction: "소개",
  email: "talent.demo@lionconnect.local",
  phoneNumber: "010-0000-9001",
  jobRoles: ["프론트엔드"],
  tendencies: [],
  experiences: [],
  skills: [],
  languages: [],
  thumbnailUrl: "/api/demo/uploads/demo/profile-1/profile.png",
  portfolioUrl: null,
  storageUrl: null,
  likelionCertified: true,
  updatedAt: "2026-05-14T00:00:00.000Z",
  workExperiences: [],
  educations: [],
  certifications: [],
  awards: [],
  languageDetails: [],
  workDrivenLevel: 4,
};

describe("mapTalentDataToComponents", () => {
  it("상세 소개 카드에서도 API thumbnailUrl을 우선 전달한다", () => {
    const { introduceCardProps } = mapTalentDataToComponents(baseTalentDetail);

    expect(introduceCardProps).toEqual(
      expect.objectContaining({
        profileImageUrl: "/api/demo/uploads/demo/profile-1/profile.png",
        thumbnailUrl: "/api/demo/uploads/demo/profile-1/profile.png",
      })
    );
  });
});
