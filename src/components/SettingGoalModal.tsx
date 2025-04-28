import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TextInput,
  KeyboardAvoidingView,
  Touchable,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import instance from '../utils/axiosInterceptor';
import { tokenStore } from '../store/tokenStore';
import { userStore } from '../store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingGoalModal = ({
  goalModalVisible,
  setGoalModalVisible,
}: {
  goalModalVisible: boolean;
  setGoalModalVisible: any;
}) => {
  const [goal, setGoal] = useState('');
  const { setAccessToken } = tokenStore(state => state.actions);
  const loadUser = userStore(state => state.loadUser);
  const goalSettingFn = async () => {
    const response = await instance.patch('/users/editGoal', { newGoal: goal });
    const { access_token, refresh_token } = response.data;
    setAccessToken(access_token);
    await AsyncStorage.setItem('refresh_token', refresh_token);
    await loadUser();
  };
  const { mutate } = useMutation({
    mutationFn: goalSettingFn,
    onSuccess: () => {
      setGoal(''), setGoalModalVisible(!goalModalVisible);
    },
    onError: error => {
      console.error(error);
    },
  });
  return (
    <SafeAreaView>
      <Modal animationType="fade" transparent={true} visible={goalModalVisible}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                목표 설정하기
              </Text>
              <TextInput
                style={styles.input}
                placeholder="목표를 입력해주세요"
                value={goal}
                onChangeText={setGoal}
                autoFocus={true}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => {
                    setGoal(''), setGoalModalVisible(!goalModalVisible);
                  }}
                >
                  <Text style={{ fontSize: 20 }}>취소</Text>
                </Pressable>
                <Pressable
                  style={styles.completeBtn}
                  onPress={() => {
                    mutate();
                  }}
                >
                  <Text style={{ fontSize: 20, color: 'blue' }}>완료</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    backgroundColor: '#f1f1f1',
    width: 300,
    height: 56,
    padding: 20,
    borderRadius: 10,
    marginTop: 24,
  },
  completeBtn: {
    // borderRadius: 10,
    // backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
    width: 80,
    height: 32,
    marginLeft: 16,
  },
  cancelBtn: {
    // borderRadius: 10,
    // backgroundColor: '#F2F0E6',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
    width: 80,
    height: 32,
    marginRight: 16,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default SettingGoalModal;
