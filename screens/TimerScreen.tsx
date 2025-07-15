import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Progress from 'react-native-progress';


type SessionType = 'work' | 'short-break' | 'long-break';


export default function TimerScreen() {
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionCount, setSessionCount] = useState(0);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session durations in minutes
  const durations = {
    work: 25,
    'short-break': 5,
    'long-break': 15,
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 60;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const startSession = () => {
    setIsRunning(true);
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resetSession = () => {
    setIsRunning(false);
    setTimeLeft(durations[sessionType] * 60);
  };

  const handleSessionComplete = () => {
    setIsRunning(false);
    if (sessionType === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      if (newCount % 4 === 0) {
        Alert.alert(
          'Great work! 🎉',
          'You\'ve completed 4 Pomodoro sessions. Time for a long break!',
          [
            { text: 'Long Break', onPress: () => switchSession('long-break') },
            { text: 'Continue Working', onPress: () => switchSession('work') },
          ]
        );
      } else {
        Alert.alert(
          'Session Complete! ✅',
          'Time for a short break!',
          [
            { text: 'Short Break', onPress: () => switchSession('short-break') },
            { text: 'Continue Working', onPress: () => switchSession('work') },
          ]
        );
      }
    } else {
      Alert.alert(
        'Break Complete! 🎯',
        'Ready to get back to work?',
        [
          { text: 'Start Working', onPress: () => switchSession('work') },
          { text: 'Another Break', onPress: () => switchSession('short-break') },
        ]
      );
    }
  };

  const switchSession = (type: SessionType) => {
    setSessionType(type);
    setTimeLeft(durations[type] * 60);
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work': return '#e74c3c';
      case 'short-break': return '#f39c12';
      case 'long-break': return '#27ae60';
      default: return '#e74c3c';
    }
  };

  const getSessionEmoji = () => {
    switch (sessionType) {
      case 'work': return '';
      case 'short-break': return '';
      case 'long-break': return '';
      default: return '🍅';
    }
  };

  const totalSeconds = durations[sessionType] * 60;
  const progress = (totalSeconds - timeLeft) / totalSeconds;

  return (
    <View style={[styles.container, { backgroundColor: getSessionColor() }]}> 
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>FocusBloom</Text>
      </View>

      {/* Session Type Selector */}
      <View style={styles.sessionSelector}>
        {(['work', 'short-break', 'long-break'] as SessionType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.sessionButton,
              sessionType === type && styles.activeSessionButton
            ]}
            onPress={() => !isRunning && switchSession(type)}
            disabled={isRunning}
          >
            <Text style={[
              styles.sessionButtonText,
              sessionType === type && styles.activeSessionButtonText
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer Display with Circular Progress */}
      <View style={styles.timerContainer}>
        <View style={{ bottom: -10, left: 0, right: 0 }}>
          <Progress.Circle
            size={280}
            progress={progress}
            thickness={20}
            color="#fff"
            unfilledColor="rgba(255,255,255,0.2)"
            borderWidth={0}
            showsText={false}
            style={{ marginBottom: 0 }}
          />
        </View>
        <View style={{ position: 'absolute', alignItems: 'center', width: 220, height: 220, justifyContent: 'center' }}>
          <Text style={styles.sessionEmoji}>{getSessionEmoji()}</Text>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          <Text style={styles.sessionLabel}>
            {sessionType.charAt(0).toUpperCase() + sessionType.slice(1).replace('-', ' ')}
          </Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={timeLeft === durations[sessionType] * 60 ? startSession : () => setIsRunning(true)}
          >
            <Text style={styles.startButtonText}>
              {timeLeft === durations[sessionType] * 60 ? '▶️ Start' : '▶️ Resume'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={pauseSession}>
            <Text style={styles.pauseButtonText}>⏸️ Pause</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.resetButton} onPress={resetSession}>
          <Text style={styles.resetButtonText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Session Counter */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          Total minutes focused: {sessionCount * 25}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  sessionSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 40,
  },
  sessionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeSessionButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sessionButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  activeSessionButtonText: {
    color: '#fff',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  sessionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  sessionLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  controls: {
    gap: 15,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  stats: {
    alignItems: 'center',
  },
  statsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});
