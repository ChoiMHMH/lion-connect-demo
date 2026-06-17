import { vi, describe, it, expect, beforeEach } from "vitest";

/**
 * 도메인 API 함수의 query string 보존을 고정하는 characterization 테스트.
 * withQuery 리팩토링 전/후 모두 동일한 endpoint를 만들어야 한다.
 */

const getMock = vi.fn().mockResolvedValue({});
const serverGetMock = vi.fn().mockResolvedValue({});

vi.mock("@/lib/apiClient", () => ({
  get: (...args: unknown[]) => getMock(...args),
  post: vi.fn().mockResolvedValue({}),
  put: vi.fn().mockResolvedValue({}),
  del: vi.fn().mockResolvedValue({}),
  patch: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/serverApiClient", () => ({
  serverGet: (...args: unknown[]) => serverGetMock(...args),
}));

import {
  fetchPublicJobPostings,
  fetchJobApplicants,
  fetchAdminJobPostings,
  fetchAdminJobApplicants,
} from "@/lib/api/jobPostings";
import { fetchPublicJobPostingsServer } from "@/lib/api/serverJobPostings";
import { fetchTalents } from "@/lib/api/talents";
import { fetchAdminUsers, fetchAdminCompanies } from "@/lib/api/adminUsers";
import { getAdminInquiries } from "@/lib/api/inquiries";

const lastGetEndpoint = () => getMock.mock.calls.at(-1)?.[0] as string;
const lastServerGetEndpoint = () => serverGetMock.mock.calls.at(-1)?.[0] as string;

beforeEach(() => {
  getMock.mockClear();
  serverGetMock.mockClear();
});

describe("jobPostings query params", () => {
  it("fetchPublicJobPostings: jobGroupCode, jobRoleCode, page, size, sort 순서 보존", async () => {
    await fetchPublicJobPostings({
      jobGroupCode: "DEV",
      jobRoleCode: "FE",
      page: 0,
      size: 10,
      sort: ["createdAt,desc"],
    });
    expect(lastGetEndpoint()).toBe(
      "/job-postings?jobGroupCode=DEV&jobRoleCode=FE&page=0&size=10&sort=createdAt%2Cdesc"
    );
  });

  it("fetchJobApplicants: page, size, sort", async () => {
    await fetchJobApplicants("5", { page: 1, size: 20, sort: ["id,asc"] });
    expect(lastGetEndpoint()).toBe(
      "/company/job-postings/5/applications?page=1&size=20&sort=id%2Casc"
    );
  });

  it("fetchAdminJobPostings: status='' 를 맨 앞에 포함", async () => {
    await fetchAdminJobPostings({ page: 0, size: 10 });
    expect(lastGetEndpoint()).toBe("/admin/job-postings?status=&page=0&size=10");
  });

  it("fetchAdminJobApplicants: page, size", async () => {
    await fetchAdminJobApplicants("7", { page: 0, size: 5 });
    expect(lastGetEndpoint()).toBe("/admin/job-postings/7/applications?page=0&size=5");
  });
});

describe("serverJobPostings query params", () => {
  it("fetchPublicJobPostingsServer: 동일 규칙", async () => {
    await fetchPublicJobPostingsServer({
      jobGroupCode: "DEV",
      page: 2,
      size: 12,
      sort: ["createdAt,desc"],
    });
    expect(lastServerGetEndpoint()).toBe(
      "/job-postings?jobGroupCode=DEV&page=2&size=12&sort=createdAt%2Cdesc"
    );
  });
});

describe("talents query params", () => {
  it("fetchTalents: page, size, jobGroupId, jobRoleId, keyword(trim)", async () => {
    await fetchTalents({ page: 0, size: 20, jobGroupId: 1, jobRoleId: 2, keyword: "  hi  " });
    expect(lastGetEndpoint()).toBe(
      "/profiles/search?page=0&size=20&jobGroupId=1&jobRoleId=2&keyword=hi"
    );
  });

  it("fetchTalents: 공백뿐인 keyword는 생략", async () => {
    await fetchTalents({ page: 1, size: 5, keyword: "   " });
    expect(lastGetEndpoint()).toBe("/profiles/search?page=1&size=5");
  });
});

describe("adminUsers query params", () => {
  it("fetchAdminUsers: page, size", async () => {
    await fetchAdminUsers({ page: 1, size: 30 });
    expect(lastGetEndpoint()).toBe("/admin/users?page=1&size=30");
  });

  it("fetchAdminCompanies: page, size, sort(있을 때만)", async () => {
    await fetchAdminCompanies({ page: 0, size: 20, sort: "name,asc" });
    expect(lastGetEndpoint()).toBe("/admin/companies?page=0&size=20&sort=name%2Casc");
  });

  it("fetchAdminCompanies: sort 없으면 생략", async () => {
    await fetchAdminCompanies({ page: 0, size: 20 });
    expect(lastGetEndpoint()).toBe("/admin/companies?page=0&size=20");
  });
});

describe("inquiries query params", () => {
  it("getAdminInquiries: status, page, size, sort", async () => {
    await getAdminInquiries({
      status: "IN_PROGRESS",
      page: 0,
      size: 10,
      sort: ["receivedAt,desc"],
    });
    expect(lastGetEndpoint()).toBe(
      "/admin/inquiries?status=IN_PROGRESS&page=0&size=10&sort=receivedAt%2Cdesc"
    );
  });

  it("getAdminInquiries: 파라미터 없으면 query string 없음", async () => {
    await getAdminInquiries();
    expect(lastGetEndpoint()).toBe("/admin/inquiries");
  });
});
