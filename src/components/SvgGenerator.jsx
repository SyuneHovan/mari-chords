import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

// --- CONFIGURATION CONSTANTS ---
const DIAGRAM_WIDTH = 120;
const DIAGRAM_HEIGHT = 150;
const STRING_COUNT = 6;
const FRET_COUNT = 5;
const STRING_SPACING = (DIAGRAM_WIDTH - 20) / (STRING_COUNT - 1);
const FRET_SPACING = (DIAGRAM_HEIGHT - 50) / FRET_COUNT;
const DOT_RADIUS = 7;
const START_Y = 40; 
const START_X = 10;

const ChordDiagram = ({ chordName, chordData }) => {
  // Renders the vertical lines for the guitar strings
  const renderStrings = () => {
    return Array.from({ length: STRING_COUNT })?.map((_, i) => (
      <Line
        key={`string-${i}`}
        x1={START_X + i * STRING_SPACING}
        y1={START_Y}
        x2={START_X + i * STRING_SPACING}
        y2={START_Y + FRET_COUNT * FRET_SPACING}
        stroke="black"
        strokeWidth="1"
      />
    ));
  };
  // Renders the horizontal lines for the frets
  const renderFrets = () => {
    return Array.from({ length: FRET_COUNT + 1 })?.map((_, i) => (
      <Line
        key={`fret-${i}`}
        x1={START_X}
        y1={START_Y + i * FRET_SPACING}
        x2={START_X + (STRING_COUNT - 1) * STRING_SPACING}
        y2={START_Y + i * FRET_SPACING}
        stroke="black"
        strokeWidth={i === 0 ? "2" : "1"} // Thicker line for the nut
      />
    ));
  };
  // Renders the finger position dots, open string circles (O), and muted string crosses (X)
  const renderFingerings = () => {
    return chordData?.map((fret, stringIndex) => {
      // The strings are typically numbered 6 to 1 (EADGBe), but the array is 0-indexed.
      // We reverse the logic for display, so the thickest string (E) is on the left.
      const x = START_X + stringIndex * STRING_SPACING;

      // Case 1: Muted string (e.g., 'x' or null)
      if (fret === null || fret === 'x') {
        return (
          <SvgText
            key={`finger-${stringIndex}`}
            x={x}
            y={START_Y - 10}
            fontSize="16"
            fill="black"
            textAnchor="middle"
          >
            x
          </SvgText>
        );
      }

      // Case 2: Open string (fret is 0)
      if (fret === 0) {
        return (
          <SvgText
            key={`finger-${stringIndex}`}
            x={x}
            y={START_Y - 10}
            fontSize="16"
            fill="black"
            textAnchor="middle"
          >
            o
          </SvgText>
        );
      }

      // Case 3: Fretted note (fret is a number > 0)
      // The dot should be placed in the middle of the fret
      const y = START_Y + (fret * FRET_SPACING) - (FRET_SPACING / 2);
      return (
        <Circle
          key={`finger-${stringIndex}`}
          cx={x}
          cy={y}
          r={DOT_RADIUS}
          fill="black"
        />
      );
    }).filter(Boolean); // Filter out any undefined results
  };

  return (
    <View style={styles.container}>
      <Svg height={DIAGRAM_HEIGHT} width={DIAGRAM_WIDTH}>
        {/* Chord Name */}
        <SvgText
          x={DIAGRAM_WIDTH / 2}
          y="20"
          fontSize="20"
          fontWeight="bold"
          fill="black"
          textAnchor="middle"
        >
          {chordName}
        </SvgText>

        {/* Grid */}
        {renderFrets()}
        {renderStrings()}

        {/* Fingerings */}
        {renderFingerings()}
      </Svg>
    </View>
  );
};


const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  diagramsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    margin: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ChordDiagram;