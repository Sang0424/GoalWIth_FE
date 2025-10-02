import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAddReaction} from '../utils/hooks/useAddReaction';
import {useDeleteReaction} from '../utils/hooks/useDeleteReaction';
import {Text} from 'react-native';

type ReactionButtonProps = {
  targetType: 'quest' | 'record';
  targetId: number | string;
  reactionType: string;
  myReaction: {id: number | string; type: string} | null; // 내가 남긴 리액션 정보
  count: number; // 이 타입의 리액션 총 개수
};

export default function ReactionButton({
  targetType,
  targetId,
  reactionType,
  myReaction,
  count,
}: ReactionButtonProps) {
  const {mutate: addReaction, isPending: isAdding} = useAddReaction(
    targetType,
    targetId,
  );
  const {mutate: deleteReaction, isPending: isDeleting} = useDeleteReaction(
    targetType,
    targetId,
  );
  const emojiMap: Record<string, string> = {
    support: '💪',
    amazing: '👏',
    together: '🤝',
    perfect: '🌟',
  };
  const labelMap: Record<string, string> = {
    support: '응원',
    amazing: '대단',
    together: '함께',
    perfect: '완벽',
  };

  const isReactedByMe = myReaction?.type === reactionType;

  const handlePress = () => {
    // 로딩 중이면 중복 클릭 방지
    if (isAdding || isDeleting) return;

    if (isReactedByMe) {
      // 이미 리액션을 남겼다면, 삭제 뮤테이션 호출
      // myReaction.id는 롤백을 위해 필수적입니다.
      deleteReaction(myReaction.id);
    } else {
      // 리액션을 남기지 않았다면, 추가 뮤테이션 호출
      addReaction(reactionType);
    }
  };

  return (
    <TouchableOpacity style={styles.reactionBtn} onPress={handlePress}>
      <Text style={styles.reactionEmoji}>{emojiMap[reactionType]}</Text>
      <Text style={styles.reactionLabel}>{labelMap[reactionType]}</Text>
      <Text style={styles.reactionCount}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 0, // Allow the button to shrink if needed
    flex: 1, // Distribute space equally
    marginHorizontal: 0, // Remove any horizontal margin that might cause overflow
    maxWidth: '24%', // Ensure 4 buttons fit within the row with gaps
  },
  reactionEmoji: {
    fontSize: 17,
    marginRight: 3,
  },
  reactionLabel: {
    fontSize: 13,
    color: '#444',
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 13,
    color: '#888',
    fontWeight: 'bold',
  },
});
