import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

export default function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const onKeyboardShow = (e: KeyboardEvent) => {
    setKeyboardHeight(e.endCoordinates.height);
  };
  const onKeyboardHide = (e: KeyboardEvent) => {
    setKeyboardHeight(0);
  };

  useEffect(() => {
    const onShow = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    const onHide = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  return {
    keyboardHeight,
  };
}
