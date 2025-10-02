import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Platform} from 'react-native';

/**
 * Google Sign-In을 설정합니다.
 * 앱 시작 시 한 번만 호출하면 됩니다.
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // webClientId는 안드로이드에서 사용되며, strings.xml에 있는 server_client_id를 참조합니다.
    // iOS에서는 iosClientId를 사용합니다.
    webClientId:
      Platform.OS === 'android'
        ? '470348844526-3ltopccruquc0grj285n81pild492nof.apps.googleusercontent.com'
        : '', // 안드로이드에서는 이 값을 비워두면 strings.xml을 자동으로 읽습니다.
    iosClientId:
      '470348844526-k3njci3uh3anrs9fte9a5fqesemkbphr.apps.googleusercontent.com',
    offlineAccess: false, // 백엔드에서 토큰을 사용하려면 true로 설정
  });
};

/**
 * Google 계정으로 로그인합니다.
 * @returns {Promise<string | null>} 성공 시 idToken, 실패 시 null을 반환합니다.
 */
export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    // 안드로이드에서 Google Play 서비스가 사용 가능한지 확인합니다.
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

    // 로그인 절차를 시작합니다.
    const response = await GoogleSignin.signIn();

    if (isSuccessResponse(response)) {
      return response.data.idToken;
    } else {
      return null;
    }
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Google sign-in was cancelled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Google sign-in is already in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('Google Play services not available or outdated');
    } else {
      console.error('Google sign-in error:', error);
    }
    return null;
  }
};

/**
 * Google 계정에서 로그아웃합니다.
 */
export const signOutWithGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    // 추가로 앱의 상태(e.g., zustand store)에서 사용자 정보를 제거해야 합니다.
  } catch (error) {
    console.error('Google sign-out error:', error);
  }
};

/**
 * 현재 로그인된 사용자 정보를 가져옵니다.
 * @returns {Promise<any | null>} 사용자 정보 또는 null
 */
export const getCurrentGoogleUser = async () => {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_REQUIRED) {
      console.log('User is not signed in yet');
    } else {
      console.error('Error getting current user:', error);
    }
    return null;
  }
};
