import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  SafeAreaView,
  ListRenderItem 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppNavigatorParamList } from '../navigation/types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAppContext } from '../contexts/AppContext';
import { Team } from '../types/team.types';

// Extend the AppNavigatorParamList to include TeamFeed and TeamCreate
type ExtendedAppNavigatorParamList = AppNavigatorParamList & {
  TeamFeed: { teamId: string };
  TeamCreate: undefined;
};

// Define the navigation prop type
type TeamScreenNavigationProp = NativeStackNavigationProp<ExtendedAppNavigatorParamList>;

// Moved to types/team.types.d.ts
/*
interface Team {
  id: string;
  name: string;
  members: string[];
  leaderId: string;
  feed: Array<{
    id: string;
    content: string;
    image?: string;
    createdAt: string;
    userId: string;
  }>;
}
*/

// Define the root stack param list
interface RootStackParamList {
  TeamScreen: undefined;
  TeamFeed: { teamId: string };
  TeamCreate: undefined;
  [key: string]: undefined | object;
}

const TeamScreen = () => {
  const navigation = useNavigation<TeamScreenNavigationProp>();
  const { teams, user } = useAppContext();
  
  // Handle team press to navigate to TeamFeed
  const handleTeamPress = (teamId: string) => {
    navigation.navigate('TeamFeed', { teamId });
  };
  
  // Handle create team button press
  const handleCreateTeam = () => {
    navigation.navigate('TeamCreate');
  };
  
  const myTeams = teams.filter(team => team.members.includes(user.id));
  const otherTeams = teams.filter(team => !team.members.includes(user.id));

  const renderTeamItem: ListRenderItem<Team> = ({ item }) => (
    <TouchableOpacity 
      style={styles.teamCard}
      onPress={() => handleTeamPress(item.id)}
    >
      <View style={styles.teamHeader}>
        <View style={styles.teamAvatar}>
          <Text style={styles.teamAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <Text style={styles.teamMembers}>
            {item.members.length}명의 팀원 • {item.leaderId === user.id ? '리더' : '멤버'}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#999" />
      </View>
      {item.feed && item.feed.length > 0 && item.feed[0] && (
        <View style={styles.recentActivity}>
          <Text style={styles.recentActivityTitle}>최근 활동</Text>
          <View style={styles.recentPost}>
            <Text 
              style={styles.recentPostText} 
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.feed[0].content || '내용 없음'}
            </Text>
            {item.feed[0].image && (
              <Image 
                source={{ uri: item.feed[0].image }} 
                style={styles.recentPostImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={myTeams}
          renderItem={renderTeamItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.teamList}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>내 팀</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateTeam}
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text style={styles.createButtonText}>팀 생성</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="people-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>가입한 팀이 없습니다.</Text>
              <Text style={styles.emptyStateSubtext}>새로운 팀을 생성하거나 초대를 받아보세요!</Text>
            </View>
          }
        />
        
        {otherTeams.length > 0 && (
          <View style={styles.otherTeamsSection}>
            <Text style={styles.sectionTitle}>추천 팀</Text>
            <FlatList
              data={otherTeams}
              renderItem={renderTeamItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.otherTeamsList}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  teamMembers: {
    fontSize: 12,
    color: '#888',
  },
  recentActivity: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  recentActivityTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  recentPost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentPostText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    marginRight: 10,
  },
  recentPostImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
