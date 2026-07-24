import { useState } from 'react';
import TranslateIcon from '@mui/icons-material/Translate';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { translateDormitoryText } from '../../../api/dormitory';
import type { DormitoryItem } from '../../../api/dormitory';
import { Overlay, ModalBox, ModalHeader } from '../../../components/ModalShell';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid #e0e0e0', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, minHeight: 60, resize: 'vertical', fontFamily: 'inherit',
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

type ItemForm = Omit<DormitoryItem, 'id' | 'sectionId' | 'sortOrder'>;

// 기숙사 항목(층별/카테고리) 추가·수정 모달
const ItemFormModal = ({
  sectionType, initial, pinLocked, isKo, onSave, onClose,
}: {
  sectionType: 'floor' | 'category';
  initial?: DormitoryItem;
  pinLocked?: boolean; // true면 비밀번호 입력창을 숨김 — 이 섹션의 다른 항목이 이미 비밀번호를 갖고 있어 더 추가할 필요가 없는 경우
  isKo: boolean;
  onSave: (form: ItemForm) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<ItemForm>({
    textKo: initial?.textKo ?? '',
    textJa: initial?.textJa ?? '',
    warningKo: initial?.warningKo ?? '',
    warningJa: initial?.warningJa ?? '',
    pin: initial?.pin ?? '',
    isDanger: initial?.isDanger ?? false,
  });

  const set = <K extends keyof ItemForm>(key: K, val: ItemForm[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const isEdit = !!initial;

  // 폼 직접 입력 중 필드별 "번역" 버튼 (관리자가 명시적으로 눌렀을 때만 해당 필드 하나만 번역)
  const [translating, setTranslating] = useState<null | 'text' | 'warning'>(null);
  const translateField = async (field: 'text' | 'warning') => {
    const koKey = field === 'text' ? 'textKo' : 'warningKo';
    const jaKey = field === 'text' ? 'textJa' : 'warningJa';
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

  // DB 제약(NOT NULL): text_ko, text_ja
  const canSubmit = form.textKo.trim().length > 0 && form.textJa.trim().length > 0;

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader
          title={isEdit ? (isKo ? '항목 수정' : '項目編集') : (isKo ? '항목 추가' : '項目追加')}
          onClose={onClose}
        />

        <Field label={isKo ? '내용 (한국어) *' : '内容 (韓国語) *'}>
          <div style={{ display: 'flex', gap: 6 }}>
            <textarea style={{ ...textareaStyle, flex: 1 }} value={form.textKo} onChange={e => set('textKo', e.target.value)} />
            <button
              type="button"
              onClick={() => translateField('text')}
              disabled={!form.textKo.trim() || translating === 'text'}
              style={translateBtnStyle(!form.textKo.trim() || translating === 'text')}
              title={isKo ? '일본어로 번역' : '日本語に翻訳'}
            >
              {translating === 'text'
                ? <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                : <TranslateIcon sx={{ fontSize: 16 }} />}
            </button>
          </div>
        </Field>
        <Field label={isKo ? '내용 (일본어) *' : '内容 (日本語) *'}>
          <textarea style={textareaStyle} value={form.textJa} onChange={e => set('textJa', e.target.value)} />
        </Field>

        {sectionType === 'floor' && (
          <>
            <Field label={isKo ? '경고 문구 (한국어)' : '警告文 (韓国語)'}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={{ ...inputStyle, flex: 1 }} value={form.warningKo ?? ''} onChange={e => set('warningKo', e.target.value)} />
                <button
                  type="button"
                  onClick={() => translateField('warning')}
                  disabled={!form.warningKo?.trim() || translating === 'warning'}
                  style={translateBtnStyle(!form.warningKo?.trim() || translating === 'warning')}
                  title={isKo ? '일본어로 번역' : '日本語に翻訳'}
                >
                  {translating === 'warning'
                    ? <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                    : <TranslateIcon sx={{ fontSize: 16 }} />}
                </button>
              </div>
            </Field>
            <Field label={isKo ? '경고 문구 (일본어)' : '警告文 (日本語)'}>
              <input style={inputStyle} value={form.warningJa ?? ''} onChange={e => set('warningJa', e.target.value)} />
            </Field>
          </>
        )}

        {sectionType === 'category' && (
          <>
            {!pinLocked && (
              <Field label={isKo ? '비밀번호 (선택)' : 'パスワード（任意）'}>
                <input style={inputStyle} value={form.pin ?? ''} onChange={e => set('pin', e.target.value)} placeholder={isKo ? '예: 1234' : '例: 1234'} />
              </Field>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#333', marginBottom: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isDanger} onChange={e => set('isDanger', e.target.checked)} />
              {isKo ? '금지 규칙으로 표시' : '禁止ルールとして表示'}
            </label>
          </>
        )}

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

export default ItemFormModal;
