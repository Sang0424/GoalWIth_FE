import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { PostType, FeedType } from '../types/posts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageCarousel from './Carousel';
import formattedDate from '../utils/hooks/useFormatDate';
import { useMutation } from '@tanstack/react-query';
import instance from '../utils/axiosInterceptor';
import { useState } from 'react';
import { userStore } from '../store/userStore';
import { useQueryClient } from '@tanstack/react-query';
import { peerRequest } from '../utils/hooks/peerRequestFn';

export default function Post({
  data,
  isList,
}: {
  data: PostType | undefined;
  isList: boolean;
}) {
  const queryClient = useQueryClient();
  const user = userStore(state => state.user);

  const [isFire, setIsFire] = useState(() => {
    return data?.fires?.some(fire => fire.user_id === user.id) ?? false;
  });
  const [fireCount, setFireCount] = useState(data?.fires?.length ?? 0);
  const { data: fireData, mutate } = useMutation({
    mutationFn: () => {
      const fireData = instance.post(`/feeds/${data?.id}/fire`);
      return fireData;
    },
    onSuccess: () => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      queryClient.invalidateQueries({ queryKey: ['feed', data?.id] });
    },
  });
  const firePress = () => {
    mutate();
    setIsFire(prev => !prev);
    setFireCount(prev => (!isFire ? prev + 1 : prev - 1));
  };
  const peerRequestPress = () => {
    instance.post('/users/peerRequest', { peerId: data?.user.id });
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{data?.user.nick}</Text>
          {/* {data.user.nick} */}
          <Text style={styles.userRole}>{`/ ${data?.user.role || ''}`}</Text>
          {/* {data.user.role} */}
          <Text style={styles.createdAt}>
            {data && data.createdAt ? formattedDate(data.createdAt) : '방금 전'}
          </Text>
        </View>
        {data?.user.id !== user.id ? (
          data?.isPeer ? (
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Icon name="groups" size={24} color="#806a5b" />
              <Text
                style={{ color: '#806a5b', fontSize: 16, fontWeight: 'bold' }}
              >
                동료
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={peerRequestPress}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Icon name="add" size={24} color="#806a5b" />
              <Text
                style={{ color: '#806a5b', fontSize: 16, fontWeight: 'bold' }}
              >
                피어링
              </Text>
            </Pressable>
          )
        ) : (
          <></>
        )}
      </View>
      <View style={styles.feedTags}>
        <View style={styles.tagCircle}>
          <Text style={styles.tagText}>{`${data?.user.goal}`}</Text>
          {/* {data.user.goal} */}
        </View>
        <View style={styles.tagCircle}>
          <Text style={styles.tagText}>{`${data?.todo}`}</Text>
        </View>
        <View style={styles.tagCircle}>
          <Text style={styles.tagText}>{`${data?.tag}`}</Text>
        </View>
      </View>
      {isList ? (
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ fontSize: 16, letterSpacing: 0.5 }}
        >
          {data?.content}
        </Text>
      ) : (
        <Text style={{ fontSize: 16, letterSpacing: 0.5 }}>
          {data?.content}
        </Text>
      )}
      <View style={styles.feedMain}>
        {data?.images && data.images.length > 0 && (
          <ImageCarousel images={data.images} />
        )}
      </View>
      <View style={styles.icons}>
        <Pressable
          onPress={firePress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 4,
          }}
        >
          <Icon name="whatshot" size={24} color={isFire ? 'red' : '#000000'} />
          <Text>{fireCount}</Text>
        </Pressable>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}
        >
          <Icon name="chat-bubble-outline" size={24} color="#000000" />
          <Text>{data?.comments?.length ?? data?.comment_count}</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  userRole: {
    fontSize: 12,
  },
  createdAt: {
    fontSize: 12,
    color: '#a1a1a1',
    marginLeft: 12,
  },
  feedTags: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    columnGap: 10,
    marginBottom: 12,
  },
  tagCircle: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#B9B69B',
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'regular',
  },
  feedMain: {
    marginTop: 12,
    width: '100%',
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
});
