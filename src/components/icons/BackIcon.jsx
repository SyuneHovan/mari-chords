import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BackIcon = ({ color = "#FEF1DE", size = 30 }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 131 260" fill="none" stroke={color} style={{zIndex: 13}}>
      <Path d="M130 258.5L1.5 130L130 1.5" strokeWidth="10" strokeLinecap="round"/>
    </Svg>
);

export default BackIcon;