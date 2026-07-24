import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useAppDispatch, useAppSelector } from '../../store';
import { setAdmin } from '../../store/slices/authSlice';
import { login } from '../../api/admin';
import axios from 'axios';

const AdminPage = () => {
  const dispatch = useAppDispatch();
  const { isAdmin } = useAppSelector((state) => state.auth);

  if (isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <LoginForm onLogin={(name, role, id) => dispatch(setAdmin({ name, role, id }))} />;
};

/* ─── 로그인 폼 ─── */

// admin.service.ts login()이 미승인 계정에 대해 던지는 메시지와 동일한 문자열.
// 이 메시지일 때만 "승인 대기" 안내로 다르게 표시한다.
const PENDING_APPROVAL_MESSAGE = '관리자의 승인이 필요합니다.';

const LoginForm = ({ onLogin }: {
  onLogin: (name: string, role: 'professor' | 'staff', id: number) => void;
}) => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(false);
    setLoading(true);

    try {
      const res = await login({ studentId, password });
      // JWT 토큰 저장 (apiClient 인터셉터가 이 키를 사용)
      localStorage.setItem('token', res.accessToken);
      onLogin(res.name, res.role, res.id);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? '로그인에 실패했습니다.')
        : '로그인에 실패했습니다.';
      if (message === PENDING_APPROVAL_MESSAGE) {
        setIsPending(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
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
        {/* 로고 영역 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52,
            background: '#1a1a2e',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 28, color: 'white' }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>관리자 로그인</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>YJUniWay 관리자 전용</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>아이디 (관리자: 이름 / 스태프: 학번)</div>
            <input
              type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="아이디 입력"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1.5px solid #e0e0e0',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>비밀번호</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1.5px solid #e0e0e0',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {isPending && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#e3f2fd',
              border: '1px solid #90caf9',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 16,
            }}>
              <HourglassEmptyIcon sx={{ fontSize: 16, color: '#1565c0' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1565c0' }}>승인 대기 중입니다</div>
                <div style={{ fontSize: 11, color: '#1565c0', marginTop: 2 }}>관리자의 승인 후 로그인할 수 있어요.</div>
              </div>
            </div>
          )}

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
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              background: loading ? '#888' : '#1a1a2e',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 'bold',
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/signup')}
            style={{
              width: '100%',
              padding: 10,
              background: 'transparent',
              color: '#888',
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
