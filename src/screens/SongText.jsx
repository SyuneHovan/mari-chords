/** @format */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ChordDiagram from '../components/SvgGenerator' // Adjust the path if necessary

export default function MySongScreen() {
	// Example data for an Am chord
	const amChord = {
		name: 'Am',
		data: ['x', 0, 2, 2, 1, 0],
	};

	// Example for a G Major chord
	const gChord = {
		name: 'G',
		data: [3, 2, 0, 0, 0, 3],
	};

	return (
		<View style={styles.container}>
			<Text style={styles.someText}>Here is an A-minor chord:</Text>

			{/* --- Usage Example --- */}
			<ChordDiagram
				chordName={gChord.name}
				chordData={gChord.data}
			/>
		</View>
	);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  someText: {
    fontSize: 18,
    marginBottom: 20,
  }
});