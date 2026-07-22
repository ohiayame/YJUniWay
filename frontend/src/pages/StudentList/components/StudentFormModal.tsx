import { useState } from 'react';
import type { Student } from '../../../api/student';
import { Overlay, ModalBox, ModalHeader } from '../../../components/ModalShell';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid #e0e0e0', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};

const warnStyle: React.CSSProperties = {
  fontSize: 11, color: '#e65100', marginTop: 4,
};

// 입력 필드 컴포넌트 (레이블 + 입력창)
const Field = ({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ marginBottom: 12, ...style }}>
    <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

// 학생 개별 추가/수정 모달
const StudentFormModal = ({
  initial, isKo, onSave, onClose,
}: {
  initial?: Student; isKo: boolean;
  onSave: (form: Omit<Student, 'id'>) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<Omit<Student, 'id'>>({
    nameJa: initial?.nameJa ?? '',
    nameKo: initial?.nameKo ?? '',
    nameEn: initial?.nameEn ?? '',
    gender: initial?.gender ?? 'M',
    roomNumber: initial?.roomNumber ?? '',
    notes: initial?.notes ?? '',
  });

  const set = (key: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [key]: (key === 'nameJa' || key === 'gender') ? val : (val || null) }));

  const isEdit = !!initial;
  const [showConfirm, setShowConfirm] = useState(false);
  const hasJa = (v: string) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]/.test(v);
  const hasNonJaChars = (v: string) => /[^\u3040-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\u3000\s]/.test(v);
  const hasKo = (v: string) => /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(v);
  const hasNonKoChars = (v: string) => /[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\s]/.test(v);
  // eslint-disable-next-line no-control-regex
  const hasNonEn = (v: string) => /[^\x00-\x7F\s]/.test(v);

  const warnJa = form.nameJa.trim().length > 0 && (!hasJa(form.nameJa) || hasNonJaChars(form.nameJa));
  const warnKo = (form.nameKo ?? '').trim().length > 0 && (!hasKo(form.nameKo ?? '') || hasNonKoChars(form.nameKo ?? ''));
  const warnEn = (form.nameEn ?? '').trim().length > 0 && hasNonEn(form.nameEn ?? '');

  const canSubmit = form.nameJa.trim().length > 0 && !warnJa && !warnKo && !warnEn;

  // 확인 모달 표시 시, 입력된 내용을 확인하는 화면
  if (showConfirm) {
    const isMale = form.gender === 'M';
    const rows: { label: string; value: string | null | undefined }[] = [
      { label: isKo ? '일본어 이름' : '日本語名', value: form.nameJa },
      { label: isKo ? '한국어 이름' : '韓国語名', value: form.nameKo },
      { label: isKo ? '영어 이름' : '英語名', value: form.nameEn },
      { label: isKo ? '성별' : '性別', value: isKo ? (isMale ? '남성' : '여성') : (isMale ? '男性' : '女性') },
      { label: isKo ? '방 번호' : '部屋番号', value: form.roomNumber || '-' },
      { label: isKo ? '주의사항' : '注意事項', value: form.notes || (isKo ? '없음' : 'なし') },
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

  // 학생 추가/수정 모달 화면
  return (
    <Overlay onClose={onClose}>
      <ModalBox>
        <ModalHeader title={isEdit ? (isKo ? '학생 수정' : '学生編集') : (isKo ? '학생 추가' : '学生追加')} onClose={onClose} />

        <Field label={isKo ? '일본어 이름 *' : '日本語名 *'}>
          <input style={{ ...inputStyle, borderColor: warnJa ? '#e65100' : '#e0e0e0' }} value={form.nameJa} onChange={e => set('nameJa', e.target.value)} placeholder="田中 雄太" />
          {warnJa && <div style={warnStyle}>{isKo ? '일본어(히라가나·가타카나·한자)를 입력해주세요' : '日本語（ひらがな・カタカナ・漢字）を入力してください'}</div>}
        </Field>
        <Field label={isKo ? '한국어 이름' : '韓国語名'}>
          <input style={{ ...inputStyle, borderColor: warnKo ? '#e65100' : '#e0e0e0' }} value={form.nameKo ?? ''} onChange={e => set('nameKo', e.target.value)} placeholder="다나카 유타" />
          {warnKo && <div style={warnStyle}>{isKo ? '한글을 입력해주세요' : '韓国語（ハングル）を入力してください'}</div>}
        </Field>
        <Field label={isKo ? '영어 이름' : '英語名'}>
          <input style={{ ...inputStyle, borderColor: warnEn ? '#e65100' : '#e0e0e0' }} value={form.nameEn ?? ''} onChange={e => set('nameEn', e.target.value)} placeholder="TANAKA Yuta" />
          {warnEn && <div style={warnStyle}>{isKo ? '영문(알파벳)만 입력해주세요' : 'アルファベットのみ入力してください'}</div>}
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label={isKo ? '성별' : '性別'} style={{ flex: 1 }}>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.gender}
              onChange={e => setForm(prev => ({ ...prev, gender: e.target.value as 'M' | 'F' }))}
            >
              <option value="M">{isKo ? '남성' : '男性'}</option>
              <option value="F">{isKo ? '여성' : '女性'}</option>
            </select>
          </Field>
          <Field label={isKo ? '방 번호' : '部屋番号'} style={{ flex: 1 }}>
            <input style={inputStyle} value={form.roomNumber ?? ''} onChange={e => set('roomNumber', e.target.value)} placeholder="101" />
          </Field>
        </div>

        <Field label={isKo ? '주의사항' : '注意事項'}>
          <input style={inputStyle} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder={isKo ? '알레르기 있음' : 'アレルギーあり'} />
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

export default StudentFormModal;
