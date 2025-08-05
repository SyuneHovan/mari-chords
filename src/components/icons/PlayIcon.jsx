import React from 'react';
import Svg, { Path } from 'react-native-svg';

const PlayIcon = ({ size = 40, color = "#242424" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M8 5v14l11-7z" fill={color} />
    </Svg>
);

export default PlayIcon;