import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {User} from '../../types/user.types';
import {initialUser} from '../../store/mockData';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MyPageNavParamList} from '../../types/navigation';
import {userStore} from '../../store/userStore';
import CharacterAvatar from '../../components/CharacterAvatar';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';

interface EditProfileProps {
  nickname: string;
  userType: string;
  character: string;
}

const EditProfile = () => {
  const user = userStore(state => state.user);
  const setUser = userStore(state => state.setUser);
  const navigation =
    useNavigation<NativeStackNavigationProp<MyPageNavParamList>>();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [userType, setUserType] = useState(user?.userType || '');
  const [character, setCharacter] = useState(user?.character || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {mutate} = useMutation({
    mutationFn: async ({nickname, userType, character}: EditProfileProps) => {
      const response = await instance.put(`/user/info/${user.id}`, {
        nickname,
        userType,
        character,
      });
      return response.data;
    },
    onSuccess: () => {
      Alert.alert('프로필 변경!', '프로필을 변경했습니다!');
      queryClient.invalidateQueries({queryKey: ['user']});
    },
    onError: error => {
      Alert.alert('오류', '프로필 변경 중 오류가 발생했습니다.');
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['user']});
    },
  });

  const updateProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update user store
      setUser({
        nickname,
        userType,
        character,
      });
      mutate({nickname, userType, character});
    } catch (err: any) {
      setError(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{paddingHorizontal: 24}}>
            <Icon
              name={
                Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back-android'
              }
              size={24}
              color={'#000'}
            />
          </Pressable>
          <View style={styles.avatarContainer}>
            <TouchableOpacity style={styles.avatarWrapper}>
              <CharacterAvatar avatar={character} size={120} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarEditButton}>
              <Text style={styles.avatarEditButtonText}>프로필 사진 변경</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>닉네임</Text>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임을 입력하세요"
                maxLength={20}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>유저 타입</Text>
              <TextInput
                style={styles.input}
                value={userType}
                onChangeText={setUserType}
                placeholder="학생/교사"
                editable={false}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonLoading]}
              onPress={updateProfile}
              disabled={loading}>
              <Text style={styles.saveButtonText}>
                {loading ? '업데이트 중...' : '프로필 변경'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarEditButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#806A5B',
  },
  avatarEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 50,
  },
  errorText: {
    color: '#ff3b30',
    marginTop: 10,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#806A5B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonLoading: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfile;
