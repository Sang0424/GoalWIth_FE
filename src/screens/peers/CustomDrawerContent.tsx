import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  Alert,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {userStore} from '../../store/userStore';
import {SafeAreaView} from 'react-native-safe-area-context';
import CharacterAvatar from '../../components/CharacterAvatar';
import {API_URL} from '@env';
import {useState} from 'react';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {PeersDrawerParamList, PeersNavParamList} from '../../types/navigation';
import {colors} from '../../styles/theme';
import ProfileBottomSheet from '../../components/ProfileBottomSheet';
import {useCancelRequestPeer} from '../../utils/mutations';

export default function CustomDrawerContent(props: any) {
  const user = userStore(state => state.user);
  const navigation =
    useNavigation<DrawerNavigationProp<PeersDrawerParamList>>();

  const cancelRequestPeer = useCancelRequestPeer();

  const [isProfileVisible, setProfileVisible] = useState(false);
  const [selecteUser, setSelectUser] = useState<number | undefined>(undefined);

  const {data: peersData, isLoading: peersLoading} = useQuery({
    queryKey: ['myPeers'],
    queryFn: async () => {
      const response = await instance.get('/peer?page=0&size=5');
      return response.data;
    },
    enabled: API_URL !== '',
  });

  const {data: requestingPeersData, isLoading: requestingLoading} = useQuery({
    queryKey: ['requestingPeers'],
    queryFn: async () => {
      const response = await instance.get('/peer/requesting?page=0&size=5');
      return response.data;
    },
    enabled: API_URL !== '',
  });

  if (peersLoading || requestingLoading) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const handleNavigation = (screen: keyof PeersNavParamList, params?: any) => {
    // Close drawer first
    props.navigation.closeDrawer();

    // Then navigate using the parent navigator
    props.navigation.navigate('PeersNav', {
      screen,
      params,
    });
  };

  const sections = [
    {
      title: '내 동료',
      data: peersData?.content || [],
      showMore: (peersData?.totalElements || 0) > 0,
      onPress: () => handleNavigation('PeerListScreen', {type: 'peers'}),
      emptyText: '동료가 없습니다.',
    },
    {
      title: '내가 요청한 동료',
      data: requestingPeersData?.content || [],
      showMore: (requestingPeersData?.totalElements || 0) > 0,
      onPress: () => handleNavigation('PeerListScreen', {type: 'requesting'}),
      emptyText: '요청한 동료가 없습니다.',
    },
  ];

  const PeerItem = ({item}: {item: any}) => {
    return (
      <View style={styles.peerItem}>
        <CharacterAvatar
          avatar={
            item?.character || require('../../assets/character/pico_base.png')
          }
          size={40}
        />
        <Text style={styles.peerName}>{item.nickname}</Text>
        {requestingPeersData?.content.some(
          (peer: any) => peer.id === item.id,
        ) && (
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
    );
  };

  const renderSectionHeader = ({section}: {section: any}) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.showMore && (
        <TouchableOpacity onPress={section.onPress}>
          <Text style={styles.showMoreText}>전체보기</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({item, section}: {item: any; section: any}) => {
    if (section.data.length === 0) {
      return <Text style={styles.emptyText}>{section.emptyText}</Text>;
    }
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectUser(item.id);
          setProfileVisible(true);
        }}>
        <PeerItem key={item.id} item={item} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, paddingHorizontal: 16, paddingVertical: 32}}>
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
      <ProfileBottomSheet
        visible={isProfileVisible}
        onClose={() => setProfileVisible(false)}
        userId={selecteUser}
      />
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
    marginLeft: 16,
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
    backgroundColor: colors.switchBG,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  showMoreText: {
    color: colors.accent,
    fontSize: 13,
  },
  peerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginVertical: 8,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
  },
  peerName: {
    marginLeft: 12,
    fontSize: 16,
  },
  cancelButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: 12,
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
