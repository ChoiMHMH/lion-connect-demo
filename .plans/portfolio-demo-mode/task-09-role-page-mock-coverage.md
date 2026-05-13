# T09 - Role Page Mock Coverage

> depends on: T08

## 보장할 동작

인재용, 기업용, 관리자용 주요 페이지가 서버 종료 상태에서도 `/api/demo` mock response로 깨지지 않고 표시된다.

## 선행 테스트 / 선행 검증

- `rg -n "fetchPublicJobPostings|fetchJobPostings|fetchTalents|getTalentDetail|getMyJobApplications|fetchAdmin" app hooks lib services`
- 각 페이지가 기대하는 response shape 확인

## 작업

- 공개 채용공고 목록/상세 API를 mock한다.
- 내 지원 현황 목록, 지원/취소 최소 mutation을 mock한다.
- 기업 채용공고 목록/상세/지원자 목록 API를 mock한다.
- 인재 검색/상세 API를 mock한다.
- 관리자 users/companies/job-postings/applications/inquiries 목록 API를 mock한다.
- 누락 API로 페이지 오류가 발생하면 우선순위에 따라 handler를 보강한다.
- 사람 이미지는 initials/avatar placeholder, 기업 로고는 mock placeholder로 처리한다.

## 완료 기준

- 인재용: `/dashboard`, `/dashboard/job-board`, `/dashboard/applications`가 mock data로 표시된다.
- 기업용: `/talents`, `/talents/1`, `/jobs`, `/jobs/1/applicants`가 mock data로 표시된다.
- 관리자용: `/admin/inquiries`, `/admin/users`, `/admin/companies`, `/admin/applications`가 mock data로 표시된다.
- 컴포넌트 직접 mock import가 없다.

## 커밋

- `feat: add demo mock coverage for role pages`
