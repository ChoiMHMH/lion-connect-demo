"use client";

import Image from "next/image";
import Link from "next/link";

export default function DemoTalentSearchButton() {
  return (
    <Link
      href="/demo"
      className="h-12 gap-4 px-6 bg-bg-accent rounded-full inline-flex items-center justify-center hover:opacity-90 transition-opacity text-text-inverse-primary text-lg font-semibold leading-7 cursor-pointer"
    >
      <span>데모 둘러보기</span>
      <Image
        src="/landing/icons/outline-arrow-right.svg"
        alt=""
        width={16}
        height={16}
        aria-hidden="true"
      />
    </Link>
  );
}
