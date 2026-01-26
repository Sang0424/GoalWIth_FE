import {format, parseISO, isSameDay} from 'date-fns';
import {ko} from 'date-fns/locale';

export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInMonth = secondsInDay * 30; // Approximation
  const secondsInYear = secondsInDay * 365; // Approximation

  if (diffInSeconds < secondsInMinute) {
    return '방금 전';
  }
  if (diffInSeconds < secondsInHour) {
    const minutes = Math.floor(diffInSeconds / secondsInMinute);
    return `${minutes}분 전`;
  }
  if (diffInSeconds < secondsInDay) {
    const hours = Math.floor(diffInSeconds / secondsInHour);
    return `${hours}시간 전`;
  }
  if (diffInSeconds < secondsInMonth) {
    const days = Math.floor(diffInSeconds / secondsInDay);
    return `${days}일 전`;
  }
  if (diffInSeconds < secondsInYear) {
    const months = Math.floor(diffInSeconds / secondsInMonth);
    return `${months}달 전`;
  }
  const years = Math.floor(diffInSeconds / secondsInYear);
  return `${years}년 전`;
};

export const groupRecordsByDate = (records: any[]) => {
  const grouped: {[key: string]: any[]} = {};
  records.forEach(record => {
    const date = new Date(record.createdAt);
    const dateKey = format(date, 'yyyy-MM-dd');

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(record);
  });
  return Object.entries(grouped)
    .sort(
      ([dateA], [dateB]) =>
        new Date(dateB).getTime() - new Date(dateA).getTime(),
    )
    .map(([date, items]) => ({
      date,
      title: format(new Date(date), 'yyyy년 MM월 dd일 (EEE)', {locale: ko}),
      data: items,
    }));
};
