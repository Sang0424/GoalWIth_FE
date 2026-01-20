import React, {useState, useEffect, useRef, useMemo} from 'react';
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
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
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
// import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../../styles/theme';
import {userStore} from '../../store/userStore';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import ReportBottomSheet from '../../components/ReportBottomSheet';
import ReplyBottomSheet from '../../components/ReplyBottomSheet';
import {groupRecordsByDate} from '../../utils/dateUtils';

type QuestVerificationScreenNavigationProp = StackNavigationProp<
  QuestVerificationProps,
  'QuestVerification'
>;

const QuestVerification = () => {
  const navigation = useNavigation<QuestVerificationScreenNavigationProp>();
  const route = useRoute();
  const {id, authorId} = route.params as {id: number; authorId: number};
  const [verificationText, setVerificationText] = useState('');
  const [record, setRecord] = useState<QuestRecord | null>(null);
  const [isCommentUpdate, setIsCommentUpdate] = useState(false);
  const [replyVisible, setReplyVisible] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [replyVerificationInfo, setReplyVerificationInfo] =
    useState<Verification | null>(null);
  const [commentId, setCommentId] = useState<number | null>(null);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const {keyboardHeight} = useKeyboardHeight();
  const queryClient = useQueryClient();
  const {width} = useWindowDimensions();

  const CARD_WIDTH = width - 32;

  // 1. State for tracking scroll position and verification status
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);
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
      queryClient.invalidateQueries({
        queryKey: ['myVerificationCount'],
      });
      queryClient.invalidateQueries({
        queryKey: ['myCharacters'],
      });
      queryClient.invalidateQueries({
        queryKey: ['myBadges'],
      });
      Alert.alert('인증 댓글이 추가되었습니다.');
      Keyboard.dismiss();
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
      queryClient.invalidateQueries({queryKey: ['myCharacters']});
      queryClient.invalidateQueries({queryKey: ['myBadges']});
      Alert.alert('인증 댓글이 수정되었습니다.');
      Keyboard.dismiss();
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
      queryClient.invalidateQueries({
        queryKey: ['myVerificationCount'],
      });
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

  // const {mutate: completeQuest} = useMutation({
  //   mutationFn: async (id: number) => {
  //     await instance.put(`/quest/complete/${id}`);
  //   },
  //   onSuccess: () => {
  //     Alert.alert('성공', '퀘스트가 완료되었습니다!');
  //     navigation.goBack();
  //     queryClient.invalidateQueries({queryKey: ['QuestRecord', id]});
  //     queryClient.invalidateQueries({queryKey: ['homeQuests']});
  //     queryClient.invalidateQueries({queryKey: ['myBadges']});
  //     queryClient.invalidateQueries({queryKey: ['myCharacters']});
  //   },
  //   onError: (error: any) => {
  //     Alert.alert(`${error.response.data.message}`);
  //   },
  // });

  const handleEdit = (id: number | null, comment: string) => {
    if (!id || !comment.trim()) {
      Alert.alert('인증 메시지를 입력해주세요.');
      return;
    }
    editVerification({id, comment});
  };

  const allRecords = data?.records ? [...data.records].reverse() : [];
  const visibleRecords = isTimelineExpanded
    ? allRecords
    : allRecords.slice(0, 5);
  const hiddenCount = Math.max(0, allRecords.length - visibleRecords.length);

  const groupedSections = useMemo(() => {
    if (!visibleRecords) return [];
    return groupRecordsByDate(visibleRecords);
  }, [visibleRecords]);

  // const handleCompleteQuest = () => {
  //   Alert.alert(
  //     '퀘스트 완료',
  //     '아직 인증을 다 받지 못했지만 이 퀘스트를 완료하시겠습니까?',
  //     [
  //       {text: '취소', style: 'cancel'},
  //       {
  //         text: '완료',
  //         onPress: () => {
  //           completeQuest(id, {
  //             onSuccess: () => {
  //               Alert.alert('성공', '퀘스트가 완료되었습니다!');
  //               navigation.goBack();
  //             },
  //             onError: error => {
  //               Alert.alert(`${error.response.data.message}`);
  //             },
  //           });
  //         },
  //       },
  //     ],
  //   );
  // };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text>로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (!isLoading && !data) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  const calculateProgressPercentage = () => {
    if (!data?.startDate || !data?.endDate) return 0;

    const start = new Date(data.startDate).getTime();
    const end = new Date(data.endDate).getTime();
    const now = new Date().getTime();

    const totalDuration = end - start;
    const elapsed = now - start;

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const renderQuestHeader = () => (
    <View>
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
              width: CARD_WIDTH,
            }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{padding: 10}}>
              <Icon
                name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}
                size={20}
                color={colors.font}
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
                  {width: `${calculateProgressPercentage()}%`},
                  {backgroundColor: data.isMain ? '#4a90e2' : '#a0a0a0'},
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardDismissMode="on-drag"
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
        {renderQuestHeader()}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingHorizontal: 20,
            paddingTop: 20,
          }}>
          <Text style={styles.sectionTitle}>기록 타임라인</Text>
          {!hasScrolledToBottom && (
            <View style={styles.scrollPrompt}>
              <Text style={styles.scrollPromptText}>
                아래로 스크롤하여 인증하기
              </Text>
              <Icon name="arrow-downward" size={16} color="#666" />
            </View>
          )}
        </View>
        <View style={styles.timelineSection}>
          {groupedSections.map(section => (
            <View key={section.title}>
              {/* 날짜 헤더 (배지 스타일) */}
              <View style={styles.dateHeaderContainer}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateHeaderText}>{section.title}</Text>
                </View>
              </View>

              {/* 해당 날짜의 기록들 카드 렌더링 */}
              {section.data.map((record: any) => {
                const hasImages = record.images && record.images.length > 0;
                return (
                  <View key={record.id} style={styles.recordItemContainer}>
                    <View style={styles.recordCard}>
                      {hasImages && (
                        <View style={styles.cardImageContainer}>
                          <ImageCarousel
                            images={record.images}
                            containerWidth={CARD_WIDTH}
                          />
                        </View>
                      )}

                      <View
                        style={[
                          styles.cardContentContainer,
                          !hasImages && styles.cardContentNoImage,
                        ]}>
                        <Text style={styles.recordText}>{record.text}</Text>
                        <Text style={styles.recordDateText}>
                          {formatRelativeTime(
                            record.createdAt.toString() || '',
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
          {!isTimelineExpanded && hiddenCount > 0 && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setIsTimelineExpanded(true)}>
              <Text style={styles.expandButtonText}>
                이전 기록 {hiddenCount}개 더 보기
              </Text>
              <Icon name="keyboard-arrow-down" size={16} color={colors.gray} />
            </TouchableOpacity>
          )}

          {/* [추가] 접기 버튼 (선택사항) */}
          {isTimelineExpanded && allRecords.length > 3 && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => {
                setIsTimelineExpanded(false);
                // 접었을 때 스크롤 위치 조정이 필요할 수 있음
              }}>
              <Text style={styles.expandButtonText}>접기</Text>
              <Icon name="keyboard-arrow-up" size={16} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.commentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>인증 댓글</Text>
          </View>

          {data?.verifications && data.verifications.length > 0 ? (
            data.verifications.map((verification: Verification) => (
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
                  {verification.user_id === user?.id ? (
                    <Menu>
                      <MenuTrigger>
                        <View>
                          <Icon
                            name="more-horiz"
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
                  ) : (
                    <Menu>
                      <MenuTrigger>
                        <View>
                          <Icon
                            name="more-horiz"
                            size={20}
                            color={colors.gray}
                          />
                        </View>
                      </MenuTrigger>
                      <MenuOptions optionsContainerStyle={styles.menuOptions}>
                        <MenuOption
                          onSelect={() => {
                            setIsReportVisible(true);
                            setCommentId(verification.id);
                          }}
                          style={styles.menuOption}>
                          <Text>신고</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  )}
                </View>
                <Text style={styles.commentText}>{verification.comment}</Text>
                <View style={styles.commentFooter}>
                  <Text style={styles.commentDate}>
                    {formatRelativeTime(
                      verification.createdAt.toString() || '',
                    )}
                  </Text>
                  <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => {
                      setReplyVisible(true);
                      setCommentId(verification.id);
                      setReplyVerificationInfo(verification);
                    }}>
                    <Icon
                      name="chat-bubble-outline"
                      size={20}
                      color={colors.gray}
                    />
                    <Text style={styles.commentCount}>
                      {verification.replyCount}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>
              아직 인증된 댓글이 없습니다.
            </Text>
          )}
        </View>
      </ScrollView>

      <Animated.View
        style={[
          styles.verificationForm,
          {
            transform: [{translateY: keyboardOffset}],
          },
        ]}>
        <View style={{flexDirection: 'row'}}>
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
            multiline
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
        </View>
        {/* {user.id === authorId && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={
                user.id === authorId
                  ? [styles.actionButton, styles.completeButton]
                  : [
                      styles.actionButton,
                      styles.completeButton,
                      {backgroundColor: colors.lightGray},
                    ]
              }
              onPress={handleCompleteQuest}
              disabled={user.id !== authorId}>
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.completeButtonText}>지금 완료하기</Text>
            </TouchableOpacity>
          </View>
        )} */}
      </Animated.View>
      <ReplyBottomSheet
        visible={replyVisible}
        onClose={() => {
          setReplyVisible(false);
        }}
        verificationId={commentId}
        verification={replyVerificationInfo}
      />
      <ReportBottomSheet
        visible={isReportVisible}
        onClose={() => {
          setIsReportVisible(false);
        }}
        id={commentId}
        from="verification"
      />
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
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
  },
  subQuestHeader: {
    backgroundColor: colors.background,
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
    marginLeft: 2,
    fontSize: 12,
    color: colors.font,
    minWidth: 50,
    textAlign: 'right',
  },
  section: {
    padding: 16,
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordDate: {
    marginBottom: 14,
    fontSize: 18,
    color: colors.font,
  },
  timelineSection: {
    borderBottomWidth: 8,
    borderBottomColor: colors.background,
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
    //flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
    zIndex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  completeButton: {
    backgroundColor: colors.accent,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  completeButtonText: {
    color: colors.btnFont,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  addButtonText: {
    color: colors.btnFont,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    marginTop: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 14,
    color: colors.gray,
    paddingHorizontal: 8,
  },
  commentDate: {
    fontSize: 14,
    color: colors.gray,
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
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  expandButtonText: {
    color: colors.gray,
    marginRight: 4,
    fontSize: 14,
  },
  dateHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  dateBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.font,
  },
  recordItemContainer: {
    paddingHorizontal: 16, // 카드 좌우 여백
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardImageContainer: {
    width: '100%',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardContentContainer: {
    padding: 16,
  },
  cardContentNoImage: {
    paddingTop: 24,
  },
  recordText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333333',
    letterSpacing: -0.2,
  },
  recordDateText: {
    // 기존 recordDate와 이름 충돌 방지 및 스타일 변경
    marginTop: 14,
    fontSize: 12,
    color: colors.gray,
  },
});

export default QuestVerification;
