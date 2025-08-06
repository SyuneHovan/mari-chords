// src/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const SONGS_KEY = '@songs';

// --- Function to get all songs ---
export const getSongs = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SONGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : []; // Return songs array or empty array
  } catch (e) {
    console.error("Error reading songs from storage", e);
    return [];
  }
};

// --- Function to save a new song ---
export const saveSong = async (newSong) => {
  try {
    // We give the new song a unique ID based on the current time
    newSong.id = Date.now(); 
    
    const existingSongs = await getSongs();
    const updatedSongs = [newSong, ...existingSongs]; // Add the new song to the beginning
    
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