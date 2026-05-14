"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type DemoRole } from "@/constants/demoAuth";
import {
  DEMO_ROUTE_SECTIONS,
  getDemoRouteSection,
  isDemoRouteActive,
} from "@/constants/demoRoutes";
import {
  BUSINESS_CONNECT_HREF,
  clearBusinessConnectHash,
  scrollToBusinessConnect,
  scrollToBusinessConnectWhenReady,
} from "@/lib/businessConnectNavigation";
import { activateDemoAuth } from "@/lib/demoAuthClient";
import { cn } from "@/utils/utils";

type DemoHeaderProps = {
  currentRole: DemoRole;
};

export default function DemoHeader({ currentRole }: DemoHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingRole, setPendingRole] = useState<DemoRole | null>(null);
  const [currentHash, setCurrentHash] = useState("");
  const currentSection = getDemoRouteSection(currentRole) ?? DEMO_ROUTE_SECTIONS[0];

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash);

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/" && pathname === "/") {
      event.preventDefault();
      clearBusinessConnectHash(setCurrentHash);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (href !== BUSINESS_CONNECT_HREF) return;

    event.preventDefault();

    if (pathname === "/") {
      scrollToBusinessConnect({ onHashChange: setCurrentHash });
      return;
    }

    router.push(BUSINESS_CONNECT_HREF);
    scrollToBusinessConnectWhenReady({ onHashChange: setCurrentHash });
  };

  const handleRoleChange = async (role: DemoRole) => {
    const section = getDemoRouteSection(role);
    if (!section) return;

    setPendingRole(role);

    try {
      const profile = await activateDemoAuth(role);
      router.push(profile.homeRoute);
    } finally {
      setPendingRole(null);
    }
  };

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    void handleRoleChange("demo_company");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border-accent bg-bg-primary">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center gap-8 px-8">
        <Link href="/" onClick={handleBrandClick} className="flex shrink-0 items-center gap-2">
          <Image
            src="/icons/likelion-favicon-60.svg"
            alt="LionConnect Demo Logo"
            width={32}
            height={32}
          />
          <span className="font-ko-title text-2xl font-black text-text-accent">
            LionConnect Demo
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-8" aria-label="데모 역할 메뉴">
          <div className="flex items-center gap-2" aria-label="데모 역할 전환">
            {DEMO_ROUTE_SECTIONS.map((section) => {
              const isCurrent = section.role === currentRole;
              const isPending = pendingRole === section.role;

              return (
                <button
                  key={section.role}
                  type="button"
                  onClick={() => handleRoleChange(section.role)}
                  disabled={isPending}
                  className={cn(
                    "h-9 rounded-md border px-3 text-sm font-semibold transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-05",
                    isCurrent
                      ? "border-brand-05 bg-brand-05 text-white"
                      : "border-border-primary text-text-primary hover:bg-bg-secondary",
                    isPending ? "cursor-wait opacity-70" : "cursor-pointer"
                  )}
                  aria-pressed={isCurrent}
                >
                  {section.label}
                </button>
              );
            })}
          </div>

          <div
            className="flex min-w-0 items-center gap-7 overflow-x-auto"
            aria-label="현재 역할 메뉴"
          >
            {currentSection.links.map((link) => {
              const isActive = isDemoRouteActive(pathname, link.href, currentHash);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  className={cn(
                    "shrink-0 border-b-2 py-2 font-ko-title text-base font-semibold transition-colors",
                    isActive
                      ? "border-brand-05 text-text-accent"
                      : "border-transparent text-text-primary hover:text-text-accent"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <Link
          href="/demo"
          className="shrink-0 rounded-md border border-border-primary px-3.5 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-bg-secondary"
        >
          데모 허브
        </Link>
      </div>
    </header>
  );
}
