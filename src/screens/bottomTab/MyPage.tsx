import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CharacterAvatar from '../../components/CharacterAvatar';
import Logo from '../../components/Logo';
import {MyPageNavParamList} from '../../types/navigation';
import {useState, useCallback, useMemo} from 'react';
import Config from 'react-native-config';
import instance from '../../utils/axiosInterceptor';
import {userStore} from '../../store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {tokenStore} from '../../store/tokenStore';
import {User} from '../../types/user.types';
import {Team} from '../../types/team.types';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Dropdown} from 'react-native-element-dropdown';
import {colors} from '../../styles/theme';
import {rewardStore} from '../../store/rewardStore';

export default function MyPage() {
  const [error, setError] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<MyPageNavParamList>>();
  const setAccessToken = tokenStore(state => state.actions.setAccessToken);
  const user = userStore(state => state.user);
  const markBadgeSeen = rewardStore(state => state.markBadgeSeen);
  const hasNewBadge = rewardStore(state => state.hasNewBadge);
  const queryClient = useQueryClient();
  const logout = async () => {
    try {
      Alert.alert('로그아웃', '정말로 로그아웃 하시겠습니까?', [
        {text: '취소', style: 'cancel'},
        {
          text: '로그아웃',
          onPress: async () => {
            await AsyncStorage.clear();
            setAccessToken(null);
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert(e.response.data.message);
    }
  };
  const {data: badges, isLoading: badgesLoading} = useQuery({
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
    enabled: Config.API_URL != '',
  });
  const {
    data: myVerification,
    isLoading: myVerificationLoading,
    refetch: myVerificationRefetch,
  } = useQuery({
    queryKey: ['myVerificationCount'],
    queryFn: async () => {
      try {
        const response = await instance.get(`/quest/myVerification`);
        return response.data;
      } catch (e: any) {
        setError(e.response.data.message);
        return [];
      }
    },
    enabled: Config.API_URL != '',
  });

  const {
    data: myReaction,
    isLoading: myReactionLoading,
    refetch: myReactionRefetch,
  } = useQuery({
    queryKey: ['myReactionCount'],
    queryFn: async () => {
      try {
        const response = await instance.get(`/quest/myReaction`);
        return response.data;
      } catch (e: any) {
        setError(e.response.data.message);
        return [];
      }
    },
    enabled: Config.API_URL != '',
  });

  const {
    data: myBookmark,
    isLoading: myBookmarkLoading,
    refetch: myBookmarkRefetch,
  } = useQuery({
    queryKey: ['myBookmarkCount'],
    queryFn: async () => {
      try {
        const response = await instance.get(`/quest/bookmarked`);
        return response.data;
      } catch (e: any) {
        setError(e.response.data.message);
        return [];
      }
    },
    enabled: Config.API_URL != '',
  });

  const {mutate: changeBadgeMutate} = useMutation({
    mutationFn: async (badgeId: number) => {
      const response = await instance.put(`/user/badge/${badgeId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['user']});
    },
    onError: (error: any) => {
      Alert.alert(error.response.data.message);
    },
  });

  useEffect(() => {
    if (hasNewBadge) {
      markBadgeSeen();
    }
  }, []);

  const renderBadgeItem = useCallback(
    (item: {id: number; name: string}) => {
      const isCurrentBadge = item.name === user.badge;
      return (
        <View
          style={[
            styles.dropdownItem,
            isCurrentBadge && styles.dropdownItemActive,
          ]}>
          <Text
            style={[
              styles.dropdownItemText,
              isCurrentBadge && styles.dropdownItemTextActive,
            ]}>
            {item.name}
          </Text>
          {isCurrentBadge && (
            <Ionicons name="checkmark" size={16} color={colors.secondary} />
          )}
        </View>
      );
    },
    [badges, markBadgeSeen, hasNewBadge],
  );

  const handleBadgeChange = useCallback(
    (item: any) => {
      changeBadgeMutate(item.id);
    },
    [changeBadgeMutate],
  );

  const dropdownData = useMemo(() => {
    return badges || [];
  }, [badges]);

  const myVerificationCount = myVerification?.totalElements;
  const myReactionCount = myReaction?.totalElements;
  const myBookmarkCount = myBookmark?.totalElements;
  const currentExp = user.exp || 0;
  const maxExp = Math.round(200 * Math.pow(user?.level, 1.1));
  const levelProgress = (currentExp / maxExp) * 100;
  const nextLevel = (user.level || 1) + 1;

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
          <Text style={styles.userName}>{user.nickname}</Text>
          {/* <Text style={styles.userTitle}>{user.level}</Text> */}

          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('MyVerification')}>
              <Text style={styles.statValue}>{myVerificationCount}</Text>
              <Text style={styles.statLabel}>인증한 퀘스트</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('MyReaction')}>
              <Text style={styles.statValue}>{myReactionCount}</Text>
              <Text style={styles.statLabel}>리액션한 퀘스트</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('MyBookmark')}>
              <Text style={styles.statValue}>{myBookmarkCount}</Text>
              <Text style={styles.statLabel}>저장한 퀘스트</Text>
            </TouchableOpacity>
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
        <View style={styles.badgesContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>획득한 칭호</Text>
          </View>
          <Dropdown
            data={dropdownData}
            placeholder={user?.badge ? user.badge : '칭호를 선택해주세요'}
            // placeholderStyle={{color: colors.font}}
            onChange={handleBadgeChange}
            labelField="name"
            valueField="id"
            style={styles.dropdown}
            renderItem={renderBadgeItem}
          />
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
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('InquiryPage')}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={22} color="#666" />
              <Text style={styles.settingText}>문의하기</Text>
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
    // flexDirection: 'row',
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
  dropdown: {
    width: '100%',
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.font,
  },
  dropdownItemActive: {
    backgroundColor: colors.secondary,
  },
  dropdownItemTextActive: {
    color: colors.font,
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
