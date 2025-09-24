import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const HelpPage = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: 24}}>
          <Icon
            name={
              Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back-android'
            }
            size={24}
            color={'#000'}
          />
        </Pressable>
        <Text style={styles.title}>GoalWith 가이드</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>퀘스트란?</Text>
          <Text style={styles.text}>
            퀘스트는 여러분이 달성하고자 하는 목표를 의미합니다.{'\n'} 메인
            퀘스트와 서브 퀘스트로 나뉘어져 있어요.{'\n'} 퀘스트를 완료하면
            실천력이 올라가요.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메인 퀘스트</Text>
          <Text style={styles.text}>
            • 가장 중요한 핵심 목표예요.{'\n'} • 장기적인 목표를 설정할 수
            있어요.{'\n'} • 메인 목표는 한번에 하나만 설정할 수 있어요.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>서브 퀘스트</Text>
          <Text style={styles.text}>
            • 메인 퀘스트를 달성하기 위한 작은 단계들이에요.{'\n'} • 단기간 내에
            완료할 수 있는 목표를 설정하세요.{'\n'} • 서브 퀘스트를 완료하면
            경험치를 얻을 수 있어요.{'\n'} • 서브 퀘스트는 한번에 여러 개 설정할
            수 있어요.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>퀘스트 인증 방법</Text>
          <Text style={styles.text}>
            • 피드에서 다른 유저들의 인증 글을 확인하세요.{'\n'} • 인증 글에
            댓글을 남기면 인증이 완료됩니다.{'\n'} • 인증을 진행하면 경험치를
            얻습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>팀 기능</Text>
          <Text style={styles.text}>
            • 같은 목표를 가진 유저들과 팀을 이룰 수 있어요.{'\n'} • 팀원들과
            함께 퀘스트를 완수해보세요.{'\n'} • 서로의 진행 상황을 확인하고
            응원할 수 있어요.{'\n'}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>도움이 필요하시면 문의해주세요.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  footer: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});

export default HelpPage;
