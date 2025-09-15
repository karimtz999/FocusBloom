import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
  Image,
  Modal,
  Linking,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { router } from 'expo-router';
import { useSession } from '../../context/SessionContext';
import DataService from '../../services/DataService';
import CategoryService from '../../services/CategoryService';
import { sessionAPI } from '../../api/api';
import { SafeAreaView } from 'react-native-safe-area-context';

type SessionType = 'work' | 'short-break' | 'long-break';

export default function HomeScreen() {
  const { sessionType: globalSessionType, setSessionType: setGlobalSessionType } = useSession();
  const dataService = DataService.getInstance();
  const categoryService = CategoryService.getInstance();
  const { height, width } = useWindowDimensions();

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>(globalSessionType);
  const [sessionCount, setSessionCount] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // New: category state and modal
  const [category, setCategory] = useState<string>('work');
  const [availableCategories, setAvailableCategories] = useState<string[]>(['work', 'study', 'coding', 'reading', 'exercise']);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durations: Record<SessionType, number> = {
    work: 1  ,
    'short-break': 5,
    'long-break': 15,
  };

  useEffect(() => {
    setSessionType(globalSessionType);
    setTimeLeft(durations[globalSessionType] * 60);
  }, [globalSessionType]);

  useEffect(() => {
    loadProfileImage();
    loadCategories();
  }, []);

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const saveProfileImage = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem('profileImage', imageUri);
      setProfileImage(imageUri);
    } catch (error) {
      console.error('Error saving profile image:', error);
    }
  };

  const deleteProfileImage = async () => {
    try {
      await AsyncStorage.removeItem('profileImage');
      setProfileImage(null);
    } catch (error) {
      console.error('Error deleting profile image:', error);
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', ...(profileImage ? ['Delete Photo'] : [])],
          cancelButtonIndex: 0,
          destructiveButtonIndex: profileImage ? 3 : undefined,
        },
        (buttonIndex: number) => {
          if (buttonIndex === 1) {
            pickImageFromCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          } else if (buttonIndex === 3 && profileImage) {
            confirmDeleteImage();
          }
        }
      );
    } else {
      Alert.alert(
        'Profile Picture',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: pickImageFromCamera },
          { text: 'Choose from Gallery', onPress: pickImageFromGallery },
          ...(profileImage ? [{ text: 'Delete Photo', onPress: confirmDeleteImage, style: 'destructive' as const }] : []),
        ]
      );
    }
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      saveProfileImage(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required to choose photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      saveProfileImage(result.assets[0].uri);
    }
  };

  const confirmDeleteImage = () => {
    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteProfileImage },
      ]
    );
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    setSessionCount((prev: number) => prev + 1);

    try {
      if (currentSessionId) {
        const result = await sessionAPI.complete(currentSessionId);
        console.log('Session completed via API:', result.data.session);

        if (result.data && 'stats' in result.data) {
          console.log('Updated stats:', (result.data as any).stats);
        }
        // Also add to local history for category aggregation
        await dataService.addSession({
          duration: durations[sessionType],
          type: sessionType,
          completed: true,
          startTime: sessionStartTime || new Date().toISOString(),
          endTime: new Date().toISOString(),
          category: category?.trim() || 'uncategorized',
        });
      } else {
        console.log('No session ID found, saving to local storage');
        await dataService.addSession({
          duration: durations[sessionType],
          type: sessionType,
          completed: true,
          startTime: sessionStartTime || new Date().toISOString(),
          endTime: new Date().toISOString(),
          // New: persist category with the session
          category: category?.trim() || 'uncategorized',
        });
      }

      setSessionStartTime(null);
      setCurrentSessionId(null);

      const sessionName = sessionType.replace('-', ' ');
      Alert.alert(
        'Session Complete! 🎉',
        `Great job! You've completed a ${sessionName} session.`,
        [
          {
            text: 'View Progress',
            onPress: () => {
              router.push('/explore');
            },
          },
          {
            text: 'Take a Break',
            onPress: () => {
              if (sessionType === 'work') {
                const nextBreak = sessionCount % 4 === 3 ? 'long-break' : 'short-break';
                setSessionType(nextBreak);
                setGlobalSessionType(nextBreak);
                setTimeLeft(durations[nextBreak] * 60);
              } else {
                setSessionType('work');
                setGlobalSessionType('work');
                setTimeLeft(durations['work'] * 60);
              }
            },
          },
          {
            text: 'Continue',
            onPress: () => {
              setTimeLeft(durations[sessionType] * 60);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error completing session:', error);
      Alert.alert(
        'Session Complete! 🎉',
        `Great job! You've completed a ${sessionType.replace('-', ' ')} session.\n\nNote: There was an issue saving to the server, but your progress has been saved locally.`,
        [
          {
            text: 'View Progress',
            onPress: () => {
              router.push('/explore');
            },
          },
          {
            text: 'Continue',
            onPress: () => {
              setTimeLeft(durations[sessionType] * 60);
            },
          },
        ]
      );
    }
  };

  const toggleTimer = async () => {
    if (!isRunning && !sessionStartTime) {
      try {
        const newSession = await sessionAPI.create(durations[sessionType], sessionType);
        setSessionStartTime(new Date().toISOString());
        setCurrentSessionId(newSession.data.session.id);
        console.log('New session started via API:', newSession.data.session);
      } catch (error) {
        console.error('Error starting session via API:', error);
        setSessionStartTime(new Date().toISOString());
        setCurrentSessionId(null);
        console.log('Started session locally as fallback');
      }
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[sessionType] * 60);
    setSessionStartTime(null);
    setCurrentSessionId(null);
  };

  const changeSessionType = (type: SessionType) => {
    setSessionType(type);
    setGlobalSessionType(type);
    setTimeLeft(durations[type] * 60);
    setIsRunning(false);
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleHistory = () => {
    setIsMenuVisible(false);
    router.push('/explore');
  };

  const handleGitHub = () => {
    setIsMenuVisible(false);
    Linking.openURL('https://github.com/karimtz999/FocusBloom');
  };

  const handleLinkedIn = () => {
    setIsMenuVisible(false);
    Linking.openURL('https://linkedin.com/in/abdelkarim-elfar-b89a9a275/');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalSeconds = durations[sessionType] * 60;
  const progress = (totalSeconds - timeLeft) / totalSeconds;

  const loadCategories = async () => {
    try {
      const categories = await categoryService.getCategories();
      setAvailableCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await categoryService.addCategory(newCategoryName);
        await loadCategories();
        setCategory(newCategoryName.trim().toLowerCase());
        setNewCategoryName('');
        setShowAddCategoryModal(false);
      } catch (error) {
        console.error('Error adding category:', error);
        Alert.alert('Error', 'Failed to add category');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={showImagePickerOptions}
          activeOpacity={0.7}
          accessibilityLabel="Profile picture"
          accessibilityRole="button"
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Ionicons name="person-add" size={width * 0.06} color="#5483B3" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.welcomeText, { fontSize: width * 0.06 }]}>FocusBloom</Text>
          <Text style={[styles.userGreeting, { fontSize: width * 0.035 }]}>Stay focused and productive!</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleMenu}
          activeOpacity={0.7}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
        >
          <Ionicons name="menu" size={width * 0.09} color="#5483B3" />
        </TouchableOpacity>
      </View>

      <View style={styles.sessionSelector}>
        {(['work', 'short-break', 'long-break'] as SessionType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.sessionButton,
              sessionType === type && styles.activeSessionButton,
            ]}
            onPress={() => changeSessionType(type)}
          >
            <Text
              style={[
                styles.sessionButtonText,
                { fontSize: width * 0.035 },
                sessionType === type && styles.activeSessionButtonText,
              ]}
            >
              {type.replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Enhanced category chooser with + button */}
      <View style={styles.categoryRow}>
        {availableCategories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setShowAddCategoryModal(true)}
          style={styles.addCategoryButton}
        >
          <Text style={styles.addCategoryText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Progress.Circle
          size={width * 0.7}
          progress={progress}
          thickness={8}
          color="#5483B3"
          unfilledColor="rgba(84, 131, 179, 0.1)"
          borderWidth={0}
          style={styles.progressCircle}
        />
        <View style={styles.timerContent}>
          <Text style={[styles.timerText, { fontSize: width * 0.12 }]}>{formatTime(timeLeft)}</Text>
          <Text style={[styles.sessionTypeText, { fontSize: width * 0.04 }]}>
            {sessionType.replace('-', ' ')}
          </Text>
          <Text style={[styles.sessionCountText, { fontSize: width * 0.035 }]}>
            {sessionCount} sessions completed
          </Text>
        </View>
      </View>

      <View style={[styles.controlsContainer, { gap: width * 0.06 }]}>
        <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={resetTimer}>
          <Ionicons name="refresh" size={width * 0.08} color="#5483B3" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, styles.playButton]} onPress={toggleTimer}>
          <Ionicons name={isRunning ? 'pause' : 'play'} size={width * 0.12} color="#052659" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, styles.historyButton]} onPress={handleHistory}>
          <Ionicons name="stats-chart" size={width * 0.08} color="#5483B3" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { minWidth: width * 0.7 }]}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { fontSize: width * 0.05 }]}>Menu</Text>
              <TouchableOpacity onPress={() => setIsMenuVisible(false)}>
                <Ionicons name="close" size={width * 0.06} color="#5483B3" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={handleHistory}>
                <Ionicons name="stats-chart" size={width * 0.05} color="#5483B3" />
                <Text style={[styles.menuItemText, { fontSize: width * 0.04 }]}>View History</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleGitHub}>
                <Ionicons name="logo-github" size={width * 0.05} color="#5483B3" />
                <Text style={[styles.menuItemText, { fontSize: width * 0.04 }]}>GitHub</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleLinkedIn}>
                <Ionicons name="logo-linkedin" size={width * 0.05} color="#5483B3" />
                <Text style={[styles.menuItemText, { fontSize: width * 0.04 }]}>LinkedIn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addCategoryModal}>
            <Text style={styles.addCategoryTitle}>Add New Category</Text>
            <TextInput
              style={styles.categoryInput}
              placeholder="Enter category name"
              placeholderTextColor="#999"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
              maxLength={15}
            />
            <View style={styles.addCategoryButtons}>
              <TouchableOpacity
                style={[styles.addCategoryBtn, styles.cancelBtn]}
                onPress={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addCategoryBtn, styles.addBtn]}
                onPress={handleAddCategory}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021024',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#5483B3',
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#5483B3',
    marginBottom: 4,
  },
  userGreeting: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#5483B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionSelector: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#5483B3',
  },
  sessionButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  activeSessionButton: {
    backgroundColor: '#5483B3',
    shadowColor: '#B0C4DE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  sessionButtonText: {
    color: '#5483B3',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  activeSessionButtonText: {
    color: '#052659',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    position: 'relative',
  },
  progressCircle: {
    shadowColor: '#5483B3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sessionTypeText: {
    color: '#5483B3',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  sessionCountText: {
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  controlButton: {
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5483B3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  resetButton: {
    width: 70,
    height: 70,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#5483B3',
  },
  playButton: {
    width: 90,
    height: 90,
    backgroundColor: '#5483B3',
  },
  historyButton: {
    width: 70,
    height: 70,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#5483B3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#5483B3',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  menuTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuItems: {
    gap: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
    gap: 15,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 5,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: '#5483B3',
    borderColor: '#5483B3',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  categoryTextActive: {
    color: '#052659',
    fontWeight: '700',
  },
  addCategoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#5483B3',
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCategoryText: {
    color: '#5483B3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addCategoryModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#5483B3',
    minWidth: 300,
  },
  addCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#5483B3',
    marginBottom: 20,
  },
  addCategoryButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addCategoryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#333',
  },
  addBtn: {
    backgroundColor: '#5483B3',
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addBtnText: {
    color: '#052659',
    fontWeight: '600',
  },
});