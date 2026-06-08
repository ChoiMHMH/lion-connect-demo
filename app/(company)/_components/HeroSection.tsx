import Image from "next/image";
import ScrollDownButton from "./ScrollDownButton";
import BusinessConnectButton from "./BusinessConnectButton";
import DemoTalentSearchButton from "./DemoTalentSearchButton";

type HeroSectionProps = {
  backgroundImage?: string;
};

/**
 * @description
 * 랜딩 페이지의 히어로 섹션 컴포넌트입니다.
 * 배경 이미지 위에 타이틀, 서브타이틀, CTA 버튼들을 표시합니다.
 * 페이지 로드 시 순차적인 페이드인 애니메이션이 적용됩니다.
 */
export default function HeroSection({
  backgroundImage = "/images/hero-image-landing.webp",
}: HeroSectionProps) {
  return (
    <section className="relative flex h-[calc(100svh-80px)] min-h-[560px] w-full min-w-[1444px] items-center justify-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Lion Connect Hero Background"
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/30 to-black/80 animate-[fadeIn_1s_ease-out_forwards]" />
      </div>

      {/* Content Container */}
      <article className="relative z-10 inline-flex flex-col items-center gap-12">
        {/* Title & Subtitle */}
        <hgroup className="w-[517px] flex flex-col items-center gap-2">
          <h1 className="text-center bg-linear-to-r from-[#FF9859] via-[#FF9859] via-20% to-[#FF6000] bg-clip-text text-transparent text-4xl font-bold font-ko-title leading-10 animate-[fadeInUp_1s_ease-out_0.4s_forwards] opacity-0">
            IT 인재 탐색 및 채용 플랫폼
            <br />
            라이언 커넥트
          </h1>

          <p className="text-center text-text-inverse-primary text-lg font-bold leading-7 animate-[fadeInUp_1s_ease-out_0.6s_forwards] opacity-0">
            지금 바로 우수 IT 인재와 커넥트하세요
          </p>
        </hgroup>

        {/* CTA Buttons */}
        <nav className="inline-flex gap-4 animate-[fadeInUpScale_1s_ease-out_0.9s_forwards] opacity-0">
          <DemoTalentSearchButton />
          <BusinessConnectButton />
        </nav>
      </article>

      {/* Scroll Down Button */}
      <ScrollDownButton />
    </section>
  );
}
