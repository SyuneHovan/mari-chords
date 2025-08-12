/** @format */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

const DoneIcon = ({ size = 40, color }) => (
	<Svg xmlns="http://www.w3.org/2000/svg" width={size} rotation={270} height={size} viewBox="0 50 131 260" fill="none" stroke={color} style={{zIndex: 13}}>
		<Path d="M130 258.5L1.5 130L130 1.5" strokeWidth="10" stroke-linecap="round"/>
	</Svg>
);

export default DoneIcon;
