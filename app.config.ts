import {ExpoConfig, ConfigContext} from 'expo/config';
import * as dotenv from 'dotenv';
import path from 'path';
import pkg from './package.json';

// 1. 어떤 환경 파일을 읽을지 결정 (기본값 prod)
const APP_VARIANT = process.env.APP_VARIANT || 'prod';

// 2. 해당 .env 파일 로드
dotenv.config({path: path.resolve(__dirname, `.env.${APP_VARIANT}`)});

interface CustomExpoConfig extends ExpoConfig {
  'react-native-google-mobile-ads'?: {
    android_app_id?: string;
    ios_app_id?: string;
  };
}

const convertVersionToNumber = (version: string) => {
  const [major, minor, patch] = version.split('.').map(Number);
  // 예: 1.0.3 -> 1000003
  // 예: 1.1.0 -> 1001000
  return major * 1000000 + minor * 1000 + patch + 1;
};

export default ({config}: ConfigContext): CustomExpoConfig => ({
  ...config,
  name: 'GoalWith',
  slug: 'goalwith',
  version: pkg.version,
  runtimeVersion: pkg.version,

  ios: {
    ...config.ios,
    bundleIdentifier: 'com.goalwith.goalwith',
    buildNumber: convertVersionToNumber(pkg.version).toString(),
    // 구글 로그인을 위한 설정
    googleServicesFile: './ios/GoogleService-Info.plist',
  },

  android: {
    package: 'com.goalwith',
    versionCode: convertVersionToNumber(pkg.version),
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
