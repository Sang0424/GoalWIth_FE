import {useQuery} from '@tanstack/react-query';
import instance from '../utils/axiosInterceptor';
import {useQuestStore} from '../store/mockData';
import {API_URL} from '@env';
import type {Quest} from '../types/quest.types';
import {useMemo} from 'react';

const isMock = API_URL === '';

// API로부터 데이터를 가져오는 함수
const fetchVerifications = async (): Promise<Quest[]> => {
  const response = await instance.get('/quest/verification');
  return response.data.quests || response.data; // 응답 구조에 따라 조정
};

export const useVerifications = () => {
  // 1. `getSnapshot` 경고 해결: `useMemo`를 사용해 zustand 스토어에서 반환되는 배열을 메모이제이션합니다.
  // 이렇게 하면 getVerificationFeed()가 반환하는 배열의 참조가 동일하게 유지되어 불필요한 리렌더링을 방지합니다.
  const getVerificationFeed = useQuestStore(state => state.getVerificationFeed);
  const mockQuests = useMemo(
    () => getVerificationFeed(),
    [getVerificationFeed],
  );

  // 2. `Maximum update depth` 에러 해결: `useQuery`의 `enabled` 옵션을 사용해 조건부로 데이터를 가져옵니다.
  const queryResult = useQuery<Quest[], Error>({
    queryKey: ['verifications'],
    queryFn: fetchVerifications,
    enabled: !isMock, // isMock이 false일 때만 쿼리 실행
  });

  // 목 모드일 경우, useQuery의 로딩 상태 대신 즉시 데이터를 반환합니다.
  if (isMock) {
    return {
      data: mockQuests,
      isLoading: false, // 목 데이터는 로딩이 필요 없음
      error: null,
      refetch: () => {},
    };
  }

  // API 모드일 경우, useQuery의 결과를 그대로 반환합니다.
  return queryResult;
};
