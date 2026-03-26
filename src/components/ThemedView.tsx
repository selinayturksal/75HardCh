import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ThemedView = ({ style, ...props }: ViewProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[{ backgroundColor: theme.background, flex: 1 }, style]}
      {...props}
    />
  );
};