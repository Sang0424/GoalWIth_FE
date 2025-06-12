import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navigation is handled by the auth state change in AppNavigator
    } catch (error) {
      // Error is already handled in the login function
    }
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log('Login with:', provider);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{paddingHorizontal:20}}>
      <Text style={styles.title}>로그인</Text>
      
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>로그인</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.socialContainer}>
        <Text style={styles.socialText}>소셜 계정으로 로그인</Text>
        <View style={styles.socialButtons}>
          <TouchableOpacity 
            style={[styles.socialButton, styles.google]}
            onPress={() => handleSocialLogin('google')}
          >
            <Text style={styles.socialButtonText}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.socialButton, styles.kakao]}
            onPress={() => handleSocialLogin('kakao')}
          >
            <Text style={[styles.socialButtonText, { color: '#000' }]}>K</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.socialButton, styles.twitter]}
            onPress={() => handleSocialLogin('twitter')}
          >
            <Text style={styles.socialButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text>계정이 없으신가요? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>회원가입</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#806a5b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#b3a79b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  socialText: {
    marginBottom: 15,
    color: '#666',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  socialButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  google: {
    backgroundColor: '#DB4437',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  twitter: {
    backgroundColor: '#1DA1F2',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  link: {
    color: '#806a5b',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
