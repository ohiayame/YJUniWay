import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getAdmins, updateAdmin } from '../../api/admin';
import type { Admin } from '../../api/admin';

const AdminListPage = () => {
  const navigate = useNavigate();
  const { isAdmin, role } = useAppSelector((state) => state.auth);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    getAdmins().then(setAdmins).catch(() => setAdmins([]));
  }, []);

  // 교수 미인증 시 차단
  if (!isAdmin || role !== 'professor') {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: '36px 28px',
          textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', maxWidth: 320, width: '100%',
        }}>
          <CancelIcon sx={{ fontSize: 40, color: '#e57373', marginBottom: 1 }} />
          <div style={{ fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 8 }}>접근 권한 없음</div>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>교수만 접근할 수 있는 페이지입니다.</div>
          <button
            onClick={() => navigate('/admin')}
            style={{
              width: '100%', padding: 12, borderRadius: 12,
              border: 'none', background: '#1a1a2e', color: 'white',
              fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
            }}
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const toggleApproval = async (id: number) => {
    const target = admins.find(a => a.id === id);
    if (!target) return;
    try {
      const updated = await updateAdmin(id, { isApproved: !target.isApproved });
      setAdmins(prev => prev.map(a => a.id === id ? updated : a));
    } catch {
      // API 오류 시 상태 유지
    }
  };

  const professors = admins.filter(a => a.role === 'professor');
  const staffList = admins.filter(a => a.role === 'staff');

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f0f0f0', overflowY: 'auto' }}>
      <div style={{ padding: '0 0 32px' }}>

      {/* 헤더 */}
      <div style={{
        background: 'white',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => navigate('/admin')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 16, color: '#333' }} />
        </button>
        <div style={{ fontSize: 17, fontWeight: 'bold', color: '#111' }}>관리자 목록</div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* 교수 섹션 */}
        <SectionLabel label="교수" />
        <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {professors.map((admin, idx) => (
            <AdminRow
              key={admin.id}
              admin={admin}
              isLast={idx === professors.length - 1}
              onToggle={undefined}
            />
          ))}
        </div>

        {/* 스태프 섹션 */}
        <SectionLabel label="스태프" />
        <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {staffList.length === 0 ? (
            <div style={{ padding: '20px 16px', fontSize: 13, color: '#ccc', textAlign: 'center' }}>
              등록된 스태프가 없습니다
            </div>
          ) : staffList.map((admin, idx) => (
            <AdminRow
              key={admin.id}
              admin={admin}
              isLast={idx === staffList.length - 1}
              onToggle={() => setPendingId(admin.id)}
            />
          ))}
        </div>

      </div>
    </div>

    {/* 승인 상태 변경 확인 모달 */}
    {pendingId !== null && (() => {
      const target = admins.find(a => a.id === pendingId)!;
      const nextApproved = !target.isApproved;
      return (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, zIndex: 100,
        }}>
          <div style={{
            background: 'white', borderRadius: 20, padding: '28px 24px',
            width: '100%', maxWidth: 320, textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 8 }}>
              {nextApproved ? '승인하시겠습니까?' : '승인을 해제하시겠습니까?'}
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>
              {target.name} ({target.studentId})
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setPendingId(null)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12,
                  border: '1px solid #eee', background: 'white',
                  fontSize: 13, color: '#888', cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                onClick={() => { toggleApproval(pendingId); setPendingId(null); }}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: nextApproved ? '#1a1a2e' : '#ffebee',
                  color: nextApproved ? 'white' : '#c62828',
                  fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
                }}
              >
                {nextApproved ? '승인' : '해제'}
              </button>
            </div>
          </div>
        </div>
      );
    })()}
    </div>
  );
};

/* ─── 서브 컴포넌트 ─── */

const SectionLabel = ({ label }: { label: string }) => (
  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#535353', letterSpacing: 1, marginBottom: 8 }}>
    {label.toUpperCase()}
  </div>
);

const AdminRow = ({ admin, isLast, onToggle }: {
  admin: Admin;
  isLast: boolean;
  onToggle: (() => void) | undefined;
}) => {
  const isProfessor = admin.role === 'professor';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: isLast ? 'none' : '1px solid #f5f5f5',
    }}>
      {/* 아이콘 */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: isProfessor ? '#e3f2fd' : '#f5f5f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isProfessor
          ? <SchoolIcon sx={{ fontSize: 20, color: '#1565c0' }} />
          : <PersonIcon sx={{ fontSize: 20, color: '#888' }} />
        }
      </div>

      {/* 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#111' }}>{admin.name}</div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
          {admin.studentId ? `학번: ${admin.studentId}` : '교수님'}
          {' · '}{admin.phone}
        </div>
      </div>

      {/* 승인 토글 (스태프만) */}
      {onToggle && (
        <button
          onClick={onToggle}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 20, border: 'none',
            background: admin.isApproved ? '#e8f5e9' : '#fce4ec',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          {admin.isApproved
            ? <CheckCircleIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
            : <CancelIcon sx={{ fontSize: 14, color: '#c62828' }} />
          }
          <span style={{
            fontSize: 11, fontWeight: 'bold',
            color: admin.isApproved ? '#2e7d32' : '#c62828',
          }}>
            {admin.isApproved ? '승인됨' : '미승인'}
          </span>
        </button>
      )}

      {/* 교수는 승인 뱃지만 표시 */}
      {isProfessor && (
        <div style={{
          fontSize: 11, color: '#1565c0',
          background: '#e3f2fd', borderRadius: 20,
          padding: '3px 10px', flexShrink: 0,
        }}>
          교수님
        </div>
      )}
    </div>
  );
};

export default AdminListPage;
