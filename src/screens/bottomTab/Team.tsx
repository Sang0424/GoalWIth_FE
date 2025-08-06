import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ListRenderItem,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTeamStore} from '../../store/mockData';
import {Team} from '../../types/team.types';
import {TeamNavParamList} from '@/types/navigation';
import instance from '../../utils/axiosInterceptor';
import {useQuery} from '@tanstack/react-query';
import {API_URL} from '@env';
import {useState} from 'react';
import {useEffect} from 'react';

const TeamScreen = () => {
  // const [reload, setReload] = useState(false);
  // useEffect(() => {
  //   setReload(false);
  // }, [reload]);
  const navigation =
    useNavigation<NativeStackNavigationProp<TeamNavParamList>>();
  let teams: Team[] | undefined;
  if (API_URL == '') {
    teams = useTeamStore(state => state.teams);
  } else {
    const {data, error, isLoading} = useQuery<Team[]>({
      queryKey: ['Team'],
      queryFn: async () => {
        const response = await instance.get(`/team`);
        const teams = response.data;
        return teams;
      },
      enabled: API_URL != '',
    });
    if (isLoading) {
      return <Text>로딩중</Text>;
    }
    if (error) {
      //setReload(true);
      return <Text>ㅅㅂ 에러네 + {error.message}</Text>;
    }
    teams = data;
  }
  // Handle team press to navigate to TeamFeed
  const handleTeamPress = (teamId: string) => {
    //setReload(true);
    navigation.navigate('TeamFeedScreen', {teamId});
  };

  // Handle create team button press
  const handleCreateTeam = () => {
    navigation.navigate('TeamCreate');
  };

  const renderTeamItem: ListRenderItem<Team> = ({item}) => {
    // Format member count and role
    const memberCount = item.members.length;
    const isLeader = item.leaderId === '1';
    const hasRecentActivity =
      item.quest.records &&
      item.quest.records.length > 0 &&
      item.quest.records[0];

    // Calculate progress (example: based on team activity or completion)
    const progress = Math.min((memberCount / 10) * 100, 100); // Example progress calculation

    return (
      <TouchableOpacity
        style={[styles.questCard, isLeader && styles.mainQuestCard]}
        onPress={() => handleTeamPress(item.id)}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.questTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.statusBadge}>
              {isLeader && <Text style={styles.mainBadge}>LEADER</Text>}
              <Text style={styles.verificationBadge}>
                {memberCount}명의 팀원
              </Text>
            </View>
          </View>
          <Text style={{fontSize: 12, color: '#666'}} numberOfLines={1}>
            {item.quest.title}
          </Text>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {width: `${progress}%`}]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}% 완료
            </Text>
          </View>
        </View>

        {/* Recent Activity */}
        {hasRecentActivity && (
          <View style={styles.recentActivity}>
            <Text style={styles.recentActivityTitle}>최근 활동</Text>
            <View style={styles.recentPost}>
              <Text style={styles.recentPostText} numberOfLines={2}>
                {item.quest.records[0].text.length > 20
                  ? item.quest.records[0].text.slice(0, 20) + '...'
                  : item.quest.records[0].text || '내용 없음'}
              </Text>
              {item.quest.records[0].images?.[0] && (
                <Image
                  source={{uri: item.quest.records[0].images[0]}}
                  style={styles.recentPostImage}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.teamList}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>내 팀</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateTeam}>
                <Icon name="add" size={20} color="white" />
                <Text style={styles.createButtonText}>팀 생성</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>가입한 팀이 없습니다.</Text>
              <Text style={styles.emptyStateSubtext}>
                새로운 팀을 생성하거나 초대를 받아보세요!
              </Text>
            </View>
          }
          ListFooterComponent={
            teams && teams?.length > 0 ? (
              <View style={styles.otherTeamsSection}>
                <Text style={styles.sectionTitle}>추천 팀</Text>
                <FlatList
                  data={teams}
                  renderItem={renderTeamItem}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.otherTeamsList}
                />
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#806a5b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  teamList: {
    padding: 15,
  },
  questCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainQuestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#806a5b',
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainBadge: {
    backgroundColor: '#f0e6dd',
    color: '#806a5b',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    overflow: 'hidden',
  },
  verificationBadge: {
    backgroundColor: '#f0f0f0',
    color: '#666',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    overflow: 'hidden',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  recentActivity: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  recentActivityTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  recentPost: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  recentPostText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
  },
  recentPostImage: {
    width: '100%',
    height: 100,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyStateText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  otherTeamsSection: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  otherTeamsList: {
    paddingBottom: 5,
  },
});

export default TeamScreen;
