import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {tokenStore} from '../../store/tokenStore';
import Config from 'react-native-config';
import instance from '../../utils/axiosInterceptor';
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
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
    const setAccessToken = tokenStore(state => state.actions.setAccessToken);
    setAccessToken(null);
    await AsyncStorage.clear();
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
    const userInfo = GoogleSignin.getCurrentUser();
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

export const deleteAccount = async (): Promise<boolean> => {
  try {
    const loginType = await AsyncStorage.getItem('loginType');
    switch (loginType) {
      case 'google':
        await handleGoogleAccountDeletion();
        break;
      case 'apple':
        await handleAppleAccountDeletion();
        break;
      default:
        await handleCustomAccountDeletion();
    }

    await instance.delete('/user/revoke');

    await clearUserData();

    return true;
  } catch (error) {
    console.error('Account deletion failed:', error);
    throw error;
  }
};

const handleGoogleAccountDeletion = async () => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (error) {
    console.warn(
      'Google account revocation failed, continuing with deletion',
      error,
    );
  }
};

const handleAppleAccountDeletion = async () => {
  try {
    // For Apple, we can revoke the token
    appleAuth.onCredentialRevoked(async () => {
      console.warn(
        'If this function executes, User Credentials have been Revoked',
      );
    });
    // Apple doesn't provide a direct way to programmatically revoke
    // The above might not work in all cases, so document this limitation
  } catch (error) {
    console.warn(
      'Apple account revocation failed, continuing with deletion',
      error,
    );
  }
};

const handleCustomAccountDeletion = async () => {};

const clearUserData = async () => {
  await AsyncStorage.clear();
  const setAccessToken = tokenStore(state => state.actions.setAccessToken);
  setAccessToken(null);
};
