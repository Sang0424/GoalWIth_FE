import { View, StyleSheet, Dimensions } from 'react-native';

export const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  separator: {
    width: Dimensions.get('window').width,
    height: 2,
    backgroundColor: '#ffffff',
    marginVertical: 16,
  },
});

export default Separator;
