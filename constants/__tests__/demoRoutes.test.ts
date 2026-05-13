import { describe, expect, it } from "vitest";
import {
  DEMO_ROUTE_SECTIONS,
  getDemoRouteSection,
  isDemoRouteActive,
} from "@/constants/demoRoutes";

describe("demoRoutes", () => {
  it("maps each demo role to an entry and role-specific menu", () => {
    expect(DEMO_ROUTE_SECTIONS).toHaveLength(3);
    expect(getDemoRouteSection("demo_talent")?.links.map((link) => link.href)).toEqual([
      "/dashboard",
      "/dashboard/profile",
      "/dashboard/applications",
    ]);
    expect(getDemoRouteSection("demo_company")?.links.map((link) => link.href)).toContain(
      "/talents"
    );
    expect(getDemoRouteSection("demo_admin")?.links.map((link) => link.href)).toContain(
      "/admin/users"
    );
  });

  it("matches nested routes without marking unrelated prefixes active", () => {
    expect(isDemoRouteActive("/dashboard/profile/1", "/dashboard/profile")).toBe(true);
    expect(isDemoRouteActive("/dashboard/profile", "/dashboard")).toBe(false);
    expect(isDemoRouteActive("/admin/users", "/admin")).toBe(false);
    expect(isDemoRouteActive("/dashboarding", "/dashboard")).toBe(false);
    expect(isDemoRouteActive("/talents/3", "/talents")).toBe(true);
    expect(isDemoRouteActive("/", "/")).toBe(true);
    expect(isDemoRouteActive("/jobs", "/")).toBe(false);
  });
});
