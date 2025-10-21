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
  myReaction?: {
    support: boolean;
    amazing: boolean;
    together: boolean;
    perfect: boolean;
  } | null; // 내가 남긴 리액션 정보
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

  const isReactedByMe =
    myReaction?.[reactionType as keyof typeof myReaction] === true;

  const handlePress = () => {
    // 로딩 중이면 중복 클릭 방지
    if (isAdding || isDeleting) return;

    if (isReactedByMe) {
      // 이미 리액션을 남겼다면, 삭제 뮤테이션 호출
      // myReaction.id는 롤백을 위해 필수적입니다.
      deleteReaction(reactionType);
    } else {
      // 리액션을 남기지 않았다면, 추가 뮤테이션 호출
      addReaction(reactionType);
    }
  };

  return (
    <TouchableOpacity
      style={isReactedByMe ? styles.reactionBtnActive : styles.reactionBtn}
      onPress={handlePress}>
      <Text
        style={
          isReactedByMe ? styles.reactionEmojiActive : styles.reactionEmoji
        }>
        {emojiMap[reactionType]}
      </Text>
      <Text
        style={
          isReactedByMe ? styles.reactionLabelActive : styles.reactionLabel
        }>
        {labelMap[reactionType]}
      </Text>
      <Text
        style={
          isReactedByMe ? styles.reactionCountActive : styles.reactionCount
        }>
        {count}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 0,
    flex: 1,
    marginHorizontal: 0,
    maxWidth: '24%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 3,
  },
  reactionLabel: {
    fontSize: 12,
    color: '#444',
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  reactionBtnActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A805B',
    borderWidth: 1,
    borderColor: '#5A704D',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 0,
    flex: 1,
    marginHorizontal: 0,
    maxWidth: '24%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    // 인셋 쉐도우 효과 (눌린 듯한 효과)
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  reactionEmojiActive: {
    fontSize: 16,
    marginRight: 3,
    color: '#FCFAF8',
  },
  reactionLabelActive: {
    fontSize: 12,
    color: '#FCFAF8',
    marginRight: 2,
    fontWeight: 'bold',
  },
  reactionCountActive: {
    fontSize: 12,
    color: '#FCFAF8',
    fontWeight: 'bold',
  },
});
