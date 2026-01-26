import {ExpoConfig, ConfigContext} from 'expo/config';
import * as dotenv from 'dotenv';
import path from 'path';

// 1. 어떤 환경 파일을 읽을지 결정 (기본값 dev)
const APP_VARIANT = process.env.APP_VARIANT || 'dev';

// 2. 해당 .env 파일 로드
dotenv.config({path: path.resolve(__dirname, `.env.${APP_VARIANT}`)});

interface CustomExpoConfig extends ExpoConfig {
  'react-native-google-mobile-ads'?: {
    android_app_id?: string;
    ios_app_id?: string;
  };
}

export default ({config}: ConfigContext): CustomExpoConfig => ({
  ...config,
  name: APP_VARIANT === 'prod' ? 'GoalWith' : 'GoalWith_Dev',
  slug: 'goalwith',
  version: APP_VARIANT === 'prod' ? '1.0.2' : '1.0.1', // iOS/Android 버전 차이 대응 가능
  runtimeVersion: {
    policy: 'appVersion',
  },

  ios: {
    bundleIdentifier:
      APP_VARIANT === 'prod'
        ? 'com.goalwith.goalwith'
        : 'com.goalwith.goalwith.dev',
    buildNumber: '2',
    // 구글 로그인을 위한 설정
    googleServicesFile:
      APP_VARIANT === 'prod'
        ? './GoogleService-Info.plist'
        : './GoogleService-Info-Dev.plist',
  },

  android: {
    package: APP_VARIANT === 'prod' ? 'com.goalwith' : 'com.goalwith_dev',
    versionCode: 2,
  },

  // 3. 환경 변수(.env) 값을 Expo 앱 내부에서 사용하도록 주입
  extra: {
    env: process.env.ENV,
    apiUrl: process.env.API_URL,
    kakaoAppKey: process.env.KAKAO_APP_KEY,
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    admobIdAndroid: process.env.ADMOB_ID_ANDROID,
    admobIdIos: process.env.ADMOB_ID_IOS,
    eas: {
      projectId: '8475b304-e536-458b-aa6a-6aea6e3e6939',
    },
  },

  // AdMob 설정 (기존 app.json에 있던 것)
  'react-native-google-mobile-ads': {
    android_app_id: process.env.ADMOB_ID_ANDROID,
    ios_app_id: process.env.ADMOB_ID_IOS,
  },

  updates: {
    url: 'https://u.expo.dev/8475b304-e536-458b-aa6a-6aea6e3e6939',
    requestHeaders: {
      'expo-channel-name': APP_VARIANT === 'prod' ? 'production' : 'dev',
    },
  },
});
