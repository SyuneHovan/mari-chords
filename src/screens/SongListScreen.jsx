import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Text, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { ActivityIndicator, List, TextInput, Chip } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { colors } from '../theme';
import WaveButton from '../components/WaveButton';
import AddIcon from '../components/icons/AddIcon';
import SongIcon from '../components/icons/SongIcon';
import Toast from 'react-native-toast-message';
import HomeWaveIcon from '../components/icons/HomeWaveIcon';
import { getSongs, deleteSong } from '../storage';

// This component renders the "Delete" button when you swipe a song
const renderRightActions = (progress, dragX, onPress) => {
  const trans = dragX.interpolate({
    inputRange: [-80, 0],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });
  return (
    <TouchableOpacity onPress={onPress} style={styles.deleteButton}>
      <Animated.Text style={[styles.deleteButtonText, { transform: [{ translateX: trans }] }]}>
        Delete
      </Animated.Text>
    </TouchableOpacity>
  );
};


export default function SongListScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [allSongs, setAllSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);

  // State for filters
  const [searchText, setSearchText] = useState('');
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('All');

  // Fetches songs from local storage and sets up the author list
  const fetchSongs = async () => {
    setLoading(true);
    const songsData = await getSongs();
    setAllSongs(songsData);

    // Extract unique authors (filtering out any null/empty values) and create the filter list
    const uniqueAuthors = ['All', ...new Set(songsData.map(song => song.author).filter(Boolean))];
    setAuthors(uniqueAuthors);

    setLoading(false);
  };

  // This useEffect handles BOTH search and category filtering
  useEffect(() => {
    let filtered = allSongs;

    if (selectedAuthor !== 'All') {
      filtered = filtered.filter(song => song.author === selectedAuthor);
    }

    if (searchText) {
      filtered = filtered.filter(song =>
        song.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredSongs(filtered);
  }, [searchText, selectedAuthor, allSongs]);

  // Refetches songs every time the screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchSongs);
    return unsubscribe;
  }, [navigation]);

  // Deletes a song from local storage and refreshes the list
  const handleDelete = async (songId) => {
    await deleteSong(songId);
    Toast.show({ type: 'success', text1: 'Song deleted!' });
    fetchSongs();
  };

  // Shows a loading indicator while fetching songs
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
          label="Search a song..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          placeholderTextColor={'rgba(254, 241, 222, 0.7)'}
          textColor={colors.cream}
          theme={{ colors: { primary: colors.cream, onSurfaceVariant: colors.cream } }}
        />
      </View>

      {/* --- The Category Scroller --- */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {authors.map(author => (
            <Chip
              key={author}
              selected={author === selectedAuthor}
              onPress={() => setSelectedAuthor(author)}
              style={[
                styles.chip,
                author === selectedAuthor ? styles.chipSelected : styles.chipUnselected
              ]}
              textStyle={[
                styles.chipText,
                author === selectedAuthor ? styles.chipTextSelected : styles.chipTextUnselected
              ]}
            >
              {author}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 100 }} // Added paddingBottom so the FAB doesn't cover the last song
        renderItem={({ item }) => (
          <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, () => handleDelete(item.id))}>
            <List.Item
              title={item.name}
              description={item.author}
              onPress={() => navigation.navigate('Song Details', { songId: item.id })}
              titleStyle={styles.songTitle}
              descriptionStyle={styles.songAuthor}
              left={() => <SongIcon width={80} height={80} />}
              style={{ backgroundColor: 'transparent', paddingVertical: 10 }}
            />
          </Swipeable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <WaveButton
        pos="bottom left"
        onPress={() => navigation.navigate('Add Song')}
        icon={<AddIcon size={40} color={colors.cream} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: colors.sage },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  homeBgWave: { position: 'absolute', top: -400, left: 0, right: 0, zIndex: 0 },
  filterContainer: { paddingHorizontal: 20, paddingTop: 40 },
  searchInput: {
    marginBottom: 15,
    backgroundColor: 'transparent', // Use transparent background
    borderBottomWidth: 2,           // Add a 2px border
    borderBottomColor: colors.cream, // Use cream color for the border
    paddingHorizontal: 2, // Add a little horizontal padding
  },
  categoryContainer: {
    paddingVertical: 10,
    paddingLeft: 20,
  },
  chip: {
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.cream,
  },
  chipSelected: {
    opacity: 1
  },
  chipUnselected: {
    opacity: 0.7,
  },
  chipText: {
    fontWeight: 'bold',
  },
  chipTextSelected: {
    color: colors.sage,
  },
  chipTextUnselected: {
    color: colors.sage,
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
  deleteButton: {
    backgroundColor: colors.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    padding: 10,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(254, 241, 222, 0.1)',
    marginLeft: 20,
    marginRight: 20,
  },
});
