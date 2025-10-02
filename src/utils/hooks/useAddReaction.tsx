import {useMutation, useQueryClient} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';

type ReactableType = 'quest' | 'record';

// 훅에 전달될 데이터 타입과 쿼리 데이터의 타입을 미리 정의하면 좋습니다.
interface QuestData {
  id: number | string;
  reactionCount: number;
  isReactedByMe: boolean;
  // ... other quest properties
}

export const useAddReaction = (
  targetType: ReactableType,
  targetId: number | string,
) => {
  const queryClient = useQueryClient();
  const queryKey = [targetType, targetId]; // 재사용을 위해 쿼리 키를 변수로 정의

  return useMutation({
    mutationFn: (reactionType: string) => {
      const url = `/${targetType}/reaction/${targetId}`;
      return instance.post(url, {reactionType});
    },

    // --- 👇 낙관적 업데이트의 핵심 로직 ---

    onMutate: async newReaction => {
      // 1. 진행 중인 refetch를 취소합니다. (낙관적 업데이트를 덮어쓰지 않도록)
      await queryClient.cancelQueries({queryKey});

      // 2. 롤백을 위해 이전 데이터를 저장해둡니다.
      const previousData = queryClient.getQueryData<QuestData>(queryKey);

      // 3. UI를 즉시 업데이트하기 위해 캐시 데이터를 직접 수정합니다.
      if (previousData) {
        const optimisticData: QuestData = {
          ...previousData,
          reactionCount: previousData.reactionCount + 1,
          isReactedByMe: true,
        };
        queryClient.setQueryData(queryKey, optimisticData);
      }

      // 4. 롤백 함수(onError)에 전달할 컨텍스트로 이전 데이터를 반환합니다.
      return {previousData};
    },

    // 5. 뮤테이션 실패 시, onMutate에서 반환된 컨텍스트를 사용하여 데이터를 롤백합니다.
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      // 사용자에게 에러 알림
      console.error('리액션 추가 실패:', err);
    },

    // 6. 뮤테이션이 성공하든 실패하든, 마지막에는 항상 서버와 상태를 동기화합니다.
    onSettled: () => {
      queryClient.invalidateQueries({queryKey});
    },
  });
};
