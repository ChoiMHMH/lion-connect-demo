import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DemoHubPage from "@/app/demo/page";

vi.mock("@/app/demo/_components/DemoResetButton", () => ({
  default: () => <button type="button">데모 데이터 초기화</button>,
}));

describe("DemoHubPage", () => {
  it("역할별 데모 진입점과 저장 정책을 표시한다", () => {
    render(<DemoHubPage />);

    expect(screen.getByRole("heading", { name: "포트폴리오 검토용 데모 허브" })).toBeVisible();
    expect(screen.getByRole("link", { name: "인재 데모 시작" })).toHaveAttribute(
      "href",
      "/demo/enter/talent"
    );
    expect(screen.getByRole("link", { name: "기업 데모 시작" })).toHaveAttribute(
      "href",
      "/demo/enter/company"
    );
    expect(screen.getByRole("link", { name: "관리자 데모 시작" })).toHaveAttribute(
      "href",
      "/demo/enter/admin"
    );
    expect(screen.getByText("운영 서버 종료")).toBeVisible();
    expect(screen.getByText("Mock API")).toBeVisible();
    expect(screen.getByText("저장 정책")).toBeVisible();
    expect(screen.getByRole("button", { name: "데모 데이터 초기화" })).toBeVisible();
  });
});
