import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {colors} from '../styles/theme';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import instance from '../utils/axiosInterceptor';

interface ReportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  verificationId: number | null;
}

const reportReasons = [
  '스팸 또는 광고',
  '욕설 또는 비방',
  '음란물 또는 성적인 콘텐츠',
  '잘못된 정보',
  '기타',
];

const ReportBottomSheet: React.FC<ReportBottomSheetProps> = ({
  visible,
  onClose,
  verificationId,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {mutate: reportMutate} = useMutation({
    mutationFn: (reason: string) =>
      instance.post(`/report/${verificationId}`, {
        reason,
      }),
    onSuccess: () => {
      Alert.alert('신고 완료', '신고가 성공적으로 접수되었습니다.');
      onClose();
      setSelectedReason('');
      setIsLoading(false);
    },
    onError: (error: any) => {
      Alert.alert(
        '오류',
        error.response?.data?.message || '신고 중 오류가 발생했습니다.',
      );
      setIsLoading(false);
    },
  });

  const handleSubmit = () => {
    if (selectedReason) {
      setIsLoading(true);
      reportMutate(selectedReason);
      onClose();
    } else {
      Alert.alert('오류', '신고 사유를 선택해주세요.');
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent
      statusBarTranslucent
      style={styles.modal}>
      <View style={styles.container}>
        <View style={styles.handle} />
        <Text style={styles.title}>신고하기</Text>
        {reportReasons.map(reason => (
          <TouchableOpacity
            key={reason}
            style={[
              styles.reasonButton,
              selectedReason === reason && styles.selectedReason,
            ]}
            onPress={() => setSelectedReason(reason)}>
            <Text
              style={[
                styles.reasonText,
                selectedReason === reason && styles.selectedReasonText,
              ]}>
              {reason}
            </Text>
            {reason === '기타' && (
              <View>
                <TextInput
                  placeholder="신고 사유를 입력해주세요"
                  style={styles.reasonInput}
                  value={selectedReason}
                  onChangeText={setSelectedReason}
                  multiline
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}>
            <Text style={styles.buttonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isLoading || selectedReason === ''}>
            <Text style={styles.buttonText}>
              {isLoading ? '제출 중...' : '제출'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: 'white',
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.gray,
    borderRadius: 2.5,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  reasonButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray,
    marginBottom: 10,
  },
  selectedReason: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reasonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginTop: 12,
  },
  selectedReasonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportBottomSheet;
