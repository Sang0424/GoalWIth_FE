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
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserTypes = [
  '학생',
  '대학생',
  '직장인',
  '프리랜서',
  '취업준비생',
  '기타',
];

export default function OnBoarding3({route}: OnBoarding3Props) {
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);

  const {registerForm, isSocial} = route.params;
  const {width} = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnBoardingStackParamList>>();
  const roleRef = useRef<TextInput>(null);
  const {setAccessToken} = tokenStore(state => state.actions);
  const loadUser = userStore(state => state.loadUser);
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    userType: selectedUserType || '',
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
    if (!userInfo.userType) {
      errorMsg.userType = '직업을 선택해주세요.';
      isValid = false;
    }
    setError(errorMsg);
    return isValid;
  };
  const register = async () => {
    let response;
    if (isSocial) {
      // 소셜 로그인 추가 정보 입력
      response = await instance.post('/user/social-register', {
        email: registerForm?.email,
        nickname: userInfo.nickname,
        userType: userInfo.userType,
      });
    } else {
      // 일반 이메일 회원가입
      const userData = {
        ...userInfo,
        ...registerForm,
      };
      response = await instance.post(`/user/register`, userData);
    }
    const {accessToken, refreshToken} = response.data;
    setAccessToken(accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await loadUser();
  };
  console.log(userInfo);
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
        <Pressable
          style={styles.closeButton}
          onPress={() => navigation.navigate('OnBoarding1')}>
          <Icon name="close" size={32} color="#000" />
        </Pressable>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            justifyContent: 'flex-start',
          }}>
          <BigLogo
            resizeMode="contain"
            imageStyle={{width: 80, height: 80, marginRight: 24}}
          />
          <Text
            style={{
              fontSize: 40,
              lineHeight: 40,
              fontWeight: 'bold',
              color: '#806A5B',
              textAlign: 'center',
            }}>
            GoalWith
          </Text>
        </View>
        <KeyboardAvoidingView
          style={{flex: 3, justifyContent: 'flex-start'}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <Text style={styles.label}>사용할 닉네임을 입력해주세요</Text>
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
          {/* <TextInput
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
          )} */}
          <Text style={styles.label}>직업 유형을 선택해주세요</Text>
          <View style={styles.chipContainer}>
            {/* USER_TYPES 배열을 순회하며 선택 버튼을 렌더링 */}
            {UserTypes.map(type => (
              <Pressable
                key={type}
                // 현재 type이 선택된 type과 같으면 selectedChip 스타일 적용
                style={[
                  styles.chip,
                  selectedUserType === type && styles.selectedChip,
                ]}
                onPress={() => {
                  setSelectedUserType(type);
                  setUserInfo({...userInfo, userType: type});
                }}>
                <Text
                  style={[
                    styles.chipText,
                    selectedUserType === type && styles.selectedChipText,
                  ]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <Pressable
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                }}>
                뒤로
              </Text>
            </Pressable>
            <Pressable
              style={[
                isFormFilled(userInfo)
                  ? styles.registerBtn
                  : styles.registerBtnDisabled,
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
                {isSocial ? '시작하기' : '가입하기'}
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
    backgroundColor: '#FCFAF8',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 72,
    right: 32,
    padding: 16,
    zIndex: 10,
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
    width: '48%',
    padding: 16,
  },
  backBtn: {
    borderRadius: 10,
    backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginTop: 8,
    alignItems: 'center',
    width: '48%',
    padding: 16,
  },
  registerBtnDisabled: {
    borderRadius: 10,
    backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginTop: 8,
    alignItems: 'center',
    opacity: 0.5,
    width: '48%',
  },
  errorMsg: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row', // 가로로 배치
    flexWrap: 'wrap', // 공간이 부족하면 다음 줄로
    gap: 10, // 칩 사이의 간격
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  selectedChip: {
    backgroundColor: '#806a5b', // 선택 시 배경색
    borderColor: '#806a5b',
  },
  chipText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedChipText: {
    color: '#FFFFFF', // 선택 시 글자색
    fontWeight: 'bold',
  },
});
