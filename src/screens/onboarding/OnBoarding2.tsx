import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useNavigation } from '@react-navigation/native';
import type { OnBoardingStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import React from 'react';
import { isFormFilled } from '../../utils/isFormFilled';

export default function OnBoarding2() {
  const { width } = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnBoardingStackParamList>>();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const passwordConfirmRef = useRef<TextInput>(null);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<
    Partial<{
      name: string;
      email: string;
      password: string;
      passwordConfirm: string;
    }>
  >({});

  const validateForm = () => {
    let isValid = true;
    const errorMsg: Partial<{
      name: string;
      email: string;
      password: string;
      passwordConfirm: string;
    }> = {};
    if (!registerForm.name) {
      errorMsg['name'] = '이름을 입력해주세요.';
      isValid = false;
    } else if (registerForm.name.length < 2) {
      errorMsg['name'] = '이름은 2글자 이상 입력해주세요.';
      isValid = false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //const isEmail = emailRegex.test(email);
    if (!registerForm.email) {
      errorMsg['email'] = '이메일을 입력해주세요.';
      isValid = false;
    } else if (!emailRegex.test(registerForm.email)) {
      errorMsg['email'] = '이메일 형식이 올바르지 않습니다.';
      isValid = false;
    }
    if (!registerForm.password) {
      errorMsg['password'] = '비밀번호를 입력해주세요.';
      isValid = false;
    } else if (registerForm.password.length < 8) {
      errorMsg['password'] = '비밀번호는 8자리 이상 입력해주세요.';
      isValid = false;
    }
    if (!passwordConfirm) {
      errorMsg['passwordConfirm'] = '비밀번호를 다시 입력해주세요.';
      isValid = false;
    } else if (passwordConfirm !== registerForm.password) {
      errorMsg['passwordConfirm'] = '비밀번호가 일치하지 않습니다.';
      isValid = false;
    }
    setError(errorMsg);
    return isValid;
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BigLogo />
        </View>
        <KeyboardAvoidingView
          style={{ flex: 3, justifyContent: 'flex-start' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TextInput
            value={registerForm.name}
            placeholder="이름"
            enterKeyHint="next"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { width: width - 70, height: 40 }]}
            onSubmitEditing={() => emailRef.current?.focus()}
            onChangeText={text =>
              setRegisterForm({ ...registerForm, name: text })
            }
          />
          {error.name && <Text style={styles.errorMsg}>{error.name}</Text>}
          <TextInput
            value={registerForm.email}
            ref={emailRef}
            placeholder="이메일"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            enterKeyHint="next"
            style={[styles.input, { width: width - 70, height: 40 }]}
            onSubmitEditing={() => passwordRef.current?.focus()}
            onChangeText={text => {
              setRegisterForm({ ...registerForm, email: text });
            }}
          />
          {error.email && <Text style={styles.errorMsg}>{error.email}</Text>}
          <TextInput
            value={registerForm.password}
            ref={passwordRef}
            placeholder="비밀번호"
            enterKeyHint="next"
            secureTextEntry={true}
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="off"
            style={[styles.input, { width: width - 70, height: 40 }]}
            onSubmitEditing={() => passwordConfirmRef.current?.focus()}
            onChangeText={text =>
              setRegisterForm({ ...registerForm, password: text })
            }
          />
          {error.password && (
            <Text style={styles.errorMsg}>{error.password}</Text>
          )}
          <TextInput
            value={passwordConfirm}
            ref={passwordConfirmRef}
            placeholder="비밀번호 확인"
            enterKeyHint="done"
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
            secureTextEntry={true}
            style={[styles.input, { width: width - 70, height: 40 }]}
            onChangeText={text => setPasswordConfirm(text)}
          />
          {error.passwordConfirm && (
            <Text style={styles.errorMsg}>{error.passwordConfirm}</Text>
          )}
          <Pressable
            style={[
              isFormFilled(registerForm)
                ? styles.nextBtn
                : styles.nextBtnDisabled,
              { width: width - 54, height: 64 },
            ]}
            onPress={() => {
              validateForm();
              validateForm() &&
                navigation.push('OnBoarding3', {
                  registerForm,
                });
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 'bold',
              }}
            >
              다음
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
