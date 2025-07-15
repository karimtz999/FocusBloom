import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { sessionAPI } from '../api/api';
import { router } from 'expo-router';

interface Session {
  _id: string;
  duration: number;
  type: 'work' | 'short-break' | 'long-break';
  completed: boolean;
  startTime: string;
  endTime?: string;
  createdAt: string;
}

interface Stats {
  _id: string;
  count: number;
  totalMinutes: number;
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyResponse, statsResponse] = await Promise.all([
        sessionAPI.getHistory(),
        sessionAPI.getStats(selectedPeriod)
      ]);
      
      setSessions(historyResponse.data.sessions);
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error('Error loading history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getSessionEmoji = (type: string) => {
    switch (type) {
      case 'work': return '🍅';
      case 'short-break': return '☕';
      case 'long-break': return '🛋️';
      default: return '🍅';
    }
  };

  const getSessionColor = (type: string) => {
    switch (type) {
      case 'work': return '#e74c3c';
      case 'short-break': return '#f39c12';
      case 'long-break': return '#27ae60';
      default: return '#e74c3c';
    }
  };

  const renderSession = ({ item }: { item: Session }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionEmoji}>{getSessionEmoji(item.type)}</Text>
          <View>
            <Text style={styles.sessionType}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('-', ' ')}
            </Text>
            <Text style={styles.sessionDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.sessionStats}>
          <Text style={styles.sessionDuration}>{item.duration}m</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.completed ? '#27ae60' : '#e74c3c' }
          ]}>
            <Text style={styles.statusText}>
              {item.completed ? 'Completed' : 'Incomplete'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStatsCard = (stat: Stats) => (
    <View key={stat._id} style={[styles.statCard, { borderLeftColor: getSessionColor(stat._id) }]}>
      <Text style={styles.statEmoji}>{getSessionEmoji(stat._id)}</Text>
      <View style={styles.statInfo}>
        <Text style={styles.statType}>
          {stat._id.charAt(0).toUpperCase() + stat._id.slice(1).replace('-', ' ')}
        </Text>
        <Text style={styles.statCount}>{stat.count} sessions</Text>
        <Text style={styles.statDuration}>{formatDuration(stat.totalMinutes)}</Text>
      </View>
    </View>
  );

  const totalSessions = stats.reduce((sum, stat) => sum + stat.count, 0);
  const totalTime = stats.reduce((sum, stat) => sum + stat.totalMinutes, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Session History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activePeriodButton
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.activePeriodButtonText
            ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{totalSessions}</Text>
          <Text style={styles.summaryLabel}>Total Sessions</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{formatDuration(totalTime)}</Text>
          <Text style={styles.summaryLabel}>Total Time</Text>
        </View>
      </View>

      {/* Stats by Type */}
      {stats.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Breakdown</Text>
          <View style={styles.statsGrid}>
            {stats.map(renderStatsCard)}
          </View>
        </View>
      )}

      {/* Recent Sessions */}
      <View style={styles.sessionsContainer}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {sessions.length > 0 ? (
          <FlatList
            data={sessions}
            renderItem={renderSession}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubtext}>Start your first Pomodoro to see your progress here!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 50,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activePeriodButton: {
    backgroundColor: '#e74c3c',
  },
  periodButtonText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '600',
  },
  activePeriodButtonText: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsGrid: {
    gap: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  statCount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statDuration: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  sessionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
