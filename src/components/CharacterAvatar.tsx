import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {API_URL} from '@env';

interface CharacterAvatarProps {
  size?: number;
  level?: number;
  avatar: string;
  style?: ViewStyle;
  onPress?: () => void;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  size = 80,
  level = 1,
  avatar,
  style,
  onPress,
}) => {
  // Get border color based on level
  const getBorderColor = () => {
    if (level < 5) return ['#e9ecef', '#dee2e6'];
    if (level < 10) return ['#a5d8ff', '#74c0fc'];
    if (level < 20) return ['#74c0fc', '#4dabf7'];
    if (level < 30) return ['#4dabf7', '#339af0'];
    return ['#339af0', '#1c7ed6'];
  };

  const colors = getBorderColor();
  const imageSource =
    typeof avatar === 'string'
      ? {uri: avatar}
      : require('../assets/character/pico_question.png');

  const content = (
    <View
      style={[
        styles.gradientContainer,
        {
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: colors[0],
        },
      ]}>
      <View
        style={[
          styles.characterContainer,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: (size * 0.9) / 2,
            backgroundColor: 'white',
            borderWidth: 2,
            borderColor: colors[1] || colors[0],
          },
        ]}>
        <Image
          source={imageSource}
          style={styles.characterImage}
          resizeMode="contain"
          defaultSource={require('../assets/character/pico_base.png')}
        />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.container, {width: size, height: size}, style]}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, {width: size, height: size}, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  characterImage: {
    width: '80%',
    height: '80%',
  },
});

export default CharacterAvatar;
