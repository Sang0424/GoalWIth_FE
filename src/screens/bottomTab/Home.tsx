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
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
  ListRenderItem,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useEffect, useState} from 'react';
import type {Todo} from '../../types/todos';
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

const defaultUser: User = {
  id: '',
  name: 'User',
  email: '',
  nickname: 'User',
  userType: 'student',
  level: 1,
  exp: 0,
  maxExp: 100,
  actionPoints: 0,
  // Note: Removed createdAt and updatedAt as they're not in the User type
};

const quests: Quest[] = [
  // {
  //   id: '1',
  //   title: 'Quest 1',
  //   description: 'Description 1',
  //   isMain: true,
  //   startDate: new Date(),
  //   endDate: new Date(),
  //   completed: false,
  //   verificationRequired: true,
  //   verificationCount: 0,
  //   requiredVerifications: 5,
  //   records: [],
  //   category: 'category1',
  // },
  // {
  //   id: '2',
  //   title: 'Quest 2',
  //   description: 'Description 2',
  //   isMain: false,
  //   startDate: new Date(),
  //   endDate: new Date(),
  //   completed: false,
  //   verificationRequired: true,
  //   verificationCount: 0,
  //   requiredVerifications: 5,
  //   records: [],
  //   category: 'category2',
  // },
];

export default function Home() {
  const {width} = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddingMainQuest, setIsAddingMainQuest] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeNavParamList>>();
  const user = defaultUser;
  const currentExp = (user as User).exp;
  const maxExp = (user as User).maxExp;
  const progress = Math.min((currentExp / Math.max(maxExp, 1)) * 100, 100);

  const mainQuest = quests.find((quest: Quest) => quest.isMain);
  const subQuests = quests.filter((quest: Quest) => !quest.isMain).slice(0, 5);
  // ********* Backend랑 연결 부분 *********
  // const user = userStore(state => state.user);
  // console.log(user);
  // const { data, error, isLoading } = useQuery<Todo[]>({
  //   queryKey: ['homeTodos'],
  //   queryFn: async () => {
  //     const response = await instance.get(`/quest/`);
  //     const quests = response.data;
  //     return quests;
  //   },
  // });
  // if (isLoading) {
  //   return <Text>로딩중</Text>;
  // }
  // if (error) {
  //   return <Text>ㅅㅂ 에러네 + {error.message}</Text>;
  // }
  // ********* Backend랑 연결 부분 *********
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
  const QuestItem = ({quest}: {quest: Quest}) => {
    if (!quest) return null;

    const startDate = quest.startDate
      ? new Date(quest.startDate).toLocaleDateString()
      : 'No start date';
    const endDate = quest.endDate
      ? new Date(quest.endDate).toLocaleDateString()
      : 'No end date';

    const cardStyle: ViewStyle[] = [
      styles.questCard,
      ...(quest.isMain ? [styles.mainQuestCard] : []),
      ...(quest.completed ||
      (quest.requiredVerifications &&
        (quest.verificationCount ?? 0) >= (quest.requiredVerifications ?? 0))
        ? [styles.completedCard]
        : []),
    ];
    const handleCompleteQuest = (quest: Quest) => {
      // If verification is required, navigate to verification screen
      if (quest.verificationRequired) {
        // navigation.navigate('QuestVerification', { questId: quest.id } as any);
        Alert.alert('인증 필요!', '인증을 완료해주세요!');
      } else {
        // Otherwise, complete the quest directly
        // @ts-ignore - completeQuest will be available from AppContext
        //completeQuest(quest.id);
        Alert.alert('퀘스트 완료!', '퀘스트를 완료했습니다!');
      }
    };

    return (
      <TouchableOpacity
        style={cardStyle}
        // onPress={() => navigation.navigate('QuestDetail', { questId: quest.id })}
      >
        <View style={styles.questHeader}>
          <Text style={styles.questTitle} numberOfLines={1}>
            {quest.title}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.completeButton,
            quest.completed ||
            (quest.requiredVerifications &&
              (quest.verificationCount ?? 0) >=
                (quest.requiredVerifications ?? 0))
              ? styles.completedButton
              : null,
          ]}
          onPress={() => handleCompleteQuest(quest)}
          disabled={
            quest.completed ||
            (quest.requiredVerifications
              ? (quest.verificationCount ?? 0) >=
                (quest.requiredVerifications ?? 0)
              : false)
          }>
          <Text style={styles.completeButtonText}>
            {quest.completed ||
            (quest.requiredVerifications &&
              (quest.verificationCount ?? 0) >=
                (quest.requiredVerifications ?? 0))
              ? quest.requiredVerifications &&
                (quest.verificationCount ?? 0) >=
                  (quest.requiredVerifications ?? 0)
                ? '인증 완료'
                : '완료됨'
              : '완료하기'}
            {quest.verificationRequired &&
              !quest.completed &&
              ` (${quest.verificationCount ?? 0}${
                quest.requiredVerifications
                  ? `/${quest.requiredVerifications}`
                  : ''
              })`}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.container}
            keyboardShouldPersistTaps="handled">
            {/* Character and Stats Section */}
            <Logo
              resizeMode="contain"
              style={{width: 150, height: 45, marginBottom: 16}}
            />
            <View style={styles.characterContainer}>
              <CharacterAvatar size={150} level={user?.level} />
              <View style={styles.statsContainer}>
                <Text style={styles.welcomeText}>
                  안녕하세요, {user?.name}님!
                </Text>
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
                      {(user?.level || 1) * 10} 점
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
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(true);
                  }}>
                  <Text style={styles.sectionLink}>+ 추가</Text>
                </TouchableOpacity>
              </View>
              {mainQuest ? (
                <QuestItem quest={mainQuest} />
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
              {subQuests.length > 0 ? (
                <>
                  {subQuests.map(quest => (
                    <QuestItem key={quest.id} quest={quest} />
                  ))}
                  <TouchableOpacity style={styles.addQuestButton}>
                    <Text style={styles.addButtonText}>
                      새로운 퀘스트 추가하기
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
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
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
  difficultyButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  easyButtonActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  normalButtonActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  hardButtonActive: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  difficultyText: {
    fontSize: 14,
    color: '#666',
  },
  easyText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  normalText: {
    color: '#1565C0',
    fontWeight: '600',
  },
  hardText: {
    color: '#C62828',
    fontWeight: '600',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  categoryTextActive: {
    color: '#1565C0',
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  },
  mainQuestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3', // Blue border for main quest
  },
  subQuestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0', // Gray border for sub-quests
  },
  questHeader: {
    marginBottom: 8,
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
  questDate: {
    fontSize: 12,
    color: '#6c757d',
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
