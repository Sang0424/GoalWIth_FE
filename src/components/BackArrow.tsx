import Icon from 'react-native-vector-icons/MaterialIcons';
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BackArrow({
  where,
  props,
}: {
  where?: string;
  props?: any;
}) {
  const navigation = useNavigation<any>();

  return (
    <Pressable
      onPress={() =>
        where !== undefined
          ? navigation.navigate(where, { props: props })
          : navigation.goBack({ props: props })
      }
    >
      <Icon
        name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back-android'}
        size={20}
        color={'#000'}
      />
    </Pressable>
  );
}
