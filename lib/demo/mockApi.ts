import {
  buildDemoPresignResponse,
  completeDemoPortfolioUpload,
  completeDemoThumbnailUpload,
  createDemoAwards,
  createDemoCertifications,
  createDemoEducations,
  createDemoExperiences,
  createDemoLanguages,
  createDemoProfile,
  deleteDemoAward,
  deleteDemoCertification,
  deleteDemoEducation,
  deleteDemoExperience,
  deleteDemoLanguage,
  deleteDemoProfile,
  deleteDemoProfileLink,
  getDemoProfile,
  getDemoUpload,
  getDemoWorkDrivenResult,
  listDemoAwards,
  listDemoCertifications,
  listDemoCustomSkills,
  listDemoEducations,
  listDemoExperiences,
  listDemoExpTags,
  listDemoJobCategories,
  listDemoLanguages,
  listDemoProfileLinks,
  listDemoProfiles,
  storeDemoUpload,
  submitDemoWorkDrivenResult,
  updateDemoAward,
  updateDemoCertification,
  updateDemoCustomSkills,
  updateDemoEducation,
  updateDemoExpTags,
  updateDemoExperience,
  updateDemoJobCategories,
  updateDemoLanguage,
  updateDemoProfile,
  upsertDemoProfileLinks,
} from "@/lib/demo/resumeStore";
import {
  applyDemoJob,
  buildDemoCompanyJobImagePresigns,
  cancelDemoApplication,
  completeDemoCompanyJobImageUpload,
  createDemoCompanyJobPosting,
  createDemoInquiry,
  deleteDemoCompanyJobPosting,
  getDemoCompanyJobPosting,
  getDemoPublicJobPosting,
  getDemoTalent,
  listDemoAdminCompanies,
  listDemoAdminUsers,
  listDemoApplicants,
  listDemoApplications,
  listDemoCompanyJobPostings,
  listDemoInquiries,
  listDemoPublicJobPostings,
  listDemoTalents,
  publishDemoCompanyJobPosting,
  setDemoAdminRole,
  setDemoAdminUserLocked,
  setDemoCompanyLocked,
  unpublishDemoCompanyJobPosting,
  updateDemoCompanyJobPosting,
  updateDemoTalentThumbnail,
  updateDemoInquiryStatus,
} from "@/lib/demo/roleStore";
import type {
  ImageUploadCompleteRequest,
  JobPostingRequest,
  PresignBulkRequest,
} from "@/types/job";
import type {
  AwardRequest,
  CertificationRequest,
  EducationRequest,
  ExperienceRequest,
  LanguageRequest,
  PortfolioPresignRequest,
  ProfileLinkUpsertRequest,
  ProfileRequest,
  ThumbnailPresignRequest,
  WorkDrivenTestSubmitRequest,
} from "@/types/talent";
import type { CreateInquiryRequest, InquiryStatus } from "@/types/inquiry";

type DemoHandlerContext = {
  method: string;
  path: string;
  segments: string[];
  searchParams: URLSearchParams;
  request: Request;
};

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function noContentResponse() {
  return new Response(null, { status: 204 });
}

function errorResponse(message: string, status = 404) {
  return jsonResponse({ message, code: status === 404 ? "NOT_FOUND" : "DEMO_API_ERROR" }, status);
}

async function readJson<T>(request: Request): Promise<T> {
  const text = await request.text();
  return (text ? JSON.parse(text) : {}) as T;
}

function getProfileId(searchParams: URLSearchParams) {
  const raw = searchParams.get("profileId");
  const profileId = raw ? Number(raw) : NaN;
  if (!Number.isFinite(profileId) || profileId <= 0) {
    throw new Error("profileId is required");
  }
  return profileId;
}

function parseId(value: string | undefined, label: string) {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`${label} is required`);
  }
  return id;
}

async function handleProfileRoutes(context: DemoHandlerContext) {
  const { method, path, segments, searchParams, request } = context;

  if (path === "/profile") {
    if (method === "GET") return jsonResponse(listDemoProfiles());
    return errorResponse(`Unsupported method ${method} for ${path}`, 405);
  }

  if (path === "/profile/me") {
    if (method === "POST") {
      return jsonResponse(createDemoProfile(await readJson<ProfileRequest>(request)), 201);
    }

    const profileId = getProfileId(searchParams);
    if (method === "GET") return jsonResponse(getDemoProfile(profileId));
    if (method === "PUT") {
      return jsonResponse(updateDemoProfile(profileId, await readJson<ProfileRequest>(request)));
    }
    if (method === "DELETE") {
      deleteDemoProfile(profileId);
      return noContentResponse();
    }
  }

  if (segments[0] !== "profile") {
    return null;
  }

  const profileIdFromPath = Number(segments[1]);
  if (Number.isFinite(profileIdFromPath)) {
    return handleProfileAssetRoutes(context, profileIdFromPath);
  }

  return null;
}

async function handleProfileAssetRoutes(context: DemoHandlerContext, profileId: number) {
  const { method, segments, request } = context;
  const resource = segments[2];

  if (resource === "links") {
    if (segments.length === 3 && method === "GET") {
      return jsonResponse(listDemoProfileLinks(profileId));
    }

    const type = segments[3];
    if (!type) return null;

    if (method === "PUT" || method === "POST") {
      const body =
        await readJson<Array<ProfileLinkUpsertRequest & { sortOrder?: number }>>(request);
      return jsonResponse(upsertDemoProfileLinks(profileId, type, body));
    }
    if (method === "DELETE") {
      deleteDemoProfileLink(profileId, type);
      return noContentResponse();
    }
  }

  if (resource === "thumbnail") {
    if (segments[3] === "presign" && method === "POST") {
      const body = await readJson<ThumbnailPresignRequest>(request);
      return jsonResponse(
        buildDemoPresignResponse(profileId, "thumbnail", body.originalFilename),
        201
      );
    }
    if (segments.length === 3 && method === "POST") {
      const result = completeDemoThumbnailUpload(
        profileId,
        await readJson<{
          objectKey: string;
          originalFilename: string;
          contentType: string;
          fileSize: number;
        }>(request)
      );
      updateDemoTalentThumbnail(profileId, result.fileUrl);
      return jsonResponse(result, 201);
    }
  }

  if (resource === "portfolio") {
    if (segments[3] === "presign" && method === "POST") {
      const body = await readJson<PortfolioPresignRequest>(request);
      return jsonResponse(
        buildDemoPresignResponse(profileId, "portfolio", body.originalFilename),
        201
      );
    }
    if (segments.length === 3 && method === "POST") {
      return jsonResponse(
        completeDemoPortfolioUpload(
          profileId,
          await readJson<{
            objectKey: string;
            originalFilename: string;
            contentType: string;
            fileSize: number;
          }>(request)
        ),
        201
      );
    }
  }

  return null;
}

async function handleArraySectionRoutes(context: DemoHandlerContext) {
  const { method, path, segments, searchParams, request } = context;
  const profileId = getProfileId(searchParams);

  if (path === "/profile/educations") {
    if (method === "GET") return jsonResponse(listDemoEducations(profileId));
    if (method === "POST") {
      return jsonResponse(
        createDemoEducations(profileId, await readJson<EducationRequest[]>(request)),
        201
      );
    }
  }
  if (segments[0] === "profile" && segments[1] === "educations") {
    const itemId = parseId(segments[2], "item id");
    if (method === "PUT") {
      return jsonResponse(
        updateDemoEducation(profileId, itemId, await readJson<EducationRequest>(request))
      );
    }
    if (method === "DELETE") {
      deleteDemoEducation(profileId, itemId);
      return noContentResponse();
    }
  }

  if (path === "/profile/experiences") {
    if (method === "GET") return jsonResponse(listDemoExperiences(profileId));
    if (method === "POST") {
      return jsonResponse(
        createDemoExperiences(profileId, await readJson<ExperienceRequest[]>(request)),
        201
      );
    }
  }
  if (segments[0] === "profile" && segments[1] === "experiences") {
    const itemId = parseId(segments[2], "item id");
    if (method === "PUT") {
      return jsonResponse(
        updateDemoExperience(profileId, itemId, await readJson<ExperienceRequest>(request))
      );
    }
    if (method === "DELETE") {
      deleteDemoExperience(profileId, itemId);
      return noContentResponse();
    }
  }

  if (path === "/profile/languages") {
    if (method === "GET") return jsonResponse(listDemoLanguages(profileId));
    if (method === "POST") {
      return jsonResponse(
        createDemoLanguages(profileId, await readJson<LanguageRequest[]>(request)),
        201
      );
    }
  }
  if (segments[0] === "profile" && segments[1] === "languages") {
    const itemId = parseId(segments[2], "item id");
    if (method === "PUT") {
      return jsonResponse(
        updateDemoLanguage(profileId, itemId, await readJson<LanguageRequest>(request))
      );
    }
    if (method === "DELETE") {
      deleteDemoLanguage(profileId, itemId);
      return noContentResponse();
    }
  }

  if (path === "/profile/certifications") {
    if (method === "GET") return jsonResponse(listDemoCertifications(profileId));
    if (method === "POST") {
      return jsonResponse(
        createDemoCertifications(profileId, await readJson<CertificationRequest[]>(request)),
        201
      );
    }
  }
  if (segments[0] === "profile" && segments[1] === "certifications") {
    const itemId = parseId(segments[2], "item id");
    if (method === "PUT") {
      return jsonResponse(
        updateDemoCertification(profileId, itemId, await readJson<CertificationRequest>(request))
      );
    }
    if (method === "DELETE") {
      deleteDemoCertification(profileId, itemId);
      return noContentResponse();
    }
  }

  if (path === "/profile/awards") {
    if (method === "GET") return jsonResponse(listDemoAwards(profileId));
    if (method === "POST") {
      return jsonResponse(
        createDemoAwards(profileId, await readJson<AwardRequest[]>(request)),
        201
      );
    }
  }
  if (segments[0] === "profile" && segments[1] === "awards") {
    const itemId = parseId(segments[2], "item id");
    if (method === "PUT") {
      return jsonResponse(
        updateDemoAward(profileId, itemId, await readJson<AwardRequest>(request))
      );
    }
    if (method === "DELETE") {
      deleteDemoAward(profileId, itemId);
      return noContentResponse();
    }
  }

  return null;
}

async function handleChoiceSectionRoutes(context: DemoHandlerContext) {
  const { method, path, searchParams, request } = context;
  const profileId = getProfileId(searchParams);

  if (path === "/profile/custom-skills") {
    if (method === "GET") return jsonResponse(listDemoCustomSkills(profileId));
    if (method === "PUT") {
      return jsonResponse(
        updateDemoCustomSkills(profileId, await readJson<{ customSkills: string[] }>(request))
      );
    }
  }

  if (path === "/profile/exp-tags") {
    if (method === "GET") return jsonResponse(listDemoExpTags(profileId));
    if (method === "PUT") {
      return jsonResponse(updateDemoExpTags(profileId, await readJson<{ ids: number[] }>(request)));
    }
  }

  if (path === "/profile/job-categories-with-groups") {
    if (method === "GET") return jsonResponse(listDemoJobCategories(profileId));
  }

  if (path === "/profile/job-categories" && method === "PUT") {
    return jsonResponse(
      updateDemoJobCategories(profileId, await readJson<{ ids: number[] }>(request))
    );
  }

  if (path === "/profile/work-driven/result" && method === "GET") {
    return jsonResponse(getDemoWorkDrivenResult(profileId));
  }

  if (path === "/profile/work-driven/submit" && method === "POST") {
    submitDemoWorkDrivenResult(profileId, await readJson<WorkDrivenTestSubmitRequest>(request));
    return noContentResponse();
  }

  return null;
}

async function handleRolePageRoutes(context: DemoHandlerContext) {
  const { method, path, segments, searchParams, request } = context;

  if (path === "/job-postings" && method === "GET") {
    return jsonResponse(listDemoPublicJobPostings(searchParams));
  }

  if (segments[0] === "job-postings" && segments[2] === "apply" && method === "POST") {
    const jobId = parseId(segments[1], "job posting id");
    const body = await readJson<{ talentProfileId: number }>(request);
    return jsonResponse(applyDemoJob(jobId, body.talentProfileId), 201);
  }

  if (segments[0] === "job-postings" && segments.length === 2 && method === "GET") {
    return jsonResponse(getDemoPublicJobPosting(parseId(segments[1], "job posting id")));
  }

  if (path === "/me/job-applications" && method === "GET") {
    return jsonResponse(listDemoApplications(searchParams));
  }

  if (
    segments[0] === "me" &&
    segments[1] === "job-applications" &&
    segments[3] === "cancel" &&
    method === "PATCH"
  ) {
    cancelDemoApplication(parseId(segments[2], "job application id"));
    return noContentResponse();
  }

  if (path === "/profiles/search" && method === "GET") {
    return jsonResponse(listDemoTalents(searchParams));
  }

  if (segments[0] === "profiles" && segments.length === 2 && method === "GET") {
    return jsonResponse(getDemoTalent(parseId(segments[1], "profile id")));
  }

  if (path === "/company/job-postings/me" && method === "GET") {
    return jsonResponse(listDemoCompanyJobPostings(searchParams));
  }

  if (path === "/company/job-postings/images/presign-bulk" && method === "POST") {
    return jsonResponse(
      buildDemoCompanyJobImagePresigns(await readJson<PresignBulkRequest>(request)),
      201
    );
  }

  if (path === "/company/job-postings/images" && method === "POST") {
    return jsonResponse(
      completeDemoCompanyJobImageUpload(await readJson<ImageUploadCompleteRequest>(request)),
      201
    );
  }

  if (path === "/company/job-postings" && method === "POST") {
    return jsonResponse(
      createDemoCompanyJobPosting(await readJson<JobPostingRequest>(request)),
      201
    );
  }

  if (
    segments[0] === "company" &&
    segments[1] === "job-postings" &&
    segments[3] === "applications" &&
    method === "GET"
  ) {
    return jsonResponse(listDemoApplicants(searchParams));
  }

  if (
    segments[0] === "company" &&
    segments[1] === "job-postings" &&
    segments.length === 3 &&
    method === "GET"
  ) {
    return jsonResponse(getDemoCompanyJobPosting(parseId(segments[2], "job posting id")));
  }

  if (
    segments[0] === "company" &&
    segments[1] === "job-postings" &&
    segments.length === 3 &&
    method === "PUT"
  ) {
    return jsonResponse(
      updateDemoCompanyJobPosting(
        parseId(segments[2], "job posting id"),
        await readJson<JobPostingRequest>(request)
      )
    );
  }

  if (
    segments[0] === "company" &&
    segments[1] === "job-postings" &&
    segments.length === 3 &&
    method === "DELETE"
  ) {
    deleteDemoCompanyJobPosting(parseId(segments[2], "job posting id"));
    return noContentResponse();
  }

  if (
    segments[0] === "company" &&
    segments[1] === "job-postings" &&
    segments[3] === "publish" &&
    method === "PATCH"
  ) {
    return jsonResponse(publishDemoCompanyJobPosting(parseId(segments[2], "job posting id")));
  }

  if (
    segments[0] === "company" &&
    segments[1] === "job-postings" &&
    segments[3] === "unpublish" &&
    method === "PATCH"
  ) {
    return jsonResponse(unpublishDemoCompanyJobPosting(parseId(segments[2], "job posting id")));
  }

  if (path === "/admin/users" && method === "GET") {
    return jsonResponse(listDemoAdminUsers(searchParams));
  }

  if (
    segments[0] === "admin" &&
    segments[1] === "users" &&
    (segments[3] === "lock" || segments[3] === "unlock") &&
    method === "POST"
  ) {
    return jsonResponse(
      setDemoAdminUserLocked(parseId(segments[2], "user id"), segments[3] === "lock")
    );
  }

  if (segments[0] === "users" && segments[2] === "roles") {
    setDemoAdminRole(parseId(segments[1], "user id"), method === "POST");
    return noContentResponse();
  }

  if (path === "/admin/companies" && method === "GET") {
    return jsonResponse(listDemoAdminCompanies(searchParams));
  }

  if (
    segments[0] === "admin" &&
    segments[1] === "companies" &&
    (segments[3] === "lock" || segments[3] === "unlock") &&
    method === "POST"
  ) {
    return jsonResponse(
      setDemoCompanyLocked(parseId(segments[2], "company id"), segments[3] === "lock")
    );
  }

  if (path === "/admin/inquiries" && method === "GET") {
    return jsonResponse(listDemoInquiries(searchParams));
  }

  if (path === "/inquiries" && method === "POST") {
    return jsonResponse(createDemoInquiry(await readJson<CreateInquiryRequest>(request)), 201);
  }

  if (
    segments[0] === "admin" &&
    segments[1] === "inquiries" &&
    segments[3] === "status" &&
    method === "PATCH"
  ) {
    const body = await readJson<{ status: InquiryStatus }>(request);
    updateDemoInquiryStatus(parseId(segments[2], "inquiry id"), body.status);
    return noContentResponse();
  }

  if (path === "/admin/job-postings" && method === "GET") {
    return jsonResponse(listDemoPublicJobPostings(searchParams));
  }

  if (
    segments[0] === "admin" &&
    segments[1] === "job-postings" &&
    segments[3] === "applications" &&
    method === "GET"
  ) {
    return jsonResponse(listDemoApplicants(searchParams));
  }

  return null;
}

export async function handleDemoApiRequest(request: Request, pathSegments: string[]) {
  const url = new URL(request.url);
  const segments = pathSegments.filter(Boolean);
  const path = `/${segments.join("/")}`;
  const context: DemoHandlerContext = {
    method: request.method.toUpperCase(),
    path,
    segments,
    searchParams: url.searchParams,
    request,
  };

  try {
    if (segments[0] === "uploads") {
      const objectKey = segments.slice(1).join("/");

      if (!objectKey) {
        return errorResponse("Upload object key is required", 400);
      }

      if (context.method === "PUT") {
        storeDemoUpload(
          objectKey,
          await request.arrayBuffer(),
          request.headers.get("content-type") || "application/octet-stream"
        );
        return noContentResponse();
      }

      if (context.method === "GET") {
        const upload = getDemoUpload(objectKey);
        if (!upload) return errorResponse("Demo upload was not found", 404);
        return new Response(upload.body.slice(0), {
          status: 200,
          headers: {
            "Content-Type": upload.contentType,
            "Cache-Control": "no-store",
          },
        });
      }
    }

    const profileResponse = await handleProfileRoutes(context);
    if (profileResponse) return profileResponse;

    const rolePageResponse = await handleRolePageRoutes(context);
    if (rolePageResponse) return rolePageResponse;

    if (segments[0] === "profile") {
      const arraySectionResponse = await handleArraySectionRoutes(context);
      if (arraySectionResponse) return arraySectionResponse;

      const choiceSectionResponse = await handleChoiceSectionRoutes(context);
      if (choiceSectionResponse) return choiceSectionResponse;
    }

    return errorResponse(`No demo API handler for ${context.method} ${path}`, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Demo API request failed";
    const status = message.includes("not found") || message.includes("was not found") ? 404 : 400;
    return errorResponse(message, status);
  }
}
