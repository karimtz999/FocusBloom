import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

export default function TabLayout() {
  const { height, width } = useWindowDimensions();

  const styles = StyleSheet.create({
    tabBar: {
      backgroundColor: '#021024', // Match the app's dark blue background
      height: height * 0.1, // Increase height for better visibility
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: Platform.OS === 'ios' ? 15 : 8,
      paddingTop: 8,
      borderRadius: 25,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: '#5483B3',
      shadowColor: '#5483B3',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 15,
      marginHorizontal: -5,
      paddingHorizontal: 10, // Add some padding on sides
      top: -10, // Adjust to lift the tab bar above the bottom safe area
    },
    tabBarLabel: {
      fontSize: width * 0.028,
      fontWeight: '600',
      marginBottom: 2,
    },
    tabBarIcon: {
      marginTop: -2, // Adjust icon position
      marginBottom: 2, // Ensure icons are vertically centered
    },
    tabBarItem: {
      paddingVertical: 2,
    },
    indicator: {
      position: 'absolute',
      height: 3,
      width: 30,
      backgroundColor: '#5483B3',
      bottom: Platform.OS === 'ios' ? 0 : -5,
      borderRadius: 3,
      left: 15,
    },
  });

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#5483B3', // Match index.tsx accent color
        tabBarInactiveTintColor: '#FFFFFF', // White for inactive tabs
        headerShown: false,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View>
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={width * 0.06} 
                color={color}
                style={{ 
                  shadowColor: focused ? '#5483B3' : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View>
              <Ionicons 
                name={focused ? 'stats-chart' : 'stats-chart-outline'} 
                size={width * 0.06} 
                color={color}
                style={{ 
                  shadowColor: focused ? '#5483B3' : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View>
              <Ionicons 
                name={focused ? 'document-text' : 'document-text-outline'} 
                size={width * 0.06} 
                color={color}
                style={{ 
                  shadowColor: focused ? '#5483B3' : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View>
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={width * 0.06} 
                color={color}
                style={{ 
                  shadowColor: focused ? '#5483B3' : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}