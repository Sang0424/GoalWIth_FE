import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeNavParamList} from '../../types/navigation';
import {Avatar} from '../../types/user.types';
import {useState} from 'react';
import {initialUser} from '../../store/mockData';
import CharacterAvatar from '../../components/CharacterAvatar';
import {useInfiniteQuery} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {userStore} from '../../store/userStore';

type Props = NativeStackScreenProps<HomeNavParamList, 'CharacterSelection'>;

const CharacterSelectionScreen = ({route, navigation}: Props) => {
  const {currentCharacter} = route.params;
  const [character, setCharacter] = useState(currentCharacter);
  const user = userStore(state => state.user);

  const {data, isLoading, refetch, isRefetching, hasNextPage, fetchNextPage} =
    useInfiniteQuery({
      queryKey: ['characters'],
      queryFn: async () => {
        const response = await instance.get(`/characters/${user.id}`);
        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const totalPages = lastPage.totalPages;
        return totalPages > allPages.length ? allPages.length + 1 : undefined;
      },
    });

  if (isLoading) return <ActivityIndicator size="large" color="#000000" />;

  const loadMore = () => {
    if (hasNextPage && !isRefetching) {
      fetchNextPage();
    }
  };
  // Extract unique characters from mock users
  const availableCharacters = data?.pages.flatMap(page => page.items);

  const handleSelectCharacter = (character: string) => {
    setCharacter(character);
    // TODO: Update user's selected character in the backend
  };

  const renderCharacterItem = ({item}: {item: string}) => {
    const isSelected = item === character;

    return (
      <TouchableOpacity
        style={[styles.characterItem, isSelected && styles.selectedCharacter]}
        onPress={() => handleSelectCharacter(item)}>
        <CharacterAvatar avatar={item} size={100} />
        {/* <Text style={styles.characterName}>{item}</Text> */}
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
        keyExtractor={item => item}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          hasNextPage ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : null
        }
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
