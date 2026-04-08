import type React from 'react';
import { useTranslation } from 'react-i18next';
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

  return (
    <div style={{ paddingBottom: 64, maxWidth: 480, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid #f0f0f0',
        background: 'white', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
            <div style={{ fontSize: 11, color: '#bbb' }}>
              {isKo ? dateLabel : dateLabelJa}
            </div>
          
          <div style={{ fontSize: 17, fontWeight: 'bold', color: '#111' }}>
            {isKo ? titleKo : titleJa}
          </div>
        </div>
        <button
          onClick={() => i18n.changeLanguage(isKo ? 'ja' : 'ko')}
          style={{
            background: 'transparent', border: '1px solid #ddd', borderRadius: 20,
            padding: '4px 10px', fontSize: 12, color: '#555', cursor: 'pointer',
          }}
        >
          {isKo ? '日本語' : '한국어'}
        </button>
      </header>

      <main style={{ padding: '0 16px 20px' }}>
        {children}
      </main>

      <BottomTab />
    </div>
  );
};

export default PageLayout;
