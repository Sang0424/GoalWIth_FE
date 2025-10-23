import React, {useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  useWindowDimensions,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import instance from '../utils/axiosInterceptor';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {colors} from '../styles/theme';

// --- Type Definitions ---
export interface UserProfile {
  nickname: string;
  email: string;
  level: number;
  actionPoints: number;
  exp: number;
  userType: string;
  character: string; // URL
  badge: string;
  main_quest: {
    id: string;
    title: string;
    description: string;
    startDate: string; // ISO 8601 date string
    endDate: string; // ISO 8601 date string
    verificationRequired: boolean;
    verificationCount: number;
    requiredVerification: number;
  };
}

interface ProfileBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  userId: number | undefined;
}

// --- Component ---
const ProfileBottomSheet = ({
  visible,
  onClose,
  userId,
}: ProfileBottomSheetProps) => {
  const queryClient = useQueryClient();
  const {height: screenHeight} = useWindowDimensions();
  const translateY = useSharedValue(screenHeight);
  const context = useSharedValue({y: 0});

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const response = await instance.get(`/user/${userId}`);
      const user = response.data;
      return user;
    },
    enabled: userId !== undefined,
  });

  const closeModalWithAnimation = useCallback(() => {
    'worklet';
    translateY.value = withSpring(screenHeight, {damping: 1000}, () => {
      scheduleOnRN(onClose);
    });
  }, [onClose, screenHeight, translateY]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(screenHeight * 0.1, {damping: 1000}); // Show 90% of the screen
    } else {
      // This will be triggered by the visibility change, ensuring the modal closes
    }
  }, [visible, translateY, screenHeight]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {y: translateY.value};
    })
    .onUpdate(event => {
      translateY.value = Math.max(
        event.translationY + context.value.y,
        screenHeight * 0.1,
      );
    })
    .onEnd(event => {
      if (event.translationY > 100) {
        scheduleOnRN(onClose);
      } else {
        translateY.value = withSpring(screenHeight * 0.1, {damping: 1000});
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  if (!user) return null;

  return (
    <SafeAreaView>
      <TouchableWithoutFeedback
        onPress={() => {
          closeModalWithAnimation();
          Keyboard.dismiss();
        }}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        statusBarTranslucent>
        <View style={styles.overlay}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.bottomSheetContainer, animatedStyle]}>
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.grabber} />
                <ScrollView contentContainerStyle={styles.contentContainer}>
                  <View style={styles.profileHeader}>
                    <Image
                      source={{uri: user.character}}
                      style={styles.characterImage}
                    />
                    <View style={styles.profileInfo}>
                      <Text style={styles.nickname}>{user.nickname}</Text>
                      <Text style={styles.email}>{user.email}</Text>
                      <Text style={styles.userType}>{user.userType}</Text>
                    </View>
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Lv.</Text>
                      <Text style={styles.statValue}>{user.level}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>EXP</Text>
                      <Text style={styles.statValue}>{user.exp}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>실행력</Text>
                      <Text style={styles.statValue}>{user.actionPoints}</Text>
                    </View>
                  </View>

                  {user.main_quest && (
                    <View style={styles.questContainer}>
                      <Text style={styles.sectionTitle}>메인퀘스트</Text>
                      <View style={styles.questCard}>
                        <Text style={styles.questTitle}>
                          {user.main_quest.title ||
                            '아직 메인 퀘스트가 없습니다'}
                        </Text>
                        <Text style={styles.questDescription}>
                          {user.main_quest.description ||
                            '아직 메인 퀘스트가 없습니다'}
                        </Text>
                        <Text style={styles.questProgress}>
                          인증: {user.main_quest.verificationCount || 0} /{' '}
                          {user.main_quest.requiredVerification || 0}
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </SafeAreaView>
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    height: '90%',
    width: '100%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.switchBG,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  contentContainer: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  characterImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.font,
  },
  email: {
    fontSize: 14,
    color: colors.font,
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.switchBG,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: colors.font,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.font,
    marginBottom: 12,
  },
  questContainer: {},
  questCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.switchBG,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.font,
    marginBottom: 8,
  },
  questDescription: {
    fontSize: 14,
    color: colors.font,
    marginBottom: 12,
  },
  questProgress: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
});

export default ProfileBottomSheet;
