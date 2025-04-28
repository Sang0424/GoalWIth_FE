import React, { useState, useEffect, useRef } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeNavParamList } from '../types/navigation';
import type { MyFeed } from '../types/posts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '../utils/axiosInterceptor';

const PostBottomSheet = ({
  modalVisible,
  setModalVisible,
  feed,
}: {
  modalVisible: boolean;
  setModalVisible: any;
  feed: Partial<MyFeed>;
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeNavParamList>>();
  const { height: screenHeight } = useWindowDimensions();
  const queryClient = useQueryClient();
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
    if (modalVisible) {
      resetBottomSheet.start();
    }
  }, [modalVisible]);

  const closeModal = () => {
    closeBottomSheet.start(() => {
      setModalVisible(false);
    });
  };

  const onEditPress = () => {
    navigation.navigate('AddFeedNav', {
      screen: 'AddFeed',
      params: { feed: feed },
    });
    closeModal();
  };

  const { mutate } = useMutation({
    mutationFn: async () => {
      const response = await instance.delete(`/feeds/${feed.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myfeeds'] });
      setModalVisible(false);
    },
  });
  const onDeletePress = () => {
    Alert.alert('삭제하시겠습니까?', '삭제된 게시글은 복구할 수 없습니다.', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => mutate(),
      },
    ]);
    closeModal();
  };
  return (
    <Modal
      visible={modalVisible}
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
          <View style={styles.modalContents}>
            <Pressable style={styles.modalContent} onPress={onEditPress}>
              <Icon name="edit" size={24} />
              <Text>수정</Text>
            </Pressable>
            <View style={styles.modalContent}>
              <Icon name="bookmark-outline" size={24} />
              <Text>저장</Text>
            </View>
            <Pressable style={styles.modalContent} onPress={onDeletePress}>
              <Icon name="delete" size={24} />
              <Text style={{ color: 'red' }}>삭제</Text>
            </Pressable>
          </View>
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalContents: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingBottom: 24,
  },
  modalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default PostBottomSheet;
