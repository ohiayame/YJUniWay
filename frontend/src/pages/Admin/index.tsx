import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setAdmin, clearAdmin } from '../../store/slices/authSlice';
import { mockAdmins } from '../../mock/adminData';

const AdminPage = () => {
  const dispatch = useDispatch();
  const { isAdmin, role, name } = useSelector((state: RootState) => state.auth);

  if (isAdmin) {
    return <AdminDashboard name={name} role={role} onLogout={() => dispatch(clearAdmin())} />;
  }

  return <LoginForm onLogin={(name, role) => dispatch(setAdmin({ name, role }))} />;
};

/* ─── 로그인 폼 ─── */

const LoginForm = ({ onLogin }: {
  onLogin: (name: string, role: 'professor' | 'staff') => void;
}) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const admin = mockAdmins.find(a => {
      const idMatch = a.role === 'professor'
        ? a.name === studentId   // 교수는 이름으로 로그인
        : a.student_id === studentId;
      return idMatch && a.password === password;
    });

    if (!admin) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    if (admin.role === 'staff' && !admin.is_approved) {
      setError('교수님의 승인이 필요합니다.');
      return;
    }

    onLogin(admin.name, admin.role);
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
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>아이디 (교수님: 이름 / 스태프: 학번)</div>
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
            }}
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─── 로그인 후 대시보드 (임시) ─── */

const AdminDashboard = ({ name, role, onLogout }: {
  name: string | null;
  role: 'professor' | 'staff' | null;
  onLogout: () => void;
}) => {
  const navigate = useNavigate();
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
      textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64,
        background: role === 'professor' ? '#e3f2fd' : '#e8f5e9',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
      }}>
        {role === 'professor'
          ? <SchoolIcon sx={{ fontSize: 32, color: '#1565c0' }} />
          : <PersonIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
        }
      </div>
      <div style={{ fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 }}>
        {name}
      </div>
      <div style={{
        display: 'inline-block',
        fontSize: 11,
        color: role === 'professor' ? '#1565c0' : '#2e7d32',
        background: role === 'professor' ? '#e3f2fd' : '#e8f5e9',
        borderRadius: 20,
        padding: '3px 12px',
        marginBottom: 28,
      }}>
        {role === 'professor' ? '교수님' : '스태프'}
      </div>
      {role === 'professor' && (
        <button
          onClick={() => navigate('/admin/admins')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#f5f5f5', borderRadius: 12, padding: '14px 16px',
            border: 'none', cursor: 'pointer', marginBottom: 24,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#111', fontWeight: 500 }}>
            <ManageAccountsIcon sx={{ fontSize: 18, color: '#1a1a2e' }} />
            관리자 목록
          </span>
          <span style={{ fontSize: 12, color: '#aaa' }}>›</span>
        </button>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      <button
        onClick={onLogout}
        style={{
          padding: '10px 28px',
          borderRadius: 12,
          border: '1px solid #cdcdcd',
          background: '#fff3f3',
          fontSize: 13,
          color: '#606060',
          cursor: 'pointer',
        }}
      >
        로그아웃
      </button>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '10px 20px',
          borderRadius: 12,
          border: '1px solid  #cdcdcd',
          background: '#e5f7ff',
          fontSize: 13,
          color: '#606060',
          cursor: 'pointer',
        }}
      >
        메인 페이지
      </button>
      </div>
    </div>
  </div>
  );
};
export default AdminPage;
