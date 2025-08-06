import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
  PanResponder,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  GestureResponderEvent,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useCallback} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {API_URL} from '@env';
import instance from '../utils/axiosInterceptor';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import type {Quest} from '../types/quest.types';
import {useQuestStore} from '../store/mockData';

interface BottomSheetProps {
  todoModalVisible: boolean;
  settodoModalVisible: (visible: boolean) => void;
  whatTodo?: string;
  isMainQuest?: boolean;
  questToEdit?: Quest | null;
}

const BottomSheet = ({
  todoModalVisible,
  settodoModalVisible,
  whatTodo,
  isMainQuest = false,
  questToEdit,
}: BottomSheetProps) => {
  const {height: screenHeight} = useWindowDimensions();
  const translateY = useSharedValue(screenHeight);
  const context = useSharedValue({y: 0});

  const {addQuest, updateQuest} = useQuestStore();
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDescription, setNewQuestDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  ); // Default to 1 week from now
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [requiredVerifications, setRequiredVerifications] = useState(3);

  useEffect(() => {
    if (questToEdit) {
      setNewQuestTitle(questToEdit.title);
      setNewQuestDescription(questToEdit.description || '');
      setStartDate(new Date(questToEdit.startDate));
      setEndDate(new Date(questToEdit.endDate));
      setVerificationRequired(questToEdit.verificationRequired || false);
      setRequiredVerifications(questToEdit.requiredVerifications || 3);
    }
  }, [questToEdit]);
  // Handle date change for date pickers with proper typing
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

  const toggleVerification = () => {
    setVerificationRequired(!verificationRequired);
  };

  const closeModalWithAnimation = useCallback(() => {
    // 먼저 상태 업데이트
    closeDatePickers();
    settodoModalVisible(false);

    // 그 다음 애니메이션 실행
    translateY.value = withSpring(screenHeight, {damping: 50});
  }, []);

  useEffect(() => {
    if (todoModalVisible) {
      translateY.value = withSpring(0, {damping: 50});
      closeDatePickers();
    }
  }, [todoModalVisible]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {y: translateY.value};
    })
    .onUpdate(event => {
      if (event.translationY > 0) {
        translateY.value = event.translationY + context.value.y;
      }
    })
    .onEnd(event => {
      if (event.translationY > 100) {
        runOnJS(closeModalWithAnimation)();
      } else {
        translateY.value = withSpring(0, {damping: 50});
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });
  const closeModalImmediately = useCallback(() => {
    // 그 다음 애니메이션 실행
    translateY.value = withSpring(screenHeight, {
      damping: 100, // 값을 높이면 더 부드럽고 느려짐 (기본값은 약 10-20)
      stiffness: 100, // 스프링의 강도 (기본값 100)
    });
    closeDatePickers();
    settodoModalVisible(false);
  }, []);

  let handleSubmit;

  if (API_URL == '') {
    handleSubmit = () => {
      if (questToEdit) {
        updateQuest(questToEdit.id, {
          title: newQuestTitle,
          description: newQuestDescription,
          isMain: isMainQuest,
          startDate: startDate,
          endDate: endDate,
          procedure: 'progress',
          verificationRequired: verificationRequired,
          requiredVerifications: requiredVerifications,
        });
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        closeModalImmediately();
        Keyboard.dismiss();
      } else {
        addQuest({
          title: newQuestTitle,
          description: newQuestDescription,
          isMain: isMainQuest,
          startDate: startDate,
          endDate: endDate,
          procedure: 'progress',
          verificationRequired: verificationRequired,
          requiredVerifications: requiredVerifications,
        });
        setNewQuestTitle('');
        setNewQuestDescription('');
        setStartDate(new Date());
        setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        setVerificationRequired(false);
        setRequiredVerifications(3);
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        closeModalImmediately();
        Keyboard.dismiss();
      }
    };
  } else {
    // ********* Backend랑 연결 부분 *********
    const fetchData = async () => {
      if (questToEdit) {
        await instance.put(`/quest/${questToEdit.id}`, {
          title: newQuestTitle,
          description: newQuestDescription,
          isMain: isMainQuest,
          startDate: startDate,
          endDate: endDate,
          procedure: 'progress',
          verificationRequired: verificationRequired,
          requiredVerification: requiredVerifications,
        });
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        closeModalImmediately();
        Keyboard.dismiss();
      } else {
        await instance.post(`/quest/create`, {
          title: newQuestTitle,
          description: newQuestDescription,
          isMain: isMainQuest,
          startDate: startDate,
          endDate: endDate,
          procedure: 'progress',
          verificationRequired: verificationRequired,
          requiredVerification: requiredVerifications,
        });
        setNewQuestTitle('');
        setNewQuestDescription('');
        setStartDate(new Date());
        setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        setVerificationRequired(false);
        setRequiredVerifications(3);
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        closeModalImmediately();
        Keyboard.dismiss();
      }
    };
    const queryClient = useQueryClient();
    const {mutate, error} = useMutation({
      mutationFn: fetchData,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['homeQuests'],
        });
        // settodoModalVisible(false);
        // setNewQuestTitle('');
      },
    });
    handleSubmit = async (event: GestureResponderEvent) => {
      if (newQuestTitle == '') {
        Alert.alert('할 일을 입력해주세요.');
      }
      console.log('Creating quest with isMain:', isMainQuest);
      mutate();
    };
  }

  return (
    <SafeAreaView>
      <TouchableWithoutFeedback
        onPress={() => {
          closeModalImmediately();
          Keyboard.dismiss();
        }}>
        <View style={styles.background} />
      </TouchableWithoutFeedback>
      <Modal
        visible={todoModalVisible}
        animationType={'fade'}
        transparent
        statusBarTranslucent>
        <View style={styles.overlay}>
          <SafeAreaView>
            <GestureDetector gesture={panGesture}>
              {/* <Animated.View
                style={{
                  ...styles.bottomSheetContainer,
                  transform: [{translateY: translateY}],
                }}
                {...panResponders.panHandlers}> */}
              <Animated.View
                style={[
                  styles.bottomSheetContainer,
                  animatedStyle, // 기존 transform 속성 대신 animatedStyle 사용
                ]}>
                <TouchableWithoutFeedback>
                  <KeyboardAvoidingView
                    style={styles.addTodo}
                    keyboardVerticalOffset={100}>
                    <View style={styles.header}>
                      <TouchableOpacity
                        onPress={() => closeModalImmediately()}
                        style={styles.headerButton}>
                        <Text style={styles.cancelButtonText}>취소</Text>
                      </TouchableOpacity>
                      <Text style={styles.bottomSheetTitle}>
                        {questToEdit
                          ? '퀘스트 수정하기'
                          : isMainQuest
                          ? '메인 퀘스트 추가하기'
                          : '서브 퀘스트 추가하기'}
                      </Text>
                      <TouchableOpacity
                        onPress={handleSubmit}
                        style={[
                          styles.headerButton,
                          (!newQuestTitle.trim() ||
                            (verificationRequired &&
                              requiredVerifications < 1)) && {
                            opacity: 0.5,
                          },
                        ]}
                        disabled={
                          !newQuestTitle.trim() ||
                          (verificationRequired && requiredVerifications < 1)
                        }>
                        <Text style={styles.doneButtonText}>완료</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView keyboardShouldPersistTaps="handled">
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
                            onPress={() =>
                              !questToEdit && toggleDatePicker(true)
                            }
                            disabled={!!questToEdit}>
                            <Icon
                              name="event"
                              size={18}
                              color="#666"
                              style={styles.dateIcon}
                            />
                            <Text
                              style={[
                                styles.dateText,
                                questToEdit && {color: '#ccc'},
                              ]}>
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
                      <View style={styles.verificationContainer}>
                        <View style={styles.verificationHeader}>
                          <Text style={styles.inputLabel}>인증 필요</Text>
                          <Switch
                            value={verificationRequired}
                            onValueChange={toggleVerification}
                            trackColor={{false: '#ddd', true: '#4CAF50'}}
                            thumbColor="#fff"
                          />
                        </View>

                        {verificationRequired && (
                          <View style={styles.verificationSettings}>
                            <Text style={styles.verificationLabel}>
                              필요 인증 횟수
                            </Text>
                            <View style={styles.counterContainer}>
                              <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() =>
                                  setRequiredVerifications(prev =>
                                    Math.max(1, prev - 1),
                                  )
                                }
                                disabled={requiredVerifications <= 1}>
                                <Text style={styles.counterButtonText}>-</Text>
                              </TouchableOpacity>
                              <Text style={styles.counterValue}>
                                {requiredVerifications}
                              </Text>
                              <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() =>
                                  setRequiredVerifications(prev => prev + 1)
                                }>
                                <Text style={styles.counterButtonText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                      {/* <Pressable style={styles.doneBtn} onPress={handleSubmit}>
                      <Text
                        style={{
                          color: '#ffffff',
                          fontSize: 16,
                        }}>
                        완료
                      </Text>
                    </Pressable> */}
                    </ScrollView>
                  </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
              </Animated.View>
            </GestureDetector>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  background: {
    flex: 1,
  },
  bottomSheetContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  addWhat: {
    flex: 1,
    width: '100%',
    height: 60,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'baseline',
  },
  addTodo: {
    flex: 1,
    width: '100%',
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  doneBtn: {
    backgroundColor: '#806a6b',
    borderRadius: 100,
    width: 72,
    height: 40,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButtonText: {
    color: '#4A80F5',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  verificationContainer: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationSettings: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  verificationLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 20,
    color: '#555',
    lineHeight: 24,
  },
  counterValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default BottomSheet;
