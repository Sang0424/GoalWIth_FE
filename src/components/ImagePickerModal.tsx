import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../styles/theme';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}

const ImagePickerModal = ({
  visible,
  onClose,
  onCamera,
  onGallery,
}: ImagePickerModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}>
        <View style={styles.bottomSheet}>
          <Text style={styles.title}>이미지 업로드</Text>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onCamera();
              onClose();
            }}>
            <Ionicons name="camera-outline" size={24} color="#333" />
            <Text style={styles.optionText}>사진 찍기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onGallery();
              onClose();
            }}>
            <Ionicons name="images-outline" size={24} color="#333" />
            <Text style={styles.optionText}>앨범에서 선택</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.cancelButton]}
            onPress={onClose}>
            <Text style={{color: 'red'}}>취소</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
  },
  cancelButton: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 10,
  },
});

export default ImagePickerModal;
