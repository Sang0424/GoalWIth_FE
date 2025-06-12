import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Team = {
  id: string;
  name: string;
  // Add other team properties as needed
};

type User = {
  id: string;
  name: string;
  email: string;
  nickname: string;
  userType: 'student' | 'mentor';
  token: string;
  teams?: Team[];
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signUp: (userData: {
    name: string;
    email: string;
    password: string;
    nickname: string;
    userType: 'student' | 'mentor';
  }) => Promise<User>;
  socialLogin: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@GoalWith:user';

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userJson) {
          const userData = JSON.parse(userJson);
          setUser(userData);
          // Here you would typically validate the token with your backend
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // TODO: Remove this temporary mock login in production
      Alert.alert('개발자용', '현재는 자동 로그인 상태입니다.\n나중에 실제 인증 로직으로 교체해주세요.');
      
      // Default mock user
      const mockUser: User = {
        id: '1',
        name: '테스트 사용자',
        email: 'test@example.com',
        nickname: '테스터',
        userType: 'student',
        token: `mock-token-${Date.now()}`,
      };
      
      await saveUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Login error', error);
      Alert.alert('로그인 실패', '로그인 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: {
    name: string;
    email: string;
    password: string;
    nickname: string;
    userType: 'student' | 'mentor';
  }): Promise<User> => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.post('/auth/signup', userData);
      // const newUser = response.data;
      
      // Mock response for now
      const mockUser: User = {
        id: '1',
        name: userData.name,
        email: userData.email,
        nickname: userData.nickname,
        userType: userData.userType,
        token: 'mock-jwt-token',
      };
      
      await saveUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Signup error', error);
      Alert.alert('회원가입 실패', '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement social login logic
      console.log('Social login with:', provider);
      
      // Mock response for now
      const mockUser: User = {
        id: '1',
        name: '소셜 사용자',
        email: `social@${provider}.com`,
        nickname: `${provider}User`,
        userType: 'student',
        token: `mock-${provider}-token`,
      };
      
      await saveUser(mockUser);
    } catch (error) {
      console.error('Social login error', error);
      Alert.alert('소셜 로그인 실패', '소셜 로그인 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout error', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signUp,
        socialLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
