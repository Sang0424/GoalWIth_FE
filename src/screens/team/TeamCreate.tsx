import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useQuestStore} from '@/store/mockData';

const TeamCreateScreen = () => {
  const navigation = useNavigation();

  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      Alert.alert('오류', '팀 이름을 입력해주세요.');
      return;
    }

    // createTeam(teamName.trim());

    Alert.alert('팀 생성 완료', `${teamName} 팀이 성공적으로 생성되었습니다!`, [
      {
        text: '확인',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>팀 정보</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>팀 이름</Text>
            <TextInput
              style={styles.input}
              placeholder="팀 이름을 입력하세요"
              value={teamName}
              onChangeText={setTeamName}
              maxLength={20}
              autoFocus
            />
            <Text style={styles.charCount}>{teamName.length}/20</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>팀 설명 (선택)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="팀에 대한 간단한 설명을 입력하세요"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>공개 설정</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  isPublic && styles.radioButtonActive,
                ]}
                onPress={() => setIsPublic(true)}>
                <View
                  style={[
                    styles.radioOuter,
                    isPublic && styles.radioOuterActive,
                  ]}>
                  {isPublic && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>공개 팀</Text>
                <Text style={styles.radioDescription}>
                  누구나 팀을 찾아 가입할 수 있어요
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioButton,
                  !isPublic && styles.radioButtonActive,
                ]}
                onPress={() => setIsPublic(false)}>
                <View
                  style={[
                    styles.radioOuter,
                    !isPublic && styles.radioOuterActive,
                  ]}>
                  {!isPublic && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>비공개 팀</Text>
                <Text style={styles.radioDescription}>
                  초대를 통해서만 가입할 수 있어요
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons
            name="bulb-outline"
            size={20}
            color="#FFA000"
            style={styles.tipIcon}
          />
          <View>
            <Text style={styles.tipTitle}>팀 생성 팁</Text>
            <Text style={styles.tipText}>
              • 구체적인 목표를 가진 팀을 만들어보세요
              {'\n'}• 팀 이름은 간결하고 명확하게 지어주세요
              {'\n'}• 팀 설명을 상세히 작성하면 더 많은 사람들이 참여할 수
              있어요
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.createButton,
            !teamName && styles.disabledButton,
          ]}
          onPress={handleCreateTeam}
          disabled={!teamName}>
          <Text style={styles.createButtonText}>팀 생성하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the footer
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inputContainer: {
    marginBottom: 25,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  charCount: {
    position: 'absolute',
    right: 10,
    bottom: -20,
    fontSize: 12,
    color: '#999',
  },
  radioGroup: {
    marginTop: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  radioButtonActive: {
    borderColor: '#806a5b',
    backgroundColor: '#f5f0ec',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#806a5b',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#806a5b',
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  radioDescription: {
    fontSize: 12,
    color: '#777',
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFA000',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 12,
    color: '#8D6E63',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  createButton: {
    backgroundColor: '#806a5b',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default TeamCreateScreen;
