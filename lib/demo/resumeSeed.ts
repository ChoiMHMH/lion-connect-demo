import type {
  AwardResponse,
  CertificationResponse,
  CustomSkillResponse,
  EducationResponse,
  ExpTagResponse,
  ExperienceResponse,
  JobCategoryResponse,
  LanguageResponse,
  ProfileLinkResponse,
  ProfileResponse,
  WorkDrivenTestResultResponse,
} from "@/types/talent";

export type DemoProfileRecord = ProfileResponse & {
  status: "DRAFT" | "COMPLETED";
  locked: boolean;
};

export type DemoResumeData = {
  profiles: DemoProfileRecord[];
  educations: Record<number, EducationResponse[]>;
  experiences: Record<number, ExperienceResponse[]>;
  languages: Record<number, LanguageResponse[]>;
  certifications: Record<number, CertificationResponse[]>;
  awards: Record<number, AwardResponse[]>;
  expTags: Record<number, ExpTagResponse[]>;
  jobCategories: Record<number, JobCategoryResponse[]>;
  profileLinks: Record<number, ProfileLinkResponse[]>;
  customSkills: Record<number, CustomSkillResponse[]>;
  workDrivenResults: Record<number, WorkDrivenTestResultResponse>;
};

export const DEMO_RESUME_NOW = "2026-05-12T00:00:00.000Z";

export const demoResumeSeed: DemoResumeData = {
  profiles: [
    {
      id: 1,
      name: "데모 인재",
      title: "프론트엔드 포트폴리오 이력서",
      introduction:
        "Next.js, React Query, React Hook Form 기반 제품 화면을 설계하고 안정적으로 연결하는 프론트엔드 개발자입니다.",
      storageUrl: "/demo-assets/profile-1/portfolio.pdf",
      likelionCode: "DEMO-2026",
      visibility: "PRIVATE",
      status: "COMPLETED",
      locked: false,
      createdAt: DEMO_RESUME_NOW,
      updatedAt: DEMO_RESUME_NOW,
    },
  ],
  educations: {
    1: [
      {
        id: 101,
        schoolName: "라이언대학교",
        major: "컴퓨터공학",
        status: "GRADUATED",
        startDate: "2020-03-01",
        endDate: "2024-02-01",
        degree: "학사",
        description: "웹 서비스 설계와 사용자 인터페이스 과목을 중심으로 학습했습니다.",
        createdAt: DEMO_RESUME_NOW,
        updatedAt: DEMO_RESUME_NOW,
      },
    ],
  },
  experiences: {
    1: [
      {
        id: 201,
        companyName: "데모랩",
        department: "프로덕트팀",
        position: "Frontend Intern",
        startDate: "2024-03-01",
        endDate: "2024-08-01",
        isCurrent: false,
        description: "채용 관리 화면의 필터링과 상세 조회 UI를 구현했습니다.",
        createdAt: DEMO_RESUME_NOW,
        updatedAt: DEMO_RESUME_NOW,
      },
    ],
  },
  languages: {
    1: [
      {
        id: 301,
        languageName: "TOEIC Speaking",
        level: "IH",
        issueDate: "2025-01-01",
        createdAt: DEMO_RESUME_NOW,
        updatedAt: DEMO_RESUME_NOW,
      },
    ],
  },
  certifications: {
    1: [
      {
        id: 401,
        name: "정보처리기사",
        issuer: "한국산업인력공단",
        issueDate: "2025-06-01",
        createdAt: DEMO_RESUME_NOW,
        updatedAt: DEMO_RESUME_NOW,
      },
    ],
  },
  awards: {
    1: [
      {
        id: 501,
        title: "교내 웹 서비스 해커톤 우수상",
        organization: "라이언대학교",
        awardDate: "2025-08-01",
        description: "사용자 피드백 기반 대시보드 개선안을 구현했습니다.",
        createdAt: DEMO_RESUME_NOW,
        updatedAt: DEMO_RESUME_NOW,
      },
    ],
  },
  expTags: {
    1: [
      { id: 1, name: "부트캠프" },
      { id: 2, name: "스타트업" },
    ],
  },
  jobCategories: {
    1: [
      { id: 1, name: "개발" },
      { id: 1, name: "프론트엔드" },
    ],
  },
  profileLinks: {
    1: [
      {
        id: 601,
        type: "LINK",
        url: "https://github.com/ChoiMHMH/lion-connect-demo",
        originalFilename: null,
        contentType: "text/uri-list",
        fileSize: 0,
        createdAt: DEMO_RESUME_NOW,
        updatedAt: DEMO_RESUME_NOW,
      },
      {
        id: 602,
        type: "PORTFOLIO",
        url: "/demo-assets/profile-1/portfolio.pdf",
        originalFilename: "portfolio.pdf",
        contentType: "application/pdf",
        fileSize: 1234,
        createdAt: DEMO_RESUME_NOW,
        updatedAt: DEMO_RESUME_NOW,
      },
    ],
  },
  customSkills: {
    1: [
      { id: 701, name: "React" },
      { id: 702, name: "Next.js" },
      { id: 703, name: "TypeScript" },
    ],
  },
  workDrivenResults: {
    1: {
      totalScore: 64,
      averageScore: 4,
      level: 4,
      testedAt: DEMO_RESUME_NOW,
      questionScores: Array.from({ length: 16 }, (_, index) => ({
        questionId: index + 1,
        orderIndex: index + 1,
        score: 4,
      })),
    },
  },
};
