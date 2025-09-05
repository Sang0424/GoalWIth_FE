import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useRoute, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CharacterAvatar from '../../components/CharacterAvatar';
import instance from '../../utils/axiosInterceptor';
import {API_URL} from '@env';
import {PeerListProps} from '../../types/navigation';

const PAGE_SIZE = 10;

const PeerListScreen = () => {
  const route = useRoute<PeerListProps>();
  const navigation = useNavigation();
  const {type} = route.params;

  console.log('type:', type);

  const getEndpoint = () => {
    switch (type) {
      case 'peers':
        return '/peer';
      case 'requested':
        return '/peer/requested';
      case 'requesting':
        return '/peer/requesting';
      default:
        return '/peer';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'peers':
        return '내 동료';
      case 'requested':
        return '내가 요청한 동료';
      case 'requesting':
        return '나에게 요청한 동료';
      default:
        return '동료 목록';
    }
  };

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['peers', type],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get(
        `${getEndpoint()}?page=${pageParam}&size=${PAGE_SIZE}`,
      );
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage.number < lastPage.totalPages - 1) {
        return lastPage.number + 1;
      }
      return undefined;
    },
    enabled: API_URL !== '',
  });

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <CharacterAvatar
          avatar={
            item?.character || require('../../assets/character/pico_base.png')
          }
          size={50}
        />
        <Text style={styles.peerName}>{item.nickname}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text>오류가 발생했습니다.</Text>
      </View>
    );
  }

  const peers = data?.pages.flatMap(page => page.content) || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{padding: 10}}>
          <Icon
            name={
              Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back-android'
            }
            size={20}
            color={'#000'}
          />
        </Pressable>
        <Text style={styles.title}>{getTitle()}</Text>
      </View>
      <FlatList
        data={peers}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  peerName: {
    marginLeft: 16,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
});

export default PeerListScreen;
