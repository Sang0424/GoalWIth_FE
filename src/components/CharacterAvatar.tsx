import React from 'react';
import {View, StyleSheet, Image, ViewStyle, Platform} from 'react-native';
import {ImageSourcePropType} from 'react-native';

interface CharacterAvatarProps {
  size?: number;
  level?: number;
  avatar: ImageSourcePropType | {uri: string};
  style?: ViewStyle;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  size = 80,
  level = 1,
  avatar,
  style,
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

  return (
    <View style={[styles.container, {width: size, height: size}, style]}>
      <View
        style={[
          styles.gradientContainer,
          {
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: colors[0], // Use the first color as border color as fallback
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
              borderColor: colors[1] || colors[0], // Use the second color or first as border color
            },
          ]}>
          <Image
            source={avatar}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
      </View>
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
    backgroundColor: '#f0f0f0', // Fallback background color
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
