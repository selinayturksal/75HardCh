import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'ChallengeSelect'>;

const CHALLENGES = [
  { id: 'sport', emoji: '🏋️', color: '#FF6B6B' },
  { id: 'book', emoji: '📚', color: '#A29BFE' },
  { id: 'nutrition', emoji: '🥗', color: '#55EFC4' },
  { id: 'academic', emoji: '🎓', color: '#FDCB6E' },
  { id: 'personal', emoji: '🧘', color: '#FD79A8' },
  { id: 'social', emoji: '🤝', color: '#74B9FF' },
];

export default function ChallengeSelectScreen() {
  const { theme } = useTheme();
  const { t, lang } = useLang();
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    navigation.replace('PressToEnter', { challenges: selected });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t.chooseChallenge}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textLight }]}>
          {lang === 'tr'
            ? 'Birden fazla seçebilirsin'
            : 'You can select multiple'}
        </Text>

        <View style={styles.grid}>
          {CHALLENGES.map(ch => {
            const isSelected = selected.includes(ch.id);
            const label = t[ch.id as keyof typeof t] as string;
            return (
              <TouchableOpacity
                key={ch.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isSelected ? ch.color : theme.card,
                    borderColor: ch.color,
                    borderWidth: 2,
                    shadowColor: ch.color,
                  },
                ]}
                onPress={() => toggle(ch.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.emoji}>{ch.emoji}</Text>
                <Text style={[
                  styles.cardText,
                  { color: isSelected ? '#fff' : theme.text }
                ]}>
                  {label}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.continueBtn,
            {
              backgroundColor: selected.length > 0 ? theme.primary : theme.border,
            },
          ]}
          onPress={handleContinue}
          disabled={selected.length === 0}
        >
          <Text style={styles.continueBtnText}>{t.continueBtn} →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 40,
  },
  card: {
    width: 150,
    height: 150,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  continueBtn: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});