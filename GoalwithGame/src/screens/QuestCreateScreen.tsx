import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ViewStyle, TextStyle } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../contexts/AppContext';

type RouteParams = {
  isMain?: boolean;
};

const QuestCreateScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isMain = false } = (route.params || {}) as RouteParams;
  const { addQuest } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to 1 week from now
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('오류', '퀘스트 제목을 입력해주세요.');
      return;
    }
    
    if (startDate >= endDate) {
      Alert.alert('오류', '종료일은 시작일 이후로 설정해주세요.');
      return;
    }
    
    addQuest({
      title: title.trim(),
      isMain,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      completed: false,
      verificationRequired: false, // Default to false for new quests
      verificationCount: 0, // Initialize verification count
      requiredVerifications: 0, // Default to 0 if not required
    });
    
    navigation.goBack();
  };
  
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.label}>퀘스트 제목</Text>
          <TextInput
            style={styles.input}
            placeholder="퀘스트 제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            autoFocus
          />
          
          <Text style={[styles.label, { marginTop: 20 }]}>기간</Text>
          
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>시작일</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text>{formatDate(startDate)}</Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.dateRow, { marginTop: 10 }]}>
            <Text style={styles.dateLabel}>종료일</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text>{formatDate(endDate)}</Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={dynamicStyles(isMain).typeBadge}>
            <Text style={dynamicStyles(isMain).typeBadgeText}>
              {isMain ? '메인 퀘스트' : '서브 퀘스트'}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
      
      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          minimumDate={startDate}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
};

// Define the type for styles that depend on isMain
const dynamicStyles = (isMain: boolean) => {
  const typeBadge: ViewStyle = {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: isMain ? '#e3f2fd' : '#f5f5f5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isMain ? '#bbdefb' : '#e0e0e0',
  };

  const typeBadgeText: TextStyle = {
    color: isMain ? '#1976d2' : '#757575',
    fontSize: 12,
    fontWeight: '500' as const,
  };

  return { typeBadge, typeBadgeText };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 80, // Space for the footer
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateLabel: {
    width: 60,
    fontSize: 14,
    color: '#666',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#806a5b',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default QuestCreateScreen;
