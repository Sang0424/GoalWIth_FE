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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useAppContext } from '../contexts/AppContext';
import CharacterAvatar from '../components/CharacterAvatar';
import Character from '../components/Character';

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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isMainQuest, setIsMainQuest] = useState(true);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDescription, setNewQuestDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to 1 week from now
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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

  // Get border color based on user level (moved to CharacterAvatar)



  // Handle submitting a new quest
  const handleSubmitQuest = useCallback(() => {
    if (newQuestTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a quest title');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

      const newQuest = {
      title: newQuestTitle,
      description: newQuestDescription || '',
      isMain: isMainQuest,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      completed: false,
      verificationRequired: false,
      verificationCount: 0,
      requiredVerifications: 3
    };

    addQuest(newQuest);
    Keyboard.dismiss();
    closeDatePickers();
    bottomSheetRef.current?.close();
  }, [newQuestTitle, newQuestDescription, isMainQuest, startDate, endDate, addQuest]);

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
    // First dismiss the keyboard
    Keyboard.dismiss();
    closeDatePickers();
    
    // Wait for the keyboard to fully dismiss before closing the bottom sheet
    const keyboardDismissListener = Keyboard.addListener('keyboardDidHide', () => {
      keyboardDismissListener.remove();
      bottomSheetRef.current?.close();
    });
    
    // Fallback in case keyboard wasn't open
    setTimeout(() => {
      if (!keyboardDismissListener.remove) return;
      keyboardDismissListener.remove();
      bottomSheetRef.current?.close();
    }, 100);
  }, [closeDatePickers]);

  // Handle opening the bottom sheet for adding a new quest
  const handleAddQuest = useCallback((isMain: boolean) => {
    // Check if we can add more quests
    if (isMain && quests.some(q => q.isMain)) {
      Alert.alert('Error', 'You can only have one main quest');
      return;
    } else if (!isMain && quests.filter(q => !q.isMain).length >= 5) {
      Alert.alert('Error', 'You can have up to 5 sub-quests');
      return;
    }
    
    setIsMainQuest(isMain);
    setNewQuestTitle('');
    setNewQuestDescription('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    closeDatePickers();
    Keyboard.dismiss();
    bottomSheetRef.current?.expand();
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
        {isMain ? 'No main quest yet' : 'No sub-quests yet'}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {isMain 
          ? 'Add a main quest to get started!'
          : 'Add sub-quests to break down your goals'}
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddQuest(isMain)}
      >
        <Text style={styles.addButtonText}>
          {isMain ? 'Add Main Quest' : 'Add Sub-Quest'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Handle keyboard show/hide
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  // Bottom sheet content
  const renderBottomSheetContent = () => (
    <View style={styles.bottomSheetContent}>
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
          style={[styles.headerButton, !newQuestTitle.trim() && { opacity: 0.5 }]}
          disabled={!newQuestTitle.trim()}
        >
          <Text style={styles.doneButtonText}>완료</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={keyboardVisible ? styles.keyboardOpenContent : null}
      >
        <Text style={styles.inputLabel}>제목*</Text>
        <TextInput
          style={styles.input}
          placeholder="퀘스트 제목을 입력하세요"
          value={newQuestTitle}
          onChangeText={setNewQuestTitle}
          autoFocus
          returnKeyType="next"
        />
        
        <Text style={styles.inputLabel}>시작일</Text>
        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => toggleDatePicker(true)}
        >
          <Text style={styles.dateText}>{startDate.toLocaleDateString('ko-KR')}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="spinner"
            onChange={onStartDateChange}
            locale="ko-KR"
          />
        )}

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>종료일</Text>
        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => toggleDatePicker(false)}
        >
          <Text style={styles.dateText}>{endDate.toLocaleDateString('ko-KR')}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="spinner"
            onChange={onEndDateChange}
            minimumDate={startDate}
            locale="ko-KR"
          />
        )}

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>설명 (선택사항)</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="퀘스트에 대한 설명을 입력하세요"
          value={newQuestDescription}
          onChangeText={setNewQuestDescription}
          multiline
          numberOfLines={4}
          returnKeyType="done"
          blurOnSubmit={true}
        />
      </ScrollView>
    </View>
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
            <Text style={styles.sectionTitle}>Main Quest</Text>
            <TouchableOpacity onPress={() => handleAddQuest(true)}>
              <Text style={styles.sectionLink}>+ Add</Text>
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
            <Text style={styles.sectionTitle}>Sub-Quests</Text>
            <TouchableOpacity onPress={() => handleAddQuest(false)}>
              <Text style={styles.sectionLink}>+ Add</Text>
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
        index={-1}
        snapPoints={['90%']}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        style={styles.bottomSheet}
        handleComponent={null}
        backgroundStyle={{ backgroundColor: 'white' }}
        enableHandlePanningGesture={true}
        enableContentPanningGesture={true}
        onClose={handleCloseBottomSheet}
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  scrollView: {
    flex: 1,
  },
  keyboardOpenContent: {
    paddingBottom: 300, // Extra padding when keyboard is open
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginTop: 12,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  bottomSheetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  doneButtonText: {
    color: '#007AFF',
    fontSize: 16,
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
    backgroundColor: '#007AFF',
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
