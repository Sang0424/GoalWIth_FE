import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import { userStore } from '../../store/userStore';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function CustomDrawerContent({ props }: { props: any }) {
  const user = userStore(state => state.user);

  const { data: peersData } = useQuery({
    queryKey: ['peers'],
    queryFn: async () => {
      const response = await instance.get('/users/peers');
      return response.data;
    },
  });

  const { data: requestedPeersData } = useQuery({
    queryKey: ['requestedPeers'],
    queryFn: async () => {
      const response = await instance.get('/users/requestedPeers');
      return response.data;
    },
  });
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <DrawerContentScrollView {...props}>
        <View style={[styles.profileContainer]}>
          {/* <Image
          source={{ uri: userData?.profileImage }}
          style={styles.profileImage}
        /> */}
          <Text style={styles.userName}>{user?.nick}</Text>
          <Text style={styles.userName}>{user?.goal}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 동료</Text>
          {peersData?.map((peer: any) => (
            <View key={peer.id} style={styles.peerItem}>
              {/* <Image
              source={{ uri: peer.profileImage }}
              style={styles.peerImage}
            /> */}
              <Text>{peer.nick}</Text>
              <Text>{peer.goal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>요청한 동료</Text>
          {requestedPeersData?.map((peer: any) => (
            <View key={peer.id} style={styles.peerItem}>
              {/* <Image
              source={{ uri: peer.profileImage }}
              style={styles.peerImage}
            /> */}
              <Text>{peer.nick}</Text>
              <Text>{peer.goal}</Text>
            </View>
          ))}
        </View>

        <DrawerItem
          label="로그아웃"
          onPress={() => {
            // 로그아웃 로직 구현
          }}
        />
      </DrawerContentScrollView>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  peerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  peerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
});
