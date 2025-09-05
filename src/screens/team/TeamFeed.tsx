import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  GestureResponderEvent,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTeamStore} from '../../store/mockData';
import {
  TeamPost,
  TeamComment,
  TeamFeedResponse,
  ApiDataReturnType,
  Team,
} from '../../types/team.types';
import {QuestVerification} from '../../types/quest.types';
import {TeamFeedProps as TeamFeedRouteProps} from '@/types/navigation';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import ImageCarousel from '../../components/Carousel';
import useKeyboardHeight from '../../utils/hooks/useKeyboardHeight';
import {API_URL} from '@env';
import CharacterAvatar from '../../components/CharacterAvatar';
import {
  useQueryClient,
  useMutation,
  useInfiniteQuery,
} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

// #region Custom Hooks (Moved outside component)

const useMockData = ({
  teamId,
  newPostText,
  images,
  commentText,
  setNewPostText,
  setImages,
  setCommentText,
}: any): Omit<ApiDataReturnType, 'team'> & {team?: Team} => {
  const {
    teams,
    getTeamById,
    createTeamPost,
    addComment,
    deleteTeamPost,
    updateTeamPost,
    deleteComment,
    updateComment,
  } = useTeamStore();
  const team = getTeamById(teamId);

  const handleAddRecord = async () => {
    if (!newPostText.trim() && images.length === 0) {
      Alert.alert('오류', '기록할 내용을 입력해주세요.');
      return;
    }
    if (images.length > 3) {
      Alert.alert('오류', '이미지는 최대 3장까지만 선택할 수 있습니다.');
      return;
    }
    createTeamPost(teamId, {
      text: newPostText.trim(),
      images: images.length > 0 ? images : undefined,
      user: {id: '4', name: 'test', avatar: '', level: 1},
      verifications: [],
    });
    setNewPostText('');
    setImages([]);
    Alert.alert('성공', '기록이 추가되었습니다!');
  };

  const handleAddComment = (
    postId: string,
    comment: Omit<QuestVerification, 'id' | 'createdAt' | 'updatedAt' | 'user'>,
  ) => {
    if (!commentText.trim()) return;
    addComment(postId, comment);
    setCommentText('');
  };

  const handleUpdatePost = (postId: string, updates: Partial<TeamPost>) => {
    const currentPost = team?.teamQuest?.records.find(
      post => post.id === postId,
    );
    if (!currentPost) return;

    const updatedPost = {
      ...currentPost,
      ...updates,
      images: updates.images || currentPost.images,
    };
    updateTeamPost(teamId, postId, updates);
  };

  const handleUpdateComment = (commentId: string | null, comment: string) => {
    if (!commentId) return;
    const currentComment = team?.teamQuest?.records.find(
      post => post.id === commentId,
    );
    if (!currentComment) return;
    updateComment(commentId, {comment});
  };

  const handleDeletePost = (postId: string) => {
    deleteTeamPost(teamId, postId);
  };

  const handleDeleteComment = (commentId: string | null) => {
    if (!commentId) return;
    deleteComment(commentId);
  };

  return {
    data: team?.teamQuest?.records || [],
    pages: team?.teamQuest?.records
      ? [{records: team.teamQuest.records, nextPage: undefined}]
      : [],
    pageParams: [],
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
    isError: false,
    handleAddRecord,
    handleAddComment,
    handleUpdatePost,
    handleUpdateComment,
    handleDeletePost,
    handleDeleteComment,
    loadMore: () => {},
  };
};

const useApiData = ({
  teamId,
  page,
  pageSize,
  newPostText,
  images,
  setNewPostText,
  setImages,
  setCommentText,
  commentText,
}: any): ApiDataReturnType => {
  const queryClient = useQueryClient();

  const fetchTeamFeed = async ({pageParam = 0}) => {
    const response = await instance.get<TeamFeedResponse>(
      `/record/team/${teamId}?page=${pageParam}&size=${pageSize}`,
    );
    return {
      records: response.data.content,
      nextPage:
        response.data.content.length === pageSize ? pageParam + 1 : undefined,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['teamFeed', teamId],
    queryFn: ({pageParam = page}) => fetchTeamFeed({pageParam}),
    initialPageParam: 0,
    getNextPageParam: lastPage => lastPage.nextPage,
  });

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['teamFeed', teamId]});
    },
  };

  const addPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const formData = new FormData();
      formData.append('text', postData.text || '');
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image: Asset) => {
          formData.append(`images`, {
            uri: image.uri,
            type: image.type,
            name: image.fileName,
          });
        });
      } else {
        formData.append('images', '[]');
      }
      const response = await instance.post(`/record/team/${teamId}`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      return response.data;
    },
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      setNewPostText('');
      setImages([]);
      Alert.alert('성공', '기록이 추가되었습니다!');
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({
      postId,
      updates,
    }: {
      postId: string;
      updates: Partial<TeamPost>;
    }) => {
      const formData = new FormData();
      const existingUrlsToKeep: string[] = [];

      formData.append('text', updates.text);

      updates.images &&
        updates.images.forEach((image: Asset) => {
          // 로그를 보면 image는 { uri, type, name } 형태의 객체입니다.
          if (image?.uri?.startsWith('http')) {
            // 서버 URL('http'로 시작)이면 '유지할 URL 목록'에 추가
            existingUrlsToKeep.push(image.uri);
          } else {
            // 로컬 파일 URI('file://'로 시작)이면 '새 이미지 파일'로 FormData에 추가
            formData.append('newImages', {
              uri: image.uri,
              type: image.type || 'image/jpeg', // 혹시 type이 없을 경우를 대비한 기본값
              name: image.fileName || `image-${Date.now()}.jpg`, // 혹시 이름이 없을 경우를 대비
            });
          }
        });
      formData.append('existingImages', JSON.stringify(existingUrlsToKeep));

      // const metadataBlob = new Blob(
      //   [
      //     JSON.stringify({
      //       text: updates.text,
      //       existingImages: existingUrlsToKeep,
      //     }),
      //   ],
      //   {
      //     type: 'application/json',
      //     lastModified: Date.now(),
      //   },
      // );
      // formData.append('data', metadataBlob);
      const response = await instance.put(`/record/team/${postId}`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      return response.data;
    },
    ...mutationOptions,
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) =>
      instance.delete(`${API_URL}/record/team/${postId}`),
    ...mutationOptions,
  });

  const addCommentMutation = useMutation({
    mutationFn: ({recordId, comment}: {recordId: string; comment: any}) =>
      instance.post(`/record/team/verifications/${recordId}`, comment),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      setCommentText('');
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({commentId, comment}: {commentId: string; comment: string}) =>
      instance.put(`/record/team/verification/${commentId}`, {
        comment: comment,
      }),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      setCommentText('');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({commentId}: {commentId: string}) =>
      instance.delete(`${API_URL}/record/team/verification/${commentId}`),
    ...mutationOptions,
  });

  const handleAddRecord = async () => {
    if (!newPostText.trim() && images.length === 0) {
      Alert.alert('오류', '기록할 내용을 입력해주세요.');
      return;
    }
    if (images.length > 3) {
      Alert.alert('오류', '이미지는 최대 3장까지만 선택할 수 있습니다.');
      return;
    }
    await addPostMutation.mutateAsync({
      text: newPostText.trim(),
      images: images.length > 0 ? images : undefined,
      user: {id: '4', name: 'test', character: '', level: 1},
      verifications: [],
    });
  };

  const handleAddComment = (recordId: string, comment: any) => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate({recordId, comment});
  };

  return {
    data: data?.pages.flatMap(page => page.records) || [],
    pages: data?.pages || [],
    pageParams: data?.pageParams || [],
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isError,
    isLoading,
    handleAddRecord,
    handleAddComment,
    handleUpdatePost: (postId: string, updates: Partial<TeamPost>) =>
      updatePostMutation.mutate({postId, updates}),
    handleUpdateComment: (commentId: string, comment: string) =>
      updateCommentMutation.mutate({commentId, comment}),
    handleDeletePost: deletePostMutation.mutate,
    handleDeleteComment: (commentId: string) =>
      deleteCommentMutation.mutate({commentId}),
    loadMore,
  };
};

// #endregion

const TeamFeedScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<TeamFeedRouteProps>();
  const {teamId, teamName, teamQuest} = route.params;
  const {keyboardHeight} = useKeyboardHeight();
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const [newPostText, setNewPostText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentId, setCommentId] = useState<string | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [images, setImages] = useState<Asset[]>([]);
  const [existingImages, setExistingImages] = useState<Asset[]>([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isCommentUpdate, setIsCommentUpdate] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const useMock = API_URL === '';

  const hookProps = {
    teamId,
    page,
    pageSize,
    newPostText,
    images,
    commentText,
    setNewPostText,
    setImages,
    setCommentText,
  };

  const mockData = useMockData(hookProps);
  const apiData = useApiData(hookProps);

  const {
    team,
    data: teamPosts,
    handleAddRecord,
    handleAddComment,
    handleUpdatePost,
    handleUpdateComment,
    handleDeletePost,
    handleDeleteComment,
    isLoading,
    isError,
    loadMore,
  } = useMock ? mockData : apiData;

  useEffect(() => {
    const keyboardWillShow = (e: any) => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates?.height + 81,
        duration: 200,
        useNativeDriver: false,
      }).start();
    };
    const keyboardWillHide = () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    };

    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      keyboardWillShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      keyboardWillHide,
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardOffset]);

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 3 - images.length,
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 1,
        includeBase64: false,
      },
      (response: any) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
          return;
        }
        if (response.assets?.length) {
          setImages(prev => [...prev, ...response.assets].slice(0, 3));
        }
      },
    );
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일 ${String(date.getHours()).padStart(
      2,
      '0',
    )}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const toggleComments = (postId: string) => {
    if (isCommenting && selectedPostId === postId) {
      setIsCommenting(false);
      setSelectedPostId(null);
    } else {
      setIsCommenting(true);
      setSelectedPostId(postId);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text>팀을 불러오는 중 오류가 발생했습니다.</Text>
      </View>
    );
  }

  const renderPost = ({item: post}: {item: TeamPost}) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <View style={styles.avatar}>
            <CharacterAvatar size={40} avatar={post.user.character} />
          </View>
          <View>
            <Text style={styles.userName}>{post.user.nickname}</Text>
            <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>
        <Menu style={styles.menuContainer}>
          <MenuTrigger>
            <View>
              <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
            </View>
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={styles.menuOptions}>
            <MenuOption
              onSelect={() => {
                setNewPostText(post.text);
                const existings = (post.images || []).map(image => ({
                  uri: image,
                }));
                setExistingImages(existings);
                setImages(existings);
                setSelectedPostId(post.id);
                setIsUpdate(true);
              }}
              style={styles.menuOption}>
              <Text>수정</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                Alert.alert('삭제', '정말로 삭제하시겠습니까?', [
                  {
                    text: '취소',
                    onPress: () => {},
                  },
                  {
                    text: '삭제',
                    onPress: () => {
                      handleDeletePost(post.id);
                      setSelectedPostId(null);
                    },
                  },
                ]);
              }}
              style={[styles.menuOption, styles.deleteOption]}>
              <Text style={styles.deleteText}>삭제</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => Alert.alert('공유')}
              style={styles.menuOption}>
              <Text>공유</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      <Text style={styles.postContent}>{post.text}</Text>

      {post.images && post.images.length > 0 && (
        <ImageCarousel images={post.images.map(img => img.uri || img)} />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleComments(post.id)}>
          <Ionicons
            name={
              isCommenting && selectedPostId === post.id
                ? 'chatbubble'
                : 'chatbubble-outline'
            }
            size={20}
            color={
              isCommenting && selectedPostId === post.id ? '#806a5b' : '#666'
            }
          />
          <Text style={styles.actionText}>{post.verifications.length}</Text>
        </TouchableOpacity>
      </View>

      {isCommenting && selectedPostId === post.id && (
        <View style={styles.commentsSection}>
          {post.verifications.length > 0 ? (
            post.verifications.map((verification: any) => (
              <View key={verification.id} style={styles.comment}>
                <View style={styles.commentAvatar}>
                  <CharacterAvatar size={40} avatar={verification.character} />
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentUserName}>
                    {verification.username}
                  </Text>
                  <Text style={styles.commentText}>{verification.text}</Text>
                </View>
                <Text style={styles.commentTime}>
                  {formatDate(verification.createdAt)}
                </Text>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      setCommentText(verification.text);
                      setIsCommentUpdate(true);
                      setCommentId(verification.id);
                    }}>
                    <Text>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('삭제', '정말로 삭제하시겠습니까?', [
                        {
                          text: '취소',
                          onPress: () => {},
                        },
                        {
                          text: '삭제',
                          onPress: () => {
                            handleDeleteComment(verification.id);
                          },
                        },
                      ]);
                    }}>
                    <Text>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>아직 댓글이 없습니다.</Text>
          )}

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 입력하세요..."
              value={commentText}
              onChangeText={setCommentText}
              // onSubmitEditing={() =>
              //   handleAddComment(post.id, {
              //     comment: commentText,
              //   })
              // }
            />
            <TouchableOpacity
              style={
                commentText.trim()
                  ? styles.commentButton
                  : styles.commentButtonDisabled
              }
              onPress={() => {
                if (isCommentUpdate) {
                  if (commentId) {
                    handleUpdateComment(commentId, commentText);
                    setIsCommentUpdate(false);
                    setCommentId(null);
                  }
                } else {
                  handleAddComment(selectedPostId, {
                    comment: commentText,
                  });
                  setCommentText('');
                }
              }}
              disabled={!commentText.trim()}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: '#fff'}}
      edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <FlatList
          data={teamPosts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.feedContainer}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text
                style={styles.teamName}>{`${teamName} 팀의 ${teamQuest}`}</Text>
              <View style={{width: 24}} />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>팀 피드가 비어있습니다.</Text>
              <Text style={styles.emptyStateSubtext}>
                첫 게시물을 작성해보세요!
              </Text>
            </View>
          }
        />

        {!isCommenting && (
          <Animated.View
            style={[
              styles.inputContainer,
              {transform: [{translateY: keyboardOffset}]},
            ]}>
            {images.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {images.map((image, index) => (
                  <TouchableOpacity
                    key={`image-${index}-${image.uri}`}
                    onPress={() => removeImage(index)}
                    style={styles.imageWrapper}>
                    <Image
                      source={{uri: image.uri}}
                      style={styles.imagePreview}
                    />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImages([])}>
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            <View style={[styles.inputRow]}>
              <TextInput
                style={styles.input}
                placeholder="오늘의 활동을 기록하세요..."
                value={newPostText}
                onChangeText={setNewPostText}
                multiline
              />
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Ionicons name="camera" size={24} color="#806a5b" />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.postActionButton, styles.completeButton]}
                onPress={() =>
                  Alert.alert('퀘스트 완료', '이 퀘스트를 완료하시겠습니까?', [
                    {text: '취소', style: 'cancel'},
                    {
                      text: '완료',
                      onPress: () => navigation.goBack(),
                    },
                  ])
                }>
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={styles.completeButtonText}>완료하기</Text>
              </TouchableOpacity>
              {isUpdate ? (
                <TouchableOpacity
                  style={[
                    styles.postActionButton,
                    styles.addButton,
                    !newPostText.trim() &&
                      images.length === 0 && {
                        backgroundColor: '#ccc',
                      },
                  ]}
                  onPress={() =>
                    handleUpdatePost(selectedPostId!, {
                      text: newPostText,
                      images: images,
                    })
                  }
                  disabled={!newPostText.trim() && images.length === 0}>
                  <Ionicons name="add" size={18} color="white" />
                  <Text style={styles.addButtonText}>수정하기</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.postActionButton,
                    styles.addButton,
                    !newPostText.trim() &&
                      images.length === 0 && {
                        backgroundColor: '#ccc',
                      },
                  ]}
                  onPress={handleAddRecord}
                  disabled={!newPostText.trim() && images.length === 0}>
                  <Ionicons name="add" size={18} color="white" />
                  <Text style={styles.addButtonText}>기록 추가</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  feedContainer: {
    paddingBottom: 120,
  },
  postCard: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  commentsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 8,
  },
  commentUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: '#333',
  },
  commentTime: {
    fontSize: 10,
    color: '#999',
    marginLeft: 5,
    alignSelf: 'flex-end',
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    padding: 10,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginRight: 10,
  },
  commentButton: {
    padding: 12,
    backgroundColor: '#806a5b',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentButtonDisabled: {
    padding: 12,
    backgroundColor: '#ccc',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  emptyStateSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 10,
    gap: 10,
  },
  imagePreview: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  imageWrapper: {
    position: 'relative',
    width: '30%',
    marginBottom: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingRight: 45,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#f9f9f9',
  },
  cameraButton: {
    position: 'absolute',
    right: 10,
    padding: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  addButton: {
    backgroundColor: '#806a5b',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  postActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  menuContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  menuOptions: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 100,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuOption: {
    padding: 10,
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deleteText: {
    color: 'red',
  },
});

export default TeamFeedScreen;
