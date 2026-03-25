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
  icon         VARCHAR(10)           COMMENT '이모지 아이콘',
  PRIMARY KEY (id)
);

-- ---------------------------------------------
-- 기숙사 항목
-- ---------------------------------------------
CREATE TABLE dormitory_items (
  id           INT          NOT NULL AUTO_INCREMENT,
  section_id   INT          NOT NULL COMMENT 'FK → dormitory_sections id',
  content_ko   TEXT         NOT NULL COMMENT '항목 내용 (한국어)',
  content_ja   TEXT         NOT NULL COMMENT '항목 내용 (일본어)',
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
