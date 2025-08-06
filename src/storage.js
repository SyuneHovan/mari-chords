import AsyncStorage from '@react-native-async-storage/async-storage';

const SONGS_KEY = '@songs';

// --- Function to get all songs ---
export const getSongs = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SONGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading songs from storage", e);
    return [];
  }
};

// --- Function to save a single new song ---
export const saveSong = async (newSong) => {
  try {
    newSong.id = Date.now();
    const existingSongs = await getSongs();
    const updatedSongs = [newSong, ...existingSongs];
    const jsonValue = JSON.stringify(updatedSongs);
    await AsyncStorage.setItem(SONGS_KEY, jsonValue);
  } catch (e) {
    console.error("Error saving song to storage", e);
  }
};

// --- Function to delete a song ---
export const deleteSong = async (songId) => {
  try {
    const existingSongs = await getSongs();
    const updatedSongs = existingSongs.filter(song => song.id !== songId);
    const jsonValue = JSON.stringify(updatedSongs);
    await AsyncStorage.setItem(SONGS_KEY, jsonValue);
  } catch (e) {
    console.error("Error deleting song from storage", e);
  }
};

// --- Function to update an existing song ---
export const updateSong = async (songToUpdate) => {
  try {
    const existingSongs = await getSongs();
    const songIndex = existingSongs.findIndex(song => song.id === songToUpdate.id);
    if (songIndex > -1) {
      existingSongs[songIndex] = songToUpdate;
      const jsonValue = JSON.stringify(existingSongs);
      await AsyncStorage.setItem(SONGS_KEY, jsonValue);
    }
  } catch (e) {
    console.error("Error updating song in storage", e);
  }
};

// --- NEW: Function to save an array of new songs ---
export const saveSongArray = async (newSongs) => {
  try {
    const existingSongs = await getSongs();
    // Give each new song a unique ID to prevent collisions
    const songsWithIds = newSongs.map((song, index) => ({
      ...song,
      id: Date.now() + index,
    }));
    const updatedSongs = [...songsWithIds, ...existingSongs];
    const jsonValue = JSON.stringify(updatedSongs);
    await AsyncStorage.setItem(SONGS_KEY, jsonValue);
  } catch (e) {
    console.error("Error saving song array to storage", e);
  }
};
