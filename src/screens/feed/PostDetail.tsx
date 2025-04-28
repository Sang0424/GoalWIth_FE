import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import BackArrow from '../../components/BackArrow';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PostDetailProps } from '../../types/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { PostType } from '../../types/posts';
import {
  getFocusedRouteNameFromRoute,
  useNavigation,
} from '@react-navigation/native';
import Post from '../../components/Post';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRef, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import formattedDate from '../../utils/hooks/useFormatDate';
import instance from '../../utils/axiosInterceptor';
import { API_URL } from '@env';
import { userStore } from '../../store/userStore';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export default function PostDetail({ route }: { route: PostDetailProps }) {
  const navigation = useNavigation();
  const user = userStore(state => state.user);

  const { feed_id, index }: { feed_id: number; index?: number } = route.params;

  const [comment, setComment] = useState('');

  const keyboardHeight = useSharedValue(0);
  const bottomMargin = useSharedValue(24);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', e => {
      keyboardHeight.value = withTiming(e.endCoordinates.height, {
        duration: 250,
      });
      bottomMargin.value = withTiming(0, {
        duration: 250,
      });
    });

    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      keyboardHeight.value = withTiming(0, {
        duration: 250,
      });
      bottomMargin.value = withTiming(24, {
        duration: 250,
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // commentInput의 애니메이션 스타일
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -keyboardHeight.value,
        },
      ],
      marginBottom: bottomMargin.value,
    };
  });

  const queryClient = useQueryClient();
  const addComment = () => {
    const formData = new FormData();
    formData.append('comment', comment);
    const response = instance.post(`/feeds/${feed_id}/comment`, formData);
    return response;
  };
  const { mutate } = useMutation({
    mutationFn: addComment,
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: ['feed', feed_id],
        refetchType: 'none',
      });
      queryClient.setQueryData(['feed', feed_id], (oldData: PostType) => ({
        ...oldData,
        comments: [
          ...(oldData?.comments || []),
          {
            content: comment,
            created_at: new Date().toISOString(),
          },
        ],
      }));
      setComment('');
      Keyboard.dismiss();
    },
  });
  const handleSubmit = () => {
    mutate();
  };
  const { data, error, isLoading } = useQuery<PostType>({
    queryKey: ['feed', feed_id],
    queryFn: async () => {
      const response = await instance.get(`/feeds/${feed_id}`);
      const post = response.data;
      return post;
    },
  });
  if (isLoading) {
    return (
      <SafeAreaView>
        <Text>로딩중</Text>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView>
        <Text>ㅅㅂ 에러네 + {error.message}</Text>
      </SafeAreaView>
    );
  }
  const whereisFeed = index ? 'Feed' : undefined;
  return (
    <SafeAreaView style={{ flex: 1, position: 'relative' }}>
      <View style={styles.header}>
        <BackArrow where={whereisFeed} props={{ index: index }} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 60,
        }}
        contentOffset={{ x: 0, y: 0 }}
      >
        <View style={styles.container}>
          <Post data={data} isList={false} />
          <View style={styles.commentSection}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>댓글</Text>
            <View style={[styles.commentList]}>
              {data?.comments?.map((comment, index) => {
                return (
                  <View key={index} style={styles.comment}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {comment.user?.nick || user.nick}
                      </Text>
                      <Text style={styles.userRole}>
                        / {comment.user?.role || user.role}
                      </Text>
                      <Text style={styles.createdAt}>
                        {comment.createdAt
                          ? formattedDate(comment.createdAt)
                          : '방금 전'}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: '#e9e9e9',
                        padding: 12,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 16, flexWrap: 'wrap' }}>
                        {comment.content}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* <Animated.View style={[styles.commentInput, animatedStyles]}>
        <TextInput placeholder="댓글을 입력하세요" style={styles.input} />
      </Animated.View> */}
      <Animated.View style={[styles.commentInput, animatedStyles]}>
        <TextInput
          placeholder="댓글을 입력하세요"
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          multiline={true}
          maxLength={100}
        />
        <Pressable style={styles.writeBtn} onPress={handleSubmit}>
          <Icon name="keyboard-arrow-up" size={32} color={'#ffffff'} />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
    // </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
    paddingHorizontal: 16,
  },
  commentSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#d9d9d9',
  },
  commentList: {
    flex: 1,
    marginTop: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  userRole: {
    fontSize: 12,
  },
  createdAt: {
    fontSize: 12,
    color: '#a1a1a1',
    marginLeft: 12,
  },
  comment: {
    marginBottom: 8,
    fontSize: 16,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#a1a1a1',
    borderBottomWidth: 1,
    borderBottomColor: '#a1a1a1',
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 24,
    height: 64,
  },
  writeBtn: {
    backgroundColor: '#806a5b',
    borderRadius: 50,
    textAlign: 'center',
    marginRight: 16,
  },
});
