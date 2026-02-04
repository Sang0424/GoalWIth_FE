import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet, Platform} from 'react-native';
import Svg, {Path, G} from 'react-native-svg';

// --- 1. Apple Logo SVG Component ---
const AppleLogo = ({size = 20, color = 'white'}) => (
  <Svg width={size} height={size} viewBox="0 0 384 512">
    <Path
      fill={color}
      d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"
    />
  </Svg>
);

// --- 2. Google Logo SVG Component ---
const GoogleLogo = ({size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <G>
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 12.01-2.19 15.61-5.63l-7.73-6c-2.15 1.45-4.92 2.3-7.88 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </G>
  </Svg>
);

// --- 3. Custom Button Components ---

export const AppleLoginButton = ({onPress, style}: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.button, styles.appleButton, style]}>
      <View style={styles.iconWrapper}>
        <AppleLogo size={22} color="white" />
      </View>
      <Text style={[styles.text, styles.appleText]}>Apple로 계속하기</Text>
    </TouchableOpacity>
  );
};

export const GoogleLoginButton = ({onPress, style}: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.button, styles.googleButton, style]}>
      <View style={styles.iconWrapper}>
        <GoogleLogo size={22} />
      </View>
      <Text style={[styles.text, styles.googleText]}>Google로 계속하기</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56, // 애플 권장 최소 높이 44pt 이상 충족
    borderRadius: 12, // 요즘 트렌드에 맞는 둥근 모서리
    paddingHorizontal: 20,
    marginBottom: 12,
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    left: 20, // 아이콘을 왼쪽에 고정
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center', // 텍스트 중앙 정렬
  },
  // Apple Styles
  appleButton: {
    backgroundColor: '#000000',
  },
  appleText: {
    color: '#FFFFFF',
  },
  // Google Styles
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD', // 구글 버튼은 흰 배경이라 테두리 필요
    // 안드로이드 그림자
    elevation: 2,
    // iOS 그림자
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  googleText: {
    color: '#1F1F1F', // 완전 검정보다는 진한 회색 권장 (Material Design)
  },
});
