import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * #2/#4 회귀 방지: 데모 스토어가 "새 서버 인스턴스(모듈 재로드)" 후에도
 * localStorage에서 hydrate되어 수정값을 유지하는지 검증한다.
 * vi.resetModules()로 서버리스 콜드스타트/인스턴스 교체를 시뮬레이션한다.
 */

function demoReq(method: string, path: string, body?: unknown) {
  return new Request(`http://localhost/api/demo${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function segmentsOf(path: string) {
  return path.split("?")[0].split("/").filter(Boolean);
}

async function freshApi() {
  vi.resetModules();
  return import("@/lib/demo/mockApi");
}

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

describe("데모 스토어 영속화 (resumeStore)", () => {
  it("저장소가 비면 시드(홍길동)로 시작한다", async () => {
    const api = await freshApi();
    const res = await api.handleDemoApiRequest(
      demoReq("GET", "/profile/me?profileId=1"),
      segmentsOf("/profile/me")
    );
    expect((await res.json()).name).toBe("홍길동");
  });

  it("이름 수정이 모듈 재로드(새 인스턴스) 후에도 유지된다 (#2/#4)", async () => {
    const api1 = await freshApi();
    const putRes = await api1.handleDemoApiRequest(
      demoReq("PUT", "/profile/me?profileId=1", { ...updatedProfile, name: "홍길동222" }),
      segmentsOf("/profile/me")
    );
    expect(putRes.status).toBe(200);

    const api2 = await freshApi();
    const getRes = await api2.handleDemoApiRequest(
      demoReq("GET", "/profile/me?profileId=1"),
      segmentsOf("/profile/me")
    );
    expect((await getRes.json()).name).toBe("홍길동222");
  });

  it("비공개 전환이 재로드 후 인재탐색에 반영된다 (#3 cross-store)", async () => {
    const api1 = await freshApi();
    await api1.handleDemoApiRequest(
      demoReq("PUT", "/profile/me?profileId=1", { ...updatedProfile, visibility: "PRIVATE" }),
      segmentsOf("/profile/me")
    );

    const api2 = await freshApi();
    const searchRes = await api2.handleDemoApiRequest(
      demoReq("GET", "/profiles/search"),
      segmentsOf("/profiles/search")
    );
    const body = await searchRes.json();
    const names = (body.content ?? []).map((t: { name: string }) => t.name);
    expect(names).not.toContain("홍길동222");
    expect(names).not.toContain("홍길동");
  });
});

describe("데모 스토어 영속화 primitive", () => {
  it("resumeStore persist/hydrate 라운드트립", async () => {
    vi.resetModules();
    const mod1 = await import("@/lib/demo/resumeStore");
    mod1.updateDemoProfile(1, updatedProfile);
    mod1.persistResumeStore();

    vi.resetModules();
    const mod2 = await import("@/lib/demo/resumeStore");
    expect(mod2.getDemoProfile(1).name).toBe("홍길동222");
  });

  it("roleStore persist/hydrate 라운드트립", async () => {
    vi.resetModules();
    const mod1 = await import("@/lib/demo/roleStore");
    const created = mod1.createDemoCompanyJobPosting({
      title: "영속 테스트 공고",
      jobRoleId: 0,
      employmentType: "FULL_TIME",
      workplace: "서울",
      jobDescription: "",
      mainTasks: "",
      requirements: "",
      preferred: "",
      benefits: "",
      hiringProcess: "",
      status: "DRAFT",
      images: [],
    } as never);
    mod1.persistRoleStore();

    vi.resetModules();
    const mod2 = await import("@/lib/demo/roleStore");
    const list = mod2.listDemoCompanyJobPostings(new URLSearchParams());
    const titles = (list.content ?? []).map((j: { title: string }) => j.title);
    expect(titles).toContain("영속 테스트 공고");
    expect(created.jobPostingId).toBeGreaterThan(0);
  });
});
