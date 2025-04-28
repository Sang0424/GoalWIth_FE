import { View, Text, StyleSheet, Image, ImageResizeMode } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BigLogo({
  resizeMode,
  style,
}: {
  resizeMode?: ImageResizeMode;
  style?: object;
}) {
  return (
    <Image
      source={require('../assets/images/Logo.png')}
      alt="Logo Image"
      resizeMode={resizeMode}
      style={style}
    />
  );
}

// const styles = StyleSheet.create({
//     logo:{
//         fontFamily:'Girassol-Regular',
//         color:'#806A5B',
//         textAlign:'center',
//         fontSize:48,
//       }
// })
