import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from '../types/users';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWindowDimensions } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '../utils/axiosInterceptor';

export default function UserCard({
  user,
  from,
}: {
  user?: User;
  from: string;
}) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();

  const { mutate: acceptPeer } = useMutation({
    mutationFn: async () => {
      const response = await instance.post(
        `/users/acceptPeerRequest/${user?.id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peers'] });
      queryClient.invalidateQueries({ queryKey: ['requestedPeers'] });
    },
  });

  const { mutate: rejectPeer } = useMutation({
    mutationFn: async () => {
      const response = await instance.post(
        `/users/rejectPeerRequest/${user?.id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peers'] });
      queryClient.invalidateQueries({ queryKey: ['requestedPeers'] });
    },
  });
  return (
    <View style={[styles.cardContainer, { width: (width - 48 - 8) / 2 }]}>
      <View style={styles.cardTop}></View>
      <View style={styles.cardMain}>
        <View>
          <Text style={{ fontSize: 16, textAlign: 'center' }}>
            {user?.nick || 'UserNickname'}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {user?.goal || 'UserGoal'}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 12 }}>{user?.role || 'UserRole'}</Text>
        </View>
        {from == 'peers' ? (
          <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="add" size={24} color="#806a5b" />
            <Text
              style={{ color: '#806a5b', fontSize: 16, fontWeight: 'bold' }}
            >
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
            }}
          >
            {/* <Text
              style={{ color: '#EF4444', fontSize: 16, fontWeight: 'bold' }}
            >
              거절하기
            </Text> */}
            <Icon
              name="close"
              size={32}
              color="#EF4444"
              onPress={() => rejectPeer()}
            />
            <Icon
              name="check"
              size={32}
              color="#3B82F6"
              onPress={() => acceptPeer()}
            />
            {/* <Text
              style={{ color: '#3B82F6', fontSize: 16, fontWeight: 'bold' }}
            >
              수락하기
            </Text> */}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 220,
    borderRadius: 10,
    borderColor: '#000000',
    borderWidth: 1,
  },
  cardTop: {
    flex: 0.3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#B9B69B',
  },
  cardMain: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 12,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
});
