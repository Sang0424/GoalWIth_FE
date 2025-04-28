import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { tokenStore } from '../store/tokenStore';
import { userStore } from '../store/userStore';

// Axios 인스턴스 생성
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    withCredentials: true,
  },
  timeout: 10000,
});

// 요청 인터셉터: Authorization 헤더 추가
instance.interceptors.request.use(
  async config => {
    const token = tokenStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  error => {
    console.error(error.response.detail);
    return Promise.reject(error);
  },
);

// 응답 인터셉터: 액세스 토큰 만료 시 자동 갱신
// instance.interceptors.response.use(
//   response => response,
//   async error => {
//     console.error(error.response.status);
//     const originalRequest = error.config;
//     if (error.response?.status === 401) {
//       const refreshToken = await AsyncStorage.getItem('refresh_token');
//       if (refreshToken) {
//         const res = await axios.post(`${API_URL}/users/refresh`, {
//           refresh_token: refreshToken,
//         });
//         //const { setAccessToken } = tokenStore(state => state.actions);
//         //setAccessToken(res.data.access_token);
//         tokenStore.getState().actions.setAccessToken(res.data.access_token);
//         await userStore.getState().loadUser();
//         error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
//         return axios(error.config);
//       }
//     }
//     return Promise.reject(error);
//   },
// );
instance.interceptors.response.use(
  response => response, // 성공 응답 그대로 반환
  async error => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        const { data } = await instance.post('/users/refresh', {
          refreshToken: refreshToken,
        });
        // tokenStore.getState().actions.setAccessToken(data.access_token);
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return instance(error.config);
      } catch (refreshError) {
        console.error('Failed to refresh access token', refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
