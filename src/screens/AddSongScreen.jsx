import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { colors } from '../theme';
import Toast from 'react-native-toast-message'; // Import the Toast component

export default function AddSongScreen({ navigation }) {
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [lyrics, setLyrics] = useState('');
  
  // --- New state for the chord editor ---
  const [parsedLines, setParsedLines] = useState([]);
  const [activeWord, setActiveWord] = useState(null); // Tracks which word is being edited {line, word}

  // This is your original logic, copied directly and adapted for our Toast component!
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
  
  // This function updates the chords for a specific word
  const handleChordChange = (lineIndex, wordIndex, newChords) => {
    const updatedLines = [...parsedLines];
    // Split by comma or space to allow multiple chords
    updatedLines[lineIndex][wordIndex].chords = newChords.split(/[\s,]+/).filter(c => c);
    setParsedLines(updatedLines);
  };
  
  // We will implement saving in the next step
  const handleSaveSong = () => {
    alert('Next step: Save this song to the database!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Add a New Song</Text>
      
      {/* If we haven't processed lyrics yet, show the input form */}
      {parsedLines.length === 0 ? (
        <>
          <TextInput
            label="Song Title"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: colors.terracotta, onSurfaceVariant: colors.charcoal } }}
          />
          <TextInput
            label="Author"
            value={author}
            onChangeText={setAuthor}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: colors.terracotta, onSurfaceVariant: colors.charcoal } }}
          />
          <TextInput
            label="Paste all lyrics here..."
            value={lyrics}
            onChangeText={setLyrics}
            style={styles.lyricsInput}
            mode="outlined"
            multiline={true}
            numberOfLines={8}
            theme={{ colors: { primary: colors.terracotta, onSurfaceVariant: colors.charcoal } }}
          />
          <Button mode="contained" onPress={handleLyricsSubmit} style={styles.button} labelStyle={styles.buttonText}>
            Attach Chords
          </Button>
        </>
      ) : (
        // --- If we HAVE processed lyrics, show the chord editor ---
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
                    onPress={() => setActiveWord({ line: lineIndex, word: wordIndex })}
                  >
                    {isActive ? (
                      <TextInput
                        style={styles.chordInput}
                        value={wordObj.chords.join(', ')}
                        onChangeText={(text) => handleChordChange(lineIndex, wordIndex, text)}
                        autoFocus={true}
                        onBlur={() => setActiveWord(null)} // Hide input when it loses focus
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sage },
  contentContainer: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: colors.cream, textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 15, backgroundColor: 'rgba(254, 241, 222, 0.7)' },
  lyricsInput: { marginBottom: 20, backgroundColor: 'rgba(254, 241, 222, 0.7)' },
  button: { backgroundColor: colors.terracotta, paddingVertical: 8 },
  buttonText: { color: colors.cream, fontSize: 16 },
  // --- New styles for the editor ---
  editorHeader: { fontSize: 18, color: colors.cream, textAlign: 'center', marginBottom: 20, fontStyle: 'italic' },
  editorLine: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  wordBox: { padding: 5, marginRight: 8, marginBottom: 10, alignItems: 'center' },
  chordText: { color: colors.terracotta, fontWeight: 'bold', fontSize: 15, minHeight: 25 },
  wordText: { color: colors.cream, fontSize: 18 },
  chordInput: {
    height: 30,
    fontSize: 14,
    width: 80, // Give the input a fixed width
    textAlign: 'center',
    backgroundColor: colors.cream,
    marginBottom: -5, // Adjust position to align with text
    marginTop: 0,
    paddingVertical: 0,
  },
});