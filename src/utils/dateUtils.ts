// src/utils/dateUtils.ts

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
