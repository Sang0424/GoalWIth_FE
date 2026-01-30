import React, {useEffect, useRef} from 'react';
import {Modal, View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';

// 🎬 준비한 Lottie 파일 경로
const SUCCESS_ANIMATION = require('../assets/lottie/GoalWith_Check.json');

interface Props {
  visible: boolean;
  onAnimationFinish: () => void;
}

export const ActionStamp = ({visible, onAnimationFinish}: Props) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      // 모달이 켜지면 애니메이션 0 프레임부터 재생
      animationRef.current?.play(0);
    } else {
      animationRef.current?.reset();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade" // 부드럽게 배경이 어두워짐
    >
      <View style={styles.overlay}>
        <LottieView
          ref={animationRef}
          source={SUCCESS_ANIMATION}
          loop={false} // 1번만 재생
          autoPlay={false} // useEffect에서 수동 제어
          duration={1000}
          style={styles.lottie}
          resizeMode="cover"
          // 애니메이션이 끝나면 자동으로 부모에게 알림 (리스트 갱신 등)
          onAnimationFinish={onAnimationFinish}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검은 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 300, // 애니메이션 크기 조절
    height: 300,
  },
});
