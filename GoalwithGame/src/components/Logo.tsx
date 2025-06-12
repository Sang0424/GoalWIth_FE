import { Image, ImageResizeMode } from 'react-native';

export default function Logo({
  resizeMode,
  style,
}: {
  resizeMode?: ImageResizeMode;
  style?: object;
}) {
  return (
    <Image
      source={require('../assets/logo/Logo.png')}
      alt="Logo Image"
      resizeMode={resizeMode}
      style={style}
    />
  );
}