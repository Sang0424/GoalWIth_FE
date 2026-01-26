import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Button,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useState, useCallback, useMemo} from 'react';
import UserCard from '../../components/UserCard';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {PeersNavParamList} from '../../types/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Config from 'react-native-config';
import {useDebounce} from '../../utils/hooks/useDebounce';
import {colors} from '../../styles/theme';
import {useBlockStore} from '../../store/userStore';

const PAGE_SIZE = 10;

const TAB_LIST = [
  {key: 'myPeers', label: '나의 동료'},
  {key: 'requestedPeers', label: '받은 요청'},
  {key: 'searchPeers', label: '동료 검색'},
];

export default function Peers() {
  const [myPeerssearchQuery, setMyPeersSearchQuery] = useState('');
  const [requestedSearchQuery, setRequestedSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'myPeers' | 'requestedPeers' | 'searchPeers'
  >('myPeers');
  const queryClient = useQueryClient();

  const debouncedSearchQuery = useDebounce(searchQuery.toLowerCase(), 300);
  const debouncedMyPeersSearchQuery = useDebounce(
    myPeerssearchQuery.toLowerCase(),
    300,
  );
  const debouncedRequestedSearchQuery = useDebounce(
    requestedSearchQuery.toLowerCase(),
    300,
  );

  const blockedUsers = useBlockStore(state => state.blockedUsers);

  const {
    data: myPeersData,
    isLoading: myPeersLoading,
    hasNextPage: myPeersHasNextPage,
    isFetchingNextPage: myPeersIsFetchingNextPage,
    fetchNextPage: myPeersFetchNextPage,
    refetch: myPeersRefetch,
  } = useInfiniteQuery({
    queryKey: ['myPeers', debouncedMyPeersSearchQuery],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get(
        `/peer?search=${debouncedMyPeersSearchQuery}&page=${pageParam}&size=${PAGE_SIZE}`,
      );
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.number < lastPage.totalPages) {
        return lastPage.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: Config.API_URL !== '',
  });

  const {
    data: requestedPeersData,
    isLoading: requestedPeersLoading,
    hasNextPage: requestedPeersHasNextPage,
    isFetchingNextPage: requestedPeersIsFetchingNextPage,
    fetchNextPage: requestedPeersFetchNextPage,
    refetch: requestedPeersRefetch,
  } = useInfiniteQuery({
    queryKey: ['requestedPeers', debouncedRequestedSearchQuery],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get(
        `/peer/requested?search=${debouncedRequestedSearchQuery}&page=${pageParam}&size=${PAGE_SIZE}`,
      );
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.number < lastPage.totalPages) {
        return lastPage.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: Config.API_URL !== '',
  });

  const {
    data: peersData,
    isLoading: peersLoading,
    hasNextPage: peersHasNextPage,
    fetchNextPage: peersFetchNextPage,
    isFetchingNextPage: peersIsFetchingNextPage,
    refetch: peersRefetch,
  } = useInfiniteQuery({
    queryKey: ['recommendPeers', debouncedSearchQuery],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get(
        `/peer/recommend?page=${pageParam}&size=${PAGE_SIZE}`,
      );
      queryClient.invalidateQueries({queryKey: ['requestedPeers']});
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.number < lastPage.totalPages) {
        return lastPage.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: Config.API_URL !== '',
  });

  const {
    data: searchPeersData,
    isLoading: searchPeersLoading,
    hasNextPage: searchHasNextPage,
    fetchNextPage: searchFetchNextPage,
    isFetchingNextPage: searchIsFetchingNextPage,
    refetch: searchRefetch,
  } = useInfiniteQuery({
    queryKey: ['peers', debouncedSearchQuery],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get(
        `/search/user?search=${debouncedSearchQuery}&page=${pageParam}&size=${PAGE_SIZE}`,
      );
      queryClient.invalidateQueries({queryKey: ['searchPeersData']});
      return response.data;
    },
    getNextPageParam: lastPage => {
      if (lastPage.number < lastPage.totalPages) {
        return lastPage.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: debouncedSearchQuery.length > 0 && activeTab === 'searchPeers',
    placeholderData: previousData => previousData,
  });

  const users = useMemo(() => {
    return activeTab === 'myPeers'
      ? myPeersData?.pages.flatMap(page => page.content) || []
      : activeTab === 'searchPeers'
      ? debouncedSearchQuery.length > 0
        ? searchPeersData?.pages.flatMap(page => page.content) || []
        : peersData?.pages.flatMap(page => page.content) || []
      : activeTab === 'requestedPeers'
      ? requestedPeersData?.pages.flatMap(page => page.content) || []
      : [];
  }, [
    activeTab,
    debouncedSearchQuery,
    peersData,
    requestedPeersData,
    myPeersData,
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => !blockedUsers.includes(user.id));
  }, [users, blockedUsers]);

  const requestedPeersCount = requestedPeersData?.pages[0].totalElements;

  const navigation =
    useNavigation<NativeStackNavigationProp<PeersNavParamList>>();

  const loadMorePeers = useCallback(() => {
    if (activeTab === 'myPeers') {
      if (myPeersHasNextPage && !myPeersIsFetchingNextPage) {
        myPeersFetchNextPage();
      }
    }
    if (activeTab === 'searchPeers') {
      if (debouncedSearchQuery.length > 0) {
        if (searchHasNextPage && !searchIsFetchingNextPage) {
          searchFetchNextPage();
        }
      } else {
        if (peersHasNextPage && !peersIsFetchingNextPage) {
          peersFetchNextPage();
        }
      }
    }
    if (activeTab === 'requestedPeers') {
      if (requestedPeersHasNextPage && !requestedPeersIsFetchingNextPage) {
        requestedPeersFetchNextPage();
      }
    }
  }, [
    peersHasNextPage,
    peersIsFetchingNextPage,
    peersFetchNextPage,
    requestedPeersHasNextPage,
    requestedPeersIsFetchingNextPage,
    requestedPeersFetchNextPage,
    searchHasNextPage,
    searchIsFetchingNextPage,
    searchFetchNextPage,
    myPeersHasNextPage,
    myPeersIsFetchingNextPage,
  ]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    activeTab === 'myPeers'
      ? myPeersRefetch()
      : activeTab === 'searchPeers'
      ? peersRefetch()
      : activeTab === 'requestedPeers'
      ? requestedPeersRefetch()
      : peersRefetch();
    setIsRefreshing(false);
  }, [peersRefetch, requestedPeersRefetch]);

  const renderItems = (item: any) => {
    return (
      <View
        style={{marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
        {activeTab === 'requestedPeers' ? (
          <UserCard user={item.item} from="requestedPeers" />
        ) : activeTab === 'myPeers' ? (
          <UserCard user={item.item} from="myPeers" />
        ) : (
          <UserCard user={item.item} from="peers" />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: colors.background,
      }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name="menu" size={24} />
        </Pressable>
        <Text style={{fontSize: 24}}>동료 맺기</Text>
        <View style={{width: 20}} />
      </View>
      <>
        <View style={styles.tabRow}>
          {TAB_LIST.map(tab => {
            const isRequestTab = tab.key === 'requestedPeers';
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabBtn,
                  activeTab === tab.key && styles.activeTabBtn,
                ]}
                onPress={() =>
                  setActiveTab(
                    tab.key as 'myPeers' | 'requestedPeers' | 'searchPeers',
                  )
                }>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === tab.key && styles.activeTabLabel,
                    ]}>
                    {tab.label}
                  </Text>
                  {isRequestTab && requestedPeersCount > 0 && (
                    <View style={styles.requestCount}>
                      <Text style={{color: '#FFFFFF', fontSize: 12}}>
                        {requestedPeersCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
            placeholderTextColor={colors.gray}
            style={[styles.searchInput]}
            value={
              activeTab === 'myPeers'
                ? myPeerssearchQuery
                : activeTab === 'requestedPeers'
                ? requestedSearchQuery
                : searchQuery
            }
            onChangeText={
              activeTab === 'myPeers'
                ? setMyPeersSearchQuery
                : activeTab === 'requestedPeers'
                ? setRequestedSearchQuery
                : setSearchQuery
            }
          />
          {(activeTab === 'myPeers' && myPeerssearchQuery.length > 0) ||
          (activeTab === 'requestedPeers' && requestedSearchQuery.length > 0) ||
          (activeTab === 'searchPeers' && searchQuery.length > 0) ? (
            <Icon
              style={styles.searchIcon}
              name="cancel"
              size={24}
              color="#a1a1a1"
              onPress={() => {
                if (activeTab === 'myPeers') {
                  setMyPeersSearchQuery('');
                } else if (activeTab === 'requestedPeers') {
                  setRequestedSearchQuery('');
                } else {
                  setSearchQuery('');
                }
              }}
            />
          ) : null}
        </View>
        {(peersLoading || myPeersLoading || requestedPeersLoading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text>로딩 중... 조금만 기다려주세요</Text>
          </View>
        )}
        {activeTab === 'searchPeers' && debouncedSearchQuery.length == 0 && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.font,
              textAlign: 'center',
              marginTop: 8,
            }}>
            추천 동료
          </Text>
        )}
      </>
      <FlatList
        data={filteredUsers}
        renderItem={renderItems}
        keyExtractor={item => item.id}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        contentContainerStyle={[{paddingHorizontal: 16, paddingTop: 8}]}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMorePeers}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          !peersHasNextPage ? <View style={{height: 80}} /> : null
        }
        numColumns={2}
        columnWrapperStyle={{
          gap: 8,
          marginBottom: 16,
        }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
            }}>
            <Text style={{textAlign: 'center'}}>동료가 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  request: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.switchBG,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 24,
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
  requestCount: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 99,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.switchBG,
    marginTop: 24,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
});
