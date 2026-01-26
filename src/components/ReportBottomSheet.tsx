import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {colors} from '../styles/theme';
import {useMutation} from '@tanstack/react-query';
import instance from '../utils/axiosInterceptor';
import analytics from '@react-native-firebase/analytics';

interface ReportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  id: number | null;
  from: 'quest' | 'verification' | 'user';
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
  id,
  from,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReasonText, setOtherReasonText] = useState('');

  const {mutate: reportMutate} = useMutation({
    mutationFn: (reason: string) =>
      from === 'verification'
        ? instance.post(`quest/${from}/report/${id}`, {reason})
        : instance.post(`${from}/report/${id}`, {reason}),
    onSuccess: () => {
      Alert.alert('신고 완료', '신고가 성공적으로 접수되었습니다.');
      analytics().logEvent('report', {
        reason: selectedReason,
        from: from,
      });
      handleClose();
    },
    onError: (error: any) => {
      Alert.alert(
        '오류',
        error.response?.data?.message || '신고 중 오류가 발생했습니다.',
      );
    },
  });

  const handleClose = () => {
    setSelectedReason('');
    setOtherReasonText('');
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('오류', '신고 사유를 선택해주세요.');
      return;
    }

    let reasonToSubmit = selectedReason;
    if (selectedReason === '기타') {
      if (!otherReasonText.trim()) {
        Alert.alert('오류', '기타 사유를 입력해주세요.');
        return;
      }
      reasonToSubmit = otherReasonText.trim();
    }

    reportMutate(reasonToSubmit);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType="slide"
      transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexEnd}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
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
            </TouchableOpacity>
          ))}
          {selectedReason === '기타' && (
            <TextInput
              placeholder="신고 사유를 입력해주세요"
              style={styles.reasonInput}
              value={otherReasonText}
              onChangeText={setOtherReasonText}
              multiline
              maxLength={350}
            />
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                !selectedReason && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason}>
              <Text style={styles.buttonText}>{'제출'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flexEnd: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    backgroundColor: 'white',
    padding: 22,
    paddingBottom: 40,
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
    color: colors.font,
  },
  reasonInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
    marginTop: -5,
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
  disabledButton: {
    backgroundColor: colors.gray,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportBottomSheet;
