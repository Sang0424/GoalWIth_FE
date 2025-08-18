import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTeamStore} from '../../store/mockData';
import {useQuestStore} from '../../store/mockData';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {TeamNavParamList} from '@/types/navigation';
import {useRoute} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {GestureResponderEvent} from 'react-native';

const TeamQuestCreateScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TeamNavParamList>>();
  const route = useRoute();
  const {teamName, data} = route.params as {
    teamName: string;
    data: string | number;
  };

  const {quests, addQuest} = useQuestStore();
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDescription, setNewQuestDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  ); // Default to 1 week from now
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // ********* Backend랑 연결 부분 *********
  const fetchData = async () => {
    await instance.post(`/quest/create`, {
      title: newQuestTitle,
      description: newQuestDescription,
      isMain: false,
      startDate: startDate,
      endDate: endDate,
      procedure: 'progress',
      team_id: data,
    });
  };
  const queryClient = useQueryClient();
  const {mutate, error} = useMutation({
    mutationFn: fetchData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teamQuests'],
      });
      setNewQuestTitle('');
      setNewQuestDescription('');
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    },
  });
  const handleSubmit = async (event: GestureResponderEvent) => {
    if (newQuestTitle == '') {
      Alert.alert('할 일을 입력해주세요.');
    }
    mutate();
  };
  // ********* Backend랑 연결 부분 *********

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === 'set' && selectedDate) {
      setStartDate(selectedDate);
      // If end date is before new start date, update end date
      if (selectedDate > endDate) {
        setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)); // 1 day after start
      }
    }
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setEndDate(selectedDate);
    }
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
  };

  // Toggle date picker visibility
  const toggleDatePicker = (isStartDate: boolean) => {
    if (isStartDate) {
      setShowStartDatePicker(prev => !prev);
      setShowEndDatePicker(false);
    } else {
      setShowStartDatePicker(false);
      setShowEndDatePicker(prev => !prev);
    }
  };

  // Close all date pickers
  const closeDatePickers = useCallback(() => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  }, []);

  const handleCreateTeam = () => {
    if (!newQuestTitle.trim()) {
      Alert.alert('오류', '퀘스트 이름을 입력해주세요.');
      return;
    }
    Alert.alert('팀 생성 완료', `${teamName} 팀이 성공적으로 생성되었습니다!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333'}}>
              {teamName} 퀘스트 설정
            </Text>
            <Ionicons
              name="close"
              size={32}
              color="#333"
              onPress={() => navigation.navigate('TeamScreen')}
            />
          </View>
          <Text style={styles.inputLabel}>퀘스트 제목*</Text>
          <TextInput
            style={styles.input}
            placeholder="퀘스트 제목을 입력하세요"
            value={newQuestTitle}
            onChangeText={setNewQuestTitle}
            autoFocus
            returnKeyType="next"
            maxLength={50}
          />
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.inputLabel}>시작일</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => toggleDatePicker(true)}>
                <Icon
                  name="event"
                  size={18}
                  color="#666"
                  style={styles.dateIcon}
                />
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString('ko-KR')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.inputLabel}>종료일</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => toggleDatePicker(false)}>
                <Icon
                  name="event"
                  size={18}
                  color="#666"
                  style={styles.dateIcon}
                />
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString('ko-KR')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="spinner"
              onChange={onStartDateChange}
              locale="ko-KR"
              textColor="#333"
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="spinner"
              onChange={onEndDateChange}
              minimumDate={startDate}
              locale="ko-KR"
              textColor="#333"
            />
          )}
          <Text style={styles.inputLabel}>상세 설명</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="퀘스트에 대한 상세한 설명을 입력하세요"
            value={newQuestDescription}
            onChangeText={setNewQuestDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>이전으로</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.createButton,
              !teamName && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!teamName}>
            <Text style={styles.createButtonText}>팀 생성하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the footer
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInputContainer: {
    width: '48%',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
  createButton: {
    backgroundColor: '#806a5b',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default TeamQuestCreateScreen;
