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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {User} from '../../types/user.types';
import {initialUser} from '../../store/mockData';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MyPageNavParamList} from '../../types/navigation';

interface EditProfileProps {
  user: User;
}

const EditProfile = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<MyPageNavParamList>>();
  const [nickname, setNickname] = useState('');
  const [userType, setUserType] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implement actual API call to update profile
      // For now, update local store
      const updateUser = {
        nickname,
        userType,
        avatar,
      };

      // Update user store
      initialUser.map(user => {
        if (user.id === 'user1') {
          return updateUser;
        }
        return user;
      });

      navigation.goBack();
    } catch (err) {
      setError('프로필을 업데이트하는 중에 문제가 발생했습니다.');
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
              <Image
                source={avatar as any}
                style={styles.avatar}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.avatarEditButton}>
                <Text style={styles.avatarEditButtonText}>
                  프로필 사진 변경
                </Text>
              </TouchableOpacity>
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
                {loading ? '업데이트 중...' : '프로필 저장'}
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
