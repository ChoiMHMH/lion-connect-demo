import { expect, test, type Page } from "@playwright/test";

async function expectDemoHeader(page: Page, activeRole: string) {
  await expect(page.getByRole("link", { name: /LionConnect Demo/ })).toBeVisible();
  await expect(page.getByRole("button", { name: activeRole })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
}

test.describe("portfolio demo mode", () => {
  test("shows the portfolio guide and keeps the default company demo header", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("dialog", { name: "포트폴리오 데모 안내" })).toBeVisible();
    await page.getByRole("button", { name: "계속 랜딩 보기" }).click();
    await expect(page.getByRole("dialog", { name: "포트폴리오 데모 안내" })).toBeHidden();
    await expectDemoHeader(page, "기업 데모");
    await expect(page.getByRole("button", { name: "다음 섹션으로 스크롤" })).toBeInViewport();

    await expect(page.getByRole("button", { name: "로그인/회원가입" })).toHaveCount(0);
    await page.getByRole("link", { name: "데모 허브" }).click();
    await expect(page).toHaveURL(/\/demo$/);
    await expect(page.getByRole("heading", { name: "포트폴리오 검토용 데모 허브" })).toBeVisible();
  });

  test("enters talent demo and records browser API traffic", async ({ page }) => {
    // 데모 API는 브라우저에서 로컬 디스패치되므로 네트워크 응답을 기다리지 않고,
    // 로드된 UI와 Demo API 로그(클라이언트 기록)로 검증한다.
    await page.goto("/demo/enter/talent?returnTo=/dashboard/profile/1");
    await expect(page).toHaveURL(/\/dashboard\/profile\/1$/);

    await expectDemoHeader(page, "인재 데모");
    await expect(page.getByPlaceholder("이력서 제목")).toBeVisible();

    const logToggle = page.getByRole("button", { name: /Demo API Log/ });
    await expect(logToggle).toBeVisible();
    await expect(page.getByText("/api/demo/profile/me")).toBeVisible();
  });

  test("allows company demo access to the protected talent search route", async ({ page }) => {
    await page.goto("/demo/enter/company?returnTo=/talents");
    await expect(page).toHaveURL(/\/talents$/);

    await expectDemoHeader(page, "기업 데모");
    await expect(page.getByText(/총\s+\d+명/)).toBeVisible();
  });

  test("allows admin demo access to the protected admin route", async ({ page }) => {
    await page.goto("/demo/enter/admin?returnTo=/admin/inquiries");
    await expect(page).toHaveURL(/\/admin\/inquiries$/);

    await expectDemoHeader(page, "관리자 데모");
    await expect(page.getByText("담당자명")).toBeVisible();
  });
});
