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
import type {
  OnBoardingStackParamList,
  OnBoarding3Props,
} from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import React from 'react';
import { isFormFilled } from '../../utils/isFormFilled';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnBoarding3({ route }: OnBoarding3Props) {
  const { registerForm } = route.params;
  const { width } = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnBoardingStackParamList>>();
  const roleRef = useRef<TextInput>(null);
  const [userInfo, setUserInfo] = useState({
    nick: '',
    role: '',
  });
  const [error, setError] = useState<
    Partial<{
      nick: string;
      role: string;
    }>
  >({});
  const validateUserInfo = () => {
    let isValid = true;
    const errorMsg: Partial<{
      nick: string;
      role: string;
    }> = {};
    if (userInfo.nick.length < 2) {
      errorMsg.nick = '닉네임은 2글자 이상이어야 합니다.';
      isValid = false;
    } else if (!userInfo.nick) {
      errorMsg.nick = '닉네임을 입력해주세요.';
      isValid = false;
    }
    if (userInfo.role.length < 2) {
      errorMsg.role = '직업을 입력해주세요.';
      isValid = false;
    } else if (!userInfo.role) {
      errorMsg.role = '직업을 입력해주세요.';
      isValid = false;
    }
    setError(errorMsg);
    return isValid;
  };
  // const storeData = async (value: {
  //   nick: string;
  //   role: string;
  //   goal?: string;
  // }) => {
  //   try {
  //     const jsonValue = JSON.stringify(value);
  //     await AsyncStorage.setItem('userInfo', jsonValue);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };
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
            value={userInfo.nick}
            placeholder="닉네임"
            enterKeyHint="next"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { width: width - 70, height: 40 }]}
            onSubmitEditing={() => roleRef.current?.focus()}
            onChangeText={text => setUserInfo({ ...userInfo, nick: text })}
          />
          {error.nick && <Text style={styles.errorMsg}>{error.nick}</Text>}
          <TextInput
            value={userInfo.role}
            placeholder="사용자 역할 ex)학생, 대학생, 직장인 ..."
            enterKeyHint="done"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { width: width - 70, height: 40 }]}
            onChangeText={text => setUserInfo({ ...userInfo, role: text })}
          />
          {error.role && <Text style={styles.errorMsg}>{error.role}</Text>}
          <Pressable
            style={[
              isFormFilled(userInfo)
                ? styles.registerBtn
                : styles.registerBtnDisabled,
              { width: width - 54, height: 64 },
            ]}
            onPress={() => {
              validateUserInfo();
              validateUserInfo() &&
                navigation.navigate(
                  'LastOnBoarding',
                  Object.assign({}, registerForm, userInfo),
                );
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 'bold',
              }}
            >
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
