import {useEffect, useRef} from 'react';
import {useQuery} from '@tanstack/react-query';
import {rewardStore} from '../../store/rewardStore';
import instance from '../axiosInterceptor';
import {userStore} from '../../store/userStore';

export const useRewardSync = () => {
  const user = userStore(state => state.user);
  const setCharCount = rewardStore(state => state.setCharCount);
  const setBadgeCount = rewardStore(state => state.setBadgeCount);
  const isInitialMount = useRef(true);

  const getMyCharacters = async () => {
    const response = await instance.get(`/user/characters/${user.id}`);
    return response.data.totalElements;
  };

  const getMyBadges = async () => {
    const response = await instance.get(`/user/badges`);
    return response.data.length;
  };

  // 1. 캐릭터 데이터 감시
  const {data: charCount} = useQuery({
    queryKey: ['myCharacters'],
    queryFn: getMyCharacters,
    enabled: user.id >= 0,
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  // 2. 배지 데이터 감시
  const {data: badgesCount} = useQuery({
    queryKey: ['myBadges'],
    queryFn: getMyBadges,
    enabled: user.id >= 0,
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  // 3. [핵심] React Query 데이터가 바뀌면 -> Zustand Store에 즉시 반영
  useEffect(() => {
    if (charCount != null) {
      setCharCount(charCount); // Store에 넣으면서 hasNewCharacter 계산됨
    }
  }, [charCount, setCharCount]);

  useEffect(() => {
    if (badgesCount != null) {
      setBadgeCount(badgesCount); // Store에 넣으면서 hasNewBadge 계산됨
    }
  }, [badgesCount, setBadgeCount]);
};
