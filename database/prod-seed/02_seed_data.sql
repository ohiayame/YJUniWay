-- YJUniWay 배포용 초기 데이터 (Production Seed)
--
-- 02_mock_data.sql과 달리 가짜 관리자/학생/일정/메모는 포함하지 않는다.
-- 여기 담긴 건 "거의 고정이지만 관리자가 편집 가능한" 콘텐츠성 데이터만이다
-- (CLAUDE.md > 주요 설계 결정 참고).
--
-- 관리자 계정은 이 파일로 시딩하지 않는다. 배포 후 실제 관리자가
-- /admin/signup 으로 가입 신청 → DB에서 첫 계정만 수동으로
-- role='professor', is_approved=1 로 승격할 것 (비밀번호를 git에 남기지 않기 위함).
--
-- 실행 전: -- TODO 표시된 값은 실제 값으로 반드시 교체할 것.
-- 실행: USE yjuniway; 또는 docker exec / MySQL 클라이언트에서 직접 실행

USE yjuniway;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────────────────────
-- dormitory_sections
-- type: 'floor' | 'category'
-- ─────────────────────────────────────────────────────────────
TRUNCATE TABLE dormitory_items;
TRUNCATE TABLE dormitory_sections;

INSERT INTO dormitory_sections (id, type, section_key, title_ko, title_ja, subtitle_ko, subtitle_ja, sort_order) VALUES
(1, 'floor',    'B1',    '지하',          '地下',     NULL,           NULL,              1),
(2, 'floor',    '1F',    '1층',           '1階',      NULL,           NULL,              2),
(3, 'floor',    '2F',    '2층',           '2階',      '세탁기 (남성)', '洗濯機（男性）',   3),
(4, 'floor',    '4F',    '4층',           '4階',      '세탁기 (여성)', '洗濯機（女性）',   4),
(5, 'floor',    'ALL',   '각 층',         '各階',     NULL,           NULL,              5),
(6, 'category', 'trash', '쓰레기 버리기', 'ゴミ捨て', NULL,           NULL,              1),
(7, 'category', 'rules', '규칙',          '規則',     NULL,           NULL,              2);

-- ─────────────────────────────────────────────────────────────
-- dormitory_items
-- ─────────────────────────────────────────────────────────────
INSERT INTO dormitory_items (section_id, text_ko, text_ja, warning_ko, warning_ja, pin, is_danger, sort_order) VALUES
-- B1 (section_id = 1)
(1, '스터디룸 (오른쪽)', 'studyroom（右側）',
    '음료만 가능 · 다른 학생이 있을 때는 조용히', '飲み物のみ可 · 他の学生がいる場合は静かに',
    NULL, 0, 1),
(1, '요리실 (왼쪽)', '料理室（左側）',
    '칼을 사용하는 요리 금지', '包丁を使うような料理は禁止',
    NULL, 0, 2),
(1, '화장실 있음', 'トイレあり', NULL, NULL, NULL, 0, 3),
(1, '에어컨 자유 이용', 'エアコン利用自由',
    '퇴실 시 반드시 끄기', '退室時は必ず消す',
    NULL, 0, 4),

-- 1F (section_id = 2)
(2, '공동 현관', '共同玄関',
    '오전 6:00 개방 / 밤 24:00 잠금', '朝 6:00 解錠 / 夜 24:00 施錠',
    NULL, 0, 1),

-- 2F, 4F: 항목 없음 (세탁기 안내는 subtitle 로 표시)

-- ALL (section_id = 5)
(5, '정수기 (1층 제외)', 'ウォーターサーバー（1階 ×）', NULL, NULL, NULL, 0, 1),

-- trash (section_id = 6)
(6, '건물 밖 오른쪽',                     '建物を出て右側',                         NULL, NULL, NULL,  0, 1),
-- TODO: 쓰레기 봉투함 잠금번호(pin) — 실제 번호로 교체
(6, '음식물 쓰레기 (오렌지 뚜껑)',        '生ゴミ（オレンジの蓋）',                NULL, NULL, '000', 0, 2),
(6, '페트병은 분리수거 / 그 외는 함께',   'ペットボトルは分別 / その他はまとめて', NULL, NULL, NULL,  0, 3),

-- rules (section_id = 7)
(7, '술 · 담배 금지',       'お酒・タバコ 禁止',       NULL, NULL, NULL, 1, 1),
(7, '이성 층 출입 금지',     '異性の階 立ち入り禁止',   NULL, NULL, NULL, 1, 2),
(7, '기숙사생 외 출입 금지', '寮生以外 立ち入り禁止',   NULL, NULL, NULL, 1, 3),
-- TODO: 키 분실 배상액 — 실제 금액으로 교체
(7, '키 분실 — 15,000원',   '鍵紛失 — 15,000ウォン',  NULL, NULL, NULL, 0, 4);

-- ─────────────────────────────────────────────────────────────
-- app_settings  (singleton, id = 1)
-- TODO: 아래 값 전부 실제 값으로 교체 필요
-- ─────────────────────────────────────────────────────────────
DELETE FROM app_settings;

INSERT INTO app_settings (id, curfew_time, wifi_ssid, wifi_password, school_address_ko, school_address_ja, notice_ko, notice_ja, gathering_time, gathering_location_ko, gathering_location_ja) VALUES
(1,
 '22:00',                          -- TODO: 실제 통금 시간
 'TODO_WIFI_SSID',                 -- TODO: 실제 와이파이 SSID
 'TODO_WIFI_PASSWORD',             -- TODO: 실제 와이파이 비밀번호
 'TODO: 실제 학교 주소 (한국어)',
 'TODO: 実際の学校住所（日本語）',
 NULL,                             -- TODO: 배포 시점 공지 없으면 NULL 유지
 NULL,
 NULL,                             -- TODO: "내일 집합" 공지 — 없으면 NULL 유지
 NULL,
 NULL);

-- ─────────────────────────────────────────────────────────────
-- emergency_contacts
-- TODO: 실제 담당자/연락처로 교체 필요
-- ─────────────────────────────────────────────────────────────
TRUNCATE TABLE emergency_contacts;

INSERT INTO emergency_contacts (id, label_ko, label_ja, phone) VALUES
(1, '담당 관리자',   '担当管理者',    'TODO: 010-0000-0000'),
(2, '기숙사 관리실', '寮管理室',      'TODO: 053-000-0000'),
(3, '학교 대표번호', '学校代表番号',  'TODO: 053-000-0000');

-- ─────────────────────────────────────────────────────────────
-- laundry_settings  (singleton, id = 1)
-- ─────────────────────────────────────────────────────────────
DELETE FROM laundry_settings;

INSERT INTO laundry_settings (id, wash_price, dry_price, app_name, app_url, warning_ko, warning_ja) VALUES
(1,
 '700원',
 '700원~',
 '메타클럽',
 'https://www.metaclub.im/',
 '세탁물을 방치하지 말아 주세요.',
 '洗濯物の放置はご遠慮ください。');

-- ─────────────────────────────────────────────────────────────
-- laundry_steps
-- ─────────────────────────────────────────────────────────────
TRUNCATE TABLE laundry_steps;

INSERT INTO laundry_steps (id, sort_order, text_ko, text_ja) VALUES
(1, 1, '앱 「메타클럽」 다운로드',          'アプリ「メタクラブ」をダウンロード'),
(2, 2, '현금으로 충전 (편의점 · 프런트)',   '現金でチャージ（コンビニ・フロント）'),
(3, 3, '세탁기 QR코드 스캔',               '洗濯機のQRコードをスキャン'),
(4, 4, '코스 선택 후 앱으로 결제',          'コースを選択してアプリで決済'),
(5, 5, '세탁 완료 후 바로 꺼내기',          '洗濯終了後は速やかに取り出す');

SET FOREIGN_KEY_CHECKS = 1;
