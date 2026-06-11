import { beforeEach, describe, expect, it } from "vitest";
import { handleDemoApiRequest } from "@/lib/demo/mockApi";
import { resetDemoResumeStore } from "@/lib/demo/resumeStore";
import { resetDemoRoleStore } from "@/lib/demo/roleStore";

async function callDemoApi(method: string, path: string, body?: unknown) {
  const request = new Request(`http://localhost/api/demo${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
  });

  const response = await handleDemoApiRequest(
    request,
    path.split("?")[0].split("/").filter(Boolean)
  );
  const text = await response.text();

  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
}

describe("demo resume mock API", () => {
  beforeEach(() => {
    resetDemoResumeStore();
    resetDemoRoleStore();
  });

  it("프로필 목록과 단일 이력서 작성 데이터를 기존 endpoint path로 조회한다", async () => {
    const list = await callDemoApi("GET", "/profile");
    const profile = await callDemoApi("GET", "/profile/me?profileId=1");
    const educations = await callDemoApi("GET", "/profile/educations?profileId=1");
    const experiences = await callDemoApi("GET", "/profile/experiences?profileId=1");

    expect(list.status).toBe(200);
    expect(list.body).toEqual([
      expect.objectContaining({
        id: 1,
        status: "COMPLETED",
        title: "프론트엔드 포트폴리오 이력서",
      }),
    ]);
    expect(profile.status).toBe(200);
    expect(profile.body).toEqual(
      expect.objectContaining({ id: 1, name: "홍길동", storageUrl: "/demo/profile-demo.png" })
    );
    expect(educations.body).toEqual([
      expect.objectContaining({ id: 101, schoolName: "라이언대학교" }),
    ]);
    expect(experiences.body).toEqual([expect.objectContaining({ id: 201, companyName: "데모랩" })]);
  });

  it("신규 학력/경력은 POST로 id를 받고 이후 PUT으로 같은 id를 갱신한다", async () => {
    const createdEducations = await callDemoApi("POST", "/profile/educations?profileId=1", [
      {
        schoolName: "테스트대학교",
        major: "컴퓨터공학",
        status: "GRADUATED",
        startDate: "2020-03-01",
        endDate: "2024-02-01",
        degree: "학사",
      },
    ]);
    const createdExperiences = await callDemoApi("POST", "/profile/experiences?profileId=1", [
      {
        companyName: "테스트컴퍼니",
        department: "제품팀",
        position: "Frontend Engineer",
        startDate: "2024-03-01",
        isCurrent: true,
      },
    ]);

    expect(createdEducations.status).toBe(201);
    expect(createdEducations.body[0]).toEqual(expect.objectContaining({ id: 102 }));
    expect(createdExperiences.status).toBe(201);
    expect(createdExperiences.body[0]).toEqual(expect.objectContaining({ id: 202 }));

    const updatedEducation = await callDemoApi("PUT", "/profile/educations/102?profileId=1", {
      schoolName: "테스트대학교",
      major: "소프트웨어학",
      status: "GRADUATED",
      startDate: "2020-03-01",
      endDate: "2024-02-01",
      degree: "학사",
    });
    const updatedExperience = await callDemoApi("PUT", "/profile/experiences/202?profileId=1", {
      companyName: "테스트컴퍼니",
      department: "플랫폼팀",
      position: "Frontend Engineer",
      startDate: "2024-03-01",
      isCurrent: true,
    });

    expect(updatedEducation.body).toEqual(
      expect.objectContaining({ id: 102, major: "소프트웨어학" })
    );
    expect(updatedExperience.body).toEqual(
      expect.objectContaining({ id: 202, department: "플랫폼팀" })
    );
  });

  it("최종 프로필 저장은 status를 COMPLETED로 반영하고 목록에도 유지한다", async () => {
    const updated = await callDemoApi("PUT", "/profile/me?profileId=1", {
      name: "홍길동",
      title: "완성된 이력서",
      introduction: "기존 submitTalentRegister 최종 저장 경로를 통과한 상태입니다.",
      storageUrl: "",
      likelionCode: "DEMO-2026",
      visibility: "PUBLIC",
      status: "COMPLETED",
    });
    const list = await callDemoApi("GET", "/profile");

    expect(updated.status).toBe(200);
    expect(updated.body).toEqual(expect.objectContaining({ id: 1, title: "완성된 이력서" }));
    expect(list.body[0]).toEqual(
      expect.objectContaining({ status: "COMPLETED", visibility: "PUBLIC" })
    );
  });

  it("presign과 upload complete는 외부 S3 없이 mock URL과 링크 데이터를 반환한다", async () => {
    const presigned = await callDemoApi("POST", "/profile/1/portfolio/presign", {
      originalFilename: "portfolio.pdf",
      contentType: "application/pdf",
    });
    const upload = await callDemoApi("PUT", "/uploads/demo/profile-1/portfolio.pdf");
    const completed = await callDemoApi("POST", "/profile/1/portfolio", {
      objectKey: presigned.body.objectKey,
      originalFilename: "portfolio.pdf",
      contentType: "application/pdf",
      fileSize: 1234,
    });

    expect(presigned.body).toEqual(
      expect.objectContaining({
        uploadUrl: "/api/demo/uploads/demo/profile-1/portfolio.pdf",
        fileUrl: "/api/demo/uploads/demo/profile-1/portfolio.pdf",
      })
    );
    expect(upload.status).toBe(204);
    expect(completed.body).toEqual(
      expect.objectContaining({
        originalFilename: "portfolio.pdf",
        fileUrl: "/api/demo/uploads/demo/profile-1/portfolio.pdf",
      })
    );
  });

  it("thumbnail upload complete는 기업 데모 인재 목록과 상세 썸네일에 반영한다", async () => {
    const presigned = await callDemoApi("POST", "/profile/1/thumbnail/presign", {
      originalFilename: "profile.png",
      contentType: "image/png",
    });
    const completed = await callDemoApi("POST", "/profile/1/thumbnail", {
      objectKey: presigned.body.objectKey,
      originalFilename: "profile.png",
      contentType: "image/png",
      fileSize: 4321,
    });
    const talents = await callDemoApi("GET", "/profiles/search?page=0&size=20");
    const talentDetail = await callDemoApi("GET", "/profiles/1");

    expect(completed.status).toBe(201);
    expect(completed.body).toEqual(
      expect.objectContaining({
        fileUrl: "/api/demo/uploads/demo/profile-1/profile.png",
      })
    );
    expect(talents.body.content[0]).toEqual(
      expect.objectContaining({
        thumbnailUrl: "/api/demo/uploads/demo/profile-1/profile.png",
      })
    );
    expect(talentDetail.body).toEqual(
      expect.objectContaining({
        thumbnailUrl: "/api/demo/uploads/demo/profile-1/profile.png",
      })
    );
  });
});
