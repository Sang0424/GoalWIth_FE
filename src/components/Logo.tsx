import {View, Text, StyleSheet, Image, ImageResizeMode} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function BigLogo({
  resizeMode,
  imageStyle,
}: {
  resizeMode?: ImageResizeMode;
  imageStyle?: object;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
      <Image
        source={require('../assets/images/Logo.png')}
        alt="Logo Image"
        resizeMode={resizeMode}
        style={[imageStyle, {margin: 0, padding: 0}]}
      />
    </View>
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
