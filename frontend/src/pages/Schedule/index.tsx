import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '../../components/PageLayout';
import { getSchedules } from '../../api/schedule';
import type { Schedule } from '../../api/schedule';
import { TODAY, isRollCallItem } from './utils';
import DateStrip from './components/DateStrip';
import ScheduleTimeline from './components/ScheduleTimeline';

const SchedulePage = () => {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);

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
      {/* 일정 타임라인 */}
      <ScheduleTimeline
        timelineItems={timelineItems}
        isFreeDay={isFreeDay}
        mainCount={mainCount}
        selectedDate={selectedDate}
        isKo={isKo}
      />
    </PageLayout>
  );
};

export default SchedulePage;
