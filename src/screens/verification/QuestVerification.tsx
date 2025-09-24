import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
  Animated,
  Pressable,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  Quest,
  QuestRecord,
  QuestVerification as Verification,
} from '../../types/quest.types';
import {useQuestStore} from '../../store/mockData';
import type {QuestVerificationProps} from '../../types/navigation';
import useKeyboardHeight from '../../utils/hooks/useKeyboardHeight';
import ImageCarousel from '../../components/Carousel';
import {useQueryClient} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {useMutation} from '@tanstack/react-query';

type QuestVerificationScreenNavigationProp = StackNavigationProp<
  QuestVerificationProps,
  'QuestVerification'
>;

const QuestVerification = () => {
  const navigation = useNavigation<QuestVerificationScreenNavigationProp>();
  const route = useRoute();
  const {quest} = route.params as {quest: Quest};
  console.log('quest verification', quest);

  const {addVerification} = useQuestStore();
  const [verificationText, setVerificationText] = useState('');
  const [record, setRecord] = useState<QuestRecord | null>(null);
  const {keyboardHeight} = useKeyboardHeight();

  // 1. State for tracking scroll position and verification status
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);

  const keyboardOffset = useRef(new Animated.Value(0)).current;

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
      startAnimation(-e.endCoordinates?.height + 81);
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
    if (quest) {
      setRecord(quest.records[quest.records.length - 1]);
    }
  }, [quest]);

  useEffect(() => {
    if (keyboardHeight > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [keyboardHeight]);

  // ********* Backend랑 연결 부분 *********

  const queryClient = useQueryClient();
  const {mutate, error} = useMutation({
    mutationFn: async () => {
      const response = await instance.post(`/quest/verification/${quest.id}`, {
        comment: verificationText,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['Verification'],
      });
    },
    onError: error => {
      Alert.alert('오류', '인증 메시지 추가에 실패했습니다.');
    },
  });

  const handleVerify = () => {
    if (!verificationText.trim()) {
      Alert.alert('오류', '인증 메시지를 입력해주세요.');
      return;
    }
    mutate();
    //addVerification(quest.id);
    Alert.alert('성공', '퀘스트 인증이 완료되었습니다!');
    setVerificationText('');
    navigation.goBack();
  };

  if (!quest) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  // 모든 인증 메시지(댓글) 리스트 추출
  const allVerifications = quest.verifications?.flatMap(
    (r: any) => r.text || [],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일 ${String(date.getHours()).padStart(
      2,
      '0',
    )}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

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
            quest.isMain ? styles.mainQuestHeader : styles.subQuestHeader,
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
              <Text style={styles.questTitle}>{quest.title}</Text>
              <View style={{width: 40}} />
            </View>
            <Text style={styles.questDate}>
              {new Date(quest.startDate).toLocaleDateString()} -{' '}
              {new Date(quest.endDate).toLocaleDateString()}
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          (quest.records ? quest.records.length / 7 : 0) * 100,
                        ),
                      )}%`,
                      backgroundColor: quest.isMain ? '#4a90e2' : '#a0a0a0',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {quest.records?.length ?? 0}일차
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>퀘스트 타임라인</Text>
          {quest.records.map(record => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>
                  {formatDate(record.createdAt.toString() || '')}
                </Text>
              </View>
              {record.images && (
                <ImageCarousel images={record.images} />
                // <Image
                //   source={{uri: record.images[0]}}
                //   style={styles.recordImage}
                //   resizeMode="cover"
                // />
              )}
              <Text style={styles.recordText}>{record.text}</Text>
            </View>
          ))}
        </View>

        {/* Section 2: Verification Comments */}
        <View style={styles.commentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>인증 댓글</Text>
            {!hasScrolledToBottom && (
              <View style={styles.scrollPrompt}>
                <Text style={styles.scrollPromptText}>
                  아래로 스크롤하여 인증하기
                </Text>
                <Icon name="arrow-downward" size={16} color="#666" />
              </View>
            )}
          </View>

          {allVerifications && allVerifications.length > 0 ? (
            allVerifications.map(text => <Text key={text}>{text}</Text>)
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
          onPress={handleVerify}>
          <Text style={styles.submitButtonText}>인증하기</Text>
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
  },
  progressText: {
    marginLeft: 10,
    fontSize: 12,
    color: '#666',
    minWidth: 50,
    textAlign: 'right',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    fontSize: 12,
    color: '#888',
  },
  recordImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  recordText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
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
    color: '#666',
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
    color: '#999',
    marginVertical: 20,
  },
});

export default QuestVerification;
