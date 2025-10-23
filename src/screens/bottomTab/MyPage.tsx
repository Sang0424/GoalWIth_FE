import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CharacterAvatar from '../../components/CharacterAvatar';
import Logo from '../../components/Logo';
import {MyPageNavParamList} from '../../types/navigation';
import {useState} from 'react';
import {API_URL} from '@env';
import instance from '../../utils/axiosInterceptor';
import {userStore} from '../../store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {tokenStore} from '../../store/tokenStore';
import {User} from '../../types/user.types';
import {Team} from '../../types/team.types';
import {useQuery} from '@tanstack/react-query';
import {Dropdown} from 'react-native-element-dropdown';
import {colors} from '../../styles/theme';

export default function MyPage() {
  const [error, setError] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<MyPageNavParamList>>();
  const setAccessToken = tokenStore(state => state.actions.setAccessToken);
  const user = userStore(state => state.user);
  const logout = async () => {
    try {
      await AsyncStorage.clear();
      setAccessToken(null);
    } catch (e) {
      console.log(e);
    }
  };
  const {data: badges} = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      try {
        const response = await instance.get('/user/badges');
        return response.data;
      } catch (e: any) {
        setError(e.response.data.message);
        return [];
      }
    },
    enabled: API_URL != '',
  });
  const {
    data: myVerification,
    isLoading: myVerificationLoading,
    refetch: myVerificationRefetch,
  } = useQuery({
    queryKey: ['myVerification'],
    queryFn: async () => {
      try {
        const response = await instance.get(`/quest/myVerification`);
        return response.data;
      } catch (e: any) {
        setError(e.response.data.message);
        return [];
      }
    },
    enabled: API_URL != '',
  });

  const {
    data: myReaction,
    isLoading: myReactionLoading,
    refetch: myReactionRefetch,
  } = useQuery({
    queryKey: ['myReaction'],
    queryFn: async () => {
      try {
        const response = await instance.get(`/quest/myReaction`);
        return response.data;
      } catch (e: any) {
        setError(e.response.data.message);
        return [];
      }
    },
    enabled: API_URL != '',
  });

  const myVerificationCount = myVerification?.totalElements;
  const myReactionCount = myReaction?.totalElements;

  // const {
  //   data: quests,
  //   error,
  //   isLoading,
  //   refetch,
  // } = useQuery({
  //   queryKey: ['quest'],
  //   queryFn: async () => {
  //     const response = await instance.get(`/quest`);
  //     const quests = response.data;
  //     return quests;
  //   },
  //   enabled: true,
  // });
  // const {data: team, error: teamError, isLoading: teamLoading} = useQuery({
  //   queryKey: ['team'],
  //   queryFn: async () => {
  //     const response = await instance.get(`/team`);
  //     const team = response.data;
  //     return team;
  //   },
  //   enabled: true,
  // });
  // Navigation types
  // Type-safe filtering
  // const completedQuests = quests?.quests.filter(
  //   (quest: Quest) => quest.procedure === 'complete',
  // ).length;
  // const inProgressQuests = quests?.quests.filter(
  //   (quest: Quest) => quest.procedure === 'progress',
  // ).length;

  // Calculate level progress with safe defaults
  const currentExp = user.exp || 0;
  const maxExp = user.maxExp || 100;
  const levelProgress = (currentExp / maxExp) * 100;
  const nextLevel = (user.level || 1) + 1;

  // Get border color based on user level
  const getBorderColor = () => {
    const level = user.level || 1;
    if (level >= 10) return '#FFD700'; // Gold
    if (level >= 5) return '#C0C0C0'; // Silver
    return '#CD7F32'; // Bronze
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={{marginLeft: 16}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Logo
              resizeMode="contain"
              imageStyle={{
                width: 56,
                height: 56,
                marginBottom: 8,
                marginRight: 16,
              }}
            />
            <Text style={{fontSize: 24, fontWeight: 'bold', color: '#806A5B'}}>
              GoalWith
            </Text>
          </View>
        </View>
        <View style={styles.header}>
          <CharacterAvatar
            size={100}
            level={user.level || 1}
            avatar={
              user.character || require('../../assets/character/pico_base.png')
            }
          />
          <Text style={styles.userName}>{user.nickname || user.name}</Text>
          {/* <Text style={styles.userTitle}>{user.level}</Text> */}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myVerificationCount}</Text>
              <Text style={styles.statLabel}>내가 인증한 퀘스트</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myReactionCount}</Text>
              <Text style={styles.statLabel}>내가 리액션한 퀘스트</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{0}</Text>
              <Text style={styles.statLabel}>저장한 퀘스트</Text>
            </View>
          </View>
        </View>
        {/* Level Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>레벨 {user.level || 1}</Text>
            <Text style={styles.levelText}>
              Lv. {nextLevel}까지 {maxExp - currentExp}점 남음
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, {width: `${levelProgress}%`}]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentExp} / {maxExp}
            </Text>
          </View>
        </View>
        {/* Badges */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>획득한 칭호</Text>
            <Dropdown
              data={badges}
              placeholder="Select a badge"
              onChange={item => console.log(item)}
              labelField="name"
              valueField="id"
            />
          </View>
          {/* <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <View style={styles.badgeIcon}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
              </View>
              <Text style={styles.badgeName}>첫 퀘스트 완료</Text>
            </View>
            {user.level >= 5 && (
              <View style={styles.badge}>
                <View style={styles.badgeIcon}>
                  <Ionicons name="star" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.badgeName}>중급 도전자</Text>
              </View>
            )}
            {user.level >= 10 && (
              <View style={styles.badge}>
                <View style={styles.badgeIcon}>
                  <Ionicons name="diamond" size={24} color="#2196F3" />
                </View>
                <Text style={styles.badgeName}>마스터 도전자</Text>
              </View>
            )}
          </View> */}
        </View>
        {/* Settings */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={22} color="#666" />
              <Text style={styles.settingText}>프로필 수정</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <View style={styles.divider} />
          {/* <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('HelpPage')}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color="#666" />
              <Text style={styles.settingText}>알림 설정</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity> */}
          {/* <View style={styles.divider} /> */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Coming Soon! 조금만 기다려주세요!')}>
            <View style={styles.settingLeft}>
              <Ionicons name="cart-outline" size={22} color="#666" />
              <Text style={styles.settingText}>상점</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('HelpPage')}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={22} color="#666" />
              <Text style={styles.settingText}>도움말</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('AppInfoPage')}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#666"
              />
              <Text style={styles.settingText}>앱 정보</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>버전 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: colors.font,
  },
  // userTitle: {
  //   fontSize: 14,
  //   color: colors.primary,
  //   backgroundColor: '#f0e6dd',
  //   paddingHorizontal: 12,
  //   paddingVertical: 4,
  //   borderRadius: 12,
  //   overflow: 'hidden',
  //   marginBottom: 20,
  // },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.font,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.font,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray,
    marginHorizontal: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.font,
  },
  levelText: {
    fontSize: 12,
    color: colors.font,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.font,
    minWidth: 70,
    textAlign: 'right',
  },
  seeAllText: {
    fontSize: 12,
    color: colors.font,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  badge: {
    width: '33.33%',
    padding: 5,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    color: colors.font,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    color: colors.font,
    marginLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray,
    marginLeft: 40,
  },
  logoutButton: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: 'regular',
  },
  versionText: {
    textAlign: 'center',
    color: colors.font,
    fontSize: 12,
    marginBottom: 20,
  },
});
