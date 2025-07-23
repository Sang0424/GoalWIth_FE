import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AppInfoPage = () => {
  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>GoalWith</Text>
          <Text style={styles.version}>버전 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <Text style={styles.description}>
            GoalWith는 목표 달성을 위한 게이미피케이션 소셜 플랫폼입니다.
            퀘스트를 통해 목표를 설정하고 달성하는 과정을 재미있게 경험해보세요.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이용 약관 및 정책</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('https://picoquest.app/terms')}>
            <Text style={styles.linkText}>이용약관</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('https://picoquest.app/privacy')}>
            <Text style={styles.linkText}>개인정보 처리방침</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('mailto:support@picoquest.app')}>
            <Text style={styles.linkText}>문의하기</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>만든 사람들</Text>
          <Text style={styles.text}>GoalWith 팀</Text>
          <Text style={[styles.text, styles.smallText]}>
            2025 GoalWith. All rights reserved.
          </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 15,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 5,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  smallText: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
});

export default AppInfoPage;
