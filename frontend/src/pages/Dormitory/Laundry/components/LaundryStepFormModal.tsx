import { useState } from 'react';
import TranslateIcon from '@mui/icons-material/Translate';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { translateLaundryText } from '../../../../api/laundry';
import type { LaundryStep } from '../../../../api/laundry';
import { Overlay, ModalBox, ModalHeader } from '../../../../components/ModalShell';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid #e0e0e0', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};

const translateBtnStyle = (disabled: boolean): React.CSSProperties => ({
  width: 38, flexShrink: 0, borderRadius: 10,
  border: '1.5px solid #e0e0e0', background: 'white',
  color: disabled ? '#ccc' : '#1565c0',
  cursor: disabled ? 'default' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

type StepForm = Omit<LaundryStep, 'id' | 'sortOrder'>;

// 세탁기 사용 순서 추가·수정 모달
const LaundryStepFormModal = ({
  initial, isKo, onSave, onClose,
}: {
  initial?: LaundryStep; isKo: boolean;
  onSave: (form: StepForm) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<StepForm>({
    textKo: initial?.textKo ?? '',
    textJa: initial?.textJa ?? '',
  });

  const set = (key: keyof StepForm, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const isEdit = !!initial;

  const [translating, setTranslating] = useState(false);
  const translateField = async () => {
    const koValue = form.textKo;
    if (!koValue.trim()) return;

    setTranslating(true);
    try {
      const { translated } = await translateLaundryText(koValue);
      set('textJa', translated);
    } catch {
      // 번역 실패 시 조용히 무시, 관리자가 직접 입력 가능
    } finally {
      setTranslating(false);
    }
  };

  // DB 제약(NOT NULL): text_ko, text_ja
  const canSubmit = form.textKo.trim().length > 0 && form.textJa.trim().length > 0;

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader
          title={isEdit ? (isKo ? '사용 순서 수정' : '使い方の手順を編集') : (isKo ? '사용 순서 추가' : '使い方の手順を追加')}
          onClose={onClose}
        />

        <Field label={isKo ? '내용 (한국어) *' : '内容 (韓国語) *'}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={form.textKo} onChange={e => set('textKo', e.target.value)} />
            <button
              type="button"
              onClick={translateField}
              disabled={!form.textKo.trim() || translating}
              style={translateBtnStyle(!form.textKo.trim() || translating)}
              title={isKo ? '일본어로 번역' : '日本語に翻訳'}
            >
              {translating
                ? <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                : <TranslateIcon sx={{ fontSize: 16 }} />}
            </button>
          </div>
        </Field>
        <Field label={isKo ? '내용 (일본어) *' : '内容 (日本語) *'}>
          <input style={inputStyle} value={form.textJa} onChange={e => set('textJa', e.target.value)} />
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

export default LaundryStepFormModal;
