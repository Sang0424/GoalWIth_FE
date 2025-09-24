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
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useRef, useEffect, useCallback} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  launchImageLibrary,
  Asset,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {QuestFeedProps} from '../../types/navigation';
import {useQuestStore} from '../../store/mockData';
import useKeyboardHeight from '../../utils/hooks/useKeyboardHeight';
import ImageCarousel from '../../components/Carousel';
import {useQuery, useMutation} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {useQueryClient} from '@tanstack/react-query';
import type {QuestRecord, Quest} from '../../types/quest.types';
import {API_URL} from '@env';

const QuestFeed = ({route}: QuestFeedProps) => {
  const navigation = useNavigation();
  const {quest: questParam} = route.params;
  const [newRecordText, setNewRecordText] = useState('');
  const [images, setImages] = useState<Asset[]>([]);
  const [questRecord, setQuestRecord] = useState<QuestRecord[]>([]);
  const {keyboardHeight} = useKeyboardHeight();
  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();

  const quest = {
    ...questParam,
    startDate: questParam.startDate ? new Date(questParam.startDate) : null,
    endDate: questParam.endDate ? new Date(questParam.endDate) : null,
  };

  const {data, isLoading} = useQuery({
    queryKey: ['QuestRecord', quest.id],
    queryFn: async () => {
      if (API_URL !== '') {
        try {
          const response = await instance.get(`/record/${quest.id}`);
          return response.data;
        } catch (error: any) {
          console.log(error.response.data.message);
          Alert.alert(`${error.response.data.message}`);
          return {records: quest.records || []};
        }
      }
      return {records: quest.records || []};
    },
    enabled: API_URL !== '', // Only run the query if API_URL is not empty
  });

  console.log('QuestRecord:', data);

  // Set questRecord when data changes
  useEffect(() => {
    if (data) {
      setQuestRecord(data);
    } else {
      setQuestRecord(quest.records || []);
    }
  }, [data, quest.records]);

  const createRecord = useCallback(
    async ({questId, text, images: recordImages}: any) => {
      if (API_URL === '') {
        useQuestStore.getState().addQuestRecord(questId, {
          text,
          images: recordImages,
          user: 'user',
        });
        return;
      }

      const formData = new FormData();
      formData.append('text', text);
      recordImages.forEach((image: Asset) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type,
          name: image.fileName,
        });
      });
      await instance.post(`/record/create/${questId}`, formData);
    },
    [],
  );

  const {mutate} = useMutation({
    mutationFn: createRecord,
    onSuccess: () => {
      Alert.alert('성공', '기록이 추가되었습니다!');
      queryClient.invalidateQueries({queryKey: ['QuestRecord', quest.id]});
      queryClient.invalidateQueries({queryKey: ['homeQuests']});
    },
    onError: (error: any) => {
      Alert.alert(`오류`, `${error.response.data.message}`);
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['QuestRecord', quest.id]});
    },
  });

  const {data: completeData, mutate: completeQuest} = useMutation({
    mutationFn: async () => {
      await instance.put(`/quest/complete/${quest.id}`);
    },
    onError: (error: any) => {
      Alert.alert(`오류`, `${error.response.data.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['QuestRecord', quest.id]});
      queryClient.invalidateQueries({queryKey: ['user']});
      queryClient.invalidateQueries({queryKey: ['homeQuests']});
    },
  });

  const handleAddRecord = useCallback(async () => {
    if (!newRecordText.trim() && images.length === 0) {
      Alert.alert('오류', '기록할 내용을 입력해주세요.');
      return;
    }

    if (API_URL === '') {
      useQuestStore.getState().addQuestRecord(quest.id, {
        text: newRecordText,
        images,
        user: 'user1',
      });
      setNewRecordText('');
      setImages([]);
      navigation.goBack();
      return;
    } else {
      mutate({
        questId: quest.id,
        text: newRecordText,
        images,
      });
      setNewRecordText('');
      setImages([]);
    }
  }, [newRecordText, images, quest.id, mutate, navigation]);

  useEffect(() => {
    if (questRecord?.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [questRecord]);

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
  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  const handleCompleteQuest = () => {
    Alert.alert('퀘스트 완료', '이 퀘스트를 완료하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '완료',
        onPress: () => {
          if (API_URL === '') {
            useQuestStore.getState().completeQuest(quest.id);
            navigation.goBack();
            return;
          } else {
            completeQuest(quest.id, {
              onSuccess: () => {
                Alert.alert('성공', '퀘스트가 완료되었습니다!');
                navigation.goBack();
              },
              onError: error => {
                Alert.alert(`${error.response.data.message}`);
                console.log(error);
              },
            });
          }
        },
      },
    ]);
  };

  const pickImage = () => {
    const options: any = {
      mediaType: 'photo',
      selectionLimit: 3 - images.length,
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
      } else if (response.assets?.length) {
        const images: Asset[] = [];
        response.assets.forEach((asset: Asset) => images.push(asset));
        setImages(prev => [...prev, ...images].slice(0, 3));
      }
    });
  };
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
        stickyHeaderIndices={[0]}
        ref={scrollViewRef}
        contentContainerStyle={
          !!keyboardHeight ? undefined : {paddingBottom: 80}
        }
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
          <View style={styles.headerContent}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={{padding: 10}}>
                <Icon
                  name={
                    Platform.OS === 'ios'
                      ? 'arrow-back-ios'
                      : 'arrow-back-android'
                  }
                  size={20}
                  color={'#000'}
                />
              </Pressable>
              <Text style={styles.questTitle}>{quest.title}</Text>
              <View style={{width: 40}} />
            </View>
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
                          (questRecord ? questRecord.length / 7 : 0) * 100,
                        ),
                      )}%`,
                      backgroundColor: quest.isMain ? '#4a90e2' : '#a0a0a0',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {questRecord?.length ?? 0}일차
              </Text>
            </View>
          </View>
        </View>

        {/* Records List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기록 타임라인</Text>

          {questRecord?.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>아직 기록이 없습니다.</Text>
              <Text style={styles.emptyStateSubtext}>
                오늘의 활동을 기록해보세요!
              </Text>
            </View>
          ) : (
            questRecord?.map((record: QuestRecord) => (
              <View key={record.id} style={styles.recordCard}>
                {record.images && record.images?.length > 0 && (
                  <ImageCarousel images={record.images} />
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
        {images.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            {images.map((image, index) => (
              <TouchableOpacity
                key={`image-${index}-${image}`}
                onPress={() => removeImage(index)}
                style={styles.imageWrapper}>
                <Image source={{uri: image.uri}} style={styles.imagePreview} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImages([])}>
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
            style={
              new Date(quest.endDate) < new Date()
                ? [styles.actionButton, styles.completeButton]
                : [
                    styles.actionButton,
                    styles.completeButton,
                    {backgroundColor: '#ccc'},
                  ]
            }
            onPress={handleCompleteQuest}
            disabled={new Date(quest.endDate) > new Date()}>
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={styles.completeButtonText}>완료하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.addButton,
              !newRecordText.trim() &&
                images.length === 0 && {
                  backgroundColor: '#ccc',
                },
            ]}
            onPress={handleAddRecord}
            disabled={!newRecordText.trim() && images.length === 0}>
            <Ionicons name="add" size={18} color="white" />
            <Text
              style={
                !newRecordText.trim() && images.length === 0
                  ? styles.addButtonText
                  : styles.addButtonText
              }>
              기록 추가
            </Text>
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
    paddingBottom: 300,
  },
  header: {
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  mainQuestHeader: {
    backgroundColor: '#B9B69B',
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
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 10,
    gap: 10,
  },
  imagePreview: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  imageWrapper: {
    position: 'relative',
    width: '30%',
    marginBottom: 10,
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
