"use client";

import Image from "next/image";
import { useDemoGuide } from "@/contexts/DemoGuideContext";

export default function DemoTalentSearchButton() {
  const { openPortfolioGuide } = useDemoGuide();

  return (
    <button
      type="button"
      onClick={openPortfolioGuide}
      className="h-12 gap-4 px-6 bg-bg-accent rounded-full inline-flex items-center justify-center hover:opacity-90 transition-opacity text-text-inverse-primary text-lg font-semibold leading-7 cursor-pointer"
    >
      <span>인재 탐색 시작하기</span>
      <Image
        src="/landing/icons/outline-arrow-right.svg"
        alt=""
        width={16}
        height={16}
        aria-hidden="true"
      />
    </button>
  );
}
