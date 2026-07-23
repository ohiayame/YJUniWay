import { useState } from 'react';
import type { AppSettings } from '../../../api/settings';
import { Overlay, ModalBox, ModalHeader } from '../../../components/ModalShell';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid #e0e0e0', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
};

// 입력 필드 컴포넌트 (레이블 + 입력창)
const Field = ({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ marginBottom: 12, ...style }}>
    <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

// 연관된 필드를 하나로 묶어 보여주는 섹션 (배경 박스 + 그룹 타이틀)
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 }}>{title}</div>
    <div style={{ background: '#f7f7f7', borderRadius: 12, padding: '14px 14px 2px' }}>
      {children}
    </div>
  </div>
);

type SettingsForm = Partial<Omit<AppSettings, 'id' | 'updatedAt'>>;

// 앱 설정(통금/WiFi/학교주소/공지) 편집 모달
const SettingsFormModal = ({
  initial, isKo, onSave, onClose,
}: {
  initial: AppSettings | null; isKo: boolean;
  onSave: (form: SettingsForm) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<SettingsForm>({
    curfewTime: initial?.curfewTime ?? '',
    wifiSsid: initial?.wifiSsid ?? '',
    wifiPassword: initial?.wifiPassword ?? '',
    schoolAddressKo: initial?.schoolAddressKo ?? '',
    schoolAddressJa: initial?.schoolAddressJa ?? '',
    noticeKo: initial?.noticeKo ?? '',
    noticeJa: initial?.noticeJa ?? '',
    // DB 저장값이 없을 때만 관리자 입력 편의를 위한 기본값을 폼에 채워둠 (저장 전까지는 DB에 반영되지 않음)
    gatheringTime: initial?.gatheringTime ?? '09:45',
    gatheringLocationKo: initial?.gatheringLocationKo ?? '생활관 1층 로비',
    gatheringLocationJa: initial?.gatheringLocationJa ?? '学生寮 1階 ロビー',
  });

  const set = (key: keyof SettingsForm, val: string) =>
    setForm(prev => ({ ...prev, [key]: val || null }));

  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    const rows: { label: string; value: string | null | undefined }[] = [
      { label: isKo ? '집합 시간' : '集合時間', value: form.gatheringTime },
      { label: isKo ? '집합 장소(한)' : '集合場所(韓)', value: form.gatheringLocationKo },
      { label: isKo ? '집합 장소(일)' : '集合場所(日)', value: form.gatheringLocationJa },
      { label: isKo ? '공지사항(한)' : 'お知らせ(韓)', value: form.noticeKo },
      { label: isKo ? '공지사항(일)' : 'お知らせ(日)', value: form.noticeJa },
      { label: isKo ? '통금시간' : '門限時間', value: form.curfewTime },
      { label: 'WiFi SSID', value: form.wifiSsid },
      { label: isKo ? 'WiFi 비밀번호' : 'WiFiパスワード', value: form.wifiPassword },
      { label: isKo ? '학교주소(한)' : '学校住所(韓)', value: form.schoolAddressKo },
      { label: isKo ? '학교주소(일)' : '学校住所(日)', value: form.schoolAddressJa },
    ];
    return (
      <Overlay onClose={onClose}>
        <ModalBox>
          <ModalHeader title={isKo ? '수정 내용 확인' : '更新内容の確認'} onClose={onClose} />
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
            {isKo ? '아래 내용으로 수정하시겠습니까?' : '以下の内容で更新しますか？'}
          </div>
          <div style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            {rows.map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 14px', gap: 8,
                borderBottom: i < rows.length - 1 ? '1px solid #f5f5f5' : 'none',
                background: i % 2 === 0 ? 'white' : '#fafafa',
              }}>
                <span style={{ fontSize: 11, color: '#aaa', minWidth: 72, flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#111', textAlign: 'right', wordBreak: 'break-all' }}>{row.value || '-'}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
              {isKo ? '돌아가기' : '戻る'}
            </button>
            <button onClick={() => onSave(form)} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#1a1a2e', color: 'white', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
              {isKo ? '수정하기' : '更新する'}
            </button>
          </div>
        </ModalBox>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader title={isKo ? '설정 편집' : '設定編集'} onClose={onClose} />

        {/* 자주 수정하는 항목이라 맨 위에 배치 */}
        <Section title={isKo ? '내일 집합 공지' : '明日の集合案内'}>
          <Field label={isKo ? '집합 시간' : '集合時間'}>
            <input type="time" style={inputStyle} value={form.gatheringTime ?? ''} onChange={e => set('gatheringTime', e.target.value)} />
          </Field>
          <Field label={isKo ? '집합 장소 (한국어)' : '集合場所 (韓国語)'}>
            <input style={inputStyle} value={form.gatheringLocationKo ?? ''} onChange={e => set('gatheringLocationKo', e.target.value)} placeholder="정문 앞" />
          </Field>
          <Field label={isKo ? '집합 장소 (일본어)' : '集合場所 (日本語)'}>
            <input style={inputStyle} value={form.gatheringLocationJa ?? ''} onChange={e => set('gatheringLocationJa', e.target.value)} placeholder="正門前" />
          </Field>
        </Section>

        <Section title={isKo ? '공지사항' : 'お知らせ'}>
          <Field label={isKo ? '공지사항 (한국어)' : 'お知らせ (韓国語)'}>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.noticeKo ?? ''} onChange={e => set('noticeKo', e.target.value)} />
          </Field>
          <Field label={isKo ? '공지사항 (일본어)' : 'お知らせ (日本語)'}>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.noticeJa ?? ''} onChange={e => set('noticeJa', e.target.value)} />
          </Field>
        </Section>

        <Section title={isKo ? '통금 / WiFi' : '門限 / WiFi'}>
          <Field label={isKo ? '통금시간' : '門限時間'}>
            <input type="time" style={inputStyle} value={form.curfewTime ?? ''} onChange={e => set('curfewTime', e.target.value)} />
          </Field>
          <Field label="WiFi SSID">
            <input style={inputStyle} value={form.wifiSsid ?? ''} onChange={e => set('wifiSsid', e.target.value)} />
          </Field>
          <Field label={isKo ? 'WiFi 비밀번호' : 'WiFiパスワード'}>
            <input style={inputStyle} value={form.wifiPassword ?? ''} onChange={e => set('wifiPassword', e.target.value)} />
          </Field>
        </Section>

        <Section title={isKo ? '학교 주소' : '学校住所'}>
          <Field label={isKo ? '학교주소 (한국어)' : '学校住所 (韓国語)'}>
            <input style={inputStyle} value={form.schoolAddressKo ?? ''} onChange={e => set('schoolAddressKo', e.target.value)} />
          </Field>
          <Field label={isKo ? '학교주소 (일본어)' : '学校住所 (日本語)'}>
            <input style={inputStyle} value={form.schoolAddressJa ?? ''} onChange={e => set('schoolAddressJa', e.target.value)} />
          </Field>
        </Section>

        <button
          onClick={() => setShowConfirm(true)}
          style={{
            width: '100%', padding: 14, marginTop: 8,
            background: '#1a1a2e',
            color: 'white', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 'bold', cursor: 'pointer',
          }}
        >
          {isKo ? '수정하기' : '更新する'}
        </button>
      </ModalBox>
    </Overlay>
  );
};

export default SettingsFormModal;
