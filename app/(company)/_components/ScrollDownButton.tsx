"use client";

import Image from "next/image";

type ScrollDownButtonProps = {
  targetSectionId?: string;
  delay?: number;
};

/**
 * @description
 * 다음 섹션으로 스크롤하는 버튼 컴포넌트입니다.
 * 페이드인 애니메이션과 바운스 효과가 적용됩니다.
 */
export default function ScrollDownButton({
  targetSectionId = "benefits-section",
  delay = 1200,
}: ScrollDownButtonProps) {
  const scrollToNextSection = () => {
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
      const headerOffset = 80;
      const sectionPadding = 24;
      const targetPosition =
        targetSection.getBoundingClientRect().top + window.scrollY - headerOffset - sectionPadding;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      onClick={scrollToNextSection}
      className="absolute bottom-8 left-1/2 z-20 h-8 w-8 -translate-x-1/2 animate-bounce opacity-100 transition-transform duration-300 ease-out hover:scale-110"
      style={{ animationDelay: `${delay}ms` }}
      aria-label="다음 섹션으로 스크롤"
    >
      <Image
        src="/landing/icons/outline-cheveron-down-gray.svg"
        alt="Scroll Down"
        width={32}
        height={32}
        className="w-full h-full hover:cursor-pointer"
      />
    </button>
  );
}
