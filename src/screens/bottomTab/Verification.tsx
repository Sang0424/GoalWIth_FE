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
import Logo from '../../components/Logo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import instance from '../../utils/axiosInterceptor';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import Config from 'react-native-config';
import {useDebounce} from '../../utils/hooks/useDebounce';
import {colors} from '../../styles/theme';
import VerificationCard from '../../components/VerificationCard';
import NativeVerificationAd from '../../components/NativeVerificationAd';
import {
  AutoSkeletonView,
  AutoSkeletonIgnoreView,
} from 'react-native-auto-skeleton';
const TAB_LIST = [
  {key: 'realtime', label: '실시간'},
  {key: 'peers', label: '피어즈'},
];

const AD_FREQUENCY = 1;

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
        return {items: [], nextPage: null};
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNext ? allPages.length : undefined;
    },
    enabled: Config.API_URL != '',
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
        return response.data;
      } catch (e: any) {
        setSearchError(e.response.data.message);
        return {items: [], nextPage: null};
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNext ? allPages.length : undefined;
    },
    enabled: debouncedSearchQuery.length > 0,
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
        return {items: [], nextPage: null};
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNext ? allPages.length : undefined;
    },
    enabled: Config.API_URL != '',
  });

  const verificationQuests = React.useMemo(() => {
    return debouncedSearchQuery.length > 0
      ? searchVerificationData?.pages.flatMap(page => page.content) || []
      : data?.pages.flatMap(page => page.content) || [];
  }, [data, page, debouncedSearchQuery]);

  const peersVerificationQuests = React.useMemo(() => {
    return debouncedSearchQuery.length > 0
      ? searchVerificationData?.pages.flatMap(page => page.content) || []
      : peersVerificationData?.pages.flatMap(page => page.content) || [];
  }, [peersVerificationData, page, debouncedSearchQuery]);

  const hasMore =
    activeTab === 'realtime'
      ? verificationQuests.length < (page + 1) * PAGE_SIZE
      : peersVerificationQuests.length < (page + 1) * PAGE_SIZE;

  const handleLoadMore = () => {
    if (Config.API_URL == '') {
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
    debouncedSearchQuery.length > 0
      ? await searchVerificationRefetch()
      : activeTab === 'realtime'
      ? await refetch()
      : await peersVerificationRefetch();
    setRefreshing(false);
  };

  // 팔로잉 피드는 userId가 'user1'인 것만 노출 (예시)
  const filteredFeed =
    activeTab === 'peers' ? peersVerificationQuests : verificationQuests;

  const feedWithAds = useMemo(() => {
    const source = filteredFeed;
    const injected = [];
    for (let i = 0; i < source.length; i += 1) {
      injected.push({type: 'quest', data: source[i]});
      if ((i + 1) % AD_FREQUENCY === 0) {
        injected.push({type: 'ad', key: `ad-${i}`});
      }
    }
    return injected;
  }, [filteredFeed]);

  if (isLoading || searchVerificationLoading || peersVerificationLoading) {
    return (
      <SafeAreaView>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
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
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: colors.primary,
            }}>
            GoalWith
          </Text>
        </View>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={32}
            color={colors.font}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="검색어를 입력해주세요"
            placeholderTextColor={colors.gray}
            style={[styles.searchInput]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Icon
              style={styles.searchIcon}
              name="cancel"
              size={24}
              color={colors.font}
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
        data={feedWithAds}
        keyExtractor={item =>
          item.type === 'ad' ? item.key : item.data.id.toString()
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        renderItem={({item}: {item: any}) => {
          if (item.type === 'quest') {
            return <VerificationCard item={item.data} />;
          }
          return <NativeVerificationAd />;
        }}
        ListFooterComponent={
          debouncedSearchQuery.length > 0 ? (
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
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.switchBG,
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
});

export default VerificationFeedScreen;
