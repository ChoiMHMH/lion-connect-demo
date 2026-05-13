import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JobCopyright from "@/app/dashboard/job-board/_components/JobCopyright";

describe("JobCopyright", () => {
  it("채용공고 회사명을 면책 문구에 표시하고 placeholder를 남기지 않는다", () => {
    const { container } = render(<JobCopyright companyName="모크테크" />);
    const content = container.textContent ?? "";

    expect(content.match(/모크테크/g)).toHaveLength(2);
    expect(screen.queryByText(/회사 이름/)).not.toBeInTheDocument();
  });
});
