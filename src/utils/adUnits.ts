import {Platform} from 'react-native';

export const NATIVE_VERIFICATION_AD_UNIT = __DEV__
  ? Platform.select({
      ios: 'ca-app-pub-3479406355847634/3230001868',
      android: 'ca-app-pub-3479406355847634/7782941655',
    })
  : null;
