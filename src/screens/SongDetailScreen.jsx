// src/screens/SongDetailScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import WaveIcon from '../components/icons/WaveIcon'; // Import our new WaveIcon
import BackIcon from '../components/icons/BackIcon';
import SongViewIcon from '../components/icons/SongViewIcon';
import BgWaveIcon from '../components/icons/BgWaveIcon';
import PlayIcon from '../components/icons/PlayIcon';
import PauseIcon from '../components/icons/PauseIcon';
import WaveButton from '../components/WaveButton';
import { API_URL } from '../config';

export default function SongDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { songId } = route.params;

  const [loading, setLoading] = useState(true);
  const [song, setSong] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState("5"); // Speed state (as a string for TextInput)
  const scrollRef = useRef(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (songId) {
      const fetchSong = async () => {
        setLoading(true);
        // Reset state for new song
        setIsScrolling(false);
        scrollPositionRef.current = 0;
        try {
          const response = await fetch(`${API_URL}/api/songs/${songId}`);
          if (!response.ok) throw new Error('Failed to fetch song');
          const data = await response.json();
          setSong(data);
        } catch (error) {
          console.error("Error fetching song:", error);
          alert('Error fetching song details.');
        } finally {
          setLoading(false);
        }
      };
      fetchSong();
    }
  }, [songId]);

  useEffect(() => {
    let scrollInterval;
    const speed = Math.max(1, parseInt(scrollSpeed, 10) || 1);
    
    if (isScrolling && scrollRef.current) {
      scrollInterval = setInterval(() => {
        scrollPositionRef.current += 1 * (speed / 20); // Use the speed state
        scrollRef.current.scrollTo({
          y: scrollPositionRef.current,
          animated: true,
        });
      }, 50); // Interval controls smoothness
    }
    return () => clearInterval(scrollInterval);
  }, [isScrolling, scrollSpeed]);

  if (loading || !song) {
    return (
      <View style={[styles.center, { backgroundColor: colors.sage }]}>
        <ActivityIndicator size="large" color={colors.cream} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.fullScreen}>      
      <WaveButton
        pos="top left"
        style={styles.waveButton}
        onPress={() => navigation.goBack()}
        icon={<BackIcon size={25} color={colors.cream} />}
      />
      
      <View style={styles.headerContainer}>
        <SongViewIcon style={styles.headerSvg} />
        <Text style={styles.title}>{song.name}</Text>
        <Text style={styles.author}>{song.author}</Text>
        <TouchableOpacity style={styles.playButton} onPress={() => setIsScrolling(!isScrolling)}>
          {isScrolling ? <PauseIcon /> : <PlayIcon />}
        </TouchableOpacity>
        <TextInput 
          style={styles.speedInput}
          value={scrollSpeed}
          onChangeText={setScrollSpeed}
          keyboardType="numeric"
          maxLength={2}
        />
      </View>

      <View style={styles.lyricsOuterContainer}>
        <BgWaveIcon style={styles.bgWave} preserveAspectRatio="xMidYMid slice" />
        <View style={styles.lyricsInnerContainer}>
          <ScrollView
            ref={scrollRef}
            onScroll={(event) => {
              if (!isScrolling) { // Only update if user scrolls manually
                scrollPositionRef.current = event.nativeEvent.contentOffset.y;
              }
            }}
            scrollEventThrottle={16}
          >
            <View style={styles.lyricsContentContainer}>
              {song.lyrics.map((line, lineIndex) => (
                <View key={lineIndex} style={styles.line}>
                  {line.map((wordObj, wordIndex) => (
                    <View key={wordIndex} style={styles.wordContainer}>
                      <Text style={styles.chords}>{wordObj.chords.join(' ')}</Text>
                      <Text style={styles.word}>{wordObj.word} </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: colors.sage },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.sage },
  backButton: {
    top: -1,
    left: 0,
    transform: "rotateX(180deg)"
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    zIndex: 10,
    marginTop: '45px'
  },
  headerSvg: {
    position: 'absolute',
  },
  title: {
    color: colors.charcoal,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 20,
  },
  author: {
    color: colors.charcoal,
    fontWeight: '400',
    fontSize: 16,
  },
  playButton: {
    marginTop: 15,
  },
  speedInput: {
    position: 'absolute',
    bottom: 40,
    right: 50,
    width: 50,
    textAlign: 'center',
    fontSize: 20,
    color: colors.charcoal,
    borderBottomWidth: 2,
    borderBottomColor: colors.charcoal,
    padding: 0,
  },
  lyricsOuterContainer: {
    flex: 1,
  },
  lyricsInnerContainer: {
    flex: 1,
    backgroundColor: colors.charcoal,
    transform: "translateY(50px)"
  },
  bgWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  lyricsContentContainer: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  wordContainer: {
    position: 'relative',
    marginRight: 2,
    marginBottom: 12,
  },
  chords: {
    position: 'absolute',
    textWrap: 'nowrap',
    top: -15,
    left: 0,
    color: colors.cream,
    fontWeight: 'bold',
  },
  word: {
    color: colors.cream,
    fontSize: 14,
    lineHeight: 25,
  },
});