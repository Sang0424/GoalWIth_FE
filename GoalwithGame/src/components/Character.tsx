import React from 'react';
import { Svg, Ellipse, Path, Polygon } from 'react-native-svg';

interface MascotCharacterProps {
  size?: number;
  primaryColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  level?: number;
}

const Character: React.FC<MascotCharacterProps> = ({
  size = 100,
  primaryColor = '#000000',
  backgroundColor = '#FFFFFF',
  strokeWidth = 3,
}) => {
  // 비율 계산 (기본 100x120 비율)
  const width = size;
  const height = size * 1.2;
  const scale = size / 100;

  return (
    <Svg width={width} height={height} viewBox="0 0 100 120">
      {/* 머리 (가로로 긴 타원) */}
      <Ellipse
        cx="50"
        cy="25"
        rx="30"
        ry="20"
        fill={backgroundColor}
        stroke={primaryColor}
        strokeWidth={strokeWidth}
      />
      
      {/* 머리 위 깃발 */}
      <Polygon
        points="50,5 60,15 50,12"
        fill={backgroundColor}
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      
      {/* 깃발 막대 */}
      <Path
        d="M50,5 L50,15"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* 왼쪽 눈 */}
      <Ellipse
        cx="42"
        cy="22"
        rx="3"
        ry="4"
        fill={primaryColor}
      />
      
      {/* 오른쪽 눈 */}
      <Ellipse
        cx="58"
        cy="22"
        rx="3"
        ry="4"
        fill={primaryColor}
      />
      
      {/* 입 (작은 미소) */}
      <Path
        d="M45,30 Q50,33 55,30"
        stroke={primaryColor}
        strokeWidth={strokeWidth - 1}
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 몸체 (세로 타원) */}
      <Ellipse
        cx="50"
        cy="65"
        rx="20"
        ry="25"
        fill={backgroundColor}
        stroke={primaryColor}
        strokeWidth={strokeWidth}
      />
      
      {/* 왼쪽 팔 */}
      <Path
        d="M30,55 Q25,65 30,75"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 오른쪽 팔 */}
      <Path
        d="M70,55 Q75,65 70,75"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 왼쪽 발 */}
      <Ellipse
        cx="42"
        cy="105"
        rx="8"
        ry="4"
        fill={backgroundColor}
        stroke={primaryColor}
        strokeWidth={strokeWidth}
      />
      
      {/* 오른쪽 발 */}
      <Ellipse
        cx="58"
        cy="105"
        rx="8"
        ry="4"
        fill={backgroundColor}
        stroke={primaryColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default Character;