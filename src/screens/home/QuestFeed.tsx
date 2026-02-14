import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Keyboard,
  Animated,
  Pressable,
  Platform,
  ActivityIndicator,
  SectionList,
  useWindowDimensions,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import {useRef, useEffect, useCallback, useMemo} from 'react';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  launchImageLibrary,
  Asset,
  ImagePickerResponse,
  launchCamera,
  CameraOptions,
} from 'react-native-image-picker';
import {QuestFeedProps} from '../../types/navigation';
import useKeyboardHeight from '../../utils/hooks/useKeyboardHeight';
import ImageCarousel from '../../components/Carousel';
import {useQuery, useMutation} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {useQueryClient} from '@tanstack/react-query';
import type {QuestRecord, Quest} from '../../types/quest.types';
import Config from 'react-native-config';
import {colors} from '../../styles/theme';
import {formatRelativeTime} from '../../utils/dateUtils';
import {Image as ImageCompressor} from 'react-native-compressor';
import {Image} from 'expo-image';
import ImagePickerModal from '../../components/ImagePickerModal';
import {groupRecordsByDate} from '../../utils/dateUtils';
import {checkForProfanity} from '../../utils/filter';
import {Calendar, DateData, LocaleConfig} from 'react-native-calendars';
import {AnimatedProgressTrack} from '../../components/AnimatedProgressTrack';
import {ActionStamp} from '../../components/ActionStamp';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isToday,
  isAfter,
  startOfDay,
  parseISO,
  isBefore,
} from 'date-fns';
import {ko} from 'date-fns/locale';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import BottomSheet from '../../components/BottomSheet';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';

const PICO_COMPLETE = require('../../assets/character/pico_complete.png');
const PICO_SMILE = require('../../assets/character/pico_smile.png');
const PICO_REST = require('../../assets/character/pico_rest.png');

const PicoDay = React.memo(
  ({
    date,
    state,
    marking,
    onPress,
    isBeforeStart,
  }: {
    date: DateData;
    state: string;
    marking?: {hasRecord?: boolean};
    onPress: (d: DateData) => void;
    isBeforeStart?: boolean;
  }) => {
    const todayStart = startOfDay(new Date());
    const isSelected = state === 'selected';
    const isFuture = isAfter(parseISO(date.dateString), todayStart);
    const hasRecord = marking?.hasRecord;
    const picoImage =
      isBeforeStart || isFuture
        ? null
        : hasRecord
        ? PICO_COMPLETE
        : isToday(parseISO(date.dateString))
        ? PICO_SMILE
        : PICO_REST;

    return (
      <TouchableOpacity
        onPress={() => !isBeforeStart && onPress(date)}
        style={[picoStyles.dayContainer, isSelected && picoStyles.daySelected]}>
        <Text
          style={[
            picoStyles.dayText,
            (isBeforeStart || state === 'disabled') && picoStyles.dayDisabled,
            isToday(parseISO(date.dateString)) && picoStyles.dayToday,
          ]}>
          {date.day}
        </Text>

        <View style={picoStyles.stickerWrap}>
          {!isBeforeStart && (
            <Image
              source={picoImage}
              style={[
                picoStyles.sticker,
                hasRecord && picoStyles.completedSticker,
              ]}
              resizeMode="contain"
            />
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};
LocaleConfig.defaultLocale = 'ko';

const QUICK_INPUTS = [
  {id: '1', text: '🔥 오늘도 완료!', icon: '🔥'},
  {id: '2', text: '💪 끈기있게 성공', icon: '💪'},
  {id: '3', text: '✨ 작은 성취', icon: '✨'},
  {id: '4', text: '💧 습관 형성 중', icon: '💧'},
];

const QuestFeed = ({route}: QuestFeedProps) => {
  const navigation = useNavigation();
  const {quest: questParam} = route.params;
  const [newRecordText, setNewRecordText] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [isMonthView, setIsMonthView] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [images, setImages] = useState<Asset[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditQuest, setIsEditQuest] = useState(false);
  const [questRecord, setQuestRecord] = useState<QuestRecord[]>([]);
  const {keyboardHeight} = useKeyboardHeight();
  // const scrollViewRef = useRef<ScrollView>(null);
  const sectionListRef = useRef<SectionList>(null);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 49;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {width} = useWindowDimensions();

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  const quest = useMemo(() => {
    return {
      ...questParam,
      startDate: questParam.startDate ? new Date(questParam.startDate) : null,
      endDate: questParam.endDate ? new Date(questParam.endDate) : null,
    };
  }, [questParam]);

  const weekDays = useMemo(() => {
    // 선택된 날짜가 포함된 주의 시작일(일요일) 구하기
    const start = startOfWeek(parseISO(selectedDate), {weekStartsOn: 0});
    return Array.from({length: 7}).map((_, index) => {
      const date = addDays(start, index);
      return {
        dateString: format(date, 'yyyy-MM-dd'),
        day: format(date, 'd'),
        weekDay: format(date, 'E', {locale: ko}), // 요일 (일, 월...)
      };
    });
  }, [selectedDate]);

  const {data, isLoading} = useQuery({
    queryKey: ['QuestRecord', quest.id],
    queryFn: async () => {
      if (Config.API_URL !== '') {
        try {
          const response = await instance.get(`/record/${quest.id}`);
          return response.data;
        } catch (error: any) {
          Alert.alert(`${error.response.data.message}`);
          return {records: quest.records || []};
        }
      }
      return {records: quest.records || []};
    },
    enabled: Config.API_URL !== '', // Only run the query if API_URL is not empty
  });

  // Set questRecord when data changes
  useEffect(() => {
    if (data) {
      setQuestRecord(data);
    } else {
      setQuestRecord(quest.records || []);
    }
  }, [data, quest.records]);

  const markedDates = useMemo(() => {
    const marks: any = {};

    // 기록이 있는 날짜 마킹
    questRecord.forEach(record => {
      const dateKey = format(new Date(record.createdAt), 'yyyy-MM-dd');

      if (!marks[dateKey]) {
        marks[dateKey] = {
          customStyles: {container: {}, text: {}},
          dots: [],
          hasRecord: false,
          hasImage: false,
        };
      }

      marks[dateKey].hasRecord = true;
      if (record.images?.length) {
        marks[dateKey].hasImage = true;
      }
      // 중복 점 방지 (이미 점이 있으면 패스)
      if (
        !marks[dateKey].dots.some((dot: any) => dot.color === colors.primary)
      ) {
        marks[dateKey].dots.push({color: colors.primary});
      }
    });

    // 현재 선택된 날짜 스타일 적용
    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {
        dots: [],
        hasRecord: false,
        hasImage: false,
      }),
      selected: true,
      selectedColor: 'transparent',
      selectedTextColor: 'white',
    };

    return marks;
  }, [questRecord, selectedDate]);

  const createRecord = useCallback(
    async ({questId, text, images: recordImages}: any) => {
      const formData = new FormData();
      formData.append('text', text);
      recordImages.forEach((image: Asset) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type,
          name: image.fileName,
        });
      });
      await instance.post(`/record/create/${questId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    [],
  );
  const {mutate, isPending: isCreatingRecord} = useMutation({
    mutationFn: createRecord,
    onSuccess: () => {
      setShowStamp(true);
      queryClient.invalidateQueries({queryKey: ['QuestRecord', quest.id]});
      queryClient.invalidateQueries({queryKey: ['homeQuests']});
    },
    onError: (error: any) => {
      Alert.alert(`${error.response.data.message}`);
      queryClient.invalidateQueries({queryKey: ['QuestRecord', quest.id]});
    },
  });

  const {mutate: completeQuest} = useMutation({
    mutationFn: async () => {
      await instance.put(`/quest/complete/${quest.id}`);
    },
    onSuccess: () => {
      Alert.alert('성공', '퀘스트가 완료되었습니다!');
      navigation.goBack();
      queryClient.invalidateQueries({queryKey: ['QuestRecord', quest.id]});
      queryClient.invalidateQueries({queryKey: ['homeQuests']});
      queryClient.invalidateQueries({queryKey: ['myCharacters']});
      queryClient.invalidateQueries({queryKey: ['myBadges']});
    },
    onError: (error: any) => {
      Alert.alert(`${error.response.data.message}`);
    },
  });

  const {mutate: deleteQuest} = useMutation({
    mutationFn: async (questId: number) => {
      await instance.delete(`/quest/${questId}`);
    },
    onSuccess: () => {
      Alert.alert('퀘스트 삭제!', '퀘스트를 삭제했습니다!');
      queryClient.invalidateQueries({queryKey: ['homeQuests']});
    },
    onError: error => {
      Alert.alert('오류', '퀘스트 삭제 중 오류가 발생했습니다.');
      crashlytics().recordError(error);
      analytics().logEvent('delete_quest_error', {error: error.message});
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['homeQuests']});
    },
  });

  const {mutate: saveQuest} = useMutation({
    mutationFn: async (questId: number) => {
      const response = await instance.post(`/quest/${questId}/bookmark`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['verification']});
      queryClient.invalidateQueries({queryKey: ['myBookmarkCount']});
      Alert.alert('저장되었습니다!');
      setShowSettings(false);
    },
    onError: (error: any) => {
      error.response?.data.status == 400
        ? cancelSaveQuest(quest.id)
        : Alert.alert(error.response?.data.message);
    },
  });

  const {mutate: cancelSaveQuest} = useMutation({
    mutationFn: async (questId: number) => {
      const response = await instance.delete(`/quest/${questId}/bookmark`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['verification']});
      queryClient.invalidateQueries({queryKey: ['myBookmarkCount']});
      Alert.alert('저장을 취소했습니다');
      setShowSettings(false);
    },
    onError: (error: any) => {
      Alert.alert(error.response.data.message);
    },
  });

  const handleQuickSubmit = useCallback(
    (text: string) => {
      Keyboard.dismiss();
      mutate({
        questId: quest.id,
        text: text,
        images: [], // 간편 입력은 이미지 없음
      });
    },
    [quest.id, mutate],
  );

  const handleAddRecord = useCallback(async () => {
    if (!newRecordText.trim() && images.length === 0) {
      Alert.alert('기록할 내용을 입력해주세요.');
      return;
    }
    if (checkForProfanity(newRecordText)) {
      Alert.alert('부적절한 단어', '기록에 부적절한 단어가 포함되어 있습니다.');
      return;
    }
    mutate({
      questId: quest.id,
      text: newRecordText,
      images,
    });
    setNewRecordText('');
    setImages([]);
  }, [newRecordText, images, quest.id, mutate]);

  const sections = useMemo(() => {
    if (!questRecord) return [];
    return groupRecordsByDate(questRecord);
  }, [questRecord]);

  useEffect(() => {
    if (sections.length > 0) {
      setTimeout(() => {
        sectionListRef.current?.scrollToLocation({
          sectionIndex: 0,
          itemIndex: 0,
          animated: true,
        });
      }, 100);
    }
  }, [sections]);

  const handleDeleteQuest = (questId: number) => {
    Alert.alert('퀘스트 삭제!', '퀘스트를 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: () => {
          deleteQuest(questId);
          navigation.goBack();
        },
      },
    ]);
  };

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
      const offset = insets.bottom + TAB_BAR_HEIGHT;
      startAnimation(-e.endCoordinates?.height + offset);
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

  const handleStampFinish = () => {
    setShowStamp(false);
    queryClient.invalidateQueries({queryKey: ['QuestRecord', quest.id]});
    queryClient.invalidateQueries({queryKey: ['homeQuests']});
  };

  const handleCompleteQuest = () => {
    Alert.alert('퀘스트 완료', '이 퀘스트를 완료하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '완료',
        onPress: () => {
          if (
            quest.verificationRequired == true &&
            quest.requiredVerification > quest.verificationCount
          ) {
            Alert.alert('인증이 완료되지 않았습니다');
            return;
          } else {
            completeQuest(quest.id, {
              onSuccess: () => {
                Alert.alert('성공', '퀘스트가 완료되었습니다!');
                navigation.goBack();
              },
              onError: error => {
                Alert.alert(`${error.response.data.message}`);
              },
            });
          }
        },
      },
    ]);
  };

  const handleVerificationQuest = () => {
    Alert.alert(
      '이 퀘스트를 인증받으시겠습니까?',
      '인증받기 시작하면 수정 및 삭제 할 수 없습니다',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '인증',
          onPress: () => {
            completeQuest(quest.id, {
              onSuccess: () => {
                Alert.alert('성공', '퀘스트를 인증받기 시작합니다!');
                navigation.goBack();
              },
              onError: error => {
                Alert.alert(`${error.response.data.message}`);
              },
            });
          },
        },
      ],
    );
  };

  const handleCamera = async () => {
    setIsModalVisible(false);

    setTimeout(async () => {
      const options: CameraOptions = {
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: true,
        quality: 1,
        includeBase64: false,
      };

      try {
        const response = await new Promise<ImagePickerResponse>(resolve =>
          launchCamera(options, resolve),
        );
        if (response.didCancel) {
          Alert.alert('이미지 촬영을 취소했습니다.');
        }
        if (response.errorCode) {
          Alert.alert('이미지 촬영 중 오류가 발생했습니다.');
        }
        if (response.assets?.length) {
          const compressedImages = await Promise.all(
            response.assets.map(async (asset: Asset) => {
              try {
                const result = await ImageCompressor.compress(asset.uri || '', {
                  maxWidth: 1000,
                  maxHeight: 1000,
                  quality: 0.8,
                  input: 'uri',
                });
                return {
                  ...asset,
                  uri: result,
                };
              } catch (error) {
                console.error(error);
              }
            }),
          );
          const validCompressedImages = compressedImages.filter(
            img => img !== undefined,
          );
          setImages(prev => [...prev, ...validCompressedImages].slice(0, 5));
        }
      } catch (error) {
        console.error(error);
        Alert.alert('이미지 처리하는 중 오류가 발생했습니다.');
      }
    }, 100);
  };

  const pickImage = async () => {
    setIsModalVisible(false);

    setTimeout(async () => {
      const options: any = {
        mediaType: 'photo',
        selectionLimit: 5 - images.length,
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.8, // 0-1 where 1 is best quality
        includeBase64: false,
      };
      try {
        const response = await new Promise<ImagePickerResponse>(resolve =>
          launchImageLibrary(options, resolve),
        );
        if (response.didCancel) {
          Alert.alert('이미지 선택을 취소했습니다.');
        }
        if (response.errorCode) {
          Alert.alert('이미지 선택 중 오류가 발생했습니다.');
        }
        if (response.assets?.length) {
          const compressedImages = await Promise.all(
            response.assets.map(async (asset: Asset) => {
              try {
                const result = await ImageCompressor.compress(asset.uri || '', {
                  maxWidth: 1000,
                  maxHeight: 1000,
                  quality: 0.8,
                  input: 'uri',
                });
                return {
                  ...asset,
                  uri: result,
                };
              } catch (error) {
                console.error(error);
              }
            }),
          );
          const validCompressedImages = compressedImages.filter(
            img => img !== undefined,
          );
          setImages(prev => [...prev, ...validCompressedImages].slice(0, 5));
        }
      } catch (error) {
        console.error(error);
        Alert.alert('이미지 처리하는 중 오류가 발생했습니다.');
      }
    }, 100);
  };
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  const progressPercentage = useMemo(() => {
    if (!quest.startDate || !quest.endDate) return 0;

    const start = new Date(quest.startDate).getTime();
    const end = new Date(quest.endDate).getTime();
    const now = new Date().getTime();

    const totalDuration = end - start;
    const elapsed = now - start;

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }, [quest.startDate, quest.endDate]);

  const CARD_WIDTH = width - 32;
  

  const scrollToDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const targetTitle = `${year}년 ${month}월 ${day}일`;
    const sectionIndex = sections.findIndex(
      section => section.title === targetTitle,
    );
    if (sectionIndex >= 0) {
      setTimeout(() => {
        sectionListRef.current?.scrollToLocation({
          sectionIndex,
          itemIndex: 0,
          viewPosition: 0,
          animated: true,
        });
      }, 100);
    } else {
      console.log('Section not found');
    }
  };

  const handleDateSelect = useCallback(
    (dateString: string) => {
      setSelectedDate(dateString);
      setIsMonthView(false);
      setTimeout(() => scrollToDate(dateString), 100);
    },
    [sections],
  );
  const checkIsBeforeStart = (dateString: string) => {
    if (!quest.startDate) return false;
    // quest.startDate의 시간 부분을 제거하고 날짜만 비교하기 위해 startOfDay 사용
    return isBefore(parseISO(dateString), startOfDay(quest.startDate));
  };
  const questHeader = useMemo(
    () => (
      <View>
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
                width: CARD_WIDTH,
              }}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={{padding: 10}}>
                <Icon
                  name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}
                  size={20}
                  color={colors.font}
                />
              </Pressable>
              <Text style={styles.questTitle}>{quest.title}</Text>
              <TouchableOpacity
                style={{width: 40}}
                onPress={() => setShowSettings(true)}>
                <Icon name="more-vert" size={24} color={colors.font} />
              </TouchableOpacity>
            </View>
            <Text style={styles.questDate}>
              {formatDate(quest.startDate.toString())} -{' '}
              {formatDate(quest.endDate.toString())}
            </Text>
            <View
              style={{width: '100%', paddingHorizontal: 10, marginTop: 10}}>
              <AnimatedProgressTrack progress={progressPercentage} />
            </View>
          </View>
        </View>
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeaderRow}>
            <Text style={styles.sectionTitle}>
              {isMonthView ? '월간 기록' : '주간 기록'}
            </Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsMonthView(!isMonthView)}>
              <Text style={styles.toggleText}>
                {isMonthView ? '접기 (주간)' : '펼치기 (월간)'}
              </Text>
              <Icon
                name={isMonthView ? 'expand-less' : 'expand-more'}
                size={20}
                color={colors.gray}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarContainer}>
            {isMonthView ? (
              <Calendar
                key={selectedDate.substring(0, 7)}
                initialDate={selectedDate}
                onMonthChange={(month: DateData) => {
                  setSelectedDate(month.dateString);
                }}
                onDayPress={(day: DateData) => {
                  if (!checkIsBeforeStart(day.dateString)) {
                    handleDateSelect(day.dateString);
                  }
                }}
                markingType={'custom'}
                markedDates={markedDates}
                dayComponent={({date, state, marking}: any) => (
                  <PicoDay
                    date={date}
                    state={state}
                    marking={marking}
                    onPress={d => handleDateSelect(d.dateString)}
                    isBeforeStart={checkIsBeforeStart(date.dateString)}
                  />
                )}
                theme={calendarTheme}
              />
            ) : (
              <View style={styles.weekViewContainer}>
                {weekDays.map(item => {
                  const isSelected = item.dateString === selectedDate;
                  const hasRecord =
                    markedDates[item.dateString]?.dots?.length > 0;
                  const toDateData = (dateString: string): DateData => {
                    const parsed = parseISO(dateString);
                    return {
                      dateString,
                      day: parsed.getDate(),
                      month: parsed.getMonth() + 1,
                      year: parsed.getFullYear(),
                      timestamp: parsed.getTime(),
                    };
                  };

                  const getDayState = (dateString: string) => {
                    const date = parseISO(dateString);
                    if (dateString === selectedDate) return 'selected';
                    if (isToday(date)) return 'today';
                    if (isAfter(date, new Date())) return 'disabled';
                    return 'active';
                  };
                  return (
                    <PicoDay
                      key={item.dateString}
                      date={toDateData(item.dateString)}
                      state={getDayState(item.dateString)}
                      marking={markedDates[item.dateString]}
                      onPress={({dateString: ds}) => handleDateSelect(ds)}
                      isBeforeStart={checkIsBeforeStart(item.dateString)}
                    />
                  );
                })}
              </View>
            )}
          </View>
        </View>
        <View style={{paddingHorizontal: 20, paddingTop: 20}}>
          <Text style={styles.sectionTitle}>기록 타임라인</Text>
        </View>
      </View>
    ),
    [
      quest,
      progressPercentage,
      isMonthView,
      selectedDate,
      markedDates,
      weekDays,
      CARD_WIDTH,
      handleDateSelect,
    ],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text>로딩 중... 조금만 기다려주세요</Text>
      </SafeAreaView>
    );
  }

  if (!isLoading && !quest) {
    return (
      <View style={styles.centerContainer}>
        <Text>퀘스트를 찾을 수 없습니다.</Text>
      </View>
    );
  }


  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="access-time" size={50} color={colors.font} />
      <Text style={styles.emptyStateText}>아직 기록이 없습니다.</Text>
      <Text style={styles.emptyStateSubtext}>
        {questParam.verificationRequired
          ? '기록이 하나 이상이고 완료 날짜가 지나야 인증을 받을 수 있습니다!'
          : '기록이 하나 이상이고 완료 날짜가 지나야 완료할 수 있습니다!'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        ref={sectionListRef}
        sections={sections}
        ListHeaderComponent={questHeader}
        ListEmptyComponent={renderEmptyState}
        renderSectionHeader={({section: {title}}) => (
          <View style={styles.dateHeaderContainer}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateHeaderText}>{title}</Text>
            </View>
          </View>
        )}
        renderItem={({item}) => {
          const hasImages = item.images && item.images.length > 0;
          return (
            <View style={styles.recordItemContainer}>
              <View style={styles.recordCard}>
                {hasImages && (
                  <View style={styles.cardImageContainer}>
                    <ImageCarousel
                      images={item.images}
                      containerWidth={CARD_WIDTH}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.cardContentContainer,
                    !hasImages && styles.cardContentNoImage,
                  ]}>
                  {/* 글 내용 */}
                  {item.text ? (
                    <Text
                      style={styles.recordText}
                      ellipsizeMode="tail"
                      numberOfLines={2}>
                      {item.text}
                    </Text>
                  ) : null}
                  <Text style={styles.recordDate}>
                    {formatRelativeTime(item.createdAt.toString())}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          !!keyboardHeight && {paddingBottom: keyboardHeight + 120},
        ]}
        keyboardShouldPersistTaps="always"
        stickySectionHeadersEnabled={true} // 스크롤 시 날짜가 상단에 고정되는 효과 (false면 같이 스크롤됨)
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            sectionListRef.current?.scrollToLocation({
              sectionIndex: info.index,
              itemIndex: 0,
              animated: true,
            });
          });
        }}
      />

      {/* Input Container (Footer) - 기존과 동일하게 Absolute Position 유지 */}
      {(quest.procedure === 'progress' || quest.procedure === 'verify') && (
        <Animated.View
          style={[
            styles.inputContainer,
            {transform: [{translateY: keyboardOffset}]},
          ]}>
          {(keyboardHeight > 0 || isCreatingRecord) && (
            <View style={styles.quickInputContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="always">
                {QUICK_INPUTS.map(input => (
                  <Pressable
                    key={input.id}
                    style={styles.quickButton}
                    onPress={() => {
                      handleQuickSubmit(input.text);
                    }}
                    disabled={isCreatingRecord}>
                    <Text style={styles.quickButtonText}>{input.text}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          {/* ... 이미지 프리뷰, 입력창, 버튼들 (기존 코드 그대로) ... */}
          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <TouchableOpacity
                  key={`image-${index}-${image}`}
                  onPress={() => removeImage(index)}
                  style={styles.imageWrapper}>
                  <Image
                    source={{uri: image.uri}}
                    style={styles.imagePreview}
                    placeholder={blurhash}
                    transition={1000}
                  />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImages([])}>
                <Icon name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
          <View style={[styles.inputRow]}>
            <TextInput
              style={styles.input}
              placeholder="오늘의 활동을 기록하세요..."
              placeholderTextColor={colors.gray}
              value={newRecordText}
              onChangeText={setNewRecordText}
              multiline
              editable={!isCreatingRecord}
              maxLength={350}
              autoComplete="off"
              textContentType="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setIsModalVisible(true)}
              disabled={isCreatingRecord}>
              <Icon name="camera-alt" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={
                questRecord?.length > 0 && new Date(quest.endDate) < new Date()
                  ? [styles.actionButton, styles.completeButton]
                  : [
                      styles.actionButton,
                      styles.completeButton,
                      {backgroundColor: colors.lightGray},
                    ]
              }
              onPress={
                questParam.verificationRequired &&
                questParam.procedure === 'progress'
                  ? handleVerificationQuest
                  : handleCompleteQuest
              }
              disabled={
                questRecord?.length === 0 ||
                new Date(quest.endDate) > new Date()
              }>
              <Icon name="check-circle" size={18} color="white" />
              {questParam.verificationRequired &&
              questParam.procedure === 'progress' ? (
                <Text style={styles.completeButtonText}>인증받기</Text>
              ) : (
                <Text style={styles.completeButtonText}>완료하기</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.addButton,
                !newRecordText.trim() &&
                  images.length === 0 && {
                    backgroundColor: colors.lightGray,
                  },
              ]}
              onPress={handleAddRecord}
              disabled={!newRecordText.trim() && images.length === 0}>
              <Icon name="add" size={18} color="white" />
              <Text style={styles.addButtonText}>기록 추가</Text>
            </TouchableOpacity>
          </View>
          {isCreatingRecord && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>기록을 업로드 중입니다...</Text>
            </View>
          )}
        </Animated.View>
      )}
      <ImagePickerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onCamera={handleCamera}
        onGallery={pickImage}
      />
      <BottomSheet
        questToEdit={quest}
        todoModalVisible={isEditQuest}
        settodoModalVisible={setIsEditQuest}
        isMainQuest={quest.isMain}
      />
      <ActionStamp visible={showStamp} onAnimationFinish={handleStampFinish} />
      <Modal
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
        animationType="slide"
        transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flexEnd}>
          <TouchableWithoutFeedback onPress={() => setShowSettings(false)}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>퀘스트 설정</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => saveQuest(quest.id)}>
              <Icon name="bookmark" size={24} color={colors.font} />
              <Text style={styles.optionText}>저장하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowSettings(false);
                setIsEditQuest(true);
              }}>
              <Icon name="edit" size={24} color={colors.font} />
              <Text style={styles.optionText}>수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleDeleteQuest(quest.id)}>
              <Icon name="delete" size={24} color={'red'} />
              <Text style={[styles.optionText, {color: 'red'}]}>삭제하기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const calendarTheme = {
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: '#ffffff',
  todayTextColor: colors.primary,
  arrowColor: colors.primary,
  dotColor: colors.primary,
  stylesheet: {
    calendar: {
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 8,
        paddingRight: 8,
        marginTop: 6,
        alignItems: 'center',
      },
    },
  },
};

const styles = StyleSheet.create({
  flexEnd: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 22,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.gray,
    borderRadius: 2.5,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    width: '100%',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.font,
    marginLeft: 12,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  header: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  mainQuestHeader: {
    backgroundColor: colors.background,
  },
  subQuestHeader: {
    backgroundColor: colors.background,
  },
  headerContent: {
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.font,
    marginBottom: 5,
    textAlign: 'center',
  },
  questDate: {
    fontSize: 14,
    color: colors.gray,
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
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    marginLeft: 10,
    fontSize: 12,
    color: colors.font,
    minWidth: 50,
    textAlign: 'right',
  },
  calendarSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  toggleText: {
    fontSize: 13,
    color: colors.gray,
    marginRight: 4,
    fontWeight: '500',
  },
  calendarContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  weekViewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  weekDayItem: {alignItems: 'center', padding: 8, borderRadius: 12, width: 45},
  weekDayItemSelected: {backgroundColor: colors.primary},
  weekDayText: {fontSize: 12, color: colors.gray, marginBottom: 4},
  weekDayTextSelected: {color: 'white', fontWeight: 'bold'},
  dayText: {fontSize: 16, fontWeight: '600', color: colors.font},
  dayTextSelected: {color: 'white'},
  dot: {width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary},
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.font,
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
    marginHorizontal: 16,
  },
  emptyStateText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.font,
  },
  emptyStateSubtext: {
    marginTop: 12,
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 16, // 조금 더 둥글게
    marginBottom: 12,
    // 그림자 (iOS/Android 공통 느낌)
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden', // 이미지가 둥근 모서리를 넘어가지 않도록 자름
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordDate: {
    marginTop: 14,
    fontSize: 12,
    color: colors.gray,
  },
  cardImageContainer: {
    width: '100%',
    backgroundColor: colors.background, // 로딩 전 배경색
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    //height: '50%',
  },
  cardContentContainer: {
    padding: 16, // 글자 영역에만 패딩을 줌
  },
  // 이미지가 없을 때 위쪽 패딩을 좀 더 줘서 답답하지 않게
  cardContentNoImage: {
    paddingTop: 24,
  },
  recordText: {
    fontSize: 15,
    lineHeight: 24, // 줄 간격을 넉넉하게 (중요)
    color: '#333333',
    letterSpacing: -0.2,
  },
  quickInputContainer: {
    marginBottom: 12,
    height: 40,
  },
  quickButton: {
    backgroundColor: '#FFF8E1', // 연한 노란색 (테마에 맞게 조정)
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 8,
    justifyContent: 'center',
  },
  quickButtonText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
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
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingRight: 45,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#ffffff',
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
    borderRadius: 12,
    marginHorizontal: 5,
  },
  completeButton: {
    backgroundColor: colors.accent,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  completeButtonText: {
    color: colors.btnFont,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  addButtonText: {
    color: colors.btnFont,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loadingText: {
    color: colors.font,
    marginLeft: 8,
  },
  dateHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background, // 배경색을 맞춰주어야 스크롤 시 겹쳐 보이지 않음
    alignItems: 'flex-start',
  },
  dateBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.font,
  },
  recordItemContainer: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 200, // InputContainer 공간 확보
  },
  menuOptions: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 120,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuOption: {
    padding: 10,
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});

const picoStyles = StyleSheet.create({
  dayContainer: {
    width: 42,
    height: 58,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    paddingVertical: 2,
  },
  daySelected: {
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayText: {fontSize: 11, color: '#9BA0A8'},
  dayToday: {color: colors.primary, fontWeight: '700'},
  dayDisabled: {color: '#D8DDE5'},
  stickerWrap: {
    width: 30,
    height: 30,
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sticker: {width: 24, height: 24, opacity: 0.6},
  completedSticker: {width: 26, height: 26, opacity: 1},
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 3,
  },
});

export default QuestFeed;
