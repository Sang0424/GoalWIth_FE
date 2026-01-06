import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../styles/theme';
import {send, EmailJSResponseStatus} from '@emailjs/react-native';
import {userStore} from '../../store/userStore';

const InquiryPage = () => {
  const navigation = useNavigation();
  const [inquiry, setInquiry] = useState('');
  const {nickname, email} = userStore.getState().user;

  const onSubmit = async () => {
    try {
      await send(
        'service_goalwith',
        'template_goalwith',
        {
          nickname,
          email,
          inquiry,
        },
        {
          publicKey: 'rwcnXCv_nniSQ3yVM',
        },
      );
      Alert.alert(
        '문의가 성공적으로 전달되었습니다. 신속한 조치를 취하겠습니다.',
      );
    } catch (err) {
      if (err instanceof EmailJSResponseStatus) {
        console.log('EmailJS Request Failed...', err);
      }

      Alert.alert('문의가 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{position: 'absolute', left: 24}}>
            <Icon
              name={
                Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back-android'
              }
              size={24}
              color={'#000'}
            />
          </Pressable>
          <View style={styles.header}>
            <Text style={styles.title}>문의하기</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.inputLabel}>문의 사항을 입력해주세요.</Text>
          <TextInput
            style={styles.input}
            placeholder="문의 사항을 입력해주세요."
            placeholderTextColor={colors.gray}
            value={inquiry}
            onChangeText={setInquiry}
            multiline
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>문의하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.font,
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
  },
  input: {
    height: 200,
    borderColor: colors.switchBG,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InquiryPage;
