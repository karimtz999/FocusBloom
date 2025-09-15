import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Image,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
}

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('focusbloom_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    // Simple demo login - in real app, this would call an API
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    const newProfile: UserProfile = {
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      joinDate: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem('focusbloom_profile', JSON.stringify(newProfile));
      setUserProfile(newProfile);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('focusbloom_profile');
              await AsyncStorage.removeItem('profileImage');
              setUserProfile(null);
              setIsLoggedIn(false);
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setEditName(userProfile.name);
      setEditEmail(userProfile.email);
      setShowEditModal(true);
    }
  };

  const saveProfileChanges = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        name: editName.trim(),
        email: editEmail.trim(),
      };

      try {
        await AsyncStorage.setItem('focusbloom_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
        setShowEditModal(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', ...(userProfile?.avatar ? ['Remove Photo'] : [])],
          cancelButtonIndex: 0,
          destructiveButtonIndex: userProfile?.avatar ? 3 : undefined,
        },
        (buttonIndex: number) => {
          if (buttonIndex === 1) {
            pickImageFromCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          } else if (buttonIndex === 3 && userProfile?.avatar) {
            removeAvatar();
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
          ...(userProfile?.avatar ? [{ text: 'Remove Photo', onPress: removeAvatar, style: 'destructive' as const }] : []),
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
      updateAvatar(result.assets[0].uri);
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
      updateAvatar(result.assets[0].uri);
    }
  };

  const updateAvatar = async (uri: string) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, avatar: uri };
      try {
        await AsyncStorage.setItem('focusbloom_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  };

  const removeAvatar = async () => {
    if (userProfile) {
      const updatedProfile = { ...userProfile };
      delete updatedProfile.avatar;
      try {
        await AsyncStorage.setItem('focusbloom_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
      } catch (error) {
        console.error('Error removing avatar:', error);
      }
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#5483B3" />
          <Text style={styles.loginTitle}>Welcome to FocusBloom</Text>
          <Text style={styles.loginSubtitle}>Sign in to sync your progress across devices</Text>
          
          <TouchableOpacity style={styles.loginButton} onPress={() => setShowLoginModal(true)}>
            <Text style={styles.loginButtonText}>Sign In / Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestButton}>
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        {/* Login Modal */}
        <Modal
          visible={showLoginModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowLoginModal(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Sign In</Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Name (optional)"
                placeholderTextColor="#666666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                <Text style={styles.submitButtonText}>Sign In</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimerText}>
                This is a demo app. Your data is stored locally on your device.
              </Text>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#5483B3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={showImagePickerOptions} style={styles.avatarContainer}>
            {userProfile?.avatar ? (
              <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#5483B3" />
              </View>
            )}
            <View style={styles.avatarEditIcon}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{userProfile?.name}</Text>
          <Text style={styles.userEmail}>{userProfile?.email}</Text>
          <Text style={styles.joinDate}>
            Joined {userProfile ? formatJoinDate(userProfile.joinDate) : ''}
          </Text>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
            <Ionicons name="person-outline" size={20} color="#5483B3" />
            <Text style={styles.settingText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={20} color="#5483B3" />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={20} color="#5483B3" />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="information-circle-outline" size={20} color="#5483B3" />
            <Text style={styles.settingText}>About</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={saveProfileChanges}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#666666"
              value={editName}
              onChangeText={setEditName}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666666"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021024',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#5483B3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5483B3',
  },
  content: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#5483B3',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  guestButtonText: {
    color: '#666666',
    fontSize: 16,
  },
  profileSection: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#5483B3',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
    borderWidth: 3,
    borderColor: '#5483B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5483B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 14,
    color: '#666666',
  },
  settingsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    marginBottom: 10,
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#021024',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#5483B3',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5483B3',
  },
  saveButton: {
    fontSize: 16,
    color: '#5483B3',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  submitButton: {
    backgroundColor: '#5483B3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});
