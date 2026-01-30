import React, {useEffect} from 'react';
import {View, Dimensions, StyleSheet, Image} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// 1. 에셋 로드
const PICO_START = require('../assets/character/pico_start.png');
const PICO_SMILE = require('../assets/character/pico_smile.png');

const SCREEN_WIDTH = Dimensions.get('window').width;
const TRACK_WIDTH = SCREEN_WIDTH - 40; // 좌우 패딩 20px씩 가정

interface Props {
  progress: number; // 0 ~ 100
}

export const AnimatedProgressTrack = ({progress}: Props) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 2. 진행률에 따른 X축 이동
  useEffect(() => {
    const targetX = (progress / 100) * (TRACK_WIDTH - 50); // 50은 피코 이미지 너비
    translateX.value = withSpring(targetX, {damping: 15, stiffness: 90});
  }, [progress]);

  // 3. 둥실둥실 숨쉬기 애니메이션
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-5, {duration: 1000, easing: Easing.inOut(Easing.quad)}),
        withTiming(0, {duration: 1000, easing: Easing.inOut(Easing.quad)}),
      ),
      -1,
      true,
    );
  }, []);

  const picoStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}, {translateY: translateY.value}],
  }));

  const activeLineStyle = useAnimatedStyle(() => ({
    width: translateX.value + 25, // 피코 중심까지 라인 채움
  }));

  return (
    <View style={styles.container}>
      {/* 회색 배경 트랙 */}
      <View style={styles.trackLine} />

      {/* 노란색 진행 바 */}
      <Animated.View style={[styles.activeLine, activeLineStyle]} />

      {/* 달리는 피코 */}
      <Animated.View style={[styles.picoWrapper, picoStyle]}>
        <Image
          source={progress >= 100 ? PICO_SMILE : PICO_START}
          style={styles.picoImage}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    marginBottom: 20,
  },
  trackLine: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '100%',
    position: 'absolute',
    bottom: 10,
  },
  activeLine: {
    height: 8,
    backgroundColor: '#FFD700', // GoalWith 테마 컬러
    borderRadius: 4,
    position: 'absolute',
    bottom: 10,
    left: 0,
  },
  picoWrapper: {
    position: 'absolute',
    bottom: 14, // 트랙 위에 살짝 걸치도록
    width: 50,
    height: 50,
    zIndex: 10,
  },
  picoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
