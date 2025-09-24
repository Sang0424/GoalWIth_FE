import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CharacterAvatar from '../../components/CharacterAvatar';
import Logo from '../../components/Logo';
import type {Quest} from '../../types/quest.types';
import type {User} from '../../types/user.types';
import {useQuestStore} from '../../store/mockData';
import {useNavigation} from '@react-navigation/native';
import {VerificationNavParamList} from '../../types/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import instance from '../../utils/axiosInterceptor';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {API_URL} from '@env';
import {useDebounce} from '../../utils/hooks/useDebounce';

const VerificationFeedCard = ({item}: {item: {quest: Quest; user: User}}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<VerificationNavParamList>>();
  const handleGoQuest = () => {
    navigation.navigate('QuestVerification', {quest: item.quest});
  };
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={handleGoQuest}>
      <View style={styles.cardHeader}>
        <CharacterAvatar
          size={40}
          level={item.user.level}
          avatar={require('../../assets/character/pico_base.png')}
        />
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={styles.nickname}>
            {item.user.nickname} (Lv.{item.user.level})
          </Text>
          {/* <Text style={styles.badge}>{item.user.badge}</Text> */}
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.quest.startDate).toLocaleString('ko-KR')}
        </Text>
      </View>
      <View style={styles.questInfo}>
        <Text style={styles.questTitle}>{item.quest.title}</Text>
      </View>
      {item.quest.records && item.quest.records.length > 0 && (
        <View style={styles.imageGrid}>
          {item.quest.records.map((record, index) => (
            <View key={record.id} style={styles.gridItem}>
              <Image
                source={{uri: record.images?.[0]}}
                style={styles.gridImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      )}
      <Text style={styles.contentText}>{item.quest.description}</Text>
      <View style={styles.reactionsRow}>
        <ReactionButton type="support" count={11} />
        <ReactionButton type="amazing" count={2} />
        <ReactionButton type="together" count={0} />
        <ReactionButton type="perfect" count={2} />
      </View>
      {/* 인증자 수 표시 */}
      <Text style={{color: '#4CAF50', fontWeight: 'bold', marginTop: 6}}>
        현재 {item.quest.verificationCount}
        명이 인증했습니다.
      </Text>
      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={handleGoQuest}
        activeOpacity={0.85}>
        <Text style={styles.verifyBtnText}>인증하기</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const ReactionButton = ({type, count}: {type: string; count: number}) => {
  const emojiMap: Record<string, string> = {
    support: '💪',
    amazing: '👏',
    together: '🤝',
    perfect: '🌟',
  };
  const labelMap: Record<string, string> = {
    support: '응원',
    amazing: '대단',
    together: '함께',
    perfect: '완벽',
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
  {key: 'realtime', label: '실시간'},
  {key: 'peers', label: '피어즈'},
];

const VerificationFeedScreen = () => {
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'realtime' | 'peers'>('realtime');
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const queryClient = useQueryClient();

  console.log('verificaton searchquery', debouncedSearchQuery);

  const quests = useQuestStore(state => state.quests);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['Verification'],
    initialPageParam: 0,
    queryFn: async ({pageParam = 0}) => {
      try {
        const response = await instance.get(
          `/quest/verification?page=${pageParam}&size=${PAGE_SIZE}`,
        );
        return response.data;
      } catch (e: any) {
        setError(e.response.data.message);
        console.log('verification error', e.response.data.message);
        return {items: [], nextPage: null};
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNext ? allPages.length : undefined;
    },
    enabled: API_URL != '',
    refetchOnWindowFocus: true,
  });

  const {
    data: searchVerificationData,
    isLoading: searchVerificationLoading,
    isFetchingNextPage: searchVerificationIsFetchingNextPage,
    fetchNextPage: searchVerificationFetchNextPage,
    hasNextPage: searchVerificationHasNextPage,
    refetch: searchVerificationRefetch,
  } = useInfiniteQuery({
    queryKey: ['searchVerification', debouncedSearchQuery],
    initialPageParam: 0,
    queryFn: async ({pageParam = 0}) => {
      try {
        const response = await instance.get(
          `/search/quest/verification?search=${debouncedSearchQuery}&page=${pageParam}&size=${PAGE_SIZE}`,
        );
        // queryClient.invalidateQueries({
        //   queryKey: ['searchVerification', debouncedSearchQuery],
        // });
        return response.data;
      } catch (e: any) {
        setSearchError(e.response.data.message);
        console.log('search verification error', e.response.data.message);
        return {items: [], nextPage: null};
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNext ? allPages.length : undefined;
    },
    enabled: API_URL != '' && debouncedSearchQuery !== '',
  });

  // const {data: peerId, isLoading: peerIdLoading} = useQuery({
  //   queryKey: ['peerId'],
  //   queryFn: async () => {
  //     const response = await instance.get('/peer/myPeerId');
  //     return response.data;
  //   },
  //   enabled: API_URL != '',
  // });

  const verificationQuests = React.useMemo(() => {
    if (API_URL === '') {
      const filtered = quests.filter(
        quest =>
          quest.verificationRequired === true && quest.procedure === 'verify',
      );
      return filtered.slice(0, (page + 1) * PAGE_SIZE);
    }
    return debouncedSearchQuery !== ''
      ? searchVerificationData?.pages.flatMap(page => page.content) || []
      : data?.pages.flatMap(page => page.content) || [];
  }, [quests, data, page]);

  const hasMore = verificationQuests.length < (page + 1) * PAGE_SIZE;

  const handleLoadMore = () => {
    if (API_URL == '') {
      if (hasMore) {
        setPage(page => page + 1);
      }
    }
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    if (
      searchVerificationHasNextPage &&
      !searchVerificationIsFetchingNextPage
    ) {
      searchVerificationFetchNextPage();
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert(error);
    }
    if (searchError) {
      Alert.alert(searchError);
    }
  }, [error, searchError]);

  const onRefresh = async () => {
    setRefreshing(true);
    debouncedSearchQuery !== ''
      ? await searchVerificationRefetch()
      : await refetch();
    setRefreshing(false);
  };

  // 팔로잉 피드는 userId가 'user1'인 것만 노출 (예시)
  const filteredFeed =
    activeTab === 'peers'
      ? verificationQuests?.filter(item => item.id.includes('user1'))
      : verificationQuests;

  if (isLoading || searchVerificationLoading) {
    return <ActivityIndicator style={{flex: 1, marginTop: 100}} size="large" />;
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
      <View style={{paddingHorizontal: 16}}>
        <Logo
          resizeMode="contain"
          style={{width: 150, height: 45, marginBottom: 16}}
        />
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={32}
            color={'#000000'}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="검색어를 입력해주세요"
            style={[styles.searchInput]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Icon
              style={styles.searchIcon}
              name="cancel"
              size={24}
              color="#a1a1a1"
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>
      <View style={styles.tabRow}>
        {TAB_LIST.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabBtn,
              activeTab === tab.key && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab(tab.key as 'realtime' | 'peers')}>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredFeed}
        keyExtractor={item => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        renderItem={({item}) => (
          <VerificationFeedCard
            item={{
              quest: item,
              user: {
                id: 'user1',
                nickname: 'user1',
                level: 1,
                character: '../assets/character/pico_complete.png',
                name: 'user1',
                email: 'user1',
                userType: 'user1',
                actionPoints: 1,
                exp: 1,
                maxExp: 1,
              },
            }}
          />
        )}
        ListFooterComponent={
          searchQuery !== '' ? (
            searchVerificationIsFetchingNextPage ? (
              <ActivityIndicator size="small" color="#000" />
            ) : null
          ) : isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#000" />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{padding: 16, paddingBottom: 32}}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', color: '#999', marginTop: 40}}>
            피드가 없습니다.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginHorizontal: -2,
  },
  gridItem: {
    width: '25%',
    aspectRatio: 1,
    padding: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
  },
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
    borderBottomColor: '#5b807d',
    backgroundColor: '#f8f8f8',
  },
  tabLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#5b807d',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f1f1',
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  feedImage: {
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  contentText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    marginTop: 8,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 0, // Allow the button to shrink if needed
    flex: 1, // Distribute space equally
    marginHorizontal: 0, // Remove any horizontal margin that might cause overflow
    maxWidth: '24%', // Ensure 4 buttons fit within the row with gaps
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
  verifyBtn: {
    backgroundColor: '#5b807d',
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
