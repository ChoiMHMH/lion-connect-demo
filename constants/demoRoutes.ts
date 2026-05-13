import { DEMO_AUTH_PROFILES, type DemoRole } from "@/constants/demoAuth";

export type DemoNavLink = {
  label: string;
  href: string;
};

export type DemoRouteSection = {
  role: DemoRole;
  label: string;
  entryHref: string;
  homeHref: string;
  links: DemoNavLink[];
};

export const DEMO_ROUTE_SECTIONS: DemoRouteSection[] = [
  {
    role: "demo_talent",
    label: DEMO_AUTH_PROFILES.demo_talent.label,
    entryHref: "/demo/enter/talent",
    homeHref: DEMO_AUTH_PROFILES.demo_talent.homeRoute,
    links: [
      { label: "대시보드", href: "/dashboard" },
      { label: "이력서", href: "/dashboard/profile" },
      { label: "지원 현황", href: "/dashboard/applications" },
    ],
  },
  {
    role: "demo_company",
    label: DEMO_AUTH_PROFILES.demo_company.label,
    entryHref: "/demo/enter/company",
    homeHref: DEMO_AUTH_PROFILES.demo_company.homeRoute,
    links: [
      { label: "기업 홈", href: "/" },
      { label: "인재 탐색", href: "/talents" },
      { label: "채용 등록", href: "/jobs" },
      { label: "기업 문의", href: "/#business-connect" },
    ],
  },
  {
    role: "demo_admin",
    label: DEMO_AUTH_PROFILES.demo_admin.label,
    entryHref: "/demo/enter/admin",
    homeHref: DEMO_AUTH_PROFILES.demo_admin.homeRoute,
    links: [
      { label: "문의", href: "/admin/inquiries" },
      { label: "사용자", href: "/admin/users" },
      { label: "기업", href: "/admin/companies" },
      { label: "지원 현황", href: "/admin/applications" },
    ],
  },
];

const BUSINESS_CONNECT_HASH = "#business-connect";
const EXACT_ACTIVE_HREFS = new Set(["/dashboard", "/admin"]);

export function getDemoRouteSection(role: DemoRole | null | undefined) {
  if (!role) return null;
  return DEMO_ROUTE_SECTIONS.find((section) => section.role === role) ?? null;
}

export function isDemoRouteActive(pathname: string, href: string, hash = "") {
  if (href === "/#business-connect") {
    return pathname === "/" && hash === BUSINESS_CONNECT_HASH;
  }

  if (href === "/") {
    return pathname === "/" && hash !== BUSINESS_CONNECT_HASH;
  }

  if (EXACT_ACTIVE_HREFS.has(href)) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
