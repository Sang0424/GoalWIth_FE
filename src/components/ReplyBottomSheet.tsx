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
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import instance from '../utils/axiosInterceptor';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {colors} from '../styles/theme';
import Config from 'react-native-config';
import type {QuestVerification as Verification} from '../types/quest.types';
import CharacterAvatar from './CharacterAvatar';
import {formatRelativeTime} from '../utils/dateUtils';
import {userStore} from '../store/userStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import useKeyboardHeight from '../utils/hooks/useKeyboardHeight';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import Separator from './Separator';

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
  const [error, setError] = useState<string | null>(null);
  const {keyboardHeight} = useKeyboardHeight();
  const [reply, setReply] = useState('');

  const queryClient = useQueryClient();

  const user = userStore(state => state.user);

  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = Platform.select({
    ios: 49,
    android: 0,
  });

  let tabBarHeight = 0;

  try {
    // 이 화면이 TabNavigator 안에 있다면 실제 높이를 반환하고, 없으면 에러가 발생합니다.
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    tabBarHeight = 0;
  }

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['reply', verificationId],
    initialPageParam: 0,
    queryFn: async ({pageParam = 0}) => {
      try {
        const response = await instance.get(
          `/quest/verification/comment/${verificationId}?page=${pageParam}&size=${PAGE_SIZE}`,
        );
        return response.data;
      } catch (e: any) {
        setError(e.response.data.message);
        return {items: [], nextPage: null};
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNext ? allPages.length : undefined;
    },
    enabled: Config.API_URL != '',
  });

  const {mutate} = useMutation({
    mutationFn: async (reply: string) => {
      try {
        const response = await instance.post(
          `/quest/verification/comment/${verificationId}`,
          {
            reply,
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
      const bottomInset = Math.max(insets.bottom, 16);
      const offset = bottomInset + (TAB_BAR_HEIGHT || 0);
      startAnimation(-e.endCoordinates?.height + offset);
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

  if (!data) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.font,
          }}>
          답글을 볼 수 없습니다.잠시 후 다시 시도해주세요.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <TouchableWithoutFeedback onPress={() => closeModalWithAnimation}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <Modal
        visible={visible}
        animationType="fade"
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
                  <Text>답글</Text>
                  <Ionicons
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
                      {/* {verification.user_id === user?.id && (
                    <Menu>
                      <MenuTrigger>
                        <View>
                          <Ionicons
                            name="ellipsis-horizontal"
                            size={20}
                            color={colors.gray}
                          />
                        </View>
                      </MenuTrigger>
                      <MenuOptions optionsContainerStyle={styles.menuOptions}>
                        <MenuOption
                          onSelect={() => {
                            setVerificationText(verification.comment);
                            setIsCommentUpdate(true);
                            setCommentId(verification.id);
                          }}
                          style={styles.menuOption}>
                          <Text>수정</Text>
                        </MenuOption>
                        <MenuOption
                          onSelect={() => {
                            Alert.alert('삭제', '정말로 삭제하시겠습니까?', [
                              {
                                text: '취소',
                                onPress: () => {},
                              },
                              {
                                text: '삭제',
                                onPress: () => {
                                  deleteVerification(verification.id);
                                },
                              },
                            ]);
                          }}
                          style={[styles.menuOption, styles.deleteOption]}>
                          <Text style={styles.deleteText}>삭제</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  )} */}
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
                  <Separator />
                  <View>
                    {/* {data?.replies?.map((reply: Verification) => (
                      <View></View>
                    ))} */}
                  </View>
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
                    onPress={() => mutate(reply)}>
                    <Text style={styles.submitButtonText}>작성</Text>
                  </TouchableOpacity>
                </Animated.View>
              </SafeAreaView>
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
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
    height: '90%',
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
    marginTop: 12,
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
});

export default ReplyBottomSheet;
