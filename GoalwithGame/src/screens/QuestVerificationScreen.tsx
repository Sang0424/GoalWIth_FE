import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import types
import { Quest } from '../types/quest.types';
import { VerificationMessage } from '../types/feed.types';
import { useAppContext } from '../contexts/AppContext';

// Navigation types
type RootStackParamList = {
  QuestVerification: { questId: string };
};

type QuestVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuestVerification'>;

// Extended types for the screen
interface QuestWithVerification extends Omit<Quest, 'records'> {
  records: Array<{
    id: string;
    text: string;
    image?: string;
    createdAt: string;
    verifications: VerificationMessage[];
  }>;
}

const QuestVerificationScreen = () => {
  const navigation = useNavigation<QuestVerificationScreenNavigationProp>();
  const route = useRoute();
  const { questId } = route.params as { questId: string };
  
  const { quests, user } = useAppContext();
  const [verificationText, setVerificationText] = useState('');
  const [quest, setQuest] = useState<QuestWithVerification | null>(null);
  const [record, setRecord] = useState<{
    id: string;
    text: string;
    image?: string;
    createdAt: string;
    verifications: VerificationMessage[];
  } | null>(null);

  // Mock data for when real data isn't available
  const generateMockQuest = (): QuestWithVerification => ({
    id: questId,
    title: '샘플 퀘스트',
    description: '이것은 샘플 퀘스트입니다.',
    isMain: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    verificationRequired: true,
    verificationCount: 0,
    requiredVerifications: 3,
    records: [{
      id: 'record-1',
      text: '이것은 샘플 인증 기록입니다.\n오늘도 열심히 달렸어요!',
      image: 'https://via.placeholder.com/300x200?text=Sample+Image',
      createdAt: new Date().toISOString(),
      verifications: [
        { 
          id: 'v1', 
          user: { id: 'user2', nickname: '철수', avatar: '' }, 
          text: '잘했어요!', 
          createdAt: new Date().toISOString() 
        },
        { 
          id: 'v2', 
          user: { id: 'user3', nickname: '영희', avatar: '' }, 
          text: '대단해요!', 
          createdAt: new Date().toISOString() 
        }
      ]
    }]
  });

  useEffect(() => {
    const foundQuest = quests?.find(q => q.id === questId);
    if (foundQuest) {
      // Cast the found quest to QuestWithVerification since we know the structure
      const questWithVerification: QuestWithVerification = {
        ...foundQuest,
        records: foundQuest.records?.map(record => ({
          id: record.id,
          text: record.text,
          image: record.images?.[0], // Take first image if available
          createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt || new Date().toISOString(),
          verifications: (record.verifications || []).map(verification => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            user: {
              id: verification.userId,
              nickname: 'User', // Default nickname
              avatar: ''
            },
            text: 'Verified', // Default text since QuestVerification doesn't have a comment field
            createdAt: verification.verifiedAt || new Date().toISOString()
          }))
        })) || []
      };
      setQuest(questWithVerification);
      
      // Get the latest record for verification
      const latestRecord = questWithVerification.records[questWithVerification.records.length - 1];
      if (latestRecord) {
        setRecord(latestRecord);
      }
    } else {
      // Use mock data if no quest is found
      const mockQuest = generateMockQuest();
      setQuest(mockQuest);
      setRecord(mockQuest.records[0]);
    }
  }, [questId, quests]);

  const handleVerify = () => {
    if (!verificationText.trim()) {
      Alert.alert('오류', '인증 메시지를 입력해주세요.');
      return;
    }

    // In a real app, you would call a function to add verification
    // For example: addVerification(questId, record.id, verificationText);
    Alert.alert('성공', '퀘스트 인증이 완료되었습니다!');
    setVerificationText('');
    navigation.goBack();
  };

  if (!quest || !record) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  const handleBack = () => {
    navigation.goBack();
  };

  // 모든 인증 메시지(댓글) 리스트 추출
  const allVerifications = quest.records.flatMap((r: any) => r.verifications || []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>퀘스트 인증</Text>
        <View style={styles.headerRight} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{quest.title} 인증하기</Text>
        <Text style={styles.questTitle}>{quest.title}</Text>

        {/* 인증 메시지(댓글) 리스트 */}
        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>인증 메시지</Text>
          {allVerifications.length === 0 ? (
            <Text style={{ color: '#999' }}>아직 인증 메시지가 없습니다.</Text>
          ) : (
            allVerifications.map((msg: VerificationMessage) => {
              if (!msg || !msg.user) return null;
              return (
                <View key={msg.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eee', marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', color: '#333' }}>{msg.user.nickname || '알 수 없음'}</Text>
                    <Text style={{ color: '#444' }}>{msg.text}</Text>
                  </View>
                  <Text style={{ color: '#aaa', fontSize: 12, marginLeft: 8 }}>{msg.createdAt}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* 기존 인증 기록 UI (예시: 최근 record) */}
        {record.image && (
          <Image
            source={{ uri: record.image }}
            style={styles.recordImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.recordText}>{record.text}</Text>
        <View style={styles.verificationInfo}>
          <Text>
            현재 {record.verifications.length}명이 인증했습니다.
            (최소 {quest.requiredVerifications}명 필요)
          </Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="인증 메시지를 입력해주세요"
          value={verificationText}
          onChangeText={setVerificationText}
          autoCorrect={false}
          multiline
        />
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: verificationText.trim() ? '#4CAF50' : '#ccc' }]}
          onPress={handleVerify}
          disabled={!verificationText.trim()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>인증완료</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  questTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  recordImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  recordText: {
    fontSize: 16,
    marginVertical: 10,
    lineHeight: 24,
  },
  verificationInfo: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuestVerificationScreen;
