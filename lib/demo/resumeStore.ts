import { findJobRoleById } from "@/constants/jobMapping";
import { EXP_TAG_ID_MAP } from "@/lib/expTags/map";
import { demoResumeSeed, DEMO_RESUME_NOW, type DemoProfileRecord } from "@/lib/demo/resumeSeed";
import type {
  AwardRequest,
  AwardResponse,
  CertificationRequest,
  CertificationResponse,
  CustomSkillResponse,
  EducationRequest,
  EducationResponse,
  ExpTagResponse,
  ExperienceRequest,
  ExperienceResponse,
  JobCategoryResponse,
  LanguageRequest,
  LanguageResponse,
  ProfileLinkResponse,
  ProfileLinkUpsertRequest,
  ProfileRequest,
  WorkDrivenTestResultResponse,
  WorkDrivenTestSubmitRequest,
} from "@/types/talent";

type DemoSectionKey =
  | "educations"
  | "experiences"
  | "languages"
  | "certifications"
  | "awards"
  | "profileLinks"
  | "customSkills";

type DemoSectionItem = { id: number; createdAt?: string; updatedAt?: string };

type DemoResumeStore = {
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
  nextIds: Record<DemoSectionKey | "profiles", number>;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nextIdFor<T extends DemoSectionItem>(items: T[], fallback: number) {
  const maxId = items.reduce((max, item) => Math.max(max, item.id), 0);
  return Math.max(maxId + 1, fallback);
}

function buildStore(): DemoResumeStore {
  const seed = clone(demoResumeSeed);
  const profileIds = seed.profiles.map((profile) => profile.id);
  const allItems = <T extends DemoSectionItem>(records: Record<number, T[]>) =>
    profileIds.flatMap((profileId) => records[profileId] ?? []);

  return {
    ...seed,
    nextIds: {
      profiles: nextIdFor(seed.profiles, 2),
      educations: nextIdFor(allItems(seed.educations), 102),
      experiences: nextIdFor(allItems(seed.experiences), 202),
      languages: nextIdFor(allItems(seed.languages), 302),
      certifications: nextIdFor(allItems(seed.certifications), 402),
      awards: nextIdFor(allItems(seed.awards), 502),
      profileLinks: nextIdFor(allItems(seed.profileLinks), 603),
      customSkills: nextIdFor(allItems(seed.customSkills), 704),
    },
  };
}

let store = buildStore();
const uploadedFiles = new Map<string, { body: ArrayBuffer; contentType: string }>();

function now() {
  return new Date().toISOString();
}

function getProfileIndex(profileId: number) {
  return store.profiles.findIndex((profile) => profile.id === profileId);
}

function getProfile(profileId: number) {
  return store.profiles[getProfileIndex(profileId)] ?? null;
}

function ensureProfile(profileId: number) {
  const profile = getProfile(profileId);
  if (!profile) {
    throw new Error(`Demo profile ${profileId} was not found`);
  }
  return profile;
}

function getList<T>(records: Record<number, T[]>, profileId: number) {
  return records[profileId] ?? [];
}

function replaceList<T>(records: Record<number, T[]>, profileId: number, items: T[]) {
  records[profileId] = items;
  return records[profileId];
}

function nextSectionId(key: DemoSectionKey | "profiles") {
  const id = store.nextIds[key];
  store.nextIds[key] += 1;
  return id;
}

function touchProfile(profileId: number) {
  const profile = ensureProfile(profileId);
  profile.updatedAt = now();
}

function updateSectionItem<T extends DemoSectionItem>(
  key: DemoSectionKey,
  records: Record<number, T[]>,
  profileId: number,
  id: number,
  body: Partial<T>
) {
  ensureProfile(profileId);
  const items = getList(records, profileId);
  const itemIndex = items.findIndex((item) => item.id === id);
  if (itemIndex < 0) {
    throw new Error(`Demo ${key} item ${id} was not found`);
  }

  const updated = {
    ...items[itemIndex],
    ...body,
    id,
    updatedAt: now(),
  };
  items[itemIndex] = updated;
  touchProfile(profileId);
  return clone(updated);
}

function deleteSectionItem<T extends DemoSectionItem>(
  records: Record<number, T[]>,
  profileId: number,
  id: number
) {
  ensureProfile(profileId);
  replaceList(
    records,
    profileId,
    getList(records, profileId).filter((item) => item.id !== id)
  );
  touchProfile(profileId);
}

export function resetDemoResumeStore() {
  store = buildStore();
  uploadedFiles.clear();
}

/**
 * 이력서 프로필과 모든 섹션을 한 번에 읽는 읽기 전용 스냅샷.
 * 인재 탐색(roleStore)에서 이력서를 talent로 합성할 때 단방향으로 사용한다.
 * (resumeStore는 roleStore를 import 하지 않아 순환 의존을 만들지 않는다.)
 */
export type DemoResumeSnapshot = {
  profile: DemoProfileRecord;
  educations: EducationResponse[];
  experiences: ExperienceResponse[];
  languages: LanguageResponse[];
  certifications: CertificationResponse[];
  awards: AwardResponse[];
  customSkills: CustomSkillResponse[];
  jobCategories: JobCategoryResponse[];
  profileLinks: ProfileLinkResponse[];
  workDrivenResult: WorkDrivenTestResultResponse | null;
};

export function getDemoResumeSnapshot(profileId: number): DemoResumeSnapshot | null {
  const profile = getProfile(profileId);
  if (!profile) return null;

  return clone({
    profile,
    educations: getList(store.educations, profileId),
    experiences: getList(store.experiences, profileId),
    languages: getList(store.languages, profileId),
    certifications: getList(store.certifications, profileId),
    awards: getList(store.awards, profileId),
    customSkills: getList(store.customSkills, profileId),
    jobCategories: getList(store.jobCategories, profileId),
    profileLinks: getList(store.profileLinks, profileId),
    workDrivenResult: store.workDrivenResults[profileId] ?? null,
  });
}

export function listDemoProfiles() {
  return clone(
    store.profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      title: profile.title,
      introduction: profile.introduction,
      storageUrl: profile.storageUrl,
      likelionCode: profile.likelionCode,
      visibility: profile.visibility,
      status: profile.status,
      locked: profile.locked,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }))
  );
}

export function createDemoProfile(body: ProfileRequest) {
  const timestamp = now();
  const profile: DemoProfileRecord = {
    id: nextSectionId("profiles"),
    name: body.name,
    title: body.title ?? "새 이력서",
    introduction: body.introduction,
    storageUrl: body.storageUrl,
    likelionCode: body.likelionCode ?? null,
    visibility: body.visibility,
    status: body.status ?? "DRAFT",
    locked: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  store.profiles.push(profile);
  return clone(profile);
}

export function getDemoProfile(profileId: number) {
  return clone(ensureProfile(profileId));
}

export function updateDemoProfile(profileId: number, body: ProfileRequest) {
  const profileIndex = getProfileIndex(profileId);
  if (profileIndex < 0) {
    throw new Error(`Demo profile ${profileId} was not found`);
  }

  const current = store.profiles[profileIndex];
  const updated: DemoProfileRecord = {
    ...current,
    name: body.name,
    title: body.title ?? current.title,
    introduction: body.introduction,
    storageUrl: body.storageUrl,
    likelionCode: body.likelionCode ?? null,
    visibility: body.visibility,
    status: body.status ?? current.status,
    updatedAt: now(),
  };
  store.profiles[profileIndex] = updated;
  return clone(updated);
}

export function deleteDemoProfile(profileId: number) {
  store.profiles = store.profiles.filter((profile) => profile.id !== profileId);
  delete store.educations[profileId];
  delete store.experiences[profileId];
  delete store.languages[profileId];
  delete store.certifications[profileId];
  delete store.awards[profileId];
  delete store.expTags[profileId];
  delete store.jobCategories[profileId];
  delete store.profileLinks[profileId];
  delete store.customSkills[profileId];
  delete store.workDrivenResults[profileId];
}

export function listDemoEducations(profileId: number) {
  ensureProfile(profileId);
  return clone(getList(store.educations, profileId));
}

export function createDemoEducations(profileId: number, body: EducationRequest[]) {
  ensureProfile(profileId);
  const created = body.map((item) => ({
    id: nextSectionId("educations"),
    schoolName: item.schoolName,
    major: item.major ?? null,
    status: item.status ?? null,
    startDate: item.startDate ?? DEMO_RESUME_NOW.slice(0, 10),
    endDate: item.endDate ?? null,
    degree: item.degree ?? null,
    description: item.description ?? null,
    createdAt: now(),
    updatedAt: now(),
  }));
  replaceList(store.educations, profileId, [...getList(store.educations, profileId), ...created]);
  touchProfile(profileId);
  return clone(created);
}

export function updateDemoEducation(profileId: number, id: number, body: EducationRequest) {
  return updateSectionItem("educations", store.educations, profileId, id, {
    schoolName: body.schoolName,
    major: body.major ?? null,
    status: body.status ?? null,
    startDate: body.startDate ?? DEMO_RESUME_NOW.slice(0, 10),
    endDate: body.endDate ?? null,
    degree: body.degree ?? null,
    description: body.description ?? null,
  });
}

export function deleteDemoEducation(profileId: number, id: number) {
  deleteSectionItem(store.educations, profileId, id);
}

export function listDemoExperiences(profileId: number) {
  ensureProfile(profileId);
  return clone(getList(store.experiences, profileId));
}

export function createDemoExperiences(profileId: number, body: ExperienceRequest[]) {
  ensureProfile(profileId);
  const created = body.map((item) => ({
    id: nextSectionId("experiences"),
    companyName: item.companyName,
    department: item.department ?? null,
    position: item.position ?? null,
    startDate: item.startDate,
    endDate: item.endDate ?? null,
    isCurrent: item.isCurrent,
    description: item.description ?? null,
    createdAt: now(),
    updatedAt: now(),
  }));
  replaceList(store.experiences, profileId, [...getList(store.experiences, profileId), ...created]);
  touchProfile(profileId);
  return clone(created);
}

export function updateDemoExperience(profileId: number, id: number, body: ExperienceRequest) {
  return updateSectionItem("experiences", store.experiences, profileId, id, {
    companyName: body.companyName,
    department: body.department ?? null,
    position: body.position ?? null,
    startDate: body.startDate,
    endDate: body.endDate ?? null,
    isCurrent: body.isCurrent,
    description: body.description ?? null,
  });
}

export function deleteDemoExperience(profileId: number, id: number) {
  deleteSectionItem(store.experiences, profileId, id);
}

export function listDemoLanguages(profileId: number) {
  ensureProfile(profileId);
  return clone(getList(store.languages, profileId));
}

export function createDemoLanguages(profileId: number, body: LanguageRequest[]) {
  ensureProfile(profileId);
  const created = body.map((item) => ({
    id: nextSectionId("languages"),
    languageName: item.languageName,
    level: item.level,
    issueDate: item.issueDate,
    createdAt: now(),
    updatedAt: now(),
  }));
  replaceList(store.languages, profileId, [...getList(store.languages, profileId), ...created]);
  touchProfile(profileId);
  return clone(created);
}

export function updateDemoLanguage(profileId: number, id: number, body: LanguageRequest) {
  return updateSectionItem("languages", store.languages, profileId, id, {
    languageName: body.languageName,
    level: body.level,
    issueDate: body.issueDate,
  });
}

export function deleteDemoLanguage(profileId: number, id: number) {
  deleteSectionItem(store.languages, profileId, id);
}

export function listDemoCertifications(profileId: number) {
  ensureProfile(profileId);
  return clone(getList(store.certifications, profileId));
}

export function createDemoCertifications(profileId: number, body: CertificationRequest[]) {
  ensureProfile(profileId);
  const created = body.map((item) => ({
    id: nextSectionId("certifications"),
    name: item.name,
    issuer: item.issuer ?? null,
    issueDate: item.issueDate,
    createdAt: now(),
    updatedAt: now(),
  }));
  replaceList(store.certifications, profileId, [
    ...getList(store.certifications, profileId),
    ...created,
  ]);
  touchProfile(profileId);
  return clone(created);
}

export function updateDemoCertification(profileId: number, id: number, body: CertificationRequest) {
  return updateSectionItem("certifications", store.certifications, profileId, id, {
    name: body.name,
    issuer: body.issuer ?? null,
    issueDate: body.issueDate,
  });
}

export function deleteDemoCertification(profileId: number, id: number) {
  deleteSectionItem(store.certifications, profileId, id);
}

export function listDemoAwards(profileId: number) {
  ensureProfile(profileId);
  return clone(getList(store.awards, profileId));
}

export function createDemoAwards(profileId: number, body: AwardRequest[]) {
  ensureProfile(profileId);
  const created = body.map((item) => ({
    id: nextSectionId("awards"),
    title: item.title,
    organization: item.organization,
    awardDate: item.awardDate,
    description: item.description,
    createdAt: now(),
    updatedAt: now(),
  }));
  replaceList(store.awards, profileId, [...getList(store.awards, profileId), ...created]);
  touchProfile(profileId);
  return clone(created);
}

export function updateDemoAward(profileId: number, id: number, body: AwardRequest) {
  return updateSectionItem("awards", store.awards, profileId, id, {
    title: body.title,
    organization: body.organization,
    awardDate: body.awardDate,
    description: body.description,
  });
}

export function deleteDemoAward(profileId: number, id: number) {
  deleteSectionItem(store.awards, profileId, id);
}

export function listDemoCustomSkills(profileId: number) {
  ensureProfile(profileId);
  return clone(getList(store.customSkills, profileId));
}

export function updateDemoCustomSkills(profileId: number, body: { customSkills: string[] }) {
  ensureProfile(profileId);
  const skills = body.customSkills.map((name) => ({
    id: nextSectionId("customSkills"),
    name,
  }));
  replaceList(store.customSkills, profileId, skills);
  touchProfile(profileId);
  return clone(skills);
}

export function listDemoExpTags(profileId: number) {
  ensureProfile(profileId);
  return clone(getList(store.expTags, profileId));
}

export function updateDemoExpTags(profileId: number, body: { ids: number[] }) {
  ensureProfile(profileId);
  const tags = body.ids.map((id) => ({
    id,
    name: Object.entries(EXP_TAG_ID_MAP).find(([, value]) => value === id)?.[0] ?? `경험 ${id}`,
  }));
  replaceList(store.expTags, profileId, tags);
  touchProfile(profileId);
  return clone(tags);
}

export function listDemoJobCategories(profileId: number) {
  ensureProfile(profileId);
  return clone(getList(store.jobCategories, profileId));
}

export function updateDemoJobCategories(profileId: number, body: { ids: number[] }) {
  ensureProfile(profileId);
  const selected = body.ids.flatMap((id) => {
    const result = findJobRoleById(id);
    return result
      ? [
          { id: result.group.id, name: result.group.name },
          { id: result.role.id, name: result.role.name },
        ]
      : [{ id, name: `직무 ${id}` }];
  });
  replaceList(store.jobCategories, profileId, selected);
  touchProfile(profileId);
  return clone(selected);
}

export function listDemoProfileLinks(profileId: number) {
  ensureProfile(profileId);
  return clone(getList(store.profileLinks, profileId));
}

export function upsertDemoProfileLinks(
  profileId: number,
  type: string,
  body: Array<ProfileLinkUpsertRequest & { sortOrder?: number }>
) {
  ensureProfile(profileId);
  const incoming = body.length > 0 ? body : [];
  const existing = getList(store.profileLinks, profileId).filter((link) => link.type !== type);
  const links = incoming.map((link) => ({
    id: nextSectionId("profileLinks"),
    type: link.type || type,
    url: link.url,
    originalFilename: link.originalFilename || null,
    contentType: link.contentType || null,
    fileSize: link.fileSize ?? null,
    createdAt: now(),
    updatedAt: now(),
  }));
  replaceList(store.profileLinks, profileId, [...existing, ...links]);
  touchProfile(profileId);
  return getDemoProfile(profileId);
}

export function deleteDemoProfileLink(profileId: number, type: string) {
  ensureProfile(profileId);
  replaceList(
    store.profileLinks,
    profileId,
    getList(store.profileLinks, profileId).filter((link) => link.type !== type)
  );
  touchProfile(profileId);
}

export function buildDemoPresignResponse(
  profileId: number,
  kind: "thumbnail" | "portfolio",
  originalFilename: string
) {
  const safeFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, "-") || `${kind}.file`;
  const objectKey = `demo/profile-${profileId}/${safeFilename}`;
  const fileUrl = `/api/demo/uploads/${objectKey}`;
  return {
    uploadUrl: fileUrl,
    fileUrl,
    objectKey,
  };
}

export function storeDemoUpload(objectKey: string, body: ArrayBuffer, contentType: string) {
  uploadedFiles.set(objectKey, { body, contentType });
}

export function getDemoUpload(objectKey: string) {
  return uploadedFiles.get(objectKey) ?? null;
}

export function completeDemoThumbnailUpload(
  profileId: number,
  body: {
    objectKey: string;
    originalFilename: string;
    contentType: string;
    fileSize: number;
  }
) {
  const fileUrl = `/api/demo/uploads/${body.objectKey}`;
  const profile = ensureProfile(profileId);
  profile.storageUrl = fileUrl;
  profile.updatedAt = now();

  return {
    objectKey: body.objectKey,
    fileUrl,
  };
}

export function completeDemoPortfolioUpload(
  profileId: number,
  body: {
    objectKey: string;
    originalFilename: string;
    contentType: string;
    fileSize: number;
  }
) {
  ensureProfile(profileId);
  const fileUrl = `/api/demo/uploads/${body.objectKey}`;
  const result = {
    id: nextSectionId("profileLinks"),
    objectKey: body.objectKey,
    fileUrl,
    originalFilename: body.originalFilename,
    contentType: body.contentType,
    fileSize: body.fileSize,
    createdAt: now(),
  };

  upsertDemoProfileLinks(profileId, "PORTFOLIO", [
    {
      type: "PORTFOLIO",
      url: fileUrl,
      originalFilename: body.originalFilename,
      contentType: body.contentType,
      fileSize: body.fileSize,
    },
  ]);

  return clone(result);
}

export function getDemoWorkDrivenResult(profileId: number) {
  ensureProfile(profileId);
  return clone(store.workDrivenResults[profileId] ?? null);
}

export function submitDemoWorkDrivenResult(profileId: number, body: WorkDrivenTestSubmitRequest) {
  ensureProfile(profileId);
  const totalScore = body.answers.reduce((sum, answer) => sum + answer.score, 0);
  store.workDrivenResults[profileId] = {
    totalScore,
    averageScore: body.answers.length > 0 ? totalScore / body.answers.length : 0,
    level: Math.max(1, Math.min(5, Math.round(totalScore / Math.max(body.answers.length, 1)))),
    testedAt: now(),
    questionScores: body.answers.map((answer, index) => ({
      questionId: answer.questionId,
      orderIndex: index + 1,
      score: answer.score,
    })),
  };
  touchProfile(profileId);
}
