import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useState } from 'react';
import UserCard from '../../components/UserCard';
import { useQuery } from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PeersNavParamList } from '../../types/navigation';
import BackArrow from '../../components/BackArrow';

type Props = NativeStackScreenProps<PeersNavParamList, 'PeerRequest'>;

export default function PeerRequest({ route }: Props) {
  const { peers } = route.params;
  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 12 }}>
      <View style={styles.header}>
        <BackArrow />
        <Text style={{ fontSize: 24 }}>받은 동료 요청</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.main}>
        {peers.map(peer => (
          <UserCard key={peer.id} user={peer} from="peerRequest" />
        ))}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  main: {
    flex: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
  },
});
