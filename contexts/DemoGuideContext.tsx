"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/utils";

const DEMO_GUIDE_SESSION_KEY = "lion-connect-demo-guide-seen";

type DemoGuideModalType = "portfolio" | "serverClosed";

type DemoGuideContextValue = {
  openPortfolioGuide: () => void;
  openServerClosedGuide: () => void;
  closeGuide: () => void;
};

const DemoGuideContext = createContext<DemoGuideContextValue | null>(null);

type DemoGuideCopy = {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
};

const DEMO_GUIDE_COPY: Record<DemoGuideModalType, DemoGuideCopy> = {
  portfolio: {
    title: "포트폴리오 데모 안내",
    description:
      "LionConnect 운영 서버가 종료되어 현재 화면은 실제 서버 없이 Mock API로 둘러볼 수 있는 데모 모드입니다.\n인재, 기업, 관리자 흐름은 이후 데모 허브에서 역할을 선택해 확인할 수 있습니다.",
    primaryLabel: "데모 둘러보기",
    secondaryLabel: "계속 랜딩 보기",
  },
  serverClosed: {
    title: "서버 종료 안내",
    description:
      "실제 로그인은 현재 제공되지 않습니다.\n회원가입과 운영 인증 서버도 종료되어 포트폴리오 검토는 데모 허브에서 역할을 선택해 진행해주세요.",
    primaryLabel: "데모 페이지로 이동",
    secondaryLabel: "닫기",
  },
};

export function DemoGuideProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [modalType, setModalType] = useState<DemoGuideModalType | null>(null);

  const openPortfolioGuide = useCallback(() => {
    setModalType("portfolio");
  }, []);

  const openServerClosedGuide = useCallback(() => {
    setModalType("serverClosed");
  }, []);

  const closeGuide = useCallback(() => {
    setModalType(null);
  }, []);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    if (window.sessionStorage.getItem(DEMO_GUIDE_SESSION_KEY)) return;

    window.sessionStorage.setItem(DEMO_GUIDE_SESSION_KEY, "true");
    setModalType("portfolio");
  }, []);

  const value = useMemo(
    () => ({
      openPortfolioGuide,
      openServerClosedGuide,
      closeGuide,
    }),
    [closeGuide, openPortfolioGuide, openServerClosedGuide]
  );

  const handlePrimaryAction = () => {
    setModalType(null);
    router.push("/demo");
  };

  return (
    <DemoGuideContext.Provider value={value}>
      {children}
      <DemoGuideFloatingButton onClick={openPortfolioGuide} />
      <DemoGuideModal
        modalType={modalType}
        onClose={closeGuide}
        onPrimaryAction={handlePrimaryAction}
      />
    </DemoGuideContext.Provider>
  );
}

function DemoGuideFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed left-4 z-40 h-10 rounded-full border border-orange-200 bg-white px-4 text-sm font-semibold text-brand-06 shadow-lg transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-05 sm:left-6"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
      aria-label="포트폴리오 데모 안내 열기"
    >
      Demo 안내
    </button>
  );
}

export function useDemoGuide() {
  const ctx = useContext(DemoGuideContext);
  if (!ctx) {
    throw new Error("useDemoGuide must be used within DemoGuideProvider");
  }
  return ctx;
}

function DemoGuideModal({
  modalType,
  onClose,
  onPrimaryAction,
}: {
  modalType: DemoGuideModalType | null;
  onClose: () => void;
  onPrimaryAction: () => void;
}) {
  useEffect(() => {
    if (!modalType) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalType, onClose]);

  if (!modalType) return null;

  const copy = DEMO_GUIDE_COPY[modalType];

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="presentation">
      <div
        className="absolute inset-0 bg-neutral-950/55"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      <section
        className={cn(
          "relative z-10 w-full max-w-[480px] rounded-lg border border-neutral-200 bg-white p-6 shadow-2xl",
          "flex flex-col gap-5"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-guide-title"
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-brand-05">LionConnect Demo</p>
          <h2
            id="demo-guide-title"
            className="font-title text-2xl font-bold leading-8 text-neutral-900"
          >
            {copy.title}
          </h2>
          <p className="whitespace-pre-line text-sm leading-6 text-neutral-600">
            {copy.description}
          </p>
        </div>

        <div className="rounded-md border border-orange-100 bg-orange-50 px-4 py-3">
          <p className="text-sm leading-5 text-neutral-700">
            데모 데이터는 외부 DB나 실제 토큰을 사용하지 않고, 이후 작업에서 기존 API 계층을 통해{" "}
            <span className="font-semibold">/api/demo</span>로 연결됩니다.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md px-4 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            {copy.secondaryLabel}
          </button>
          <button
            type="button"
            onClick={onPrimaryAction}
            className="h-10 rounded-md bg-brand-05 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-06"
          >
            {copy.primaryLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
