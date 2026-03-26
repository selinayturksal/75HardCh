import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated,
  PanResponder, SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StarParticle } from '../components/StarParticle';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'PressToEnter'>;
type Route = RouteProp<RootStackParamList, 'PressToEnter'>;

const COLORS = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#A29BFE', '#FD79A8', '#74B9FF', '#55EFC4'];

interface Star {
  id: number;
  x: number;
  y: number;
  color: string;
}

export default function PressToEnterScreen() {
  const { theme } = useTheme();
  const { t } = useLang();
  const { updateChallenges, userData } = useAuth();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const [stars, setStars] = useState<Star[]>([]);
  const [pressing, setPressing] = useState(false);
  const bgAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const completedRef = useRef(false);
  const starIdRef = useRef(0);
  const touchRef = useRef({ x: 0, y: 0 });

  // Navigate once updateChallenges has flushed into userData
  useEffect(() => {
    if (completedRef.current && (userData?.challenges?.length ?? 0) > 0) {
      navigation.replace('Home');
    }
  }, [userData?.challenges]);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [
      theme.background,
      '#FF6B6B',
      '#A29BFE',
      '#4ECDC4',
      '#FFE66D',
      theme.secondary,
    ],
  });

  const addStar = (x: number, y: number) => {
    const id = starIdRef.current++;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    setStars(prev => [...prev, { id, x, y, color }]);
  };

  const removeStar = (id: number) => {
    setStars(prev => prev.filter(s => s.id !== id));
  };

  const handlePressIn = (x: number, y: number) => {
    touchRef.current = { x, y };
    setPressing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    progressAnimation.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    });
    progressAnimation.current.start(({ finished }) => {
      if (finished) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const challenges = route.params?.challenges;
        // Fade to black, then navigate
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start(async () => {
          if (challenges?.length) {
            completedRef.current = true;
            await updateChallenges(challenges);
            // navigation triggered by useEffect once userData updates
          } else {
            navigation.replace('Home');
          }
        });
      }
    });

    Animated.timing(bgAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      if (!pressing) {
        clearInterval(interval);
        return;
      }
      addStar(
        touchRef.current.x + (Math.random() - 0.5) * 60,
        touchRef.current.y + (Math.random() - 0.5) * 60,
      );
    }, 150);

    (handlePressIn as any)._interval = interval;
  };

  const handlePressOut = () => {
    setPressing(false);
    clearInterval((handlePressIn as any)._interval);
    progressAnimation.current?.stop();
    Animated.timing(progressAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        handlePressIn(locationX, locationY);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        touchRef.current = { x: locationX, y: locationY };
      },
      onPanResponderRelease: handlePressOut,
      onPanResponderTerminate: handlePressOut,
    })
  ).current;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]} {...panResponder.panHandlers}>
      <SafeAreaView style={styles.inner}>
      {/* Fade-to-black overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000', opacity: fadeAnim }]}
        pointerEvents="none"
      />
        {stars.map(star => (
          <StarParticle
            key={star.id}
            x={star.x}
            y={star.y}
            color={star.color}
            onDone={() => removeStar(star.id)}
          />
        ))}

        <View style={styles.content}>
          <Text style={[styles.emoji]}>✨</Text>
          <Text style={[styles.title, { color: pressing ? '#fff' : theme.text }]}>
            {t.holdToEnter}
          </Text>
          <Text style={[styles.subtitle, { color: pressing ? 'rgba(255,255,255,0.8)' : theme.textLight }]}>
            {pressing ? '🔥 Harika gidiyorsun!' : '👇 Parmağını basılı tut'}
          </Text>

          <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth, backgroundColor: pressing ? '#fff' : theme.primary },
              ]}
            />
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  progressBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
