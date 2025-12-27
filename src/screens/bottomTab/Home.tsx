import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
import {
  requestMultiple,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);
  const [isAddingMainQuest, setIsAddingMainQuest] = useState(false);
  const [filter, setFilter] = useState<'ONGOING' | 'VERIFY' | 'COMPLETED'>(
    'ONGOING',
  );
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
  const {data: userData, refetch: userRefetch} = useQuery({
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

  useEffect(() => {
    if (data) {
      setQuests(data.quests);
    }
  }, [data]);

  useEffect(() => {
    const askPermissions = async () => {
      // 1. 플랫폼별 권한 리스트 정의
      const permissions = Platform.select({
        ios: [
          PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY,
          PERMISSIONS.IOS.CAMERA,
          PERMISSIONS.IOS.PHOTO_LIBRARY,
        ],
        android: [
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ],
      });

      if (!permissions) return;

      // 2. 일괄 요청
      const statuses = await requestMultiple(permissions);

      const libraryStatus =
        Platform.OS === 'ios'
          ? statuses[PERMISSIONS.IOS.PHOTO_LIBRARY]
          : statuses[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES];

      const storageStatus =
        Platform.OS === 'ios'
          ? statuses[PERMISSIONS.IOS.PHOTO_LIBRARY]
          : statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];

      if (
        libraryStatus === RESULTS.BLOCKED ||
        libraryStatus === RESULTS.DENIED
      ) {
        // 사용자가 거부했거나 이미 차단된 경우
        Alert.alert(
          '앨범 접근 권한 필요',
          '글을 올리기 위해서는 앨범 접근 권한이 필수입니다. 설정 -> 개인정보 보호 및 보안에서 접근을 허용해주세요',
          [
            {text: '나중에', style: 'cancel'},
            {
              text: '설정으로 이동',
              onPress: () => openSettings(), // 앱 설정 화면으로 이동
            },
          ],
        );
      }

      // 3. 결과 확인 (디버깅용)
      console.log('Permission Statuses:', statuses);
    };

    // 4. 약간의 지연 시간을 주어 화면 전환이 끝난 후 팝업이 뜨게 함 (UX 권장사항)
    const timer = setTimeout(() => {
      askPermissions();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const currentExp = user?.exp || 0;
  const maxExp = Math.round(200 * Math.pow(user?.level, 1.1));
  const levelProgress = (currentExp / maxExp) * 100;

  const mainQuest =
    quests && quests.length > 0
      ? quests.filter((quest: Quest) => quest.isMain)
      : [];
  const subQuests =
    quests && quests.length > 0
      ? quests.filter((quest: Quest) => !quest.isMain).slice(0, 10)
      : [];

  const isQuestCompleted = (quest?: Quest | null) =>
    quest?.procedure === 'complete';

  const isQuestVerify = (quest?: Quest | null) => quest?.procedure === 'verify';

  const isQuestProgress = (quest?: Quest | null) =>
    quest?.procedure === 'progress';

  const matchesCurrentFilter = (quest: Quest) => {
    switch (filter) {
      case 'COMPLETED':
        return isQuestCompleted(quest);
      case 'VERIFY':
        return isQuestVerify(quest);
      case 'ONGOING':
        return isQuestProgress(quest);
    }
  };

  const filteredMainQuest =
    mainQuest && mainQuest.length > 0
      ? mainQuest.filter(matchesCurrentFilter)
      : [];

  const filteredSubQuests = subQuests.filter(matchesCurrentFilter);

  const canAddMainQuest =
    filter === 'ONGOING' && (!mainQuest || mainQuest.length === 0);

  const hasVerifyingQuest = mainQuest?.some(
    quest => quest.procedure === 'verify',
  );

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
          : filter === 'VERIFY'
          ? isMain
            ? '인증 중인 메인 퀘스트가 없어요'
            : '인증 중인 서브 퀘스트가 없어요'
          : isMain
          ? hasVerifyingQuest
            ? '인증 중인 메인 퀘스트가 있어요'
            : '진행 중인 메인 퀘스트가 없어요'
          : '진행 중인 서브 퀘스트가 없어요'}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {filter === 'COMPLETED'
          ? '완료된 퀘스트가 이곳에 표시됩니다'
          : filter === 'VERIFY'
          ? '인증 중인 퀘스트가 이곳에 표시됩니다'
          : isMain
          ? hasVerifyingQuest
            ? '인증이 완료되면 메인 퀘스트를 생성할 수 있습니다'
            : '단 하나의 메인 퀘스트만 생성할 수 있습니다'
          : '마음껏 서브 퀘스트를 생성해보세요'}
      </Text>
      {filter === 'ONGOING' && (!isMain || canAddMainQuest) && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setQuestToEdit(null);
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
      if (quest.procedure === 'verify') return '인증 중';

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
          ? (endDateObj.getDate() - startDateObj.getDate()) * 3
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
        renderRightActions={
          quest.procedure === 'progress' ? renderRightActions : undefined
        }
        onSwipeableWillOpen={() => setShowHint(false)}>
        <TouchableOpacity
          onPress={() => {
            quest.procedure === 'progress'
              ? navigation.navigate('QuestFeed', {
                  quest,
                })
              : quest.verificationRequired
              ? navigation.navigate('QuestVerification', {
                  id: quest.id,
                })
              : navigation.navigate('QuestFeed', {
                  quest,
                });
          }}
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
      await userRefetch();
    } catch (error) {
      Alert.alert('문제가 발생하였습니다.', '다시 시도해주세요.');
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
                <Text style={styles.badgeText}>
                  {user?.badge ? user.badge : null}
                </Text>
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
                        {width: `${levelProgress}%`},
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {`${user?.exp || 0} / ${maxExp} XP`}
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
                  filter === 'VERIFY' && styles.filterChipActive,
                ]}
                onPress={() => setFilter('VERIFY')}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.filterChipText,
                    filter === 'VERIFY' && styles.filterChipTextActive,
                  ]}>
                  인증 중
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
                {canAddMainQuest && !filteredMainQuest && (
                  <TouchableOpacity
                    onPress={() => {
                      setQuestToEdit(null);
                      setIsAddingMainQuest(true);
                      setModalVisible(true);
                    }}>
                    <Text style={styles.sectionLink}>+ 추가</Text>
                  </TouchableOpacity>
                )}
              </View>
              {filteredMainQuest.length > 0 ? (
                <QuestItem
                  quest={filteredMainQuest[0]}
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
                      setQuestToEdit(null);
                      setIsAddingMainQuest(false);
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
                        setQuestToEdit(null);
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
    backgroundColor: colors.done,
  },
  deleteButton: {
    backgroundColor: colors.error,
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
    color: colors.gray,
    fontSize: 12,
    zIndex: 1,
  },
  hintText: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{translateY: -8}],
    color: colors.gray,
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
  completeButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  completedButton: {
    backgroundColor: colors.gray,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: 'white',
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
    color: colors.gray,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.font,
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
    backgroundColor: colors.switchBG,
    borderRadius: 4,
    marginBottom: 6,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'right',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.font,
    marginBottom: 12,
    textAlign: 'center',
  },
  badgeText: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  filterSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.switchBG,
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
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.font,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.background,
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
    color: colors.done,
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
    borderColor: colors.lightGray, // Blue border for main quest
  },
  subQuestCard: {
    borderWidth: 1,
    borderColor: colors.lightGray, // Gray border for sub-quests
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
    color: colors.font,
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
  deadlineText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: 'bold',
  },
  timelinePreview: {
    marginTop: 12,
  },
  timelineCount: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  rewardSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.switchBG,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  rewardDetail: {
    fontSize: 10,
    color: colors.gray,
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
    color: colors.gray,
    marginRight: 8,
  },
  dateRangeText: {
    fontSize: 11,
    color: colors.gray,
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
    backgroundColor: colors.switchBG,
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
    marginTop: 12,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  seeAll: {
    color: colors.font,
    fontSize: 14,
  },
  noQuestsText: {
    fontSize: 14,
    color: colors.font,
    textAlign: 'center',
    marginVertical: 16,
  },
  addQuestButton: {
    backgroundColor: colors.accent,
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
    color: colors.gray,
  },
  emptyStateIcon: {
    fontSize: 48,
    color: colors.gray,
  },
});
