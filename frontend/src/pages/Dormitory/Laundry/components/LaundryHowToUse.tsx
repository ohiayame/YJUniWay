import type { LaundryStep } from '../../../../api/laundry';
import laundryVideo from '../../../../assets/laundry.mov';
import laundryImage from '../../../../assets/laundry.png';

interface LaundryHowToUseProps {
  steps: LaundryStep[];
  isKo: boolean;
}

// 앱 사용법 영상 + 세제 넣는 곳 이미지 + 사용 순서
const LaundryHowToUse = ({ steps, isKo }: LaundryHowToUseProps) => (
  <>
    {/* 앱 사용법 영상 */}
    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
      {isKo ? '앱 사용법' : 'アプリの使い方'}
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
      <video
        src={laundryVideo}
        controls
        style={{ width: '55%', borderRadius: 14 }}
      />
    </div>

    {/* 세제 넣는 곳 */}
    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
      {isKo ? '세제 넣는 곳・코스 선택' : '洗剤の入れ方・コース選択'}
    </div>
    <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
      <img
        src={laundryImage}
        alt={isKo ? '세제 넣는 곳' : '洗剤の入れ方'}
        style={{ width: '100%', display: 'block' }}
      />
    </div>

    {/* 사용 순서 */}
    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#bbb', letterSpacing: 1, marginBottom: 10 }}>
      {isKo ? '사용 순서' : '使い方'}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
      {steps.map((step, i) => (
        <div key={step.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#1a1a2e', color: 'white',
            fontSize: 12, fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {i + 1}
          </div>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5, paddingTop: 4 }}>
            {isKo ? step.textKo : step.textJa}
          </div>
        </div>
      ))}
    </div>
  </>
);

export default LaundryHowToUse;
