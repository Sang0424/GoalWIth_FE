import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  Pressable,
  Platform,
  Keyboard,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  Quest,
  QuestRecord,
  QuestVerification as Verification,
} from '../../types/quest.types';
import type {QuestVerificationProps} from '../../types/navigation';
import useKeyboardHeight from '../../utils/hooks/useKeyboardHeight';
import ImageCarousel from '../../components/Carousel';
import instance from '../../utils/axiosInterceptor';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import CharacterAvatar from '../../components/CharacterAvatar';
import {formatRelativeTime} from '../../utils/dateUtils';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../../styles/theme';
import {userStore} from '../../store/userStore';

type QuestVerificationScreenNavigationProp = StackNavigationProp<
  QuestVerificationProps,
  'QuestVerification'
>;

const QuestVerification = () => {
  const navigation = useNavigation<QuestVerificationScreenNavigationProp>();
  const route = useRoute();
  const {id} = route.params as {id: number};
  const [verificationText, setVerificationText] = useState('');
  const [record, setRecord] = useState<QuestRecord | null>(null);
  const [isCommentUpdate, setIsCommentUpdate] = useState(false);
  const [commentId, setCommentId] = useState<number | null>(null);
  const {keyboardHeight} = useKeyboardHeight();
  const queryClient = useQueryClient();

  // 1. State for tracking scroll position and verification status
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);
  const user = userStore(state => state.user);
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 49;

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const {data, isLoading, refetch} = useQuery({
    queryKey: ['QuestVerification', id],
    queryFn: async () => {
      try {
        const response = await instance.get(`/quest/verification/${id}`);
        return response.data;
      } catch (e: any) {
        Alert.alert(e.response.data.message);
      }
    },
  });

  // 200 duration is somewhat a magic number that seemed to work nicely with
  // the default keyboard opening speed
  const startAnimation = (toValue: number) =>
    Animated.timing(keyboardOffset, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();

  useEffect(() => {
    const keyboardWillShow = (e: any) => {
      const offset = insets.bottom + TAB_BAR_HEIGHT;
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

  useEffect(() => {
    if (data) {
      setRecord(data.records[data.records.length - 1]);
    }
  }, [data]);

  useEffect(() => {
    if (keyboardHeight > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [keyboardHeight]);

  // ********* Backend랑 연결 부분 *********
  const {mutate} = useMutation({
    mutationFn: async (comment: string) => {
      try {
        const response = await instance.post(`/quest/verification/${id}`, {
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
      Alert.alert('인증 댓글이 추가되었습니다.');
    },
    onError: (error: any) => {
      Alert.alert(error.response.data.message);
    },
  });

  const {mutate: editVerification} = useMutation({
    mutationFn: async ({id, comment}: {id: number; comment: string}) => {
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
      Alert.alert('인증 댓글이 수정되었습니다.');
      setVerificationText('');
      setIsCommentUpdate(false);
      setCommentId(null);
    },
    onError: (error: any) => {
      Alert.alert(error.response.data.message);
    },
  });

  const {mutate: deleteVerification} = useMutation({
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
      Alert.alert('삭제', '인증 댓글이 삭제되었습니다.');
    },
    onError: (error: any) => {
      Alert.alert(error.response.data.message);
    },
  });

  const handleVerify = () => {
    if (!verificationText.trim()) {
      Alert.alert('인증 메시지를 입력해주세요.');
      return;
    }
    mutate(verificationText);
    setVerificationText('');
  };

  const handleEdit = (id: number | null, comment: string) => {
    if (!id || !comment.trim()) {
      Alert.alert('인증 메시지를 입력해주세요.');
      return;
    }
    editVerification({id, comment});
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text>로딩 중...</Text>
      </SafeAreaView>
    );
  }

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
          기록을 볼 수 없습니다.잠시 후 다시 시도해주세요.
        </Text>
      </SafeAreaView>
    );
  }

  // 모든 인증 메시지(댓글) 리스트 추출
  const allVerifications = data.verifications;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  const calculateProgressPercentage = () => {
    if (!data.startDate || !data.endDate) return 0;

    const start = new Date(data.startDate).getTime();
    const end = new Date(data.endDate).getTime();
    const now = new Date().getTime();

    const totalDuration = end - start;
    const elapsed = now - start;

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const percentage = calculateProgressPercentage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={(_, height) => {
          contentHeight.current = height;
        }}
        onLayout={event => {
          scrollViewHeight.current = event.nativeEvent.layout.height;
        }}
        contentContainerStyle={
          !!keyboardHeight ? undefined : {paddingBottom: 80}
        }
        onScroll={({nativeEvent}) => {
          const {contentOffset, contentSize, layoutMeasurement} = nativeEvent;
          const isAtBottom =
            contentOffset.y >=
            contentSize.height - layoutMeasurement.height - 20;

          if (isAtBottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true);
          }
        }}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
        scrollEventThrottle={400}
        style={[
          styles.scrollView,
          !!keyboardHeight && {marginBottom: keyboardHeight + 20},
        ]}>
        {/* Section 1: Timeline Records */}
        <View
          style={[
            styles.header,
            data.isMain ? styles.mainQuestHeader : styles.subQuestHeader,
          ]}>
          <View style={styles.headerContent}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={{padding: 10}}>
                <Icon
                  name={
                    Platform.OS === 'ios'
                      ? 'arrow-back-ios'
                      : 'arrow-back-android'
                  }
                  size={20}
                  color={'#000'}
                />
              </Pressable>
              <Text style={styles.questTitle}>{data.title}</Text>
              <View style={{width: 40}} />
            </View>
            <Text style={styles.questDate}>
              {formatDate(data.startDate.toString())} -{' '}
              {formatDate(data.endDate.toString())}
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, Math.max(0, percentage))}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.floor(
                  (Date.now() - new Date(data.startDate).getTime()) / 86400000,
                ) + 1}
                일차
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.timelineSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>퀘스트 타임라인</Text>
            {!hasScrolledToBottom && (
              <View style={styles.scrollPrompt}>
                <Text style={styles.scrollPromptText}>
                  아래로 스크롤하여 인증하기
                </Text>
                <Icon name="arrow-downward" size={16} color="#666" />
              </View>
            )}
          </View>
          {data.records.map((record: any) => (
            <View key={record.id} style={styles.recordCard}>
              {record.images.length > 0 ? (
                <ImageCarousel images={record.images} />
              ) : null}
              <Text style={styles.recordText}>{record.text}</Text>
              <Text style={styles.recordDate}>
                {formatRelativeTime(record.createdAt.toString() || '')}
              </Text>
            </View>
          ))}
        </View>

        {/* Section 2: Verification Comments */}
        <View style={styles.commentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>인증 댓글</Text>
          </View>

          {allVerifications && allVerifications.length > 0 ? (
            allVerifications.map((verification: Verification) => (
              <View key={verification.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.userContainer}>
                    <CharacterAvatar
                      avatar={verification.character}
                      size={40}
                      onPress={() => {}}
                    />
                    <Text style={{marginLeft: 8}}>{verification.username}</Text>
                  </View>
                  {verification.user_id === user?.id && (
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
                  )}
                </View>
                <Text style={styles.commentText}>{verification.comment}</Text>
                <Text style={styles.commentDate}>
                  {formatRelativeTime(verification.createdAt.toString() || '')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>
              아직 인증된 댓글이 없습니다.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Fixed verification form at bottom */}
      <Animated.View
        style={[
          styles.verificationForm,
          {
            transform: [{translateY: keyboardOffset}],
          },
        ]}>
        <TextInput
          style={styles.commentInput}
          placeholder={
            hasScrolledToBottom
              ? '인증 댓글을 남겨주세요'
              : '타임라인을 확인한 후 인증이 가능합니다'
          }
          placeholderTextColor={colors.gray}
          editable={hasScrolledToBottom}
          value={verificationText}
          onChangeText={setVerificationText}
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            !hasScrolledToBottom && styles.disabledButton,
          ]}
          disabled={!hasScrolledToBottom}
          onPress={
            isCommentUpdate
              ? () => handleEdit(commentId, verificationText)
              : handleVerify
          }>
          <Text style={styles.submitButtonText}>
            {isCommentUpdate ? '수정하기' : '인증하기'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 300,
  },
  header: {
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  mainQuestHeader: {
    backgroundColor: '#B9B69B',
  },
  subQuestHeader: {
    backgroundColor: '#f5f5f5',
  },
  headerContent: {
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  questDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  progressText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.font,
    minWidth: 50,
    textAlign: 'right',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.font,
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyStateText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  emptyStateSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordDate: {
    marginTop: 14,
    fontSize: 12,
    color: colors.gray,
  },
  recordText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.font,
  },
  timelineSection: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  commentsSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scrollPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  scrollPromptText: {
    marginRight: 4,
    fontSize: 12,
    color: colors.gray,
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
  noCommentsText: {
    textAlign: 'center',
    color: colors.gray,
    marginVertical: 20,
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
  commentText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.font,
    paddingHorizontal: 8,
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
  commentDate: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 12,
    paddingHorizontal: 8,
    textAlign: 'right',
  },
  menuContainer: {
    position: 'relative',
    zIndex: 1000,
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
});

export default QuestVerification;
