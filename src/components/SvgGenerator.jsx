/** @format */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

// --- CONFIGURATION CONSTANTS ---
const DIAGRAM_WIDTH = 130;
const DIAGRAM_HEIGHT = 150;
const STRING_COUNT = 6;
const FRET_COUNT = 5;
const STRING_SPACING = (DIAGRAM_WIDTH - 35) / (STRING_COUNT - 1);
const FRET_SPACING = (DIAGRAM_HEIGHT - 50) / FRET_COUNT;
const DOT_RADIUS = 7;
const START_Y = 40;
const START_X = 18;
const BARRE_HEIGHT = DOT_RADIUS * 2;

const ChordDiagram = ({
	chordName,
	chordData,
	backgroundColor = '#FEF1DE',
	fingerColor = '#242424',
	baseColor = '#242424',
	textColor = '#242424',
}) => {
	const { fretOffset, processedChordData, barres } = useMemo(() => {
		// **THE FIX IS HERE**: Ensure all fret values are numbers for calculation.
		// This handles cases where data is passed as `["4", "6", "6", ...]`
		const numericData = chordData.map((f) => {
			if (f === 'x' || f === null) return f;
			const num = parseInt(f, 10);
			return isNaN(num) ? f : num;
    });
    
    
    
		// Now, use the sanitized `numericData` for all logic
		const frettedNotes = numericData.filter(
      (f) => typeof f === 'number' && f > 0
		);
		if (frettedNotes.length === 0) {
      return { fretOffset: 0, processedChordData: numericData, barres: [] };
		}
    
		let offset = 0;
		// Determine if an offset is needed (only if a fret is outside the visible range)
		if (Math.max(...frettedNotes) > FRET_COUNT-1) {
      offset = Math.min(...frettedNotes);
		}
    
    console.log('numericData', frettedNotes);
		// Adjust chord data based on the offset
		const adjustedData = numericData.map((fret) => {
			if (typeof fret === 'number' && fret > 0 && offset > 0) {
				// The transformation logic: e.g., fret 4 becomes diagram fret 1 if offset is 4
				return fret - offset + 1;
			}
			return fret;
		});

		// Barre Detection Logic (uses the correctly `adjustedData`)
		const detectedBarres = [];
		const fretCounts = {};
		adjustedData.forEach((fret, stringIndex) => {
			if (typeof fret === 'number' && fret > 0) {
				if (!fretCounts[fret]) fretCounts[fret] = [];
				fretCounts[fret].push(stringIndex);
			}
		});

		const areAllStringsPlayed = !adjustedData.includes(0);
		const [fretStr, strings] = Object.entries(fretCounts)[0]
    const fret = parseInt(fretStr, 10);
    const isBarre = fret > 0 && strings.length > 1 && areAllStringsPlayed;
    if (isBarre) {
      detectedBarres.push({
        fret,
        startString: Math.min(...strings),
        endString: Math.max(...strings),
      });
    }

		return {
			fretOffset: offset,
			processedChordData: adjustedData,
			barres: detectedBarres,
		};
	}, [chordData]);

	const renderStrings = () => {
		return Array.from({ length: STRING_COUNT }).map((_, i) => (
			<Line
				key={`string-${i}`}
				x1={START_X + i * STRING_SPACING}
				y1={START_Y}
				x2={START_X + i * STRING_SPACING}
				y2={START_Y + FRET_COUNT * FRET_SPACING}
				stroke={baseColor}
				strokeWidth='1'
			/>
		));
	};

	const renderFrets = () => {
		return Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
			<Line
				key={`fret-${i}`}
				x1={START_X}
				y1={START_Y + i * FRET_SPACING}
				x2={START_X + (STRING_COUNT - 1) * STRING_SPACING}
				y2={START_Y + i * FRET_SPACING}
				stroke={baseColor}
				strokeWidth={i === 0 && fretOffset === 0 ? '2' : '1'} // Nut is thick only if not offset
			/>
		));
	};

	const renderFretNumber = () => {
		if (fretOffset === 0) return null;
		return (
			<SvgText
				x={START_X - 9}
				y={START_Y + FRET_SPACING / 1.5}
				fontSize='12'
				fill={baseColor}
				textAnchor='end'
				fontWeight='bold'>
				{fretOffset}
			</SvgText>
		);
	};

	const renderBarres = () => {
		return barres.map((barre, index) => {
			const x = START_X + barre.startString * STRING_SPACING;
			const y =
				START_Y +
				barre.fret * FRET_SPACING -
				FRET_SPACING / 2 -
				BARRE_HEIGHT / 2;
			const width = (barre.endString - barre.startString) * STRING_SPACING;
			return (
				<Rect
					key={`barre-${index}`}
					x={x}
					y={y}
					width={width}
					height={BARRE_HEIGHT}
					fill={fingerColor}
				/>
			);
		});
	};

	const renderFingerings = () => {
		return processedChordData
			.map((fret, stringIndex) => {
				const x = START_X + stringIndex * STRING_SPACING;
				if (fret === 'x' || fret === null) {
					return (
						<SvgText
							key={`finger-${stringIndex}`}
							x={x}
							y={START_Y - 5}
							fontSize='16'
							fill={textColor}
							textAnchor='middle'>
							x
						</SvgText>
					);
				}
				if (fret === 0) {
					return (
						<Circle
							key={`finger-${stringIndex}`}
							cx={x}
							cy={START_Y - (DOT_RADIUS + 2)}
							r={DOT_RADIUS / 1.5}
							stroke={textColor}
							strokeWidth='1.5'
							fill='transparent'
						/>
					);
				}
				// Only render dots that are within the visible fret count
				if (fret > 0 && fret <= FRET_COUNT) {
					const y = START_Y + fret * FRET_SPACING - FRET_SPACING / 2;
					return (
						<Circle
							key={`finger-${stringIndex}`}
							cx={x}
							cy={y}
							r={DOT_RADIUS}
							fill={fingerColor}
						/>
					);
				}
				return null;
			})
			.filter(Boolean);
	};

	return (
		<View style={[styles.container, { backgroundColor }]}>
			<Svg
				height={DIAGRAM_HEIGHT}
				width={DIAGRAM_WIDTH}>
				<SvgText
					x={DIAGRAM_WIDTH / 2}
					y='18'
					fontSize='20'
					fontWeight='bold'
					fill={textColor}
					textAnchor='middle'>
					{chordName}
				</SvgText>
				{renderFrets()}
				{renderStrings()}
				{renderFretNumber()}
				{renderBarres()}
				{renderFingerings()}
			</Svg>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		margin: 10,
		padding: 10,
		borderRadius: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
});

export default ChordDiagram;
