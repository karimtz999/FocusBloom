import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('focusbloom_notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('focusbloom_notes', JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const createNote = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setShowModal(true);
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowModal(true);
  };

  const saveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your note.');
      return;
    }

    const now = new Date().toISOString();
    
    if (editingNote) {
      // Update existing note
      const updatedNotes = notes.map(note =>
        note.id === editingNote.id
          ? { ...note, title: title.trim(), content: content.trim(), updatedAt: now }
          : note
      );
      await saveNotes(updatedNotes);
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
      };
      const updatedNotes = [newNote, ...notes];
      await saveNotes(updatedNotes);
    }

    setShowModal(false);
    setTitle('');
    setContent('');
    setEditingNote(null);
  };

  const deleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedNotes = notes.filter(note => note.id !== noteId);
            await saveNotes(updatedNotes);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes</Text>
        <TouchableOpacity onPress={createNote} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#5483B3" />
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#666666" />
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create your first note</Text>
          </View>
        ) : (
          notes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={styles.noteCard}
              onPress={() => editNote(note)}
            >
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {note.title}
                </Text>
                <TouchableOpacity onPress={() => deleteNote(note.id)}>
                  <Ionicons name="trash-outline" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.noteContent} numberOfLines={3}>
                {note.content}
              </Text>
              <Text style={styles.noteDate}>
                {formatDate(note.updatedAt)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Note Editor Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Edit Note' : 'New Note'}
            </Text>
            <TouchableOpacity onPress={saveNote}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.titleInput}
              placeholder="Note title..."
              placeholderTextColor="#666666"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            <TextInput
              style={styles.contentInput}
              placeholder="Write your note here..."
              placeholderTextColor="#666666"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
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
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  noteContent: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#666666',
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
  titleInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  contentInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    borderWidth: 1,
    borderColor: '#333333',
  },
});
