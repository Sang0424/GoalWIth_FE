import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useRoute, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CharacterAvatar from '../../components/CharacterAvatar';
import instance from '../../utils/axiosInterceptor';
import Config from 'react-native-config';
import {PeerListProps} from '../../types/navigation';
import ProfileBottomSheet from '../../components/ProfileBottomSheet';
import {useCancelRequestPeer} from '../../utils/mutations';
import {colors} from '../../styles/theme';

const PAGE_SIZE = 10;

const PeerListScreen = () => {
  const [isProfileVisible, setProfileVisible] = useState(false);
  const [selecteUser, setSelectUser] = useState<number | undefined>(undefined);
  const route = useRoute<PeerListProps>();
  const navigation = useNavigation();
  const {type} = route.params;
  const cancelRequestPeer = useCancelRequestPeer();

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
        return '내가 받은 동료 요청';
      case 'requesting':
        return '내가 요청한 동료';
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
    enabled: Config.API_URL !== '',
  });

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        setSelectUser(item.id);
        setProfileVisible(true);
      }}>
      <View style={styles.itemContent}>
        <CharacterAvatar
          avatar={
            item?.character || require('../../assets/character/pico_base.png')
          }
          size={50}
        />
        <Text style={styles.peerName}>{item.nickname}</Text>
        {type === 'requesting' && (
          <TouchableOpacity
            onPress={() =>
              Alert.alert('요청취소', '취소하시겠습니까??', [
                {text: '아니요', style: 'default'},
                {
                  text: '네',
                  style: 'destructive',
                  onPress: () => {
                    cancelRequestPeer(item);
                  },
                },
              ])
            }
            style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>요청 취소</Text>
          </TouchableOpacity>
        )}
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
        <Pressable
          onPress={() => navigation.goBack()}
          style={{position: 'absolute', left: 16, padding: 10}}>
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
      <ProfileBottomSheet
        visible={isProfileVisible}
        onClose={() => setProfileVisible(false)}
        userId={selecteUser}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  cancelButton: {
    position: 'absolute',
    right: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PeerListScreen;
