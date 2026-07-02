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
| AI | Anthropic Claude API (문서 파싱, 추후 자동 번역) |
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
│       │   └── Admin/          # 로그인 / 대시보드 / 관리자 목록
│       ├── components/
│       │   ├── PageLayout.tsx  # 공통 레이아웃 (헤더 + BottomTab)
│       │   └── BottomTab.tsx   # 하단 탭 네비게이션
│       ├── mock/               # 임시 데이터 -> 추후 api폴더로 수정후 api작성
│       │   ├── mainData.ts
│       │   ├── dormitoryData.ts
│       │   ├── scheduleData.ts
│       │   ├── studentData.ts
│       │   └── adminData.ts
│       ├── store/
│       │   ├── index.ts
│       │   └── slices/authSlice.ts   # 관리자 로그인 상태 (localStorage 연동)
│       ├── types/index.ts      # 공통 TypeScript 타입 정의
│       └── i18n.ts             # 언어 설정
│
└── backend/
    └── src/
        └── modules/
            ├── admin/          # 로그인(JWT), 관리자 CRUD
            ├── student/        # 학생 CRUD + AI 문서 파싱 + 점호
            ├── schedule/       # 일정 CRUD
            ├── dormitory/      # 기숙사 섹션/아이템 CRUD
            └── settings/       # AppSettings, EmergencyContact
```

---

## 사용자 권한

| 유형 | 접근 방식 | 비고 |
|---|---|---|
| **학생** | 로그인 없음, URL 비공개 방식 | 명단 페이지 접근 불가 |
| **관리자 (교수)** | 이름으로 로그인 | 관리자 목록 접근 가능 |
| **관리자 (스태프)** | 학번으로 로그인 | 교수 승인 후 활성화 |

- 프론트 인증 상태: Redux `authSlice` + `localStorage`
- 백엔드: JWT (sha256 비밀번호 해싱)
- 교수/스태프 권한 차이는 현재 미구현 (향후 확장 고려해 컬럼만 분리)

---

## 데이터 구조 주의사항

### 백엔드 엔티티 vs 프론트 타입
- 백엔드 엔티티: camelCase 프로퍼티 (`titleKo`, `sectionKey` 등), DB 컬럼명은 snake_case
- 프론트 `types/index.ts`: snake_case (`title_ko`, `section_key` 등)
- API 응답은 TypeORM이 snake_case로 직렬화하므로 프론트 타입과 맞음

### 기숙사 mock 데이터 불일치 (API 연결 시 수정 필요)
- `dormitoryData.ts`가 자체 타입(`FloorSection`, `CategorySection`)을 로컬로 정의해서 사용
- `types/index.ts`의 `DormitorySection`/`DormitoryItem`과 구조가 다름
- Mock은 배열 2개(`mockFloorSections`, `mockCategorySections`)로 분리
- 백엔드는 `type: 'floor'|'category'` 컬럼으로 하나의 테이블에 통합
- `CategorySection`에 `section_key` 없음 → API 연결 시 수정 필요

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
- [x] 전체 프론트엔드 페이지 (mock 데이터로 동작)
- [x] 백엔드 엔티티 / 모듈 / 서비스 코드 작성
- [x] 학생 CRUD + PDF/이미지 AI 파싱 (Claude API)
- [x] 관리자 로그인 / 목록 UI
- [x] Docker 설정 파일

### 미완료 (남은 작업)
- [ ] DB 연결 및 백엔드 실행 확인
- [ ] 프론트 → 백엔드 API 연결 (mock 제거)
- [ ] 일정 CRUD 관리자 UI
- [ ] 설정(통금/WiFi/공지) 관리자 편집 UI
- [ ] 점호 UI
- [ ] AI 자동 번역 (한국어 입력 → 일본어 자동 생성)
- [ ] 일정 PDF/이미지 파싱

---

## 주요 설계 결정

- **콘텐츠 이중 언어 저장**: `_ko` / `_ja` 컬럼으로 분리 저장, 관리자가 한 언어 입력 시 AI 자동 번역 예정
- **기숙사 콘텐츠**: 거의 고정이지만 관리자 편집 가능하게 DB 관리
- **점호**: 매일 초기화 (기록 저장 불필요), 현재 우선순위 낮음
- **일정/명단 파싱**: AI 파싱 → 관리자 확인/수정 → 확정 (반자동 방식)
- **통금 시간**: 관리자가 쉽게 수정 가능 (학생 도착 후 확정)

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
