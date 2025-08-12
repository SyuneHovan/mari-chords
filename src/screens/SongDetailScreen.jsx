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
	Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button, Modal, Portal } from 'react-native-paper';
import { colors } from '../theme';
import WaveButton from '../components/WaveButton';
import BackIcon from '../components/icons/BackIcon';
import SongViewIcon from '../components/icons/SongViewIcon';
import BgWaveIcon from '../components/icons/BgWaveIcon';
import PlayIcon from '../components/icons/PlayIcon';
import PauseIcon from '../components/icons/PauseIcon';
import EditIcon from '../components/icons/EditIcon';
import DoneIcon from '../components/icons/DoneIcon';
import { getChords, getSongs, updateSong } from '../storage'; // Import getSongs and the new updateSong
import Toast from 'react-native-toast-message';
import YoutubePlayer from 'react-native-youtube-iframe'; // Install this package
import { ScrollView as RNScrollView } from 'react-native';
import apiClient from '../api/client';
import ChordDiagram from '../components/SvgGenerator';

export default function SongDetailScreen() {
	const route = useRoute();
	const navigation = useNavigation();
	const { songId } = route.params;
	const screenWidth = Math.round(Dimensions.get('window').width);

	const [loading, setLoading] = useState(true);
	const [song, setSong] = useState(null);
	const [isScrolling, setIsScrolling] = useState(false);
	const [scrollSpeed, setScrollSpeed] = useState('5');
	const scrollRef = useRef(null);
	const scrollPositionRef = useRef(0);
	const [isUserScrolling, setIsUserScrolling] = useState(false);
	const [youtubePlaying, setYoutubePlaying] = useState(false);
	const [youtubeLink, setYoutubeLink] = useState('');
	const [allChords, setAllChords] = useState([]);
	const [selectedChord, setSelectedChord] = useState(null);
	const [isChordModalVisible, setIsChordModalVisible] = useState(false);

	// --- State for chord editing ---
	const [editingChord, setEditingChord] = useState(null); // { lineIndex, wordIndex }
	const [chordValue, setChordValue] = useState('');
	const [editingField, setEditingField] = useState(null); // 'title' or 'author'
	const [isEditMode, setIsEditMode] = useState(false);

	// --- State for word editing ---
	const [editingWord, setEditingWord] = useState(null); // { lineIndex, wordIndex }
	const [wordValue, setWordValue] = useState('');

	// When loading song, use its defaultSpeed
	const loadSong = async () => {
		setLoading(true);
		const allSongs = await getSongs();
		const currentSong = allSongs.find((s) => s.id === songId);
		setSong(currentSong);
		setYoutubeLink(currentSong.youtubeLink || '');
		setScrollSpeed(currentSong?.defaultSpeed?.toString() || '7'); // Use song's default speed, fallback to 7
		setLoading(false);
	};

	const loadChords = async () => {
		try {
			const chordsResponse = await apiClient.get('/nvag/chords');
			setAllChords(chordsResponse.data);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
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

	const handleChordPress = (chordName) => {
		if (isEditMode) {
			// If in edit mode, open the text editor
			const wordInfo = findWordByChord(chordName); // You'll need a helper to find the word info
			if (wordInfo) {
				setEditingChord(wordInfo);
				setChordValue(wordInfo.wordObj.chords.join(', '));
			}
		} else {
			// If in view mode, show the diagram
			const chord = allChords.find(
				(c) => c.name.toLowerCase() === chordName.toLowerCase()
			);
			if (chord) {
				console.log('chord', chord);

				setSelectedChord(chord);
				setIsChordModalVisible(true);
			} else {
				Toast.show({
					type: 'info',
					text1: `Diagram for "${chordName}" not found.`,
				});
			}
		}
	};

	// Save speed when changed
	useEffect(() => {
		if (song && scrollSpeed !== song.defaultSpeed?.toString()) {
			const updatedSong = {
				...song,
				defaultSpeed: parseInt(scrollSpeed, 10) || 7,
			};
			setSong(updatedSong);
			updateSong(updatedSong);
		}
	}, [scrollSpeed]);

	useEffect(() => {
		if (songId) {
			loadSong();
			loadChords();
		}
	}, [songId]);

	// Handles auto-scroll logic
	useEffect(() => {
		let scrollInterval;
		const speed = Math.max(1, parseInt(scrollSpeed, 10) || 1);

		// The condition is fine, but the implementation inside needs fixing
		if (isScrolling && !isUserScrolling && scrollRef.current) {
			scrollInterval = setInterval(() => {
				scrollPositionRef.current += 1 * (speed / 20);
				scrollRef.current?.scrollTo({
					y: scrollPositionRef.current,
					animated: false, //  <-- CRITICAL FIX
				});
			}, 16); // <-- Recommended interval for ~60fps
		}

		return () => clearInterval(scrollInterval);
	}, [isScrolling, scrollSpeed, isUserScrolling]);

	const handleSaveChord = async () => {
		if (!editingChord) return;
		const { lineIndex, wordIndex } = editingChord;
		const updatedSong = JSON.parse(JSON.stringify(song));
		updatedSong.lyrics[lineIndex][wordIndex].chords = chordValue
			.split(/[\s,]+/)
			.filter(Boolean);
		await updateSong(updatedSong);
		setSong(updatedSong);
		setEditingChord(null);
		setChordValue('');
		Toast.show({ type: 'success', text1: 'Chord saved!' });
	};

	// Handler for starting word edit
	const handleWordEdit = (lineIndex, wordIndex, wordObj) => {
		if (!isEditMode) return;
		setEditingWord({ lineIndex, wordIndex });
		setWordValue(wordObj.word);
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

	// Only allow metadata editing if isEditMode is true
	const renderTitle = () => {
		if (isEditMode && editingField === 'title') {
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
				disabled={!isEditMode}
				onPress={() => isEditMode && setEditingField('title')}>
				<Text style={styles.title}>{song.name}</Text>
			</TouchableOpacity>
		);
	};

	const renderAuthor = () => {
		if (isEditMode && editingField === 'author') {
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
				disabled={!isEditMode}
				onPress={() => isEditMode && setEditingField('author')}>
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
			<Portal>
				<Modal
					visible={isChordModalVisible}
					onDismiss={() => setIsChordModalVisible(false)}
					contentContainerStyle={styles.chordModalContainer}>
					<ChordDiagram
						chordData={selectedChord?.data}
						chordName={selectedChord?.name}
						baseColor={colors.charcoal}
						fingerColor={colors.sage}
						textColor={colors.charcoal}
						backgroundColor={colors.cream}
					/>
				</Modal>
			</Portal>

			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
				<WaveButton
					width={50}
					top={-20}
					iconTop={70}
					iconLeft={35}
					pos='top left'
					onPress={() => navigation.goBack()}
					icon={
						<BackIcon
							size={25}
							color={colors.cream}
						/>
					}
				/>

				<TouchableOpacity
					style={styles.editButton}
					onPress={() => {
						setIsEditMode(!isEditMode);
						setEditingField(null);
						setEditingChord(null);
					}}>
					{isEditMode ? (
						<DoneIcon
							color={colors.cream}
							size={35}
						/>
					) : (
						<EditIcon
							color={colors.cream}
							size={35}
						/>
					)}
				</TouchableOpacity>
				<View style={styles.headerContainer}>
					<RNScrollView
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						style={{ width: screenWidth }}>
						{/* Slide 1: Song Info */}

						<View
							style={{
								width: screenWidth,
								justifyContent: 'center',
								alignItems: 'center',
							}}>
							<SongViewIcon
								style={styles.headerSvg}
								width={screenWidth - 150}
								height={screenWidth - 150}
							/>
							{renderTitle()}
							{renderAuthor()}
							<TouchableOpacity
								style={styles.playButton}
								onPress={() => setIsScrolling(!isScrolling)}>
								{isScrolling ? <PauseIcon /> : <PlayIcon />}
							</TouchableOpacity>
						</View>

						{/* Slide 2: YouTube Video */}
						<View
							style={{
								width: screenWidth,
								justifyContent: 'center',
								alignItems: 'center',
							}}>
							{song.youtubeLink && extractYoutubeId(song.youtubeLink) ? (
								<View
									style={{
										width: screenWidth - 150,
										height: 300,
										justifyContent: 'center',
										alignItems: 'center',
									}}>
									<YoutubePlayer
										height={screenWidth - 150}
										width={screenWidth - 150}
										play={youtubePlaying}
										videoId={extractYoutubeId(song.youtubeLink)}
										onChangeState={(event) => {
											if (event === 'ended' || event === 'paused')
												setYoutubePlaying(false);
										}}
									/>
								</View>
							) : (
								<Text style={styles.youtubeTitle}>No valid YouTube link</Text>
							)}
						</View>
					</RNScrollView>

					<View
						style={{
							flexDirection: 'row',
							gap: 10,
							justifyContent: 'start',
							alignItems: 'center',
							zIndex: 50,
							position: 'absolute',
							bottom: 70,
							left: 20,
							borderBottomWidth: 2,
							borderBottomColor: colors.cream,
						}}>
						<Text style={styles.speed}>Speed</Text>
						<TextInput
							style={styles.speedInput}
							value={scrollSpeed}
							onChangeText={setScrollSpeed}
							keyboardType='numeric'
							maxLength={2}
							editable={isEditMode}
						/>
					</View>
				</View>
				<View style={styles.lyricsOuterContainer}>
					<BgWaveIcon
						style={styles.bgWave}
						preserveAspectRatio='xMidYMid slice'
					/>
					<View style={styles.lyricsInnerContainer}>
						{isEditMode && (
							<>
								<TextInput
									label='YouTube link'
									value={youtubeLink}
									style={styles.input}
									onChangeText={setYoutubeLink}
								/>
							</>
						)}

						<ScrollView
							ref={scrollRef}
							style={styles.scrollView}
							contentContainerStyle={styles.lyricsContentContainer}
							onScroll={(e) => {
								scrollPositionRef.current = e.nativeEvent.contentOffset.y;
							}}
							onScrollBeginDrag={() => setIsUserScrolling(true)}
							onScrollEndDrag={() => setIsUserScrolling(false)}
							scrollEventThrottle={16}>
							{song.lyrics.map((line, lineIndex) => (
								<View
									key={lineIndex}
									style={styles.line}>
									{line.map((wordObj, wordIndex) => {
										return (
											<View
												key={wordIndex}
												style={styles.wordContainer}>
												{/* Chord clickable */}
												<TouchableOpacity
													onPress={() => {
														if (isEditMode) {
															setEditingChord({ lineIndex, wordIndex });
															setChordValue(wordObj.chords.join(', '));
														} else {
															handleChordPress(wordObj.chords[0]);
														}
													}}>
													<ScrollView
														horizontal
														showsHorizontalScrollIndicator={false}>
														<Text style={styles.chords}>
															{wordObj.chords.join(' ')}
														</Text>
													</ScrollView>
												</TouchableOpacity>
												{/* Word clickable */}
												<TouchableOpacity
													disabled={!isEditMode}
													onPress={() =>
														isEditMode &&
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
				{isEditMode && editingChord && (
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
				{isEditMode && editingWord && (
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
	chordModalContainer: {
		alignSelf: 'center',
		borderRadius: 10,
	},
	editButton: {
		position: 'absolute',
		top: 45, // Adjust to your liking
		right: 30, // Adjust to your liking
		zIndex: 1, // Ensures the button is on top of other elements
	},
	fullScreen: { flex: 1, backgroundColor: colors.charcoal },
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.sage,
	},
	headerContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 0,
		height: 400,
		backgroundColor: colors.sage,
	},
	headerSvg: {
		position: 'absolute',
		marginTop: -50,
	},
	title: {
		color: colors.charcoal,
		fontWeight: '600',
		textTransform: 'uppercase',
		fontSize: 22,
		marginTop: -20,
	},
	author: {
		color: colors.charcoal,
		fontWeight: '400',
		fontSize: 16,
	},
	playButton: {
		marginTop: 15,
	},
	input: {
		marginBottom: 15,
		backgroundColor: 'rgba(254, 241, 222, 0.7)',
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
		borderRadius: 4,
		marginHorizontal: 20,
		paddingHorizontal: 10,
	},
	speedInput: {
		textAlign: 'center',
		fontSize: 20,
		color: colors.cream,
		padding: 0,
		zIndex: 16,
	},
	lyricsOuterContainer: {
		flex: 1,
		transform: 'translateY(-150px)',
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
		paddingHorizontal: 20,
		paddingBottom: 30,
	},
	line: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 20,
	},
	wordContainer: {
		position: 'relative',
		marginRight: 10,
		marginBottom: 0,
		paddingVertical: 0,
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
	speed: {
		color: colors.cream,
		zIndex: 2,
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

// Helper to extract YouTube ID
function extractYoutubeId(url) {
	const regExp =
		/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
}
