// src/components/icons/AddIcon.jsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const AddIcon = ({ size = 50, color = "#fff" }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 337 334">
      <Path
        d="M169 0V333.5M0.5 167.5H337"
        stroke={color}
        strokeWidth="5" // Note: "stroke-width" becomes "strokeWidth" (camelCase)
      />
    </Svg>
  );
};

export default AddIcon;