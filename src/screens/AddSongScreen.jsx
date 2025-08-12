import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { TextInput, Button, Modal, Portal } from 'react-native-paper';
import { colors } from '../theme';
import Toast from 'react-native-toast-message';
import { saveSong, saveSongArray } from '../storage';
import WaveButton from '../components/WaveButton';
import BackIcon from '../components/icons/BackIcon';
import * as DocumentPicker from 'expo-document-picker';
// Import the Expo FileSystem module to read the file
import * as FileSystem from 'expo-file-system';

export default function AddSongScreen({ navigation }) {
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [parsedLines, setParsedLines] = useState([]);
  const [activeWord, setActiveWord] = useState(null);
  const [chordValue, setChordValue] = useState('');

  // --- State for the JSON Modal ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Processes the lyrics from the text input into a structured array
  const handleLyricsSubmit = () => {
    if (!lyrics.trim()) {
      Toast.show({ type: 'error', text1: 'Lyrics cannot be empty!' });
      return;
    }
    const lines = lyrics.split("\n").map(line =>
      line.split(/\s+/).filter(word => word).map(word => ({ word, chords: [] }))
    );
    if (lines.length === 0 || lines.every(line => line.length === 0)) {
      Toast.show({ type: 'error', text1: 'No valid words found in lyrics!' });
      return;
    }
    setParsedLines(lines);
  };

  // Updates the chords for a specific word in the editor
  const handleChordChange = (lineIndex, wordIndex, newChords) => {
    setChordValue(newChords); // Keep the input field's value in sync
    const updatedLines = [...parsedLines];
    updatedLines[lineIndex][wordIndex].chords = newChords.split(/[\s,]+/).filter(c => c);
    setParsedLines(updatedLines);
  };

  // Saves the song created through the main form
  const handleSaveSong = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Song title is required!' });
      return;
    }
    if (!author.trim()) {
      Toast.show({ type: 'error', text1: 'Author is required!' });
      return;
    }
    if (parsedLines.length === 0) {
      Toast.show({ type: 'error', text1: 'Lyrics are required!' });
      return;
    }
    const songData = { name, author, category: 'uncategorized', lyrics: parsedLines };
    await saveSong(songData);
    Toast.show({ type: 'success', text1: 'Song saved successfully!' });
    navigation.goBack();
  };

  // Handles saving the songs from the JSON modal
  const handleSaveJson = async () => {
    if (!jsonInput.trim()) {
      Toast.show({ type: 'error', text1: 'JSON input cannot be empty!' });
      return;
    }
    try {
      let songs = JSON.parse(jsonInput);
      if (!Array.isArray(songs)) {
        songs = [songs];
      }
      if (songs.length === 0) {
        Toast.show({ type: 'error', text1: 'No valid songs found in JSON!' });
        return;
      }
      await saveSongArray(songs);
      Toast.show({ type: 'success', text1: `${songs.length} songs added successfully!` });
      setIsModalVisible(false);
      setJsonInput('');
      navigation.goBack();
    } catch (error) {
      console.error("JSON Parse Error:", error);
      Toast.show({ type: 'error', text1: 'Invalid JSON format.' });
    }
  };

  // --- CORRECTED FUNCTION ---
  // This function now uses the correct Expo APIs to pick and read a file.
  const handleUploadJsonFile = async () => {
    try {
      // Use getDocumentAsync, the correct method for expo-document-picker
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain'], // Use MIME types
        copyToCacheDirectory: true,
      });

      // The new API returns `canceled` instead of throwing an error
      if (result.canceled) {
        console.log('User cancelled file picker');
        return;
      }

      // The new API returns file info in an `assets` array
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Use Expo's FileSystem to read the file content
        const fileContent = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        const songs = JSON.parse(fileContent);

        if (!Array.isArray(songs) || songs.length === 0) {
            Toast.show({ type: 'error', text1: 'JSON file must contain an array of songs.' });
            return;
        }

        await saveSongArray(songs);
        Toast.show({ type: 'success', text1: `${songs.length} songs added successfully!` });
        navigation.goBack(); // Navigate back on success for consistent UX
      } else {
        Toast.show({ type: 'error', text1: 'Could not get the selected file.' });
      }
    } catch (err) {
      console.error("Error picking or parsing file:", err);
      Toast.show({ type: 'error', text1: 'Failed to load or parse file.' });
    }
  };

  return (
    <SafeAreaView style={styles.fullScreen}>
      <Portal>
        <Modal visible={isModalVisible} onDismiss={() => setIsModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Songs via JSON</Text>
          <TextInput
            multiline={true}
            value={jsonInput}
            onChangeText={setJsonInput}
            placeholder="[{ name: 'Song', author: 'Artist', lyrics: [[{word: 'Hello', chords: ['C']}]] }]"
            placeholderTextColor={'rgba(254, 241, 222, 0.5)'}
            textColor={colors.cream}
            label="Paste JSON code here..."
            style={[styles.input, styles.lyricsInput, styles.jsonInput]}
            mode="flat"
            numberOfLines={8}
            theme={{ colors: { primary: colors.terracotta } }}
            />
          <View style={styles.modalActions}>
            <Button textColor={colors.charcoal} onPress={() => setIsModalVisible(false)}>Cancel</Button>
            <Button style={{backgroundColor: colors.terracotta}} labelStyle={{color: colors.cream}} onPress={handleSaveJson}>Save</Button>
          </View>
        </Modal>
      </Portal>

      <WaveButton
        pos="top left"
        onPress={() => navigation.goBack()}
        icon={<BackIcon size={35} color={colors.cream} />}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Button
            mode="text"
            onPress={() => setIsModalVisible(true)}
            labelStyle={{ color: colors.cream }}
          >
            Add as Code {'{}'}
          </Button>
        </View>

        {parsedLines.length === 0 ? (
          <>
            <TextInput
              label="Song Title"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="flat"
              placeholderTextColor={colors.sage}
              textColor={colors.charcoal}
              theme={{ colors: { primary: colors.terracotta } }}
            />
            <TextInput
              label="Author"
              value={author}
              onChangeText={setAuthor}
              style={styles.input}
              mode="flat"
              placeholderTextColor={colors.sage}
              textColor={colors.charcoal}
              theme={{ colors: { primary: colors.terracotta } }}
            />
            <TextInput
              label="Paste all lyrics here..."
              value={lyrics}
              onChangeText={setLyrics}
              style={[styles.input, styles.lyricsInput]}
              mode="flat"
              multiline={true}
              numberOfLines={8}
              placeholderTextColor={colors.sage}
              textColor={colors.charcoal}
              theme={{ colors: { primary: colors.terracotta } }}
            />
            <Button mode="contained" onPress={handleLyricsSubmit} style={styles.button} labelStyle={styles.buttonText}>
              Attach Chords
            </Button>
          </>
        ) : (
          <View>
            <Text style={styles.editorHeader}>Tap a word to add chords</Text>
            {parsedLines.map((line, lineIndex) => (
              <View key={lineIndex} style={styles.editorLine}>
                {line.map((wordObj, wordIndex) => {
                  const isActive = activeWord?.line === lineIndex && activeWord?.word === wordIndex;
                  return (
                    <TouchableOpacity
                      key={wordIndex}
                      style={styles.wordBox}
                      onPress={() => {
                        setActiveWord({ line: lineIndex, word: wordIndex });
                        setChordValue(wordObj.chords.join(', '));
                      }}
                    >
                      {isActive ? (
                        <TextInput
                          style={styles.chordInput}
                          value={chordValue}
                          onChangeText={(text) => handleChordChange(lineIndex, wordIndex, text)}
                          onBlur={() => setActiveWord(null)}
                          autoFocus={true}
                          theme={{ colors: { primary: colors.terracotta } }}
                        />
                      ) : (
                        <Text style={styles.chordText}>
                          {wordObj.chords.join(', ')}
                        </Text>
                      )}
                      <Text style={styles.wordText}>{wordObj.word}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            <Button mode="contained" onPress={handleSaveSong} style={[styles.button, { marginTop: 30 }]} labelStyle={styles.buttonText}>
              Save Song
            </Button>
          </View>
        )}
        {/* This button will now work correctly */}
        <Button
          mode="contained"
          onPress={handleUploadJsonFile}
          style={[styles.button, { marginTop: 20 }]}
          labelStyle={styles.buttonText}
        >
          Upload JSON File
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: colors.sage },
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 160, paddingBottom: 60 },
  headerRow: {
    right: 20,
    top: 40,
    position: 'absolute',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.cream,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'rgba(254, 241, 222, 0.7)',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lyricsInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  button: { backgroundColor: colors.terracotta, paddingVertical: 8, borderRadius: 8 },
  buttonText: { color: colors.cream, fontSize: 16 },
  editorHeader: { fontSize: 18, color: colors.cream, textAlign: 'center', marginBottom: 20, fontStyle: 'italic' },
  editorLine: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  wordBox: { padding: 5, marginRight: 8, marginBottom: 10, alignItems: 'center' },
  chordText: { color: colors.terracotta, fontWeight: 'bold', fontSize: 15, minHeight: 25 },
  wordText: { color: colors.cream, fontSize: 18 },
  chordInput: { height: 30, fontSize: 14, width: 80, textAlign: 'center', backgroundColor: colors.cream, marginBottom: -5, marginTop: 0, paddingVertical: 0, },
  modalContainer: {
    backgroundColor: colors.charcoal,
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.cream,
    textAlign: 'center',
    marginBottom: 15,
  },
  jsonInput: {
    height: 300,
    backgroundColor: 'rgba(0,0,0,0.2)',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  }
});


