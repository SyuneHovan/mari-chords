/** @format */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

const EditIcon = ({ size = 40, color }) => (
	<Svg
		width={size}
		height={size}
		fill={'none'}
		viewBox='0 0 24 24'
		style={{ zIndex: 50 }}>
		<Path
			d='M12 20H20.5M18 10L21 7L17 3L14 6M18 10L8 20H4V16L14 6M18 10L14 6'
			stroke={color}
			strokeWidth='.8'
		/>
	</Svg>
);

export default EditIcon;
