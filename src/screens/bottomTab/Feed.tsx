import {
  View,
  Pressable,
  StyleSheet,
  TextInput,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import { useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCallback, useState, useRef, useEffect } from 'react';
import Post from '../../components/Post';
import {
  StackNavigationState,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { FeedNavParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { PostType } from '../../types/posts';
import axios from 'axios';
import { API_URL } from '@env';
import Separator from '../../components/Separator';
import instance from '../../utils/axiosInterceptor';

export default function Feed({
  route,
}: {
  route?: { params?: { props?: { feed_id: number; index: number } } };
}) {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState('');
  const [isList, setIsList] = useState(true);
  const postIndex = route?.params?.props?.index;
  const queryClient = useQueryClient();
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedNavParamList>>();

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (postIndex !== undefined)
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: postIndex,
      });
  }, [postIndex]);

  const onPostPress = ({ item, index }: { item: PostType; index: number }) => {
    navigation.navigate('PostDetail', { feed_id: item.id, index: index });
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
    isLoading,
  } = useInfiniteQuery<PostType[]>({
    queryKey: ['feeds'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await instance.get(
        `/feeds/?off=${pageParam}&search=${search}`,
      );
      const posts = response.data;
      return posts;
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length > 0) {
        return pages.length * 8;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
  const flattenedData = data?.pages.flat() ?? [];
  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };
  useFocusEffect(
    useCallback(() => {
      // queryClient.resetQueries({ queryKey: ['feeds'] }); // 쿼리 캐시를 완전히 리셋
      refetch(); // 새로운 데이터 fetch
    }, [refetch]),
  );
  if (isLoading) {
    return (
      <SafeAreaView>
        <ActivityIndicator color={'#806a5b'} />
      </SafeAreaView>
    );
  }
  if (status == 'error') {
    return (
      <SafeAreaView>
        <Text>{`ㅅㅂ 에러네 + ${error.message}`}</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, width: width }}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
        data={flattenedData}
        ref={flatListRef}
        renderItem={({ item, index }: { item: PostType; index: number }) => (
          <Pressable onPress={() => onPostPress({ item, index })}>
            <Post data={item} isList={isList} />
          </Pressable>
        )}
        initialScrollIndex={0}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
        maxToRenderPerBatch={8}
        keyboardShouldPersistTaps="handled"
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={Separator}
        refreshing={isLoading}
        onRefresh={refetch}
        initialNumToRender={8}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={<Text>피드를 추가해주세요</Text>}
        ListHeaderComponentStyle={{ marginBottom: 40 }}
        ListHeaderComponent={
          <View>
            <Logo resizeMode={'contain'} style={{ width: 120, height: 80 }} />
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
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 8,
    marginTop: 16,
    height: 48,
  },
  searchIcon: { backgroundColor: 'transparent' },
  searchInput: { flex: 1, paddingLeft: 8 },
});
