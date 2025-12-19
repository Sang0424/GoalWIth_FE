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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useState, useCallback} from 'react';
import UserCard from '../../components/UserCard';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {PeersNavParamList} from '../../types/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Config from 'react-native-config';
import type {RequestedPeers} from '../../types/peers.types.d.ts';
import {useDebounce} from '../../utils/hooks/useDebounce';
import {colors} from '../../styles/theme';
import {AutoSkeletonView} from 'react-native-auto-skeleton';

const PAGE_SIZE = 10;

export default function Peers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const debouncedSearchQuery = useDebounce(searchQuery.toLowerCase(), 300);

  const {data: requestedPeersData} = useQuery({
    queryKey: ['requestedPeersCount'],
    queryFn: async () => {
      const response = await instance.get<RequestedPeers>(
        `/peer/requested?page=0&size=${PAGE_SIZE}`,
      );
      return response.data;
    },
    enabled: Config.API_URL !== '',
  });

  const {
    data: peersData,
    isLoading: peersLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['recommendPeers'],
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
    enabled: debouncedSearchQuery.length > 0,
    placeholderData: previousData => previousData,
  });
  const users =
    debouncedSearchQuery.length > 0
      ? searchPeersData?.pages.flatMap(page => page.content) || []
      : peersData?.pages.flatMap(page => page.content) || [];

  const requestedPeersCount =
    Config.API_URL === '' ? 0 : requestedPeersData?.totalElements || 0;

  const navigation =
    useNavigation<NativeStackNavigationProp<PeersNavParamList>>();

  const loadMorePeers = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    if (searchHasNextPage && !searchIsFetchingNextPage) {
      searchFetchNextPage();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    searchHasNextPage,
    searchIsFetchingNextPage,
    searchFetchNextPage,
  ]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    debouncedSearchQuery !== '' ? searchRefetch() : refetch();
    setIsRefreshing(false);
  }, [refetch, searchRefetch]);

  // if (peersLoading || searchPeersLoading) {
  //   return (
  //     <SafeAreaView
  //       style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
  //       <ActivityIndicator size="large" />
  //     </SafeAreaView>
  //   );
  // }

  const renderHeader = () => {
    return (
      <>
        <View>
          <Pressable
            style={styles.request}
            onPress={() => navigation.navigate('PeerRequest')}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}>
              <Text style={{fontSize: 16}}>받은 요청</Text>
              {requestedPeersCount > 0 && (
                <View style={styles.requestCount}>
                  <Text style={{color: '#FFFFFF', fontSize: 12}}>
                    {requestedPeersCount}
                  </Text>
                </View>
              )}
            </View>
            <Icon name="chevron-right" size={24} />
          </Pressable>
        </View>
      </>
    );
  };

  const renderItems = (item: any) => {
    return (
      <View
        style={{marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
        <UserCard user={item.item} from="peers" />
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
      {(peersLoading || searchPeersLoading) && (
        <ActivityIndicator size="small" color={colors.primary} />
      )}
      <FlatList
        data={users}
        renderItem={renderItems}
        keyExtractor={item => item.id}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListHeaderComponent={searchQuery.length > 0 ? null : renderHeader}
        contentContainerStyle={[{paddingHorizontal: 16, paddingTop: 8}]}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMorePeers}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          !hasNextPage ? <View style={{height: 80}} /> : null
        }
        numColumns={2}
        columnWrapperStyle={{
          gap: 8,
          marginBottom: 16,
        }}
        ListEmptyComponent={
          <Text style={{textAlign: 'center'}}>동료가 없습니다.</Text>
        }
        extraData={searchQuery}
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
    width: 24,
    height: 24,
    borderRadius: 99,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
