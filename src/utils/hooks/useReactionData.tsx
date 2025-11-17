import {useQuery} from '@tanstack/react-query';
import instance from '../axiosInterceptor';
import {useMemo} from 'react';

const useReactionData = (questId: number | string) => {
  const {data: response, isLoading} = useQuery({
    queryKey: ['reactions', questId],
    queryFn: async () => {
      const {data} = await instance.get(`/quest/${questId}/reactions`);
      return data;
    },
  });
  const processedData = useMemo(() => {
    if (!response) {
      return;
    }
    return {
      counts: response,
    };
  }, [response]);
  return {...processedData, isLoading};
};

export default useReactionData;
