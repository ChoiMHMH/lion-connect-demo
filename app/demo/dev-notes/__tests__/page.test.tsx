import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DemoDevNotesPage from "@/app/demo/dev-notes/page";

describe("DemoDevNotesPage", () => {
  it("API 계층과 이력서 저장 플로우 안내를 표시한다", () => {
    render(<DemoDevNotesPage />);

    expect(screen.getByRole("heading", { name: "데모 모드 기술 노트" })).toBeVisible();
    expect(screen.getByText("ResumeForm")).toBeVisible();
    expect(screen.getByText("useMutation")).toBeVisible();
    expect(screen.getByText("/api/demo Route Handler")).toBeVisible();
    expect(screen.getByText("mock DB/localStorage")).toBeVisible();
    expect(screen.getByRole("link", { name: "이력서 저장 플로우 체험하기" })).toHaveAttribute(
      "href",
      "/demo/enter/talent?returnTo=/dashboard/profile/1"
    );
    expect(screen.getByText(/실제 DB에 저장되지 않으며/)).toBeVisible();
  });
});
