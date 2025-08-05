// src/components/WaveIcon.jsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const WaveIcon = ({ onPress, icon, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <Svg style={styles.wave} viewBox="0 0 566 373">
        <Path 
          d="M0 0.999996C73.6667 -1 213 6.49998 338 135C421 218 473 306.5 568 372.5H0V0.999996Z" 
          fill="#242424" // charcoal color
        />
      </Svg>
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    height: 150,
    position: 'absolute',
    zIndex: 10,
  },
  wave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default WaveIcon;