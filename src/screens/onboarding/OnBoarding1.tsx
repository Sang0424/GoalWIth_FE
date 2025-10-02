import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import BigLogo from '../../components/Logo';
import DividerWithText from '../../components/DividerWithText';
import {useNavigation} from '@react-navigation/native';
//import OnBoarding2 from './OnBoarding2';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {OnBoardingStackParamList} from '../../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {useMutation} from '@tanstack/react-query';
//import {userStore} from '../../store/userStore';
import instance from '../../utils/axiosInterceptor';
import {signInWithGoogle} from '../../services/api/auth';
import {useMutation} from '@tanstack/react-query';
import {tokenStore} from '../../store/tokenStore';

export default function Onboarding1() {
  const {height, width} = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnBoardingStackParamList>>();
  const {setAccessToken} = tokenStore(state => state.actions);
  const {mutate: gogoleLoginMutate} = useMutation({
    mutationFn: async (idToken: string) => {
      const reponse = await instance.post('/user/google-login', {
        token: idToken,
      });
      const {accessToken, refreshToken} = reponse.data;
      await AsyncStorage.setItem('refreshToken', refreshToken);
      return {accessToken, refreshToken};
    },
    onSuccess: async ({accessToken, refreshToken}) => {
      setAccessToken(accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      navigation.navigate('BottomNav');
    },
    onError: error => {
      console.error(error);
    },
  });

  const handleGoogleLogin = async () => {
    const idToken = await signInWithGoogle();
    if (idToken) {
      gogoleLoginMutate(idToken);
    }
  };

  // const loadUser = userStore(state => state.loadUser);
  // const guestLogin = async () => {
  //   const response = await instance.post(`/users/guestLogin`);
  //   const {access_token, refresh_token} = response.data;
  //   setAccessToken(access_token);
  //   await AsyncStorage.setItem('refresh_token', refresh_token);
  //   await loadUser();
  // };
  // const {mutate} = useMutation({
  //   mutationFn: guestLogin,
  //   onSuccess: () => {
  //     navigation.navigate('BottomNav');
  //   },
  //   onError: error => {
  //     console.error(error);
  //   },
  // });
  // const submitGuest = () => {
  //   mutate();
  // };
  return (
    <SafeAreaView style={styles.container}>
      <View style={{flex: 1, marginBottom: 16, justifyContent: 'center'}}>
        <BigLogo />
      </View>
      <View style={styles.registers}>
        <Pressable style={styles.oauthBtn} onPress={() => handleGoogleLogin()}>
          <Image
            source={require('../../assets/images/google_ios_ctn.png')}
            style={{resizeMode: 'stretch', width: width - 54, height: 64}}
          />
        </Pressable>
        <Pressable
          style={styles.oauthBtn}
          onPress={() => console.log('카카오 로그인')}>
          <Image
            source={require('../../assets/images/kakao_login.png')}
            style={{resizeMode: 'stretch', width: width - 54, height: 64}}
          />
        </Pressable>
        <DividerWithText text={'또는'} />
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
        {/* <Pressable
          onPress={() => {
            submitGuest();
          }}
          style={{ marginTop: 24 }}
        >
          <Text style={{ color: '#a1a1a1', textDecorationLine: 'underline' }}>
            로그인 없이 시작하기
          </Text>
        </Pressable> */}
      </View>
      <View style={{flex: 1}}></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginBottom: 24,
    alignItems: 'center',
    flexDirection: 'row',
  },
});
