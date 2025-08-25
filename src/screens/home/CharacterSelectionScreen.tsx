import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeNavParamList} from '../../types/navigation';
import {Avatar} from '../../types/user.types';
import {initialUser} from '../../store/mockData';

type Props = NativeStackScreenProps<HomeNavParamList, 'CharacterSelection'>;

const CharacterSelectionScreen = ({route, navigation}: Props) => {
  const {currentCharacter} = route.params;

  // Extract unique characters from mock users
  const availableCharacters = Array.from(
    new Map(initialUser.map((user, i) => [i, user?.character])).values(),
  ) as string[];

  const handleSelectCharacter = (character: string) => {
    // TODO: Update user's selected character in the backend
    navigation.goBack();
  };

  const renderCharacterItem = ({item}: {item: Avatar}) => {
    const isSelected = item.id === currentCharacter.id;

    return (
      <TouchableOpacity
        style={[styles.characterItem, isSelected && styles.selectedCharacter]}
        onPress={() => handleSelectCharacter(item)}>
        <Image
          source={{uri: item.image}}
          style={styles.characterImage}
          resizeMode="contain"
        />
        <Text style={styles.characterName}>{item.name}</Text>
        {isSelected && <Text style={styles.selectedText}>선택됨</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>캐릭터 선택</Text>
      <FlatList
        data={availableCharacters}
        renderItem={renderCharacterItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 24,
  },
  characterItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    maxWidth: '45%',
  },
  selectedCharacter: {
    borderWidth: 2,
    borderColor: '#806A5B',
    backgroundColor: '#f0e6dd',
  },
  characterImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  characterName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    marginTop: 4,
    color: '#806A5B',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CharacterSelectionScreen;
