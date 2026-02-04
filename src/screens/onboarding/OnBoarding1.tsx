import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import BigLogo from '../../components/Logo';
import DividerWithText from '../../components/DividerWithText';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {OnBoardingStackParamList} from '../../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../../utils/axiosInterceptor';
import {signInWithGoogle} from '../../services/api/auth';
import {useMutation} from '@tanstack/react-query';
import {tokenStore} from '../../store/tokenStore';
import {login} from '@react-native-kakao/user';
import {
  appleAuth,
  AppleButton,
  AppleRequestResponseFullName,
} from '@invertase/react-native-apple-authentication';
import {colors} from '../../styles/theme';
import {
  AppleLoginButton,
  GoogleLoginButton,
} from '../../components/SocialLoginBtn';

export default function Onboarding1() {
  const {height, width} = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnBoardingStackParamList>>();
  const {setAccessToken} = tokenStore(state => state.actions);
  const {mutate: gogoleLoginMutate} = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await instance.post('/user/google-login', {
        token: idToken,
      });
      return response.data;
    },
    onSuccess: async data => {
      if (data.newer) {
        // 신규 유저
        const {accessToken, refreshToken} = data;
        navigation.navigate('OnBoarding3', {
          isSocial: true,
          registerForm: {
            email: data.email,
            name: data.name,
          },
          accessToken,
          refreshToken,
          isGoogle: true,
        });
      } else {
        // 기존 유저
        const {accessToken, refreshToken} = data;
        // if (!data.nickname || data.userType === '') {
        //   navigation.navigate('OnBoarding3', {
        //     isSocial: true,
        //     registerForm: {email: data.email, name: data.name},
        //     accessToken,
        //     refreshToken,
        //     isGoogle: true,
        //   });
        // } else {
        setAccessToken(accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('loginType', 'google');
        // }
      }
    },
    onError: (error: any) => {
      Alert.alert(error?.response?.data?.message);
    },
  });

  const {mutate: appleLoginMutate} = useMutation({
    mutationFn: async ({
      token,
    }: // name,
    // email,
    {
      token: string;
      // name?: AppleRequestResponseFullName;
      // email?: string;
    }) => {
      // if (name && email) {
      //   const response = await instance.post('/user/apple-login', {
      //     token,
      //     name,
      //     email,
      //   });
      //   return response.data;
      // }
      const response = await instance.post('/user/apple-login', {
        token,
      });
      return response.data;
    },
    onSuccess: async data => {
      if (data.newer) {
        const {accessToken, refreshToken} = data;
        navigation.navigate('OnBoarding3', {
          isSocial: true,
          registerForm: {
            email: data.email,
            name: data.name,
          },
          accessToken,
          refreshToken,
          isApple: true,
        });
      } else {
        // 기존 유저
        const {accessToken, refreshToken} = data;
        // if (!data.nickname || data.userType === '') {
        //   navigation.navigate('OnBoarding3', {
        //     isSocial: true,
        //     registerForm: {email: data.email, name: data.name},
        //     accessToken,
        //     refreshToken,
        //     isApple: true,
        //   });
        // } else {
        setAccessToken(accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('loginType', 'apple');
        //}
      }
    },
    onError: (error: any) => {
      Alert.alert(error?.response?.data?.message);
    },
  });

  // const {mutate: kakaoLoginMutate} = useMutation({
  //   mutationFn: async ({
  //     kakaoAccessToken,
  //     idToken,
  //   }: {
  //     kakaoAccessToken: string;
  //     idToken: string;
  //   }) => {
  //     const response = await instance.post('/user/kakao-login', {
  //       accessToken: kakaoAccessToken,
  //       token: idToken,
  //     });
  //     return response.data; // { isNewUser, accessToken?, refreshToken?, email?, name? }
  //   },
  //   onSuccess: async data => {
  //     if (data.newer) {
  //       // 신규 유저
  //       const {accessToken, refreshToken} = data;
  //       navigation.navigate('OnBoarding3', {
  //         isKakao: true,
  //         registerForm: {
  //           email: data.email,
  //           name: data.name,
  //         },
  //         accessToken,
  //         refreshToken,
  //       });
  //     } else {
  //       // 기존 유저
  //       const {accessToken, refreshToken} = data;
  //       setAccessToken(accessToken);
  //       await AsyncStorage.setItem('refreshToken', refreshToken);
  //       navigation.navigate('MainNav');
  //     }
  //   },
  //   onError: error => {
  //     console.error(error);
  //   },
  // });

  const handleGoogleLogin = async () => {
    const idToken = await signInWithGoogle();
    if (idToken) {
      gogoleLoginMutate(idToken);
    }
  };

  async function onAppleButtonPress() {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );
    if (credentialState === appleAuth.State.AUTHORIZED) {
      appleLoginMutate({
        token: appleAuthRequestResponse.identityToken || '',
        // name: appleAuthRequestResponse.fullName || undefined,
        // email: appleAuthRequestResponse.email || undefined,
      });
    }
  }

  // const handleKakaoLogin = async () => {
  //   const {accessToken, idToken} = await login();
  //   if (accessToken && idToken) {
  //     kakaoLoginMutate({kakaoAccessToken: accessToken, idToken});
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
          justifyContent: 'center',
          marginTop: 72,
        }}>
        <BigLogo
          resizeMode="contain"
          imageStyle={{width: 80, height: 80, marginRight: 24}}
        />
        <Text
          style={{
            fontSize: 40,
            lineHeight: 40,
            fontWeight: 'bold',
            color: '#806A5B',
            textAlign: 'center',
          }}>
          GoalWith
        </Text>
      </View>
      <View style={styles.registers}>
        <GoogleLoginButton
          onPress={() => handleGoogleLogin()}
          style={{width: width - 54, height: 64}}
        />
        {Platform.OS === 'ios' && (
          <AppleLoginButton
            onPress={() => onAppleButtonPress()}
            style={{width: width - 54, height: 64}}
          />
        )}
        <DividerWithText text={'또는 or'} />
        <Pressable
          style={[styles.registerBtnWrapper, {width: width - 54, height: 64}]}
          onPress={() => navigation.push('OnBoarding2')}>
          <Text style={{textAlign: 'center', fontSize: 24, fontWeight: 'bold'}}>
            계정 만들기
          </Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text>
            이미 계정이 있으신가요? {'\t'}
            <Text style={{color: '#007aff'}}> 로그인하기</Text>
          </Text>
        </Pressable>
      </View>
      <View style={{flex: 1}}></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registers: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oauthBtn: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  registerBtnWrapper: {
    borderRadius: 10,
    backgroundColor: '#D1C7BC',
    justifyContent: 'center',
    marginBottom: 24,
    alignItems: 'center',
    flexDirection: 'row',
  },
});
