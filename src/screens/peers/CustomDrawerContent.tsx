import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {userStore} from '../../store/userStore';
import {SafeAreaView} from 'react-native-safe-area-context';
import CharacterAvatar from '../../components/CharacterAvatar';
import {API_URL} from '@env';
import {useCallback} from 'react';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import {
  DrawerNavigationProp,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {PeersDrawerParamList, PeersNavParamList} from '../../types/navigation';

const PAGE_SIZE = 5;

const PeerItem = ({item}: {item: any}) => (
  <View style={styles.peerItem}>
    <CharacterAvatar
      avatar={
        item?.character || require('../../assets/character/pico_base.png')
      }
      size={40}
    />
    <Text style={styles.peerName}>{item.nickname}</Text>
  </View>
);

export default function CustomDrawerContent(props: any) {
  const user = userStore(state => state.user);
  console.log('store user', user);
  const navigation =
    useNavigation<DrawerNavigationProp<PeersDrawerParamList>>();
  const currentRoute = useNavigationState(state => state.routes[state.index]);
  console.log('현재 스크린 이름:', currentRoute.name);

  // const {
  //   data: peersData,
  //   isLoading: peersLoading,
  //   hasNextPage,
  //   fetchNextPage,
  //   isFetchingNextPage,
  // } = useInfiniteQuery({
  //   queryKey: ['myPeers'],
  //   queryFn: async ({pageParam = 0}) => {
  //     const response = await instance.get(
  //       `/peer?page=${pageParam}&size=${PAGE_SIZE}`,
  //     );
  //     return response.data;
  //   },
  //   getNextPageParam: (lastPage, allPages) => {
  //     if (lastPage.number < lastPage.totalPages) {
  //       return lastPage.number + 1;
  //     }
  //     return undefined;
  //   },
  //   initialPageParam: 0,
  //   enabled: API_URL !== '',
  // });

  const {data: peersData, isLoading: peersLoading} = useQuery({
    queryKey: ['myPeers'],
    queryFn: async () => {
      const response = await instance.get('/peer?page=0&size=5');
      return response.data;
    },
    enabled: API_URL !== '',
  });

  // const {
  //   data: requestedPeersData,
  //   isLoading: requestingLoading,
  //   hasNextPage: requestinghasNextPage,
  //   fetchNextPage: fetchRequestingNextPage,
  //   isFetchingNextPage: isRequestingFetchingNextPage,
  // } = useInfiniteQuery({
  //   queryKey: ['requestedPeers'],
  //   queryFn: async ({pageParam = 0}) => {
  //     const response = await instance.get(
  //       `/peer/requesting?page=${pageParam}&size=${PAGE_SIZE}`,
  //     );
  //     return response.data;
  //   },
  //   getNextPageParam: (lastPage, allPages) => {
  //     if (lastPage.number < lastPage.totalPages) {
  //       return lastPage.number + 1;
  //     }
  //     return undefined;
  //   },
  //   initialPageParam: 0,
  //   enabled: API_URL !== '',
  // });

  const {data: requestingPeersData, isLoading: requestingLoading} = useQuery({
    queryKey: ['requestingPeers'],
    queryFn: async () => {
      const response = await instance.get('/peer/requesting?page=0&size=5');
      return response.data;
    },
    enabled: API_URL !== '',
  });

  const handleNavigation = (screen: keyof PeersNavParamList, params?: any) => {
    // Close drawer first
    props.navigation.closeDrawer();

    // Then navigate using the parent navigator
    props.navigation.navigate('PeersNav', {
      screen,
      params,
    });
  };

  // const loadMorePeers = useCallback(() => {
  //   if (hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // const loadMoreRequestedPeers = useCallback(() => {
  //   if (requestinghasNextPage && !isRequestingFetchingNextPage) {
  //     fetchRequestingNextPage();
  //   }
  // }, [
  //   requestinghasNextPage,
  //   isRequestingFetchingNextPage,
  //   fetchRequestingNextPage,
  // ]);
  const sections = [
    {
      title: '내 동료',
      data: peersData?.content || [
        {
          id: 1,
          nickname: 'test',
          character: require('../../assets/character/pico_base.png'),
        },
        {
          id: 2,
          nickname: 'second',
          character: require('../../assets/character/pico_base.png'),
        },
        {
          id: 3,
          nickname: 'third',
          character: require('../../assets/character/pico_base.png'),
        },
      ],
      showMore: (peersData?.totalElements || 0) > PAGE_SIZE,
      onPress: () => handleNavigation('PeerListScreen', {type: 'peers'}),
      emptyText: '동료가 없습니다.',
    },
    {
      title: '내가 요청한 동료',
      data: requestingPeersData?.content || [
        {
          id: 1,
          nickname: 'test',
          character: require('../../assets/character/pico_base.png'),
        },
        {
          id: 2,
          nickname: 'second',
          character: require('../../assets/character/pico_base.png'),
        },
        {
          id: 3,
          nickname: 'third',
          character: require('../../assets/character/pico_base.png'),
        },
      ],
      showMore: (requestingPeersData?.totalElements || 0) > PAGE_SIZE,
      onPress: () => handleNavigation('PeerListScreen', {type: 'requesting'}),
      emptyText: '요청한 동료가 없습니다.',
    },
  ];

  const renderSectionHeader = ({section}: {section: any}) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.showMore && (
        <TouchableOpacity onPress={section.onPress}>
          <Text style={styles.showMoreText}>더보기</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({item, section}: {item: any; section: any}) => {
    if (section.data.length === 0) {
      return <Text style={styles.emptyText}>{section.emptyText}</Text>;
    }
    return <PeerItem item={item} />;
  };

  return (
    <SafeAreaView style={{flex: 1, paddingHorizontal: 16, paddingVertical: 32}}>
      {/* <DrawerContentScrollView {...props}>
        <View style={[styles.profileContainer]}>
          <CharacterAvatar
            avatar={
              user?.character || require('../../assets/character/pico_base.png')
            }
            size={80}
          />
          <Text style={styles.userName}>{user?.nickname}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 동료</Text> */}
      {/* <FlatList
            data={peersData?.pages.flatMap(page => page.content) || []}
            keyExtractor={item => item.id}
            renderItem={({item}: {item: any}) => (
              <View style={styles.peerItem}>
                <CharacterAvatar
                  avatar={
                    item?.character ||
                    require('../../assets/character/pico_base.png')
                  }
                  size={40}
                />
                <Text style={styles.peerName}>{item.nickname}</Text>
              </View>
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMorePeers}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              !hasNextPage ? <View style={{height: 80}} /> : null
            }
            ListEmptyComponent={
              <Text style={{textAlign: 'center'}}>동료가 없습니다.</Text>
            }
          /> */}
      {/* </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>요청한 동료</Text>
          <FlatList
            data={requestedPeersData?.pages.flatMap(page => page.content) || []}
            keyExtractor={item => item.id}
            renderItem={({item}: {item: any}) => (
              <View key={item.id} style={styles.peerItem}>
                <CharacterAvatar
                  avatar={
                    item?.character ||
                    require('../../assets/character/pico_base.png')
                  }
                />
                <Text>{item.nickname}</Text>
              </View>
            )}
            onEndReached={loadMoreRequestedPeers}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              !requestinghasNextPage ? <View style={{height: 80}} /> : null
            }
            ListEmptyComponent={<Text>요청한 동료가 없습니다.</Text>}
          />
        </View>
      </DrawerContentScrollView> */}
      <View style={styles.profileContainer}>
        <CharacterAvatar
          avatar={
            user?.character || require('../../assets/character/pico_base.png')
          }
          size={80}
        />
        <Text style={styles.userName}>{user?.nickname}</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <DrawerItemList {...props} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  showMoreText: {
    color: '#007AFF',
    fontSize: 13,
  },
  peerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  peerName: {
    marginLeft: 12,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    color: '#999',
    fontSize: 13,
  },
  listContainer: {
    paddingVertical: 24,
  },
});
