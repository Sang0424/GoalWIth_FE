import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ScrollView,
  RefreshControl
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../contexts/AppContext';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  QuestVerification: { quest: any };
};

type VerificationFeedScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuestVerification'>;

interface VerificationItem {
  id: string;
  userId: string;
  userName: string;
  userLevel: number;
  userAvatar: string;
  goalTitle: string;
  goalPeriod: string;
  progress: number;
  verificationCount: number;
  requiredVerifications: number;
  category: string;
  difficulty: '초급' | '중급' | '고급';
  description: string;
  isUrgent: boolean;
  daysLeft: number;
}

const FILTER_OPTIONS = {
  CATEGORY: ['전체', '건강', '학습', '취미', '커리어'],
  DIFFICULTY: ['전체', '초급', '중급', '고급'],
  DURATION: ['전체', '단기(~1개월)', '중기(1-6개월)', '장기(6개월+)'],
  SORT: ['최신순', '마감순', '추천순']
};

const VerificationFeedScreen = () => {
  const navigation = useNavigation<VerificationFeedScreenNavigationProp>();
  const { getVerificationFeed } = useAppContext();
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: '전체',
    difficulty: '전체',
    duration: '전체',
    sort: '최신순',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with actual API call
  const loadVerificationFeed = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      const mockData: VerificationItem[] = [
        {
          id: '1',
          userId: 'user1',
          userName: '김철수',
          userLevel: 15,
          userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          goalTitle: '매일 1시간 운동하기',
          goalPeriod: '2024.01-2024.06',
          progress: 80,
          verificationCount: 7,
          requiredVerifications: 10,
          category: '건강',
          difficulty: '중급',
          description: '6개월간 꾸준히 운동했습니다!',
          isUrgent: true,
          daysLeft: 2
        },
        // Add more mock data as needed
      ];
      
      setVerificationItems(mockData);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    loadVerificationFeed();
  }, []);

  const handleVerify = (item: VerificationItem) => {
    navigation.navigate('QuestVerification', { quest: item });
  };

  const renderFilterChip = (type: string, value: string, label: string) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.filterChip,
        activeFilters[type as keyof typeof activeFilters] === value && styles.activeFilterChip
      ]}
      onPress={() => setActiveFilters(prev => ({ ...prev, [type]: value }))}
    >
      <Text style={[
        styles.filterChipText,
        activeFilters[type as keyof typeof activeFilters] === value && styles.activeFilterChipText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderVerificationItem = ({ item }: { item: VerificationItem }) => (
    <View style={[styles.card, item.isUrgent && styles.urgentCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{item.userName} <Text style={styles.userLevel}>Lv.{item.userLevel}</Text></Text>
            <Text style={styles.goalPeriod}>📅 {item.goalPeriod}</Text>
          </View>
        </View>
        {item.isUrgent && <View style={styles.urgentTag}><Text style={styles.urgentText}>마감임박</Text></View>}
      </View>
      
      <Text style={styles.goalTitle}>🎯 {item.goalTitle}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>진행률: {item.progress}%</Text>
      </View>
      
      <View style={styles.verificationInfo}>
        <Text style={styles.verificationText}>
          👥 현재 인증 수: {item.verificationCount}/{item.requiredVerifications}
          {item.daysLeft > 0 && ` (마감: ${item.daysLeft}일)`}
        </Text>
      </View>
      
      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>난이도: {item.difficulty}</Text>
        </View>
      </View>
      
      <Text style={styles.description}>{item.description}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.laterButton]}
          onPress={() => {}}
        >
          <Text style={styles.laterButtonText}>나중에</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.notInterestedButton]}
          onPress={() => {}}
        >
          <Text style={styles.notInterestedButtonText}>관심없음</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.verifyButton]}
          onPress={() => handleVerify(item)}
        >
          <Text style={styles.verifyButtonText}>자세히 보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>인증 검토하기</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <MaterialIcons 
            name={showFilters ? 'keyboard-arrow-up' : 'filter-list'} 
            size={24} 
            color="#333" 
          />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterSection}
          >
            <Text style={styles.filterLabel}>카테고리:</Text>
            {FILTER_OPTIONS.CATEGORY.map(cat => 
              renderFilterChip('category', cat, cat)
            )}
          </ScrollView>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterSection}
          >
            <Text style={styles.filterLabel}>난이도:</Text>
            {FILTER_OPTIONS.DIFFICULTY.map(diff => 
              renderFilterChip('difficulty', diff, diff)
            )}
          </ScrollView>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterSection}
          >
            <Text style={styles.filterLabel}>기간:</Text>
            {FILTER_OPTIONS.DURATION.map(dur => 
              renderFilterChip('duration', dur, dur)
            )}
          </ScrollView>
          
          <View style={styles.sortContainer}>
            <Text style={styles.filterLabel}>정렬:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortOptions}
            >
              {FILTER_OPTIONS.SORT.map(sort => 
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.sortOption,
                    activeFilters.sort === sort && styles.activeSortOption
                  ]}
                  onPress={() => setActiveFilters(prev => ({ ...prev, sort }))}
                >
                  <Text style={[
                    styles.sortOptionText,
                    activeFilters.sort === sort && styles.activeSortOptionText
                  ]}>
                    {sort}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      )}
      
      {verificationItems.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="search-off" size={60} color="#ccc" />
          <Text style={styles.emptyStateText}>인증이 필요한 목표가 없습니다</Text>
          <Text style={styles.emptyStateSubtext}>필터를 조정하거나 나중에 다시 확인해주세요</Text>
        </View>
      ) : (
        <FlatList
          data={verificationItems}
          renderItem={renderVerificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadVerificationFeed}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
        />
      )}
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
    fontWeight: '500',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f1f3f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  activeFilterChip: {
    backgroundColor: '#e6f7ee',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 13,
    color: '#495057',
  },
  activeFilterChipText: {
    color: '#2b8a3e',
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 15,
    backgroundColor: '#f1f3f5',
  },
  activeSortOption: {
    backgroundColor: '#4CAF50',
  },
  sortOptionText: {
    fontSize: 13,
    color: '#495057',
  },
  activeSortOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e9ecef',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  userLevel: {
    fontSize: 13,
    color: '#868e96',
    fontWeight: 'normal',
  },
  goalPeriod: {
    fontSize: 12,
    color: '#868e96',
    marginTop: 2,
  },
  urgentTag: {
    backgroundColor: '#fff0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgentText: {
    color: '#ff6b6b',
    fontSize: 11,
    fontWeight: '600',
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#868e96',
    textAlign: 'right',
  },
  verificationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  verificationText: {
    fontSize: 13,
    color: '#495057',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#495057',
  },
  description: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    flex: 2,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  laterButton: {
    backgroundColor: '#e9ecef',
  },
  laterButtonText: {
    color: '#495057',
    fontWeight: '500',
    fontSize: 14,
  },
  notInterestedButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  notInterestedButtonText: {
    color: '#868e96',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#868e96',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VerificationFeedScreen;
