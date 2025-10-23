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
import {colors} from '../../styles/theme';

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);
  const [isAddingMainQuest, setIsAddingMainQuest] = useState(false);
  const [filter, setFilter] = useState<'ONGOING' | 'COMPLETED'>('ONGOING');
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeNavParamList>>();
  const swipeableRef = useRef<any>(null);
  const [showHint, setShowHint] = useState(true);
  const setUser = userStore(state => state.setUser);
  const queryClient = useQueryClient();

  const {mutate} = useMutation({
    mutationFn: async (questId: number) => {
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
    enabled: true,
  });
  const {data: userData} = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await instance.get(`/user/info`);
      const user = response.data;
      return user;
    },
    enabled: true,
  });

  const user = userData;

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  const quests = data?.quests;

  const currentExp = user?.exp || 0;
  const maxExp = user?.level ? user.level * 100 : 100;
  const progress = Math.min((currentExp / Math.max(maxExp, 1)) * 100, 100);

  const mainQuest =
    quests && quests?.length > 0
      ? quests?.find((quest: Quest) => quest.isMain)
      : null;
  const subQuests =
    quests && quests?.length > 0
      ? quests?.filter((quest: Quest) => !quest.isMain).slice(0, 10)
      : [];

  const isQuestCompleted = (quest: Quest) => {
    return (
      quest.procedure === 'complete' ||
      (quest.requiredVerification &&
        quest.verificationCount &&
        quest.verificationCount >= quest.requiredVerification)
    );
  };
  const filteredMainQuest =
    mainQuest &&
    ((filter === 'COMPLETED' && isQuestCompleted(mainQuest)) ||
      (filter === 'ONGOING' && !isQuestCompleted(mainQuest)))
      ? mainQuest
      : null;

  const filteredSubQuests = subQuests.filter((q: Quest) =>
    filter === 'COMPLETED' ? isQuestCompleted(q) : !isQuestCompleted(q),
  );

  // const recommendedQuests = [
  //   {
  //     id: 1,
  //     title: '아침 30분 산책하기',
  //     description: '하루를 상쾌하게 시작해보세요!',
  //     xp: 50,
  //   },
  //   {
  //     id: 2,
  //     title: '책 1챕터 읽기',
  //     description: '지식을 쌓는 시간을 가져보세요',
  //     category: '자기계발',
  //     xp: 70,
  //   },
  //   {
  //     id: 3,
  //     title: '물 8잔 마시기',
  //     description: '건강한 하루를 위한 필수 미션',
  //     category: '건강',
  //     xp: 30,
  //   },
  // ];

  // Render empty state
  const renderEmptyState = (isMain: boolean) => (
    <View style={styles.emptyState}>
      <Icon
        name={isMain ? 'emoji-events' : 'check-circle-outline'}
        size={48}
        color={colors.gray}
        style={styles.emptyStateIcon}
      />
      <Text style={styles.emptyStateText}>
        {filter === 'COMPLETED'
          ? isMain
            ? '완료된 메인 퀘스트가 없어요'
            : '완료된 서브 퀘스트가 없어요'
          : isMain
          ? '진행 중인 메인 퀘스트가 없어요'
          : '진행 중인 서브 퀘스트가 없어요'}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {filter === 'COMPLETED'
          ? '완료된 퀘스트가 이곳에 표시됩니다'
          : isMain
          ? '단 하나의 메인 퀘스트만 생성할 수 있습니다'
          : '마음껏 서브 퀘스트를 생성해보세요'}
      </Text>
      {filter === 'ONGOING' && (
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
      )}
    </View>
  );
  const QuestItem = ({
    quest,
    onDelete,
    onEdit,
  }: {
    quest: Quest;
    onDelete: (id: number) => void;
    onEdit: (quest: Quest) => void;
  }) => {
    if (!quest) return null;

    // useEffect(() => {
    //   const timer = setTimeout(() => {
    //     setShowHint(false);
    //   }, 100000);
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
              activeOpacity={0.85}
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                swipeableRef.current?.close();
                onEdit(quest);
              }}>
              <Icon name="edit" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                swipeableRef.current?.close();
                onDelete(quest.id);
              }}>
              <Icon name="delete" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>삭제</Text>
            </TouchableOpacity>
          </Reanimated.View>
        </View>
      );
    };

    // New date calculations
    const now = new Date();
    const startDateObj = quest.startDate ? new Date(quest.startDate) : null;
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
          quest.requiredVerification || 0
        }`;
      }
      return `${Math.round(percentage)}% 완료`;
    };

    // Reward calculation
    const calculateReward = () => {
      const baseExp = 50;
      const recordBonus = (quest.records?.length || 0) * 5;
      const verificationBonus = quest.verificationRequired
        ? (quest.verificationCount || 0) * 10 + 50
        : 0;
      const timelineBonus =
        endDateObj && startDateObj
          ? (endDateObj.getTime() - startDateObj.getTime()) * 3
          : 0;
      const overVerificationBonus =
        quest.verificationRequired &&
        quest.verificationCount &&
        quest.requiredVerification &&
        quest.verificationCount > quest.requiredVerification
          ? quest.requiredVerification * 5 +
            (quest.verificationCount - quest.requiredVerification) * 10
          : 0;

      return (
        baseExp +
        recordBonus +
        verificationBonus +
        timelineBonus +
        overVerificationBonus
      );
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
      (quest.requiredVerification &&
        (quest.verificationCount ?? 0) >= (quest.requiredVerification ?? 0))
        ? [styles.completedCard]
        : []),
    ];

    return (
      <ReanimatedSwipeable
        ref={swipeableRef}
        containerStyle={styles.swipeableContainer}
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => setShowHint(false)}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('QuestFeed', {
              quest,
            })
          }
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
                {quest.procedure === 'progress' && isDeadlineClose && (
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
              {quest.procedure === 'progress' && showHint && (
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

  const handleDeleteQuest = (questId: number) => {
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
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Logo
                resizeMode="contain"
                imageStyle={{
                  width: 56,
                  height: 56,
                  marginBottom: 8,
                  marginRight: 16,
                }}
              />
              <Text
                style={{fontSize: 24, fontWeight: 'bold', color: '#806A5B'}}>
                GoalWith
              </Text>
            </View>
            <TouchableOpacity
              style={styles.characterContainer}
              onPress={() => {
                navigation.navigate('CharacterSelection', {
                  currentCharacter: user?.character,
                });
              }}
              activeOpacity={0.8}>
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
            </TouchableOpacity>

            <View style={styles.filterSegmentContainer}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filter === 'ONGOING' && styles.filterChipActive,
                ]}
                onPress={() => setFilter('ONGOING')}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.filterChipText,
                    filter === 'ONGOING' && styles.filterChipTextActive,
                  ]}>
                  진행중
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filter === 'COMPLETED' && styles.filterChipActive,
                ]}
                onPress={() => setFilter('COMPLETED')}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.filterChipText,
                    filter === 'COMPLETED' && styles.filterChipTextActive,
                  ]}>
                  완료됨
                </Text>
              </TouchableOpacity>
            </View>

            {/* Main Quest Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>메인 퀘스트</Text>
                {!filteredMainQuest && filter === 'ONGOING' && (
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(true);
                    }}>
                    <Text style={styles.sectionLink}>+ 추가</Text>
                  </TouchableOpacity>
                )}
              </View>
              {filteredMainQuest ? (
                <QuestItem
                  quest={filteredMainQuest}
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
                {filter === 'ONGOING' && (
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(true);
                    }}>
                    <Text style={styles.sectionLink}>+ 추가</Text>
                  </TouchableOpacity>
                )}
              </View>
              {filteredSubQuests && filteredSubQuests?.length > 0 ? (
                <>
                  {filteredSubQuests?.map((quest: Quest) => (
                    <QuestItem
                      key={quest.id}
                      quest={quest}
                      onDelete={handleDeleteQuest}
                      onEdit={handleEditQuest}
                    />
                  ))}
                  {filter === 'ONGOING' && (
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
                  )}
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
    width: 180,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 6,
  },
  actionButton: {
    width: 80,
    height: '88%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, // rounded corners
    marginHorizontal: 4, // spacing between buttons
    shadowColor: '#000', // subtle shadow/elevation
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
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
    marginTop: 4,
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
  filterSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    padding: 6,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#806a5b',
  },
  filterChipText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
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
    color: colors.font,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray,
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
    color: colors.gray,
  },
});
