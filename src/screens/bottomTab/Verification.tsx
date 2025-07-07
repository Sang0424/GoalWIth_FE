// ================= 새로운 인증 피드 구현 (Mock UI) =================
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import CharacterAvatar from '../../components/CharacterAvatar';
import type {Quest} from '../../types/quest.types';
import type {User} from '../../types/user.types';
import {useQuestStore} from '../../store/mockData';
import {useNavigation} from '@react-navigation/native';
import {VerificationNavParamList} from '../../types/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const VerificationFeedCard = ({item}: {item: {quest: Quest; user: User}}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<VerificationNavParamList>>();

  const handleGoQuest = () => {
    navigation.navigate('QuestVerification', {questId: item.quest.id});
  };
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={handleGoQuest}>
      <View style={styles.cardHeader}>
        <CharacterAvatar size={40} level={item.user.level} />
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={styles.nickname}>
            {item.user.nickname} (Lv.{item.user.level})
          </Text>
          <Text style={styles.badge}>{item.user.badge}</Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.quest.startDate).toLocaleString('ko-KR')}
        </Text>
      </View>
      <View style={styles.questInfo}>
        <Text style={styles.questTitle}>{item.quest.title}</Text>
      </View>
      {item.quest.records && item.quest.records.length > 0 && (
        <View style={styles.imageGrid}>
          {item.quest.records.map((record, index) => (
            <View key={record.id} style={styles.gridItem}>
              <Image
                source={{uri: record.images?.[0]}}
                style={styles.gridImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      )}
      <Text style={styles.contentText}>{item.quest.description}</Text>
      {/* <View style={styles.tagsRow}>
        {item.quest.records[0]?.tags.map(tag => (
          <Text key={tag} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View> */}
      <View style={styles.reactionsRow}>
        <ReactionButton type="support" count={11} />
        <ReactionButton type="amazing" count={2} />
        <ReactionButton type="together" count={0} />
        <ReactionButton type="perfect" count={2} />
      </View>
      {/* 인증자 수 표시 */}
      <Text style={{color: '#4CAF50', fontWeight: 'bold', marginTop: 6}}>
        현재 {item.quest.verificationCount}
        명이 인증했습니다.
      </Text>
      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={handleGoQuest}
        activeOpacity={0.85}>
        <Text style={styles.verifyBtnText}>인증하기</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const ReactionButton = ({type, count}: {type: string; count: number}) => {
  const emojiMap: Record<string, string> = {
    support: '💪',
    amazing: '👏',
    together: '🤝',
    perfect: '🌟',
  };
  const labelMap: Record<string, string> = {
    support: '응원',
    amazing: '대단',
    together: '함께',
    perfect: '완벽',
  };
  return (
    <TouchableOpacity style={styles.reactionBtn}>
      <Text style={styles.reactionEmoji}>{emojiMap[type]}</Text>
      <Text style={styles.reactionLabel}>{labelMap[type]}</Text>
      <Text style={styles.reactionCount}>{count}</Text>
    </TouchableOpacity>
  );
};

const TAB_LIST = [
  {key: 'realtime', label: '실시간'},
  {key: 'following', label: '팔로잉'},
];

const VerificationFeedScreen = () => {
  const verificationQuests = useQuestStore(state => state.getVerificationFeed);
  const [feed, setFeed] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'realtime' | 'following'>(
    'realtime',
  );

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setFeed(verificationQuests);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed().then(() => setRefreshing(false));
  };

  // 팔로잉 피드는 userId가 'user1'인 것만 노출 (예시)
  const filteredFeed =
    activeTab === 'following' ? feed.filter(item => item.id === 'user1') : feed;

  if (loading) {
    return <ActivityIndicator style={{flex: 1, marginTop: 100}} size="large" />;
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f1f1f1'}}>
      <View style={styles.tabRow}>
        {TAB_LIST.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabBtn,
              activeTab === tab.key && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab(tab.key as 'realtime' | 'following')}>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredFeed}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <VerificationFeedCard
            item={{
              quest: item,
              user: {
                id: 'user1',
                nickname: 'user1',
                level: 1,
                badge: 'user1',
                name: 'user1',
                email: 'user1',
                userType: 'user1',
                actionPoints: 1,
                exp: 1,
                maxExp: 1,
              },
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{padding: 16, paddingBottom: 32}}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', color: '#999', marginTop: 40}}>
            피드가 없습니다.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginHorizontal: -2,
  },
  gridItem: {
    width: '25%',
    aspectRatio: 1,
    padding: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
    width: '100%',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: '#4CAF50',
    backgroundColor: '#f8f8f8',
  },
  tabLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  badge: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  questInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  feedImage: {
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  contentText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    marginTop: 8,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 0, // Allow the button to shrink if needed
    flex: 1, // Distribute space equally
    marginHorizontal: 0, // Remove any horizontal margin that might cause overflow
    maxWidth: '24%', // Ensure 4 buttons fit within the row with gaps
  },
  reactionEmoji: {
    fontSize: 17,
    marginRight: 3,
  },
  reactionLabel: {
    fontSize: 13,
    color: '#444',
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 13,
    color: '#888',
    fontWeight: 'bold',
  },
  qualityScore: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'right',
  },
  verifyBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
});

export default VerificationFeedScreen;
