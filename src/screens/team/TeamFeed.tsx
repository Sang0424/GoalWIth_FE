import React, {useState} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTeamStore} from '../../store/mockData';
import {Team, TeamPost, TeamComment} from '../../types/team.types';
import {TeamFeedProps} from '@/types/navigation';
import {useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {Keyboard} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageCarousel from '../../components/Carousel';
import {useQuestStore} from '../../store/mockData';
import useKeyboardHeight from '../../utils/hooks/useKeyboardHeight';

const TeamFeedScreen = () => {
  const navigation = useNavigation<TeamFeedProps>();

  const route = useRoute<TeamFeedProps>();
  const {teamId} = route.params;
  const {keyboardHeight} = useKeyboardHeight();

  const quest = useQuestStore(state => state.getQuestById(teamId));

  const {teams, createTeamPost, addComment, getTeamById} = useTeamStore();
  const [newPostText, setNewPostText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const team = getTeamById(teamId);

  if (!team) {
    return (
      <View style={styles.centerContainer}>
        <Text>팀을 찾을 수 없습니다.</Text>
      </View>
    );
  }
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  // 200 duration is somewhat a magic number that seemed to work nicely with
  // the default keyboard opening speed
  const startAnimation = (toValue: number) =>
    Animated.timing(keyboardOffset, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();

  useEffect(() => {
    const keyboardWillShow = (e: any) => {
      startAnimation(-e.endCoordinates?.height + 81);
    };

    const keyboardWillHide = () => {
      startAnimation(0);
    };

    // Add listeners
    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      keyboardWillShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      keyboardWillHide,
    );

    // Clean up
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleAddRecord = async () => {
    if (!newPostText.trim() && images.length === 0) {
      Alert.alert('오류', '기록할 내용을 입력해주세요.');
      return;
    }

    if (images.length > 3) {
      Alert.alert('오류', '이미지는 최대 3장까지만 선택할 수 있습니다.');
      return;
    }

    // Fix: Call the store function correctly
    createTeamPost(teamId, {
      userId: team.leaderId,
      content: newPostText.trim(),
      images: images.length > 0 ? images : undefined,
    });

    // Reset form
    setNewPostText('');
    setImages([]);

    // Show success message
    Alert.alert('성공', '기록이 추가되었습니다!');
  };

  const handleCompleteQuest = () => {
    Alert.alert('퀘스트 완료', '이 퀘스트를 완료하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '완료',
        onPress: () => {
          useQuestStore.getState().completeQuest(teamId);
          navigation.goBack();
        },
      },
    ]);
  };

  const pickImage = () => {
    const options: any = {
      mediaType: 'photo',
      selectionLimit: 3 - images.length,
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 1, // 0-1 where 1 is best quality
      includeBase64: false,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
      } else if (response.assets?.length) {
        const newImages = response.assets
          .map((asset: any) => asset.uri)
          .filter((uri: string) => uri);
        setImages(prev => [...prev, ...newImages].slice(0, 3));
      }
    });
  };
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일 ${String(date.getHours()).padStart(
      2,
      '0',
    )}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;

    addComment(teamId, postId, {
      userId: team.leaderId,
      content: commentText.trim(),
    });

    setCommentText('');
  };

  //   const toggleLike = (postId: string) => {
  //     likeTeamPost(teamId, postId, team.leaderId);
  //   };

  const toggleComments = (postId: string) => {
    if (isCommenting && selectedPostId === postId) {
      setIsCommenting(false);
      setSelectedPostId(null);
    } else {
      setIsCommenting(true);
      setSelectedPostId(postId);
    }
  };

  const renderPost = ({item: post}: {item: TeamPost}) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.userId.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{post.userId}</Text>
            <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.images && post.images.length > 0 && (
        <ImageCarousel images={post.images} />
      )}

      <View style={styles.postActions}>
        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleLike(post.id)}>
          <Ionicons
            name={post.reactions.includes(user.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={post.reactions.includes(user.id) ? '#ff4444' : '#666'}
          />
          <Text
            style={[
              styles.actionText,
              {color: post.reactions.includes(post.userId) ? '#ff4444' : '#666'},
            ]}>
            {post.reactions.length}
          </Text>
        </TouchableOpacity> */}

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
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>
      </View>

      {isCommenting && selectedPostId === post.id && (
        <View style={styles.commentsSection}>
          {post.comments.length > 0 ? (
            post.comments.map((comment: TeamComment) => (
              <View key={comment.id} style={styles.comment}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {comment.userId.charAt(0)}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentUserName}>{comment.userId}</Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
                <Text style={styles.commentTime}>
                  {formatDate(comment.createdAt)}
                </Text>
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
              onSubmitEditing={() => handleAddComment(post.id)}
            />
            <TouchableOpacity
              style={
                commentText.trim()
                  ? styles.commentButton
                  : styles.commentButtonDisabled
              }
              onPress={() => handleAddComment(post.id)}
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
          data={team.feed}
          style={!keyboardHeight ? {marginBottom: 40} : undefined}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.feedContainer]}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.teamName}>{team.name}</Text>
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

        <Animated.View
          style={[
            styles.inputContainer,
            {transform: [{translateY: keyboardOffset}]},
          ]}>
          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <TouchableOpacity
                  key={`image-${index}-${image}`}
                  onPress={() => removeImage(index)}
                  style={styles.imageWrapper}>
                  <Image source={{uri: image}} style={styles.imagePreview} />
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
              onPress={handleCompleteQuest}>
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.completeButtonText}>완료하기</Text>
            </TouchableOpacity>
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
              <Text
                style={
                  !newPostText.trim() && images.length === 0
                    ? styles.addButtonText
                    : styles.addButtonText
                }>
                기록 추가
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    paddingBottom: 80,
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
  // commentButtonText: {
  //   color: 'white',
  //   fontSize: 12,
  // },
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
});

export default TeamFeedScreen;
