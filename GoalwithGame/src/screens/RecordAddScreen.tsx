import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { Record } from '../types';
import * as ImagePicker from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TextInput } from 'react-native';
import type { AppNavigatorParamList } from '../navigation/types';

// Use the Quest type from AppContext
interface Quest {
  id: string;
  title: string;
  isMain: boolean;
  startDate: string;
  endDate: string;
  completed: boolean;
  verificationRequired: boolean;
  verificationCount: number;
  requiredVerifications: number;
  records: QuestRecord[];
}

interface QuestRecord {
  id: string;
  date: string;
  text: string;
  image?: string;
  verifications: QuestVerification[];
  isVerified: boolean;
}

interface QuestVerification {
  userId: string;
  verifiedAt: string;
}

const RecordAddScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<AppNavigatorParamList>>();
  const { user, quests, addRecord } = useAppContext();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const handleQuestSelect = (quest: Quest | null) => {
    setSelectedQuest(quest);
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags(prevTags => [...prevTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prevTags => prevTags.filter(t => t !== tag));
  };

  const handleAddImage = () => {
    if (images.length >= 3) return;
    
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 3 - images.length,
      includeBase64: true,
    }, (response: ImagePicker.ImagePickerResponse) => {
      if (response.assets && Array.isArray(response.assets)) {
        const newImages = response.assets.map(asset => asset.uri || '');
        setImages(prevImages => [...prevImages, ...newImages]);
      }
    });
  };

  const handleSubmit = () => {
    if (!selectedQuest || !text) return;
    
    const newRecord: Record = {
      id: Date.now().toString(),
      questId: selectedQuest.id,
      text,
      tags,
      images,
      createdAt: new Date(),
      userId: user.id,
    };

    // Save the record
    addRecord(newRecord);

    // Navigate back to home screen
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>퀘스트 선택</Text>
        <TouchableOpacity
          style={[
            styles.questButton,
            selectedQuest && styles.questButtonSelected,
          ]}
          onPress={() => handleQuestSelect(selectedQuest)}
        >
          <Text style={styles.questButtonText}>
            {selectedQuest?.title || '퀘스트를 선택하세요'}
          </Text>
        </TouchableOpacity>
        {quests.map((quest) => (
          <TouchableOpacity
            key={quest.id}
            style={styles.questItem}
            onPress={() => handleQuestSelect(quest)}
          >
            <Text>{quest.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>태그 추가</Text>
        <View style={styles.tagContainer}>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tag}
              onPress={() => handleRemoveTag(tag)}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.tagInput}
            placeholder="태그를 입력하세요"
            onChangeText={(text) => {
              if (text && !tags.includes(text)) {
                handleAddTag(text);
              }
            }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>이미지 추가</Text>
        <View style={styles.imageContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.image}>
              <Image source={{ uri: image }} style={styles.image} />
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleAddImage}
            >
              <Text style={styles.addImageText}>이미지 추가</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기록 작성</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder="기록을 작성하세요"
          value={text}
          onChangeText={setText}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>기록 추가</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  questButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  questButtonSelected: {
    backgroundColor: '#806a5b',
  },
  questButtonText: {
    fontSize: 16,
  },
  questItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#806a5b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: 'white',
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  addImageButton: {
    backgroundColor: '#f0f0f0',
    width: 100,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    color: '#806a5b',
  },
  textInput: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#806a5b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecordAddScreen;
