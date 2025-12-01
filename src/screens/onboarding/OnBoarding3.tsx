import {SafeAreaView} from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Linking,
  Alert,
  TouchableOpacity,
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
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {tokenStore} from '../../store/tokenStore';
import {userStore} from '../../store/userStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../../styles/theme';

const UserTypes = [
  '학생',
  '대학생',
  '직장인',
  '프리랜서',
  '취업준비생',
  '기타',
];

const TERMS_URL =
  'https://satin-gallium-b49.notion.site/2ab7d463a92480cf96c2d4b82b7f4f09?pvs=74';
const PRIVACY_URL =
  'https://satin-gallium-b49.notion.site/2ab7d463a92480f999cde16f442722c7?pvs=74';

export default function OnBoarding3({route}: OnBoarding3Props) {
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);

  const {registerForm, isSocial, accessToken, refreshToken} = route.params;
  const {width} = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnBoardingStackParamList>>();
  const roleRef = useRef<TextInput>(null);
  const {setAccessToken} = tokenStore(state => state.actions);
  const queryClient = useQueryClient();
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
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [fourteen, setFourteen] = useState(false);

  const openLink = async (url: string) => {
    // 해당 URL을 열 수 있는지 먼저 확인
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // 열 수 있다면, 링크 열기
      await Linking.openURL(url);
    } else {
      Alert.alert('오류', '링크를 열 수 없습니다.');
    }
  };
  const validateTerms = () => {
    return agreedTerms && agreedPrivacy && fourteen;
  };

  const validateUserInfo = () => {
    let isValid = true;
    const errorMsg: Partial<{
      nickname: string;
      userType: string;
    }> = {};
    if (userInfo.nickname.length < 2) {
      errorMsg.nickname = '닉네임은 2글자 이상이어야 합니다.';
      isValid = false;
    } else if (userInfo.nickname.length > 15) {
      errorMsg.nickname = '닉네임은 15글자 이하이어야 합니다.';
      isValid = false;
    } else if (!userInfo.nickname) {
      errorMsg.nickname = '닉네임을 입력해주세요.';
      isValid = false;
    }
    if (!userInfo.userType) {
      errorMsg.userType = '유형을 선택해주세요.';
      isValid = false;
    }
    setError(errorMsg);
    return isValid;
  };
  const register = async () => {
    if (isSocial) {
      setAccessToken(accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      loadUser();
      // 소셜 로그인 추가 정보 입력
      await instance.put('/user/info', {
        nickname: userInfo.nickname,
        userType: userInfo.userType,
      });
      queryClient.invalidateQueries({
        queryKey: ['user'],
      });
    } else {
      // 일반 이메일 회원가입
      const userData = {
        ...userInfo,
        ...registerForm,
      };
      const response = await instance.post(`/user/register`, userData);
      const {accessToken, refreshToken} = response.data;
      setAccessToken(accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      loadUser();
      queryClient.invalidateQueries({
        queryKey: ['user'],
      });
    }
  };
  const {mutate} = useMutation({
    mutationFn: register,
    onSuccess: () => {
      // navigation.navigate('MainNav');
    },
    onError: (error: any) => {
      Alert.alert('가입 실패', error.response.data.message);
    },
  });
  const submitRegister = () => {
    mutate();
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('OnBoarding1')}>
          <Icon name="close" size={32} color="#000" />
        </TouchableOpacity>
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
            imageStyle={{width: 40, height: 40, marginRight: 16}}
          />
          <Text
            style={{
              fontSize: 24,
              lineHeight: 24,
              fontWeight: 'bold',
              color: '#806A5B',
              textAlign: 'center',
            }}>
            GoalWith
          </Text>
        </View>
        <KeyboardAvoidingView
          style={{flex: 5, justifyContent: 'flex-start'}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <Text style={styles.label}>사용할 닉네임을 입력해주세요</Text>
          <TextInput
            value={userInfo.nickname}
            placeholder="사용할 닉네임을 입력해주세요"
            placeholderTextColor={colors.gray}
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
          <Text style={styles.label}>직업 유형을 선택해주세요</Text>
          <View style={styles.chipContainer}>
            {/* USER_TYPES 배열을 순회하며 선택 버튼을 렌더링 */}
            {UserTypes.map(type => (
              <TouchableOpacity
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
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.agreementContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreedTerms(!agreedTerms)}>
              <Icon
                name={agreedTerms ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={agreedTerms ? '#806a5b' : '#ccc'}
              />
              <Text style={styles.checkboxLabel}>
                [필수] 서비스 이용약관 동의
              </Text>
              <TouchableOpacity onPress={() => openLink(TERMS_URL)}>
                <Text style={styles.viewLink}>[보기]</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreedPrivacy(!agreedPrivacy)}>
              <Icon
                name={agreedPrivacy ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={agreedPrivacy ? '#806a5b' : '#ccc'}
              />
              <Text style={styles.checkboxLabel}>
                [필수] 개인정보 수집 및 이용 동의
              </Text>
              <TouchableOpacity onPress={() => openLink(PRIVACY_URL)}>
                <Text style={styles.viewLink}>[보기]</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFourteen(!fourteen)}>
              <Icon
                name={fourteen ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={fourteen ? '#806a5b' : '#ccc'}
              />
              <Text style={styles.checkboxLabel}>
                [필수] 만 14세 이상입니다
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <TouchableOpacity
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
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                isFormFilled(userInfo) && validateTerms()
                  ? styles.registerBtn
                  : styles.registerBtnDisabled,
              ]}
              onPress={() => {
                validateUserInfo();
                validateUserInfo() && submitRegister();
              }}
              disabled={!isFormFilled(userInfo) || !validateTerms()}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                }}>
                {isSocial ? '시작하기' : '가입하기'}
              </Text>
            </TouchableOpacity>
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
    top: 70,
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
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    marginTop: 8,
    alignItems: 'center',
    width: '48%',
    padding: 16,
  },
  backBtn: {
    borderRadius: 10,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    marginTop: 8,
    alignItems: 'center',
    width: '48%',
    padding: 16,
  },
  registerBtnDisabled: {
    borderRadius: 10,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    marginTop: 8,
    alignItems: 'center',
    opacity: 0.5,
    width: '48%',
  },
  errorMsg: {
    color: 'red',
    fontSize: 14,
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
  agreementContainer: {marginTop: 24},
  checkboxRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 15},
  checkboxLabel: {flex: 1, marginLeft: 10},
  viewLink: {color: 'blue', textDecorationLine: 'underline'},
});
