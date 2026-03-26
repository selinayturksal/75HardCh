import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, TextInput, Alert, Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { useProgress } from '../hooks/useProgress';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Haptics from 'expo-haptics';

type Route = RouteProp<RootStackParamList, 'CustomChallenge'>;

export default function CustomChallengeScreen() {
  const { theme } = useTheme();
  const { t, lang } = useLang();
  const navigation = useNavigation();
  const route = useRoute<Route>();

  const { id, name, emoji, color } = route.params;
  const { completedDays, todayDone, markToday, getDayCount, getProgressPercent } = useProgress(id);

  const [note, setNote] = useState('');
  const [successModal, setSuccessModal] = useState(false);

  const dayCount = getDayCount();
  const percent = getProgressPercent();

  const handleSave = async () => {
    await markToday({ note });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNote('');
    setSuccessModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{emoji} {name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* PROGRESS */}
        <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>
              {dayCount} / 75 {t.days}
            </Text>
            <Text style={[styles.progressPercent, { color }]}>
              %{Math.round(percent)}
            </Text>
          </View>

          <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
          </View>

          <View style={styles.dotGrid}>
            {Array.from({ length: 75 }, (_, i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: i < dayCount ? color : color + '25' }]}
              />
            ))}
          </View>

          <Text style={[styles.gridLabel, { color: theme.textLight }]}>
            {emoji} 75 {t.days}
          </Text>
        </View>

        {/* TODAY */}
        {!todayDone ? (
          <View style={[styles.formCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {emoji} {lang === 'tr' ? 'Bugünün Kaydı' : "Today's Log"}
            </Text>
            <Text style={[styles.label, { color: theme.textLight }]}>
              {t.notes}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder={lang === 'tr' ? 'Bugün ne yaptın? (isteğe bağlı)' : "What did you do today? (optional)"}
              placeholderTextColor={theme.textLight}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: color }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>✓ {t.markDone}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.doneCard, { backgroundColor: color + '22' }]}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={[styles.doneTitle, { color }]}>{t.completed}!</Text>
            <Text style={[styles.doneSub, { color: theme.textLight }]}>
              {t.streak}: {dayCount} 🔥
            </Text>
          </View>
        )}
      </ScrollView>

      {/* SUCCESS MODAL */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={styles.modalEmoji}>🏆</Text>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {lang === 'tr' ? `Harika! Gün ${dayCount} tamamlandı!` : `Amazing! Day ${dayCount} done!`}
            </Text>
            <Text style={[styles.modalSub, { color: theme.textLight }]}>
              {75 - dayCount} {lang === 'tr' ? 'gün daha kaldı 💪' : 'days to go 💪'}
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: color }]}
              onPress={() => setSuccessModal(false)}
            >
              <Text style={styles.modalBtnText}>{lang === 'tr' ? 'Devam Et 🔥' : 'Keep Going 🔥'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16, paddingTop: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 40 },
  progressCard: {
    borderRadius: 20, padding: 16, marginBottom: 16,
    shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { fontSize: 16, fontWeight: '700' },
  progressPercent: { fontSize: 16, fontWeight: '800' },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  progressFill: { height: '100%', borderRadius: 4 },
  dotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 8 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  gridLabel: { textAlign: 'center', fontSize: 13, marginTop: 4 },
  formCard: {
    borderRadius: 20, padding: 16,
    shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3,
  },
  formTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  input: {
    borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15,
    marginBottom: 4, textAlignVertical: 'top', minHeight: 80,
  },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  doneCard: { borderRadius: 20, padding: 32, alignItems: 'center' },
  doneEmoji: { fontSize: 60, marginBottom: 12 },
  doneTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  doneSub: { fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: { borderRadius: 24, padding: 32, alignItems: 'center', width: '100%' },
  modalEmoji: { fontSize: 60, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  modalSub: { fontSize: 15, marginBottom: 24 },
  modalBtn: { borderRadius: 14, padding: 14, paddingHorizontal: 32 },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
