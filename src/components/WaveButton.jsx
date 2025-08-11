/** @format */

// src/components/WaveButton.jsx
import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

const WaveButton = ({
	onPress,
	icon,
	pos = 'bottom right',
	color = 'charcoal',
	top = false,
}) => {
	const styles = StyleSheet.create({
		container: {
			position: 'absolute',
			width: '60%',
			height: 150,
			zIndex: top ? 50 : 10,
		},
		iconContainer: {
			position: 'absolute',
			width: 100,
			height: 100,
		},
	});

	const positionStyle = {};
	const iconPositionStyle = {};
	const transformStyle = [];

	const [vertical, horizontal] = pos.split(' ');

	// Set the position (top/bottom, left/right)
	if (vertical === 'top') {
		positionStyle.top = -10;
		iconPositionStyle.top = 65;
	}
	if (vertical === 'bottom') {
		positionStyle.bottom = -10;
		iconPositionStyle.bottom = 10;
	}
	if (horizontal === 'left') {
		positionStyle.left = -10;
		iconPositionStyle.left = 30;
	}
	if (horizontal === 'right') {
		positionStyle.right = -10;
		iconPositionStyle.top = 65;
		iconPositionStyle.right = -20;
	}

	// Set the SVG transform to flip the wave
	if (pos === 'top left') {
		transformStyle.push({ rotateX: '180deg' });
	} else if (pos === 'top right') {
		transformStyle.push({ rotateX: '180deg' });
		transformStyle.push({ rotateY: '180deg' });
	} else if (pos === 'bottom right') {
		transformStyle.push({ rotateY: '180deg' });
	}
	// 'bottom left' has no transform needed

	return (
		<TouchableOpacity
			onPress={onPress}
			style={[styles.container, positionStyle]}>
			<Svg
				style={{ transform: transformStyle }}
				viewBox='55 0 566 373'>
				<Path
					d='M0 0.999996C73.6667 -1 213 6.49998 338 135C421 218 473 306.5 568 372.5H0V0.999996Z'
					fill={colors[color]}
				/>
			</Svg>
			<View style={[styles.iconContainer, iconPositionStyle]}>{icon}</View>
		</TouchableOpacity>
	);
};

export default WaveButton;
