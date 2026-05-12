# 🦁 Lion Connect

> 멋쟁이사자처럼 수료생과 중소기업을 연결하는 채용 플랫폼 MVP (실제 수료생 데이터는 개인정보 보호를 위해 목데이터로 바꾼 스크린샷으로 대체했습니다.)

## 포트폴리오 데모 모드

이 저장소는 운영 서버가 종료된 LionConnect MVP를 포트폴리오 검토용으로 보존한 아카이브입니다. `feat-19-portfolio-demo-mode` 브랜치에서는 실제 로그인, 회원가입, 운영 API 서버, 외부 DB 저장 없이 Next.js Route Handler 기반 Mock API로 핵심 화면 흐름을 확인할 수 있습니다.

### 실행

```bash
cp .env.example .env.local
npm install
npm run dev
```

- 로컬 기본 주소: `http://localhost:3000`
- 데모 허브: `http://localhost:3000/demo`
- 이력서 저장 플로우: `/demo/enter/talent?returnTo=/dashboard/profile/1`
- 기업 데모: `/demo/enter/company`
- 관리자 데모: `/demo/enter/admin`
- 기술 노트: `/demo/dev-notes`

`.env.example`은 공개 저장소에 남겨도 되는 데모 값만 포함합니다. 실제 운영 서버 주소, 실제 토큰, 비공개 키, 개인 식별 정보는 추가하지 않습니다. 개발 서버 포트를 바꾸는 경우 `NEXT_PUBLIC_BASE_URL`과 `NEXT_PUBLIC_API_BASE_URL`의 포트도 함께 맞춥니다.

### 데모에서 확인할 수 있는 것

- **RBAC**: 데모 role 진입 시 `user-roles` 쿠키와 클라이언트 auth store가 함께 설정되어 기존 `middleware.ts` 보호 라우트를 통과합니다.
- **API 호출 계층**: Page/Component -> hook/query/mutation -> domain API -> `apiClient`/`serverApiClient` -> `constants/api.ts` -> `/api/demo` Route Handler 흐름을 유지합니다. 컴포넌트가 mock 데이터를 직접 import하지 않습니다.
- **Mock API**: 이력서, 채용공고, 인재 검색, 기업/관리자 주요 목록은 기존 endpoint path를 유지한 채 `/api/demo` 아래에서 응답합니다. 우측 하단 `Demo API Log` 패널에서 method/path/status를 확인할 수 있습니다.
- **이력서 저장 흐름**: `/dashboard/profile/1`에서 기본 정보, 학력, 경력 등 섹션 저장과 마지막 profile status 전환을 기존 제출 흐름으로 확인합니다.
- **인증 CTA 차단**: 로그인, 회원가입, 시작하기 CTA는 실제 인증 입력 화면이나 실제 인증 요청으로 이어지지 않고 서버 종료 안내 또는 `/demo`로 유도됩니다.

### 저장과 초기화 정책

데모는 외부 DB, Firebase, Supabase, 실제 운영 서버 저장소를 사용하지 않습니다.

- demo accessToken은 실제 토큰이 아닌 `demo-access-token-*` 형식의 클라이언트 식별값입니다.
- 데모 인증 상태, API 로그, 이력서 mock 상태는 브라우저 `localStorage`와 `sessionStorage`에만 남습니다.
- Route Handler mock store는 서버 프로세스 메모리에만 존재하므로 배포 환경이나 새 프로세스에서는 유지가 보장되지 않습니다.
- `/demo`의 `데모 데이터 초기화` 버튼은 demo auth 쿠키, `auth-store`, `lion-connect-demo-api-log`, `lion-connect-demo-resume-store`, `lion-connect-demo-guide-seen`을 정리합니다.
- 브라우저 DevTools에서 위 storage key를 삭제하거나 `.env.local`을 다시 생성해도 같은 초기 상태로 검토할 수 있습니다.

### 데모 이미지와 자산 정책

새 외부 인물 사진, 실제 기업 로고, 출처 불명 이미지는 추가하지 않습니다. 필요 시 아래 경로에 placeholder만 두고 README 또는 PR 본문에 출처와 용도를 남깁니다.

| 선택 경로 | 권장 사이즈 | 용도 |
| --- | --- | --- |
| `public/demo/assets/talent-avatar.png` | 512x512 PNG | 인재 프로필 placeholder |
| `public/demo/assets/company-logo.png` | 512x512 PNG 또는 2:1 PNG | 기업 로고 placeholder |
| `public/demo/loading.gif` | 320x180 GIF 이하 | 데모 로딩 placeholder |

현재 T10 문서 작업에서는 새 이미지 파일을 추가하지 않습니다. 화면은 기존 public 자산과 initials/icon 기반 placeholder를 우선 사용합니다.

### 검증 명령

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

T10 문서/환경 예시 변경의 선행 검증은 `sed -n '1,260p' README.md`, `find . -maxdepth 2 -name '.env*' -print`, `find public -maxdepth 3 -type f | sort`로 수행했습니다.

<img width="100%" alt="Lion Connect" src="https://github.com/user-attachments/assets/2a2648d7-cbc9-4e2b-afc9-9b729aa9c105" />

![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.90.5-FF4154)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **기간** | 2025.11 - 12 (2개월) |
| **팀 구성** | 초기 FE 2, BE 2, Des 1, PM 1 → 최종 FE 1, BE 1, Des 1, PM 1 |
| **역할** | 프론트엔드 개발 |
| **성과** | 역대 15개 팀 중 최초 계약 연장 · 배포 첫 주 6개 기업, 39명 가입 |

---

## 주요 페이지

| 페이지 | 설명 |
|--------|------|
| **랜딩** `/` | 기업 대상 서비스 소개 및 CTA |
| **회원가입** `/signup` | 일반/기업/수료생 3가지 유형별 회원가입 |
| **인재 프로필** `/dashboard/profile/[id]` | 14섹션 · 40+ input 대규모 폼 (임시저장/최종제출) |
| **채용 공고** `/jobs` | 기업 공고 등록/수정/관리 |
| **인재 검색** `/talents` | 직무/경험/스킬 필터링, 뱃지 시스템 |
| **관리자** `/admin` | 회원/기업/공고/지원현황 관리 |

---

## 페이지 스크린샷
📌 스크린샷의 이름, 연락처 등 개인정보는 실제 서비스 데이터 보호를 위해 목데이터로 대체하였습니다.
### 랜딩

<table>
  <tr>
    <td><strong>랜딩</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="랜딩" src="https://github.com/user-attachments/assets/aedb6b13-c120-4c40-b173-067e67f21710" /></td>
  </tr>
</table>

### 회원가입

<table>
  <tr>
    <td><strong>인재용 회원가입</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="인재용 회원가입" src="https://github.com/user-attachments/assets/ebd0dff5-a3d7-4ea2-a66a-555239ac0960" /></td>
  </tr>
  <tr>
    <td><strong>기업용 회원가입</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="기업용 회원가입" src="https://github.com/user-attachments/assets/9d27df02-ccee-471b-961e-3ff778d90ae5" /></td>
  </tr>
</table>

### 인재용 페이지

<table>
  <tr>
    <td><strong>랜딩 (채용공고 리스팅)</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="인재용 랜딩" src="https://github.com/user-attachments/assets/c42ac86d-f010-44ab-8bda-6808e868ecbc" /></td>
  </tr>
  <tr>
    <td><strong>채용공고 상세</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="채용공고 상세" src="https://github.com/user-attachments/assets/8016cf06-e8bf-48ee-b326-3d9bcc0bd167" /></td>
  </tr>
  <tr>
    <td><strong>내 이력서 리스트</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="이력서 리스트" src="https://github.com/user-attachments/assets/0a9f2340-3aeb-4e93-a167-d8b3bbdabc28" /></td>
  </tr>
  <tr>
    <td><strong>이력서 상세(이력서 작성 및 수정)</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="이력서 상세" src="https://github.com/user-attachments/assets/5a8ff526-3bcb-4caa-ba2c-895be95bc59a" /></td>
  </tr>
  <tr>
    <td><strong>내 지원현황</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="지원현황" src="https://github.com/user-attachments/assets/4f727dd3-2356-4a07-834c-d4233da5bcad" /></td>
  </tr>
</table>


### 기업용 페이지

<table>
  <tr>
    <td><strong>랜딩</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="기업용 랜딩" src="https://github.com/user-attachments/assets/aedb6b13-c120-4c40-b173-067e67f21710" /></td>
  </tr>
  <tr>
    <td><strong>채용공고 리스트</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="채용공고 리스트" src="https://github.com/user-attachments/assets/6c8866b6-7bd0-4f60-a24d-0adfb7d8510b" /></td>
  </tr>
  <tr>
    <td><strong>채용공고 입력폼</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="채용공고 입력폼" src="https://github.com/user-attachments/assets/84747a72-b5f7-4a18-a67a-6c013e750ce9" /></td>
  </tr>
</table>



### 관리자 대시보드

<table>
  <tr>
    <td><strong>기업 문의 리스팅</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="기업 문의 리스팅" src="https://github.com/user-attachments/assets/c26bbb7a-8c63-4487-abd0-159eff3d0e14" /></td>
  </tr>
  <tr>
    <td><strong>사용자 계정 관리</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="사용자 계정 관리" src="https://github.com/user-attachments/assets/cedd5a8f-c16f-4f9e-9e9d-0e17573a9dc2" /></td>
  </tr>
  <tr>
    <td><strong>기업 계정 관리</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="기업 계정 관리" src="https://github.com/user-attachments/assets/dfe277ce-14ed-4851-8fde-307834d7551c" /></td>
  </tr>
  <tr>
    <td><strong>지원현황 트래킹 1</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="지원현황 트래킹 1" src="https://github.com/user-attachments/assets/193e7a09-ca5c-4ab3-9005-4c67a91828d4" /></td>
  </tr>
  <tr>
    <td><strong>지원현황 트래킹 2</strong></td>
  </tr>
  <tr>
    <td><img width="600" alt="지원현황 트래킹 2" src="https://github.com/user-attachments/assets/37736655-0fae-465b-b5d7-04c51c9c3b76" /></td>
  </tr>
</table>

---

## 기술적 의사결정

| 결정 | 선택 | 이유 |
|------|------|------|
| **렌더링** | CSR 중심 + SEO 필요 시 SSR | 대부분 로그인 필수 페이지, MVP 1개월 시간 제약 |
| **API 구조** | 3계층 (Constants → Client → Domain) | 137개 API 단독 관리, 엔드포인트 변경 시 수정 1파일 |
| **인증 저장** | accessToken 메모리 + refreshToken HttpOnly | XSS 방어 |
| **토큰 갱신** | Promise 캐싱 | 동시 401 발생 시 갱신 1회로 통합 |
| **폼 제출** | 순차 → 병렬 → 후처리 3단계 | 파일 업로드(순서 의존) + CRUD(독립) + 상태 전환 분리 |
| **권한 제어** | middleware.ts RBAC | 32개 페이지 권한을 선언적 배열 한 곳에서 관리 |

---

## 프로젝트 구조

<pre>
lion-connect-frontend/
├── app/
│   ├── (auth)/          # 인증 (로그인/회원가입)
│   ├── (company)/       # 기업 (공고/인재검색)
│   ├── admin/           # 관리자
│   └── dashboard/       # 인재 (프로필/지원)
├── components/          # 재사용 UI
├── hooks/               # 커스텀 훅
├── lib/
│   ├── apiClient.ts     # 중앙 API 클라이언트
│   └── api/             # 도메인별 API 함수
├── types/               # TypeScript 타입 (150+)
├── store/               # Zustand (auth, toast)
├── schemas/             # Zod 검증 스키마
├── constants/           # API 엔드포인트 (137개)
├── middleware.ts         # RBAC 접근 제어
└── HANDOVER.md          # 인수인계 문서 (284줄)
</pre>

---

## 기술 스택

**Core** · Next.js 15.5.7 · React 19.1.2 · TypeScript 5 · Turbopack

**상태 관리** · Zustand 5.0.8 · TanStack Query 5.90.5

**폼/검증** · React Hook Form 7.65.0 · Zod 4.1.12

**UI** · Tailwind CSS 4 · shadcn/ui · Framer Motion 12.23.24
