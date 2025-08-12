import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { colors } from '../../theme';

const SearchIcon = ({ size = 20, color = "cream" }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path xmlns="http://www.w3.org/2000/svg" d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke={colors[color]} strokeWidth="2"/>
    </Svg>
  );
};

export default SearchIcon;