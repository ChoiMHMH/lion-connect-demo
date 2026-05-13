"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BUSINESS_CONNECT_HREF,
  BUSINESS_CONNECT_ID,
  scrollToBusinessConnect,
  scrollToBusinessConnectWhenReady,
} from "@/lib/businessConnectNavigation";

export type NavLink = {
  label: string;
  href: string;
};

/**
 * 네비게이션 로직을 관리하는 커스텀 훅
 * - Intersection Observer로 섹션 활성화 감지
 * - 경로 기반 네비게이션 활성화
 * - Indicator 위치 계산
 */
export function useNavigation(navLinks: NavLink[]) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  /**
   * business-connect 섹션 감지를 위한 Intersection Observer
   */
  useEffect(() => {
    // 루트 페이지가 아니면 섹션 감지 불필요
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const element = document.getElementById(BUSINESS_CONNECT_ID);
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 섹션이 화면에 50% 이상 보이면 활성화
        if (entry.isIntersecting) {
          setActiveSection(BUSINESS_CONNECT_ID);
        } else {
          setActiveSection(null);
        }
      },
      {
        threshold: 0.5, // 50% 이상 보일 때 활성화
        rootMargin: "-80px 0px 0px 0px", // Header 높이만큼 오프셋
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [pathname]);

  /**
   * 링크 활성화 상태 체크
   */
  const isLinkActive = useCallback(
    (link: NavLink): boolean => {
      // business-connect 링크인 경우
      if (link.href === BUSINESS_CONNECT_HREF) {
        return pathname === "/" && activeSection === BUSINESS_CONNECT_ID;
      }

      // 루트 경로는 active 표시 안 함
      if (link.href === "/") {
        return false;
      }

      // 일반 경로 매칭
      return pathname === link.href;
    },
    [pathname, activeSection]
  );

  /**
   * Indicator 위치 계산
   */
  useEffect(() => {
    // isLinkActive 함수를 useEffect 내부에서 직접 정의하여 무한 루프 방지
    const activeIndex = navLinks.findIndex((link) => {
      if (link.href === BUSINESS_CONNECT_HREF) {
        return pathname === "/" && activeSection === BUSINESS_CONNECT_ID;
      }
      if (link.href === "/") {
        return false;
      }
      return pathname === link.href;
    });

    const element = navRefs.current[activeIndex];

    if (activeIndex !== -1 && element) {
      const nextStyle = {
        left: element.offsetLeft,
        width: element.offsetWidth,
      };

      setIndicatorStyle((currentStyle) => {
        if (currentStyle.left === nextStyle.left && currentStyle.width === nextStyle.width) {
          return currentStyle;
        }
        return nextStyle;
      });
    } else {
      setIndicatorStyle((currentStyle) => {
        if (currentStyle.left === 0 && currentStyle.width === 0) {
          return currentStyle;
        }
        return { left: 0, width: 0 };
      });
    }
  }, [pathname, activeSection, navLinks]);

  /**
   * 네비게이션 클릭 핸들러
   */
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // business-connect 링크가 아니면 기본 동작
      if (href !== BUSINESS_CONNECT_HREF) return;

      e.preventDefault();

      if (pathname === "/") {
        scrollToBusinessConnect();
      } else {
        router.push(BUSINESS_CONNECT_HREF);
        scrollToBusinessConnectWhenReady();
      }
    },
    [pathname, router]
  );

  return {
    navRefs,
    indicatorStyle,
    handleNavClick,
    isLinkActive,
  };
}
