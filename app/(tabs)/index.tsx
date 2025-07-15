import React from 'react';
import TimerScreen from '../../screens/TimerScreen';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return <TimerScreen />;
}

const styles = StyleSheet.create({
  adminContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  adminTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#34495e',
  },
  roleText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
    color: '#e74c3c',
    fontWeight: '500',
  },
  emailText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
  },
  adminActions: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  actionItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
