import React, {useEffect, useCallback, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  useWindowDimensions,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Pressable,
  Platform,
  Animated,
  Keyboard,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import instance from '../utils/axiosInterceptor';
import {useMutation, useQueryClient, useQuery} from '@tanstack/react-query';
import {colors} from '../styles/theme';
import type {QuestVerification as Verification} from '../types/quest.types';
import CharacterAvatar from './CharacterAvatar';
import {formatRelativeTime} from '../utils/dateUtils';
import {userStore} from '../store/userStore';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useKeyboardHeight from '../utils/hooks/useKeyboardHeight';
import Separator from './Separator';
import analytics from '@react-native-firebase/analytics';
import {checkForProfanity} from '../utils/filter';

interface ReplyBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  verificationId: number | null;
  verification: Verification | null;
}

const PAGE_SIZE = 10;

const ReplyBottomSheet = ({
  visible,
  onClose,
  verificationId,
  verification,
}: ReplyBottomSheetProps) => {
  const {height: screenHeight} = useWindowDimensions();
  const translateY = useSharedValue(screenHeight);
  const context = useSharedValue({y: 0});
  const {keyboardHeight} = useKeyboardHeight();
  const [reply, setReply] = useState('');
  const [isReplyUpdate, setIsReplyUpdate] = useState<boolean>(false);
  const [replyId, setReplyId] = useState<number | null>(null);
  // const [isReportVisible, setIsReportVisible] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const user = userStore(state => state.user);

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const {data, isLoading, refetch} = useQuery({
    queryKey: ['Reply', verificationId],
    queryFn: async () => {
      try {
        const response = await instance.get(
          `/quest/verification/comment/${verificationId}`,
        );
        return response.data;
      } catch (e: any) {
        Alert.alert(e.response.data.message);
      }
    },
    enabled: visible,
  });

  const {mutate} = useMutation({
    mutationFn: async (reply: string) => {
      try {
        if (checkForProfanity(reply)) {
          Alert.alert(
            '부적절한 단어',
            '답글에 부적절한 단어가 포함되어 있습니다.',
          );
          return;
        }
        const response = await instance.post(
          `/quest/verification/comment/${verificationId}`,
          {
            comment: reply,
          },
        );
        return response.data;
      } catch (e: any) {
        Alert.alert(e.response.data.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['Verification'],
      });
      queryClient.invalidateQueries({
        queryKey: ['myVerificationCount'],
      });
      queryClient.invalidateQueries({
        queryKey: ['Reply', verificationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['QuestVerification'],
      });
      queryClient.invalidateQueries({queryKey: ['myCharacters']});
      queryClient.invalidateQueries({queryKey: ['myBadges']});
      Alert.alert('답글이 추가되었습니다.');
      analytics().logEvent('reply_add', {
        verification_id: verificationId,
      });
      setReply('');
      setIsReplyUpdate(false);
      setReplyId(null);
      Keyboard.dismiss();
    },
  });

  const {mutate: editReply} = useMutation({
    mutationFn: async ({id, comment}: {id: number | null; comment: string}) => {
      if (checkForProfanity(comment)) {
        Alert.alert(
          '부적절한 단어',
          '답글에 부적절한 단어가 포함되어 있습니다.',
        );
        return Promise.reject(new Error('Profanity detected'));
      }
      try {
        const response = await instance.put(`quest/verifications/${id}`, {
          comment,
        });
        return response.data;
      } catch (e: any) {
        Alert.alert(e.response.data.message);
      }
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({
        queryKey: ['Verification'],
      });
      Alert.alert('답글이 수정되었습니다.');
      setReply('');
      setIsReplyUpdate(false);
      setReplyId(null);
    },
    onError: (error: any) => {
      Alert.alert(error.response.data.message);
    },
  });

  const {mutate: deleteReply} = useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await instance.delete(`quest/verifications/${id}`);
        return response.data;
      } catch (e: any) {
        Alert.alert(e.response.data.message);
      }
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({
        queryKey: ['Verification'],
      });
      queryClient.invalidateQueries({
        queryKey: ['QuestVerification'],
      });
      Alert.alert('답글이 삭제되었습니다.');
      setIsReplyUpdate(false);
      setReplyId(null);
    },
    onError: (error: any) => {
      Alert.alert(error.response.data.message);
    },
  });

  const {mutate: reportMutate} = useMutation({
    mutationFn: (reason: string) =>
      instance.post(`quest/verification/report/${replyId}`, {reason}),
    onSuccess: () => {
      Alert.alert('신고 완료', '신고가 성공적으로 접수되었습니다.');
      analytics().logEvent('reply_report', {
        verification_id: replyId,
      });
    },
    onError: (error: any) => {
      Alert.alert(
        '오류',
        error.response?.data?.message || '신고 중 오류가 발생했습니다.',
      );
    },
  });

  const closeModalWithAnimation = useCallback(() => {
    // 1) 부모 상태를 즉시 false로 만들어 모달/오버레이를 바로 제거
    runOnJS(onClose)();

    // 2) 다음 번 오픈을 대비해 위치만 리셋
    translateY.value = withSpring(screenHeight, {damping: 20});
  }, [onClose, screenHeight, translateY]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(screenHeight * 0.1, {damping: 1000});
    } else {
      translateY.value = withSpring(screenHeight, {damping: 1000});
    }
  }, [visible, translateY, screenHeight]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {y: translateY.value};
    })
    .onUpdate(event => {
      translateY.value = Math.max(
        event.translationY + context.value.y,
        screenHeight * 0.1,
      );
    })
    .onEnd(event => {
      if (event.translationY > 100) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(screenHeight * 0.1, {damping: 1000});
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });
  const startAnimation = (toValue: number) =>
    Animated.timing(keyboardOffset, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  useEffect(() => {
    const keyboardWillShow = (e: any) => {
      startAnimation(-e.endCoordinates?.height + keyboardHeight);
    };

    const keyboardWillHide = () => {
      startAnimation(0);
    };

    // Add listeners
    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      keyboardWillShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      keyboardWillHide,
    );

    // Clean up
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!visible || !verificationId) return null;

  const replies = data || [];

  return (
    <SafeAreaView>
      <TouchableWithoutFeedback onPress={() => closeModalWithAnimation}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={closeModalWithAnimation}>
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeModalWithAnimation}
          />
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.bottomSheetContainer, animatedStyle]}>
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.grabber} />
                <View style={styles.header}>
                  <Text
                    style={{
                      fontSize: 24,
                      color: colors.font,
                      textAlign: 'center',
                    }}>
                    답글
                  </Text>
                  <Icon
                    name="close"
                    size={24}
                    color={colors.font}
                    onPress={closeModalWithAnimation}
                  />
                </View>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                  <View>
                    <View style={styles.commentHeader}>
                      <View style={styles.userContainer}>
                        <CharacterAvatar
                          avatar={verification?.character}
                          size={40}
                          onPress={() => {}}
                        />
                        <Text style={{marginLeft: 8}}>
                          {verification?.username}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.commentText}>
                      {verification?.comment}
                    </Text>
                    <View style={styles.commentFooter}>
                      <Text style={styles.commentDate}>
                        {formatRelativeTime(
                          verification?.createdAt.toString() || '',
                        )}
                      </Text>
                    </View>
                  </View>
                  <Separator paddingHorizontal={32} />
                  {replies.length > 0 ? (
                    replies.map((reply: Verification) => (
                      <View key={reply.id} style={styles.commentCard}>
                        <View style={styles.commentHeader}>
                          <View style={styles.userContainer}>
                            <CharacterAvatar
                              avatar={reply.character}
                              size={40}
                              onPress={() => {}}
                            />
                            <Text style={{marginLeft: 8}}>
                              {reply.username}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.commentText}>{reply.comment}</Text>
                        <View style={styles.commentFooter}>
                          <Text style={styles.commentDate}>
                            {formatRelativeTime(
                              reply.createdAt.toString() || '',
                            )}
                          </Text>
                          {reply.user_id === user?.id ? (
                            <View style={styles.editContainer}>
                              <TouchableOpacity
                                onPress={() => {
                                  setReply(reply.comment);
                                  setIsReplyUpdate(true);
                                  setReplyId(reply.id);
                                }}>
                                <Text
                                  style={{color: colors.gray, fontSize: 14}}>
                                  수정
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  Alert.alert(
                                    '삭제',
                                    '정말로 삭제하시겠습니까?',
                                    [
                                      {
                                        text: '취소',
                                        onPress: () => {},
                                      },
                                      {
                                        text: '삭제',
                                        onPress: () => {
                                          deleteReply(reply.id);
                                        },
                                      },
                                    ],
                                  );
                                }}>
                                <Text
                                  style={{color: colors.gray, fontSize: 14}}>
                                  삭제
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={styles.editContainer}>
                              <TouchableOpacity
                                onPress={() => {
                                  // setIsReportVisible(true);
                                  // setReplyId(reply.id);
                                  Alert.alert(
                                    '댓글 신고',
                                    '이 댓글을 신고하시겠습니까?',
                                    [
                                      {
                                        text: '스팸 또는 광고',
                                        onPress: () =>
                                          reportMutate('스팸 또는 광고'),
                                      },
                                      {
                                        text: '욕설 또는 비방',
                                        onPress: () =>
                                          reportMutate('욕설 또는 비방'),
                                      },
                                      {
                                        text: '음란물 또는 성적인 콘텐츠',
                                        onPress: () =>
                                          reportMutate(
                                            '음란물 또는 성적인 콘텐츠',
                                          ),
                                      },
                                      {
                                        text: '잘못된 정보',
                                        onPress: () =>
                                          reportMutate('잘못된 정보'),
                                      },
                                      {text: '취소', style: 'cancel'},
                                    ],
                                  );
                                }}>
                                <Text
                                  style={{color: colors.gray, fontSize: 14}}>
                                  신고
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noCommentsText}>
                      아직 답글이 없습니다.
                    </Text>
                  )}
                </ScrollView>
                <Animated.View
                  style={[
                    styles.verificationForm,
                    {
                      transform: [{translateY: keyboardOffset}],
                    },
                  ]}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder={'답글을 남겨주세요'}
                    placeholderTextColor={colors.gray}
                    value={reply}
                    onChangeText={setReply}
                  />
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      reply.length === 0 && styles.disabledButton,
                    ]}
                    disabled={reply.length === 0}
                    onPress={
                      isReplyUpdate
                        ? () => editReply({id: replyId, comment: reply})
                        : () => mutate(reply)
                    }>
                    <Text style={styles.submitButtonText}>
                      {isReplyUpdate ? '수정' : '작성'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </SafeAreaView>
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
      {/* <ReportBottomSheet
        visible={isReportVisible}
        onClose={() => {
          setIsReportVisible(false);
        }}
        id={replyId}
        from="verification"
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    height: '80%',
    width: '100%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 80,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.switchBG,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.switchBG,
  },
  contentContainer: {
    padding: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.font,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  commentDate: {
    fontSize: 14,
    color: colors.gray,
    paddingHorizontal: 8,
    textAlign: 'right',
  },
  verificationForm: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
    zIndex: 1,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingRight: 45,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#f9f9f9',
    zIndex: 1,
  },
  submitButton: {
    backgroundColor: '#806A5B',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  commentCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  menuOptions: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 100,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuOption: {
    padding: 10,
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deleteText: {
    color: 'red',
  },
  noCommentsText: {
    textAlign: 'center',
    color: colors.gray,
    marginVertical: 20,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 16,
  },
});

export default ReplyBottomSheet;
