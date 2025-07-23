import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useState} from 'react';
import UserCard from '../../components/UserCard';
import {useQuery} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {PeersNavParamList} from '../../types/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {NavigationProp} from '../../types/navigation';
import {initialUser} from '../../store/mockData';

export default function Peers() {
  const [search, setSearch] = useState('');
  const users = initialUser;
  const {data, error, isLoading} = useQuery({
    queryKey: ['requestedPeers'],
    queryFn: async () => {
      const response = await instance.get(`/users/requestedPeers`);
      return response.data;
    },
  });

  const requestedPeers = data || [];
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView
      style={{flex: 1, paddingHorizontal: 12, backgroundColor: '#FFFFFF'}}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name="menu" size={24} />
        </Pressable>
        <Text style={{fontSize: 24}}>동료 맺기</Text>
        <View style={{width: 20}} />
      </View>
      <View style={{marginHorizontal: 4}}>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={32}
            color={'#000000'}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="검색어를 입력해주세요"
            style={[styles.searchInput]}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Icon
              style={styles.searchIcon}
              name="cancel"
              size={24}
              color="#a1a1a1"
              onPress={() => setSearch('')}
            />
          )}
        </View>
      </View>
      <ScrollView>
        <Pressable
          style={styles.request}
          onPress={() =>
            navigation.navigate('PeerRequest', {
              peers: requestedPeers,
            })
          }>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 16}}>받은 요청</Text>
            {requestedPeers.length > 0 && (
              <View
                style={{
                  backgroundColor: '#806a5b',
                  width: 24,
                  height: 24,
                  borderRadius: 20,
                  marginLeft: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: '#FFFFFF', fontSize: 12}}>
                  {requestedPeers.length}
                </Text>
              </View>
            )}
          </View>
          <Icon name="chevron-right" size={24} />
        </Pressable>
        <View style={styles.main}>
          <View>
            <Text style={{fontSize: 16}}>비슷한 목표를 가진 사용자</Text>
          </View>
          <View
            style={{
              marginTop: 16,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}>
            {users.map(user => (
              <UserCard key={user.id} user={user} from="peers" />
            ))}
          </View>
        </View>
      </ScrollView>
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
  request: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  main: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 8,
    marginTop: 16,
    height: 48,
  },
  searchIcon: {backgroundColor: 'transparent'},
  searchInput: {flex: 1, paddingLeft: 8},
});
