import {
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads';
import {NativeAd} from 'react-native-google-mobile-ads';
import {useState, useEffect} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {colors} from '../styles/theme';
import Config from 'react-native-config';

const NATIVE_AD_ID = Platform.select({
  ios: Config.ADMOB_ID_IOS,
  android: Config.ADMOB_ID_ANDROID,
});

const NATIVE_VERIFICATION_AD_UNIT =
  Config.ENV === 'development' ? TestIds.NATIVE : NATIVE_AD_ID;

// const NATIVE_VERIFICATION_AD_UNIT = TestIds.NATIVE;

export const NativeVerificationAd = () => {
  const [nativeAd, setNativeAd] = useState<NativeAd>();

  useEffect(() => {
    NativeAd.createForAdRequest(NATIVE_VERIFICATION_AD_UNIT as string)
      .then(setNativeAd)
      .catch(console.error);
  }, []);

  if (!nativeAd) {
    return null;
  }

  return (
    <NativeAdView nativeAd={nativeAd} style={{width: '100%'}}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {nativeAd.icon && (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image source={{uri: nativeAd.icon.url}} style={styles.avatar} />
            </NativeAsset>
          )}
          <View style={styles.headerText}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={styles.headline}>{nativeAd.headline}</Text>
            </NativeAsset>
            {nativeAd.advertiser && (
              <Text style={styles.advertiser}>{nativeAd.advertiser}</Text>
            )}
          </View>
          <Text style={styles.sponsored}>Sponsored</Text>
        </View>

        {nativeAd.body && (
          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text style={styles.body}>{nativeAd.body}</Text>
          </NativeAsset>
        )}

        <NativeMediaView style={styles.media} />

        <View style={styles.footer}>
          {nativeAd.callToAction && (
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
              </TouchableOpacity>
            </NativeAsset>
          )}
        </View>
      </View>
    </NativeAdView>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  headline: {fontSize: 16, fontWeight: 'bold', color: colors.font},
  advertiser: {fontSize: 12, color: colors.gray},
  sponsored: {fontSize: 12, color: colors.accent},
  body: {fontSize: 14, color: colors.font, marginBottom: 12},
  media: {height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 12},
  footer: {flexDirection: 'row', justifyContent: 'flex-end'},
  ctaButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ctaText: {color: colors.btnFont, fontWeight: 'bold'},
  headerText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default NativeVerificationAd;
