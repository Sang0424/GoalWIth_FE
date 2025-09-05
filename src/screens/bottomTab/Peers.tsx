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
import {initialUser} from '../../store/mockData';
import {API_URL} from '@env';
import type {RequestedPeers} from '../../types/peers.types.d.ts';

const PAGE_SIZE = 10;

export default function Peers() {
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // const {data: requestedPeersData, isLoading: requestedPeersLoading} =
  //   useInfiniteQuery<RequestedPeers, Error>({
  //     queryKey: ['requestedPeers'],
  //     queryFn: async ({pageParam = 0}) => {
  //       const response = await instance.get<RequestedPeers>(
  //         `/peer/requested?page=${pageParam}&size=${PAGE_SIZE}`,
  //       );
  //       return response.data;
  //     },
  //     getNextPageParam: (lastPage, allPages) => {
  //       if (lastPage.number < lastPage.totalPages) {
  //         return lastPage.number + 1;
  //       }
  //       return undefined;
  //     },
  //     initialPageParam: 0,
  //     enabled: API_URL !== '',
  //   });

  const {data: requestedPeersData} = useQuery({
    queryKey: ['requestedPeers'],
    queryFn: async () => {
      const response = await instance.get<RequestedPeers>(
        `/peer/requested?page=0&size=${PAGE_SIZE}`,
      );
      return response.data;
    },
    enabled: API_URL !== '',
  });

  const {
    data: peersData,
    isLoading: peersLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['peers'],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get(
        `/peer?page=${pageParam}&size=${PAGE_SIZE}`,
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
    enabled: API_URL !== '',
  });

  const users =
    API_URL === ''
      ? initialUser
      : peersData?.pages.flatMap(page => page.content) || [];

  const requestedPeersCount =
    API_URL === '' ? 0 : requestedPeersData?.totalElements || 0;

  const navigation =
    useNavigation<NativeStackNavigationProp<PeersNavParamList>>();

  console.log('peersData', peersData);
  console.log(
    'peersData flat content',
    peersData?.pages.flatMap(page => page.content),
  );
  console.log('requestedPeersData', requestedPeersData);
  console.log('hasNextPage', hasNextPage);
  console.log('isFetchingNextPage', isFetchingNextPage);
  console.log('users:', users);

  const loadMorePeers = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const renderHeader = useCallback(() => {
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
                <View
                  style={{
                    backgroundColor: '#806a5b',
                    width: 24,
                    height: 24,
                    borderRadius: 20,
                    marginLeft: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
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
  }, [requestedPeersCount, navigation]);

  const renderItems = useCallback((item: any) => {
    return (
      <View
        style={{marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
        <UserCard user={item.item} from="peers" />
      </View>
    );
  }, []);

  if (peersLoading) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{flex: 1, paddingHorizontal: 12, backgroundColor: '#FFFFFF'}}>
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
          style={[styles.searchInput]}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Icon
            style={styles.searchIcon}
            name="cancel"
            size={24}
            color="#a1a1a1"
            onPress={() => setSearch('')}
          />
        )}
      </View>
      <FlatList
        data={users}
        renderItem={renderItems}
        keyExtractor={item => item.id}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListHeaderComponent={renderHeader}
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
        extraData={search}
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
    paddingHorizontal: 12,
  },
  main: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    marginTop: 24,
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
});
