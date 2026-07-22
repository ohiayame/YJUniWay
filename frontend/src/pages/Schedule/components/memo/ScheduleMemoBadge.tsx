import { useAppSelector } from '../../../../store';
import { selectMemo, selectBlockCount } from '../../../../store/slices/memoSlice';

// 일정별 메모 아이콘 위에 붙는 줄 개수 배지 (공유+나만보기 합산, 0개면 표시 안 함)
const ScheduleMemoBadge = ({ scheduleId, active }: { scheduleId: number; active: boolean }) => {
  const target = { targetType: 'schedule' as const, targetDate: null, scheduleId };
  const sharedMemo = useAppSelector((state) => selectMemo(state, { ...target, visibility: 'shared' }));
  const sharedCount = useAppSelector((state) => selectBlockCount(state, sharedMemo?.id));
  const privateMemo = useAppSelector((state) => selectMemo(state, { ...target, visibility: 'private' }));
  const privateCount = useAppSelector((state) => selectBlockCount(state, privateMemo?.id));

  const total = sharedCount + privateCount;
  if (total === 0) return null;

  return (
    <span style={{
      position: 'absolute', top: -4, right: -4,
      background: active ? 'white' : '#4d4a7a', color: active ? '#4d4a7a' : 'white',
      fontSize: 8.5, fontWeight: 700, borderRadius: '50%', width: 13, height: 13,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {total}
    </span>
  );
};

export default ScheduleMemoBadge;
