import React, {useState} from 'react';
import {
  View,
  Dimensions,
  Animated,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  StatusBar,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Asset} from 'react-native-image-picker';
import {FlatList} from 'react-native-gesture-handler';
import {colors} from '../styles/theme';
import {Image} from 'expo-image';
import Gallery from 'react-native-awesome-gallery';

const ImageCarousel = ({images}: {images: string[]}) => {
  const scrollX = new Animated.Value(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const {width} = useWindowDimensions();
  const ITEM_WIDTH = width - 70;

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  const onScroll = (event: any) => {
    const slideSize = ITEM_WIDTH;
    const offset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offset / slideSize);
    setActiveIndex(currentIndex);
  };

  const openGallery = (index: number) => {
    setGalleryIndex(index); // 클릭한 이미지의 인덱스로 설정
    setGalleryVisible(true);
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
        renderItem={({item, index}) => (
          <TouchableOpacity
            onPress={() => openGallery(index)}
            activeOpacity={0.9}>
            <Image
              source={{uri: item}}
              style={{
                width: ITEM_WIDTH,
                height: ITEM_WIDTH,
                // resizeMode: 'contain',
              }}
              contentFit="fill"
              placeholder={blurhash}
              transition={1000}
            />
          </TouchableOpacity>
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
      <SafeAreaView>
        <Modal
          visible={galleryVisible}
          transparent={true}
          onRequestClose={() => setGalleryVisible(false)}
          animationType="fade">
          <View style={styles.modalContainer}>
            <StatusBar barStyle="light-content" backgroundColor="black" />
            <SafeAreaView style={styles.closeButtonArea}>
              <TouchableOpacity
                onPress={() => setGalleryVisible(false)}
                style={styles.closeButton}>
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </SafeAreaView>
            <Gallery
              data={images}
              initialIndex={galleryIndex} // 클릭한 사진부터 시작
              onSwipeToClose={() => setGalleryVisible(false)} // 아래로 스와이프 시 닫기
              renderItem={({item}) => (
                // 갤러리 내부에서도 expo-image 사용 (성능 최적화)
                <Image
                  source={{uri: item}}
                  style={{width: '100%', height: '100%'}}
                  contentFit="contain" // 전체화면에서는 잘리지 않게
                  placeholder={blurhash}
                />
              )}
            />
            {/* 상단 닫기 버튼 (커스텀) */}
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButtonArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : StatusBar.currentHeight,
    right: 0,
    zIndex: 10,
    padding: 16,
  },
  closeButton: {
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  closeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ImageCarousel;
