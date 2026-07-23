import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useAppSelector } from '../../store';
import PageLayout from '../../components/PageLayout';
import { getSchedules, createSchedule, updateSchedule, removeSchedule, removeAllSchedules, bulkCreateSchedules } from '../../api/schedule';
import type { Schedule, ParsedSchedule } from '../../api/schedule';
import { TODAY, isRollCallItem } from './utils';
import DateStrip from './components/DateStrip';
import ScheduleTimeline from './components/ScheduleTimeline';
import ScheduleFormModal from './components/ScheduleFormModal';
import ScheduleDeleteConfirmModal from './components/ScheduleDeleteConfirmModal';
import ScheduleDeleteAllConfirmModal from './components/ScheduleDeleteAllConfirmModal';
import ScheduleImportModal from './components/ScheduleImportModal';
import DateMemoAccordion from './components/memo/DateMemoAccordion';

const SchedulePage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';
  const { isAdmin } = useAppSelector((state) => state.auth);

  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);

  // 모달 상태
  const [editTarget, setEditTarget] = useState<Schedule | null>(null); // null = 추가, Schedule = 수정
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  useEffect(() => {
    // 전체 일정을 한 번 로드하여 날짜 스트립과 타임라인 모두에 사용
    getSchedules()
      .then((data) => {
        setAllSchedules(data);
        // 오늘 날짜가 프로그램 기간에 없으면 첫 번째 날짜로 초기화
        const dates = [...new Set(data.map((s) => s.date))].sort();
        if (dates.length > 0 && !dates.includes(TODAY)) {
          setSelectedDate(dates[0]);
        }
      })
      .catch(() => setAllSchedules([]));
  }, []);

  // 전체 일정에서 고유 날짜 목록 추출 (오름차순)
  const programDates = [...new Set(allSchedules.map((s) => s.date))].sort();

  // 점호만 있는 날 = 자유 탐방일
  const freeDays = new Set(
    programDates.filter((date) => {
      const daySchedules = allSchedules.filter((s) => s.date === date);
      return daySchedules.length > 0 && daySchedules.every(isRollCallItem);
    }),
  );

  // 선택된 날짜의 일정
  const schedules = allSchedules.filter((s) => s.date === selectedDate);
  const isFreeDay = freeDays.has(selectedDate);
  const mainCount = schedules.filter((s) => !isRollCallItem(s)).length;
  const rollCall = schedules.find(isRollCallItem);
  const timelineItems = isFreeDay ? (rollCall ? [rollCall] : []) : schedules;

  // ─── CRUD 핸들러 ───────────────────────────────────────────────────────────
  const handleSave = async (form: Omit<Schedule, 'id'>) => {
    try {
      if (editTarget) {
        const updated = await updateSchedule(editTarget.id, form);
        setAllSchedules(prev => prev.map(s => s.id === editTarget.id ? updated : s));
      } else {
        const created = await createSchedule(form);
        setAllSchedules(prev => [...prev, created]);
        setSelectedDate(created.date);
      }
    } catch {
      // API 오류 시 상태 변경 없이 모달만 닫음
    }
    setShowForm(false);
    setEditTarget(null);
  };

  const handleDelete = async (schedule: Schedule) => {
    try {
      await removeSchedule(schedule.id);
      setAllSchedules(prev => prev.filter(s => s.id !== schedule.id));
    } catch {
      // API 오류 시 목록 유지
    }
    setDeleteTarget(null);
  };

  // AI 파싱 결과 일괄 등록: 트랜잭션 API 한 번 호출 (부분 실패 없이 전체 성공/전체 롤백)
  const handleImportConfirm = async (parsed: ParsedSchedule[]) => {
    try {
      const created = await bulkCreateSchedules(parsed);
      setAllSchedules(prev => [...prev, ...created]);
      setShowImport(false);
    } catch {
      // API 오류 시 모달 유지, 사용자가 내용 확인 후 재시도
    }
  };

  const handleDeleteAll = async () => {
    try {
      await removeAllSchedules();
      setAllSchedules([]);
    } catch {
      // API 오류 시 목록 유지
    }
    setShowDeleteAll(false);
  };

  return (
    <PageLayout titleKo="일정" titleJa="スケジュール">
      {/* 날짜 스트립 */}
      <DateStrip
        programDates={programDates}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        allSchedules={allSchedules}
        freeDays={freeDays}
        isKo={isKo}
      />

      {/* 관리자 전용 날짜 메모 (공유/나만보기) */}
      {isAdmin && <DateMemoAccordion selectedDate={selectedDate} isKo={isKo} />}

      {/* 관리자 전용 일정 추가 / 가져오기 버튼 */}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 8 }}>
          <button
            onClick={() => setShowImport(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 20, border: 'none',
              background: '#e3f2fd', color: '#1565c0', fontSize: 12, cursor: 'pointer',
            }}
          >
            <UploadFileIcon sx={{ fontSize: 15 }} />
            {isKo ? '가져오기' : '読み込み'}
          </button>
          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 20, border: 'none',
              background: '#e8f5e9', color: '#2e7d32', fontSize: 12, cursor: 'pointer',
            }}
          >
            <AddIcon sx={{ fontSize: 15 }} />
            {isKo ? '일정 추가' : '予定追加'}
          </button>
        </div>
      )}

      {/* 관리자 전용 일정 전체 삭제 버튼 (실수 클릭 방지를 위해 추가/가져오기와 분리) */}
      {isAdmin && allSchedules.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            onClick={() => setShowDeleteAll(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 20, border: 'none',
              background: 'none', color: '#c62828', fontSize: 11, cursor: 'pointer',
            }}
          >
            <DeleteSweepIcon sx={{ fontSize: 14 }} />
            {isKo ? '일정 전체 삭제' : '予定を全て削除'}
          </button>
        </div>
      )}

      {/* 일정 타임라인 */}
      <ScheduleTimeline
        timelineItems={timelineItems}
        isFreeDay={isFreeDay}
        mainCount={mainCount}
        selectedDate={selectedDate}
        isKo={isKo}
        isAdmin={isAdmin}
        onEdit={(item) => { setEditTarget(item); setShowForm(true); }}
        onDelete={(item) => setDeleteTarget(item)}
      />

      {/* 모달들 */}
      {showForm && (
        <ScheduleFormModal
          initial={editTarget ?? undefined}
          isKo={isKo}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
      {deleteTarget && (
        <ScheduleDeleteConfirmModal
          schedule={deleteTarget}
          isKo={isKo}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {showImport && (
        <ScheduleImportModal
          isKo={isKo}
          allSchedules={allSchedules}
          onConfirm={handleImportConfirm}
          onClose={() => setShowImport(false)}
        />
      )}
      {showDeleteAll && (
        <ScheduleDeleteAllConfirmModal
          count={allSchedules.length}
          isKo={isKo}
          onConfirm={handleDeleteAll}
          onClose={() => setShowDeleteAll(false)}
        />
      )}
    </PageLayout>
  );
};

export default SchedulePage;
