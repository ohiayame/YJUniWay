import { useState } from 'react';
import type { EmergencyContact } from '../../../api/settings';
import { Overlay, ModalBox, ModalHeader } from '../../../components/ModalShell';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid #e0e0e0', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};

// 입력 필드 컴포넌트 (레이블 + 입력창)
const Field = ({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ marginBottom: 12, ...style }}>
    <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

type ContactForm = Omit<EmergencyContact, 'id'>;

// 긴급 연락처 추가/수정 모달
const ContactFormModal = ({
  initial, isKo, onSave, onClose,
}: {
  initial?: EmergencyContact; isKo: boolean;
  onSave: (form: ContactForm) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<ContactForm>({
    labelKo: initial?.labelKo ?? '',
    labelJa: initial?.labelJa ?? '',
    phone: initial?.phone ?? '',
  });

  const set = (key: keyof ContactForm, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const isEdit = !!initial;

  // DB 제약(NOT NULL): labelKo, labelJa, phone — 백엔드에 DTO validation이 없어 누락 시 500이 나므로 폼에서 먼저 막음
  const canSubmit = form.labelKo.trim().length > 0 && form.labelJa.trim().length > 0 && form.phone.trim().length > 0;

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader title={isEdit ? (isKo ? '연락처 수정' : '連絡先編集') : (isKo ? '연락처 추가' : '連絡先追加')} onClose={onClose} />

        <Field label={isKo ? '이름 (한국어) *' : '名前 (韓国語) *'}>
          <input style={inputStyle} value={form.labelKo} onChange={e => set('labelKo', e.target.value)} placeholder="사감선생님" />
        </Field>
        <Field label={isKo ? '이름 (일본어) *' : '名前 (日本語) *'}>
          <input style={inputStyle} value={form.labelJa} onChange={e => set('labelJa', e.target.value)} placeholder="舎監先生" />
        </Field>
        <Field label={isKo ? '전화번호 *' : '電話番号 *'}>
          <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="010-1234-5678" />
        </Field>

        <button
          onClick={() => { if (canSubmit) onSave(form); }}
          disabled={!canSubmit}
          style={{
            width: '100%', padding: 14, marginTop: 8,
            background: canSubmit ? '#1a1a2e' : '#ccc',
            color: 'white', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 'bold', cursor: canSubmit ? 'pointer' : 'default',
          }}
        >
          {isEdit ? (isKo ? '수정하기' : '更新する') : (isKo ? '추가하기' : '追加する')}
        </button>
      </ModalBox>
    </Overlay>
  );
};

export default ContactFormModal;
