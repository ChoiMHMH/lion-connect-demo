import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JobsLoadingState } from "@/app/(company)/jobs/_components/JobsLoadingState";

describe("JobsLoadingState", () => {
  it("헤더와 3개의 스켈레톤 카드를 렌더해 첫 페인트부터 콘텐츠 영역을 채운다", () => {
    const { container } = render(<JobsLoadingState />);

    expect(screen.getByTestId("jobs-loading")).toBeInTheDocument();
    expect(screen.getByText("채용 공고 관리")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(3);
  });

  it("콘텐츠 영역 높이를 예약해 Footer 점프를 막는다", () => {
    render(<JobsLoadingState />);

    expect(screen.getByTestId("jobs-loading")).toHaveClass("min-h-screen");
  });

  it("라우터 훅에 의존하지 않아 Suspense fallback에서 재서스펜드되지 않는다", () => {
    // next/navigation 컨텍스트(mock) 없이도 렌더가 성공해야 한다.
    expect(() => render(<JobsLoadingState />)).not.toThrow();
  });
});
