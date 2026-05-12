import type { AdminCompaniesResponse, AdminUsersResponse } from "@/types/admin";
import type { PublicJobPosting } from "@/types/company-job-posting";
import type { InquiryListResponse } from "@/types/inquiry";
import type { ApplyJobResponse, CompanyApplicant, JobApplication } from "@/types/jobApplication";
import type { JobDetailResponse } from "@/types/job";
import type { TalentDetailResponse } from "@/types/talent";
import type { TalentListItem } from "@/lib/api/talents";

export const DEMO_ROLE_NOW = "2026-05-12T00:00:00.000Z";

export const demoPublicJobs: PublicJobPosting[] = [
  {
    jobPostingId: 9001,
    title: "Next.js 프론트엔드 개발자",
    companyName: "데모커머스",
    jobGroupName: "개발",
    jobRoleName: "프론트엔드",
    employmentType: "FULL_TIME",
    workplaceShort: "서울 강남",
    thumbnailImageKey: null,
    thumbnailImageUrl: "/images/companyLogo.png",
    publishedAt: DEMO_ROLE_NOW,
  },
  {
    jobPostingId: 9002,
    title: "React Product Engineer",
    companyName: "모크테크",
    jobGroupName: "개발",
    jobRoleName: "프론트엔드",
    employmentType: "INTERN",
    workplaceShort: "서울 성수",
    thumbnailImageKey: null,
    thumbnailImageUrl: "/images/companyLogo.png",
    publishedAt: DEMO_ROLE_NOW,
  },
];

export const demoJobDetails: JobDetailResponse[] = [
  {
    jobPostingId: 9001,
    title: "Next.js 프론트엔드 개발자",
    employmentType: "FULL_TIME",
    jobDescription: "LionConnect 데모에서 공개 채용 상세 화면을 확인하기 위한 공고입니다.",
    mainTasks: "Next.js App Router 기반 화면 개발, API 상태 관리, 폼 UX 개선",
    requirements: "React, TypeScript, TanStack Query 사용 경험",
    preferred: "접근성과 테스트 자동화에 관심이 있는 분",
    benefits: "자율 출퇴근, 코드 리뷰 문화, 포트폴리오 성장 지원",
    hiringProcess: "서류 검토 -> 인터뷰 -> 최종 합류",
    workplace: "서울특별시 강남구 데모로 19",
    companyName: "데모커머스",
    courseName: "멋쟁이사자처럼 프론트엔드 스쿨",
    courseGeneration: 13,
    jobGroupName: "개발",
    jobRoleId: 1,
    jobRoleName: "프론트엔드",
    publishedAt: DEMO_ROLE_NOW,
    images: [
      {
        objectKey: "demo/job-9001/cover.png",
        contentType: "image/png",
        fileSize: 1024,
        originalFilename: "cover.png",
        sortOrder: 1,
        url: "/images/companyLogo.png",
        fileUrl: "/images/companyLogo.png",
      },
    ],
    myJobApplicationId: 8001,
    myJobApplicationStatus: "APPLIED",
    applied: true,
  },
  {
    jobPostingId: 9002,
    title: "React Product Engineer",
    employmentType: "INTERN",
    jobDescription: "제품 실험과 빠른 화면 개선을 함께 경험하는 인턴 포지션입니다.",
    mainTasks: "컴포넌트 설계, 성능 점검, 대시보드 개선",
    requirements: "React 기본기와 Git 협업 경험",
    preferred: "폼/상태 관리 경험",
    benefits: "멘토링, 실무 프로젝트 참여",
    hiringProcess: "서류 검토 -> 과제 -> 인터뷰",
    workplace: "서울특별시 성동구 데모길 9",
    companyName: "모크테크",
    courseName: "멋쟁이사자처럼 프론트엔드 스쿨",
    courseGeneration: 13,
    jobGroupName: "개발",
    jobRoleId: 1,
    jobRoleName: "프론트엔드",
    publishedAt: DEMO_ROLE_NOW,
    images: [],
    myJobApplicationId: null,
    myJobApplicationStatus: null,
    applied: false,
  },
];

export const demoTalentList: TalentListItem[] = [
  {
    id: 1,
    name: "데모 인재",
    introduction: "Next.js와 TypeScript로 실제 서비스형 화면을 안정적으로 구현합니다.",
    email: "talent.demo@lionconnect.test",
    phoneNumber: "010-0000-0001",
    experiences: ["부트캠프 경험자", "창업 경험자"],
    tendencies: ["문제 해결", "협업 지향"],
    education: {
      schoolName: "라이언대학교",
      major: "컴퓨터공학",
    },
    jobRoles: ["프론트앤드"],
    skills: ["React", "Next.js", "TypeScript"],
    thumbnailUrl: "/images/default-profile.png",
    workDrivenLevel: 4,
  },
];

export const demoTalentDetails: TalentDetailResponse[] = [
  {
    id: 1,
    name: "데모 인재",
    title: "프론트엔드 포트폴리오 이력서",
    introduction: "Next.js와 TypeScript로 실제 서비스형 화면을 안정적으로 구현합니다.",
    email: "talent.demo@lionconnect.test",
    phoneNumber: "010-0000-0001",
    jobRoles: ["프론트앤드"],
    tendencies: ["문제 해결", "협업 지향"],
    experiences: ["부트캠프 경험자", "창업 경험자"],
    skills: ["React", "Next.js", "TypeScript"],
    languages: ["TOEIC Speaking IH"],
    thumbnailUrl: "/images/default-profile.png",
    portfolioUrl: "/demo-assets/profile-1/portfolio.pdf",
    externalLink: "https://github.com/lionconnect-demo",
    externalLinks: ["https://github.com/lionconnect-demo"],
    storageUrl: "/demo-assets/profile-1/portfolio.pdf",
    likelionCertified: true,
    updatedAt: DEMO_ROLE_NOW,
    workExperiences: [
      {
        id: 201,
        companyName: "데모랩",
        department: "프로덕트팀",
        position: "Frontend Intern",
        startDate: "2024-03-01",
        endDate: "2024-08-01",
        isCurrent: false,
        description: "채용 관리 화면의 필터링과 상세 조회 UI를 구현했습니다.",
        createdAt: DEMO_ROLE_NOW,
        updatedAt: DEMO_ROLE_NOW,
      },
    ],
    educations: [
      {
        id: 101,
        schoolName: "라이언대학교",
        major: "컴퓨터공학",
        status: "GRADUATED",
        startDate: "2020-03-01",
        endDate: "2024-02-01",
        degree: "학사",
        description: "웹 서비스 설계와 사용자 인터페이스 과목을 중심으로 학습했습니다.",
        createdAt: DEMO_ROLE_NOW,
        updatedAt: DEMO_ROLE_NOW,
      },
    ],
    certifications: [
      {
        id: 401,
        name: "정보처리기사",
        issuer: "한국산업인력공단",
        issueDate: "2025-06-01",
        createdAt: DEMO_ROLE_NOW,
        updatedAt: DEMO_ROLE_NOW,
      },
    ],
    awards: [
      {
        id: 501,
        title: "교내 웹 서비스 해커톤 우수상",
        organization: "라이언대학교",
        awardDate: "2025-08-01",
        description: "사용자 피드백 기반 대시보드 개선안을 구현했습니다.",
        createdAt: DEMO_ROLE_NOW,
        updatedAt: DEMO_ROLE_NOW,
      },
    ],
    languageDetails: [
      {
        id: 301,
        languageName: "TOEIC Speaking",
        level: "IH",
        issueDate: "2025-01-01",
        createdAt: DEMO_ROLE_NOW,
        updatedAt: DEMO_ROLE_NOW,
      },
    ],
    workDrivenLevel: 4,
  },
];

export const demoApplications: JobApplication[] = [
  {
    jobApplicationId: 8001,
    jobPostingId: 9001,
    status: "APPLIED",
    appliedAt: DEMO_ROLE_NOW,
    canceledAt: null,
    companyName: "데모커머스",
    jobPostingTitle: "Next.js 프론트엔드 개발자",
    jobGroupName: "개발",
    jobRoleName: "프론트엔드",
  },
];

export const demoApplicants: CompanyApplicant[] = [
  {
    applicantName: "데모 인재",
    jobGroupName: "개발",
    jobRoleName: "프론트엔드",
    appliedAt: DEMO_ROLE_NOW,
    applicationStatus: "APPLIED",
    talentProfileId: 1,
    talentProfileTitle: "프론트엔드 포트폴리오 이력서",
  },
];

export const demoAdminUsers: AdminUsersResponse["content"] = [
  {
    id: 1001,
    name: "데모 인재",
    phoneNumber: "010-0000-0001",
    email: "talent.demo@lionconnect.test",
    joinedAt: DEMO_ROLE_NOW,
    roles: ["JOINEDUSER"],
    locked: false,
    courseName: "프론트엔드 스쿨",
    courseGeneration: 13,
  },
  {
    id: 1002,
    name: "데모 관리자",
    phoneNumber: "010-0000-0003",
    email: "admin.demo@lionconnect.test",
    joinedAt: DEMO_ROLE_NOW,
    roles: ["ADMIN"],
    locked: false,
  },
];

export const demoAdminCompanies: AdminCompaniesResponse["content"] = [
  {
    id: 2001,
    name: "기업 담당자",
    companyName: "데모커머스",
    phoneNumber: "010-0000-0002",
    email: "company.demo@lionconnect.test",
    joinedAt: DEMO_ROLE_NOW,
    roles: ["JOINEDCOMPANY"],
    companyLocked: false,
  },
];

export const demoInquiries: InquiryListResponse["content"] = [
  {
    id: 7001,
    profileId: 1,
    profileName: "데모 인재",
    profileStorageUrl: "/demo-assets/profile-1/portfolio.pdf",
    companyName: "데모파트너스",
    contactPerson: "채용 담당자",
    department: "인재영입팀",
    position: "매니저",
    email: "partner.demo@lionconnect.test",
    phoneNumber: "010-0000-0004",
    content: "프론트엔드 포지션 인터뷰를 제안하고 싶습니다.",
    privacyPolicyAgreed: true,
    status: "NEW",
    createdAt: DEMO_ROLE_NOW,
    updatedAt: DEMO_ROLE_NOW,
  },
];

export type DemoRoleSeed = {
  jobs: PublicJobPosting[];
  jobDetails: JobDetailResponse[];
  talents: TalentListItem[];
  talentDetails: TalentDetailResponse[];
  applications: JobApplication[];
  applicants: CompanyApplicant[];
  adminUsers: AdminUsersResponse["content"];
  adminCompanies: AdminCompaniesResponse["content"];
  inquiries: InquiryListResponse["content"];
  nextApplicationId: number;
};

export const demoRoleSeed: DemoRoleSeed = {
  jobs: demoPublicJobs,
  jobDetails: demoJobDetails,
  talents: demoTalentList,
  talentDetails: demoTalentDetails,
  applications: demoApplications,
  applicants: demoApplicants,
  adminUsers: demoAdminUsers,
  adminCompanies: demoAdminCompanies,
  inquiries: demoInquiries,
  nextApplicationId: 8002,
};

export type { ApplyJobResponse };
