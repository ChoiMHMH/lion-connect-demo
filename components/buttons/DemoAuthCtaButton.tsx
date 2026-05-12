"use client";

import { useDemoGuide } from "@/contexts/DemoGuideContext";

type DemoAuthCtaButtonProps = {
  className: string;
  children?: React.ReactNode;
};

export default function DemoAuthCtaButton({
  className,
  children = "로그인/회원가입",
}: DemoAuthCtaButtonProps) {
  const { openServerClosedGuide } = useDemoGuide();

  return (
    <button type="button" onClick={openServerClosedGuide} className={className}>
      {children}
    </button>
  );
}
