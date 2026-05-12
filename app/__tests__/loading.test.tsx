import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loading from "@/app/loading";

describe("global loading UI", () => {
  it("LionConnect Demo 로딩 안내 문구를 표시한다", () => {
    render(<Loading />);

    expect(screen.getByText("LionConnect Demo를 준비하고 있어요")).toBeVisible();
    expect(screen.getByText("실제 서버 없이 Mock API로 페이지를 불러오는 중입니다.")).toBeVisible();
  });
});
