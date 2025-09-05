import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CharacterAvatar from '../../components/CharacterAvatar';
import Logo from '../../components/Logo';
import {useTeamStore} from '../../store/mockData';
import {MyPageNavParamList} from '../../types/navigation';
import {useState, useEffect} from 'react';
// Import types
import {Quest} from '../../types/quest.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {tokenStore} from '../../store/tokenStore';
import {useQuestStore} from '../../store/mockData';
import {User} from '../../types/user.types';
import {Team} from '../../types/team.types';

const defaultUser: User = {
  id: '',
  name: 'User',
  email: '',
  nickname: 'User',
  userType: 'student',
  level: 1,
  exp: 0,
  maxExp: 100,
  actionPoints: 0,
  character: require('../../assets/character/pico_base.png'),
  // Note: Removed createdAt and updatedAt as they're not in the User type
};

export default function MyPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MyPageNavParamList>>();
  const setAccessToken = tokenStore(state => state.actions.setAccessToken);
  const defaultTeam: Team[] = useTeamStore(state => state.teams);
  const logout = async () => {
    try {
      await AsyncStorage.clear();
      setAccessToken(null);
    } catch (e) {
      console.log(e);
    }
  };
  // Navigation types
  const {quests} = useQuestStore();
  const user = defaultUser;
  const team = defaultTeam;
  // Type-safe filtering
  const completedQuests = quests.filter(
    (quest: Quest) => quest.procedure === 'complete',
  ).length;
  const inProgressQuests = quests.filter(
    (quest: Quest) => quest.procedure === 'progress',
  ).length;

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

  // Get title based on level
  const getTitle = () => {
    const level = user.level || 1;
    if (level >= 10) return '마스터 도전자';
    if (level >= 5) return '중급 도전자';
    return '초보 도전자';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={{marginLeft: 16}}>
          <Logo
            resizeMode="contain"
            style={{width: 150, height: 45, marginBottom: 16}}
          />
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
          <Text style={styles.userTitle}>{getTitle()}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedQuests}</Text>
              <Text style={styles.statLabel}>완료한 퀘스트</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{inProgressQuests}</Text>
              <Text style={styles.statLabel}>진행 중인 퀘스트</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{team.length}</Text>
              <Text style={styles.statLabel}>참여 중인 팀</Text>
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
            <TouchableOpacity>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgesContainer}>
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
          </View>
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
            onPress={() => navigation.navigate('MarketScreen')}>
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
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'white',
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
    color: '#333',
  },
  userTitle: {
    fontSize: 14,
    color: '#806a5b',
    backgroundColor: '#f0e6dd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
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
    color: '#333',
  },
  levelText: {
    fontSize: 12,
    color: '#806a5b',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#806a5b',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 70,
    textAlign: 'right',
  },
  seeAllText: {
    fontSize: 12,
    color: '#806a5b',
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
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    color: '#555',
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
    color: '#333',
    marginLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 40,
  },
  logoutButton: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    color: '#f44336',
    fontSize: 15,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 20,
  },
});
