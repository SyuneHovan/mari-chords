/** @format */

import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity,
	TextInput,
	SafeAreaView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { colors } from '../theme';
import WaveButton from '../components/WaveButton';
import BackIcon from '../components/icons/BackIcon';
import SongViewIcon from '../components/icons/SongViewIcon';
import BgWaveIcon from '../components/icons/BgWaveIcon';
import PlayIcon from '../components/icons/PlayIcon';
import PauseIcon from '../components/icons/PauseIcon';
import EditIcon from '../components/icons/EditIcon';
import DoneIcon from '../components/icons/DoneIcon';
import { getSongs, updateSong } from '../storage'; // Import getSongs and the new updateSong
import Toast from 'react-native-toast-message';

export default function SongDetailScreen() {
	const route = useRoute();
	const navigation = useNavigation();
	const { songId } = route.params;

	const [loading, setLoading] = useState(true);
	const [song, setSong] = useState(null);
	const [isScrolling, setIsScrolling] = useState(false);
	const [scrollSpeed, setScrollSpeed] = useState('5');
	const scrollRef = useRef(null);
	const scrollPositionRef = useRef(0);

	// --- State for chord editing ---
	const [editingChord, setEditingChord] = useState(null); // { lineIndex, wordIndex }
	const [chordValue, setChordValue] = useState('');
	const [editingField, setEditingField] = useState(null); // 'title' or 'author'
	const [isEditing, setIsEditing] = useState(false);

	// --- State for word editing ---
	const [editingWord, setEditingWord] = useState(null); // { lineIndex, wordIndex }
	const [wordValue, setWordValue] = useState('');

	// Loads song from local storage
	const loadSong = async () => {
		setLoading(true);
		const allSongs = await getSongs();
		const currentSong = allSongs.find((s) => s.id === songId);
		setSong(currentSong);
		setLoading(false);
	};

	// Handler for starting word edit
	const handleWordEdit = (lineIndex, wordIndex, wordObj) => {
		if (!isEditing) return;
		setEditingWord({ lineIndex, wordIndex });
		setWordValue(wordObj.word);
	};

	// --- NEW: Updates title/author in state as you type ---
	const handleMetadataChange = (field, value) => {
		setSong((prevSong) => ({ ...prevSong, [field]: value }));
	};

	// --- NEW: Saves title/author changes when input loses focus ---
	const handleSaveMetadata = async () => {
		if (!editingField) return;
		await updateSong(song);
		setEditingField(null);
		Toast.show({ type: 'success', text1: 'Song updated!' });
	};

	useEffect(() => {
		if (songId) {
			loadSong();
		}
	}, [songId]);

	// Handles auto-scroll logic
	useEffect(() => {
		let scrollInterval;
		const speed = Math.max(1, parseInt(scrollSpeed, 10) || 1);
		if (isScrolling && scrollRef.current) {
			scrollInterval = setInterval(() => {
				scrollPositionRef.current += 1 * (speed / 5);
				scrollRef.current.scrollTo({
					y: scrollPositionRef.current,
					animated: true,
				});
			}, 50);
		}
		return () => clearInterval(scrollInterval);
	}, [isScrolling, scrollSpeed]);

	// --- NEW: Function to handle saving an edited chord ---
	const handleSaveChord = async () => {
		if (!editingChord) return;

		const { lineIndex, wordIndex } = editingChord;

		// Create a deep copy of the song to avoid direct state mutation
		const updatedSong = JSON.parse(JSON.stringify(song));

		// Update the chords for the specific word
		updatedSong.lyrics[lineIndex][wordIndex].chords = chordValue
			.split(/[\s,]+/)
			.filter(Boolean);

		// Save the entire updated song object to storage
		await updateSong(updatedSong);

		// Update the local state to show the change immediately
		setSong(updatedSong);

		// Reset editing state
		setEditingChord(null);
		setChordValue('');

		Toast.show({ type: 'success', text1: 'Chord saved!' });
	};

	// Handler for saving word edit
	const handleSaveWord = async () => {
		if (!editingWord) return;
		const { lineIndex, wordIndex } = editingWord;
		const updatedSong = JSON.parse(JSON.stringify(song));
		updatedSong.lyrics[lineIndex][wordIndex].word = wordValue;
		await updateSong(updatedSong);
		setSong(updatedSong);
		setEditingWord(null);
		setWordValue('');
		Toast.show({ type: 'success', text1: 'Word updated!' });
	};

	// Only allow chord editing if isEditing is true
	const handleWordPress = (lineIndex, wordIndex, wordObj) => {
		if (!isEditing) return;
		setEditingChord({ lineIndex, wordIndex });
		setChordValue(wordObj.chords.join(', '));
	};

	// Only allow metadata editing if isEditing is true
	const renderTitle = () => {
		if (isEditing && editingField === 'title') {
			return (
				<TextInput
					value={song.name}
					onChangeText={(text) => handleMetadataChange('name', text)}
					onBlur={handleSaveMetadata}
					autoFocus
					style={[styles.title, styles.input]}
				/>
			);
		}
		return (
			<TouchableOpacity
				style={styles.title}
				disabled={!isEditing}
				onPress={() => isEditing && setEditingField('title')}>
				<Text style={styles.title}>{song.name}</Text>
			</TouchableOpacity>
		);
	};

	const renderAuthor = () => {
		if (isEditing && editingField === 'author') {
			return (
				<TextInput
					value={song.author}
					onChangeText={(text) => handleMetadataChange('author', text)}
					onBlur={handleSaveMetadata}
					autoFocus
					style={[styles.author, styles.input]}
				/>
			);
		}
		return (
			<TouchableOpacity
				style={styles.author}
				disabled={!isEditing}
				onPress={() => isEditing && setEditingField('author')}>
				<Text style={styles.author}>{song.author}</Text>
			</TouchableOpacity>
		);
	};

	if (loading || !song) {
		return (
			<View style={styles.center}>
				<ActivityIndicator
					size='large'
					color={colors.cream}
				/>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.fullScreen}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
				<WaveButton
					pos='top left'
					onPress={() => navigation.goBack()}
					icon={
						<BackIcon
							size={30}
							color={colors.cream}
						/>
					}
				/>

				{/* Edit button */}
				<WaveButton
					pos='top right'
					color='terracotta'
					top={true}
					onPress={() => {
						setIsEditing(!isEditing);
						setEditingField(null);
						setEditingChord(null);
					}}
					icon={
						isEditing ? (
							<DoneIcon textColor={colors.cream} />
						) : (
							<EditIcon textColor={colors.cream} />
						)
					}
				/>
				{/* <View style={{ position: 'absolute', top: 30, right: 30, zIndex: 20 }}>
					<Button
						mode={isEditing ? 'contained' : 'outlined'}
						onPress={() => {
							setIsEditing(!isEditing);
							setEditingField(null);
							setEditingChord(null);
						}}>
						{isEditing ? 'Done' : 'Edit'}
					</Button>
				</View> */}

				<View style={styles.headerContainer}>
					<SongViewIcon style={styles.headerSvg} />
					{renderTitle()}
					{renderAuthor()}
					<TouchableOpacity
						style={styles.playButton}
						onPress={() => setIsScrolling(!isScrolling)}>
						{isScrolling ? <PauseIcon /> : <PlayIcon />}
					</TouchableOpacity>
					<TextInput
						style={styles.speedInput}
						value={scrollSpeed}
						onChangeText={setScrollSpeed}
						keyboardType='numeric'
						maxLength={2}
						editable={isEditing}
					/>
				</View>

				<View style={styles.lyricsOuterContainer}>
					<BgWaveIcon
						style={styles.bgWave}
						preserveAspectRatio='xMidYMid slice'
					/>
					<View style={styles.lyricsInnerContainer}>
						<ScrollView
							ref={scrollRef}
							style={styles.scrollView}
							contentContainerStyle={styles.lyricsContentContainer}>
							{song.lyrics.map((line, lineIndex) => (
								<View
									key={lineIndex}
									style={styles.line}>
									{line.map((wordObj, wordIndex) => {
										const isChordEditing =
											editingChord &&
											editingChord.lineIndex === lineIndex &&
											editingChord.wordIndex === wordIndex;
										const isWordEditing =
											editingWord &&
											editingWord.lineIndex === lineIndex &&
											editingWord.wordIndex === wordIndex;
										return (
											<View
												key={wordIndex}
												style={styles.wordContainer}>
												{/* Chord clickable */}
												<TouchableOpacity
													disabled={!isEditing}
													onPress={() => {
														if (isEditing) {
															setEditingChord({ lineIndex, wordIndex });
															setChordValue(wordObj.chords.join(', '));
														}
													}}>
													<ScrollView horizontal showsHorizontalScrollIndicator={false}>
														<Text style={styles.chords}>
															{wordObj.chords.join(' ')}
														</Text>
													</ScrollView>
												</TouchableOpacity>
												{/* Word clickable */}
												<TouchableOpacity
													disabled={!isEditing}
													onPress={() =>
														isEditing &&
														handleWordEdit(lineIndex, wordIndex, wordObj)
													}>
													<Text style={styles.word}>{wordObj.word} </Text>
												</TouchableOpacity>
											</View>
										);
									})}
								</View>
							))}
						</ScrollView>
					</View>
				</View>

				{/* Pop-up editor for chords */}
				{isEditing && editingChord && (
					<View style={styles.flyingEditor}>
						<TextInput
							style={styles.chordInput}
							value={chordValue}
							onChangeText={setChordValue}
							autoFocus={true}
							placeholder='e.g. Am, G, C'
							placeholderTextColor={colors.sage}
						/>
						<Button
							style={styles.saveChordButton}
							labelStyle={{ color: colors.cream }}
							onPress={handleSaveChord}>
							Save
						</Button>
						<Button
							textColor={colors.charcoal}
							onPress={() => setEditingChord(null)}>
							Cancel
						</Button>
					</View>
				)}

				{/* Pop-up editor for words */}
				{isEditing && editingWord && (
					<View style={styles.flyingEditor}>
						<TextInput
							style={styles.chordInput}
							value={wordValue}
							onChangeText={setWordValue}
							autoFocus={true}
							placeholder='Edit word'
							placeholderTextColor={colors.sage}
						/>
						<Button
							style={styles.saveChordButton}
							labelStyle={{ color: colors.cream }}
							onPress={handleSaveWord}>
							Save
						</Button>
						<Button
							textColor={colors.charcoal}
							onPress={() => setEditingWord(null)}>
							Cancel
						</Button>
					</View>
				)}
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	fullScreen: { flex: 1, backgroundColor: colors.sage },
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.sage,
	},
	headerContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 400,
	},
	headerSvg: {
		position: 'absolute',
		zIndex: 11,
	},
	title: {
		color: colors.charcoal,
		fontWeight: '600',
		textTransform: 'uppercase',
		fontSize: 22,
		marginTop: 0,
		zIndex: 11,
	},
	author: {
		color: colors.charcoal,
		fontWeight: '400',
		fontSize: 16,
		zIndex: 11,
	},
	playButton: {
		marginTop: 15,
		zIndex: 11,
	},
	speedInput: {
		position: 'absolute',
		bottom: 50,
		right: 50,
		width: 50,
		textAlign: 'center',
		fontSize: 20,
		color: colors.charcoal,
		borderBottomWidth: 2,
		borderBottomColor: colors.charcoal,
		padding: 0,
		zIndex: 16, // <-- THIS IS THE FIX
	},
	lyricsOuterContainer: {
		flex: 1,
		transform: 'translateY(-90px)',
	},
	lyricsInnerContainer: {
		flex: 1,
		backgroundColor: colors.charcoal,
		transform: 'translateY(120px)',
	},

	bgWave: {
		position: 'absolute',
		top: 20,
		left: 0,
		right: 0,
		height: 220,
	},
	scrollView: {
		flex: 1,
		backgroundColor: colors.charcoal,
	},
	lyricsContentContainer: {
		paddingTop: 45,
		paddingHorizontal: 30,
		paddingBottom: 30,
	},
	line: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 25,
	},
	wordContainer: {
		position: 'relative',
		marginRight: 10,
		marginBottom: 10,
		paddingVertical: 5,
	},
	chords: {
		color: colors.cream,
		fontWeight: 'bold',
		overflow: 'visible',
		flexWrap: 'nowrap',
		flexShrink: 0,
		width: 'auto',
		maxWidth: 'none',
		zIndex: 2,
		marginBottom: 2, // Optional: space between chord and word
	},
	word: {
		color: colors.cream,
		fontSize: 18,
		lineHeight: 25,
	},
	flyingEditor: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: colors.cream,
		padding: 15,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 10,
	},
	chordInput: {
		flex: 1,
		height: 40,
		backgroundColor: 'rgba(100, 130, 106, 0.2)',
		borderRadius: 8,
		paddingHorizontal: 10,
		marginRight: 10,
	},
	saveChordButton: {
		backgroundColor: colors.sienna,
	},
});
