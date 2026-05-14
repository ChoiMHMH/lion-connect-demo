import { beforeEach, describe, expect, it } from "vitest";
import { handleDemoApiRequest } from "@/lib/demo/mockApi";
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

describe("demo role page mock API", () => {
  beforeEach(() => {
    resetDemoRoleStore();
  });

  const jobPostingRequest = {
    title: "데모 QA 엔지니어",
    employmentType: "FULL_TIME",
    jobRoleId: 1,
    jobDescription: "데모 채용공고 등록 API 확인용 공고입니다.",
    mainTasks: "데모 시나리오 점검과 회귀 테스트",
    requirements: "제품 테스트 경험",
    preferred: "자동화 테스트 경험",
    benefits: "자율 출퇴근",
    hiringProcess: "서류 검토 -> 인터뷰",
    workplace: "서울특별시 강남구",
    status: "DRAFT",
    images: [
      {
        objectKey: "demo/company-job-postings/qa.png",
        contentType: "image/png",
        fileSize: 2048,
        originalFilename: "qa.png",
        sortOrder: 1,
      },
    ],
  };

  it("인재용 채용공고 목록/상세와 지원 현황 mutation을 mock한다", async () => {
    const jobs = await callDemoApi("GET", "/job-postings?page=0&size=12");
    const jobDetail = await callDemoApi("GET", "/job-postings/9001");
    const applications = await callDemoApi("GET", "/me/job-applications?page=0&size=10");
    const applied = await callDemoApi("POST", "/job-postings/9002/apply", {
      talentProfileId: 1,
    });
    const canceled = await callDemoApi("PATCH", "/me/job-applications/8002/cancel");

    expect(jobs.status).toBe(200);
    expect(jobs.body.content[0]).toEqual(
      expect.objectContaining({
        jobPostingId: 9001,
        companyName: "데모커머스",
        jobRoleName: "프론트엔드",
        thumbnailImageUrl: "/demo/demo-cover.png",
      })
    );
    expect(jobDetail.body).toEqual(
      expect.objectContaining({
        jobPostingId: 9001,
        title: "Next.js 프론트엔드 개발자",
      })
    );
    expect(jobDetail.body.images[0]).toEqual(
      expect.objectContaining({
        url: "/demo/demo-cover.png",
        fileUrl: "/demo/demo-cover.png",
      })
    );
    expect(applications.body.content[0]).toEqual(
      expect.objectContaining({
        jobApplicationId: 8001,
        jobPostingId: 9001,
      })
    );
    expect(applied.status).toBe(201);
    expect(applied.body).toEqual(
      expect.objectContaining({
        jobPostingId: 9002,
        talentProfileId: 1,
        status: "APPLIED",
      })
    );
    expect(canceled.status).toBe(204);
  });

  it("지원 상태는 채용공고 상세와 지원 현황 목록에 함께 반영된다", async () => {
    const initialDetail = await callDemoApi("GET", "/job-postings/9001");
    const initialApplications = await callDemoApi("GET", "/me/job-applications?page=0&size=10");
    const applied = await callDemoApi("POST", "/job-postings/9002/apply", {
      talentProfileId: 1,
    });
    const detailAfterApply = await callDemoApi("GET", "/job-postings/9002");
    const applicationsAfterApply = await callDemoApi("GET", "/me/job-applications?page=0&size=10");
    const canceled = await callDemoApi(
      "PATCH",
      `/me/job-applications/${applied.body.jobApplicationId}/cancel`
    );
    const detailAfterCancel = await callDemoApi("GET", "/job-postings/9002");
    const applicationsAfterCancel = await callDemoApi("GET", "/me/job-applications?page=0&size=10");

    expect(initialDetail.body).toEqual(
      expect.objectContaining({
        applied: true,
        myJobApplicationId: 8001,
      })
    );
    expect(initialApplications.body.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          jobApplicationId: 8001,
          jobPostingId: 9001,
        }),
      ])
    );
    expect(detailAfterApply.body).toEqual(
      expect.objectContaining({
        applied: true,
        myJobApplicationId: applied.body.jobApplicationId,
        myJobApplicationStatus: "APPLIED",
      })
    );
    expect(applicationsAfterApply.body.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          jobApplicationId: applied.body.jobApplicationId,
          jobPostingId: 9002,
        }),
      ])
    );
    expect(applicationsAfterApply.body.totalElements).toBe(2);
    expect(canceled.status).toBe(204);
    expect(detailAfterCancel.body).toEqual(
      expect.objectContaining({
        applied: false,
        myJobApplicationId: null,
        myJobApplicationStatus: null,
      })
    );
    expect(applicationsAfterCancel.body.content).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          jobApplicationId: applied.body.jobApplicationId,
        }),
      ])
    );
  });

  it("기업용 인재 검색/상세와 채용공고/지원자 목록을 mock한다", async () => {
    const talents = await callDemoApi("GET", "/profiles/search?page=0&size=20");
    const talentDetail = await callDemoApi("GET", "/profiles/1");
    const companyJobs = await callDemoApi("GET", "/company/job-postings/me?page=0&size=10");
    const companyJobDetail = await callDemoApi("GET", "/company/job-postings/9001");
    const applicants = await callDemoApi(
      "GET",
      "/company/job-postings/9001/applications?page=0&size=10"
    );

    expect(talents.status).toBe(200);
    expect(talents.body.content[0]).toEqual(
      expect.objectContaining({
        id: 1,
        name: "데모 인재",
        jobRoles: ["프론트앤드"],
      })
    );
    expect(talentDetail.body).toEqual(
      expect.objectContaining({
        id: 1,
        name: "데모 인재",
        workDrivenLevel: 4,
      })
    );
    expect(companyJobs.body.content[0]).toEqual(
      expect.objectContaining({
        jobPostingId: 9001,
        status: "PUBLISHED",
      })
    );
    expect(companyJobDetail.body).toEqual(expect.objectContaining({ jobPostingId: 9001 }));
    expect(applicants.body.content[0]).toEqual(
      expect.objectContaining({
        applicantName: "데모 인재",
        talentProfileId: 1,
      })
    );
  });

  it("기업 채용공고 이미지 업로드와 등록/수정/게시/삭제 mutation을 mock한다", async () => {
    const presigned = await callDemoApi("POST", "/company/job-postings/images/presign-bulk", {
      files: [{ originalFilename: "qa.png", contentType: "image/png" }],
    });
    const completedImage = await callDemoApi("POST", "/company/job-postings/images", {
      objectKey: "demo/company-job-postings/qa.png",
      originalFilename: "qa.png",
      contentType: "image/png",
      fileSize: 2048,
    });
    const created = await callDemoApi("POST", "/company/job-postings", jobPostingRequest);
    const createdId = created.body.jobPostingId;
    const listedAfterCreate = await callDemoApi("GET", "/company/job-postings/me?page=0&size=10");
    const updated = await callDemoApi("PUT", `/company/job-postings/${createdId}`, {
      ...jobPostingRequest,
      title: "수정된 데모 QA 엔지니어",
      mainTasks: "수정된 데모 시나리오 점검",
    });
    const detailAfterUpdate = await callDemoApi("GET", `/company/job-postings/${createdId}`);
    const published = await callDemoApi("PATCH", `/company/job-postings/${createdId}/publish`);
    const listedAfterPublish = await callDemoApi("GET", "/company/job-postings/me?page=0&size=10");
    const unpublished = await callDemoApi("PATCH", `/company/job-postings/${createdId}/unpublish`);
    const listedAfterUnpublish = await callDemoApi(
      "GET",
      "/company/job-postings/me?page=0&size=10"
    );
    const deleted = await callDemoApi("DELETE", `/company/job-postings/${createdId}`);
    const listedAfterDelete = await callDemoApi("GET", "/company/job-postings/me?page=0&size=10");

    expect(presigned.status).toBe(201);
    expect(presigned.body.uploads[0]).toEqual(
      expect.objectContaining({
        originalFilename: "qa.png",
        objectKey: "demo/company-job-postings/qa.png",
        fileUrl: "/api/demo/uploads/demo/company-job-postings/qa.png",
      })
    );
    expect(completedImage.status).toBe(201);
    expect(completedImage.body).toEqual(
      expect.objectContaining({
        objectKey: "demo/company-job-postings/qa.png",
        fileUrl: "/api/demo/uploads/demo/company-job-postings/qa.png",
      })
    );
    expect(created.status).toBe(201);
    expect(created.body).toEqual(
      expect.objectContaining({
        title: "데모 QA 엔지니어",
        status: "DRAFT",
      })
    );
    expect(listedAfterCreate.body.content[0]).toEqual(
      expect.objectContaining({
        jobPostingId: createdId,
        title: "데모 QA 엔지니어",
        status: "DRAFT",
      })
    );
    expect(updated.status).toBe(200);
    expect(detailAfterUpdate.body).toEqual(
      expect.objectContaining({
        jobPostingId: createdId,
        title: "수정된 데모 QA 엔지니어",
        mainTasks: "수정된 데모 시나리오 점검",
      })
    );
    expect(published.status).toBe(200);
    expect(listedAfterPublish.body.content[0]).toEqual(
      expect.objectContaining({
        jobPostingId: createdId,
        status: "PUBLISHED",
      })
    );
    expect(unpublished.status).toBe(200);
    expect(listedAfterUnpublish.body.content[0]).toEqual(
      expect.objectContaining({
        jobPostingId: createdId,
        status: "DRAFT",
      })
    );
    expect(deleted.status).toBe(204);
    expect(listedAfterDelete.body.content).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ jobPostingId: createdId })])
    );
  });

  it("관리자 주요 목록 endpoint를 mock한다", async () => {
    const users = await callDemoApi("GET", "/admin/users?page=0&size=20");
    const companies = await callDemoApi("GET", "/admin/companies?page=0&size=20");
    const inquiries = await callDemoApi("GET", "/admin/inquiries?page=0&size=10");
    const jobPostings = await callDemoApi("GET", "/admin/job-postings?status=&page=0&size=12");
    const applicants = await callDemoApi(
      "GET",
      "/admin/job-postings/9001/applications?page=0&size=10"
    );

    expect(users.body.content[0]).toEqual(
      expect.objectContaining({
        id: 1001,
        email: "talent.demo@lionconnect.test",
      })
    );
    expect(companies.body.content[0]).toEqual(
      expect.objectContaining({
        id: 2001,
        companyName: "데모커머스",
      })
    );
    expect(inquiries.body.content[0]).toEqual(
      expect.objectContaining({
        companyName: "데모파트너스",
        status: "NEW",
      })
    );
    expect(jobPostings.body.content[0]).toEqual(expect.objectContaining({ jobPostingId: 9001 }));
    expect(applicants.body.content[0]).toEqual(expect.objectContaining({ talentProfileId: 1 }));
  });

  it("기업 문의 제출을 mock하고 관리자 문의 목록에 저장한다", async () => {
    const submitted = await callDemoApi("POST", "/inquiries", {
      companyName: "신규 데모사",
      contactPerson: "홍길동",
      department: "인사팀",
      position: "",
      email: "demo-inquiry@example.com",
      phoneNumber: "010-1234-5678",
      content: "데모 문의 제출 테스트입니다.",
      agreePrivacy: true,
    });
    const inquiries = await callDemoApi("GET", "/admin/inquiries?page=0&size=10");

    expect(submitted.status).toBe(201);
    expect(inquiries.body.content[0]).toEqual(
      expect.objectContaining({
        companyName: "신규 데모사",
        contactPerson: "홍길동",
        email: "demo-inquiry@example.com",
        content: "데모 문의 제출 테스트입니다.",
        privacyPolicyAgreed: true,
        status: "NEW",
      })
    );
  });

  it("관리자 문의 상태 변경을 mock하고 목록에 반영한다", async () => {
    const updated = await callDemoApi("PATCH", "/admin/inquiries/7001/status", {
      status: "DONE",
    });
    const inquiries = await callDemoApi("GET", "/admin/inquiries?page=0&size=10");

    expect(updated.status).toBe(204);
    expect(inquiries.body.content[0]).toEqual(
      expect.objectContaining({
        id: 7001,
        status: "DONE",
      })
    );
  });
});
