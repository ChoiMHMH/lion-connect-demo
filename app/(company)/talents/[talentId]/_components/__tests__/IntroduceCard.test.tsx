import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IntroduceCard from "@/app/(company)/talents/[talentId]/_components/IntroduceCard";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("IntroduceCard", () => {
  it("목록 카드 전체를 상세 페이지 링크로 렌더링하고 수정된 thumbnailUrl을 사용한다", () => {
    render(
      <IntroduceCard
        name="데모 인재"
        talentId="1"
        thumbnailUrl="/api/demo/uploads/demo/profile-1/profile.png"
        profileImageUrl="/images/default-profile.png"
        showDetailButton
      />
    );

    const cardLink = screen.getByRole("link", { name: "데모 인재 상세 페이지로 이동" });
    const profileImage = within(cardLink).getByRole("img", { name: "데모 인재 프로필 이미지" });

    expect(cardLink).toHaveAttribute("href", "/talents/1");
    expect(cardLink).toHaveClass("cursor-pointer");
    expect(profileImage).toHaveAttribute("src", "/api/demo/uploads/demo/profile-1/profile.png");
    expect(within(cardLink).getByText("상세 보기")).toBeVisible();
  });

  it("이름 최대 글자수 prop으로 truncate 폭을 제어한다", () => {
    const { rerender } = render(<IntroduceCard name="데모 백엔드 인재" />);

    // 기본값(상세): 9ch
    expect(screen.getByRole("heading", { level: 2 })).toHaveStyle({ maxWidth: "9ch" });

    // 목록: 5ch
    rerender(<IntroduceCard name="데모 백엔드 인재" nameMaxChars={5} />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveStyle({ maxWidth: "5ch" });
    expect(heading).toHaveClass("truncate");
  });
});
