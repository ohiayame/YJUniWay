-- =============================================
-- YJUniWay Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS yjuniway
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE yjuniway;

-- ---------------------------------------------
-- 관리자
-- ---------------------------------------------
CREATE TABLE admins (
  id           INT          NOT NULL AUTO_INCREMENT,
  name         VARCHAR(50)  NOT NULL COMMENT '이름',
  student_id   VARCHAR(20)           UNIQUE COMMENT '학번',
  phone        VARCHAR(20)  NOT NULL COMMENT '전화번호',
  role         ENUM('professor', 'staff') NOT NULL DEFAULT 'staff' COMMENT '교수 / 학생(조교)',
  is_approved  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '교수 승인 여부 (professor는 항상 1)',
  password     VARCHAR(255) NOT NULL COMMENT '해시된 비밀번호',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ---------------------------------------------
-- 학생 명단
-- ---------------------------------------------
CREATE TABLE students (
  id           INT          NOT NULL AUTO_INCREMENT,
  name_ja      VARCHAR(100) NOT NULL COMMENT '이름 (일본어)',
  name_ko      VARCHAR(100)          COMMENT '이름 (한국어)',
  name_en      VARCHAR(100)          COMMENT '이름 (영어)',
  gender       ENUM('M', 'F') NOT NULL COMMENT '성별',
  room_number  VARCHAR(20)           COMMENT '호실',
  notes        TEXT                  COMMENT '주의사항',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ---------------------------------------------
-- 일정
-- ---------------------------------------------
CREATE TABLE schedules (
  id           INT          NOT NULL AUTO_INCREMENT,
  date         DATE         NOT NULL COMMENT '날짜',
  time_start   TIME                  COMMENT '시작 시간 (nullable: 종일 일정)',
  time_end     TIME                  COMMENT '종료 시간 (nullable)',
  title_ko     VARCHAR(255)          COMMENT '일정명 (한국어)',
  title_ja     VARCHAR(255) NOT NULL COMMENT '일정명 (일본어)',
  location_ko  VARCHAR(255) NOT NULL COMMENT '집합 장소 (한국어)',
  location_ja  VARCHAR(255)          COMMENT '집합 장소 (일본어)',
  manager_name VARCHAR(100)          COMMENT '담당자명 (관리자용)',
  notes_ko     TEXT                  COMMENT '비고 (한국어)',
  notes_ja     TEXT                  COMMENT '비고 (일본어)',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_date (date)
);

-- ---------------------------------------------
-- 메모 (날짜/일정 기준, 개인/공유) — 관리자 전용
-- ---------------------------------------------
CREATE TABLE memos (
  id               INT          NOT NULL AUTO_INCREMENT,
  target_type      ENUM('date', 'schedule') NOT NULL COMMENT '날짜 기준 / 일정 기준',
  target_date      DATE                  COMMENT 'target_type=date일 때만 사용',
  schedule_id      INT                   COMMENT 'FK → schedules id, target_type=schedule일 때만 사용',
  visibility       ENUM('private', 'shared') NOT NULL DEFAULT 'shared' COMMENT '개인용 / 전체공유',
  author_admin_id  INT          NOT NULL COMMENT 'FK → admins id (작성자)',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_target_date (target_type, target_date),
  INDEX idx_target_schedule (target_type, schedule_id),
  CONSTRAINT fk_memos_schedule
    FOREIGN KEY (schedule_id) REFERENCES schedules (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_memos_author
    FOREIGN KEY (author_admin_id) REFERENCES admins (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_memo_target CHECK (
    (target_type = 'date' AND target_date IS NOT NULL AND schedule_id IS NULL) OR
    (target_type = 'schedule' AND schedule_id IS NOT NULL AND target_date IS NULL)
  )
);

-- ---------------------------------------------
-- 메모 블록 (텍스트/체크박스 항목, 순서 있음)
-- ---------------------------------------------
CREATE TABLE memo_blocks (
  id           INT          NOT NULL AUTO_INCREMENT,
  memo_id      INT          NOT NULL COMMENT 'FK → memos id',
  type         ENUM('text', 'checkbox') NOT NULL COMMENT '블록 종류',
  content      TEXT         NOT NULL COMMENT '블록 내용',
  is_checked   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '체크 여부 (checkbox 타입만 사용)',
  sort_order   INT          NOT NULL DEFAULT 0 COMMENT '표시 순서',
  PRIMARY KEY (id),
  INDEX idx_memo (memo_id),
  CONSTRAINT fk_blocks_memo
    FOREIGN KEY (memo_id) REFERENCES memos (id)
    ON DELETE CASCADE
);

-- ---------------------------------------------
-- 기숙사 섹션 (층 or 카테고리)
-- ---------------------------------------------
CREATE TABLE dormitory_sections (
  id           INT          NOT NULL AUTO_INCREMENT,
  type         ENUM('floor', 'category') NOT NULL COMMENT '층 단위 / 카테고리 단위',
  section_key  VARCHAR(20)  NOT NULL UNIQUE COMMENT 'B1, 1F, 2F, 4F, ALL, trash, rules ...',
  title_ko     VARCHAR(100) NOT NULL COMMENT '섹션 제목 (한국어)',
  title_ja     VARCHAR(100) NOT NULL COMMENT '섹션 제목 (일본어)',
  subtitle_ko  VARCHAR(100)          COMMENT '부제목 (한국어) ex) 세탁기(남성)',
  subtitle_ja  VARCHAR(100)          COMMENT '부제목 (일본어) ex) 洗濯機（男性）',
  sort_order   INT          NOT NULL DEFAULT 0 COMMENT '표시 순서',
  PRIMARY KEY (id)
);

-- ---------------------------------------------
-- 기숙사 항목
-- ---------------------------------------------
CREATE TABLE dormitory_items (
  id           INT          NOT NULL AUTO_INCREMENT,
  section_id   INT          NOT NULL COMMENT 'FK → dormitory_sections id',
  text_ko      TEXT         NOT NULL COMMENT '항목 내용 (한국어)',
  text_ja      TEXT         NOT NULL COMMENT '항목 내용 (일본어)',
  warning_ko   TEXT                  COMMENT '경고 문구 (한국어)',
  warning_ja   TEXT                  COMMENT '경고 문구 (일본어)',
  pin          VARCHAR(20)           COMMENT '암호 (쓰레기통 비밀번호 등)',
  is_danger    TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '금지 규칙 여부',
  sort_order   INT          NOT NULL DEFAULT 0 COMMENT '표시 순서',
  PRIMARY KEY (id),
  INDEX idx_section (section_id),
  CONSTRAINT fk_items_section
    FOREIGN KEY (section_id) REFERENCES dormitory_sections (id)
    ON DELETE CASCADE
);

-- ---------------------------------------------
-- 앱 설정값 (단일 레코드, id = 1 고정)
-- ---------------------------------------------
CREATE TABLE app_settings (
  id               INT          NOT NULL DEFAULT 1,
  curfew_time      TIME                  COMMENT '통금 시간',
  wifi_ssid        VARCHAR(100)          COMMENT 'WiFi 이름',
  wifi_password    VARCHAR(100)          COMMENT 'WiFi 비밀번호',
  school_address_ko VARCHAR(255)         COMMENT '학교 주소 (한국어)',
  school_address_ja VARCHAR(255)         COMMENT '학교 주소 (일본어)',
  notice_ko        TEXT                  COMMENT '메인 공지/주의사항 (한국어)',
  notice_ja        TEXT                  COMMENT '메인 공지/주의사항 (일본어)',
  gathering_time          TIME          COMMENT '다음 집합 시간 (홈 화면 "내일 집합" 카드용)',
  gathering_location_ko   VARCHAR(255)  COMMENT '집합 장소 (한국어)',
  gathering_location_ja   VARCHAR(255)  COMMENT '집합 장소 (일본어)',
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_single_row CHECK (id = 1)
);

-- ---------------------------------------------
-- 긴급 연락처
-- ---------------------------------------------
CREATE TABLE emergency_contacts (
  id           INT          NOT NULL AUTO_INCREMENT,
  label_ko     VARCHAR(100) NOT NULL COMMENT '연락처 라벨 (한국어) ex) 담당 교수',
  label_ja     VARCHAR(100) NOT NULL COMMENT '연락처 라벨 (일본어) ex) 担当教授',
  phone        VARCHAR(30)  NOT NULL COMMENT '전화번호',
  PRIMARY KEY (id)
);

-- ---------------------------------------------
-- 세탁기 설정 (요금, 앱 정보 — 싱글턴)
-- ---------------------------------------------
CREATE TABLE laundry_settings (
  id           INT          NOT NULL DEFAULT 1,
  wash_price   VARCHAR(30)  NOT NULL DEFAULT '700원'                  COMMENT '세탁기 1회 요금',
  dry_price    VARCHAR(30)  NOT NULL DEFAULT '700원~'                 COMMENT '건조기 1회 요금',
  app_name     VARCHAR(100) NOT NULL DEFAULT '메타클럽'               COMMENT '결제 앱 이름',
  app_url      VARCHAR(255) NOT NULL DEFAULT 'https://www.metaclub.im/' COMMENT '결제 앱 URL',
  warning_ko   TEXT                                                   COMMENT '주의사항 (한국어)',
  warning_ja   TEXT                                                   COMMENT '주의사항 (일본어)',
  video_url    VARCHAR(255)                                           COMMENT '앱 사용법 영상 경로 (/uploads/...)',
  image_url    VARCHAR(255)                                           COMMENT '세제 이미지 경로 (/uploads/...)',
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_laundry_single_row CHECK (id = 1)
);

-- ---------------------------------------------
-- 세탁기 사용 순서
-- ---------------------------------------------
CREATE TABLE laundry_steps (
  id         INT          NOT NULL AUTO_INCREMENT,
  sort_order INT          NOT NULL COMMENT '표시 순서',
  text_ko    VARCHAR(255) NOT NULL COMMENT '단계 내용 (한국어)',
  text_ja    VARCHAR(255) NOT NULL COMMENT '단계 내용 (일본어)',
  PRIMARY KEY (id)
);

-- ---------------------------------------------
-- 점호 (매일 초기화)
-- ---------------------------------------------
CREATE TABLE roll_calls (
  id           INT          NOT NULL AUTO_INCREMENT,
  student_id   INT          NOT NULL COMMENT 'FK → students',
  date         DATE         NOT NULL COMMENT '점호 날짜',
  is_present   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '출석 여부',
  PRIMARY KEY (id),
  UNIQUE KEY uq_student_date (student_id, date),
  CONSTRAINT fk_rollcall_student
    FOREIGN KEY (student_id) REFERENCES students (id)
    ON DELETE CASCADE
);
