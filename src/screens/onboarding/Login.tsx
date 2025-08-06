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
import Logo from '../../components/Logo';
import {useNavigation} from '@react-navigation/native';
import type {OnBoardingStackParamList} from '../../types/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useRef, useState} from 'react';
import React from 'react';
import {isFormFilled} from '../../utils/isFormFilled';
import {useMutation} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {tokenStore} from '../../store/tokenStore';
import {userStore} from '../../store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const {width} = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnBoardingStackParamList>>();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const passwordConfirmRef = useRef<TextInput>(null);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<
    Partial<{
      email: string;
      password: string;
    }>
  >({});
  const loadUser = userStore(state => state.loadUser);
  const setAccessToken = tokenStore(state => state.actions.setAccessToken);

  const validateForm = () => {
    let isValid = true;
    const errorMsg: Partial<{
      email: string;
      password: string;
    }> = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!loginForm.email) {
      errorMsg['email'] = '이메일을 입력해주세요.';
      isValid = false;
    } else if (!emailRegex.test(loginForm.email)) {
      errorMsg['email'] = '이메일 형식이 올바르지 않습니다.';
      isValid = false;
    }
    if (!loginForm.password) {
      errorMsg['password'] = '비밀번호를 입력해주세요.';
      isValid = false;
    } else if (loginForm.password.length < 8) {
      errorMsg['password'] = '비밀번호는 8자리 이상 입력해주세요.';
      isValid = false;
    }
    setError(errorMsg);
    return isValid;
  };

  const {mutate} = useMutation({
    mutationFn: async () => {
      const response = await instance.post('/user/login', loginForm);
      const {accessToken, refreshToken} = response.data;
      setAccessToken(accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
    },
    onSuccess: async () => {
      await loadUser();
      navigation.navigate('BottomNav');
    },
    onError: error => {
      console.log(error);
    },
  });
  const submitLogin = () => {
    validateForm() && mutate();
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Logo />
        </View>
        <KeyboardAvoidingView
          style={{flex: 3, justifyContent: 'flex-start'}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TextInput
            value={loginForm.email}
            ref={emailRef}
            placeholder="이메일"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            enterKeyHint="next"
            style={[styles.input, {width: width - 70, height: 40}]}
            onSubmitEditing={() => passwordRef.current?.focus()}
            onChangeText={text => {
              setLoginForm({...loginForm, email: text});
            }}
          />
          {error.email && <Text style={styles.errorMsg}>{error.email}</Text>}
          <TextInput
            value={loginForm.password}
            ref={passwordRef}
            placeholder="비밀번호"
            enterKeyHint="next"
            secureTextEntry={true}
            autoCorrect={false}
            autoCapitalize="none"
            style={[styles.input, {width: width - 70, height: 40}]}
            onSubmitEditing={() => passwordConfirmRef.current?.focus()}
            onChangeText={text => setLoginForm({...loginForm, password: text})}
          />
          {error.password && (
            <Text style={styles.errorMsg}>{error.password}</Text>
          )}
          <Pressable
            style={[
              isFormFilled(loginForm) ? styles.nextBtn : styles.nextBtnDisabled,
              {width: width - 54, height: 64},
            ]}
            onPress={submitLogin}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 'bold',
              }}>
              로그인
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
  nextBtn: {
    borderRadius: 10,
    backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginTop: 8,
    alignItems: 'center',
  },
  nextBtnDisabled: {
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
