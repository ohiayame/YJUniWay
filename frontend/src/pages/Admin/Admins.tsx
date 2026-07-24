import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { getAdmins, updateAdmin, removeAdmin } from '../../api/admin';
import type { Admin } from '../../api/admin';

const AdminListPage = () => {
  const navigate = useNavigate();
  const { isAdmin, role, id: currentAdminId } = useAppSelector((state) => state.auth);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [roleChangeId, setRoleChangeId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getAdmins().then(setAdmins).catch(() => setAdmins([]));
  }, []);

  // 관리자 미인증 시 차단
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
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>관리자만 접근할 수 있는 페이지입니다.</div>
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

  const changeRole = async (id: number) => {
    const target = admins.find(a => a.id === id);
    if (!target) return;
    const nextRole = target.role === 'professor' ? 'staff' : 'professor';
    try {
      const updated = await updateAdmin(id, { role: nextRole, isApproved: true });
      setAdmins(prev => prev.map(a => a.id === id ? updated : a));
    } catch {
      // API 오류 시 상태 유지
    }
  };

  const deleteStaff = async (id: number) => {
    try {
      await removeAdmin(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
    } catch {
      // API 오류 시 상태 유지
    }
  };

  const professors = admins.filter(a => a.role === 'professor');
  const staffList = admins.filter(a => a.role === 'staff');
  const isCurrentAdminStudentOrigin = !!admins.find(a => a.id === currentAdminId)?.studentId;

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

        {/* 관리자 섹션 */}
        <SectionLabel label="관리자" />
        <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {professors.map((admin, idx) => {
            const isTrueProfessor = !admin.studentId;
            const canChangeRole =
              admin.id !== currentAdminId &&
              professors.length > 1 &&
              !(isCurrentAdminStudentOrigin && isTrueProfessor);
            return (
              <AdminRow
                key={admin.id}
                admin={admin}
                isLast={idx === professors.length - 1}
                onToggle={undefined}
                onChangeRole={canChangeRole ? () => setRoleChangeId(admin.id) : undefined}
                onDelete={undefined}
              />
            );
          })}
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
              onChangeRole={() => setRoleChangeId(admin.id)}
              onDelete={() => setDeletingId(admin.id)}
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

    {/* 역할 변경 확인 모달 */}
    {roleChangeId !== null && (() => {
      const target = admins.find(a => a.id === roleChangeId)!;
      const nextRoleLabel = target.role === 'professor' ? '스태프' : '관리자';
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
              {nextRoleLabel}로 변경하시겠습니까?
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>
              {target.name} ({target.studentId})
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setRoleChangeId(null)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12,
                  border: '1px solid #eee', background: 'white',
                  fontSize: 13, color: '#888', cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                onClick={() => { changeRole(roleChangeId); setRoleChangeId(null); }}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: '#1a1a2e', color: 'white',
                  fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
                }}
              >
                변경
              </button>
            </div>
          </div>
        </div>
      );
    })()}

    {/* 스태프 삭제 확인 모달 */}
    {deletingId !== null && (() => {
      const target = admins.find(a => a.id === deletingId)!;
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
              삭제하시겠습니까?
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>
              {target.name} ({target.studentId})<br />삭제 후에는 되돌릴 수 없습니다.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeletingId(null)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12,
                  border: '1px solid #eee', background: 'white',
                  fontSize: 13, color: '#888', cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                onClick={() => { deleteStaff(deletingId); setDeletingId(null); }}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: '#ffebee', color: '#c62828',
                  fontSize: 13, fontWeight: 'bold', cursor: 'pointer',
                }}
              >
                삭제
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

const AdminRow = ({ admin, isLast, onToggle, onChangeRole, onDelete }: {
  admin: Admin;
  isLast: boolean;
  onToggle: (() => void) | undefined;
  onChangeRole: (() => void) | undefined;
  onDelete: (() => void) | undefined;
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
          ? <AdminPanelSettingsIcon sx={{ fontSize: 20, color: '#1565c0' }} />
          : <PersonIcon sx={{ fontSize: 20, color: '#888' }} />
        }
      </div>

      {/* 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#111' }}>{admin.name}</div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
          {admin.studentId ? `학번: ${admin.studentId}` : (isProfessor ? '관리자' : '교수 가입 신청')}
          {' · '}{admin.phone}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* 승인하기 (스태프 · 미승인 상태만) */}
        {onToggle && !admin.isApproved && (
          <button
            onClick={onToggle}
            style={{
              padding: '5px 12px', borderRadius: 20,
              border: 'none', background: '#1a1a2e',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              cursor: 'pointer', flexShrink: 0,
              fontSize: 11, fontWeight: 'bold', color: 'white',
            }}
          >
            승인하기
          </button>
        )}

        {/* 관리자 ↔ 스태프 역할 변경 (관리자 · 승인된 스태프만) */}
        {onChangeRole && (isProfessor || admin.isApproved) && (
          <button
            onClick={onChangeRole}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', borderRadius: 20,
              border: '1px solid #90caf9', background: '#e3f2fd',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <SwapHorizIcon sx={{ fontSize: 14, color: '#1565c0' }} />
            <span style={{ fontSize: 11, fontWeight: 'bold', color: '#1565c0' }}>
              권한
            </span>
          </button>
        )}

        {/* 스태프 삭제 */}
        {onDelete && (
          <button
            onClick={onDelete}
            title="삭제"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid #ffcdd2', background: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 16, color: '#c62828' }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminListPage;
