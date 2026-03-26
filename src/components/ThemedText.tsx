import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ThemedText = ({ style, ...props }: TextProps) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[{ color: theme.text, fontSize: 16 }, style]}
      {...props}
    />
  );
};