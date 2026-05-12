import { expect, test, type Page } from "@playwright/test";

async function expectDemoHeader(page: Page, activeRole: string) {
  await expect(page.getByRole("link", { name: /LionConnect Demo/ })).toBeVisible();
  await expect(page.getByRole("button", { name: activeRole })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
}

test.describe("portfolio demo mode", () => {
  test("shows the portfolio guide and intercepts auth CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("dialog", { name: "포트폴리오 데모 안내" })).toBeVisible();
    await page.getByRole("button", { name: "계속 랜딩 보기" }).click();
    await expect(page.getByRole("dialog", { name: "포트폴리오 데모 안내" })).toBeHidden();

    await page.getByRole("button", { name: "로그인/회원가입" }).click();
    await expect(page.getByRole("dialog", { name: "서버 종료 안내" })).toBeVisible();

    await page.getByRole("button", { name: "데모 페이지로 이동" }).click();
    await expect(page).toHaveURL(/\/demo$/);
    await expect(page.getByRole("heading", { name: "포트폴리오 검토용 데모 허브" })).toBeVisible();
  });

  test("enters talent demo and records browser API traffic", async ({ page }) => {
    const profileResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/demo/profile/me?profileId=1") && response.status() === 200
    );

    await page.goto("/demo/enter/talent?returnTo=/dashboard/profile/1");
    await expect(page).toHaveURL(/\/dashboard\/profile\/1$/);
    await profileResponse;

    await expectDemoHeader(page, "인재 데모");
    await expect(page.getByPlaceholder("이력서 제목")).toBeVisible();

    const logToggle = page.getByRole("button", { name: /Demo API Log/ });
    await expect(logToggle).toBeVisible();
    await logToggle.click();
    await expect(page.getByText("/api/demo/profile/me")).toBeVisible();
  });

  test("allows company demo access to the protected talent search route", async ({ page }) => {
    const talentSearchResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/demo/profiles/search") && response.status() === 200
    );

    await page.goto("/demo/enter/company?returnTo=/talents");
    await expect(page).toHaveURL(/\/talents$/);
    await talentSearchResponse;

    await expectDemoHeader(page, "기업 데모");
    await expect(page.getByText(/총\s+\d+명/)).toBeVisible();
  });

  test("allows admin demo access to the protected admin route", async ({ page }) => {
    const inquiriesResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/demo/admin/inquiries") && response.status() === 200
    );

    await page.goto("/demo/enter/admin?returnTo=/admin/inquiries");
    await expect(page).toHaveURL(/\/admin\/inquiries$/);
    await inquiriesResponse;

    await expectDemoHeader(page, "관리자 데모");
    await expect(page.getByText("담당자명")).toBeVisible();
  });
});
