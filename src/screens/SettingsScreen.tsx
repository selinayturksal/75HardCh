import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, Switch, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const CHALLENGES = [
  { id: 'sport', emoji: '🏋️', color: '#FF6B6B' },
  { id: 'book', emoji: '📚', color: '#A29BFE' },
  { id: 'nutrition', emoji: '🥗', color: '#55EFC4' },
  { id: 'academic', emoji: '🎓', color: '#FDCB6E' },
  { id: 'personal', emoji: '🧘', color: '#FD79A8' },
  { id: 'social', emoji: '🤝', color: '#74B9FF' },
];

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useLang();
  const { userData, updateChallenges, logout } = useAuth();
  const navigation = useNavigation();

  const [selected, setSelected] = useState<string[]>(userData?.challenges || []);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      Alert.alert('En az 1 challenge seçmelisin!');
      return;
    }
    setSaving(true);
    await updateChallenges(selected);
    setSaving(false);
    Alert.alert('✅ Kaydedildi!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>⚙️ {t.settings}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* TEMA */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🎨 {t.theme}</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>
              {isDark ? '🌙 ' + t.darkMode : '☀️ ' + t.lightMode}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#DFE6E9', true: '#2D3561' }}
              thumbColor={isDark ? theme.primary : '#fff'}
            />
          </View>
        </View>

        {/* DİL */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🌍 {t.language}</Text>
          <TouchableOpacity
            style={[styles.langBtn, { borderColor: theme.border }]}
            onPress={toggleLang}
          >
            <Text style={[styles.langBtnText, { color: theme.text }]}>
              {lang === 'tr' ? '🇹🇷 Türkçe → English' : '🇬🇧 English → Türkçe'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* CHALLENGE YÖNETİMİ */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🎯 Challenge Seçimi</Text>
          <Text style={[styles.sectionSub, { color: theme.textLight }]}>
            Eklemek veya çıkarmak istediğin challenge'ları seç
          </Text>
          <View style={styles.grid}>
            {CHALLENGES.map(ch => {
              const isSelected = selected.includes(ch.id);
              const label = t[ch.id as keyof typeof t] as string;
              return (
                <TouchableOpacity
                  key={ch.id}
                  style={[
                    styles.challengeBtn,
                    {
                      backgroundColor: isSelected ? ch.color : theme.background,
                      borderColor: ch.color,
                    },
                  ]}
                  onPress={() => toggle(ch.id)}
                >
                  <Text style={styles.challengeEmoji}>{ch.emoji}</Text>
                  <Text style={[styles.challengeLabel, { color: isSelected ? '#fff' : theme.text }]}>
                    {label}
                  </Text>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? '...' : '💾 Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ÇIKIŞ */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: '#FF6B6B' }]}
          onPress={logout}
        >
          <Text style={[styles.logoutText, { color: '#FF6B6B' }]}>
            🚪 {t.logout}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { fontSize: 24, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },
  section: {
    borderRadius: 20,
    padding: 16,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  sectionSub: { fontSize: 13, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: { fontSize: 15 },
  langBtn: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  langBtnText: { fontSize: 15, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  challengeBtn: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    position: 'relative',
  },
  challengeEmoji: { fontSize: 24, marginBottom: 4 },
  challengeLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  checkMark: {
    position: 'absolute',
    top: 4,
    right: 6,
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
  saveBtn: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  logoutBtn: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: { fontSize: 16, fontWeight: '700' },
});