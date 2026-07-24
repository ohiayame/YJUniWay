import { useState } from 'react';
import TranslateIcon from '@mui/icons-material/Translate';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { translateScheduleText } from '../../../api/schedule';
import type { Schedule } from '../../../api/schedule';
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

// 입력 필드 컴포넌트 (레이블 + 입력창)
const Field = ({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ marginBottom: 12, ...style }}>
    <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

// date/titleJa/locationKo는 set()이 항상 문자열로만 채우도록 강제하므로(NOT NULL 필드) null을 제외
type ScheduleForm = Omit<Schedule, 'id' | 'locationKo'> & { locationKo: string };

// 일정 추가/수정 모달
const ScheduleFormModal = ({
  initial, isKo, onSave, onClose,
}: {
  initial?: Schedule; isKo: boolean;
  onSave: (form: ScheduleForm) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<ScheduleForm>({
    date: initial?.date ?? '',
    timeStart: initial?.timeStart ?? '',
    timeEnd: initial?.timeEnd ?? '',
    titleKo: initial?.titleKo ?? '',
    titleJa: initial?.titleJa ?? '',
    locationKo: initial?.locationKo ?? '',
    locationJa: initial?.locationJa ?? '',
    managerName: initial?.managerName ?? '',
    notesKo: initial?.notesKo ?? '',
    notesJa: initial?.notesJa ?? '',
  });

  const set = (key: keyof ScheduleForm, val: string) =>
    setForm(prev => ({ ...prev, [key]: (key === 'date' || key === 'titleJa' || key === 'locationKo') ? val : (val || null) }));

  const isEdit = !!initial;
  const [showConfirm, setShowConfirm] = useState(false);

  // 폼 직접 입력 중 필드별 "번역" 버튼 (관리자가 명시적으로 눌렀을 때만 해당 필드 하나만 번역)
  const [translating, setTranslating] = useState<null | 'title' | 'location' | 'notes'>(null);
  const translateField = async (field: 'title' | 'location' | 'notes') => {
    const koKey = field === 'title' ? 'titleKo' : field === 'location' ? 'locationKo' : 'notesKo';
    const jaKey = field === 'title' ? 'titleJa' : field === 'location' ? 'locationJa' : 'notesJa';
    const koValue = form[koKey];
    if (!koValue?.trim()) return;

    setTranslating(field);
    try {
      const { translated } = await translateScheduleText(koValue);
      set(jaKey, translated);
    } catch {
      // 번역 실패 시 조용히 무시, 관리자가 직접 입력 가능
    } finally {
      setTranslating(null);
    }
  };

  // DB 제약(NOT NULL): date, titleJa, locationKo — 백엔드에 DTO validation이 없어 누락 시 500이 나므로 폼에서 먼저 막음
  const canSubmit = form.date.trim().length > 0 && form.titleJa.trim().length > 0 && form.locationKo.trim().length > 0;

  if (showConfirm) {
    const rows: { label: string; value: string | null | undefined }[] = [
      { label: isKo ? '날짜' : '日付', value: form.date },
      { label: isKo ? '시간' : '時間', value: form.timeStart ? `${form.timeStart}${form.timeEnd ? ` ~ ${form.timeEnd}` : ''}` : '-' },
      { label: isKo ? '일정명(한)' : 'タイトル(韓)', value: form.titleKo },
      { label: isKo ? '일정명(일)' : 'タイトル(日)', value: form.titleJa },
      { label: isKo ? '장소(한)' : '場所(韓)', value: form.locationKo },
      { label: isKo ? '장소(일)' : '場所(日)', value: form.locationJa },
      { label: isKo ? '담당자' : '担当者', value: form.managerName },
      { label: isKo ? '비고(한)' : '備考(韓)', value: form.notesKo },
      { label: isKo ? '비고(일)' : '備考(日)', value: form.notesJa },
    ];
    return (
      <Overlay onClose={onClose}>
        <ModalBox>
          <ModalHeader title={isEdit ? (isKo ? '수정 내용 확인' : '更新内容の確認') : (isKo ? '추가 내용 확인' : '追加内容の確認')} onClose={onClose} />
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
            {isEdit
              ? (isKo ? '아래 내용으로 수정하시겠습니까?' : '以下の内容で更新しますか？')
              : (isKo ? '아래 내용으로 추가하시겠습니까?' : '以下の内容で追加しますか？')}
          </div>
          <div style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            {rows.map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 14px',
                borderBottom: i < rows.length - 1 ? '1px solid #f5f5f5' : 'none',
                background: i % 2 === 0 ? 'white' : '#fafafa',
              }}>
                <span style={{ fontSize: 11, color: '#aaa', minWidth: 72 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#111', textAlign: 'right' }}>{row.value || '-'}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
              {isKo ? '돌아가기' : '戻る'}
            </button>
            <button onClick={() => onSave(form)} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#1a1a2e', color: 'white', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
              {isEdit ? (isKo ? '수정하기' : '更新する') : (isKo ? '추가하기' : '追加する')}
            </button>
          </div>
        </ModalBox>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader title={isEdit ? (isKo ? '일정 수정' : 'スケジュール編集') : (isKo ? '일정 추가' : 'スケジュール追加')} onClose={onClose} />

        <Field label={isKo ? '날짜 *' : '日付 *'}>
          <input type="date" style={inputStyle} value={form.date} onChange={e => set('date', e.target.value)} />
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label={isKo ? '시작 시간' : '開始時間'} style={{ flex: 1 }}>
            <input type="time" style={inputStyle} value={form.timeStart ?? ''} onChange={e => set('timeStart', e.target.value)} />
          </Field>
          <Field label={isKo ? '종료 시간' : '終了時間'} style={{ flex: 1 }}>
            <input type="time" style={inputStyle} value={form.timeEnd ?? ''} onChange={e => set('timeEnd', e.target.value)} />
          </Field>
        </div>

        <Field label={isKo ? '일정명 (일본어) *' : 'タイトル (日本語) *'}>
          <input style={inputStyle} value={form.titleJa} onChange={e => set('titleJa', e.target.value)} placeholder="オリエンテーション" />
        </Field>
        <Field label={isKo ? '일정명 (한국어)' : 'タイトル (韓国語)'}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={form.titleKo ?? ''} onChange={e => set('titleKo', e.target.value)} placeholder="오리엔테이션" />
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

        <Field label={isKo ? '집합 장소 (한국어) *' : '集合場所 (韓国語) *'}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={form.locationKo} onChange={e => set('locationKo', e.target.value)} placeholder="대강당" />
            <button
              type="button"
              onClick={() => translateField('location')}
              disabled={!form.locationKo?.trim() || translating === 'location'}
              style={translateBtnStyle(!form.locationKo?.trim() || translating === 'location')}
              title={isKo ? '일본어로 번역' : '日本語に翻訳'}
            >
              {translating === 'location'
                ? <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                : <TranslateIcon sx={{ fontSize: 16 }} />}
            </button>
          </div>
        </Field>
        <Field label={isKo ? '집합 장소 (일본어)' : '集合場所 (日本語)'}>
          <input style={inputStyle} value={form.locationJa ?? ''} onChange={e => set('locationJa', e.target.value)} placeholder="大講堂" />
        </Field>

        <Field label={isKo ? '담당자' : '担当者'}>
          <input style={inputStyle} value={form.managerName ?? ''} onChange={e => set('managerName', e.target.value)} placeholder="김담당" />
        </Field>

        <Field label={isKo ? '비고 (한국어)' : '備考 (韓国語)'}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={form.notesKo ?? ''} onChange={e => set('notesKo', e.target.value)} placeholder={isKo ? '우천 시 실내로 변경' : ''} />
            <button
              type="button"
              onClick={() => translateField('notes')}
              disabled={!form.notesKo?.trim() || translating === 'notes'}
              style={translateBtnStyle(!form.notesKo?.trim() || translating === 'notes')}
              title={isKo ? '일본어로 번역' : '日本語に翻訳'}
            >
              {translating === 'notes'
                ? <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                : <TranslateIcon sx={{ fontSize: 16 }} />}
            </button>
          </div>
        </Field>
        <Field label={isKo ? '비고 (일본어)' : '備考 (日本語)'}>
          <input style={inputStyle} value={form.notesJa ?? ''} onChange={e => set('notesJa', e.target.value)} placeholder={isKo ? '' : '雨天時は室内に変更'} />
        </Field>

        <button
          onClick={() => {
            if (!canSubmit) return;
            setShowConfirm(true);
          }}
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

export default ScheduleFormModal;
