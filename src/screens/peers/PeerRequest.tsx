import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useCallback} from 'react';
import UserCard from '../../components/UserCard';
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PeersNavParamList} from '../../types/navigation';
import BackArrow from '../../components/BackArrow';
import type {RequestedPeers} from '../../types/peers.types.d.ts';
import {API_URL} from '@env';

const PAGE_SIZE = 5;

export default function PeerRequest() {
  const {
    data: requestedPeersData,
    isLoading: requestedPeersLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery<RequestedPeers, Error>({
    queryKey: ['requestedPeers'],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get<RequestedPeers>(
        `/peer/requested?page=${pageParam}&size=${PAGE_SIZE}`,
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
    enabled: API_URL !== '',
  });

  const loadMorePeers = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (requestedPeersLoading) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, paddingHorizontal: 12}}>
      <View style={styles.header}>
        <BackArrow />
        <Text style={{fontSize: 24}}>받은 동료 요청</Text>
        <View style={{width: 20}} />
      </View>
      <View style={styles.main}>
        <FlatList
          data={
            requestedPeersData?.pages.flatMap(page => page.content) || [
              {
                id: 0,
                nickname: 'UserNickname',
                userType: 'UserType',
                character: 'UserCharacter',
                level: 1,
                avatar: 'UserAvatar',
              },
            ]
          }
          renderItem={({item}: {item: any}) => (
            <UserCard user={item} from="requestedPeers" />
          )}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{
            gap: 8,
            marginBottom: 16,
          }}
          onEndReached={loadMorePeers}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            !hasNextPage ? <View style={{height: 80}}></View> : null
          }
          ListEmptyComponent={
            <Text style={{textAlign: 'center', fontSize: 16}}>
              동료 요청이 없습니다.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  main: {
    flex: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
  },
});
