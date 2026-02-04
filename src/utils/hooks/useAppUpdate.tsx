import {useEffect} from 'react';
import {Alert, Linking} from 'react-native';
import VersionCheck from 'react-native-version-check';

const useAppUpdate = () => {
  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    try {
      // 1. 최신 버전 정보 가져오기 (비동기)
      const update = await VersionCheck.needUpdate({country: 'kr'});

      // update.isNeeded: 업데이트 필요 여부 (true/false)
      // update.currentVersion: 현재 앱 버전
      // update.latestVersion: 스토어에 올라간 최신 버전
      // update.storeUrl: 스토어 링크 URL

      if (update && update.isNeeded) {
        Alert.alert(
          '업데이트 알림',
          `새로운 버전(${update.latestVersion})이 출시되었습니다.\n더 나은 서비스 이용을 위해 업데이트를 진행해주세요.`,
          [
            {
              text: '나중에 하기',
              style: 'cancel',
            },
            {
              text: '업데이트',
              onPress: () => {
                // 스토어 링크로 이동
                if (update.storeUrl) {
                  Linking.openURL(update.storeUrl);
                }
              },
            },
          ],
          {cancelable: false}, // 뒤로가기 버튼으로 알림 닫기 방지 (선택 사항)
        );
      }
    } catch (error) {
      console.log('Version Check Error:', error);
      // 에러 발생 시(스토어 정보 못 가져옴 등) 조용히 넘어감
    }
  };
};

export default useAppUpdate;
