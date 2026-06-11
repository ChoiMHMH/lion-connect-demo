import { JOB_GROUPS } from "@/constants/jobMapping";
import type { DemoResumeSnapshot } from "@/lib/demo/resumeStore";
import type { TalentListItem } from "@/lib/api/talents";
import type { TalentDetailResponse } from "@/types/talent";

/**
 * 이력서(resumeStore)를 인재 탐색(roleStore)의 talent로 합성하는 어댑터.
 *
 * - thumbnail/연락처/tendencies 등 이력서에 없는 값은 base(seed talent)를 유지한다.
 * - 이름·소개·직군·스킬·학력·경력 등 이력서 수정 대상은 snapshot 값으로 덮어쓴다.
 * - roleStore가 이 어댑터를 단방향으로 사용한다(순환 의존 없음).
 */

const ROLE_NAMES = new Set(JOB_GROUPS.flatMap((group) => group.roles.map((role) => role.name)));

/** jobCategories는 [직군, 직무]가 섞여 들어오므로 직무명만 추출한다. */
function resumeJobRoles(snapshot: DemoResumeSnapshot): string[] {
  const roles = snapshot.jobCategories
    .filter((category) => ROLE_NAMES.has(category.name))
    .map((category) => category.name);
  return Array.from(new Set(roles));
}

function resumeSkills(snapshot: DemoResumeSnapshot): string[] {
  return snapshot.customSkills.map((skill) => skill.name);
}

function resumeLanguageLabels(snapshot: DemoResumeSnapshot): string[] {
  return snapshot.languages.map((language) =>
    [language.languageName, language.level].filter(Boolean).join(" ").trim()
  );
}

export function applyResumeToTalentListItem(
  base: TalentListItem,
  snapshot: DemoResumeSnapshot
): TalentListItem {
  const roles = resumeJobRoles(snapshot);
  const primaryEducation = snapshot.educations[0];

  return {
    ...base,
    name: snapshot.profile.name,
    introduction: snapshot.profile.introduction,
    jobRoles: roles.length > 0 ? roles : base.jobRoles,
    skills: resumeSkills(snapshot),
    education: primaryEducation
      ? { schoolName: primaryEducation.schoolName, major: primaryEducation.major ?? "" }
      : base.education,
    workDrivenLevel: snapshot.workDrivenResult?.level ?? base.workDrivenLevel,
  };
}

export function applyResumeToTalentDetail(
  base: TalentDetailResponse,
  snapshot: DemoResumeSnapshot
): TalentDetailResponse {
  const roles = resumeJobRoles(snapshot);

  return {
    ...base,
    name: snapshot.profile.name,
    title: snapshot.profile.title,
    introduction: snapshot.profile.introduction,
    jobRoles: roles.length > 0 ? roles : base.jobRoles,
    skills: resumeSkills(snapshot),
    languages: resumeLanguageLabels(snapshot),
    educations: snapshot.educations,
    workExperiences: snapshot.experiences,
    certifications: snapshot.certifications,
    awards: snapshot.awards,
    languageDetails: snapshot.languages,
    workDrivenLevel: snapshot.workDrivenResult?.level ?? base.workDrivenLevel,
    updatedAt: snapshot.profile.updatedAt,
  };
}
