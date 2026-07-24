import { useState } from 'react';
import TranslateIcon from '@mui/icons-material/Translate';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { translateLaundryText } from '../../../../api/laundry';
import type { LaundrySettings } from '../../../../api/laundry';
import { Overlay, ModalBox, ModalHeader } from '../../../../components/ModalShell';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid #e0e0e0', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
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

type SettingsForm = Partial<Omit<LaundrySettings, 'id' | 'updatedAt'>>;

// 세탁기 설정(요금/결제앱/주의사항) 편집 모달 — 영상/이미지는 정적 파일이라 이 폼 범위 밖
const LaundrySettingsFormModal = ({
  initial, isKo, onSave, onClose,
}: {
  initial: LaundrySettings | null; isKo: boolean;
  onSave: (form: SettingsForm) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<SettingsForm>({
    washPrice: initial?.washPrice ?? '',
    dryPrice: initial?.dryPrice ?? '',
    appName: initial?.appName ?? '',
    appUrl: initial?.appUrl ?? '',
    warningKo: initial?.warningKo ?? '',
    warningJa: initial?.warningJa ?? '',
  });

  const set = (key: keyof SettingsForm, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // 폼 직접 입력 중 필드별 "번역" 버튼 (관리자가 명시적으로 눌렀을 때만 해당 필드 하나만 번역)
  const [translating, setTranslating] = useState(false);
  const translateWarning = async () => {
    const koValue = form.warningKo;
    if (!koValue?.trim()) return;

    setTranslating(true);
    try {
      const { translated } = await translateLaundryText(koValue);
      set('warningJa', translated);
    } catch {
      // 번역 실패 시 조용히 무시, 관리자가 직접 입력 가능
    } finally {
      setTranslating(false);
    }
  };

  // DB 제약(NOT NULL): wash_price, dry_price, app_name, app_url
  const canSubmit = !!form.washPrice?.trim() && !!form.dryPrice?.trim() && !!form.appName?.trim() && !!form.appUrl?.trim();

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader title={isKo ? '세탁기 설정 편집' : '洗濯機設定編集'} onClose={onClose} />

        <Field label={isKo ? '세탁기 요금 *' : '洗濯機料金 *'}>
          <input style={inputStyle} value={form.washPrice ?? ''} onChange={e => set('washPrice', e.target.value)} placeholder="700원" />
        </Field>
        <Field label={isKo ? '건조기 요금 *' : '乾燥機料金 *'}>
          <input style={inputStyle} value={form.dryPrice ?? ''} onChange={e => set('dryPrice', e.target.value)} placeholder="700원~" />
        </Field>
        <Field label={isKo ? '결제 앱 이름 *' : '決済アプリ名 *'}>
          <input style={inputStyle} value={form.appName ?? ''} onChange={e => set('appName', e.target.value)} placeholder="메타클럽" />
        </Field>
        <Field label={isKo ? '결제 앱 URL *' : '決済アプリURL *'}>
          <input style={inputStyle} value={form.appUrl ?? ''} onChange={e => set('appUrl', e.target.value)} placeholder="https://www.metaclub.im/" />
        </Field>
        <Field label={isKo ? '주의사항 (한국어)' : '注意事項 (韓国語)'}>
          <div style={{ display: 'flex', gap: 6 }}>
            <textarea style={{ ...inputStyle, flex: 1, minHeight: 60, resize: 'vertical' }} value={form.warningKo ?? ''} onChange={e => set('warningKo', e.target.value)} />
            <button
              type="button"
              onClick={translateWarning}
              disabled={!form.warningKo?.trim() || translating}
              style={translateBtnStyle(!form.warningKo?.trim() || translating)}
              title={isKo ? '일본어로 번역' : '日本語に翻訳'}
            >
              {translating
                ? <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                : <TranslateIcon sx={{ fontSize: 16 }} />}
            </button>
          </div>
        </Field>
        <Field label={isKo ? '주의사항 (일본어)' : '注意事項 (日本語)'}>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.warningJa ?? ''} onChange={e => set('warningJa', e.target.value)} />
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

export default LaundrySettingsFormModal;
