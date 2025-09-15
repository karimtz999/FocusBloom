import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DataService, { PomodoroSession } from '../../services/DataService';
import CategoryService from '../../services/CategoryService';

interface Session {
  _id: string;
  duration: number;
  type: 'work' | 'short-break' | 'long-break';
  completed: boolean;
  startTime: string;
  endTime?: string;
  createdAt: string;
  category?: string;
}

const screenWidth = Dimensions.get('window').width;

export default function ExploreScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  // Add time period filtering state
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [showDetailedCharts, setShowDetailedCharts] = useState(false);
  
  const dataService = DataService.getInstance();
  const categoryService = CategoryService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh when tab comes into focus (after session completion)
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      // This function will be called when the screen comes into focus
      loadData();
      
      // Optionally, you can return a cleanup function if needed
      return () => {
        // Cleanup code if necessary
      };
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load real data from DataService
      const pomodoroSessions = await dataService.getSessions();
      
      // Convert PomodoroSession to Session format
      const convertedSessions: Session[] = pomodoroSessions.map((session: PomodoroSession) => ({
        _id: session._id,
        duration: session.duration,
        type: session.type,
        completed: session.completed,
        startTime: session.startTime,
        endTime: session.endTime,
        createdAt: session.createdAt,
        category: session.category,
      }));
      
      setSessions(convertedSessions);
      
      // If no data exists, add some sample data for demo
      if (convertedSessions.length === 0) {
        await addSampleData();
        // Reload data after adding samples
        const newSessions = await dataService.getSessions();
        
        const newConvertedSessions = newSessions.map((session: PomodoroSession) => ({
          _id: session._id,
          duration: session.duration,
          type: session.type,
          completed: session.completed,
          startTime: session.startTime,
          endTime: session.endTime,
          createdAt: session.createdAt,
          category: session.category,
        }));
        
        setSessions(newConvertedSessions);
      }
    } catch (error) {
      console.error('Error loading sessions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSampleData = async () => {
    const sampleSessions = [
      {
        duration: 25,
        type: 'work' as const,
        completed: true,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
        category: 'study',
      },
      {
        duration: 5,
        type: 'short-break' as const,
        completed: true,
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        category: 'break',
      },
      {
        duration: 25,
        type: 'work' as const,
        completed: true,
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        category: 'work',
      }
    ];

    for (const session of sampleSessions) {
      await dataService.addSession(session);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await categoryService.addCategory(newCategoryName);
        setNewCategoryName('');
        setShowAddCategoryModal(false);
        Alert.alert('Success', 'Category added! You can now use it in the timer.');
      } catch (error) {
        console.error('Error adding category:', error);
        Alert.alert('Error', 'Failed to add category');
      }
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Calculate overview statistics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(session => session.completed).length;
  const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);

  // New: aggregate minutes by category (completed only)
  const categoryTotals = sessions
    .filter(s => s.completed)
    .reduce<Record<string, number>>((acc, s) => {
      const key = (s.category || (s.type === 'work' ? 'work' : 'break')).toLowerCase();
      acc[key] = (acc[key] || 0) + s.duration;
      return acc;
    }, {});

  const maxMinutes = Math.max(1, ...Object.values(categoryTotals));
  const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Add filtering functions
  const getFilteredSessions = (period: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date();
    const startOfPeriod = new Date();

    switch (period) {
      case 'day':
        startOfPeriod.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startOfPeriod.setDate(now.getDate() - dayOfWeek);
        startOfPeriod.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startOfPeriod.setDate(1);
        startOfPeriod.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startOfPeriod.setMonth(0, 1);
        startOfPeriod.setHours(0, 0, 0, 0);
        break;
    }

    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startOfPeriod && sessionDate <= now;
    });
  };

  const getTimeLabels = (period: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date();
    const labels = [];

    switch (period) {
      case 'day':
        for (let hour = 0; hour < 24; hour += 3) {
          labels.push(`${hour}:00`);
        }
        break;
      case 'week':
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(...weekDays);
        break;
      case 'month':
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let day = 1; day <= Math.min(daysInMonth, 30); day += Math.ceil(daysInMonth / 10)) {
          labels.push(`${day}`);
        }
        break;
      case 'year':
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        labels.push(...months);
        break;
    }

    return labels;
  };

  return (
    <View style={styles.container}>
      {/* Header with + button */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Progress</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddCategoryModal(true)}
        >
          <Ionicons name="add" size={24} color="#5483B3" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Section */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5483B3" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        ) : (
          <View style={styles.overviewSection}>
            <Text style={styles.overviewTitle}> Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewNumber}>{totalSessions}</Text>
                <Text style={styles.overviewLabel}>Total Sessions</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewNumber}>{completedSessions}</Text>
                <Text style={styles.overviewLabel}>Completed</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewNumber}>{formatDuration(totalTime)}</Text>
                <Text style={styles.overviewLabel}>Total Time</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewNumber}>{totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(1) : 0}%</Text>
                <Text style={styles.overviewLabel}>Productivity</Text>
              </View>
            </View>
          </View>
        )}

        {/* Time by Category bar chart */}
        {!loading && categoryEntries.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Time by Category</Text>
            {categoryEntries.map(([cat, minutes]) => {
              const ratio = minutes / maxMinutes;
              return (
                <View key={cat} style={styles.barRow}>
                  <Text style={styles.barLabel}>{cat}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
                  </View>
                  <Text style={styles.barValue}>{minutes}m</Text>
                </View>
              );
            })}
            
            {/* View More Button */}
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => setShowDetailedCharts(true)}
            >
              <Ionicons name="analytics" size={20} color="#5483B3" />
              <Text style={styles.viewMoreText}>View Detailed Charts</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Coming Soon Cards */}
        <View style={styles.comingSoonSection}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>

          <View style={styles.comingSoonCard}>
              <Ionicons name="bulb" size={24} color="#666666" />
              <View style={styles.comingSoonText}>
                <Text style={styles.comingSoonTitle}>AI Assistant</Text>
                <Text style={styles.comingSoonDesc}>
                  Analyze your habits and boost motivation
                </Text>
              </View>
          </View>

          <View style={styles.comingSoonCard}>
            <Ionicons name="trophy" size={24} color="#666666" />
            <View style={styles.comingSoonText}>
              <Text style={styles.comingSoonTitle}>Achievements</Text>
              <Text style={styles.comingSoonDesc}>Unlock badges and milestones</Text>
            </View>
          </View>

          <View style={styles.comingSoonCard}>
            <Ionicons name="people" size={24} color="#666666" />
            <View style={styles.comingSoonText}>
              <Text style={styles.comingSoonTitle}>Social Features</Text>
              <Text style={styles.comingSoonDesc}>Share progress with friends</Text>
            </View>
          </View>
          
        </View>

        {/* Bottom padding for better scrolling experience */}
        <View style={styles.bottomPadding} />
      </ScrollView>

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
            <Text style={styles.addCategorySubtitle}>
              Create a custom category to track your time
            </Text>
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

      {/* Detailed Charts Modal */}
      <Modal
        visible={showDetailedCharts}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailedCharts(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.chartModal}>
            {/* Modal Header */}
            <View style={styles.chartModalHeader}>
              <Text style={styles.chartModalTitle}>Detailed Progress Charts</Text>
              <TouchableOpacity onPress={() => setShowDetailedCharts(false)}>
                <Ionicons name="close" size={24} color="#5483B3" />
                
              </TouchableOpacity>
            </View>

            {/* Time Period Selector */}
            <View style={styles.periodSelector}>
              {(['day', 'week', 'month', 'year'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={styles.chartScrollView} showsVerticalScrollIndicator={false}>
              {/* Filtered Sessions Chart */}
              {(() => {
                const filteredSessions = getFilteredSessions(selectedPeriod);
                const filteredCategoryData: Record<string, number> = {};
                
                filteredSessions.forEach(session => {
                  if (session.completed && session.type === 'work') {
                    const category = session.category || 'uncategorized';
                    filteredCategoryData[category] = (filteredCategoryData[category] || 0) + session.duration;
                  }
                });

                const filteredEntries = Object.entries(filteredCategoryData);
                const filteredMaxMinutes = Math.max(...Object.values(filteredCategoryData), 1);

                return filteredEntries.length > 0 ? (
                  <View style={styles.chartSection}>
                    <Text style={styles.chartSectionTitle}>
                      Time by Category - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                    </Text>
                    {filteredEntries.map(([cat, minutes]) => {
                      const ratio = minutes / filteredMaxMinutes;
                      return (
                        <View key={cat} style={styles.barRow}>
                          <Text style={styles.barLabel}>{cat}</Text>
                          <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
                          </View>
                          <Text style={styles.barValue}>{minutes}m</Text>
                        </View>
                      );
                    })}
                    <Text style={styles.chartSummary}>
                      Total: {filteredEntries.reduce((sum, [, minutes]) => sum + minutes, 0)} minutes
                    </Text>
                  </View>
                ) : (
                  <View style={styles.noDataContainer}>
                    <Ionicons name="bar-chart-outline" size={48} color="#666" />
                    <Text style={styles.noDataText}>
                      No data available for this {selectedPeriod}
                    </Text>
                  </View>
                );
              })()}


            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021024', // Same dark blue as TimerScreen
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
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#5483B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#5483B3',
  },

 

  overviewSection: {
    marginBottom: 30,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  overviewCard: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 50,
    width: (screenWidth - 60) / 2,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5483B3',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5483B3',
    marginBottom: 5,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Category bars
  categorySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barLabel: {
    width: 80,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: '#0D274B',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#5483B3',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#5483B3',
  },
  barValue: {
    width: 60,
    textAlign: 'right',
    color: '#FFFFFF',
  },
  comingSoonSection: {
    marginTop: 10,
  },
  comingSoonCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 50,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    opacity: 0.6,
  },
  comingSoonText: {
    marginLeft: 16,
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  comingSoonDesc: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  bottomPadding: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#5483B3',
    minWidth: 300,
    marginHorizontal: 20,
  },
  addCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  addCategorySubtitle: {
    fontSize: 14,
    color: '#999',
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
  // Chart modal styles
  chartModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#5483B3',
    minWidth: 300,
    maxWidth: '90%',
    maxHeight: '50%',
  },
  chartModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#5483B3',
  },
  periodButtonActive: {
    backgroundColor: '#5483B3',
  },
  periodButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#021024',
  },
  chartScrollView: {
    flex: 1,
  },
  chartSection: {
    marginBottom: 30,
  },
  chartSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  
  
  chartSummary: {
    marginTop: 10,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // View More Button styles
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5483B3',
  },
  viewMoreText: {
    marginLeft: 8,
    color: '#5483B3',
    fontSize: 16,
    fontWeight: '600',
  },
});
