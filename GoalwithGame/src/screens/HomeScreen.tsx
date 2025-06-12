import React, { ReactElement, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useAppContext } from '../contexts/AppContext';
import CharacterAvatar from '../components/CharacterAvatar';
import Logo from '../components/Logo';

interface RootStackParamList {
  Home: undefined;
  QuestVerification: { questId: string };
  QuestDetail: { questId: string };
  [key: string]: object | undefined; // Index signature for navigation compatibility
}

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Define a base quest type with required properties
type BaseQuest = {
  id: string;
  title: string;
  isMain: boolean;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  completed?: boolean;
};

// Extend the base quest type with optional properties
type Quest = BaseQuest & {
  description?: string;
  status?: 'in_progress' | 'completed' | 'failed' | string;
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  reward?: {
    experience?: number;
    gold?: number;
    [key: string]: any;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Allow for additional properties
  [key: string]: any;
};

// User type with all possible properties
type User = {
  id: string;
  name: string;
  level: number;
  // Make experience and maxExperience required
  experience: number;
  maxExperience: number;
  // Keep other properties as optional with type assertions where needed
  currentExp?: number;
  maxExp?: number;
  character?: string;
  actionPoints?: number;
  // Add any additional user properties here
  [key: string]: any; // Allow for additional properties
};

// Default user object to ensure required properties exist
const defaultUser: User = {
  id: '',
  name: 'User',
  level: 1,
  experience: 0,
  maxExperience: 100,
  currentExp: 0, // Initialize required property
  maxExp: 100, // Initialize required property
  character: '👤',
  actionPoints: 0
};


const HomeScreen = (): ReactElement => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, quests, addQuest } = useAppContext();
  const bottomSheetRef = useRef<any>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [snapPoints] = useState(['90%']);

  // State for quest form
  const [isMainQuest, setIsMainQuest] = useState(true);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDescription, setNewQuestDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to 1 week from now
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [reward, setReward] = useState('');
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [requiredVerifications, setRequiredVerifications] = useState(3);
  const [category, setCategory] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Use default user if user is not available
  const safeUser = user || defaultUser;
  
  // Calculate user level progress with safe defaults
  const userLevel = safeUser.level || 1;
  // Use the experience and maxExperience properties with type assertions
  const currentExp = (safeUser as any).experience ?? 0;
  const maxExp = (safeUser as any).maxExperience ?? 100;
  const progress = Math.min((currentExp / Math.max(maxExp, 1)) * 100, 100);

  // Get main quest and sub-quests with type safety
  const mainQuest = quests.find((quest: Quest) => quest.isMain);
  const subQuests = quests.filter((quest: Quest) => !quest.isMain).slice(0, 5);


  // Handle submitting a new quest
  const handleSubmitQuest = useCallback(() => {
    if (newQuestTitle.trim() === '') {
      Alert.alert('오류', '퀘스트 제목을 입력해주세요');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('오류', '종료일은 시작일 이후여야 합니다');
      return;
    }

    if (verificationRequired && requiredVerifications < 1) {
      Alert.alert('오류', '필요 인증 횟수는 1회 이상이어야 합니다');
      return;
    }

    const newQuest = {
      title: newQuestTitle,
      description: newQuestDescription || '',
      isMain: isMainQuest,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      difficulty,
      reward: reward ? parseInt(reward, 10) : 0,
      category: category || null,
      completed: false,
      verificationRequired,
      verificationCount: 0,
      requiredVerifications: verificationRequired ? requiredVerifications : 0,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addQuest(newQuest);
    
    // Reset form
    setNewQuestTitle('');
    setNewQuestDescription('');
    setReward('');
    setVerificationRequired(false);
    setRequiredVerifications(3);
    setCategory('');
    
    Keyboard.dismiss();
    closeDatePickers();
    bottomSheetRef.current?.close();
    
  }, [
    newQuestTitle, 
    newQuestDescription, 
    isMainQuest, 
    startDate, 
    endDate, 
    difficulty,
    reward,
    category,
    verificationRequired,
    requiredVerifications,
    addQuest
  ]);

  // Handle date change for date pickers
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
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

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
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

  // Handle closing the bottom sheet
  const handleCloseBottomSheet = useCallback(() => {
    // Dismiss the keyboard
    Keyboard.dismiss();
    closeDatePickers();
    // Reset all form states
    setNewQuestTitle('');
    setNewQuestDescription('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setVerificationRequired(false);
    setRequiredVerifications(3);
    setCategory('');
    // Close the bottom sheet
    setIsBottomSheetOpen(false);
  }, [closeDatePickers]);

  // Track bottom sheet state changes
  React.useEffect(() => {
    console.log('BottomSheet mounted');
    
    const checkState = () => {
      if (!bottomSheetRef.current) return;
      
      // Try to get the current state
      const currentState = bottomSheetRef.current.state?.index !== -1;
      if (currentState !== isBottomSheetOpen) {
        console.log('BottomSheet state changed to:', currentState ? 'OPEN' : 'CLOSED');
        setIsBottomSheetOpen(currentState);
      }
    };
    
    // Initial check after a short delay
    const timer = setTimeout(checkState, 100);
    
    // Check state periodically
    const interval = setInterval(checkState, 500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isBottomSheetOpen]);

  // Handle opening the bottom sheet for adding a new quest
  const handleAddQuest = useCallback((isMain: boolean) => {
    // Check if we can add more quests
    if (isMain && quests.some(q => q.isMain)) {
      Alert.alert('Error', '메인 퀘스트는 하나씩만 생성 가능합니다');
      return;
    } else if (!isMain && quests.filter(q => !q.isMain).length >= 5) {
      Alert.alert('Error', '서브 퀘스트는 최대 5개까지만 생성 가능합니다');
      return;
    }
    
    // Reset form state
    setIsMainQuest(isMain);
    setNewQuestTitle('');
    setNewQuestDescription('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setVerificationRequired(false);
    setRequiredVerifications(3);
    setCategory('');
    closeDatePickers();
    Keyboard.dismiss();
    
    // Open the bottom sheet after a small delay
    setTimeout(() => {
      setIsBottomSheetOpen(true);
    }, 50);
  }, [quests, closeDatePickers]);

  // Render backdrop for bottom sheet
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={handleCloseBottomSheet}
      />
    ),
    [handleCloseBottomSheet]
  );

  // Handle quest completion with verification
  const handleCompleteQuest = (quest: Quest) => {
    // If verification is required, navigate to verification screen
    if (quest.verificationRequired) {
      navigation.navigate('QuestVerification', { questId: quest.id } as any);
    } else {
      // Otherwise, complete the quest directly
      // @ts-ignore - completeQuest will be available from AppContext
      //completeQuest(quest.id);
      Alert.alert('퀘스트 완료!', '퀘스트를 완료했습니다!');
    }
  };

  // Handle quest press
  const handleQuestPress = useCallback((questId: string) => {
    // Navigate to quest detail screen
    navigation.navigate('QuestVerification', { questId });
  }, [navigation]);

  // Handle quest detail press
  const handleQuestDetailPress = useCallback((questId: string) => {
    navigation.navigate('QuestDetail', { questId });
  }, [navigation]);

  // Get status color based on quest status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#F44336';
      case 'in_progress':
      default:
        return '#FFC107';
    }
  };

  // Render a single quest item with null checks
  const renderQuestItem = (quest: Quest | undefined, isMain: boolean = false) => {
    if (!quest) return null;
    
    const startDate = quest.startDate ? new Date(quest.startDate).toLocaleDateString() : 'No start date';
    const endDate = quest.endDate ? new Date(quest.endDate).toLocaleDateString() : 'No end date';
    
    const cardStyle = [
      styles.questCard,
      isMain ? styles.mainQuestCard : styles.subQuestCard
    ];
    
    return (
      <TouchableOpacity 
        key={quest.id}
        style={styles.questCard}
        onPress={() => handleQuestDetailPress(quest.id)}
      >
        <View style={styles.questHeader}>
          <Text style={styles.questTitle}>{quest.title || 'Untitled Quest'}</Text>
          {quest.description && <Text style={styles.questDescription}>{quest.description}</Text>}
        </View>
        <View style={styles.questFooter}>
          <Text style={styles.questDate}>
            {startDate} - {endDate}
          </Text>
          {quest.status && (
            <View style={[styles.questStatus, { backgroundColor: getStatusColor(quest.status) }]} />
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.completeButton, 
            (quest.completed || quest.verificationCount >= quest.requiredVerifications) && styles.completedButton
          ]} 
          onPress={() => handleCompleteQuest(quest)}
          disabled={quest.completed || quest.verificationCount >= quest.requiredVerifications}
        >
          <Text style={styles.completeButtonText}>
            {quest.completed || quest.verificationCount >= quest.requiredVerifications 
              ? quest.verificationCount >= quest.requiredVerifications 
                ? '인증 완료' 
                : '완료됨' 
              : '완료하기'}
            {quest.verificationRequired && !quest.completed && ` (${quest.verificationCount}/${quest.requiredVerifications})`}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = (isMain: boolean) => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name={isMain ? 'emoji-events' : 'check-circle-outline'}
        size={48}
        color="#adb5bd"
        style={styles.emptyStateIcon}
      />
      <Text style={styles.emptyStateText}>
        {isMain ? '메인 퀘스트를 생성해보세요' : '서브 퀘스트를 생성해보세요'}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {isMain 
          ? '단 하나의 메인 퀘스트만 생성할 수 있습니다'
          : '마음껏 서브 퀘스트를 생성해보세요'}
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddQuest(isMain)}
      >
        <Text style={styles.addButtonText}>
          {isMain ? '메인 퀘스트 추가' : '서브 퀘스트 추가'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Handle keyboard show/hide
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle reward input with number validation
  const handleRewardChange = (text: string) => {
    // Only allow numbers
    if (text === '' || /^\d+$/.test(text)) {
      setReward(text);
    }
  };

  // Handle verification requirement toggle
  const toggleVerification = () => {
    setVerificationRequired(!verificationRequired);
  };

  // Bottom sheet content
  const renderBottomSheetContent = () => (
    <SafeAreaView style={styles.bottomSheetContent}>
      {/* Header with buttons */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => bottomSheetRef.current?.close()}
          style={styles.headerButton}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.bottomSheetTitle}>
          {isMainQuest ? '메인 퀘스트 추가' : '서브 퀘스트 추가'}
        </Text>
        <TouchableOpacity 
          onPress={handleSubmitQuest}
          style={[styles.headerButton, (!newQuestTitle.trim() || (verificationRequired && requiredVerifications < 1)) && { opacity: 0.5 }]}
          disabled={!newQuestTitle.trim() || (verificationRequired && requiredVerifications < 1)}
        >
          <Text style={styles.doneButtonText}>완료</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollViewContent]}
      >
        {/* Quest Title */}
        <Text style={styles.inputLabel}>퀘스트 제목*</Text>
        <BottomSheetTextInput
          style={styles.input}
          placeholder="퀘스트 제목을 입력하세요"
          value={newQuestTitle}
          onChangeText={setNewQuestTitle}
          autoFocus
          returnKeyType="next"
          maxLength={50}
        />
        
        {/* Difficulty Selection */}
        <Text style={styles.inputLabel}>난이도</Text>
        <View style={styles.difficultyContainer}>
          {['easy', 'normal', 'hard'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyButton,
                difficulty === level && styles[`${level}ButtonActive`],
              ]}
              onPress={() => setDifficulty(level as 'easy' | 'normal' | 'hard')}
            >
              <Text style={[
                styles.difficultyText,
                difficulty === level && styles[`${level}Text`]
              ]}>
                {level === 'easy' ? '쉬움' : level === 'normal' ? '보통' : '어려움'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Range */}
        <View style={styles.dateRangeContainer}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.inputLabel}>시작일</Text>
            <TouchableOpacity 
              style={styles.dateInput} 
              onPress={() => toggleDatePicker(true)}
            >
              <MaterialIcons name="event" size={18} color="#666" style={styles.dateIcon} />
              <Text style={styles.dateText}>{startDate.toLocaleDateString('ko-KR')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateInputContainer}>
            <Text style={styles.inputLabel}>종료일</Text>
            <TouchableOpacity 
              style={styles.dateInput} 
              onPress={() => toggleDatePicker(false)}
            >
              <MaterialIcons name="event" size={18} color="#666" style={styles.dateIcon} />
              <Text style={styles.dateText}>{endDate.toLocaleDateString('ko-KR')}</Text>
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

        {/* Quest Description */}
        <Text style={styles.inputLabel}>상세 설명</Text>
        <BottomSheetTextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="퀘스트에 대한 상세한 설명을 입력하세요"
          value={newQuestDescription}
          onChangeText={setNewQuestDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
          blurOnSubmit={true}
        />

        {/* Reward */}
        <Text style={styles.inputLabel}>보상 (XP)</Text>
        <View style={styles.rewardContainer}>
          <TextInput
            style={[styles.input, styles.rewardInput]}
            placeholder="0"
            value={reward}
            onChangeText={handleRewardChange}
            keyboardType="number-pad"
            returnKeyType="done"
          />
          <Text style={styles.xpText}>XP</Text>
        </View>

        {/* Verification Required */}
        <View style={styles.verificationContainer}>
          <View style={styles.verificationHeader}>
            <Text style={styles.inputLabel}>인증 필요</Text>
            <Switch
              value={verificationRequired}
              onValueChange={toggleVerification}
              trackColor={{ false: '#ddd', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>
          
          {verificationRequired && (
            <View style={styles.verificationSettings}>
              <Text style={styles.verificationLabel}>필요 인증 횟수</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => setRequiredVerifications(prev => Math.max(1, prev - 1))}
                  disabled={requiredVerifications <= 1}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{requiredVerifications}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => setRequiredVerifications(prev => prev + 1)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Category (optional) */}
        <Text style={styles.inputLabel}>카테고리 (선택사항)</Text>
        <View style={styles.categoryContainer}>
          {['운동', '공부', '생활', '취미', '기타'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.categoryTextActive,
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Character and Stats Section */}
        <Logo resizeMode="contain" style={{ width: 150, height: 45, marginBottom:16 }}/>
        <View style={styles.characterContainer}>
          <CharacterAvatar size={150} level={user?.level} />
          <View style={styles.statsContainer}>
            <Text style={styles.welcomeText}>안녕하세요, {user?.name}님!</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>레벨</Text>
                <Text style={styles.statValue}>Lv. {user?.level || 1}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>실행력</Text>
                <Text style={styles.statValue}>{(user?.level || 1) * 10} 점</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(progress, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {`${currentExp} / ${maxExp} XP`}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Quest Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>메인 퀘스트</Text>
            <TouchableOpacity onPress={() => handleAddQuest(true)}>
              <Text style={styles.sectionLink}>+ 추가</Text>
            </TouchableOpacity>
          </View>
          {mainQuest ? (
            renderQuestItem(mainQuest, true)
          ) : (
            renderEmptyState(true)
          )}
        </View>

        {/* Sub-Quests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>서브 퀘스트</Text>
            <TouchableOpacity onPress={() => handleAddQuest(false)}>
              <Text style={styles.sectionLink}>+ 추가</Text>
            </TouchableOpacity>
          </View>
          {subQuests.length > 0 ? (
            <>
              {subQuests.map(quest => renderQuestItem(quest, false))}
              <TouchableOpacity style={styles.addQuestButton}>
                <Text style={styles.addButtonText}>새로운 퀘스트 추가하기</Text>
              </TouchableOpacity>
            </>
          ) : (
            renderEmptyState(false)
          )}
        </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      
      {/* Bottom Sheet for Adding Quests */}
      <BottomSheet
        ref={bottomSheetRef}
        index={isBottomSheetOpen ? 0 : -1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        style={styles.bottomSheet}
        handleComponent={null}
        backgroundStyle={{ backgroundColor: 'white' }}
        enableHandlePanningGesture={true}
        enableContentPanningGesture={true}
        onClose={handleCloseBottomSheet}
        onChange={(index) => {
          // Only update state if it's different to prevent unnecessary re-renders
          if (index === -1 && isBottomSheetOpen) {
            handleCloseBottomSheet();
          } else if (index !== -1 && !isBottomSheetOpen) {
            setIsBottomSheetOpen(true);
          }
        }}
        animationConfigs={{
          damping: 30,  // 감쇠 효과 증가로 튕김 감소
          stiffness: 250,  // 스프링 강도 조정
          mass: 0.8  // 질량 감소로 더 빠른 감쇠
        }}
      >
        {renderBottomSheetContent()}
      </BottomSheet>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    padding:16
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 30,
  },
  headerContainer: {
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
  },
  doneButtonText: {
    color: '#4A80F5',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
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
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
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
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  easyButtonActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  normalButtonActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  hardButtonActive: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  difficultyText: {
    fontSize: 14,
    color: '#666',
  },
  easyText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  normalText: {
    color: '#1565C0',
    fontWeight: '600',
  },
  hardText: {
    color: '#C62828',
    fontWeight: '600',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  categoryTextActive: {
    color: '#1565C0',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  completedButton: {
    backgroundColor: '#9E9E9E',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 32,
  },
  characterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  statsContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    paddingRight: 16,
  },
  statItem: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 6,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
    minHeight: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionLink: {
    color: '#007AFF',
    fontSize: 14,
  },
  questCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainQuestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3', // Blue border for main quest
  },
  subQuestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0', // Gray border for sub-quests
  },
  questHeader: {
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  questStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#806a5b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  seeAll: {
    color: '#6c757d',
    fontSize: 14,
  },
  noQuestsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginVertical: 16,
  },
  addQuestButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  emptyStateIcon: {
    fontSize: 48,
    color: '#adb5bd',
  },
});

export default HomeScreen;
