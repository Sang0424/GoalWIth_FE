import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  useWindowDimensions,
  PanResponder,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  GestureResponderEvent,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@env';
import instance from '../utils/axiosInterceptor';

const BottomSheet = (props: {
  todoModalVisible: boolean;
  settodoModalVisible: any;
  headerTitle?: string;
  whatTodo?: string;
}) => {
  const {
    todoModalVisible,
    settodoModalVisible,
    headerTitle = '할 일 추가하기',
    whatTodo,
  } = props;
  const { height: screenHeight } = useWindowDimensions();
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  const resetBottomSheet = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeBottomSheet = Animated.timing(panY, {
    toValue: screenHeight,
    duration: 100,
    useNativeDriver: true,
  });

  const panResponders = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: (event, gestureState) => {
        panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy > 0 && gestureState.vy > 1.5) {
          closeModal();
        } else {
          resetBottomSheet.start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (props.todoModalVisible) {
      resetBottomSheet.start();
    }
  }, [props.todoModalVisible]);

  const closeModal = () => {
    closeBottomSheet.start(() => {
      settodoModalVisible(false);
    });
  };

  const [title, setTitle] = useState('');

  const fetchData = async (formData: FormData) => {
    headerTitle == '할 일 추가하기'
      ? await instance.post(`/todos/addTodo`, formData)
      : await instance.post(`/todos/addTag`, formData);
  };
  const queryClient = useQueryClient();
  const { mutate, error } = useMutation({
    mutationFn: fetchData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['homeTodos'],
      });
      queryClient.invalidateQueries({
        queryKey: ['addFeedTodos'],
      });
      queryClient.invalidateQueries({
        queryKey: ['addFeedTags'],
      });
      settodoModalVisible(false);
      setTitle('');
    },
  });
  const handleSubmit = async (event: GestureResponderEvent) => {
    if (title == '') {
      Alert.alert('할 일을 입력해주세요.');
    } else {
      event.preventDefault();
      const formData = new FormData();
      formData.append('title', title);
      if (whatTodo) {
        formData.append('whatTodo', whatTodo);
      }
      mutate(formData);
    }
  };

  return (
    <Modal
      visible={todoModalVisible}
      animationType={'fade'}
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback
          onPress={() => {
            closeModal();
            Keyboard.dismiss();
          }}
        >
          <View style={styles.background} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={{
            ...styles.bottomSheetContainer,
            transform: [{ translateY: translateY }],
          }}
          {...panResponders.panHandlers}
        >
          <View style={styles.addWhat}>
            <View>
              <Text style={{ fontWeight: 'bold' }}>{headerTitle}</Text>
            </View>
          </View>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              style={styles.addTodo}
              keyboardVerticalOffset={100}
            >
              <TextInput
                placeholder="할 일을 입력해주세요"
                value={title}
                onChangeText={setTitle}
                autoFocus={true}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                style={{
                  width: '100%',
                  padding: 16,
                  borderColor: '#000000',
                  borderWidth: 1,
                  borderRadius: 100,
                }}
              />
              <Pressable style={styles.doneBtn} onPress={handleSubmit}>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                  }}
                >
                  완료
                </Text>
              </Pressable>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  background: {
    flex: 1,
  },
  bottomSheetContainer: {
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  addWhat: {
    flex: 1,
    width: '100%',
    height: 60,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'baseline',
  },
  addTodo: {
    flex: 30,
    width: '100%',
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  doneBtn: {
    backgroundColor: '#806a6b',
    borderWidth: 1,
    borderRadius: 100,
    width: 72,
    height: 40,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomSheet;
