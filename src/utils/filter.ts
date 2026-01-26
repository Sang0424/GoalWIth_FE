const forbiddenWords = [
  '바보',
  '멍청이',
  '쓰레기',
  '나쁜놈',
  '개자식',
  '씨발',
  '병신',
  '존나',
  '개새끼',
];

/**
 * 텍스트에 금칙어가 포함되어 있는지 확인합니다.
 * @param text 확인할 텍스트
 * @returns 금칙어 포함 여부 (true/false)
 */
export const checkForProfanity = (text: string): boolean => {
  if (!text) return false;
  const lowerCaseText = text.toLowerCase();
  for (const word of forbiddenWords) {
    if (lowerCaseText.includes(word)) {
      return true;
    }
  }
  return false;
};
