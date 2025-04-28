import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import CircularProgress from '../../components/CircularProgress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import type { Todo } from '../../types/todos';
import BottomSheet from '../../components/AddTodo_BottomSheet';
import SettingGoalModal from '../../components/SettingGoalModal';
import { useNavigation } from '@react-navigation/native';
import { HomeNavParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FAB from '../../components/FloatingActionButton';
import instance from '../../utils/axiosInterceptor';
import { useQuery } from '@tanstack/react-query';
import { userStore } from '../../store/userStore';

export default function Home() {
  const { width } = useWindowDimensions();
  const [todoModalVisible, settodoModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeNavParamList>>();
  const user = userStore(state => state.user);
  console.log(user);
  const { data, error, isLoading } = useQuery<Todo[]>({
    queryKey: ['homeTodos'],
    queryFn: async () => {
      const response = await instance.get(`/todos/`);
      const todos = response.data;
      return todos;
    },
  });
  if (isLoading) {
    return <Text>로딩중</Text>;
  }
  if (error) {
    return <Text>ㅅㅂ 에러네 + {error.message}</Text>;
  }
  return (
    <SafeAreaView style={{ flex: 1, width: width }}>
      <View style={styles.header}>
        <Logo resizeMode={'contain'} style={{ width: 120, height: 80 }} />
        <View
          style={{
            flex: 1,
            flexGrow: 1,
            height: 56,
          }}
        >
          <View style={styles.iconContainer}>
            <Icon name="mail-outline" size={24} color={'#000000'} />
            <Icon name="settings" size={24} color={'#000000'} />
            {/* <Pressable onPress={() => clearAll()}>
              <Text>다시 시작</Text>
            </Pressable> */}
          </View>
        </View>
      </View>
      <View style={styles.mainContainer}>
        <ScrollView>
          <View style={{ flex: 3 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                {user?.nick ?? 'User'} 의 목표
              </Text>
            </View>
            <View style={[styles.finalGoalContainer, { width: width - 35 }]}>
              {user.goal != '' ? (
                <Text style={styles.finalGoal}>{user?.goal}</Text>
              ) : (
                <Pressable
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => setGoalModalVisible(true)}
                >
                  <Text style={styles.setGoal}>목표 설정하기</Text>
                  <Icon name="arrow-right" size={32} />
                </Pressable>
              )}
              <SettingGoalModal
                goalModalVisible={goalModalVisible}
                setGoalModalVisible={setGoalModalVisible}
              />
              {user.goal !== '' && <CircularProgress percent={0} radius={50} />}
            </View>
            <View style={styles.subGoalContainer}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                목표달성을 위해 해야 할 일
              </Text>
              <ScrollView>
                {data?.map(todo => {
                  return (
                    <Pressable
                      key={todo.id}
                      onPress={() =>
                        navigation.navigate('MyFeed', { todo: todo })
                      }
                    >
                      <View style={styles.todo_container}>
                        <Text style={styles.todo_title}>{todo.title}</Text>
                        <View style={styles.tag_container}>
                          {todo.tags?.map((tag, index) => {
                            return (
                              <Text key={tag.id} style={styles.todo_tag}>
                                {index <= 4
                                  ? '# ' + tag.title
                                  : index == 5
                                  ? '...'
                                  : null}
                              </Text>
                            );
                          })}
                        </View>
                        <Icon name="arrow-right" size={24} color="#000000" />
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
          <BottomSheet
            todoModalVisible={todoModalVisible}
            settodoModalVisible={settodoModalVisible}
          />
        </ScrollView>
      </View>
      {user?.goal != '' ? (
        <FAB setModalVisible={settodoModalVisible} style={styles.fab} />
      ) : (
        <FAB style={styles.disabledFab} />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    columnGap: 24,
    alignItems: 'center',
    paddingTop: 20,
  },
  mainContainer: { flex: 8, padding: 16 },
  finalGoalContainer: {
    flexDirection: 'row',
    borderColor: '#d9d9d9',
    borderWidth: 1,
    borderRadius: 10,
    height: 120,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  finalGoal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#806a5b',
  },
  setGoal: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subGoalContainer: {
    flex: 5,
    marginTop: 24,
  },
  todo_container: {
    flexDirection: 'row',
    borderColor: '#d9d9d9',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 16,
    padding: 16,
    height: 80,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todo_title: {
    fontSize: 16,
    fontWeight: 'medium',
  },
  tag_container: {
    flexDirection: 'row',
    flex: 0.9,
    alignContent: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#transparent',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 10,
    marginRight: 8,
  },
  todo_tag: {
    color: '#a1a1a1',
    fontSize: 12,
  },
  fab: {
    borderRadius: 50,
    width: 56,
    height: 56,
    backgroundColor: '#806a5b',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#806a5b',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  disabledFab: {
    borderRadius: 50,
    width: 56,
    height: 56,
    backgroundColor: '#a1a1a1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#806a5b',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
});
