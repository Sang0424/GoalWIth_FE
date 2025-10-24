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
import {useMemo} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import CharacterAvatar from '../../components/CharacterAvatar';
import Logo from '../../components/Logo';
import type {Quest, ReactionType} from '../../types/quest.types';
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
import ReactionButton from '../../components/ReactionButton';
import {colors} from '../../styles/theme';

// const getReactionData = (
//   quest: Quest,
//   reactionType: ReactionType,
//   currentUserId?: number,
// ) => {
//   const {data: reactions} = useQuery({
//     queryKey: ['reactions', quest.id],
//     queryFn: () => instance.get(`/quest/${quest.id}/reactions`),
//   });
//   console.log('reactionsCount', reactions?.data);
//   const count = reactions?.data.filter((r: any) => r.key === reactionType);
//   const myReaction = reactions?.data.find(
//     (r: any) => r.key === reactionType && r.user.id === currentUserId,
//   );
//   return {
//     count,
//     myReaction: myReaction
//       ? {id: myReaction.id, type: myReaction.reactionType}
//       : null,
//   };
// };
const useReactionData = (questId: number | string) => {
  // 1. useQuery로 데이터를 불러옵니다.
  const {data: response, isLoading} = useQuery({
    queryKey: ['reactions', questId],
    queryFn: async () => {
      const {data} = await instance.get(`/quest/${questId}/reactions`);
      return data;
    },
  });

  // 2. useMemo를 사용해 응답 데이터를 UI에 필요한 형태로 가공합니다.
  //    (데이터가 변경될 때만 재계산되어 성능에 유리합니다.)
  const processedData = useMemo(() => {
    // 데이터가 없으면 기본값 반환
    if (!response) {
      return;
    }

    return {
      counts: response,
    };
  }, [response]);

  // 3. 가공된 데이터와 로딩 상태를 반환합니다.
  return {...processedData, isLoading};
};

const VerificationFeedCard = ({item}: {item: any}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<VerificationNavParamList>>();
  const [isProfileVisible, setProfileVisible] = useState(false);
  const [selecteUser, setSelectUser] = useState<number | undefined>(undefined);

  const reactions = useReactionData(item.id);

  console.log('reactions', reactions);
  const handleGoQuest = () => {
    navigation.navigate('QuestVerification', {quest: item});
  };
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => {
        setSelectUser(item.user.id);
        setProfileVisible(true);
      }}>
      <TouchableOpacity style={styles.cardHeader}>
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
          {new Date(item.startDate).toLocaleString('ko-KR')}
        </Text>
      </TouchableOpacity>
      <View style={styles.questInfo}>
        <Text style={styles.questTitle}>{item.title}</Text>
      </View>
      {item.records && item.records.length > 0 && (
        <View style={styles.imageGrid}>
          {item.records.map((record: any, index: any) => (
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
      <Text style={styles.contentText}>{item.description}</Text>
      <View style={styles.reactionsRow}>
        <ReactionButton
          targetType="quest"
          targetId={item.id}
          myReaction={reactions.counts?.myReaction}
          reactionType="support"
          count={reactions.counts?.support}
        />
        <ReactionButton
          targetType="quest"
          targetId={item.id}
          reactionType="amazing"
          myReaction={reactions.counts?.myReaction}
          count={reactions.counts?.amazing}
        />
        <ReactionButton
          targetType="quest"
          targetId={item.id}
          reactionType="together"
          myReaction={reactions.counts?.myReaction}
          count={reactions.counts?.together}
        />
        <ReactionButton
          targetType="quest"
          targetId={item.id}
          reactionType="perfect"
          myReaction={reactions.counts?.myReaction}
          count={reactions.counts?.perfect}
        />
      </View>
      {/* 인증자 수 표시 */}
      <Text style={{color: '#4CAF50', fontWeight: 'bold', marginTop: 6}}>
        현재 {item.verificationCount}
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

  const {
    data: peersVerificationData,
    isLoading: peersVerificationLoading,
    isFetchingNextPage: peersVerificationIsFetchingNextPage,
    fetchNextPage: peersVerificationFetchNextPage,
    hasNextPage: peersVerificationHasNextPage,
    refetch: peersVerificationRefetch,
  } = useInfiniteQuery({
    queryKey: ['PeersVerification'],
    initialPageParam: 0,
    queryFn: async ({pageParam = 0}) => {
      try {
        const response = await instance.get(
          `/quest/verification/peers?page=${pageParam}&size=${PAGE_SIZE}`,
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

  const peersVerificationQuests = React.useMemo(() => {
    if (API_URL === '') {
      const filtered = quests.filter(
        quest =>
          quest.verificationRequired === true && quest.procedure === 'verify',
      );
      return filtered.slice(0, (page + 1) * PAGE_SIZE);
    }
    return debouncedSearchQuery !== ''
      ? searchVerificationData?.pages.flatMap(page => page.content) || []
      : peersVerificationData?.pages.flatMap(page => page.content) || [];
  }, [quests, peersVerificationData, page]);

  const hasMore =
    activeTab === 'realtime'
      ? verificationQuests.length < (page + 1) * PAGE_SIZE
      : peersVerificationQuests.length < (page + 1) * PAGE_SIZE;

  const handleLoadMore = () => {
    if (API_URL == '') {
      if (hasMore) {
        setPage(page => page + 1);
      }
    }
    if (activeTab === 'realtime') {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
    if (activeTab === 'peers') {
      if (
        peersVerificationHasNextPage &&
        !peersVerificationIsFetchingNextPage
      ) {
        peersVerificationFetchNextPage();
      }
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
      : activeTab === 'realtime'
      ? await refetch()
      : await peersVerificationRefetch();
    setRefreshing(false);
  };

  // 팔로잉 피드는 userId가 'user1'인 것만 노출 (예시)
  const filteredFeed =
    activeTab === 'peers' ? peersVerificationQuests : verificationQuests;

  if (isLoading || searchVerificationLoading || peersVerificationLoading) {
    return <ActivityIndicator style={{flex: 1, marginTop: 100}} size="large" />;
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
      <View style={{paddingHorizontal: 16}}>
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
          <Text style={{fontSize: 24, fontWeight: 'bold', color: '#806A5B'}}>
            GoalWith
          </Text>
        </View>
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
        renderItem={({item}) => <VerificationFeedCard item={item} />}
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
    backgroundColor: colors.switchBG,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.font,
    backgroundColor: colors.switchBG,
    paddingVertical: 12,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.switchBG,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: colors.accent,
    backgroundColor: colors.switchBG,
  },
  tabLabel: {
    fontSize: 16,
    color: colors.gray,
    fontWeight: 'bold',
  },
  activeTabLabel: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray,
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
    borderRadius: 99,
    marginRight: 12,
    backgroundColor: colors.gray,
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.font,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 8,
  },
  questInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.font,
  },
  feedImage: {
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: colors.switchBG,
  },
  contentText: {
    fontSize: 14,
    color: colors.font,
    marginBottom: 8,
    marginTop: 8,
  },
  verifyBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyBtnText: {
    color: colors.btnFont,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default VerificationFeedScreen;
