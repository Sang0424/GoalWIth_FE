import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext } from '../contexts/AppContext';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  QuestVerification: { questId: string };
};

type QuestVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuestVerification'>;

const QuestVerificationScreen = () => {
  const navigation = useNavigation<QuestVerificationScreenNavigationProp>();
  const route = useRoute();
  const { questId } = route.params as { questId: string };
  
  const { quests, user } = useAppContext();
  const [verificationText, setVerificationText] = useState('');
  const [quest, setQuest] = useState<any>(null);
  const [record, setRecord] = useState<any>(null);

  useEffect(() => {
    const foundQuest = quests.find(q => q.id === questId);
    if (foundQuest) {
      setQuest(foundQuest);
      // Get the latest record for verification
      const latestRecord = foundQuest.records[foundQuest.records.length - 1];
      setRecord(latestRecord);
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
      <View style={styles.container}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>퀘스트 인증하기</Text>
      <Text style={styles.questTitle}>{quest.title}</Text>
      
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
        multiline
      />
      
      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.verifyButtonText}>인증 완료</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    borderRadius: 10,
    marginBottom: 15,
  },
  recordText: {
    fontSize: 16,
    marginBottom: 20,
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
