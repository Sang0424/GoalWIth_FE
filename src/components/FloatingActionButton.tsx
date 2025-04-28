import { Alert, Animated } from 'react-native';
import { useRef } from 'react';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { HomeNavParamList } from './../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function FAB({
  setModalVisible,
  style,
}: {
  setModalVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  style: any;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeNavParamList>>();
  const fadeIn = () => {
    Animated.timing(fabAnim, {
      toValue: 0.8,
      duration: 70,
      useNativeDriver: true,
    }).start();
  };
  const fadeOut = () => {
    Animated.timing(fabAnim, {
      toValue: 1,
      duration: 70,
      useNativeDriver: true,
    }).start();
  };
  const fabAnim = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ opacity: fabAnim }}>
      <Pressable
        style={style}
        onPress={() => {
          setModalVisible
            ? setModalVisible(true)
            : Alert.alert('목표를 설정해주세요');
        }}
        onPressIn={fadeIn}
        onPressOut={fadeOut}
      >
        <Icon name="add" size={32} color={'#ffffff'} />
      </Pressable>
    </Animated.View>
  );
}
