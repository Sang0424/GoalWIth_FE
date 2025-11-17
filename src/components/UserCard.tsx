import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Touchable,
} from 'react-native';
import type {User} from '../types/user.types';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useWindowDimensions} from 'react-native';
import {
  useMutation,
  useQueryClient,
  useQuery,
  useInfiniteQuery,
} from '@tanstack/react-query';
import instance from '../utils/axiosInterceptor';
import CharacterAvatar from './CharacterAvatar';
import ProfileBottomSheet from './ProfileBottomSheet';
import {useState, useMemo} from 'react';
import {colors} from '../styles/theme';
import {useCancelRequestPeer} from '../utils/mutations';

export default function UserCard({user, from}: {user?: any; from: string}) {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const queryClient = useQueryClient();
  const [isProfileVisible, setProfileVisible] = useState(false);
  const [selecteUser, setSelectUser] = useState<number | undefined>(undefined);

  const cancelRequestPeer = useCancelRequestPeer();

  const {mutate: requestPeer} = useMutation({
    mutationFn: async (user: any) => {
      const response = await instance.post(`/peer/${user?.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['peers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeers']});
      queryClient.invalidateQueries({queryKey: ['requestingPeers']});
      queryClient.invalidateQueries({queryKey: ['recommendPeers']});
      queryClient.invalidateQueries({queryKey: ['myPeers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeersCount']});
      requestingRefetch();
    },
    onError: (error: any) => {
      Alert.alert(`${error.response.data.message}`);
    },
  });

  const {mutate: acceptPeer} = useMutation({
    mutationFn: async (user: any) => {
      const response = await instance.post(`/peer/accept/${user?.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['peers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeers']});
      queryClient.invalidateQueries({queryKey: ['requestingPeers']});
      queryClient.invalidateQueries({queryKey: ['recommendPeers']});
      queryClient.invalidateQueries({queryKey: ['myPeers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeersCount']});
      requestingRefetch();
    },
    onError: (error: any) => {
      Alert.alert(`${error.response.data.message}`);
    },
  });

  const {mutate: rejectPeer} = useMutation({
    mutationFn: async (user: any) => {
      const response = await instance.post(`/peer/reject/${user?.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['peers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeers']});
      queryClient.invalidateQueries({queryKey: ['requestingPeers']});
      queryClient.invalidateQueries({queryKey: ['recommendPeers']});
      queryClient.invalidateQueries({queryKey: ['myPeers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeersCount']});
      requestingRefetch();
    },
    onError: (error: any) => {
      Alert.alert(`${error.response.data.message}`);
    },
  });

  const {
    data: requestingPeersData,
    isLoading: requestingLoading,
    refetch: requestingRefetch,
  } = useInfiniteQuery({
    queryKey: ['isAlreadyRequest'],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get(
        `/peer/requesting?page=${pageParam}&size=10`,
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
  });

  const isAlreadyRequest = useMemo(() => {
    return requestingPeersData?.pages
      .flatMap(page => page.content)
      .some(peer => peer.id === user?.id);
  }, [requestingPeersData, user?.id]);

  return (
    <View>
      <View style={[styles.cardContainer, {width: (width - 48 - 8) / 2}]}>
        <View style={styles.cardTop}></View>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => {
            setSelectUser(user?.id);
            setProfileVisible(true);
          }}>
          <CharacterAvatar
            size={80}
            level={user?.level || 1}
            avatar={
              user?.character || require('../assets/character/pico_base.png')
            }
          />
        </TouchableOpacity>
        <View style={styles.cardMain}>
          <View>
            <Text
              style={{
                fontSize: 12,
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: 12,
              }}>
              Lv. {user?.level}
            </Text>
            <Text style={{fontSize: 16, textAlign: 'center'}}>
              {user?.nickname || 'UserNickname'}
            </Text>
          </View>
          <View>
            <Text style={{fontSize: 12, textAlign: 'center'}}>
              {user?.userType || 'UserType'}
            </Text>
          </View>
          {from == 'peers' ? (
            <TouchableOpacity
              style={{flexDirection: 'row', alignItems: 'center'}}
              onPress={() => {
                isAlreadyRequest ? cancelRequestPeer(user) : requestPeer(user);
              }}>
              {isAlreadyRequest ? (
                <Icon name="cancel" size={24} color={colors.primary} />
              ) : (
                <Icon name="add" size={24} color={colors.primary} />
              )}
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                {isAlreadyRequest ? '요청취소' : '피어링'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                width: '100%',
              }}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() =>
                  Alert.alert('거절하시겠습니까?', '거절하시겠습니까?', [
                    {text: '취소', style: 'cancel'},
                    {
                      text: '거절',
                      onPress: () => {
                        rejectPeer(user);
                      },
                    },
                  ])
                }>
                <Icon name="close" size={24} color={colors.error} />
                <Text
                  style={{
                    color: colors.error,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                  거절하기
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() =>
                  Alert.alert('수락하시겠습니까?', '수락하시겠습니까?', [
                    {text: '취소', style: 'cancel'},
                    {
                      text: '수락',
                      onPress: () => {
                        acceptPeer(user);
                      },
                    },
                  ])
                }>
                <Icon name="check" size={24} color={colors.accent} />
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                  수락하기
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <ProfileBottomSheet
        visible={isProfileVisible}
        onClose={() => setProfileVisible(false)}
        userId={selecteUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 250,
    borderRadius: 10,
    borderColor: colors.gray,
    borderWidth: 1,
  },
  cardTop: {
    flex: 0.3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: colors.primary,
  },
  avatarContainer: {
    position: 'absolute',
    top: 12, // Half of cardTop height (60/2 = 30) to center the avatar
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  cardMain: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 16,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
});
