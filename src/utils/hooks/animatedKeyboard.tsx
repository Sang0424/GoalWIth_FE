import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Keyboard, TextInput } from 'react-native';

export default function AnimatedKeyboard() {
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  // 200 duration is somewhat a magic number that seemed to work nicely with
  // the default keyboard opening speed
  const startAnimation = (toValue: number) =>
    Animated.timing(keyboardOffset, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();

  useEffect(() => {
    // start the animation when the keyboard appears
    Keyboard.addListener('keyboardWillShow', e => {
      // use the height of the keyboard (negative because the translateY moves upward)
      startAnimation(-e.endCoordinates?.height);
    });
    // perform the reverse animation back to keyboardOffset initial value: 0
    Keyboard.addListener('keyboardWillHide', () => {
      startAnimation(0);
    });
    return () => {
      // remove listeners to avoid memory leak
      Keyboard.removeAllListeners('keyboardWillShow');
      Keyboard.removeAllListeners('keyboardWillHide');
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY: keyboardOffset }] }}>
        <TextInput placeholder={'댓글을 작성해 주세요'} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 24,
    height: 64,
  },
});
