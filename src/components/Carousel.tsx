import React from 'react';
import {
  View,
  Image,
  Dimensions,
  Animated,
  useWindowDimensions,
} from 'react-native';
import {Asset} from 'react-native-image-picker';
// import {API_URL} from '@env';
import {FlatList} from 'react-native-gesture-handler';
import {colors} from '../styles/theme';

const ImageCarousel = ({images}: {images: string[]}) => {
  console.log('feed image: ', images);
  const scrollX = new Animated.Value(0);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const {width} = useWindowDimensions();
  const ITEM_WIDTH = width - 70;

  //   const onScroll = (event: any) => {
  //     const slideSize = event.nativeEvent.layoutMeasurement.width;
  //     const offset = event.nativeEvent.contentOffset.x;
  //     const currentIndex = Math.round(offset / slideSize);
  //     setActiveIndex(currentIndex);
  //   };
  const onScroll = (event: any) => {
    const slideSize = ITEM_WIDTH;
    const offset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offset / slideSize);
    setActiveIndex(currentIndex);
  };
  return (
    <View style={{width: ITEM_WIDTH, height: ITEM_WIDTH}}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        snapToInterval={ITEM_WIDTH}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false, listener: onScroll},
        )}
        nestedScrollEnabled={true}
        decelerationRate="fast"
        bounces={false}
        ItemSeparatorComponent={() => <View style={{width: 8}} />}
        renderItem={({item}) => (
          <Image
            source={{uri: item}}
            style={{
              width: ITEM_WIDTH,
              height: 300,
              resizeMode: 'contain',
              borderRadius: 16,
            }}
          />
        )}
        keyExtractor={(_, index) => index.toString()}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />
      {images.length > 1 && (
        <View
          style={{
            flexDirection: 'row',
            position: 'absolute',
            bottom: 0,
            alignSelf: 'center',
          }}>
          {images.map((_, index) => {
            const opacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.gray,
                  margin: 5,
                  opacity,
                }}
              />
            );
          })}
        </View>
      )}
      {/* 인디케이터 */}
    </View>
  );
};

export default ImageCarousel;
