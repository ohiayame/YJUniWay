import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { mockAdmins } from '../../mock/adminData';

const AdminSignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) setPhone(digits);
    else if (digits.length <= 7) setPhone(`${digits.slice(0, 3)}-${digits.slice(3)}`);
    else setPhone(`${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`);
  };
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    const duplicate = mockAdmins.find(a => a.student_id === studentId);
    if (duplicate) {
      setError('이미 등록된 학번입니다.');
      return;
    }

    setConfirming(true);
  };

  const handleConfirm = () => {
    // TODO: 백엔드 연동 시 API 호출로 교체
    setConfirming(false);
    setDone(true);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: 'white',
        borderRadius: 20,
        padding: '36px 28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>

        {confirming ? (
          /* ── 확인 모달 ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <AssignmentIcon sx={{ fontSize: 36, color: '#1a1a2e' }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 20 }}>
              입력 내용을 확인해주세요
            </div>
            <div style={{
              background: '#f7f7f7', borderRadius: 12,
              padding: '14px 16px', marginBottom: 24,
              fontSize: 13, color: '#333',
              textAlign: 'left', lineHeight: 2,
            }}>
              <div><span style={{ color: '#aaa', marginRight: 8 }}>이름</span>{name}</div>
              <div><span style={{ color: '#aaa', marginRight: 8 }}>학번</span>{studentId}</div>
              <div><span style={{ color: '#aaa', marginRight: 8 }}>전화번호</span>{phone}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirming(false)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12,
                  border: '1px solid #eee', background: 'white',
                  fontSize: 13, color: '#888', cursor: 'pointer',
                }}
              >
                수정하기
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: 12, borderRadius: 12,
                  border: 'none', background: '#1a1a2e',
                  fontSize: 13, color: 'white', fontWeight: 'bold', cursor: 'pointer',
                }}
              >
                신청하기
              </button>
            </div>
          </div>
        ) : done ? (
          /* ── 완료 화면 ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52,
              background: '#e8f5e9',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircleIcon sx={{ fontSize: 30, color: '#2e7d32' }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 8 }}>
              가입 신청 완료
            </div>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 28, lineHeight: 1.6 }}>
              교수님의 승인 후<br />로그인하실 수 있습니다.
            </div>
            <button
              onClick={() => navigate('/admin')}
              style={{
                width: '100%',
                padding: 14,
                background: '#1a1a2e',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              로그인 페이지로
            </button>
          </div>
        ) : (
          /* ── 가입 폼 ── */
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52,
                background: '#1a1a2e',
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 28, color: 'white' }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>스태프 가입 신청</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>교수님 승인 후 로그인 가능합니다</div>
            </div>

            <form onSubmit={handleSubmit}>
              <Field label="*이름">
                <input required style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="이름 입력" />
              </Field>
              <Field label="*학번">
                <input
                  required
                  style={inputStyle}
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="7자리 숫자"
                  pattern="\d{7}"
                  title="학번은 7자리 숫자여야 합니다"
                  inputMode="numeric"
                  maxLength={7}
                />
              </Field>
              <Field label="*전화번호">
                <input
                  required
                  style={inputStyle}
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="전화번호 입력"
                  pattern="01[016789]-\d{3,4}-\d{4}"
                  title="올바른 휴대폰 번호를 입력해주세요 (예: 010-1234-5678)"
                  inputMode="tel"
                />
              </Field>
              <Field label="*비밀번호">
                <input
                  required
                  style={inputStyle}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="8자 이상 입력"
                  minLength={8}
                  title="비밀번호는 8자 이상이어야 합니다"
                />
              </Field>
              <Field label="*비밀번호 확인">
                <input
                  required
                  style={inputStyle}
                  type="password"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                />
              </Field>

              {error && (
                <div style={{
                  background: '#fff3e0',
                  border: '1px solid #ffe0b2',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 12,
                  color: '#e65100',
                  marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: 14,
                  background: '#1a1a2e',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: 10,
                }}
              >
                가입 신청
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'white',
                  color: '#aaa',
                  border: '1px solid #eee',
                  borderRadius: 12,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                로그인으로 돌아가기
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1.5px solid #e0e0e0',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);

export default AdminSignupPage;
