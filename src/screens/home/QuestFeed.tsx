import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
} from 'react-native';
import {useRef, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import {QuestFeedProps} from '../../types/navigation';
import {useQuestStore} from '../../store/mockData';
import BackArrow from '../../components/BackArrow';
import useKeyboardHeight from '../../utils/hooks/useKeyboardHeight';

const QuestFeed = ({route}: QuestFeedProps) => {
  const navigation = useNavigation();
  const {questId} = route.params;
  const [newRecordText, setNewRecordText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const quest = useQuestStore(state => state.getQuestById(questId));
  const {keyboardHeight} = useKeyboardHeight();

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  // 200 duration is somewhat a magic number that seemed to work nicely with
  // the default keyboard opening speed
  const startAnimation = (toValue: number) =>
    Animated.timing(keyboardOffset, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();

  useEffect(() => {
    const keyboardWillShow = (e: any) => {
      startAnimation(-e.endCoordinates?.height + 81);
    };

    const keyboardWillHide = () => {
      startAnimation(0);
    };

    // Add listeners
    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      keyboardWillShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      keyboardWillHide,
    );

    // Clean up
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!quest) {
    return (
      <View style={styles.centerContainer}>
        <Text>퀘스트를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const handleAddRecord = async () => {
    if (!newRecordText.trim()) {
      Alert.alert('오류', '기록할 내용을 입력해주세요.');
      return;
    }

    // Fix: Call the store function correctly
    useQuestStore.getState().addQuestRecord(questId, {
      date: new Date().toISOString(),
      text: newRecordText.trim(),
      image: image || undefined,
    });

    // Reset form
    setNewRecordText('');
    setImage(null);

    // Show success message
    Alert.alert('성공', '기록이 추가되었습니다!');
  };

  const handleCompleteQuest = () => {
    Alert.alert('퀘스트 완료', '이 퀘스트를 완료하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '완료',
        onPress: () => {
          useQuestStore.getState().completeQuest(questId);
          navigation.goBack();
        },
      },
    ]);
  };

  const pickImage = () => {
    const options: any = {
      mediaType: 'photo',
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 1, // 0-1 where 1 is best quality
      includeBase64: false,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
      } else if (response.assets && response.assets[0].uri) {
        setImage(response.assets[0].uri);
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일 ${String(date.getHours()).padStart(
      2,
      '0',
    )}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={[
          styles.scrollView,
          !!keyboardHeight && {marginBottom: keyboardHeight + 20},
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Quest Header */}
        <View
          style={[
            styles.header,
            quest.isMain ? styles.mainQuestHeader : styles.subQuestHeader,
          ]}>
          <BackArrow />
          <View style={styles.headerContent}>
            <Text style={styles.questTitle}>{quest.title}</Text>
            <Text style={styles.questDate}>
              {new Date(quest.startDate).toLocaleDateString()} -{' '}
              {new Date(quest.endDate).toLocaleDateString()}
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          (quest.records ? quest.records.length / 7 : 0) * 100,
                        ),
                      )}%`,
                      backgroundColor: quest.isMain ? '#4a90e2' : '#a0a0a0',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {quest.records?.length ?? 0}일차
              </Text>
            </View>
          </View>
        </View>

        {/* Records List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기록 타임라인</Text>

          {quest.records?.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>아직 기록이 없습니다.</Text>
              <Text style={styles.emptyStateSubtext}>
                오늘의 활동을 기록해보세요!
              </Text>
            </View>
          ) : (
            quest.records?.map(record => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordDate}>
                    {formatDate(record.date || '')}
                  </Text>
                </View>
                {record.images && (
                  <Image
                    source={{uri: record.images[0]}}
                    style={styles.recordImage}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.recordText}>{record.text}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Record Form */}
      <Animated.View
        style={[
          styles.inputContainer,
          {transform: [{translateY: keyboardOffset}]},
        ]}>
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{uri: image}} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImage(null)}>
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.inputRow]}>
          <TextInput
            style={styles.input}
            placeholder="오늘의 활동을 기록하세요..."
            value={newRecordText}
            onChangeText={setNewRecordText}
            multiline
          />
          <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
            <Ionicons name="camera" size={24} color="#806a5b" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompleteQuest}>
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={styles.completeButtonText}>완료하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={handleAddRecord}
            disabled={!newRecordText.trim()}>
            <Ionicons name="add" size={18} color="white" />
            <Text style={styles.addButtonText}>기록 추가</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 200, // Space for the input container
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  mainQuestHeader: {
    backgroundColor: '#e3f2fd',
  },
  subQuestHeader: {
    backgroundColor: '#f5f5f5',
  },
  headerContent: {
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  questDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    marginLeft: 10,
    fontSize: 12,
    color: '#666',
    minWidth: 50,
    textAlign: 'right',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 10,
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
  },
  emptyStateSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordDate: {
    fontSize: 12,
    color: '#888',
  },
  recordImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  recordText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingRight: 45,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#f9f9f9',
  },
  cameraButton: {
    position: 'absolute',
    right: 10,
    padding: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  addButton: {
    backgroundColor: '#806a5b',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default QuestFeed;
