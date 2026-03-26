import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface StarProps {
  x: number;
  y: number;
  color: string;
  onDone: () => void;
}

export const StarParticle = ({ x, y, color, onDone }: StarProps) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dx = (Math.random() - 0.5) * 80;
    const dy = -(Math.random() * 80 + 20);

    Animated.parallel([
      Animated.timing(scale, {
        toValue: Math.random() * 1.5 + 0.5,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: dx,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: dy,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.Text
      style={[
        styles.star,
        {
          left: x - 10,
          top: y - 10,
          color,
          opacity,
          transform: [{ scale }, { translateX }, { translateY }],
        },
      ]}
    >
      ✦
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 999,
  },
});