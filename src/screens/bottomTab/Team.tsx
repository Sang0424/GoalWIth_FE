import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ListRenderItem,
  Alert,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTeamStore, useQuestStore} from '../../store/mockData';
import {Team} from '../../types/team.types';
import {Quest} from '@/types/quest.types';
import {TeamNavParamList} from '@/types/navigation';
import instance from '../../utils/axiosInterceptor';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {API_URL} from '@env';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useRef, useState} from 'react';
import {useDebounce} from '../../utils/hooks/useDebounce';

const PAGE_SIZE = 10;

const TeamScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TeamNavParamList>>();
  const [showHint, setShowHint] = useState(true);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery.toLowerCase(), 1000);
  const swipeableRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const isMockData = API_URL == '';
  const mockTeams = useTeamStore(state => state.teams);

  const {mutate} = useMutation({
    mutationFn: async (teamId: number) => {
      if (API_URL === '') {
        useTeamStore.getState().deleteTeam(teamId);
        return;
      }
      await instance.delete(`/team/${teamId}`);
    },
    onSuccess: () => {
      Alert.alert('팀 삭제!', '팀을 삭제했습니다!');
      queryClient.invalidateQueries({queryKey: ['team']});
    },
    onError: error => {
      Alert.alert('오류', '팀 삭제 중 오류가 발생했습니다.');
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['team']});
    },
  });

  const {data, refetch} = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const response = await instance.get(`/team`);
      const teams = response.data;
      return teams;
    },
    enabled: !isMockData,
  });

  const {
    data: searchData,
    isLoading: searchLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch: searchRefetch,
  } = useInfiniteQuery({
    queryKey: ['searchTeam', debouncedSearchQuery],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get(
        `/search/team?search=${debouncedSearchQuery}&page=${pageParam}&size=${PAGE_SIZE}`,
      );
      queryClient.invalidateQueries({
        queryKey: ['searchTeam', debouncedSearchQuery],
      });
      return response.data;
    },
    getNextPageParam: lastPage => {
      if (lastPage.number < lastPage.totalPages) {
        return lastPage.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: API_URL !== '' && debouncedSearchQuery !== '',
  });

  const {
    data: recommendedTeam,
    isLoading: recommendedTeamLoading,
    hasNextPage: recommendedHasNextPage,
    fetchNextPage: recommendedFetchNextPage,
    isFetchingNextPage: recommendedIsFetchingNextPage,
    refetch: recommendedTeamRefetch,
  } = useInfiniteQuery({
    queryKey: ['recommendedTeam'],
    queryFn: async ({pageParam = 0}) => {
      const response = await instance.get(`/team/recommended`);
      queryClient.invalidateQueries({
        queryKey: ['recommendedTeam'],
      });
      return response.data;
    },
    getNextPageParam: lastPage => {
      if (lastPage.number < lastPage.totalPages) {
        return lastPage.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: API_URL !== '',
  });

  let teams =
    debouncedSearchQuery !== ''
      ? searchData?.pages.flatMap(page => page.content) || []
      : data?.teams || [];

  let recommendedTeams =
    recommendedTeam?.pages.flatMap(page => page.content) || [];

  if (isMockData) {
    teams = mockTeams;
  }

  const handleDeleteTeam = (teamId: number) => {
    Alert.alert('팀 삭제!', '팀을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: () => {
          mutate(teamId);
        },
      },
    ]);
  };
  const handleEditTeam = (team: Team) => {
    navigation.navigate('TeamCreate', {teamToEdit: team});
  };

  // Handle team press to navigate to TeamFeed
  const handleTeamPress = (
    teamId: number,
    teamName: string,
    teamQuest: string,
  ) => {
    navigation.navigate('TeamFeedScreen', {teamId, teamName, teamQuest});
  };

  // Handle create team button press
  const handleCreateTeam = () => {
    navigation.navigate('TeamCreate', {teamToEdit: null});
  };

  const renderTeamItem: ListRenderItem<Team> = ({item}) => {
    // Format member count and role
    const memberCount = item.members.length;
    const isLeader = item.leaderId === '1';
    const hasRecentActivity =
      item.teamQuest?.records &&
      item.teamQuest?.records.length > 0 &&
      item.teamQuest?.records[item.teamQuest.records.length - 1];

    const renderRightActions = (progress: any, _dragX: any) => {
      const animatedStyles = useAnimatedStyle(() => {
        return {
          transform: [{translateX: progress.value}],
        };
      });
      return (
        <View style={styles.rightActionsContainer}>
          <Reanimated.View style={[styles.actionButtonInner, animatedStyles]}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                swipeableRef.current?.close();
                handleEditTeam(item);
              }}>
              <Text style={styles.actionText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                swipeableRef.current?.close();
                handleDeleteTeam(item.id);
              }}>
              <Text style={styles.actionText}>삭제</Text>
            </TouchableOpacity>
          </Reanimated.View>
        </View>
      );
    };
    // Calculate progress (example: based on team activity or completion)
    const progress = Math.min((memberCount / 10) * 100, 100); // Example progress calculation

    return (
      <ReanimatedSwipeable
        ref={swipeableRef}
        containerStyle={styles.swipeableContainer}
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => setShowHint(false)}>
        <TouchableOpacity
          style={[styles.questCard, isLeader && styles.mainQuestCard]}
          onPress={() =>
            handleTeamPress(item.id, item.name, item.teamQuest?.title)
          }>
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
              {item.teamQuest?.title
                ? item.teamQuest.title
                : '퀘스트를 만들어보세요'}
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
            {showHint && (
              <Text style={styles.hintText}>
                {'<<< '}스와이프하여 수정/삭제
              </Text>
            )}
          </View>

          {/* Recent Activity */}
          {hasRecentActivity && (
            <View style={styles.recentActivity}>
              <Text style={styles.recentActivityTitle}>최근 활동</Text>
              <View style={styles.recentPost}>
                <Text style={styles.recentPostText} numberOfLines={2}>
                  {item.teamQuest?.records[item.teamQuest.records.length - 1]
                    .text.length > 20
                    ? item.teamQuest?.records[
                        item.teamQuest.records.length - 1
                      ].text.slice(0, 20) + '...'
                    : item.teamQuest?.records[item.teamQuest.records.length - 1]
                        .text || '내용 없음'}
                </Text>
                {item.teamQuest?.records[item.teamQuest.records.length - 1]
                  .images?.[0] && (
                  <Image
                    source={{
                      uri: item.teamQuest?.records[
                        item.teamQuest.records.length - 1
                      ].images?.[0],
                    }}
                    style={styles.recentPostImage}
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  const renderRecommendTeamItem: ListRenderItem<Team> = ({item}) => {
    // Format member count and role
    const memberCount = item.members.length;
    const isLeader = item.leaderId === '1';
    const hasRecentActivity =
      item.teamQuest?.records &&
      item.teamQuest?.records.length > 0 &&
      item.teamQuest?.records[0];

    // Calculate progress (example: based on team activity or completion)
    const progress = Math.min((memberCount / 10) * 100, 100); // Example progress calculation

    return (
      <TouchableOpacity
        style={[styles.questCard, isLeader && styles.mainQuestCard]}
        onPress={() =>
          handleTeamPress(item.id, item.name, item.teamQuest?.title)
        }>
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
            {item.teamQuest?.title ? item.teamQuest.title : '퀘스트 없음'}
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
                {item.teamQuest?.records[0].text.length > 20
                  ? item.teamQuest?.records[0].text.slice(0, 20) + '...'
                  : item.teamQuest?.records[0].text || '내용 없음'}
              </Text>
              {item.teamQuest?.records[0].images?.[0] && (
                <Image
                  source={{uri: item.teamQuest?.records[0].images[0]}}
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

  const onRefresh = async () => {
    if (isMockData) {
      teams = mockTeams;
      return;
    }
    setIsRefreshing(true);
    debouncedSearchQuery !== '' ? await searchRefetch() : await refetch();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.teamList}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View style={[{backgroundColor: '#FFFFFF'}]}>
              <View style={styles.header}>
                <Text style={styles.title}>내 팀</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => setShowSearch(!showSearch)}>
                    <Icon name="search" size={32} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateTeam}>
                    <Icon name="add" size={24} color="white" />
                    <Text style={styles.createButtonText}>팀 생성</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {showSearch ? (
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
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <Icon
                      style={styles.searchIcon}
                      name="cancel"
                      size={24}
                      color="#a1a1a1"
                      onPress={() => setSearchQuery('')}
                    />
                  )}
                </View>
              ) : null}
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
            recommendedTeams && recommendedTeams?.length > 0 ? (
              <View style={styles.otherTeamsSection}>
                <Text style={styles.sectionTitle}>추천 팀</Text>
                <FlatList
                  data={recommendedTeams}
                  renderItem={renderRecommendTeamItem}
                  keyExtractor={item => item.id.toString()}
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
  swipeableContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
    overflow: 'hidden',
  },
  rightActionsContainer: {
    flexDirection: 'row',
    width: 180,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 6,
  },
  actionButton: {
    width: 80,
    height: '88%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, // rounded corners
    marginHorizontal: 4, // spacing between buttons
    shadowColor: '#000', // subtle shadow/elevation
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  editButton: {
    backgroundColor: '#4e9af1',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  swipeHint: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{translateY: -8}],
    color: '#aaa',
    fontSize: 12,
    zIndex: 1,
  },
  hintText: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{translateY: -8}],
    color: '#aaa',
    fontSize: 12,
    zIndex: 1,
  },
  hintTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    textAlign: 'center',
    gap: 4,
  },
  actionButtonInner: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 8,
    height: 48,
    marginRight: 12,
  },
});

export default TeamScreen;
