import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AddFeedNavParmList } from '../../types/navigation';
import { AddFeedProps } from '../../types/navigation';
import SelectTodoOrTag from '../../components/SelectTodoOrTag';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Todo } from '../../types/todos';
import { Text } from 'react-native';
import instance from '../../utils/axiosInterceptor';

export default function SelectTodo({ route }: AddFeedProps) {
  const { feed, setFeed } = route.params;

  const navigation =
    useNavigation<NativeStackNavigationProp<AddFeedNavParmList>>();
  const onSelectTodo = (todoTitle: string) => {
    setFeed({ ...feed, todo: todoTitle });
    navigation.goBack();
  };
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:8000/todos');
  //       const todos = response.data;
  //       setTodos(todos);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  //   fetchData();
  // }, [reload]);
  const { data, error, isLoading } = useQuery<Todo[]>({
    queryKey: ['addFeedTodos'],
    queryFn: async () => {
      const response = await instance.get('/todos/');
      const todos = response.data;
      return todos;
    },
  });
  if (data) {
    console.log(data[0]);
  }
  if (isLoading) {
    return <Text>로딩중</Text>;
  }
  if (error) {
    return <Text>ㅅㅂ 에러네 + {error.message}</Text>;
  }

  return (
    <SelectTodoOrTag
      onSelect={onSelectTodo}
      data={data}
      headerTitle="할 일 선택"
      selectedValue={feed.todo}
    />
  );
}
