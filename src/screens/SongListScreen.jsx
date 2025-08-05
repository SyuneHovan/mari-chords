import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, SafeAreaView, View } from 'react-native';
import { ActivityIndicator, List, Searchbar, TextInput } from 'react-native-paper';
import { colors } from '../theme';
import AddIcon from '../components/icons/AddIcon'; // Import AddIcon
import WaveButton from '../components/WaveButton';
import SongIcon from '../components/icons/SongIcon';
import HomeWaveIcon from '../components/icons/HomeWaveIcon';
import { API_URL } from '../config';

export default function SongListScreen({ navigation }) {
  // ... (all your state and functions like fetchSongs, etc. remain the same) ...
  const [loading, setLoading] = useState(true);
  const [allSongs, setAllSongs] = useState([]);
  const [filter, setFilter] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);

  const fetchSongs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/songs`);
      if (!response.ok) throw new Error('Failed to fetch songs');
      const songsData = await response.json();
      setAllSongs(songsData);
      setFilteredSongs(songsData);
    } catch (error) {
      console.error("Error fetching songs:", error);
      alert('Error: Could not fetch songs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = allSongs.filter(song =>
      song.name.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredSongs(filtered);
  }, [filter, allSongs]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { fetchSongs(); });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.sage }]}>
        <ActivityIndicator size="large" color={colors.cream} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.fullScreen}>
      <HomeWaveIcon style={styles.homeBgWave} />
      <View style={styles.filterContainer}>
        <TextInput
          label="Search songs..."
          value={filter}
          onChangeText={setFilter}
          style={styles.searchbar}
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          placeholderTextColor={colors.sage}
          textColor={colors.sage}
          theme={{ colors: { primary: colors.terracotta } }}
        />
      </View>
      <FlatList
        style={styles.flatList}
        data={filteredSongs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={item.author}
            onPress={() => navigation.navigate('Song Details', { songId: item.id })}
            titleStyle={styles.songTitle}
            descriptionStyle={styles.songAuthor}
              left={() => <SongIcon width={80} height={80} />} // <-- Use your custom SongIcon here
            // left={props => <List.Icon {...props} icon="music-note" color={colors.cream} />}
          />
        )}
      />

      <WaveButton
        pos="bottom left"
        style={styles.waveButton}
        onPress={() => navigation.navigate('Add Song')}
        icon={<AddIcon size={50} color={colors.cream} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  homeBgWave: {
    position: "absolute",
    zIndex: "-1",
    top: "-28vw",
    width: "100%"
  },
  flatList: {
    paddingHorizontal: 20,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.sage,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  searchbar: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    color: "#fff"
  },
  songTitle: {
    color: colors.cream,
    textTransform: 'uppercase',
    fontWeight: '600',
    fontSize: 18,
  },
  songAuthor: {
    color: colors.cream,
    opacity: 0.8,
  },
  // Style for the WaveButton's position
  waveButton: {
    position: 'absolute',
    bottom: 0,
    left: 0, // Adjust position as needed
  },
});