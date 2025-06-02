import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext, TeamPost, TeamComment } from '../contexts/AppContext';

interface TeamFeedScreenRouteParams {
  teamId: string;
}

interface PostItem extends TeamPost {
  id: string;
  userId: string;
  content: string;
  image?: string;
  likes: string[];
  comments: TeamComment[];
  createdAt: string;
}

interface CommentItem extends TeamComment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

const TeamFeedScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { teamId } = route.params as TeamFeedScreenRouteParams;
  
  const { teams, user, addTeamPost, likeTeamPost, addCommentToPost } = useAppContext();
  const [newPostText, setNewPostText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  const team = teams.find(t => t.id === teamId);
  
  if (!team) {
    return (
      <View style={styles.centerContainer}>
        <Text>팀을 찾을 수 없습니다.</Text>
      </View>
    );
  }
  
  const handleAddPost = () => {
    if (!newPostText.trim()) return;
    
    addTeamPost(teamId, {
      userId: user.id,
      content: newPostText.trim(),
    });
    
    setNewPostText('');
  };
  
  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    
    addCommentToPost(teamId, postId, {
      userId: user.id,
      content: commentText.trim(),
    });
    
    setCommentText('');
    setSelectedPostId(null);
    setIsCommenting(false);
  };
  
  const toggleLike = (postId: string) => {
    likeTeamPost(teamId, postId, user.id);
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}분 전`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    }
  };

  const renderPost = ({ item: post }: { item: PostItem }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.image && (
        <Image 
          source={{ uri: post.image }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleLike(post.id)}
        >
          <Ionicons 
            name={post.likes.includes(user.id) ? 'heart' : 'heart-outline'} 
            size={20} 
            color={post.likes.includes(user.id) ? '#ff4444' : '#666'} 
          />
          <Text style={[
            styles.actionText,
            { color: post.likes.includes(user.id) ? '#ff4444' : '#666' }
          ]}>
            {post.likes.length}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleComments(post.id)}
        >
          <Ionicons 
            name={isCommenting && selectedPostId === post.id ? 'chatbubble' : 'chatbubble-outline'} 
            size={20} 
            color={isCommenting && selectedPostId === post.id ? '#806a5b' : '#666'} 
          />
          <Text style={styles.actionText}>
            {post.comments.length}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isCommenting && selectedPostId === post.id && (
        <View style={styles.commentsSection}>
          {post.comments.length > 0 ? (
            post.comments.map((comment: CommentItem) => (
              <View key={comment.id} style={styles.comment}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {user.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentUserName}>{user.name}</Text>
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
              style={styles.commentButton}
              onPress={() => handleAddComment(post.id)}
              disabled={!commentText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={commentText.trim() ? '#806a5b' : '#ccc'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={team.feed}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feedContainer}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.teamName}>{team.name}</Text>
            <View style={{ width: 24 }} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>팀 피드가 비어있습니다.</Text>
            <Text style={styles.emptyStateSubtext}>첫 게시물을 작성해보세요!</Text>
          </View>
        }
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`${team.name} 팀원들에게 알려주세요!`}
          value={newPostText}
          onChangeText={setNewPostText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newPostText.trim() && styles.sendButtonDisabled]}
          onPress={handleAddPost}
          disabled={!newPostText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={newPostText.trim() ? 'white' : '#ccc'} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 10,
  },
  commentButton: {
    padding: 5,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#806a5b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
});

export default TeamFeedScreen;
