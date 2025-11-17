import instance from './axiosInterceptor';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Alert} from 'react-native';

export const useCancelRequestPeer = () => {
  const queryClient = useQueryClient();

  // ✅ 커스텀 훅의 최상위 레벨에서 useMutation을 호출합니다. (규칙 준수)
  const {mutate: cancelRequestPeer} = useMutation({
    mutationFn: async (user: any) => {
      const response = await instance.delete(`/peer/requesting/${user?.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['peers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeers']});
      queryClient.invalidateQueries({queryKey: ['requestingPeers']});
      queryClient.invalidateQueries({queryKey: ['recommendPeers']});
      queryClient.invalidateQueries({queryKey: ['myPeers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeersCount']});
      queryClient.invalidateQueries({queryKey: ['isAlreadyRequest']});
    },
    onError: (error: any) => {
      Alert.alert(`${error.response.data.message}`);
    },
  });

  // ✅ 훅은 useMutation의 결과(mutate 함수, isPending 등)를 반환합니다.
  return cancelRequestPeer;
};
