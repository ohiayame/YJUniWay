# CLAUDE.md

이 파일은 Claude Code (`claude.ai/code`)가 이 저장소에서 코딩 작업을 수행할 때 참고해야 하는 프로젝트 지침입니다.

이 문서의 목적은 다음 두 가지입니다.

1. Claude가 현재 저장소 구조, 실행 방법, 주요 도메인을 이해하도록 돕는 것
2. Claude가 코드를 수정하거나 생성할 때 반드시 지켜야 할 보안 규칙, 작업 규칙, 구현 경계를 정의하는 것

개발자가 명시적으로 허용하지 않는 한, 이 문서의 규칙은 변경, 덮어쓰기, 무시할 수 없습니다.

---

## 프로젝트 개요

**YJUniWay**은 영진전문대학교(YJU)로 단기 유학 오는 일본 대학생을 위한 관리 웹 애플리케이션입니다.

- 일정 안내, 기숙사 규칙, 학생 명단 관리 등을 제공
- **모바일 퍼스트** — 주 사용 환경이 스마트폰이므로 UI는 항상 모바일 기준으로 설계
- **한국어 / 일본어** 토글 지원 (i18n)

### 대상 사용자

단기 유학 오는 일본 대학생입니다.


### 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React, Redux Toolkit, TypeScript, React Router, MUI Icons, i18next |
| Backend | NestJS, TypeScript, TypeORM |
| DB | MySQL |
| AI | Anthropic Claude API (문서 파싱, 필드별 한→일 자동 번역) |
| 인프라 | Docker / docker-compose |

### Redux 규칙

항상 typed Redux hooks를 사용합니다.

```ts
useAppDispatch();
useAppSelector(...);
```

Application component에서 raw `useDispatch` 또는 `useSelector`를 직접 사용하지 않습니다.

---

## 디렉터리 구조

```
YJUniWay/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Main/           # 메인 페이지
│       │   ├── Dormitory/      # 기숙사 안내 + Laundry 서브페이지
│       │   ├── Schedule/       # 일정
│       │   ├── StudentList/    # 명단 (관리자 전용 CRUD)
│       │   └── Admin/          # 로그인 / 회원가입 / 관리자 목록
│       ├── components/
│       │   ├── PageLayout.tsx  # 공통 레이아웃 (헤더 + BottomTab)
│       │   └── BottomTab.tsx   # 하단 탭 네비게이션
│       ├── store/
│       │   ├── index.ts
│       │   └── slices/authSlice.ts   # 관리자 로그인 상태 (localStorage 연동)
│       ├── types/index.ts      # 공통 TypeScript 타입 정의
│       └── i18n/index.ts       # 언어 설정 (실제 문구는 컴포넌트별 isKo 삼항 분기, 리소스는 빈 객체)
│
└── backend/
    └── src/
        ├── utils/translate.util.ts  # 한→일 번역 공용 함수 (schedule/dormitory/laundry 공유)
        └── modules/
            ├── admin/          # 로그인(JWT), 관리자 CRUD
            ├── auth/           # AuthModule + JwtStrategy + Roles/JwtAuthGuard
            ├── student/        # 학생 CRUD + AI 문서 파싱 + 점호
            ├── schedule/       # 일정 CRUD + AI 파싱/일괄등록 + 번역 + 메모 연동
            ├── memo/           # 스케줄/날짜별 관리자 메모
            ├── dormitory/      # 기숙사 섹션/아이템 CRUD + 번역
            ├── laundry/        # 세탁기 설정/사용순서 CRUD + 번역
            └── settings/       # AppSettings, EmergencyContact
```

> `frontend/src/mock/` 폴더는 완전히 삭제됨(2026-07-24, 커밋 `16cee99`) — 더 이상 존재하지 않음

---

## 사용자 권한

| 유형 | 접근 방식 | 비고 |
|---|---|---|
| **학생** | 로그인 없음, URL 비공개 방식 | 명단 페이지 접근 불가 |
| **관리자** (`role: professor`) | `studentId`가 없으면 이름으로, 있으면 학번으로 로그인 | 관리자 목록 접근 가능. DB enum 값·컬럼명은 여전히 `professor`이지만 화면 표기는 전부 "관리자"로 통일(2026-07-25, [주요 설계 결정](#주요-설계-결정) 참고) |
| **스태프** (`role: staff`) | 학번으로 로그인 | 관리자 승인 후 활성화. 승인된 스태프는 관리자가 "권한" 버튼으로 관리자로 전환 가능 |

- 프론트 인증 상태: Redux `authSlice` + `localStorage`
- 백엔드: JWT (sha256 비밀번호 해싱)
- 관리자/스태프 권한 차이는 관리자 목록 접근 여부 (프론트 `Admins.tsx`에서 `role !== 'professor'`면 클라이언트 사이드로 접근 차단)
- `AdminEntity`에 `role`(`professor`/`staff`), `isApproved`, `studentId` 컬럼 구현됨. `login()`은 학번 우선 조회 → 없으면 이름으로 조회(role 무관, `studentId IS NULL`인 계정만 대상, 2026-07-25 수정 — 상세는 아래), 스태프는 `isApproved=false`면 로그인 거부
- **서버측 인가 적용됨 (검증 및 커밋 완료 2026-07-22, 커밋 `38d77bb`)**: `backend/src/modules/auth/`(`AuthModule` + `JwtStrategy`) 및 `RolesGuard`/`JwtAuthGuard`가 구현되어 admin/schedule/dormitory/settings 컨트롤러의 쓰기 API와 student 컨트롤러 전체(클래스 단위 `@UseGuards`)에 적용된 상태. `GET /api/admin`(목록 조회)·수정·삭제는 `RolesGuard` + `@Roles(AdminRole.PROFESSOR)`로 서버에서도 교수 전용으로 제한됨 — 기존에는 프론트 `Admins.tsx`의 클라이언트 사이드 차단뿐이었음. 프론트 `apiClient.ts` 요청 인터셉터가 `localStorage`의 토큰을 `Authorization: Bearer`로 자동 주입.
  - **Docker(`docker-compose up`)로 뜬 실서버 대상 curl 테스트로 검증 완료**: 미승인 스태프 로그인 거부(401) / 교수·승인된 스태프 로그인 성공(토큰 발급) / 토큰 없이 `GET /admin` → 401 / 스태프 토큰으로 `GET /admin` → 403(교수 전용) / 교수 토큰으로 `GET /admin` → 200 / 토큰 없이 `POST /schedule` → 401 / 스태프 토큰으로 `POST /schedule` → 201(role 제한 없는 엔드포인트는 스태프도 허용) — 모두 설계대로 동작.
  - **수정하고 커밋함**: 로그아웃(`authSlice.clearAdmin`)이 `adminAuth`만 지우고 `token`(JWT)은 안 지우던 문제 → `token`도 함께 제거하도록 수정, 커밋 `38d77bb`에 포함 (`frontend/src/store/slices/authSlice.ts`). 짝을 이루는 `apiClient.ts`의 401 인터셉터 `adminAuth` 제거 라인도 이후 커밋 `79a3d08`에 포함되어 반영 완료.
  - **발견했지만 의도적으로 안 고치기로 함 (2026-07-23 재확인)**: `POST /schedule`(단건)에 DTO/validation이 없어 필수(NOT NULL) 필드(`title_ja` 등) 누락 시 400이 아니라 500(`ER_NO_DEFAULT_FOR_FIELD`)이 그대로 노출됨. 실사용 경로(`ScheduleFormModal.tsx`의 `canSubmit` 클라이언트 체크)에서는 발생하지 않아 실질적 위험은 낮음 — 개발자 판단으로 "필요해지기 전까진 손 안 대기"로 결정. `POST /schedule/bulk`(`createMany`)는 별도로 이미 동일한 검증이 들어가 있음([주요 설계 결정](#주요-설계-결정) 참고).
- **관리자 명칭 통일 + 역할 전환 기능 (구현 완료, 2026-07-25, 브라우저 E2E는 개발자가 대부분 확인)**: "교수"라는 표현이 이 서비스를 관리하는 사람 전반(개발자 본인 포함)을 가리키기엔 어색하다는 판단으로 화면 문구를 전부 "관리자"로 변경. 백엔드 enum 값(`AdminRole.PROFESSOR = 'professor'`)과 DB 데이터는 그대로 두고 표시 문구만 바꾼 것이라 별도 마이그레이션 없음.
  - `Admins.tsx`에 스태프 ↔ 관리자 상호 전환("권한" 버튼) 추가. `PUT /admin/:id`가 이미 `role`을 받는 범용 수정 엔드포인트였어서 프론트 UI만 추가하면 됐음. 승인된 스태프에게만 "권한" 버튼이 뜨고(미승인 스태프는 "승인하기" 버튼만), 승인/미승인 배지는 없앰(승인되면 곧장 권한변경 버튼으로 전환되는 것 자체가 상태 표시)
  - **안전장치 3종 (백엔드 `admin.service.ts` `update()` + 프론트 양쪽에 동일하게 적용)**: (1) 자기 자신의 권한은 스스로 변경 불가, (2) 마지막 남은 관리자는 스태프로 내릴 수 없음(관리자 0명 상태 방지), (3) `studentId`가 있는 관리자(원래 스태프였다가 승격된 사람)는 `studentId`가 없는 "순수 관리자"(교수/시드 계정)의 권한을 변경할 수 없음 — 학생 출신이 원 교수 권한을 못 건드리게 하는 계층 보호. 프론트는 버튼을 숨기는 정도이고 실제 차단은 백엔드가 `ForbiddenException`으로 함
  - `Signup.tsx`에 "교수님의 경우" 체크박스 추가 — 체크 시 학번 입력이 없어지고 `studentId: null`로 가입 신청됨(`admins.student_id`는 `UNIQUE`지만 nullable이라 여러 계정이 동시에 `NULL`이어도 문제 없음). 체크해도 즉시 관리자가 되는 게 아니라 기존과 동일하게 `role: 'staff'`, `isApproved: false`로 대기 상태로 들어가고, 관리자가 승인 → 권한변경까지 해야 실제 로그인 가능(자가 승격 방지)
  - **로그인 조회 로직 변경**: `login()`이 기존엔 "이름 조회는 `role: PROFESSOR`인 사람만" 매칭했는데, 이러면 학번 없이 가입 신청한(체크박스 사용) 대기 중 스태프 계정은 이름으로도 학번으로도 못 찾아져서 "존재하지 않는 계정입니다"가 잘못 뜨는 문제가 있었음 → `studentId IS NULL`이면 role 무관하게 이름으로 조회하도록 수정, 승인 대기 상태에서도 "관리자의 승인이 필요합니다" 메시지가 정상적으로 뜨도록 고침
  - 로그인 폼(`Admin/index.tsx`)이 이 "승인 대기" 메시지를 별도로 감지해 파란색 안내 박스로 다르게 표시. **문자열 비교 방식**(`PENDING_APPROVAL_MESSAGE` 상수)이라 백엔드 메시지 문구를 바꾸면 프론트도 같이 맞춰야 함
- **관리자 로그인 UX 개선 (구현 완료, 2026-07-25)**: 로그인 성공 시 별도 대시보드 카드 없이 바로 메인(`/`)으로 이동 — 관리자 목록/로그아웃 기능이 이미 헤더와 위 "권한" 버튼으로 흡수되어 쓸모없어진 `AdminDashboard` 컴포넌트는 삭제함. 로그아웃 버튼은 `PageLayout.tsx` 헤더(관리자 버튼 · 언어 버튼 사이)로 이동했고, 클릭 시 바로 로그아웃되지 않고 확인 모달을 거침(실수 로그아웃 방지). 로그인 폼에 회원가입(`/admin/signup`) 링크 추가 — 기존에도 라우트는 있었지만 진입 UI가 없어서 사실상 도달 불가능했음
- **로그인 401 인터셉터 버그 수정 (2026-07-25)**: `apiClient.ts`의 401 응답 인터셉터가 "세션 만료" 처리용으로 모든 401 응답에 대해 무조건 `window.location.href = '/admin'`을 실행했는데, 로그인 실패 자체도 401이라 로그인 폼이 에러 메시지를 렌더링하자마자 페이지가 강제 리로드되며 메시지가 바로 사라지는 버그가 있었음 → `/admin/login` 요청에서 온 401은 이 리다이렉트 대상에서 제외

---

## 데이터 구조 주의사항

### 백엔드 엔티티 vs 프론트 타입
- 백엔드 엔티티: camelCase 프로퍼티 (`titleKo`, `sectionKey` 등), DB 컬럼명은 snake_case
- 프론트 `types/index.ts`: snake_case (`title_ko`, `section_key` 등)
- API 응답은 TypeORM이 snake_case로 직렬화하므로 프론트 타입과 맞음

### 기숙사 데이터 구조
- 백엔드는 `dormitory_sections`에 `type: 'floor'|'category'` 컬럼으로 층별/카테고리 섹션을 하나의 테이블에 통합, `dormitory_items`가 각 섹션에 속함
- 프론트는 이 구조를 그대로 사용 (`Dormitory/index.tsx`가 `floorSections`/`categorySections`로 분리해 렌더링). mock 시절 자체 타입과의 불일치 문제는 mock 삭제(2026-07-24)로 해소됨

---

## 포트 및 실행 환경

| 서비스 | 로컬 직접 실행 | Docker |
|---|---|---|
| Frontend | `http://localhost:5173` | `http://localhost:5173` |
| Backend | `http://localhost:3000` | `http://localhost:3007` |
| MySQL | `localhost:3306` | `localhost:3306` |
| Swagger | `http://localhost:3000/api/docs` | `http://localhost:3007/api/docs` |

> Docker 사용 시 백엔드 포트가 **3007**로 매핑됨 (컨테이너 내부는 3000)

### 로컬 직접 실행

```bash
# 백엔드
cd backend && npm run start:dev

# 프론트엔드 (별도 터미널)
cd frontend && npm run dev
```

### Docker 실행

```bash
# .env 파일 준비 (.env.example 참고)
cp .env.example .env   # 값 채워넣기

# 전체 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build

# 종료
docker-compose down
```

### .env 필수 항목

```env
DB_PASSWORD=          # MySQL 비밀번호
DB_NAME=yjuniway
DB_USERNAME=root
JWT_SECRET=           # 임의 문자열
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=    # Claude API 키 (명단/일정 파싱에 사용)
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3007/api   # Docker 사용 시 3007 / 로컬 직접 실행 시 3000
```
중요:
실제 `.env` 파일은 절대 읽거나, 출력하거나, 노출하거나, commit하지 않습니다.

---

## 현재 개발 상태

### 완료
- [x] DB 연결 설정 (TypeORM + MySQL, `database.config.ts`, `.env.example`)
- [x] 프론트 → 백엔드 API 전체 연결 (`frontend/src/api/*`). `mock/` 폴더는 완전히 삭제됨(2026-07-24, 커밋 `16cee99`) — 더 이상 프로젝트에 존재하지 않음
  - Main: 일정/설정/연락처 조회 + 관리자 편집(설정 통합 모달, 연락처 CRUD) 전체 연동
  - Schedule: 조회/등록/수정/삭제/일괄등록/전체삭제/번역 전체 연동
  - StudentList: CRUD + AI 문서 파싱 전체 연동
  - Dormitory: 조회 + 섹션 수정(층만)/항목 CRUD/번역 연동 (섹션 추가·삭제는 의도적으로 UI 없음, [주요 설계 결정](#주요-설계-결정) 참고)
  - Laundry: 조회 + 설정 수정/사용순서 CRUD(순서 재배치 포함)/번역 연동 (영상·이미지는 정적 파일 방식 유지로 확정, 아래 참고)
  - Admin: 로그인 / 목록 조회 / 승인 토글 / 가입신청 연동
- [x] 학생 CRUD + PDF/이미지 AI 파싱 (Claude API)
- [x] 관리자 로그인 / 목록 UI
- [x] 교수/스태프 구분 컬럼(`role`, `isApproved`, `studentId`) 및 로그인 분기 로직 (백엔드), 목록 화면 클라이언트 사이드 권한 분기 (프론트)
- [x] 점호(roll-call) 백엔드 API (엔티티/서비스/컨트롤러, 프론트 미연결)
- [x] 설정(통금/WiFi/공지/내일 집합) 백엔드 API + 관리자 편집 UI
- [x] Docker 설정 파일
- [x] 백엔드 인증/인가 가드 구현, 검증, 커밋 완료 (`AuthModule`/`JwtStrategy`/`RolesGuard`/`JwtAuthGuard`, admin/schedule/dormitory/settings/student 컨트롤러에 적용) — 로그인/role별 접근 차단 실동작 확인됨(2026-07-22), 커밋 `38d77bb`, [사용자 권한](#사용자-권한) 참고
- [x] 스케줄 관리자별 메모 기능 — 백엔드(`memo` 모듈: entity/service/controller) + 프론트(`memoSlice.ts` 비동기 thunk, `frontend/src/api/memo.ts`) 연동 완료(2026-07-23). 브라우저 수동 E2E는 개발자가 대부분 확인했다고 언급(2026-07-25, 세부 범위는 명시 안 됨). 상세 및 알려진 이슈는 [미완료](#미완료-남은-작업) 절 참고
- [x] 일정 PDF/이미지 AI 파싱 + 일괄 등록(bulk import), 일정 전체 삭제 — 완료 및 실제 PDF로 브라우저 E2E 확인 완료(2026-07-23). 상세는 [주요 설계 결정](#주요-설계-결정) 절 참고
- [x] 홈/기숙사/세탁기 관리자 CRUD UI — 완료(2026-07-24, 커밋 `d1aef48`/`879f375`/`82eb4ef`). 기숙사는 브라우저 E2E 확인 완료, 홈/세탁기도 개발자가 대부분 확인했다고 언급(2026-07-25, 세부 범위는 명시 안 됨). 상세는 [미완료](#미완료-남은-작업) 절 참고
- [x] AI 자동 번역 — schedule/dormitory/laundry 3개 모듈에 필드별 "번역" 버튼 구현 완료, 공용 `backend/src/utils/translate.util.ts`(`translateKoToJa`)로 통합(2026-07-24, 커밋 `22e57e0`)
- [x] `frontend/src` 전체 `npm run build`(frontend `tsc -b && vite build`) / backend `nest build` 정상 통과 확인(2026-07-24) — 이전에 남아있던 pre-existing 타입 에러 4건(mock 삭제, `Admins.tsx` studentId, `ScheduleFormModal.tsx` locationKo null) 모두 해소됨
- [x] 관리자 명칭 통일("교수"→"관리자") + 관리자 목록 역할 전환("권한" 버튼)/스태프 삭제 + 로그인 UX 개선(로그인 성공 시 메인 이동, 헤더 로그아웃 확인모달, 회원가입 링크) + 회원가입 시 학번 생략 체크박스 — 구현 및 빌드/lint 통과 완료(2026-07-25). 브라우저 수동 E2E는 개발자가 대부분 확인했다고 언급(2026-07-25, 전체 흐름을 처음부터 끝까지 눌러봤는지 세부는 명시 안 됨). 상세는 [사용자 권한](#사용자-권한) 절 참고
- [x] 세탁기 `video_url`/`image_url` DB 컬럼 제거(2026-07-25) — 영상/이미지를 정적 파일 방식으로 유지하기로 확정하면서, 애초 어디서도 read/write 안 하던 죽은 컬럼을 정리함. `database/01_schema.sql`/`laundry-settings.entity.ts`/프론트 `types/index.ts`·`api/laundry.ts` 4곳 수정, frontend/backend build 재확인 통과

### 미완료 (남은 작업)

우선순위 순서 (개발자와 합의된 진행 순서):

1. [x] ~~인증 가드 동작 검증 및 커밋~~ — 완료(2026-07-22, 커밋 `38d77bb`), [사용자 권한](#사용자-권한) 참고. 아래 항목들(특히 관리자 CRUD, 메모)은 모두 이 인증 흐름 위에서 동작하므로 이제 진행 가능
2. [x] ~~홈/기숙사/스케줄 관리자 CRUD UI~~ — 완료(2026-07-24). 일정(`ScheduleFormModal`/`ScheduleDeleteConfirmModal`), 설정(통금/WiFi/공지, `SettingsFormModal`)+연락처 CRUD(`ContactFormModal`), 기숙사(`SectionFormModal`/`ItemFormModal`), 세탁기(`LaundrySettingsFormModal`/`LaundryStepFormModal`) 모두 관리자 편집 UI 연동 완료. 세부 스코프/제약은 [주요 설계 결정](#주요-설계-결정) 참고
3. [x] 스케줄 관리자별 메모 기능 — 완료(2026-07-23). 백엔드(`memo` 모듈: entity/service/controller, `app.module.ts` 등록됨) + 프론트(`memoSlice.ts`를 `createAsyncThunk` 기반으로 전면 교체, `frontend/src/api/memo.ts` 신규) 연동 완료.
   - 연동 과정에서 발견해 수정한 버그 2건: (1) `MemoBlockRow.tsx`에서 `isChecked`(MySQL tinyint 0/1)를 `{isChecked && <CheckIcon/>}` 패턴으로 렌더링해 값이 0일 때 숫자 "0"이 그대로 화면에 찍히던 문제 → 삼항 연산자로 교체. (2) `editMemoLine`/`toggleMemoLine`/`removeMemoDocThunk` thunk가 payload를 평평하게(`target` 중첩 없이) 반환해 리듀서가 `action.payload.target`을 읽다 크래시 나던 문제(체크박스 토글 안 됨, 수정/삭제는 새로고침해야 반영됨) → `addMemoLine`처럼 `{target, visibility, ...}` 형태로 재구성하도록 수정.
   - **브라우저 수동 E2E**: 개발자가 2026-07-25에 대부분 확인했다고 언급함(정확히 어느 화면까지인지는 명시 안 됨).
   - 알려진 이슈(경미, 우선순위 낮음, 2026-07-23 리뷰에서 발견):
     - `MemoService.addBlock`(백엔드)의 find-or-create가 트랜잭션/락 없이 처리됨 — 같은 대상+visibility에 거의 동시에 첫 줄이 추가되면 메모 문서가 중복 생성될 수 있음. `memos` 테이블에도 유니크 제약 없음(`database/01_schema.sql`)
     - `ScheduleMemoBadge`/`MemoPanel`이 같은 대상 데이터를 각자 fetch하는 구조 — 드물게 늦게 도착한 조회 응답이 방금 한 수정 결과를 잠깐 덮어쓸 수 있음(새로고침하면 정상화)
     - `RollCall.isPresent`도 `memo_blocks.is_checked`와 동일한 tinyint(1) 패턴 — 점호 프론트 UI 구현 시 같은 종류의 "0 렌더링" 버그 재발 가능성 있음(현재는 프론트 미연결이라 영향 없음)
4. [x] ~~텀 별 관리 기능~~ — **하지 않기로 결정(2026-07-25)**. 개발자 판단으로 스코프에서 제외, 현재 상태를 완성으로 간주함. DB에 텀/학기 관련 테이블·컬럼 없음 — 앞으로도 임의로 추가하지 말 것

기타 미완료:
- [ ] 점호 프론트 UI — 개발자 판단으로 당분간 진행 안 하기로 함(2026-07-23). API(`getRollCall`/`updateRollCall`)는 존재하나 어떤 페이지에서도 호출되지 않음
- [x] 세탁기 영상/이미지 업로드 — **정적 파일 방식 유지로 확정, 인프라 추가 안 함**(2026-07-25). `LaundryHowToUse.tsx`는 계속 `frontend/src/assets/laundry.mov`/`laundry.png`를 씀. 애초 어디서도 read/write 안 하던 죽은 `laundry_settings.video_url`/`image_url` 컬럼은 제거함(`database/01_schema.sql`/`laundry-settings.entity.ts`/프론트 타입 4곳 수정). 실제 업로드 기능이 나중에 필요해지면 (1) 파일 영속 저장(multer diskStorage 등), (2) 정적 파일 서빙 설정(`@nestjs/serve-static` 등, 현재 전무), (3) `LaundryHowToUse.tsx`가 정적 asset 대신 DB 값을 읽도록 수정 + 컬럼 재설계, 3가지 신규 인프라가 새로 필요
- [ ] 홈/세탁기 관리자 CRUD 브라우저 수동 E2E — 기숙사는 확인 완료(2026-07-24), 홈/세탁기도 개발자가 2026-07-25에 대부분 확인했다고 언급(세부 범위 미명시라 항목은 유지)
- [ ] 관리자/스태프 명칭 통일·역할 전환 기능 브라우저 수동 E2E — 구현은 완료(2026-07-25), 개발자가 같은 날 대부분 확인했다고 언급했으나 가입→승인→권한변경→재로그인 전체 흐름을 처음부터 끝까지 눌러봤는지 세부는 미명시. 상세는 [사용자 권한](#사용자-권한) 절 참고
- [x] `frontend/src/mock/` 폴더 완전 삭제 완료(2026-07-24, 커밋 `16cee99`) — 5개 파일(`mainData.ts`/`dormitoryData.ts`/`scheduleData.ts`/`studentData.ts`/`adminData.ts`) 모두 제거. 같은 커밋에서 `i18n/ko.json`/`ja.json`도 함께 삭제됨 — 실제 화면 문구는 컴포넌트별 `isKo` 삼항 분기로만 처리되어 이 리소스 파일들도 어디서도 안 쓰이는 죽은 코드였음
- [x] `ScheduleTimeline.tsx`의 이모지(🗺️, 📭) 하드코딩 수정 완료(2026-07-23) — `ExploreIcon`/`EventBusyIcon`(MUI)으로 교체. `frontend/src` 전체를 `\p{Extended_Pictographic}` 패턴으로 재검색해 다른 이모지 잔존 없음 확인(mockup_*.html 등은 실제 UI 코드가 아니라 대상 아님)

---

## 주요 설계 결정

- **콘텐츠 이중 언어 저장**: `_ko` / `_ja` 컬럼으로 분리 저장, 관리자가 한 언어 입력 시 AI 자동 번역 예정
- **LLM 호출 트리거 방향**: 문서 추출과 번역을 별도 LLM 호출로 분리한다.
  - **파일 입력(PDF/이미지 업로드)**: 추출 호출 자동 수행 + 번역 호출까지 같은 흐름으로 자동 이어붙임 (업로드 자체가 명시적 action이므로 자동 체이닝 허용). **일정(schedule) 모듈에 구현 완료**(2026-07-23) — `schedule.service.ts`의 `parseDocument()`가 Stage 1(추출, 문서 첨부)과 Stage 2(번역, 텍스트만)를 순차 호출. student 모듈의 기존 파싱(`parseDocument`)은 이 원칙 이전에 만들어져 1회 호출로 처리 중이며, 이번 작업에서 리팩터링하지 않음(스코프 아님)
  - **폼 직접 타이핑 입력/수정**: 기본적으로 LLM 호출 없음. 단, 관리자가 필드별 "번역" 버튼 등으로 명시적으로 트리거한 경우에 한해 해당 필드만 번역 호출 수행 — **구현 완료(2026-07-24)**. `POST {schedule,dormitory,laundry}/translate`(각 모듈 `translateText`)를 폼의 번역 아이콘 버튼이 명시적으로 호출, 해당 Ja 필드만 채움
  - 번역 프롬프트는 문서 추출 프롬프트와 분리하여, 추출된 필드만 좁게 번역 처리
  - **공용 번역 함수로 통합(2026-07-24, 커밋 `22e57e0`)**: Anthropic 호출 로직은 `backend/src/utils/translate.util.ts`의 `translateKoToJa(text)` 하나로 모으고, schedule/dormitory/laundry 각 서비스의 `translateText`는 이 함수를 호출하는 얇은 래퍼로만 존재(각 모듈이 자기 경로를 유지). 새 모듈에 번역 버튼을 추가할 때도 이 util을 재사용할 것
- **기숙사 콘텐츠**: 거의 고정이지만 관리자 편집 가능하게 DB 관리
- **점호**: 매일 초기화 (기록 저장 불필요), 현재 우선순위 낮음
- **일정/명단 파싱**: AI 파싱 → 관리자 확인/수정 → 확정 (반자동 방식)
- **통금 시간**: 관리자가 쉽게 수정 가능 (학생 도착 후 확정)
- **스케줄 관리자별 메모 (구현 완료, 2026-07-23)**: `memos`(대상 기준 `target_type`=`date`|`schedule`, `visibility`=`private`|`shared`, 작성자 `author_admin_id`) + `memo_blocks`(블록 `type`=`text`|`checkbox`, `sort_order`로 순서 관리) 2테이블 구조로 `database/01_schema.sql` 설계 그대로 구현됨(커밋 `a391c42` 등). 날짜 단위 또는 특정 일정 단위로 메모를 붙일 수 있고, 개인용/전체공유 구분이 있음. 프론트 `memoSlice.ts`는 대상+visibility 조합별 캐시(`byTarget`)를 두고, 변경 계열 액션은 매번 서버를 재조회하지 않고 각 API 응답으로 해당 캐시만 직접 갱신함. 앞으로 이 영역을 수정할 때도 스키마를 기준으로 진행하고 임의로 필드를 추가/변경하지 말 것. 알려진 이슈는 [미완료](#미완료-남은-작업) 절 참고
- **일정 AI 문서 파싱 + 일괄 등록 (구현 완료 및 실제 PDF로 확인 완료, 2026-07-23)**: `backend/src/modules/schedule/schedule.service.ts`의 `parseDocument()` — Stage 1(추출, PDF/이미지 첨부)에서 날짜별 일정을 `titleKo`/`locationKo`/`managerName`/`notesKo`로 추출하고, Stage 2(번역, 텍스트만)에서 `titleJa`/`locationJa`/`notesJa`를 별도 호출로 채움(추출·번역 분리 원칙 준수). DB에는 저장하지 않고 배열만 반환 — 프론트 `ScheduleImportModal.tsx`가 미리보기(체크박스 선택 + 행별 수정)를 거친 뒤 신규 트랜잭션 엔드포인트 `POST /schedule/bulk`(`createMany`)로 일괄 등록(부분 실패 없이 전체 성공/전체 롤백). 관리자 전용 `DELETE /schedule`(`removeAll`)로 일정 전체 삭제도 추가됨(확인 모달 거침). Stage 1 프롬프트 설계 원칙: ① 문서 표기(정확한 단어, 구분 기호, 표 칸 이름 등)는 리터럴로 강제하지 않고 개념적으로 서술해 문서마다 형식이 달라도 유연하게 대응하도록 함, ② 우리 학교 고정 사실(조식→"생활관", 학교 내부 일정→"창조관")만 명시적 기본값으로 하드코딩, ③ "전일" 등 하루 전체 일정인데 한 칸 안에 시각이 붙은 하위 활동이 여러 개 나열된 경우에만(문서마다 표기가 다를 수 있어 유연 판단) 하위 활동별로 별도 일정으로 분리. `createMany`는 실제 DB 스키마(`database/01_schema.sql`: `location_ko NOT NULL`) 기준으로 `date`/`titleJa`/`locationKo`를 검증하며, 프론트 `ScheduleForm` 타입도 `locationKo`를 항상 string으로 강제해 null 처리 이슈를 해소함(2026-07-24, 커밋 `79a3d08`) — `schedule.entity.ts`는 여전히 `locationKo`를 `nullable: true`로 선언하고 있어 엔티티와 실제 스키마가 불일치하니 이 영역을 다시 만질 때 주의
- **홈(Main) 관리자 CRUD + "내일 집합" 공지 (구현 완료, 2026-07-24)**: `app_settings` 싱글턴에 대한 통합 편집 모달(`SettingsFormModal.tsx`)과 `EmergencyContact` 목록 CRUD(`ContactFormModal`/`ContactDeleteConfirmModal`)로 구성. "내일 집합" 공지는 원래 `tomorrowSchedules[0]`(가장 이른 시간 일정)을 썼는데 매일 반복되는 조식이 항상 걸려 버그가 있었음 → 스케줄 기반 자동 추출을 버리고 관리자가 직접 입력하는 별도 필드(`app_settings.gathering_time`/`gathering_location_ko`/`gathering_location_ja`)로 전환. **`gathering_date` 컬럼은 만들었다가 개발자 요청으로 제거함** — 특정 날짜와 무관한 단일 레코드이며 관리자가 그때그때 갱신하는 방식(유효기간/날짜 자동 숨김 로직 없음, 의도된 트레이드오프이므로 임의로 재도입하지 말 것)
- **기숙사 관리자 CRUD (구현 완료 + 브라우저 E2E 확인, 2026-07-24)**: 항목(`dormitory_items`) 추가/수정/삭제만 지원. **섹션(층/카테고리) 추가·삭제 기능은 의도적으로 안 둠** — 건물/운영 구조상 사실상 고정된 목록이라 "새 섹션"이 어색한 유스케이스이고, 층은 `FLOOR_BADGE_STYLE` 고정 배지 매핑, 카테고리는 `CATEGORY_ICONS`가 `titleKo` 문자열로 아이콘을 찾는 구조라 섹션이 늘어나거나 제목이 바뀌면 조용히 깨짐. 그래서 층은 정보 수정(`SectionFormModal`)만 허용하고 카테고리는 섹션 편집 자체가 없음(항목만 CRUD). 실제로 층/카테고리 구조가 늘어나야 하면 개발자가 직접 DB/코드로 반영. 섹션당 비밀번호(`pin`)는 하나만 존재해야 해서 이미 다른 항목이 pin을 갖고 있으면 폼에서 비밀번호 입력창 자체를 숨김(`ItemFormModal`의 `pinLocked` prop)
- **세탁기(Laundry) 관리자 CRUD (텍스트만 구현 완료, 2026-07-24)**: 요금/앱정보/주의사항(설정 1개) + 사용순서(`laundry_steps`, 위/아래 이동 버튼으로 재배치) CRUD. **영상/이미지는 정적 파일 방식 유지로 확정, `video_url`/`image_url` DB 컬럼도 제거함(2026-07-25)** — [미완료](#미완료-남은-작업) 절의 세부 사유 참고
- **텀 별 관리 기능은 하지 않기로 결정(2026-07-25)**: 설계 전 단계였으나 개발자가 스코프에서 완전히 제외하기로 함. 프로젝트는 현재 구현 상태를 완성으로 간주함 — 텀/학기 관련 테이블·컬럼·로직을 임의로 추가하지 말 것

### UI / 스타일 규칙

- 이모티콘(emoji)을 UI에 사용하지 않습니다. (예: 🌟 📅 ⏰ 등 일체 금지)
- 아이콘이 필요한 경우 `@mui/icons-material`의 MUI Icon component를 사용합니다.
- 스타일링은 가능한 한 MUI(`@mui/material`)의 컴포넌트와 `sx` prop을 사용합니다.
- 인라인 style 객체(`style={{...}}`)보다 MUI `sx` prop을 우선합니다.

Frontend lint 규칙:

```text
--max-warnings 0
```

모든 warning은 error로 취급됩니다.

---

### AI / Claude API 사용 규칙

Claude API 연동이 존재하거나 새로 추가되는 경우:

- Claude API 호출은 Backend에만 배치합니다.
- Claude API key는 Frontend bundle에 절대 포함하지 않습니다.
- Tool Use 또는 function-calling 방식 구현은 신중하게 검증합니다.
- AI 분석 재실행은 명시적인 사용자 action이 있을 때만 수행합니다.
- AI 생성 content는 database 저장 전에 validate 및 sanitize합니다.
- AI output은 application data 또는 검증된 외부 source에 근거하지 않는 한 사실로 취급하지 않습니다.

---

## Git 규칙

- `main` branch에 직접 push하지 않습니다.
- `main` 변경은 Pull Request를 통해 진행합니다.
- `.env` 파일은 절대 commit하지 않습니다.
- Secret, token, generated credential을 commit하지 않습니다.
- commit, push, merge는 사용자의 명시적인 요청 없이 실행하지 않습니다.

---

## Hallucination 방지 규칙

존재하지 않는 가정을 바탕으로 코드를 생성하지 않습니다.

엄격히 금지되는 행위:

- 존재하지 않는 API endpoint를 가정하기
- 존재하지 않는 DB column을 가정하기
- 존재하지 않는 DTO field를 가정하기
- 존재하지 않는 frontend route를 가정하기
- 존재하지 않는 service, hook, utility, component를 가정하기
- 실제로 존재하지 않는 library API 또는 method를 사용하기
- test하지 않은 code를 test 완료라고 말하기
- codebase에서 확인하지 않은 기능을 구현 완료 상태라고 말하기

불확실한 경우:

1. 관련 file을 확인합니다.
2. 확인된 내용을 명시합니다.
3. 확인되지 않은 내용을 명시합니다.
4. 추측 기반 구현을 하기 전에 개발자에게 확인합니다.

---

## Claude의 작업 방식

Code 구현 또는 수정 요청을 받으면 다음 순서를 따릅니다.

1. 관련 file을 먼저 확인합니다.
2. 가장 작고 안전한 변경 범위를 찾습니다.
3. 불필요한 refactor를 피합니다.
4. 기존 architecture와 naming convention을 유지합니다.
5. 위험한 변경은 적용 전에 설명합니다.
6. 관련 없는 file은 수정하지 않습니다.
7. 요청받지 않은 public behavior 변경은 하지 않습니다.
8. 가능한 경우 lint, build, test를 실행합니다.
9. test를 실행하지 않았다면 실행하지 않았다고 명확히 말합니다.
10. 실제로 수행한 검증 이상으로 확인했다고 말하지 않습니다.

---

## 우선순위

규칙이 충돌하는 경우 다음 우선순위를 따릅니다.

1. Security rules
2. Developer instructions
3. Existing codebase behavior
4. Current repository architecture
5. Planned / design direction
6. General best practices

안전하게 판단할 수 없는 충돌이 있으면 작업을 멈추고 개발자에게 확인합니다.
