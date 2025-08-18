import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  PanResponder,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useEffect, useState, useRef} from 'react';
import BottomSheet from '../../components/BottomSheet';
import {useNavigation} from '@react-navigation/native';
import {HomeNavParamList} from '../../types/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import instance from '../../utils/axiosInterceptor';
import {useQuery} from '@tanstack/react-query';
import {userStore} from '../../store/userStore';
import CharacterAvatar from '../../components/CharacterAvatar';
import type {Quest} from '../../types/quest.types';
import type {User} from '../../types/user.types';
import {useQuestStore} from '../../store/mockData';
import {useQueryClient} from '@tanstack/react-query';
import {useMutation} from '@tanstack/react-query';
import {API_URL} from '@env';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);
  const [isAddingMainQuest, setIsAddingMainQuest] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeNavParamList>>();
  const isMockData = API_URL == '';
  const storeUser = userStore(state => state.user);
  const mockQuests = useQuestStore(state => state.quests);
  const swipeableRef = useRef<any>(null);
  const [showHint, setShowHint] = useState(true);
  const queryClient = useQueryClient();

  const {mutate} = useMutation({
    mutationFn: async (questId: string) => {
      if (API_URL === '') {
        useQuestStore.getState().deleteQuest(questId);
        return;
      }
      await instance.delete(`/quest/${questId}`);
    },
    onSuccess: () => {
      Alert.alert('퀘스트 삭제!', '퀘스트를 삭제했습니다!');
      queryClient.invalidateQueries({queryKey: ['homeQuests']});
    },
    onError: error => {
      Alert.alert('오류', '퀘스트 삭제 중 오류가 발생했습니다.');
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['homeQuests']});
    },
  });

  const {data, error, isLoading, refetch} = useQuery({
    queryKey: ['homeQuests'],
    queryFn: async () => {
      const response = await instance.get(`/quest`);
      const quests = response.data;
      return quests;
    },
    enabled: !isMockData,
  });
  const {data: userData} = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await instance.get(`/user/info`);
      const user = response.data;
      return user;
    },
    enabled: !isMockData,
  });
  if (isLoading) {
    return <Text>로딩중</Text>;
  }
  if (error) {
    return <Text>ㅅㅂ 에러네 + {error.message}</Text>;
  }
  const quests = isMockData ? mockQuests : data?.quests;

  const user = isMockData
    ? {
        id: '',
        name: 'User',
        email: '',
        nickname: 'User',
        userType: 'student',
        level: 10,
        exp: 0,
        maxExp: 100,
        actionPoints: 100,
        avatar: require('../../assets/character/pico_base.png'),
        // Note: Removed createdAt and updatedAt as they're not in the User type
      }
    : userData;
  // ********* Backend랑 연결 부분 *********
  const currentExp = (user as User).exp;
  const maxExp = (user as User).level * 100;
  const progress = Math.min((currentExp / Math.max(maxExp, 1)) * 100, 100);

  const mainQuest =
    quests && quests?.length > 0
      ? quests?.find((quest: Quest) => quest.isMain)
      : null;
  const subQuests =
    quests && quests?.length > 0
      ? quests?.filter((quest: Quest) => !quest.isMain).slice(0, 5)
      : [];

  // Render empty state
  const renderEmptyState = (isMain: boolean) => (
    <View style={styles.emptyState}>
      <Icon
        name={isMain ? 'emoji-events' : 'check-circle-outline'}
        size={48}
        color="#adb5bd"
        style={styles.emptyStateIcon}
      />
      <Text style={styles.emptyStateText}>
        {isMain ? '메인 퀘스트를 생성해보세요' : '서브 퀘스트를 생성해보세요'}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {isMain
          ? '단 하나의 메인 퀘스트만 생성할 수 있습니다'
          : '마음껏 서브 퀘스트를 생성해보세요'}
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsAddingMainQuest(isMain);
          setModalVisible(true);
        }}>
        <Text style={styles.addButtonText}>
          {isMain ? '메인 퀘스트 추가' : '서브 퀘스트 추가'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  const QuestItem = ({
    quest,
    onDelete,
    onEdit,
  }: {
    quest: Quest;
    onDelete: (id: string) => void;
    onEdit: (quest: Quest) => void;
  }) => {
    if (!quest) return null;

    // useEffect(() => {
    //   const timer = setTimeout(() => {
    //     setShowHint(false);
    //   }, 3000);
    //   return () => clearTimeout(timer);
    // }, []);

    const renderRightActions = (progress: any, _dragX: any) => {
      const animatedStyles = useAnimatedStyle(() => {
        return {
          transform: [{translateX: progress.value}],
        };
      });
      return (
        <View style={styles.rightActionsContainer}>
          <Reanimated.View style={[styles.actionButtonInner, animatedStyles]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                swipeableRef.current?.close();
                onEdit(quest);
              }}>
              <Text style={styles.actionText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                swipeableRef.current?.close();
                onDelete(quest.id);
              }}>
              <Text style={styles.actionText}>삭제</Text>
            </TouchableOpacity>
          </Reanimated.View>
        </View>
      );
    };

    // New date calculations
    const now = new Date();
    const endDateObj = quest.endDate ? new Date(quest.endDate) : null;
    const timeDiff = endDateObj ? endDateObj.getTime() - now.getTime() : 0;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const isDeadlineClose = daysRemaining <= 3 && daysRemaining >= 0;

    // Progress calculation functions
    const calculateProgressPercentage = () => {
      if (!quest.startDate || !quest.endDate) return 0;

      const start = new Date(quest.startDate).getTime();
      const end = new Date(quest.endDate).getTime();
      const now = new Date().getTime();

      const totalDuration = end - start;
      const elapsed = now - start;

      return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    };

    const calculateProgressText = () => {
      if (quest.procedure === 'complete') return '완료됨';

      const percentage = calculateProgressPercentage();
      if (quest.verificationRequired) {
        return `인증 ${quest.verificationCount || 0} / ${
          quest.requiredVerifications || 0
        }`;
      }
      return `${Math.round(percentage)}% 완료`;
    };

    // Reward calculation
    const calculateReward = () => {
      const baseExp = 50;
      const timelineBonus = (quest.records?.length || 0) * 10;
      const verificationBonus = quest.verificationRequired
        ? (quest.verificationCount || 0) * 10
        : 0;

      return baseExp + timelineBonus + verificationBonus;
    };

    // Format date range
    const formatDateRange = (startDate: string, endDate: string) => {
      if (!startDate || !endDate) return '기간 미정';

      const start = new Date(startDate);
      const end = new Date(endDate);

      const formatDay = (date: Date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][
          date.getDay()
        ];
        return `${month}.${day}(${dayOfWeek})`;
      };

      return `${formatDay(start)} ~ ${formatDay(end)}`;
    };

    const cardStyle: ViewStyle[] = [
      styles.questCard,
      ...(quest.isMain ? [styles.mainQuestCard] : []),
      ...(quest.procedure === 'complete' ||
      (quest.requiredVerifications &&
        (quest.verificationCount ?? 0) >= (quest.requiredVerifications ?? 0))
        ? [styles.completedCard]
        : []),
    ];

    const handleCompleteQuest = (quest: Quest) => {
      if (quest.verificationRequired) {
        Alert.alert('인증 필요!', '인증을 완료해주세요!');
      } else {
        Alert.alert('퀘스트 완료!', '퀘스트를 완료했습니다!');
      }
    };

    return (
      <ReanimatedSwipeable
        ref={swipeableRef}
        containerStyle={styles.swipeableContainer}
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => setShowHint(false)}>
        <TouchableOpacity
          onPress={() => navigation.navigate('QuestFeed', {quest: quest})}
          activeOpacity={0.88}>
          <View style={cardStyle}>
            {/* New UI Implementation */}
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.questTitle} numberOfLines={1}>
                  {quest.title}
                </Text>
                <View style={styles.statusBadge}>
                  {quest.isMain && <Text style={styles.mainBadge}>MAIN</Text>}
                  <Text style={styles.verificationBadge}>
                    {quest.verificationRequired ? '인증필요' : '자유퀘스트'}
                  </Text>
                </View>
              </View>
              <View>
                <Text style={{fontSize: 12, color: '#888'}}>
                  {quest.description}
                </Text>
              </View>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {width: `${calculateProgressPercentage()}%`},
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {calculateProgressText()}
                </Text>
              </View>
            </View>

            {/* Date Info */}
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>
                {formatDateRange(
                  String(quest.startDate),
                  String(quest.endDate),
                )}
                {isDeadlineClose && (
                  <Text style={styles.deadlineText}>
                    ·{' '}
                    {daysRemaining === 0 ? '오늘 마감!' : `D-${daysRemaining}`}
                  </Text>
                )}
              </Text>
            </View>

            {/* Reward Info */}
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardText}>
                보상: {calculateReward()} EXP
              </Text>
              {showHint && (
                <Text style={styles.hintText}>
                  {'<<< '}스와이프하여 수정/삭제
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  const handleDeleteQuest = (questId: string) => {
    Alert.alert('퀘스트 삭제!', '퀘스트를 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: () => {
          mutate(questId);
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.log(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditQuest = (quest: Quest) => {
    setQuestToEdit(quest);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.container}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }>
            {/* Character and Stats Section */}
            <Logo
              resizeMode="contain"
              style={{width: 150, height: 45, marginBottom: 16}}
            />
            <View style={styles.characterContainer}>
              <CharacterAvatar
                size={150}
                level={user?.level}
                avatar={
                  user?.character ||
                  require('../../assets/character/pico_base.png')
                }
              />
              <View style={styles.statsContainer}>
                <Text style={styles.welcomeText}>{user?.nickname}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>레벨</Text>
                    <Text style={styles.statValue}>Lv. {user?.level || 1}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>실행력</Text>
                    <Text style={styles.statValue}>
                      {user?.actionPoints || 0} 점
                    </Text>
                  </View>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {width: `${Math.min(user?.exp || 0, 100)}%`},
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {`${user?.exp || 0} / ${user?.maxExp || 100} XP`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Main Quest Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>메인 퀘스트</Text>
                {!mainQuest && (
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(true);
                    }}>
                    <Text style={styles.sectionLink}>+ 추가</Text>
                  </TouchableOpacity>
                )}
              </View>
              {mainQuest ? (
                <QuestItem
                  quest={mainQuest}
                  onDelete={handleDeleteQuest}
                  onEdit={handleEditQuest}
                />
              ) : (
                renderEmptyState(true)
              )}
            </View>

            {/* Sub-Quests Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>서브 퀘스트</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(true);
                  }}>
                  <Text style={styles.sectionLink}>+ 추가</Text>
                </TouchableOpacity>
              </View>
              {subQuests && subQuests?.length > 0 ? (
                <>
                  {subQuests?.map((quest: Quest) => (
                    <QuestItem
                      key={quest.id}
                      quest={quest}
                      onDelete={handleDeleteQuest}
                      onEdit={handleEditQuest}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setIsAddingMainQuest(false);
                      setModalVisible(true);
                    }}>
                    <Text style={styles.addButtonText}>
                      {'서브 퀘스트 추가'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                renderEmptyState(false)
              )}
            </View>
            <BottomSheet
              todoModalVisible={modalVisible}
              settodoModalVisible={setModalVisible}
              isMainQuest={isAddingMainQuest}
              questToEdit={questToEdit}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  cardHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    gap: 4,
  },
  mainBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#806a5b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verificationBadge: {
    fontSize: 10,
    color: '#4A90E2',
    backgroundColor: '#E8F2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateInfo: {
    marginBottom: 8,
  },
  rewardInfo: {
    flexDirection: 'row',
    marginTop: 4,
  },
  completedCard: {
    backgroundColor: '#f0f9f0',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  flex1: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  swipeableContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
    overflow: 'hidden',
  },
  rightActionsContainer: {
    flexDirection: 'row',
    width: 150,
    height: '100%',
  },
  actionButton: {
    width: 75,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4e9af1',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  swipeHint: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{translateY: -8}],
    color: '#aaa',
    fontSize: 12,
    zIndex: 1,
  },
  hintText: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{translateY: -8}],
    color: '#aaa',
    fontSize: 12,
    zIndex: 1,
  },
  hintTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    textAlign: 'center',
    gap: 4,
  },
  actionButtonInner: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  completedButton: {
    backgroundColor: '#9E9E9E',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  characterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  statsContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    paddingRight: 16,
  },
  statItem: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 6,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    minHeight: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionLink: {
    color: '#007AFF',
    fontSize: 14,
  },
  questCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftColor: 'transparent',
  },
  mainQuestCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0', // Blue border for main quest
  },
  subQuestCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0', // Gray border for sub-quests
  },
  questHeader: {
    marginBottom: 8,
    gap: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verificationText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  deadlineText: {
    fontSize: 12,
    color: '#ff4d4f',
    fontWeight: 'bold',
  },
  timelinePreview: {
    marginTop: 12,
  },
  timelineCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timelineImages: {
    flexDirection: 'row',
    marginTop: 4,
  },
  timelineThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 4,
    backgroundColor: '#f0f0f0',
  },
  rewardSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1890ff',
  },
  rewardDetail: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#6c757d',
    marginRight: 8,
  },
  dateRangeText: {
    fontSize: 11,
    color: '#adb5bd',
    fontStyle: 'italic',
  },
  questStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#806a5b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  seeAll: {
    color: '#6c757d',
    fontSize: 14,
  },
  noQuestsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginVertical: 16,
  },
  addQuestButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  emptyStateIcon: {
    fontSize: 48,
    color: '#adb5bd',
  },
});
