import {useMutation, useQueryClient} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';

type ReactableType = 'quest' | 'record';

// 이전에 정의했던 데이터 타입
interface QuestData {
  id: number | string;
  reactionCount: number;
  isReactedByMe: boolean;
  // ... other properties
}

export const useDeleteReaction = (
  targetType: ReactableType,
  targetId: number | string,
) => {
  const queryClient = useQueryClient();
  const queryKey = [targetType, targetId];

  return useMutation({
    // 이 뮤테이션은 취소할 '리액션의 ID'를 인자로 받을 수 있습니다.
    // API 설계에 따라 (reactionId: number | string) 등이 될 수 있습니다.
    mutationFn: (reactionId: number | string) => {
      // API 엔드포인트는 리액션 자체를 가리키는 것이 일반적입니다.
      const url = `/${targetType}/reaction/${targetId}/${reactionId}`;
      return instance.delete(url);
    },

    // --- 👇 삭제 로직을 위한 낙관적 업데이트 ---

    onMutate: async variables => {
      // 1. 진행 중인 refetch 취소
      await queryClient.cancelQueries({queryKey});

      // 2. 롤백을 위한 이전 데이터 저장
      const previousData = queryClient.getQueryData<QuestData>(queryKey);

      // 3. 캐시 데이터를 직접 수정하여 UI 즉시 업데이트
      if (previousData) {
        const optimisticData: QuestData = {
          ...previousData,
          // '추가'와 반대로 카운터를 1 줄이고, 내가 리액션한 상태를 false로 변경
          reactionCount: Math.max(0, previousData.reactionCount - 1), // 0 미만으로 내려가지 않도록
          isReactedByMe: false,
        };
        queryClient.setQueryData(queryKey, optimisticData);
      }

      // 4. 이전 데이터를 컨텍스트로 반환
      return {previousData};
    },

    // 5. 뮤테이션 실패 시, onMutate에서 반환된 컨텍스트로 데이터 롤백
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      console.error('리액션 삭제 실패:', err);
    },

    // 6. 성공/실패 여부와 관계없이, 마지막에 서버와 상태 동기화
    onSettled: () => {
      queryClient.invalidateQueries({queryKey});
    },
  });
};
