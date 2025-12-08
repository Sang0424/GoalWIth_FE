import {useEffect, useRef} from 'react';
import {useQuery} from '@tanstack/react-query';
import {rewardStore} from '../../store/rewardStore';
import instance from '../axiosInterceptor';
import {userStore} from '../../store/userStore';

export const useRewardSync = () => {
  const user = userStore(state => state.user);
  const setCharCount = rewardStore(state => state.setCharCount);
  const setBadgeCount = rewardStore(state => state.setBadgeCount);
  const charCountRef = useRef(null);
  const badgeCountRef = useRef(null);

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
    staleTime: 1000 * 60 * 5, // 5분 정도는 캐시 유지 (너무 자주 호출 방지)
    enabled: user.id >= 0,
    refetchOnWindowFocus: false,
  });

  // 2. 배지 데이터 감시
  const {data: badgesCount} = useQuery({
    queryKey: ['myBadges'],
    queryFn: getMyBadges,
    staleTime: 1000 * 60 * 5,
    enabled: user.id >= 0,
    refetchOnWindowFocus: false,
  });

  // 3. [핵심] React Query 데이터가 바뀌면 -> Zustand Store에 즉시 반영
  useEffect(() => {
    if (charCount != null && charCount !== charCountRef.current) {
      setCharCount(charCount); // Store에 넣으면서 hasNewCharacter 계산됨
      charCountRef.current = charCount;
    }
  }, [charCount, setCharCount]);

  useEffect(() => {
    if (badgesCount != null && badgesCount !== badgeCountRef.current) {
      setBadgeCount(badgesCount); // Store에 넣으면서 hasNewBadge 계산됨
      badgeCountRef.current = badgesCount;
    }
  }, [badgesCount, setBadgeCount]);
};
