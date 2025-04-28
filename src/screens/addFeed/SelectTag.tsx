import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AddFeedNavParmList } from '../../types/navigation';
import { AddFeedProps } from '../../types/navigation';
import SelectTodoOrTag from '../../components/SelectTodoOrTag';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Todo } from '../../types/todos';
import { Text } from 'react-native';
import { Alert } from 'react-native';
import instance from '../../utils/axiosInterceptor';

export default function SelectedTag({ route }: AddFeedProps) {
  const { feed, setFeed } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<AddFeedNavParmList>>();
  const onSelectTag = (tagTitle: string) => {
    setFeed({ ...feed, tag: tagTitle });
    navigation.goBack();
  };

  const { data, error, isLoading } = useQuery<Todo[]>({
    queryKey: ['addFeedTags', feed.todo],
    queryFn: async () => {
      const response = await instance.get(`/todos/${feed.todo}`);
      const tags = response.data;
      return tags;
    },
    enabled: !!feed.todo,
  });
  useEffect(() => {
    if (!feed.todo) {
      Alert.alert('할 일을 먼저 선택해주세요');
      navigation.goBack();
    }
  }, [feed.todo, navigation]);
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
      onSelect={onSelectTag}
      data={data}
      headerTitle="태그 선택"
      selectedValue={feed.tag}
      whatTodo={feed.todo}
    />
  );
}
