import {SafeAreaView} from 'react-native-safe-area-context';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import BigLogo from '../../components/Logo';
import {useNavigation} from '@react-navigation/native';
import type {
  OnBoardingStackParamList,
  OnBoarding3Props,
} from '../../types/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useRef, useState} from 'react';
import React from 'react';
import {isFormFilled} from '../../utils/isFormFilled';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../../utils/axiosInterceptor';
import {useMutation} from '@tanstack/react-query';
import {tokenStore} from '../../store/tokenStore';
import {userStore} from '../../store/userStore';

export default function OnBoarding3({route}: OnBoarding3Props) {
  const {registerForm} = route.params;
  const {width} = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnBoardingStackParamList>>();
  const roleRef = useRef<TextInput>(null);
  const {setAccessToken} = tokenStore(state => state.actions);
  const loadUser = userStore(state => state.loadUser);
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    userType: '',
  });
  const [error, setError] = useState<
    Partial<{
      nickname: string;
      userType: string;
    }>
  >({});
  const validateUserInfo = () => {
    let isValid = true;
    const errorMsg: Partial<{
      nickname: string;
      userType: string;
    }> = {};
    if (userInfo.nickname.length < 2) {
      errorMsg.nickname = '닉네임은 2글자 이상이어야 합니다.';
      isValid = false;
    } else if (!userInfo.nickname) {
      errorMsg.nickname = '닉네임을 입력해주세요.';
      isValid = false;
    }
    if (userInfo.userType.length < 2) {
      errorMsg.userType = '직업을 입력해주세요.';
      isValid = false;
    } else if (!userInfo.userType) {
      errorMsg.userType = '직업을 입력해주세요.';
      isValid = false;
    }
    setError(errorMsg);
    return isValid;
  };
  const register = async () => {
    const userData = {
      ...userInfo,
      ...registerForm,
    };
    const response = await instance.post(`/user/register`, userData);
    const {accessToken, refreshToken} = response.data;
    setAccessToken(accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await loadUser();
  };
  const {mutate} = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigation.navigate('BottomNav');
    },
    onError: error => {
      console.error(error);
    },
  });
  const submitRegister = () => {
    mutate();
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <BigLogo />
        </View>
        <KeyboardAvoidingView
          style={{flex: 3, justifyContent: 'flex-start'}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TextInput
            value={userInfo.nickname}
            placeholder="닉네임"
            enterKeyHint="next"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, {width: width - 70, height: 40}]}
            onSubmitEditing={() => roleRef.current?.focus()}
            onChangeText={text => setUserInfo({...userInfo, nickname: text})}
          />
          {error.nickname && (
            <Text style={styles.errorMsg}>{error.nickname}</Text>
          )}
          <TextInput
            ref={roleRef}
            value={userInfo.userType}
            placeholder="사용자 유형 ex)학생, 대학생, 직장인 ..."
            enterKeyHint="done"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, {width: width - 70, height: 40}]}
            onChangeText={text => setUserInfo({...userInfo, userType: text})}
          />
          {error.userType && (
            <Text style={styles.errorMsg}>{error.userType}</Text>
          )}
          <Pressable
            style={[
              isFormFilled(userInfo)
                ? styles.registerBtn
                : styles.registerBtnDisabled,
              {width: width - 54, height: 64},
            ]}
            onPress={() => {
              validateUserInfo();
              validateUserInfo() && submitRegister();
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 'bold',
              }}>
              가입하기
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
        <Pressable onPress={() => navigation.goBack()}>
          <Text>뒤로</Text>
        </Pressable>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  input: {
    borderBottomColor: '#a1a1a1',
    borderBottomWidth: 1,
    paddingLeft: 5,
    marginBottom: 16,
  },
  registerBtn: {
    borderRadius: 10,
    backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginTop: 8,
    alignItems: 'center',
  },
  registerBtnDisabled: {
    borderRadius: 10,
    backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginTop: 8,
    alignItems: 'center',
    opacity: 0.5,
  },
  errorMsg: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
});
