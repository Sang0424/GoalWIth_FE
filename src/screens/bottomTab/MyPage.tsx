import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStore } from '../../store/tokenStore';

export default function MyPage() {
  const setAccessToken = tokenStore(state => state.actions.setAccessToken);
  const onClick = async () => {
    await AsyncStorage.removeItem('refresh_token');
    setAccessToken(null);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={{ fontSize: 24 }}>마이페이지</Text>
        {/* <Pressable onPress={onClick}>
          <Text>로그아웃</Text>
        </Pressable> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});
