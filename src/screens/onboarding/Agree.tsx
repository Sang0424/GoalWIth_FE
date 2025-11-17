import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, View, Pressable, StyleSheet} from 'react-native';
import BigLogo from '../../components/Logo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

export default function Agree() {
  const navigation = useNavigation();
  return (
    <SafeAreaView>
      <Pressable
        style={styles.closeButton}
        //</SafeAreaView>onPress={() => navigation.navigate('Onboarding3')}>
      >
        <Icon name="close" size={32} color="#000" />
      </Pressable>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
          justifyContent: 'center',
          marginTop: 72,
        }}>
        <BigLogo
          resizeMode="contain"
          imageStyle={{width: 80, height: 80, marginRight: 24}}
        />
        <Text
          style={{
            fontSize: 40,
            lineHeight: 40,
            fontWeight: 'bold',
            color: '#806A5B',
            textAlign: 'center',
          }}>
          GoalWith
        </Text>
      </View>
      <View style={{flex: 3}}>
        <Text>약관동의</Text>
      </View>
      <View style={{flex: 1}}>
        <Pressable>
          <Text>이전</Text>
        </Pressable>
        <Pressable>
          <Text>다음</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 72,
    right: 32,
    padding: 16,
    zIndex: 10,
  },
});
