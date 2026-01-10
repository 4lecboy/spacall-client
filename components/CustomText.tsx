import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}

export default function CustomText({ 
  children, 
  variant = 'body', 
  color = COLORS.secondary, 
  style, 
  numberOfLines 
}: Props) {
  return (
    <Text 
      numberOfLines={numberOfLines}
      style={[styles[variant], { color }, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: FONTS.heading, fontSize: SIZES.h1 },
  h2: { fontFamily: FONTS.heading, fontSize: SIZES.h2 },
  h3: { fontFamily: FONTS.bodyBold, fontSize: SIZES.h3 },
  body: { fontFamily: FONTS.body, fontSize: SIZES.body },
  caption: { fontFamily: FONTS.body, fontSize: SIZES.small, color: COLORS.muted },
});