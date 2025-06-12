import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

type Props = {
  navigation: SignUpScreenNavigationProp;
};

const SignUpScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [userType, setUserType] = useState<'student' | 'mentor'>('student');

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // TODO: Implement signup logic
    console.log('Sign up with:', { name, email, password, nickname, userType });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{paddingHorizontal:20}}>
      <Text style={styles.title}>회원가입</Text>
      
      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        placeholder="이름을 입력해주세요"
        value={name}
        onChangeText={setName}
      />
      
      <Text style={styles.label}>이메일</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일을 입력해주세요"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <Text style={styles.label}>비밀번호</Text>
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력해주세요 (8자 이상)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Text style={styles.label}>비밀번호 확인</Text>
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 다시 입력해주세요"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <Text style={styles.label}>닉네임</Text>
      <TextInput
        style={styles.input}
        placeholder="사용하실 닉네임을 입력해주세요"
        value={nickname}
        onChangeText={setNickname}
      />
      
      <Text style={styles.label}>회원 유형</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity 
          style={[styles.radioButton, userType === 'student' && styles.radioButtonSelected]}
          onPress={() => setUserType('student')}
        >
          <Text style={userType === 'student' ? styles.radioTextSelected : styles.radioText}>학생</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.radioButton, userType === 'mentor' && styles.radioButtonSelected]}
          onPress={() => setUserType('mentor')}
        >
          <Text style={userType === 'mentor' ? styles.radioTextSelected : styles.radioText}>멘토</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, (!name || !email || !password || !confirmPassword || !nickname) && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={!name || !email || !password || !confirmPassword || !nickname}
      >
        <Text style={styles.buttonText}>가입하기</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text>이미 계정이 있으신가요? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>로그인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 30,
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#806a5b',
    borderColor: '#806a5b',
  },
  radioText: {
    fontSize: 16,
    color: '#666',
  },
  radioTextSelected: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#806a5b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  link: {
    color: '#806a5b',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
