// ================= 기존 코드 (주석처리) =================
/*
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CharacterAvatar from '../components/CharacterAvatar';
import { VerificationFeedItem, RecordItem, VerificationMessage } from '../types/feed.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#806a5b';
const LIGHT_BG = '#f5f1ee';
const DARK_TEXT = '#333333';

type RootStackParamList = {
  QuestVerification: { quest: VerificationItem };
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
  const [showFilters, setShowFilters] = useState(false);
  const navigation = useNavigation<VerificationFeedScreenNavigationProp>();
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: '전체',
    difficulty: '전체',
    duration: '전체',
    sort: '최신순'
  });

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
          userAvatar: '',
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
        {
          id: '2',
          userId: 'user2',
          userName: '이영희',
          userLevel: 8,
          userAvatar: '',
          goalTitle: '매일 영어 단어 10개 외우기',
          goalPeriod: '2024.03-2024.09',
          progress: 60,
          verificationCount: 18,
          requiredVerifications: 30,
          category: '학습',
          difficulty: '초급',
          description: '꾸준히 영어 공부 중입니다!',
          isUrgent: false,
          daysLeft: 15
        }
      ];
      
      setVerificationItems(mockData);
      setRefreshing(false);
    }, 500);
  };

  const handleItemPress = (item: VerificationItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderTimeline = () => {
    if (!selectedItem) return null;
    
    const timelineItems = [
      { id: '1', date: '2024.01.03', text: '목표 설정 완료' },
      { id: '2', date: '2024.01.10', text: '첫 인증 완료' },
      { id: '3', date: '2024.01.17', text: '2주차 인증 완료' },
      { id: '4', date: '2024.01.24', text: '3주차 인증 완료' },
    ];
    
    return (
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>진행 타임라인</Text>
        {timelineItems.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            {index < timelineItems.length - 1 && <View style={styles.timelineLine} />}
            <View style={styles.timelineContent}>
              <Text style={styles.timelineDate}>{item.date}</Text>
              <Text style={styles.timelineText}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>
    );
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
          <CharacterAvatar size={100} level={item.userLevel} />
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
            contentContainerStyle={styles.filterSection}
            style={styles.filterScrollView}
          >
            <Text style={styles.filterLabel}>카테고리:</Text>
            {FILTER_OPTIONS.CATEGORY.map(cat => 
              renderFilterChip('category', cat, cat)
            )}
          </ScrollView>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterSection}
            style={styles.filterScrollView}
          >
            <Text style={styles.filterLabel}>난이도:</Text>
            {FILTER_OPTIONS.DIFFICULTY.map(diff => 
              renderFilterChip('difficulty', diff, diff)
            )}
          </ScrollView>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterSection}
            style={styles.filterScrollView}
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
    backgroundColor: '#f1f1f1',
  },
  filterContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: PRIMARY_COLOR,
  },
  filterChipText: {
    color: DARK_TEXT,
    fontSize: 12,
  },
  activeFilterChipText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_TEXT,
    marginLeft: 12,
  },
  userLevel: {
    fontSize: 12,
    color: '#666',
  },
  goalPeriod: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
    marginTop: 4,
  },
  urgentTag: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  urgentText: {
    color: '#e53935',
    fontSize: 12,
    fontWeight: '500',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  verificationInfo: {
    marginBottom: 12,
  },
  verificationText: {
    fontSize: 14,
    color: DARK_TEXT,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: DARK_TEXT,
  },
  timelineContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_TEXT,
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY_COLOR,
    marginRight: 12,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: -16,
    width: 2,
    backgroundColor: PRIMARY_COLOR,
    opacity: 0.3,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timelineText: {
    fontSize: 14,
    color: DARK_TEXT,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterScrollView: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e9ecef',
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
*/

// ================= 새로운 인증 피드 구현 (Mock UI) =================
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import CharacterAvatar from '../components/CharacterAvatar';
import { VerificationFeedItem, RecordItem } from '../types/feed.types';

// 피드 타입 정의
// interface VerificationMessage {
//   id: string;
//   user: { id: string; nickname: string; avatar: string };
//   text: string;
//   createdAt: string;
// }

// interface RecordItem {
//   id: string;
//   text: string;
//   images: string[];
//   createdAt: string;
//   verifications: VerificationMessage[];
// }

// interface VerificationFeedItem {
//   id: string;
//   user: {
//     id: string;
//     nickname: string;
//     avatar: string;
//     level: number;
//     badge: string;
//   };
//   quest: {
//     id: string;
//     title: string;
//     category: string;
//     streak: number;
//   };
//   records: RecordItem[];
//   content: {
//     text: string;
//     images: string[];
//     tags: string[];
//     location?: string;
//   };
//   reactions: {
//     support: number;
//     amazing: number;
//     together: number;
//     perfect: number;
//   };
//   comments: any[];
//   quality_score: number;
//   timestamp: string;
// }

// Mock 데이터
const MOCK_FEED: VerificationFeedItem[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      nickname: '철수',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      level: 5,
      badge: '초보자'
    },
    quest: {
      id: 'quest1',
      title: '매일 1시간 운동하기',
      category: '건강/운동',
      streak: 7,
    },
    content: {
      text: '오늘도 운동 인증! #운동 #꾸준함',
      images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb'],
      tags: ['#운동', '#꾸준함'],
      location: '서울시 강남구',
    },
    reactions: {
      support: 23,
      amazing: 15,
      together: 8,
      perfect: 12,
    },
    comments: [],
    quality_score: 85,
    timestamp: '2025-06-11T10:30:00Z',
    records: [
      {
        id: 'rec1',
        userId: 'user1',
        text: '1일차 인증',
        images: ['https://example.com/image3.jpg'],
        createdAt: '2023-05-15T10:30:00Z',
        verifications: [
          { 
            id: 'v1', 
            user: { id: 'user2', nickname: '철수', avatar: 'https://example.com/avatar2.jpg' }, 
            text: '잘했어요!', 
            createdAt: '2023-05-15T11:00:00Z' 
          },
          { 
            id: 'v2', 
            user: { id: 'user3', nickname: '영희', avatar: 'https://example.com/avatar3.jpg' }, 
            text: '멋집니다!', 
            createdAt: '2023-05-15T11:30:00Z' 
          }
        ]
      },
      {
        id: 'rec2',
        userId: 'user1',
        text: '2일차 인증',
        images: ['https://example.com/image4.jpg'],
        createdAt: '2023-05-16T09:15:00Z',
        verifications: [
          { 
            id: 'v3', 
            user: { id: 'user4', nickname: '민수', avatar: 'https://example.com/avatar4.jpg' }, 
            text: '파이팅!', 
            createdAt: '2023-05-16T10:00:00Z' 
          }
        ]
      }
    ]
  },

  {
    id: '2',
    user: {
      id: 'user2',
      nickname: '팀원2',
      avatar: 'https://example.com/avatar2.jpg',
      level: 5,
      badge: 'gold'
    },
    quest: {
      id: 'quest2',
      title: '매일 영어 단어 10개 외우기',
      category: '학습',
      streak: 12,
    },
    content: {
      text: '오늘은 20개 외웠어요! #학습',
      images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308'],
      tags: ['#학습'],
    },
    reactions: {
      support: 10,
      amazing: 5,
      together: 2,
      perfect: 7,
    },
    comments: [],
    quality_score: 92,
    timestamp: '2025-06-11T09:10:00Z',
    records: [
      {
        id: 'record1',
        userId: 'user1',
        text: '오늘의 목표를 달성했습니다!',
        images: ['https://example.com/image1.jpg'],
        createdAt: '2023-05-15T10:30:00Z',
        verifications: [
          {
            id: 'v1',
            user: { id: 'user2', nickname: '검토자1', avatar: 'https://example.com/avatar1.jpg' },
            text: '잘 하셨습니다!',
            createdAt: '2023-05-15T11:00:00Z'
          }
        ]
      },
      {
        id: 'rec2',
        userId: 'user1',
        text: '2일차 인증',
        images: ['https://example.com/image2.jpg'],
        createdAt: '2023-05-16T09:15:00Z',
        verifications: []
      }
    ]
  },
  
];

// 카드 컴포넌트
import { useNavigation } from '@react-navigation/native';

const VerificationFeedCard = ({ item }: { item: VerificationFeedItem }) => {
  const navigation = useNavigation<any>();
  const handleGoQuest = () => {
    navigation.navigate('QuestVerification', { questId: item.quest.id });
  };
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={handleGoQuest}>
      <View style={styles.cardHeader}>
        <CharacterAvatar size={40} level={item.user.level} />
        <View style={{ flex: 1 }}>
          <Text style={styles.nickname}>{item.user.nickname} (Lv.{item.user.level})</Text>
          <Text style={styles.badge}>{item.user.badge}</Text>
        </View>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString('ko-KR')}</Text>
      </View>
      <View style={styles.questInfo}>
        <Text style={styles.questTitle}>{item.quest.title}</Text>
        <Text style={styles.streak}>🔥 {item.quest.streak}일 연속 인증</Text>
      </View>
      {item.content.images && item.content.images.length > 0 && (
        <Image source={{ uri: item.content.images[0] }} style={styles.feedImage} />
      )}
      <Text style={styles.contentText}>{item.content.text}</Text>
      <View style={styles.tagsRow}>
        {item.content.tags.map(tag => (
          <Text key={tag} style={styles.tag}>{tag}</Text>
        ))}
      </View>
      <View style={styles.reactionsRow}>
        <ReactionButton type="support" count={item.reactions.support} />
        <ReactionButton type="amazing" count={item.reactions.amazing} />
        <ReactionButton type="together" count={item.reactions.together} />
        <ReactionButton type="perfect" count={item.reactions.perfect} />
      </View>
      <Text style={styles.qualityScore}>AI 품질점수: {item.quality_score}</Text>
      {/* 인증자 수 표시 */}
      <Text style={{ color: '#4CAF50', fontWeight: 'bold', marginTop: 6 }}>
        현재 {item.records.reduce((acc, rec) => acc + (rec.verifications?.length || 0), 0)}명이 인증했습니다.
      </Text>
      <TouchableOpacity style={styles.verifyBtn} onPress={handleGoQuest} activeOpacity={0.85}>
        <Text style={styles.verifyBtnText}>인증하기</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const ReactionButton = ({ type, count }: { type: string; count: number }) => {
  const emojiMap: Record<string, string> = {
    support: '💪',
    amazing: '👏',
    together: '🤝',
    perfect: '🌟',
  };
  const labelMap: Record<string, string> = {
    support: '응원해요',
    amazing: '대단해요',
    together: '함께해요',
    perfect: '완벽해요',
  };
  return (
    <TouchableOpacity style={styles.reactionBtn}>
      <Text style={styles.reactionEmoji}>{emojiMap[type]}</Text>
      <Text style={styles.reactionLabel}>{labelMap[type]}</Text>
      <Text style={styles.reactionCount}>{count}</Text>
    </TouchableOpacity>
  );
};

const TAB_LIST = [
  { key: 'realtime', label: '실시간' },
  { key: 'following', label: '팔로잉' },
];

const VerificationFeedScreen = () => {
  const [feed, setFeed] = useState<VerificationFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'realtime' | 'following'>('realtime');

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setFeed(MOCK_FEED);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed().then(() => setRefreshing(false));
  };

  // 팔로잉 피드는 userId가 'user1'인 것만 노출 (예시)
  const filteredFeed = activeTab === 'following'
    ? feed.filter(item => item.user.id === 'user1')
    : feed;

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 100 }} size="large" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f1f1' }}>
      <View style={styles.tabRow}>
        {TAB_LIST.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab.key as 'realtime' | 'following')}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredFeed}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <VerificationFeedCard item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>피드가 없습니다.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: '#4CAF50',
    backgroundColor: '#f8f8f8',
  },
  tabLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  badge: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  questInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  streak: {
    fontSize: 13,
    color: '#f57c00',
    fontWeight: '500',
  },
  feedImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  contentText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    color: '#555',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 3,
  },
  reactionsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  reactionEmoji: {
    fontSize: 17,
    marginRight: 3,
  },
  reactionLabel: {
    fontSize: 13,
    color: '#444',
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 13,
    color: '#888',
    fontWeight: 'bold',
  },
  qualityScore: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'right',
  },
  verifyBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
});

export default VerificationFeedScreen;