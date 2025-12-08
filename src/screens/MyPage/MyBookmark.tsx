import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import instance from '../../utils/axiosInterceptor';
import {useNavigation} from '@react-navigation/native';
import {MyPageNavParamList} from '../../types/navigation';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useState} from 'react';
import Config from 'react-native-config';
import VerificationCard from '../../components/VerificationCard';
import Toast from 'react-native-toast-message';
import {colors} from '../../styles/theme';
import {
  AutoSkeletonView,
  AutoSkeletonIgnoreView,
} from 'react-native-auto-skeleton';

export default function MyBookmark() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MyPageNavParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['myBookmark'],
    initialPageParam: 0,
    queryFn: async ({pageParam = 0}) => {
      try {
        const response = await instance.get(
          `/quest/bookmarked?page=${pageParam}`,
        );
        return response.data;
      } catch (e: any) {
        Toast.show({
          type: 'error',
          text1: e.response.data.message,
        });
        return [];
      }
    },

    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNext ? allPages.length : undefined;
    },
    enabled: Config.API_URL != '',
  });
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const myBookmark = data?.pages.flatMap(page => page.content);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingVertical: 16,
        }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon
            name={
              Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back-android'
            }
            size={24}
            color={colors.font}
          />
        </Pressable>
        <Text style={{fontSize: 24, fontWeight: 'bold', textAlign: 'center'}}>
          내가 저장한 퀘스트
        </Text>
        <View style={{paddingHorizontal: 16}} />
      </View>
      <AutoSkeletonView isLoading={isLoading}>
        <FlatList
          data={myBookmark}
          renderItem={({item}) => <VerificationCard item={item} />}
          keyExtractor={item => item.id.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            <View style={styles.footer}>
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color="#000" />
              ) : null}
            </View>
          }
          contentContainerStyle={{padding: 16, paddingBottom: 32}}
          ListEmptyComponent={
            <Text
              style={{textAlign: 'center', color: colors.font, marginTop: 40}}>
              저장한 퀘스트가 없습니다.
            </Text>
          }
        />
      </AutoSkeletonView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
