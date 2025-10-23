import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTeamStore} from '../../store/mockData';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {TeamNavParamList} from '../../types/navigation';
import {API_URL} from '@env';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import instance from '../../utils/axiosInterceptor';
import {TeamPayload, TeamCreationResponse} from '../../types/team.types';

const TeamCreateScreen = ({route}: {route: any}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TeamNavParamList>>();
  const {teamToEdit} = route.params || {};
  console.log('editTeam:', teamToEdit);
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const {updateTeam} = useTeamStore();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (teamToEdit) {
      setTeamName(teamToEdit.name);
      setDescription(teamToEdit.description || '');
      setIsPublic(teamToEdit.isPublic || false);
    }
  }, [teamToEdit]);

  const {mutate, isPending} = useMutation<
    TeamCreationResponse,
    Error,
    TeamPayload
  >({
    // 3. mutationFn 내부에서 API_URL에 따라 로직 분기
    mutationFn: async (payload: TeamPayload) => {
      if (API_URL === '') {
        // 로컬 모드: API 호출 없이 성공한 것처럼 응답 객체를 시뮬레이션하여 반환
        console.log('로컬 모드: 팀 생성 시뮬레이션', payload);
        // onSuccess 콜백에서 일관된 데이터 처리를 위해
        // 실제 API와 유사한 구조의 객체를 Promise로 감싸서 반환합니다.
        return Promise.resolve({data: {teamId: '0'}}); // '0'은 로컬 모드를 의미하는 임시 ID
      } else {
        // 백엔드 모드: 실제 API 호출
        if (teamToEdit) {
          return instance.put(`/team/${teamToEdit.id}`, payload);
        }
        return instance.post(`/team/create`, payload);
      }
    },

    // 4. onSuccess 콜백 통합: 이제 로컬/백엔드 모드 모두 이 로직을 따름
    onSuccess: response => {
      // response는 mutationFn이 반환한 값 (실제 API 응답 또는 시뮬레이션된 객체)
      const {teamId} = response.data;

      Alert.alert('성공', '팀이 추가되었습니다!');

      // 상태 초기화
      setTeamName('');
      setDescription('');
      setIsPublic(true);

      // 백엔드 모드일 때만 쿼리 데이터 조작
      if (API_URL !== '') {
        queryClient.setQueryData(['TeamCreate'], response);
      }

      // teamToEdit 로직은 주로 수정 화면에서 사용되므로, 생성 로직에서는 제외하거나 별도 처리합니다.
      // 여기서는 항상 생성 후 퀘스트 생성 화면으로 이동한다고 가정합니다.
      navigation.navigate('TeamQuestCreateScreen', {
        teamName, // 새로 생성한 팀 이름
        data: teamId, // 실제 teamId 또는 임시 ID '0'
      });
    },

    onError: error => {
      // onError는 실제 API 호출 시에만 의미가 있으므로, 주로 백엔드 모드를 위한 것
      Alert.alert('오류', '팀 추가 중 오류가 발생했습니다.');
      console.error(error);
    },

    onSettled: () => {
      // 백엔드 모드일 때만 팀 목록 쿼리를 무효화하여 새로고침
      if (API_URL !== '') {
        queryClient.invalidateQueries({queryKey: ['Team']});
      }
    },
  });

  // 5. handleCreateTeam 함수 통합
  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      Alert.alert('오류', '팀 이름을 입력해주세요.');
      return;
    }

    // 수정 로직은 별도의 함수(예: handleUpdateTeam)로 분리하는 것이 좋습니다.
    if (teamToEdit) {
      // TODO: 팀 수정 로직 구현
      console.log('팀 수정 로직을 여기에 구현하세요.');
      updateTeam(teamToEdit.id, {
        name: teamName.trim(),
        description: description.trim(),
        isPublic: isPublic,
      });
      navigation.navigate('TeamScreen'); // 기존 로직 유지
      return;
    }

    // 생성할 데이터를 객체로 만들어 mutate 함수에 전달
    const payload: TeamPayload = {
      name: teamName.trim(),
      description: description.trim(),
      isPublic: isPublic,
    };

    mutate(payload);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <View style={styles.header}>
              <Text style={styles.sectionTitle}>팀 정보</Text>
              <Ionicons
                name="close"
                size={32}
                color="#333"
                onPress={() => navigation.goBack()}
              />
            </View>
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
            onPress={() => handleCreateTeam()}
            disabled={!teamName}>
            <Text style={styles.createButtonText}>팀 퀘스트 만들기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the footer
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
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
