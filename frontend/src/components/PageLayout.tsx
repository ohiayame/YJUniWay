import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { clearAdmin } from '../store/slices/authSlice';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import BottomTab from './BottomTab';

const today = new Date();
const dateLabel = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
const dateLabelJa = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

interface PageLayoutProps {
  titleKo: string;
  titleJa: string;
  showDateLabel?: boolean;
  children: React.ReactNode;
}

const PageLayout = ({ titleKo, titleJa, children }: PageLayoutProps) => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { role, isAdmin } = useAppSelector((state) => state.auth);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div style={{ paddingBottom: 64, maxWidth: 480, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid #f0f0f0',
        background: 'white', position: 'sticky', top: 0, zIndex: 50, marginBottom: '16px',
      }}>
        <div>
            <div style={{ fontSize: 11, color: '#bbb' }}>
              {isKo ? dateLabel : dateLabelJa}
            </div>
          
          <div style={{ fontSize: 17, fontWeight: 'bold', color: '#111' }}>
            {isKo ? titleKo : titleJa}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {role === 'professor' && (
            <button
              onClick={() => navigate('/admin/admins')}
              style={{
                background: 'transparent', border: '1px solid #ddd', borderRadius: 20,
                padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4,
                cursor: 'pointer',
              }}
            >
              <ManageAccountsIcon sx={{ fontSize: 14, color: '#1a1a2e' }} />
              <span style={{ fontSize: 12, color: '#1a1a2e' }}>{isKo ? '관리자' : '管理者'}</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                background: 'transparent', border: '1px solid #ddd', borderRadius: 20,
                padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4,
                cursor: 'pointer',
              }}
            >
              <LogoutIcon sx={{ fontSize: 14, color: '#888' }} />
              <span style={{ fontSize: 12, color: '#888' }}>{isKo ? '로그아웃' : 'ログアウト'}</span>
            </button>
          )}
          <button
            onClick={() => i18n.changeLanguage(isKo ? 'ja' : 'ko')}
            style={{
              background: 'transparent', border: '1px solid #ddd', borderRadius: 20,
              padding: '4px 10px', fontSize: 12, color: '#555', cursor: 'pointer',
            }}
          >
            {isKo ? '日本語' : '한국어'}
          </button>
        </div>
      </header>

      <main style={{ padding: '0 16px 20px' }}>
        {children}
      </main>

      <BottomTab />

      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, zIndex: 200,
        }}>
          <div style={{
            background: 'white', borderRadius: 20, padding: '28px 24px',
            width: '100%', maxWidth: 320, textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 20 }}>
              {isKo ? '로그아웃하시겠습니까?' : 'ログアウトしますか?'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12,
                  border: '1px solid #eee', background: 'white',
                  fontSize: 13, color: '#888', cursor: 'pointer',
                }}
              >
                {isKo ? '취소' : 'キャンセル'}
              </button>
              <button
                onClick={() => { dispatch(clearAdmin()); setShowLogoutConfirm(false); }}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: '#1a1a2e', color: 'white',
                  fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
                }}
              >
                {isKo ? '로그아웃' : 'ログアウト'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageLayout;
