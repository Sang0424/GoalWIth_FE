if (__DEV__) {
  require('./ReactotronConfig');
}

import React from 'react';
import OnBoardingNav from './src/navigation/OnBoardingNav';
import BottomNav from './src/navigation/BottomNav';
import {useState, useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {tokenStore} from './src/store/tokenStore';
import {userStore} from './src/store/userStore';
import instance from './src/utils/axiosInterceptor';
import {decodeJwt} from './src/utils/jwtUtils';
import {API_URL} from '@env';
import {MenuProvider} from 'react-native-popup-menu';
import axios from 'axios';
import {configureGoogleSignIn} from './src/services/api/auth';
import BootSplash from 'react-native-bootsplash';

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const setAccessToken = tokenStore(state => state.actions.setAccessToken);
  const accessToken = tokenStore(state => state.accessToken);

  useEffect(() => {
    configureGoogleSignIn();

    const checkAuth = async () => {
      if (API_URL === '') {
        // API_URL이 없는 개발 환경에서는 인증 과정을 생략합니다.
        setIsLoading(false);
        return;
      }

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          setAccessToken(null);
          return;
        }

        const decoded = decodeJwt(refreshToken);
        const currentTime = Date.now() / 1000;

        if (decoded?.exp && decoded.exp < currentTime) {
          await AsyncStorage.removeItem('refreshToken');
          setAccessToken(null);
          return;
        }

        try {
          const response = await axios.post(`${API_URL}/user/refresh`, {
            refreshToken,
          });
          const {accessToken: newAccessToken, refreshToken: newRefreshToken} =
            response.data;
          setAccessToken(newAccessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          await AsyncStorage.removeItem('refreshToken');
          setAccessToken(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setAccessToken]);

  useEffect(() => {
    if (!isLoading) {
      BootSplash.hide();
    }
  }, [isLoading]);

  // if (isLoading) {
  //   return null; // 로딩 중에는 스플래시 스크린만 표시
  // }

  return (
    <QueryClientProvider client={queryClient}>
      <MenuProvider>
        <NavigationContainer>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{flex: 1}}>
              {accessToken ? <BottomNav /> : <OnBoardingNav />}
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </NavigationContainer>
      </MenuProvider>
    </QueryClientProvider>
  );
};

export default App;
