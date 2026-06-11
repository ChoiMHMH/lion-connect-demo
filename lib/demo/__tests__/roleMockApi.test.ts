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

  it("시드 공고의 제목만 수정해도 정적 커버 이미지 URL이 유지된다(깨지지 않음)", async () => {
    // 실제 수정 요청은 백엔드 계약상 기존 이미지의 url/fileUrl을 제거하고 objectKey만 보낸다.
    const updateBody = {
      ...jobPostingRequest,
      title: "제목만 바꾼 데모 공고",
      images: [
        {
          objectKey: "demo/demo-cover.png",
          contentType: "image/png",
          fileSize: 1024,
          originalFilename: "demo-cover.png",
          sortOrder: 1,
        },
      ],
    };

    const updated = await callDemoApi("PUT", "/company/job-postings/9001", updateBody);
    const detail = await callDemoApi("GET", "/company/job-postings/9001");

    expect(updated.status).toBe(200);
    expect(detail.body.title).toBe("제목만 바꾼 데모 공고");
    // /api/demo/uploads/... 로 재구성되지 않고 정적 경로를 유지해야 한다.
    expect(detail.body.images[0]).toEqual(
      expect.objectContaining({
        objectKey: "demo/demo-cover.png",
        url: "/demo/demo-cover.png",
        fileUrl: "/demo/demo-cover.png",
      })
    );
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

  it("인재 랜딩 공개 공고는 게시중만 노출하고 게시/취소가 반영된다", async () => {
    // 시드: 게시중 5개(9001, 9002, 9004, 9005, 9006), 게시 대기 1개(9003)
    const initial = await callDemoApi("GET", "/job-postings?page=0&size=12");
    const initialIds = initial.body.content.map(
      (job: { jobPostingId: number }) => job.jobPostingId
    );
    expect(initial.body.totalElements).toBe(5);
    expect(initialIds).toEqual(expect.arrayContaining([9001, 9002, 9004, 9005, 9006]));
    expect(initialIds).not.toContain(9003);

    // 게시 대기 공고(9003)를 게시하면 랜딩에 노출된다
    const published = await callDemoApi("PATCH", "/company/job-postings/9003/publish");
    const afterPublish = await callDemoApi("GET", "/job-postings?page=0&size=12");
    expect(published.status).toBe(200);
    expect(afterPublish.body.totalElements).toBe(6);
    expect(
      afterPublish.body.content.map((job: { jobPostingId: number }) => job.jobPostingId)
    ).toContain(9003);

    // 게시중 공고(9001)를 내리면 랜딩에서 제거된다
    const unpublished = await callDemoApi("PATCH", "/company/job-postings/9001/unpublish");
    const afterUnpublish = await callDemoApi("GET", "/job-postings?page=0&size=12");
    expect(unpublished.status).toBe(200);
    expect(
      afterUnpublish.body.content.map((job: { jobPostingId: number }) => job.jobPostingId)
    ).not.toContain(9001);

    // 기업 관리 목록은 게시 여부와 무관하게 전체 6개를 보여준다
    const companyJobs = await callDemoApi("GET", "/company/job-postings/me?page=0&size=10");
    expect(companyJobs.body.totalElements).toBe(6);
  });

  it("관리자 채용공고 목록은 게시 대기 공고도 포함한다", async () => {
    const adminJobs = await callDemoApi("GET", "/admin/job-postings?status=&page=0&size=12");
    const ids = adminJobs.body.content.map((job: { jobPostingId: number }) => job.jobPostingId);
    expect(adminJobs.body.totalElements).toBe(6);
    expect(ids).toEqual(expect.arrayContaining([9001, 9002, 9003]));
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
        name: "홍길동",
        thumbnailUrl: "/demo/profile-demo.png",
        jobRoles: ["프론트엔드"],
      })
    );
    expect(talentDetail.body).toEqual(
      expect.objectContaining({
        id: 1,
        name: "홍길동",
        thumbnailUrl: "/demo/profile-demo.png",
        portfolioUrl: "/demo/mock_portfolio_frontend_honggildong.pdf",
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
        applicantName: "홍길동",
        talentProfileId: 1,
      })
    );
  });

  it("지원자 현황은 공고별로 분리되며 지원/취소가 반영된다", async () => {
    // 시드 공고 9001은 홍길동 인재 1명, 9002는 0명으로 시작
    const applicants9001 = await callDemoApi(
      "GET",
      "/company/job-postings/9001/applications?page=0&size=10"
    );
    const applicants9002 = await callDemoApi(
      "GET",
      "/company/job-postings/9002/applications?page=0&size=10"
    );
    expect(applicants9001.body.totalElements).toBe(1);
    expect(applicants9001.body.content[0]).toEqual(
      expect.objectContaining({ talentProfileId: 1, jobPostingId: 9001 })
    );
    expect(applicants9002.body.totalElements).toBe(0);

    // 9002에 지원하면 9002 지원자 현황에만 추가된다
    const applied = await callDemoApi("POST", "/job-postings/9002/apply", {
      talentProfileId: 1,
    });
    const applicants9002AfterApply = await callDemoApi(
      "GET",
      "/company/job-postings/9002/applications?page=0&size=10"
    );
    const applicants9001AfterApply = await callDemoApi(
      "GET",
      "/company/job-postings/9001/applications?page=0&size=10"
    );
    expect(applicants9002AfterApply.body.totalElements).toBe(1);
    expect(applicants9002AfterApply.body.content[0]).toEqual(
      expect.objectContaining({
        talentProfileId: 1,
        jobPostingId: 9002,
        applicationStatus: "APPLIED",
      })
    );
    expect(applicants9001AfterApply.body.totalElements).toBe(1);

    // 공고 목록의 지원자 수도 공고별로 반영된다
    const companyJobs = await callDemoApi("GET", "/company/job-postings/me?page=0&size=10");
    const job9001 = companyJobs.body.content.find(
      (job: { jobPostingId: number }) => job.jobPostingId === 9001
    );
    const job9002 = companyJobs.body.content.find(
      (job: { jobPostingId: number }) => job.jobPostingId === 9002
    );
    expect(job9001.totalApplicationsCount).toBe(1);
    expect(job9002.totalApplicationsCount).toBe(1);

    // 지원 취소 시 해당 공고의 지원자 현황에서 제거된다
    const canceled = await callDemoApi(
      "PATCH",
      `/me/job-applications/${applied.body.jobApplicationId}/cancel`
    );
    const applicants9002AfterCancel = await callDemoApi(
      "GET",
      "/company/job-postings/9002/applications?page=0&size=10"
    );
    expect(canceled.status).toBe(204);
    expect(applicants9002AfterCancel.body.totalElements).toBe(0);
  });

  it("새로 만든 공고는 지원자가 없다", async () => {
    const created = await callDemoApi("POST", "/company/job-postings", jobPostingRequest);
    const createdId = created.body.jobPostingId;
    const applicants = await callDemoApi(
      "GET",
      `/company/job-postings/${createdId}/applications?page=0&size=10`
    );

    expect(created.body.totalApplicationsCount).toBe(0);
    expect(applicants.body.totalElements).toBe(0);
    expect(applicants.body.content).toHaveLength(0);
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

  it("공개 공고는 직군/직무 코드로 필터링된다", async () => {
    const frontend = await callDemoApi(
      "GET",
      "/job-postings?jobGroupCode=development&jobRoleCode=frontend&page=0&size=12"
    );
    const dev = await callDemoApi("GET", "/job-postings?jobGroupCode=development&page=0&size=12");
    const design = await callDemoApi("GET", "/job-postings?jobGroupCode=design&page=0&size=12");
    const dataGroup = await callDemoApi("GET", "/job-postings?jobGroupCode=data&page=0&size=12");

    const jobIds = (res: { body: { content: { jobPostingId: number }[] } }) =>
      res.body.content.map((job) => job.jobPostingId).sort((a, b) => a - b);

    // 게시중 공고 중 개발/프론트엔드만
    expect(jobIds(frontend)).toEqual([9001, 9002]);
    // 직군만 지정하면 해당 직군의 게시중 공고 전체
    expect(jobIds(dev)).toEqual([9001, 9002, 9004]);
    expect(jobIds(design)).toEqual([9005]);
    // 매칭되는 게시중 공고가 없으면 빈 목록
    expect(dataGroup.body.totalElements).toBe(0);
  });

  it("인재 검색은 직군/직무 id와 keyword로 필터링된다", async () => {
    const byRole = await callDemoApi("GET", "/profiles/search?jobRoleId=2&page=0&size=20");
    const byGroup = await callDemoApi("GET", "/profiles/search?jobGroupId=2&page=0&size=20");
    const devGroup = await callDemoApi("GET", "/profiles/search?jobGroupId=1&page=0&size=20");
    const roleAndKeyword = await callDemoApi(
      "GET",
      "/profiles/search?jobRoleId=1&keyword=홍길동&page=0&size=20"
    );
    const noMatch = await callDemoApi("GET", "/profiles/search?jobRoleId=6&page=0&size=20");

    const talentIds = (res: { body: { content: { id: number }[] } }) =>
      res.body.content.map((talent) => talent.id).sort((a, b) => a - b);

    expect(talentIds(byRole)).toEqual([2]);
    // 직군(디자인)만 지정하면 그 직군의 직무를 가진 인재
    expect(talentIds(byGroup)).toEqual([3]);
    // 개발 직군은 프론트엔드/백엔드 인재 모두 포함
    expect(talentIds(devGroup)).toEqual([1, 2]);
    // 직무 + keyword AND 결합
    expect(talentIds(roleAndKeyword)).toEqual([1]);
    // 매칭되는 인재가 없으면 빈 목록
    expect(noMatch.body.totalElements).toBe(0);
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
