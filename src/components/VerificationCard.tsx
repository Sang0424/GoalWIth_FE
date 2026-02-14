import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {VerificationNavParamList} from '../types/navigation';
import {useState} from 'react';
import instance from '../utils/axiosInterceptor';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ReactionButton from './ReactionButton';
import CharacterAvatar from './CharacterAvatar';
import {Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../styles/theme';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import {StyleSheet, Alert} from 'react-native';
import useReactionData from '../utils/hooks/useReactionData';
import {userStore} from '../store/userStore';
import ProfileBottomSheet from './ProfileBottomSheet';
import {Image} from 'expo-image';
import ReportBottomSheet from './ReportBottomSheet';

const VerificationCard = ({item}: {item: any}) => {
  const user = userStore(state => state.user);
  const navigation =
    useNavigation<NativeStackNavigationProp<VerificationNavParamList>>();
  const [isProfileVisible, setProfileVisible] = useState(false);
  const [isReportVisible, setReportVisible] = useState(false);
  const [selecteUser, setSelectUser] = useState<number | undefined>(item.user.id);
  const reactions = useReactionData(item.id);
  const queryClient = useQueryClient();
  const {mutate: saveQuest} = useMutation({
    mutationFn: async (questId: number) => {
      const response = await instance.post(`/quest/${questId}/bookmark`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['verification']});
      queryClient.invalidateQueries({queryKey: ['myBookmarkCount']});
      Toast.show({type: 'success', text1: '저장되었습니다'});
    },
    onError: (error: any) => {
      Toast.show({type: 'error', text1: error.response.data.message});
    },
  });

  const {mutate: cancelSaveQuest} = useMutation({
    mutationFn: async (questId: number) => {
      const response = await instance.delete(`/quest/${questId}/bookmark`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['verification']});
      queryClient.invalidateQueries({queryKey: ['myBookmarkCount']});
      Toast.show({type: 'success', text1: '저장이 취소되었습니다'});
    },
    onError: (error: any) => {
      Toast.show({type: 'error', text1: error.response.data.message});
    },
  });

  const alreadyVerification = item.verified;


  const handleGoQuest = () => {
    navigation.navigate('QuestVerification', {
      id: item.id,
      authorId: item.user.id,
    });
  };

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  const recordImages = (item.records ?? []).flatMap((record: any) =>
    (record.images ?? [])
      .filter((uri: string | undefined): uri is string => Boolean(uri))
      .map((uri: string, idx: number) => ({
        key: `${record.id ?? 'record'}-${idx}`,
        uri,
      })),
  );
  return (
    <>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={handleGoQuest}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => {
            setSelectUser(item.user.id);
            setProfileVisible(true);
          }}>
          <CharacterAvatar
            size={40}
            level={item.user.level}
            avatar={item.user.character}
          />
          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={styles.nickname}>
              {item.user.nickname} (Lv.{item.user.level})
            </Text>
            {/* <Text style={styles.badge}>{item.user.badge}</Text> */}
          </View>
          {/* <Text style={styles.timestamp}>
          {formatRelativeTime(item.createdAt)}
        </Text> */}
          <Menu style={styles.menuContainer}>
            <MenuTrigger>
              <View>
                <Icon name="more-vert" size={24} color="#888" />
              </View>
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={styles.menuOptions}>
              <MenuOption
                onSelect={() => {
                  item.bookmarked
                    ? cancelSaveQuest(item.id)
                    : saveQuest(item.id);
                }}
                style={styles.menuOption}>
                {item.bookmarked ? (
                  <Icon name="bookmark" size={20} color={colors.primary} />
                ) : (
                  <Icon
                    name="bookmark-outline"
                    size={20}
                    color={colors.primary}
                  />
                )}
                <Text>저장하기</Text>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  setReportVisible(true);
                }}
                style={styles.menuOption}>
                <Icon name="flag" size={20} color={colors.primary} />
                <Text>신고하기</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </TouchableOpacity>
        <View style={styles.questInfo}>
          <Text style={styles.questTitle}>{item.title}</Text>
        </View>
        {item.records && item.records.length > 0 && (
          <View style={styles.imageGrid}>
            {recordImages.slice(0, 4).map((record: any) => (
              <View key={record.key} style={styles.gridItem}>
                <Image
                  source={{uri: record.uri}}
                  style={styles.gridImage}
                  placeholder={blurhash}
                  transition={1000}
                />
              </View>
            ))}
          </View>
        )}
        <Text style={styles.contentText}>{item.description}</Text>
        <View style={styles.reactionsRow}>
          <ReactionButton
            targetType="quest"
            targetId={item.id}
            myReaction={reactions.counts?.myReaction}
            reactionType="support"
            count={reactions.counts?.support}
          />
          <ReactionButton
            targetType="quest"
            targetId={item.id}
            reactionType="amazing"
            myReaction={reactions.counts?.myReaction}
            count={reactions.counts?.amazing}
          />
          <ReactionButton
            targetType="quest"
            targetId={item.id}
            reactionType="together"
            myReaction={reactions.counts?.myReaction}
            count={reactions.counts?.together}
          />
          <ReactionButton
            targetType="quest"
            targetId={item.id}
            reactionType="perfect"
            myReaction={reactions.counts?.myReaction}
            count={reactions.counts?.perfect}
          />
        </View>
        {/* 인증자 수 표시 */}
        <Text style={{color: colors.accent, fontWeight: 'bold', marginTop: 6}}>
          현재 {item.verificationCount}
          명이 인증했습니다.
        </Text>
        <TouchableOpacity
          style={styles.verifyBtn}
          onPress={handleGoQuest}
          activeOpacity={0.85}>
          {alreadyVerification ? (
            <Text style={styles.verifyBtnText}>이미 인증했습니다</Text>
          ) : (
            <Text style={styles.verifyBtnText}>인증하기</Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
       <ProfileBottomSheet
        visible={isProfileVisible}
        onClose={() => setProfileVisible(false)}
        userId={selecteUser}
        fromContext="general"
      /> 
      <ReportBottomSheet
        visible={isReportVisible}
        onClose={() => setReportVisible(false)}
        id={item.id}
        from="quest"
      />
    </>
  );
};
export default VerificationCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  menuOptions: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 100,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 99,
    marginRight: 12,
    backgroundColor: colors.gray,
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.font,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 8,
  },
  questInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.font,
  },
  feedImage: {
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: colors.switchBG,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginHorizontal: -2,
  },
  gridItem: {
    width: '25%',
    aspectRatio: 1,
    padding: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
    width: '100%',
  },
  contentText: {
    fontSize: 14,
    color: colors.font,
    marginBottom: 8,
    marginTop: 8,
  },
  verifyBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyBtnText: {
    color: colors.btnFont,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
