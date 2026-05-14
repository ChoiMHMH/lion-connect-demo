import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JobCard } from "@/app/dashboard/job-board/_components/JobCard";
import JobImageCarousel from "@/app/dashboard/job-board/_components/JobImageCarousel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("job board images", () => {
  it("목록 카드 이미지는 원본 비율을 유지해 전체가 보이도록 표시한다", () => {
    const { container } = render(
      <JobCard
        jobPostingId={9001}
        title="Next.js 프론트엔드 개발자"
        company="데모커머스"
        location="서울 강남"
        imageUrl="/demo/demo-cover.png"
      />
    );

    expect(screen.getByAltText("Next.js 프론트엔드 개발자")).toHaveClass("object-contain");
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
    expect(container.querySelector(".blur-xl")).toBeInTheDocument();
  });

  it("상세 이미지 캐러셀은 원본 비율을 유지해 전체가 보이도록 표시한다", () => {
    const { container } = render(
      <JobImageCarousel images={["/demo/demo-cover.png", "/demo/demo-cover2.png"]} />
    );

    expect(screen.getByAltText("채용 이미지 1")).toHaveClass("object-contain");
    expect(screen.getByAltText("채용 이미지 2")).toHaveClass("object-contain");
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
    expect(container.querySelector(".blur-xl")).toBeInTheDocument();
  });
});
