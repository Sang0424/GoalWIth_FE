import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import BigLogo from '../../components/Logo';
import { useNavigation } from '@react-navigation/native';
import type {
  OnBoardingStackParamList,
  LastOnBoardingProps,
} from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { API_URL } from '@env';
import { tokenStore } from '../../store/tokenStore';
import { userStore } from '../../store/userStore';
import axios from 'axios';
import instance from '../../utils/axiosInterceptor';

export default function LastOnBoarding({ route }: LastOnBoardingProps) {
  const [goal, setGoal] = useState('');
  const user = route.params;
  const { setAccessToken } = tokenStore(state => state.actions);
  const loadUser = userStore(state => state.loadUser);
  const navigation =
    useNavigation<NativeStackNavigationProp<OnBoardingStackParamList>>();
  const register = async () => {
    const userData = {
      ...user,
      ...(goal ? { goal } : {}),
    };
    const response = await instance.post(`/users/signup`, userData);
    const { access_token, refresh_token } = response.data;
    setAccessToken(access_token);
    await AsyncStorage.setItem('refresh_token', refresh_token);
    await loadUser();
  };
  const { mutate } = useMutation({
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
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-start' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          keyboardVerticalOffset={20}
        >
          <View style={{ flex: 1, alignItems: 'center' }}>
            <BigLogo />
            <Text
              style={{
                textAlign: 'center',
                fontSize: 32,
                fontWeight: 'bold',
                marginTop: 24,
                lineHeight: 48,
              }}
            >
              당신의 최종 목표는 {'\n'}무엇인가요?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="목표를 입력해주세요"
              autoCapitalize="none"
              autoCorrect={false}
              enterKeyHint="done"
              value={goal}
              onChangeText={text => setGoal(text)}
            />
            <Pressable style={styles.completeBtn} onPress={submitRegister}>
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>완료</Text>
            </Pressable>
            <Pressable
              style={{ marginTop: 16 }}
              onPress={() => {
                setGoal('');
                submitRegister();
              }}
            >
              <Text
                style={{ textDecorationLine: 'underline', color: '#c0c0c0' }}
              >
                나중에 하기
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: '#f1f1f1',
    width: 300,
    height: 56,
    padding: 20,
    borderRadius: 10,
    marginTop: 24,
  },
  completeBtn: {
    borderRadius: 10,
    backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
    width: 300,
    height: 48,
  },
  registerBtnDisabled: {
    borderRadius: 10,
    backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginTop: 8,
    alignItems: 'center',
    opacity: 0.5,
  },
});
