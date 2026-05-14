export const DEMO_AUTH_COOKIE = "lion-connect-demo-role";
export const DEMO_ACCESS_TOKEN_PREFIX = "demo-access-token-";

export const DEMO_ROLES = ["demo_talent", "demo_company", "demo_admin"] as const;

export type DemoRole = (typeof DEMO_ROLES)[number];

export const DEMO_ONLY_MODE = process.env.NEXT_PUBLIC_DEMO_ONLY_MODE !== "false";
export const DEFAULT_DEMO_ROLE: DemoRole = "demo_company";
export const DEFAULT_COMPANY_DEMO_ROLE: DemoRole = "demo_company";
export const DEFAULT_TALENT_DEMO_ROLE: DemoRole = "demo_talent";
export const DEFAULT_ADMIN_DEMO_ROLE: DemoRole = "demo_admin";

export type DemoAuthUser = {
  name: string;
  id: number;
  email: string;
  phoneNumber: string | null;
  phoneVerified: boolean;
  roles: string[];
};

export type DemoAuthProfile = {
  role: DemoRole;
  label: string;
  homeRoute: string;
  roles: string[];
  accessToken: string;
  user: DemoAuthUser;
};

export const DEMO_AUTH_PROFILES: Record<DemoRole, DemoAuthProfile> = {
  demo_talent: {
    role: "demo_talent",
    label: "인재 데모",
    homeRoute: "/dashboard",
    roles: ["USER", "JOINEDUSER"],
    accessToken: `${DEMO_ACCESS_TOKEN_PREFIX}talent`,
    user: {
      id: 9001,
      name: "데모 인재",
      email: "talent.demo@lionconnect.local",
      phoneNumber: "010-0000-9001",
      phoneVerified: true,
      roles: ["USER", "JOINEDUSER"],
    },
  },
  demo_company: {
    role: "demo_company",
    label: "기업 데모",
    homeRoute: "/",
    roles: ["COMPANY", "JOINEDCOMPANY"],
    accessToken: `${DEMO_ACCESS_TOKEN_PREFIX}company`,
    user: {
      id: 9002,
      name: "데모 기업",
      email: "company.demo@lionconnect.local",
      phoneNumber: "010-0000-9002",
      phoneVerified: true,
      roles: ["COMPANY", "JOINEDCOMPANY"],
    },
  },
  demo_admin: {
    role: "demo_admin",
    label: "관리자 데모",
    homeRoute: "/admin",
    roles: ["ADMIN"],
    accessToken: `${DEMO_ACCESS_TOKEN_PREFIX}admin`,
    user: {
      id: 9003,
      name: "데모 관리자",
      email: "admin.demo@lionconnect.local",
      phoneNumber: "010-0000-9003",
      phoneVerified: true,
      roles: ["ADMIN"],
    },
  },
};

export function isDemoRole(value: string | null | undefined): value is DemoRole {
  return DEMO_ROLES.includes(value as DemoRole);
}

export function getDemoAuthProfile(role: string | null | undefined): DemoAuthProfile | null {
  if (!isDemoRole(role)) return null;
  return DEMO_AUTH_PROFILES[role];
}

export function getDemoRoleFromRouteSegment(segment: string | string[] | null | undefined) {
  const value = Array.isArray(segment) ? segment[0] : segment;

  if (!value) return null;
  if (isDemoRole(value)) return value;

  if (value === "talent") return "demo_talent";
  if (value === "company") return "demo_company";
  if (value === "admin") return "demo_admin";

  return null;
}

export function getDemoRoleByUser(user: Pick<DemoAuthUser, "id" | "email"> | null | undefined) {
  if (!user) return null;

  const match = DEMO_ROLES.find((role) => {
    const demoUser = DEMO_AUTH_PROFILES[role].user;
    return demoUser.id === user.id && demoUser.email === user.email;
  });

  return match ?? null;
}
