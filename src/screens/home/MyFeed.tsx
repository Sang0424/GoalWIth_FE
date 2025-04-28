import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { MyFeedProps } from '../../types/navigation';
import BackArrow from '../../components/BackArrow';
import FAB from '../../components/FloatingActionButton';
import type { Tag, ImageType } from '../../types/todos';
import type { MyFeed } from '../../types/posts';
import { useQuery } from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import { API_URL } from '@env';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeNavParamList } from '../../types/navigation';
import { useState } from 'react';
import PostBottomSheet from '../../components/PostBottomSheet';
import Post from '../../components/Post';

export default function MyFeed({ route }: MyFeedProps) {
  const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<MyFeed>>({
    todo: '',
    tag: '',
    images: [],
    content: '',
  });
  const todo = route.params.todo;
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeNavParamList>>();
  const { data } = useQuery({
    queryKey: ['myfeeds'],
    queryFn: async () => {
      const response = await instance.get('/feeds/myfeed');
      const myFeed = response.data;
      return myFeed;
    },
  });

  const chunkArray = (arr: MyFeed[], size: number) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
      chunked.push(arr.slice(i, i + size));
    }
    return chunked;
  };

  const groupByTag = (data: MyFeed[]) => {
    const grouped: Record<string, MyFeed[]> = {};
    data?.forEach(item => {
      todo.tags.forEach((tag: Tag) => {
        if (!grouped[tag.title]) {
          grouped[tag.title] = [];
        }
        if (tag.title === item.tag) {
          item.images.length > 0 && grouped[tag.title].push(item);
        }
      });
    });
    return Object.keys(grouped).map(tag => ({
      title: tag,
      data: chunkArray(grouped[tag], 3), // ✅ 한 줄에 3개씩 묶기
    }));
  };
  const sections = groupByTag(data);

  const editModePress = (item: MyFeed) => {
    setModalVisible(true);
    setEditData({
      id: item.id,
      todo: item.todo,
      tag: item.tag,
      content: item.content,
      images: item.images,
    });
  };

  const Separate = () => {
    return (
      <View style={{ width: '100%', height: 16, backgroundColor: '#ffffff' }} />
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <Pressable onPress={() => navigation.goBack()}> */}
        <BackArrow />

        {/* </Pressable> */}
        <Text style={styles.title}>{todo.title}</Text>
        <Pressable onPress={() => setEditMode(!editMode)}>
          {editMode == false ? (
            <Text style={{ fontSize: 16 }}>편집</Text>
          ) : (
            <Text style={{ fontSize: 16, color: '#007aff' }}>완료</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.main}>
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.map(feed => (
                <Pressable
                  key={feed.id}
                  onPress={() =>
                    editMode == false
                      ? navigation.navigate('PostDetail', { feed_id: feed.id })
                      : editModePress(feed)
                  }
                >
                  <Image
                    source={{ uri: API_URL + feed.images[0].url }}
                    style={styles.feed}
                  />
                </Pressable>
              ))}
              {item.length < 3 &&
                Array.from({ length: 3 - item.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.emptyBlock} />
                ))}
            </View>
          )}
          SectionSeparatorComponent={Separate}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              style={{
                fontSize: 24,
                backgroundColor: '#ffffff',
              }}
            >
              # {title}
            </Text>
          )}
        />
      </View>
      <PostBottomSheet
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        feed={editData}
      />
      {/* <FAB style={styles.fab} /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'regular',
  },
  main: {
    flex: 1,
    width: '100%',
    gap: 16,
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: 4,
  },
  feed: {
    width: (Dimensions.get('window').width - 16 - 8) / 3,
    height: 120,
    borderRadius: 5,
  },
  fab: {
    borderRadius: 50,
    width: 56,
    height: 56,
    backgroundColor: '#806a5b',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    right: 24,
    shadowColor: '#806a5b',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  emptyBlock: {
    width: (Dimensions.get('window').width - 32 - 16) / 4,
    height: 120,
    marginRight: 2,
    backgroundColor: 'transparent',
  },
});
