import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
import type {User} from '../types/user.types';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useWindowDimensions} from 'react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import instance from '../utils/axiosInterceptor';
import CharacterAvatar from './CharacterAvatar';
import ProfileBottomSheet from './ProfileBottomSheet';
import {useState} from 'react';
import {colors} from '../styles/theme';

export default function UserCard({user, from}: {user?: any; from: string}) {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const queryClient = useQueryClient();
  const [isProfileVisible, setProfileVisible] = useState(false);
  const [selecteUser, setSelectUser] = useState<number | undefined>(undefined);

  const {mutate: acceptPeer} = useMutation({
    mutationFn: async () => {
      const response = await instance.post(`/peer/accept/${user?.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['peers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeers']});
    },
    onError: (error: any) => {
      Alert.alert(`오류`, `${error.response.data.message}`);
    },
  });

  const {mutate: rejectPeer} = useMutation({
    mutationFn: async () => {
      const response = await instance.post(`/peer/reject/${user?.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['peers']});
      queryClient.invalidateQueries({queryKey: ['requestedPeers']});
    },
    onError: (error: any) => {
      Alert.alert(`오류`, `${error.response.data.message}`);
    },
  });

  return (
    <TouchableOpacity
      onPress={() => {
        setSelectUser(user?.id);
        setProfileVisible(true);
      }}>
      <View style={[styles.cardContainer, {width: (width - 48 - 8) / 2}]}>
        <View style={styles.cardTop}></View>
        <View style={styles.avatarContainer}>
          <CharacterAvatar
            size={80}
            level={user?.level || 1}
            avatar={
              user?.character || require('../assets/character/pico_base.png')
            }
          />
        </View>
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
            <Pressable style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="add" size={24} color={colors.primary} />
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                피어링
              </Text>
            </Pressable>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                width: '100%',
              }}>
              <Pressable
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() =>
                  Alert.alert('거절하시겠습니까?', '거절하시겠습니까?', [
                    {text: '취소', style: 'cancel'},
                    {
                      text: '거절',
                      onPress: () => {
                        rejectPeer();
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
              </Pressable>
              <Pressable
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() =>
                  Alert.alert('수락하시겠습니까?', '수락하시겠습니까?', [
                    {text: '취소', style: 'cancel'},
                    {
                      text: '수락',
                      onPress: () => {
                        acceptPeer();
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
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <ProfileBottomSheet
        visible={isProfileVisible}
        onClose={() => setProfileVisible(false)}
        userId={selecteUser}
      />
    </TouchableOpacity>
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
