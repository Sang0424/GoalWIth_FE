import {View, StyleSheet, Dimensions} from 'react-native';
import {colors} from '../styles/theme';

export const Separator = ({
  paddingHorizontal = 0,
}: {
  paddingHorizontal?: number;
}) => (
  <View
    style={[
      styles.separator,
      {width: Dimensions.get('window').width - paddingHorizontal},
    ]}
  />
);

const styles = StyleSheet.create({
  separator: {
    height: 2,
    backgroundColor: colors.switchBG,
    marginVertical: 16,
  },
});

export default Separator;
