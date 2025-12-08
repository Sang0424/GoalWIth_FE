import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../styles/theme';

const AppInfoPage = () => {
  const navigation = useNavigation();
  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{position: 'absolute', left: 24}}>
            <Icon
              name={
                Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back-android'
              }
              size={24}
              color={'#000'}
            />
          </Pressable>
          <View style={styles.header}>
            <Text style={styles.title}>GoalWith</Text>
            <Text style={styles.version}>버전 1.0.0</Text>
          </View>
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
            onPress={() =>
              openLink(
                'https://satin-gallium-b49.notion.site/2ab7d463a92480cf96c2d4b82b7f4f09',
              )
            }>
            <Text style={styles.linkText}>이용약관</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() =>
              openLink(
                'https://satin-gallium-b49.notion.site/2ab7d463a92480f999cde16f442722c7?pvs=74',
              )
            }>
            <Text style={styles.linkText}>개인정보 처리방침</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.divider} />
          {/* <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('mailto:support@picoquest.app')}>
            <Text style={styles.linkText}>문의하기</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity> */}
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
    backgroundColor: colors.background,
  },
  scrollView: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.font,
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: colors.gray,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.font,
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.font,
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
    color: colors.font,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray,
    marginLeft: 5,
  },
  text: {
    fontSize: 14,
    color: colors.font,
    marginBottom: 5,
  },
  smallText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 10,
  },
});

export default AppInfoPage;
