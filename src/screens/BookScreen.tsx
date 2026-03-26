import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, TextInput, Alert, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { useProgress } from '../hooks/useProgress';
import * as Haptics from 'expo-haptics';

const COLOR = '#A29BFE';

export default function BookScreen() {
  const { theme } = useTheme();
  const { t } = useLang();
  const navigation = useNavigation();
  const { completedDays, todayDone, markToday, getDayCount, getProgressPercent } = useProgress('book');

  const [bookName, setBookName] = useState('');
  const [pages, setPages] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const dayCount = getDayCount();
  const percent = getProgressPercent();

  const handleSave = async () => {
    if (!bookName || !pagesRead) {
      Alert.alert(t.fillAll);
      return;
    }
    await markToday({ bookName, pages, pagesRead });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: COLOR }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📚 {t.book}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* PROGRESS */}
        <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>
              {dayCount} / 75 {t.days}
            </Text>
            <Text style={[styles.progressPercent, { color: COLOR }]}>
              %{Math.round(percent)}
            </Text>
          </View>

          <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: COLOR }]} />
          </View>

          {/* BOOK SHAPE - pages filling up */}
          <View style={styles.bookContainer}>
            <View style={[styles.bookSpine, { backgroundColor: COLOR }]} />
            <View style={[styles.bookPages, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.bookFill,
                  { height: `${percent}%`, backgroundColor: COLOR + 'AA' },
                ]}
              />
              <Text style={[styles.bookDayText, { color: COLOR }]}>
                {dayCount}
              </Text>
            </View>
          </View>

          {/* DOT GRID */}
          <View style={styles.dotGrid}>
            {Array.from({ length: 75 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i < dayCount ? COLOR : COLOR + '25' },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.shapeLabel, { color: theme.textLight }]}>
            📖 75 {t.days}
          </Text>
        </View>

        {/* TODAY FORM */}
        {!todayDone ? (
          <View style={[styles.formCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              📖 {t.todayTask}
            </Text>

            <Text style={[styles.label, { color: theme.textLight }]}>{t.bookName}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="Örn: Atomic Habits"
              placeholderTextColor={theme.textLight}
              value={bookName}
              onChangeText={setBookName}
            />

            <Text style={[styles.label, { color: theme.textLight }]}>{t.pages}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="320"
              placeholderTextColor={theme.textLight}
              value={pages}
              onChangeText={setPages}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.textLight }]}>{t.pagesRead}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="25"
              placeholderTextColor={theme.textLight}
              value={pagesRead}
              onChangeText={setPagesRead}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: COLOR }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>✓ {t.markDone}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.doneCard, { backgroundColor: COLOR + '22' }]}>
            <Text style={styles.doneEmoji}>📚</Text>
            <Text style={[styles.doneTitle, { color: COLOR }]}>{t.completed}!</Text>
            <Text style={[styles.doneSubtitle, { color: theme.textLight }]}>
              {t.streak}: {dayCount} 🔥
            </Text>
          </View>
        )}
      </ScrollView>

      {/* SUCCESS MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={styles.modalEmoji}>📚</Text>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Harika! Gün {dayCount} tamamlandı!
            </Text>
            <Text style={[styles.modalSub, { color: theme.textLight }]}>
              {75 - dayCount} gün daha kaldı 📖
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: COLOR }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Devam Et 🔥</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 40 },
  progressCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitle: { fontSize: 16, fontWeight: '700' },
  progressPercent: { fontSize: 16, fontWeight: '800' },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  progressFill: { height: '100%', borderRadius: 4 },
  bookContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginVertical: 16,
    height: 120,
  },
  bookSpine: {
    width: 16,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  bookPages: {
    width: 90,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bookFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bookDayText: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  dotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    marginBottom: 8,
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  shapeLabel: { textAlign: 'center', fontSize: 13, marginTop: 4 },
  formCard: {
    borderRadius: 20,
    padding: 16,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 4,
  },
  saveBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  doneCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  doneEmoji: { fontSize: 60, marginBottom: 12 },
  doneTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  doneSubtitle: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  modalEmoji: { fontSize: 60, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  modalSub: { fontSize: 15, marginBottom: 24 },
  modalBtn: { borderRadius: 14, padding: 14, paddingHorizontal: 32 },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});