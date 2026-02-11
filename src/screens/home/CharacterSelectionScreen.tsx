import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeNavParamList} from '../../types/navigation';
import {useState, useEffect, useCallback} from 'react';
import CharacterAvatar from '../../components/CharacterAvatar';
import {useInfiniteQuery, useMutation} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {userStore} from '../../store/userStore';
import {useQueryClient} from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../../styles/theme';
import {rewardStore} from '../../store/rewardStore';
import {
  AutoSkeletonView,
  AutoSkeletonIgnoreView,
} from 'react-native-auto-skeleton';
import {useFocusEffect} from '@react-navigation/native';

type Props = NativeStackScreenProps<HomeNavParamList, 'CharacterSelection'>;

const PAGE_SIZE = 6;

const CharacterSelectionScreen = ({route, navigation}: Props) => {
  const {currentCharacter} = route.params;
  const [character, setCharacter] = useState(currentCharacter);
  const user = userStore(state => state.user);
  const markCharacterSeen = rewardStore(state => state.markCharacterSeen);
  const hasNewCharacter = rewardStore(state => state.hasNewCharacter);
  const queryClient = useQueryClient();

  const {data, isLoading, refetch, isRefetching, hasNextPage, fetchNextPage} =
    useInfiniteQuery({
      queryKey: ['characters'],
      queryFn: async ({pageParam = 0}) => {
        const response = await instance.get(
          `/user/characters/${user.id}?page=${pageParam}&size=${PAGE_SIZE}`,
        );
        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.hasNext ? allPages.length : undefined;
      },
    });

  const {mutate} = useMutation({
    mutationFn: async (character: string) => {
      const response = await instance.put(`/user/character/${user.id}`, {
        character_id: character,
      });
      return response.data;
    },
    onSuccess: () => {
      Alert.alert('캐릭터 변경!', '캐릭터를 변경했습니다!');
      queryClient.invalidateQueries({queryKey: ['characters']});
    },
    onError: error => {
      Alert.alert('오류', '캐릭터 변경 중 오류가 발생했습니다.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['characters']});
    },
  });

  useFocusEffect(
    useCallback(() => {
      if (hasNewCharacter) {
        markCharacterSeen();
      }
    }, [hasNewCharacter, markCharacterSeen]),
  );

  const loadMore = () => {
    if (hasNextPage && !isRefetching) {
      fetchNextPage();
    }
  };

  // Extract unique characters from mock users
  const availableCharacters = data?.pages.flatMap(page => page.content);

  const handleSelectCharacter = (character: string) => {
    setCharacter(character);
    // TODO: Update user's selected character in the backend
  };

  const renderCharacterItem = ({
    item,
  }: {
    item: {id: string; name: string; character: string};
  }) => {
    const isSelected = item.character === character;

    return (
      <TouchableOpacity
        style={[styles.characterItem, isSelected && styles.selectedCharacter]}
        onPress={() => {
          handleSelectCharacter(item.character);
          mutate(item.id);
        }}>
        <CharacterAvatar avatar={item.character} size={100} />
        <Text style={styles.characterName}>{item.name}</Text>
        {isSelected && <Text style={styles.selectedText}>선택됨</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={32} />
        </Pressable>
        <Text style={styles.title}>캐릭터 선택</Text>
        <Pressable
          onPress={() => {
            handleSelectCharacter(character);
          }}>
          {/* <Text style={styles.completeText}>완료</Text> */}
          <View></View>
        </Pressable>
      </View>
      <AutoSkeletonView isLoading={isLoading}>
        <FlatList
          data={availableCharacters}
          renderItem={renderCharacterItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            hasNextPage ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : null
          }
        />
      </AutoSkeletonView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.font,
  },
  listContainer: {
    paddingBottom: 24,
  },
  characterItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.switchBG,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    maxWidth: '45%',
  },
  selectedCharacter: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  characterImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'regular',
    color: colors.font,
  },
  selectedText: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  completeText: {
    color: colors.done,
    fontSize: 16,
    fontWeight: 'regular',
  },
});

export default CharacterSelectionScreen;
