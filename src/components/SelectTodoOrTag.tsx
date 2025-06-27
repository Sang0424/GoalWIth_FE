import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AddFeedNavParmList } from '../types/navigation';
import BottomSheet from './BottomSheet';
import { useState } from 'react';
import { Todo, Tag } from '../types/todos';

export default function SelectTodoOrTag({
  onSelect,
  data,
  selectedValue,
  headerTitle = '할 일 선택',
  whatTodo,
}: {
  onSelect: (title: string) => void;
  data: Tag[] | Todo[] | undefined;
  selectedValue?: string;
  headerTitle?: string;
  whatTodo?: string;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AddFeedNavParmList>>();
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Icon
          name="arrow-back-ios"
          size={24}
          color="#000000"
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', left: 24 }}
        />
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>
      <View>
        {data?.map(item => (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.title)}
            style={styles.todoList}
          >
            <Text style={{ fontSize: 20 }}>{item.title}</Text>
            {selectedValue === item.title && (
              <Icon name="check" size={24} color="#000000" />
            )}
          </Pressable>
        ))}
        <Pressable
          style={styles.addTodoList}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={24} color={'#a1a1a1'} />
          <Text style={{ fontSize: 20, color: '#a1a1a1' }}> 추가하기</Text>
        </Pressable>
      </View>
      {whatTodo ? (
        <BottomSheet
          todoModalVisible={modalVisible}
          settodoModalVisible={setModalVisible}
          headerTitle={
            headerTitle == '할 일 선택' ? '할 일 추가하기' : '태그 추가하기'
          }
          whatTodo={whatTodo}
        />
      ) : (
        <BottomSheet
          todoModalVisible={modalVisible}
          settodoModalVisible={setModalVisible}
          headerTitle={
            headerTitle == '할 일 선택' ? '할 일 추가하기' : '태그 추가하기'
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
  },
  todoList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  addTodoList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
});
