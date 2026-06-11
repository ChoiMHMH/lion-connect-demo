import {
  demoRoleSeed,
  DEMO_ROLE_NOW,
  type DemoApplicant,
  type DemoRoleSeed,
} from "@/lib/demo/roleSeed";
import { findJobRoleById } from "@/constants/jobMapping";
import type {
  AdminCompaniesResponse,
  AdminUsersResponse,
  ProfileLockResponse,
} from "@/types/admin";
import type {
  JobPostingStatus,
  PublicJobPosting,
  PublicJobPostingsResponse,
} from "@/types/company-job-posting";
import type {
  CreateInquiryRequest,
  Inquiry,
  InquiryListResponse,
  InquiryStatus,
} from "@/types/inquiry";
import type {
  ApplyJobResponse,
  CompanyApplicantsResponse,
  JobApplication,
  JobApplicationsResponse,
} from "@/types/jobApplication";
import type {
  ImageUploadCompleteRequest,
  ImageUploadCompleteResponse,
  EmploymentType,
  Job,
  JobImageMetadata,
  JobPostingRequest,
  JobPostingResponse,
  PresignBulkRequest,
  PresignBulkResponse,
} from "@/types/job";
import type { TalentDetailResponse } from "@/types/talent";
import type { TalentListItem, TalentListResponse } from "@/lib/api/talents";

type SortShape = {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function baseSort(): SortShape {
  return {
    empty: true,
    sorted: false,
    unsorted: true,
  };
}

function pageParams(searchParams: URLSearchParams, fallbackSize: number) {
  return {
    page: Number(searchParams.get("page") ?? "0"),
    size: Number(searchParams.get("size") ?? String(fallbackSize)),
  };
}

function paged<T>(items: T[], page: number, size: number) {
  const safePage = Number.isFinite(page) && page >= 0 ? page : 0;
  const safeSize = Number.isFinite(size) && size > 0 ? size : Math.max(items.length, 1);
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / safeSize));
  const start = safePage * safeSize;
  const content = items.slice(start, start + safeSize);
  const sort = baseSort();

  return {
    totalPages,
    totalElements,
    first: safePage === 0,
    last: safePage >= totalPages - 1,
    size: safeSize,
    content: clone(content),
    number: safePage,
    sort,
    numberOfElements: content.length,
    pageable: {
      offset: start,
      sort,
      paged: true,
      pageNumber: safePage,
      pageSize: safeSize,
      unpaged: false,
    },
    empty: content.length === 0,
  };
}

let store: DemoRoleSeed = clone(demoRoleSeed);

export function resetDemoRoleStore() {
  store = clone(demoRoleSeed);
}

function now() {
  return new Date().toISOString();
}

function getJobStatus(jobId: number): JobPostingStatus {
  return store.jobStatuses[jobId] ?? "DRAFT";
}

function countDemoApplicants(jobId: number) {
  return store.applicants.filter((applicant) => applicant.jobPostingId === jobId).length;
}

function setJobStatus(jobId: number, status: JobPostingStatus) {
  store.jobStatuses[jobId] = status;
}

function getJobRoleNames(jobRoleId: number) {
  const result = findJobRoleById(jobRoleId);
  return {
    jobGroupName: result?.group.name ?? "개발",
    jobRoleName: result?.role.name ?? `직무 ${jobRoleId}`,
  };
}

function toSupportedEmploymentType(
  employmentType: PublicJobPosting["employmentType"]
): EmploymentType {
  return employmentType === "CONTRACT" ? "INTERN" : employmentType;
}

function fileUrlForObjectKey(objectKey: string) {
  return `/api/demo/uploads/${objectKey}`;
}

function normalizeJobImages(images: JobImageMetadata[]): JobImageMetadata[] {
  return images.map((image, index) => {
    const fileUrl = image.fileUrl ?? image.url ?? fileUrlForObjectKey(image.objectKey);
    return {
      ...image,
      sortOrder: image.sortOrder ?? index + 1,
      url: fileUrl,
      fileUrl,
    };
  });
}

function toJobPostingResponse(jobId: number): JobPostingResponse {
  const publicJob = getPublicJob(jobId);
  return {
    jobPostingId: publicJob.jobPostingId,
    title: publicJob.title,
    jobGroupName: publicJob.jobGroupName,
    jobRoleName: publicJob.jobRoleName,
    employmentType: toSupportedEmploymentType(publicJob.employmentType),
    status: getJobStatus(jobId) === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    publishedAt: publicJob.publishedAt,
    createdAt: publicJob.publishedAt,
    totalApplicationsCount: countDemoApplicants(jobId),
  };
}

function getJobDetail(jobId: number) {
  const job = store.jobDetails.find((item) => item.jobPostingId === jobId);
  if (!job) {
    throw new Error(`Demo job posting ${jobId} was not found`);
  }
  return job;
}

function getPublicJob(jobId: number) {
  const job = store.jobs.find((item) => item.jobPostingId === jobId);
  if (!job) {
    throw new Error(`Demo public job posting ${jobId} was not found`);
  }
  return job;
}

function getTalentDetail(profileId: number) {
  const talent = store.talentDetails.find((item) => item.id === profileId);
  if (!talent) {
    throw new Error(`Demo talent ${profileId} was not found`);
  }
  return talent;
}

function toCompanyJob(job: PublicJobPosting): Job {
  const detail = getJobDetail(job.jobPostingId);
  return {
    id: String(job.jobPostingId),
    companyId: "2001",
    title: job.title,
    employmentType: detail.employmentType,
    jobRoleId: detail.jobRoleId,
    description: detail.jobDescription,
    responsibilities: detail.mainTasks,
    requirements: detail.requirements,
    preferredQualifications: detail.preferred,
    benefits: detail.benefits,
    hiringProcess: detail.hiringProcess,
    location: detail.workplace,
    images: [],
    existingImages: detail.images,
    status: getJobStatus(job.jobPostingId),
    createdAt: job.publishedAt,
    updatedAt: job.publishedAt,
    imageUrls: job.thumbnailImageUrl ? [job.thumbnailImageUrl] : [],
  };
}

function toPublicJobPostingResponse(
  searchParams: URLSearchParams,
  items = store.jobs
): PublicJobPostingsResponse {
  const { page, size } = pageParams(searchParams, 12);
  return paged(items, page, size);
}

export function listDemoPublicJobPostings(searchParams: URLSearchParams) {
  return toPublicJobPostingResponse(searchParams);
}

export function listDemoCompanyJobPostings(searchParams: URLSearchParams) {
  const { page, size } = pageParams(searchParams, 10);
  return paged(
    store.jobs.map((job) => ({
      jobPostingId: job.jobPostingId,
      title: job.title,
      jobGroupName: job.jobGroupName,
      jobRoleName: job.jobRoleName,
      status: getJobStatus(job.jobPostingId),
      publishedAt: job.publishedAt,
      createdAt: job.publishedAt,
      totalApplicationsCount: countDemoApplicants(job.jobPostingId),
      thumbnailImageUrl: job.thumbnailImageUrl,
    })),
    page,
    size
  );
}

export function getDemoPublicJobPosting(jobId: number) {
  return clone(getJobDetail(jobId));
}

export function getDemoCompanyJobPosting(jobId: number) {
  return clone(getJobDetail(jobId));
}

export function buildDemoCompanyJobImagePresigns(body: PresignBulkRequest): PresignBulkResponse {
  return {
    uploads: body.files.map((file) => {
      const safeFilename =
        file.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "-") || "job-image.png";
      const objectKey = `demo/company-job-postings/${safeFilename}`;
      const fileUrl = fileUrlForObjectKey(objectKey);
      return {
        originalFilename: file.originalFilename,
        contentType: file.contentType,
        objectKey,
        upload: {
          uploadUrl: fileUrl,
          fileUrl,
          objectKey,
        },
        fileUrl,
      };
    }),
  };
}

export function completeDemoCompanyJobImageUpload(
  body: ImageUploadCompleteRequest
): ImageUploadCompleteResponse {
  return {
    objectKey: body.objectKey,
    fileUrl: fileUrlForObjectKey(body.objectKey),
  };
}

export function createDemoCompanyJobPosting(body: JobPostingRequest): JobPostingResponse {
  const jobPostingId = Math.max(0, ...store.jobs.map((job) => job.jobPostingId)) + 1;
  const timestamp = now();
  const { jobGroupName, jobRoleName } = getJobRoleNames(body.jobRoleId);
  const images = normalizeJobImages(body.images);
  const thumbnailImageUrl = images[0]?.fileUrl ?? null;
  const publicJob: PublicJobPosting = {
    jobPostingId,
    title: body.title,
    companyName: "데모커머스",
    jobGroupName,
    jobRoleName,
    employmentType: body.employmentType,
    workplaceShort: body.workplace,
    thumbnailImageKey: images[0]?.objectKey ?? null,
    thumbnailImageUrl,
    publishedAt: timestamp,
  };
  const detail = {
    jobPostingId,
    title: body.title,
    employmentType: body.employmentType,
    jobDescription: body.jobDescription,
    mainTasks: body.mainTasks,
    requirements: body.requirements,
    preferred: body.preferred,
    benefits: body.benefits,
    hiringProcess: body.hiringProcess,
    workplace: body.workplace,
    companyName: publicJob.companyName,
    courseName: "멋쟁이사자처럼 프론트엔드 스쿨",
    courseGeneration: 13,
    jobGroupName,
    jobRoleId: body.jobRoleId,
    jobRoleName,
    publishedAt: timestamp,
    images,
    myJobApplicationId: null,
    myJobApplicationStatus: null,
    applied: false,
  };

  store.jobs = [publicJob, ...store.jobs];
  store.jobDetails = [detail, ...store.jobDetails];
  setJobStatus(jobPostingId, body.status);

  return toJobPostingResponse(jobPostingId);
}

export function updateDemoCompanyJobPosting(
  jobId: number,
  body: JobPostingRequest
): JobPostingResponse {
  getPublicJob(jobId);
  const { jobGroupName, jobRoleName } = getJobRoleNames(body.jobRoleId);
  const images = normalizeJobImages(body.images);
  const thumbnailImageUrl = images[0]?.fileUrl ?? null;

  store.jobs = store.jobs.map((job) =>
    job.jobPostingId === jobId
      ? {
          ...job,
          title: body.title,
          jobGroupName,
          jobRoleName,
          employmentType: body.employmentType,
          workplaceShort: body.workplace,
          thumbnailImageKey: images[0]?.objectKey ?? null,
          thumbnailImageUrl,
        }
      : job
  );
  store.jobDetails = store.jobDetails.map((job) =>
    job.jobPostingId === jobId
      ? {
          ...job,
          title: body.title,
          employmentType: body.employmentType,
          jobDescription: body.jobDescription,
          mainTasks: body.mainTasks,
          requirements: body.requirements,
          preferred: body.preferred,
          benefits: body.benefits,
          hiringProcess: body.hiringProcess,
          workplace: body.workplace,
          jobGroupName,
          jobRoleId: body.jobRoleId,
          jobRoleName,
          images,
        }
      : job
  );

  return toJobPostingResponse(jobId);
}

export function deleteDemoCompanyJobPosting(jobId: number) {
  getPublicJob(jobId);
  store.jobs = store.jobs.filter((job) => job.jobPostingId !== jobId);
  store.jobDetails = store.jobDetails.filter((job) => job.jobPostingId !== jobId);
  store.applications = store.applications.filter(
    (application) => application.jobPostingId !== jobId
  );
  store.applicants = store.applicants.filter((applicant) => applicant.jobPostingId !== jobId);
  delete store.jobStatuses[jobId];
}

export function publishDemoCompanyJobPosting(jobId: number): JobPostingResponse {
  getPublicJob(jobId);
  setJobStatus(jobId, "PUBLISHED");
  return toJobPostingResponse(jobId);
}

export function unpublishDemoCompanyJobPosting(jobId: number): JobPostingResponse {
  getPublicJob(jobId);
  setJobStatus(jobId, "DRAFT");
  return toJobPostingResponse(jobId);
}

export function listDemoCompanyJobFormItems() {
  return clone(store.jobs.map(toCompanyJob));
}

export function listDemoApplications(searchParams: URLSearchParams): JobApplicationsResponse {
  const { page, size } = pageParams(searchParams, 10);
  return paged(store.applications, page, size);
}

export function applyDemoJob(jobId: number, talentProfileId: number): ApplyJobResponse {
  const job = getPublicJob(jobId);
  const application: JobApplication = {
    jobApplicationId: store.nextApplicationId,
    jobPostingId: job.jobPostingId,
    status: "APPLIED",
    appliedAt: DEMO_ROLE_NOW,
    canceledAt: null,
    companyName: job.companyName,
    jobPostingTitle: job.title,
    jobGroupName: job.jobGroupName,
    jobRoleName: job.jobRoleName,
  };
  store.nextApplicationId += 1;
  store.applications.push(application);

  const detail = store.jobDetails.find((item) => item.jobPostingId === jobId);
  if (detail) {
    detail.applied = true;
    detail.myJobApplicationId = application.jobApplicationId;
    detail.myJobApplicationStatus = "APPLIED";
  }

  // 지원한 인재를 해당 공고의 지원자 현황에 반영 (공고당 동일 인재 중복 방지)
  const alreadyApplied = store.applicants.some(
    (applicant) => applicant.jobPostingId === jobId && applicant.talentProfileId === talentProfileId
  );
  if (!alreadyApplied) {
    const talent = store.talentDetails.find((item) => item.id === talentProfileId);
    const applicant: DemoApplicant = {
      jobPostingId: jobId,
      applicantName: talent?.name ?? "지원자",
      jobGroupName: job.jobGroupName,
      jobRoleName: job.jobRoleName,
      appliedAt: now(),
      applicationStatus: "APPLIED",
      talentProfileId,
      talentProfileTitle: talent?.title ?? "",
    };
    store.applicants.push(applicant);
  }

  return {
    jobApplicationId: application.jobApplicationId,
    jobPostingId: job.jobPostingId,
    talentProfileId,
    status: "APPLIED",
  };
}

export function cancelDemoApplication(jobApplicationId: number) {
  const canceled = store.applications.find(
    (application) => application.jobApplicationId === jobApplicationId
  );

  store.applications = store.applications.filter(
    (application) => application.jobApplicationId !== jobApplicationId
  );

  // 취소된 지원 건이 속한 공고의 지원자 현황에서도 제거 (데모는 공고당 지원자 1명)
  if (canceled) {
    store.applicants = store.applicants.filter(
      (applicant) => applicant.jobPostingId !== canceled.jobPostingId
    );
  }

  store.jobDetails.forEach((job) => {
    if (job.myJobApplicationId === jobApplicationId) {
      job.applied = false;
      job.myJobApplicationId = null;
      job.myJobApplicationStatus = null;
    }
  });
}

export function listDemoTalents(searchParams: URLSearchParams): TalentListResponse {
  const keyword = searchParams.get("keyword")?.trim().toLowerCase();
  const filtered = keyword
    ? store.talents.filter((talent) =>
        [talent.name, talent.introduction, ...talent.skills, ...talent.jobRoles]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      )
    : store.talents;
  const { page, size } = pageParams(searchParams, 20);
  return paged<TalentListItem>(filtered, page, size);
}

export function getDemoTalent(profileId: number): TalentDetailResponse {
  return clone(getTalentDetail(profileId));
}

export function updateDemoTalentThumbnail(profileId: number, thumbnailUrl: string) {
  store.talents = store.talents.map((talent) =>
    talent.id === profileId ? { ...talent, thumbnailUrl } : talent
  );
  store.talentDetails = store.talentDetails.map((talent) =>
    talent.id === profileId ? { ...talent, thumbnailUrl, updatedAt: DEMO_ROLE_NOW } : talent
  );
}

export function listDemoApplicants(
  jobId: number,
  searchParams: URLSearchParams
): CompanyApplicantsResponse {
  const { page, size } = pageParams(searchParams, 10);
  const applicants = store.applicants.filter((applicant) => applicant.jobPostingId === jobId);
  return paged(applicants, page, size);
}

export function listDemoAdminUsers(searchParams: URLSearchParams): AdminUsersResponse {
  const { page, size } = pageParams(searchParams, 20);
  return paged(store.adminUsers, page, size);
}

export function listDemoAdminCompanies(searchParams: URLSearchParams): AdminCompaniesResponse {
  const { page, size } = pageParams(searchParams, 20);
  return paged(store.adminCompanies, page, size);
}

export function listDemoInquiries(searchParams: URLSearchParams): InquiryListResponse {
  const status = searchParams.get("status") as InquiryStatus | null;
  const filtered = status
    ? store.inquiries.filter((inquiry) => inquiry.status === status)
    : store.inquiries;
  const { page, size } = pageParams(searchParams, 10);
  return paged(filtered, page, size);
}

export function createDemoInquiry(data: CreateInquiryRequest): Inquiry {
  const nextInquiryId = Math.max(0, ...store.inquiries.map((inquiry) => inquiry.id)) + 1;
  const inquiry: Inquiry = {
    id: nextInquiryId,
    profileId: 0,
    profileName: "",
    profileStorageUrl: "",
    companyName: data.companyName,
    contactPerson: data.contactPerson,
    department: data.department,
    position: data.position,
    email: data.email,
    phoneNumber: data.phoneNumber,
    content: data.content,
    privacyPolicyAgreed: data.agreePrivacy,
    status: "NEW",
    createdAt: DEMO_ROLE_NOW,
    updatedAt: DEMO_ROLE_NOW,
  };

  store.inquiries = [inquiry, ...store.inquiries];

  return clone(inquiry);
}

export function updateDemoInquiryStatus(inquiryId: number, status: InquiryStatus) {
  store.inquiries = store.inquiries.map((inquiry) =>
    inquiry.id === inquiryId ? { ...inquiry, status, updatedAt: DEMO_ROLE_NOW } : inquiry
  );
}

export function setDemoAdminUserLocked(userId: number, locked: boolean): ProfileLockResponse {
  store.adminUsers = store.adminUsers.map((user) =>
    user.id === userId ? { ...user, locked } : user
  );
  const talent = getTalentDetail(1);
  return {
    id: userId,
    name: talent.name,
    title: talent.title ?? "",
    introduction: talent.introduction,
    storageUrl: talent.storageUrl ?? "",
    likelionCode: "DEMO-2026",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    locked,
    createdAt: DEMO_ROLE_NOW,
    updatedAt: DEMO_ROLE_NOW,
  };
}

export function setDemoCompanyLocked(companyId: number, locked: boolean): ProfileLockResponse {
  store.adminCompanies = store.adminCompanies.map((company) =>
    company.id === companyId ? { ...company, companyLocked: locked } : company
  );
  return {
    id: companyId,
    name: "기업 담당자",
    title: "기업 회원",
    introduction: "데모 기업 계정입니다.",
    storageUrl: "",
    likelionCode: "DEMO-COMPANY",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    locked,
    createdAt: DEMO_ROLE_NOW,
    updatedAt: DEMO_ROLE_NOW,
  };
}

export function setDemoAdminRole(userId: number, enabled: boolean) {
  store.adminUsers = store.adminUsers.map((user) => {
    if (user.id !== userId) return user;
    const roles = enabled
      ? Array.from(new Set([...user.roles, "ADMIN"]))
      : user.roles.filter((role) => role !== "ADMIN" && role !== "ROLE_ADMIN");
    return { ...user, roles };
  });
}
