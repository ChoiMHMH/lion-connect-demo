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
      })
    );
    expect(jobDetail.body).toEqual(
      expect.objectContaining({
        jobPostingId: 9001,
        title: "Next.js 프론트엔드 개발자",
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
});
