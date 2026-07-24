import { useState } from 'react';
import TranslateIcon from '@mui/icons-material/Translate';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { translateDormitoryText } from '../../../api/dormitory';
import type { DormitorySection } from '../../../api/dormitory';
import { Overlay, ModalBox, ModalHeader } from '../../../components/ModalShell';

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

type SectionForm = Omit<DormitorySection, 'id' | 'items' | 'type' | 'sortOrder'>;

// 층(floor) 섹션 수정 모달 — 층 자체는 건물 구조상 고정이라 추가·삭제는 지원하지 않고 정보 수정만 가능
const SectionFormModal = ({
  initial, isKo, onSave, onClose,
}: {
  initial: DormitorySection;
  isKo: boolean;
  onSave: (form: SectionForm) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<SectionForm>({
    sectionKey: initial.sectionKey,
    titleKo: initial.titleKo,
    titleJa: initial.titleJa,
    subtitleKo: initial.subtitleKo,
    subtitleJa: initial.subtitleJa,
  });

  const set = (key: keyof SectionForm, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // 폼 직접 입력 중 필드별 "번역" 버튼 (관리자가 명시적으로 눌렀을 때만 해당 필드 하나만 번역)
  const [translating, setTranslating] = useState<null | 'title' | 'subtitle'>(null);
  const translateField = async (field: 'title' | 'subtitle') => {
    const koKey = field === 'title' ? 'titleKo' : 'subtitleKo';
    const jaKey = field === 'title' ? 'titleJa' : 'subtitleJa';
    const koValue = form[koKey];
    if (!koValue?.trim()) return;

    setTranslating(field);
    try {
      const { translated } = await translateDormitoryText(koValue);
      set(jaKey, translated);
    } catch {
      // 번역 실패 시 조용히 무시, 관리자가 직접 입력 가능
    } finally {
      setTranslating(null);
    }
  };

  // DB 제약(NOT NULL): section_key, title_ko, title_ja
  const canSubmit = form.sectionKey.trim().length > 0 && form.titleKo.trim().length > 0 && form.titleJa.trim().length > 0;

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader
          title={isKo ? '층 수정' : 'フロア編集'}
          onClose={onClose}
        />

        <Field label={isKo ? '식별 키 *' : '識別キー *'}>
          <input
            style={inputStyle}
            value={form.sectionKey}
            onChange={e => set('sectionKey', e.target.value)}
            placeholder="B1, 1F, 2F ..."
          />
        </Field>
        <Field label={isKo ? '제목 (한국어) *' : 'タイトル (韓国語) *'}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={form.titleKo} onChange={e => set('titleKo', e.target.value)} />
            <button
              type="button"
              onClick={() => translateField('title')}
              disabled={!form.titleKo?.trim() || translating === 'title'}
              style={translateBtnStyle(!form.titleKo?.trim() || translating === 'title')}
              title={isKo ? '일본어로 번역' : '日本語に翻訳'}
            >
              {translating === 'title'
                ? <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                : <TranslateIcon sx={{ fontSize: 16 }} />}
            </button>
          </div>
        </Field>
        <Field label={isKo ? '제목 (일본어) *' : 'タイトル (日本語) *'}>
          <input style={inputStyle} value={form.titleJa} onChange={e => set('titleJa', e.target.value)} />
        </Field>
        <Field label={isKo ? '부제목 (한국어)' : 'サブタイトル (韓国語)'}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={form.subtitleKo ?? ''} onChange={e => set('subtitleKo', e.target.value)} />
            <button
              type="button"
              onClick={() => translateField('subtitle')}
              disabled={!form.subtitleKo?.trim() || translating === 'subtitle'}
              style={translateBtnStyle(!form.subtitleKo?.trim() || translating === 'subtitle')}
              title={isKo ? '일본어로 번역' : '日本語に翻訳'}
            >
              {translating === 'subtitle'
                ? <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                : <TranslateIcon sx={{ fontSize: 16 }} />}
            </button>
          </div>
        </Field>
        <Field label={isKo ? '부제목 (일본어)' : 'サブタイトル (日本語)'}>
          <input style={inputStyle} value={form.subtitleJa ?? ''} onChange={e => set('subtitleJa', e.target.value)} />
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
          {isKo ? '수정하기' : '更新する'}
        </button>
      </ModalBox>
    </Overlay>
  );
};

export default SectionFormModal;
