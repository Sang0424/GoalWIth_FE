import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  AddFeedNavParmList,
  AddFeedProps,
  HomeNavParamList,
} from '../../types/navigation';
import { useState, useEffect, useRef } from 'react';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import useKeyboardHeight from '../../utils/hooks/useKeyboardHeight';
import { useMutation, useQuery } from '@tanstack/react-query';
import { userStore } from '../../store/userStore';
import { API_URL } from '@env';
import instance from '../../utils/axiosInterceptor';
import type { ImageType } from '../../types/todos';

export default function AddFeed({ route }: AddFeedProps) {
  const user = userStore(state => state.user);
  const { width, height } = useWindowDimensions();
  const [selectImages, setSelectImages] = useState<Asset[]>([]);
  const { keyboardHeight } = useKeyboardHeight();
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: -(keyboard.height.value - insets.bottom - 16) }],
  }));
  const navigation =
    useNavigation<NativeStackNavigationProp<AddFeedNavParmList>>();

  const [feed, setFeed] = useState({
    todo: route?.params.feed.todo || '',
    tag: route?.params.feed.tag || '',
    content: route?.params.feed.content || '',
  });
  // Create a new state to track which images are from backend
  const [existingImages, setExistingImages] = useState<ImageType[]>([]);

  useEffect(() => {
    if (route?.params?.feed?.images) {
      setExistingImages(route.params.feed.images);
      // Convert for display purposes only
      const displayImages: Asset[] = route.params.feed.images.map(
        (image: ImageType) => ({
          uri: API_URL + image.url,
          fileName: image.name,
          type: 'image/jpeg',
        }),
      );
      setSelectImages(displayImages);
    }
  }, [route?.params?.feed?.images]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setFeed(prev => ({
      ...prev,
      tag: '',
    }));
  }, [feed.todo]);
  const chooseImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      selectionLimit: 3,
    };
    const response: ImagePickerResponse = await launchImageLibrary(options);
    if (response.didCancel) {
      console.log('사용자가 사진 선택을 취소했습니다.');
    } else if (response.errorCode) {
      console.log('사진 선택 중 오류가 발생했습니다.');
    } else if (response.assets) {
      const images: Asset[] = [];
      response.assets?.forEach((asset: Asset) => {
        images.push(asset);
      });
      setSelectImages(selectImages.concat(images));
    }
  };
  const isComplete = feed.tag != '' && feed.todo != '' && feed.content != '';
  const uploadFeed = async () => {
    const formData = new FormData();
    formData.append('feed', JSON.stringify(feed));

    if (existingImages.length > 0) {
      // Send just the image IDs or minimal required data
      formData.append(
        'existing_images',
        JSON.stringify(
          existingImages.map(img => ({
            id: img.id,
            name: img.name,
            url: img.url,
          })),
        ),
      );
    }
    if (selectImages.length > 0) {
      selectImages.forEach((image, index) => {
        !image.uri?.startsWith(API_URL) &&
          formData.append('images', {
            uri: image.uri,
            name: image.fileName || `image${index}.jpg`,
            type: image.type || 'image/jpeg',
          });
      });
    }

    const response = route.params.feed.id
      ? await instance.put(`/feeds/${route.params.feed.id}`, formData)
      : await instance.post(`/feeds/uploadFeed`, formData);
    return response;
  };
  const { data, mutate, error } = useMutation({
    mutationFn: uploadFeed,
  });
  const handleSubmit = () => {
    mutate(undefined, {
      onSuccess: response => {
        setFeed({
          todo: '',
          tag: '',
          content: '',
        });
        setSelectImages([]);
        navigation.navigate('BottomNav', {
          screen: 'FeedNav',
          params: {
            screen: 'PostDetail',
            params: { feed_id: response.data.id },
          },
        });
      },
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...selectImages];
    const removedImage = newImages[index];

    // If the image is from backend (has API_URL in uri), remove from existingImages
    if (removedImage.uri?.startsWith(API_URL)) {
      const newExistingImages = existingImages.filter(
        img => API_URL + img.url !== removedImage.uri,
      );
      setExistingImages(newExistingImages);
    }

    // Remove from selectImages as before
    newImages.splice(index, 1);
    setSelectImages(newImages);
  };

  return (
    <SafeAreaView style={{ flex: 1, position: 'relative' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.header, { width: width }]}>
          <Icon
            name="close"
            size={32}
            color="#0000000"
            onPress={() => navigation.goBack()}
            style={{ position: 'absolute', left: 24 }}
          />
          <Text style={styles.headerTitle}>기록 추가</Text>
          <Pressable
            style={isComplete ? styles.completeBtn : styles.completeBtnDisabled}
            onPress={isComplete ? handleSubmit : null}
          >
            <Text
              style={
                isComplete
                  ? { fontSize: 16, color: '#ffffff' }
                  : { fontSize: 16, color: '#a1a1a1' }
              }
            >
              완료
            </Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
      <View>
        <Pressable
          style={styles.selectTodoContainer}
          onPress={() => navigation.push('SelectTodo', { feed, setFeed })}
        >
          <Text>할 일 선택</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#a1a1a1' }}>
              {feed.todo == '' ? '선택' : feed.todo}
            </Text>
            <Icon name="chevron-right" size={24} color={'#a1a1a1'} />
          </View>
        </Pressable>
        <Pressable
          style={styles.selectTodoContainer}
          onPress={() => navigation.push('SelectTag', { feed, setFeed })}
        >
          <Text style={{ letterSpacing: 1 }}>태그 선택</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#a1a1a1' }}>
              {feed.tag == '' ? '선택' : feed.tag}
            </Text>
            <Icon name="chevron-right" size={24} color={'#a1a1a1'} />
          </View>
        </Pressable>
      </View>
      {/* <Animated.View style={[{ flex: 1, flexGrow: 1 }, animatedStyles]}> */}
      <View style={{ flex: 1 }}>
        {/* <KeyboardAvoidingView> */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={[
            styles.feedContent,
            !!keyboardHeight && { marginBottom: keyboardHeight + 20 },
          ]}
        >
          <TextInput
            style={{ fontSize: 16 }}
            placeholder="어떤 노력을 하였는지 기록해주세요."
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            multiline={true}
            maxLength={200}
            returnKeyLabel="done"
            returnKeyType="done"
            value={feed.content}
            scrollEnabled={false}
            onChangeText={text => setFeed({ ...feed, content: text })}
          />
          {selectImages.length > 0 && (
            <View
              style={[
                {
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: 16,
                },
              ]}
            >
              {selectImages.map((image, index) => (
                <Pressable
                  key={`image-${index}-${image.uri}`}
                  onPress={() => removeImage(index)}
                >
                  <Image
                    source={
                      // route.params.feed.images
                      //   ? { uri: API_URL + image.uri }
                      //   : { uri: image.uri }
                      { uri: image.uri }
                    }
                    style={{ width: 100, height: 100, margin: 4 }}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
        <Animated.View
          style={[
            animatedStyles,
            {
              position: 'absolute',
              right: 24,
              bottom: 48,
              width: 48,
              height: 48,
              borderRadius: 30,
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Icon
            name="image"
            size={32}
            color={'#000000'}
            onPress={chooseImage}
          />
        </Animated.View>
        {/* </KeyboardAvoidingView> */}
        {/* </Animated.View> */}
      </View>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
  },
  completeBtn: {
    width: 72,
    height: 32,
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: '#806a5b',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 24,
  },
  completeBtnDisabled: {
    width: 72,
    height: 32,
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: '#c1c1c1',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 24,
  },
  selectTodoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
  },
  feedContent: {
    fontSize: 16,
    padding: 24,
    flex: 3,
  },
});
