import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Switch, Image, Modal, Alert, Animated,
  TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { useAuth, CustomChallenge } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProgress } from '../hooks/useProgress';

type Nav = StackNavigationProp<RootStackParamList, 'Home'>;

// ── Constants ────────────────────────────────────────────────
const BUILTIN = [
  { id: 'sport',    emoji: '🏋️', color: '#FF6B6B', screen: 'Sport' },
  { id: 'book',     emoji: '📚', color: '#A29BFE', screen: 'Book' },
  { id: 'nutrition',emoji: '🥗', color: '#55EFC4', screen: 'Nutrition' },
  { id: 'academic', emoji: '🎓', color: '#FDCB6E', screen: 'Academic' },
  { id: 'personal', emoji: '🧘', color: '#FD79A8', screen: 'PersonalTime' },
  { id: 'social',   emoji: '🤝', color: '#74B9FF', screen: 'Social' },
];

const CUSTOM_COLORS = ['#FF6B6B','#A29BFE','#55EFC4','#FDCB6E','#FD79A8','#74B9FF','#FF9F43','#1DD1A1','#48DBFB'];
const CUSTOM_EMOJIS  = ['⭐','🔥','💎','🎯','🚀','🎨','🎵','📖','🧠','💪','🌟','🏆','✨','🌈','🎪'];

const FAB_SIZE   = 60;
const ITEM_SIZE  = 46;
const FAB_BOTTOM = 32;
const FAB_LEFT   = 24;
const FAB_CY     = FAB_BOTTOM + FAB_SIZE / 2; // 62 (from screen bottom)
const MAX_ITEMS  = 12;

type SettingsSection = 'general' | 'language' | 'account';
type AccountView = 'main' | 'username' | 'email' | 'password';

// ── Sub-components ────────────────────────────────────────────
function ChallengeProgressRow({ id, emoji, color, label }: {
  id: string; emoji: string; color: string; label: string;
}) {
  const { theme } = useTheme();
  const { getDayCount, getProgressPercent } = useProgress(id);
  const day = getDayCount();
  const pct = getProgressPercent();

  return (
    <View style={styles.progressRow}>
      <Text style={styles.progressEmoji}>{emoji}</Text>
      <View style={styles.progressBarWrap}>
        <Text style={[styles.progressLabel, { color: theme.textLight }]} numberOfLines={1}>{label}</Text>
        <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
      </View>
      <Text style={[styles.progressPct, { color }]}>%{Math.round(pct)}</Text>
      <Text style={[styles.progressDay, { color: theme.textLight }]}>{day}/75</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────
export default function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useLang();
  const { user, userData, logout, updateChallenges, addCustomChallenge,
          changeUsername, changeEmail, changePassword } = useAuth();
  const navigation = useNavigation<Nav>();

  // FAB fan
  const [fanOpen, setFanOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(Array.from({ length: MAX_ITEMS }, () => new Animated.Value(0))).current;

  // Add challenge modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Custom challenge modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName]   = useState('');
  const [customEmoji, setCustomEmoji] = useState('⭐');
  const [customColor, setCustomColor] = useState(CUSTOM_COLORS[0]);
  const [savingCustom, setSavingCustom] = useState(false);

  // Settings dropdown
  const [showSettings, setShowSettings]     = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('general');
  const [accountView, setAccountView]         = useState<AccountView>('main');
  const dropdownAnim = useRef(new Animated.Value(-420)).current;

  // Account form states
  const [newUsername, setNewUsername]     = useState('');
  const [newEmail, setNewEmail]           = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [curPassword, setCurPassword]     = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPass, setConfirmPass]     = useState('');
  const [accountBusy, setAccountBusy]     = useState(false);

  // ── Derived data ─────────────────────────────────────────
  const customChallenges: CustomChallenge[] = userData?.customChallenges || [];

  const allConfig = [
    ...BUILTIN,
    ...customChallenges.map(c => ({
      id: c.id, emoji: c.emoji, color: c.color, screen: 'CustomChallenge' as const,
      name: c.name,
    })),
  ];

  const userChallenges = allConfig.filter(c => userData?.challenges?.includes(c.id));
  const unselected     = BUILTIN.filter(b => !userData?.challenges?.includes(b.id));

  // Fan items: user challenges + "+" (custom creation is inside the add sheet)
  const fanItems = [
    ...userChallenges,
    { id: '_add', emoji: '➕', color: theme.primary, screen: '_add' },
  ];

  // ── Greeting ──────────────────────────────────────────────
  const getGreeting = () => {
    const h    = new Date().getHours();
    const name = user?.displayName || 'User';
    if (h >= 5 && h < 12)
      return {
        timeEmoji: '☀️',
        line1: lang === 'tr' ? `Günaydın, ${name}!` : `Good morning, ${name}!`,
        line2: lang === 'tr'
          ? 'Bugün harika geçsin, enerjin zirveye çıksın! 🌟'
          : 'Have an amazing day, energy to the max! 🌟',
      };
    if (h >= 12 && h < 17)
      return {
        timeEmoji: '🌤️',
        line1: lang === 'tr' ? `İyi günler, ${name}!` : `Good afternoon, ${name}!`,
        line2: lang === 'tr'
          ? 'Gün ortasında enerjin hep yüksek olsun! ⚡'
          : 'Keep that midday energy high! ⚡',
      };
    return {
      timeEmoji: '🌙',
      line1: lang === 'tr' ? `İyi akşamlar, ${name}!` : `Good evening, ${name}!`,
      line2: lang === 'tr'
        ? 'Bugünü de pes etmeden tamamladığın için tebrikler! 🏆'
        : "Congrats for pushing through another day! 🏆",
    };
  };

  const greeting = getGreeting();

  // ── Fan helpers ────────────────────────────────────────────
  // Vertical column going straight up from the FAB, evenly spaced.
  // Item i is always at a fixed offset above the FAB regardless of total count,
  // so adding/removing items never shifts existing ones.
  const GAP         = 14;
  const FIRST_BOTTOM = FAB_BOTTOM + FAB_SIZE + GAP;   // 32 + 60 + 14 = 106
  const STEP        = ITEM_SIZE + GAP;                // 46 + 14 = 60
  const ITEM_LEFT   = FAB_LEFT + (FAB_SIZE - ITEM_SIZE) / 2; // centred with FAB = 31

  const getFanItem = (i: number) => {
    const bottomPos = FIRST_BOTTOM + i * STEP;
    // startTY: how far down the item must translate to appear at FAB centre.
    // Derived from: item_centre_from_bottom - FAB_CY = (bottomPos + ITEM_SIZE/2) - FAB_CY
    const startTY = bottomPos + ITEM_SIZE / 2 - FAB_CY;   // positive → item starts below final pos
    return {
      pos: { left: ITEM_LEFT, bottom: bottomPos },
      startTX: 0,
      startTY,
    };
  };

  const openFan = () => {
    setFanOpen(true);
    Animated.parallel([
      Animated.spring(fabAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      Animated.stagger(45,
        itemAnims.slice(0, fanItems.length).map(a =>
          Animated.spring(a, { toValue: 1, tension: 130, friction: 8, useNativeDriver: true })
        )
      ),
    ]).start();
  };

  const closeFan = (cb?: () => void) => {
    Animated.parallel([
      Animated.spring(fabAnim, { toValue: 0, tension: 100, friction: 8, useNativeDriver: true }),
      ...itemAnims.map(a =>
        Animated.spring(a, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true })
      ),
    ]).start(() => {
      setFanOpen(false);
      cb?.();
    });
  };

  const handleFanItemPress = (item: typeof fanItems[0]) => {
    if (item.id === '_add') {
      closeFan(() => setShowAddModal(true));
    } else if (item.id === '_custom') {
      closeFan(() => setShowCustomModal(true));
    } else {
      closeFan(() => {
        if (item.screen === 'CustomChallenge') {
          const custom = customChallenges.find(c => c.id === item.id);
          if (custom) {
            navigation.navigate('CustomChallenge', {
              id: custom.id, name: custom.name, emoji: custom.emoji, color: custom.color,
            });
          }
        } else {
          navigation.navigate(item.screen as any);
        }
      });
    }
  };

  // ── Settings helpers ───────────────────────────────────────
  const openSettings = () => {
    setSettingsSection('general');
    setAccountView('main');
    setShowSettings(true);
    Animated.spring(dropdownAnim, { toValue: 0, tension: 90, friction: 10, useNativeDriver: true }).start();
  };

  const closeSettings = () => {
    Animated.timing(dropdownAnim, { toValue: -420, duration: 220, useNativeDriver: true })
      .start(() => setShowSettings(false));
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) return;
    setAccountBusy(true);
    try {
      await changeUsername(newUsername.trim());
      Alert.alert('✅', lang === 'tr' ? 'Kullanıcı adı güncellendi!' : 'Username updated!');
      setNewUsername('');
      setAccountView('main');
    } catch (e: any) {
      Alert.alert('Hata', e.message === 'USERNAME_TAKEN'
        ? (lang === 'tr' ? 'Bu kullanıcı adı zaten kullanılıyor.' : 'This username is already taken.')
        : (lang === 'tr' ? 'Bir hata oluştu.' : 'An error occurred.')
      );
    } finally {
      setAccountBusy(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !emailPassword) return;
    setAccountBusy(true);
    try {
      await changeEmail(newEmail.trim(), emailPassword);
      Alert.alert('✅', lang === 'tr' ? 'E-posta güncellendi!' : 'Email updated!');
      setNewEmail(''); setEmailPassword('');
      setAccountView('main');
    } catch {
      Alert.alert('Hata', lang === 'tr' ? 'Şifre yanlış veya e-posta geçersiz.' : 'Wrong password or invalid email.');
    } finally {
      setAccountBusy(false);
    }
  };

  const handleChangePassword = async () => {
    if (!curPassword || !newPassword || !confirmPass) {
      Alert.alert('', lang === 'tr' ? 'Tüm alanları doldurun.' : 'Fill in all fields.');
      return;
    }
    if (newPassword !== confirmPass) {
      Alert.alert('', lang === 'tr' ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.');
      return;
    }
    setAccountBusy(true);
    try {
      await changePassword(curPassword, newPassword);
      Alert.alert('✅', lang === 'tr' ? 'Şifre değiştirildi. E-postanıza bildirim gönderildi.' : 'Password changed. Notification sent to your email.');
      setCurPassword(''); setNewPassword(''); setConfirmPass('');
      setAccountView('main');
    } catch (e: any) {
      const map: Record<string, string> = {
        PASSWORD_TOO_SHORT: lang === 'tr' ? 'En az 8 karakter gerekli.' : 'Minimum 8 characters required.',
        PASSWORD_NO_UPPERCASE: lang === 'tr' ? 'Büyük harf içermeli.' : 'Must contain uppercase letter.',
        PASSWORD_NO_LOWERCASE: lang === 'tr' ? 'Küçük harf içermeli.' : 'Must contain lowercase letter.',
        PASSWORD_NO_NUMBER: lang === 'tr' ? 'Rakam içermeli.' : 'Must contain a number.',
      };
      Alert.alert('Hata', map[e.message] || (lang === 'tr' ? 'Mevcut şifre yanlış.' : 'Wrong current password.'));
    } finally {
      setAccountBusy(false);
    }
  };

  const handleSaveCustom = async () => {
    if (!customName.trim()) {
      Alert.alert('', lang === 'tr' ? 'Challenge adı girin.' : 'Enter challenge name.');
      return;
    }
    setSavingCustom(true);
    try {
      const id = `custom_${Date.now()}`;
      await addCustomChallenge({ id, name: customName.trim(), emoji: customEmoji, color: customColor });
      setCustomName(''); setCustomEmoji('⭐'); setCustomColor(CUSTOM_COLORS[0]);
      setShowCustomModal(false);
    } catch {
      Alert.alert('Hata', lang === 'tr' ? 'Kaydedilemedi.' : 'Could not save.');
    } finally {
      setSavingCustom(false);
    }
  };

  const handleAddChallenge = async (id: string) => {
    const newList = [...(userData?.challenges || []), id];
    await updateChallenges(newList);
    setShowAddModal(false);
  };

  const handleRemoveChallenge = async (id: string) => {
    const newList = (userData?.challenges || []).filter((c: string) => c !== id);
    await updateChallenges(newList);
  };

  const TOP_INSET = Platform.OS === 'ios' ? 44 : 24;

  const SETTINGS: { key: SettingsSection; emoji: string; label: string }[] = [
    { key: 'general',  emoji: '🎨', label: lang === 'tr' ? 'Genel'  : 'General'  },
    { key: 'language', emoji: '🌍', label: lang === 'tr' ? 'Dil'    : 'Language' },
    { key: 'account',  emoji: '👤', label: lang === 'tr' ? 'Hesap'  : 'Account'  },
  ];

  // ── Render ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      {/* ── TOP BAR ── */}
      <View style={[styles.topBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.topLeft}>
          <Text style={[styles.helloText, { color: theme.textLight }]}>{t.hello},</Text>
          <Text style={[styles.usernameText, { color: theme.text }]} numberOfLines={1}>
            {user?.displayName || 'User'}
          </Text>
        </View>
        <View style={styles.topCenter}>
          <Image source={require('../../assets/logo.png')} style={styles.topLogo} resizeMode="contain" />
          <Text style={[styles.appName, { color: theme.primary }]}>75 Hard</Text>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity onPress={openSettings} style={styles.settingsBtn}>
            <Text style={{ fontSize: 22 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── MAIN CONTENT ── */}
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 120 }]}>

        {/* Greeting card */}
        <View style={[styles.greetCard, { backgroundColor: theme.card }]}>
          <Text style={styles.greetEmoji}>{greeting.timeEmoji}</Text>
          <Text style={[styles.greetLine1, { color: theme.text }]}>{greeting.line1}</Text>
          <Text style={[styles.greetLine2, { color: theme.textLight }]}>{greeting.line2}</Text>
        </View>

        {/* Progress section */}
        {userChallenges.length > 0 ? (
          <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.progressCardTitle, { color: theme.text }]}>
              📊 {lang === 'tr' ? 'İlerlemelerin' : 'Your Progress'}
            </Text>
            {userChallenges.map(ch => (
              <ChallengeProgressRow
                key={ch.id}
                id={ch.id}
                emoji={ch.emoji}
                color={ch.color}
                label={(t as any)[ch.id] || (ch as any).name || ch.id}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {lang === 'tr' ? 'Henüz challenge yok!' : 'No challenges yet!'}
            </Text>
            <Text style={[styles.emptySub, { color: theme.textLight }]}>
              {lang === 'tr'
                ? 'Sol alttaki butona basarak bir challenge ekle ve yolculuğuna başla 💪'
                : 'Tap the button at the bottom-left to add a challenge and start your journey 💪'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── FAB + FAN (overlay) ── */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">

        {/* Backdrop when fan open */}
        {fanOpen && (
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, styles.fanBackdrop]}
            onPress={() => closeFan()}
            activeOpacity={1}
          />
        )}

        {/* Fan items */}
        {fanItems.map((item, i) => {
          const { pos, startTX, startTY } = getFanItem(i);
          const anim = itemAnims[i];

          return (
            <Animated.View
              key={item.id}
              style={[
                styles.fanItem,
                {
                  left:   pos.left,
                  bottom: pos.bottom,
                  opacity: anim,
                  transform: [
                    { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [startTX, 0] }) },
                    { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [startTY, 0] }) },
                    { scale:     anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
                  ],
                  pointerEvents: fanOpen ? 'auto' : 'none',
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.fanItemBtn, { backgroundColor: item.color }]}
                onPress={() => handleFanItemPress(item)}
                activeOpacity={0.85}
              >
                <Text style={styles.fanItemEmoji}>{item.emoji}</Text>
              </TouchableOpacity>
              {item.id !== '_add' && (
                <TouchableOpacity
                  style={styles.fanItemDelete}
                  onPress={() => handleRemoveChallenge(item.id)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Text style={styles.fanItemDeleteText}>✕</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <Animated.View
          style={[
            styles.fab,
            { backgroundColor: theme.primary },
          ]}
        >
          <TouchableOpacity
            style={styles.fabInner}
            onPress={() => fanOpen ? closeFan() : openFan()}
            activeOpacity={0.85}
          >
            <Text style={styles.fabIcon}>🎯</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── SETTINGS DROPDOWN ── */}
      <Modal visible={showSettings} transparent animationType="none" onRequestClose={closeSettings}>
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity style={[StyleSheet.absoluteFillObject, styles.backdrop]} onPress={closeSettings} activeOpacity={1} />
          <Animated.View style={[
            styles.dropdown,
            { backgroundColor: theme.card, borderColor: theme.border, paddingTop: TOP_INSET },
            { transform: [{ translateY: dropdownAnim }] },
          ]}>
            {/* Tab bar */}
            <View style={[styles.dropTabBar, { borderBottomColor: theme.border }]}>
              {SETTINGS.map(s => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.dropTab, settingsSection === s.key && { borderBottomColor: theme.primary, borderBottomWidth: 2.5 }]}
                  onPress={() => { setSettingsSection(s.key); setAccountView('main'); }}
                >
                  <Text style={{ fontSize: 18 }}>{s.emoji}</Text>
                  <Text style={[styles.dropTabLabel, { color: settingsSection === s.key ? theme.primary : theme.textLight }]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={styles.dropContent}>

                {/* GENERAL */}
                {settingsSection === 'general' && (
                  <View>
                    <Text style={[styles.dropTitle, { color: theme.text }]}>{t.theme}</Text>
                    <View style={[styles.settingRow, { borderColor: theme.border }]}>
                      <Text style={[styles.settingRowLabel, { color: theme.text }]}>
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
                )}

                {/* LANGUAGE */}
                {settingsSection === 'language' && (
                  <View>
                    <Text style={[styles.dropTitle, { color: theme.text }]}>{t.language}</Text>
                    <View style={styles.langRow}>
                      {[{ code: 'tr', flag: '🇹🇷', label: 'Türkçe' }, { code: 'en', flag: '🇬🇧', label: 'English' }].map(l => (
                        <TouchableOpacity
                          key={l.code}
                          style={[styles.langOption, {
                            backgroundColor: lang === l.code ? theme.primary : theme.background,
                            borderColor: theme.border,
                          }]}
                          onPress={() => lang !== l.code && toggleLang()}
                        >
                          <Text style={{ fontSize: 28 }}>{l.flag}</Text>
                          <Text style={[styles.langLabel, { color: lang === l.code ? '#fff' : theme.text }]}>{l.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* ACCOUNT */}
                {settingsSection === 'account' && accountView === 'main' && (
                  <View>
                    <Text style={[styles.dropTitle, { color: theme.text }]}>
                      {lang === 'tr' ? 'Hesap Bilgileri' : 'Account Info'}
                    </Text>
                    <View style={[styles.accountCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      <Text style={[styles.accountField, { color: theme.text }]}>👤  {user?.displayName || '-'}</Text>
                      <View style={[styles.accountDivider, { backgroundColor: theme.border }]} />
                      <Text style={[styles.accountField, { color: theme.textLight }]}>✉️  {user?.email || '-'}</Text>
                    </View>
                    {[
                      { key: 'username', label: lang === 'tr' ? '✏️ Kullanıcı Adı Değiştir' : '✏️ Change Username' },
                      { key: 'email',    label: lang === 'tr' ? '✉️ E-posta Değiştir'        : '✉️ Change Email'    },
                      { key: 'password', label: lang === 'tr' ? '🔒 Şifre Değiştir'          : '🔒 Change Password' },
                    ].map(btn => (
                      <TouchableOpacity
                        key={btn.key}
                        style={[styles.accountActionBtn, { borderColor: theme.border }]}
                        onPress={() => setAccountView(btn.key as AccountView)}
                      >
                        <Text style={[styles.accountActionText, { color: theme.text }]}>{btn.label}</Text>
                        <Text style={{ color: theme.textLight }}>›</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={[styles.logoutBtn, { borderColor: '#FF6B6B' }]}
                      onPress={async () => { closeSettings(); await logout(); }}>
                      <Text style={[styles.logoutText, { color: '#FF6B6B' }]}>🚪 {t.logout}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Change username */}
                {settingsSection === 'account' && accountView === 'username' && (
                  <View>
                    <TouchableOpacity onPress={() => setAccountView('main')} style={styles.backRow}>
                      <Text style={[styles.backRowText, { color: theme.primary }]}>← {lang === 'tr' ? 'Geri' : 'Back'}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.dropTitle, { color: theme.text }]}>
                      {lang === 'tr' ? 'Kullanıcı Adı Değiştir' : 'Change Username'}
                    </Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder={lang === 'tr' ? 'Yeni kullanıcı adı' : 'New username'}
                      placeholderTextColor={theme.textLight}
                      value={newUsername}
                      onChangeText={setNewUsername}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity style={[styles.formBtn, { backgroundColor: theme.primary }]}
                      onPress={handleChangeUsername} disabled={accountBusy}>
                      <Text style={styles.formBtnText}>{accountBusy ? '...' : (lang === 'tr' ? 'Kaydet' : 'Save')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Change email */}
                {settingsSection === 'account' && accountView === 'email' && (
                  <View>
                    <TouchableOpacity onPress={() => setAccountView('main')} style={styles.backRow}>
                      <Text style={[styles.backRowText, { color: theme.primary }]}>← {lang === 'tr' ? 'Geri' : 'Back'}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.dropTitle, { color: theme.text }]}>
                      {lang === 'tr' ? 'E-posta Değiştir' : 'Change Email'}
                    </Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder={lang === 'tr' ? 'Yeni e-posta' : 'New email'}
                      placeholderTextColor={theme.textLight}
                      value={newEmail}
                      onChangeText={setNewEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={[styles.formInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder={lang === 'tr' ? 'Mevcut şifreniz' : 'Current password'}
                      placeholderTextColor={theme.textLight}
                      value={emailPassword}
                      onChangeText={setEmailPassword}
                      secureTextEntry
                    />
                    <TouchableOpacity style={[styles.formBtn, { backgroundColor: theme.primary }]}
                      onPress={handleChangeEmail} disabled={accountBusy}>
                      <Text style={styles.formBtnText}>{accountBusy ? '...' : (lang === 'tr' ? 'Kaydet' : 'Save')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Change password */}
                {settingsSection === 'account' && accountView === 'password' && (
                  <View>
                    <TouchableOpacity onPress={() => setAccountView('main')} style={styles.backRow}>
                      <Text style={[styles.backRowText, { color: theme.primary }]}>← {lang === 'tr' ? 'Geri' : 'Back'}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.dropTitle, { color: theme.text }]}>
                      {lang === 'tr' ? 'Şifre Değiştir' : 'Change Password'}
                    </Text>
                    <Text style={[styles.formHint, { color: theme.textLight }]}>
                      {lang === 'tr' ? 'Min 8 karakter · Büyük/küçük harf · Rakam' : 'Min 8 chars · Upper/lowercase · Number'}
                    </Text>
                    {[
                      { val: curPassword, set: setCurPassword, ph: lang === 'tr' ? 'Mevcut şifre' : 'Current password' },
                      { val: newPassword, set: setNewPassword, ph: lang === 'tr' ? 'Yeni şifre' : 'New password' },
                      { val: confirmPass, set: setConfirmPass, ph: lang === 'tr' ? 'Yeni şifre (tekrar)' : 'Confirm new password' },
                    ].map((f, i) => (
                      <TextInput
                        key={i}
                        style={[styles.formInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                        placeholder={f.ph}
                        placeholderTextColor={theme.textLight}
                        value={f.val}
                        onChangeText={f.set}
                        secureTextEntry
                      />
                    ))}
                    <TouchableOpacity style={[styles.formBtn, { backgroundColor: theme.primary }]}
                      onPress={handleChangePassword} disabled={accountBusy}>
                      <Text style={styles.formBtnText}>{accountBusy ? '...' : (lang === 'tr' ? 'Değiştir' : 'Change')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>

      {/* ── ADD CHALLENGE MODAL ── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowAddModal(false)} activeOpacity={1} />
          <View style={[styles.sheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              {lang === 'tr' ? 'Challenge Ekle' : 'Add Challenge'}
            </Text>
            {unselected.length === 0 ? (
              <Text style={[styles.sheetEmpty, { color: theme.textLight }]}>
                {lang === 'tr' ? 'Tüm challengelar aktif!' : 'All challenges are active!'}
              </Text>
            ) : (
              <View style={styles.sheetGrid}>
                {unselected.map(ch => (
                  <TouchableOpacity
                    key={ch.id}
                    style={[styles.sheetChip, { backgroundColor: ch.color + '22', borderColor: ch.color }]}
                    onPress={() => handleAddChallenge(ch.id)}
                  >
                    <Text style={{ fontSize: 28 }}>{ch.emoji}</Text>
                    <Text style={[styles.sheetChipLabel, { color: theme.text }]}>
                      {(t as any)[ch.id] || ch.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={[styles.createCustomBtn, { borderColor: theme.primary }]}
              onPress={() => { setShowAddModal(false); setShowCustomModal(true); }}
            >
              <Text style={[styles.createCustomText, { color: theme.primary }]}>
                ✏️ {lang === 'tr' ? 'Kendi Challengeını Yarat' : 'Create Your Own Challenge'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── CUSTOM CHALLENGE MODAL ── */}
      <Modal visible={showCustomModal} transparent animationType="slide" onRequestClose={() => setShowCustomModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheetOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowCustomModal(false)} activeOpacity={1} />
            <View style={[styles.sheet, { backgroundColor: theme.card }]}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>
                {lang === 'tr' ? 'Kendi Challengeını Yarat ✏️' : 'Create Your Challenge ✏️'}
              </Text>

              {/* Name */}
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder={lang === 'tr' ? 'Challenge adı' : 'Challenge name'}
                placeholderTextColor={theme.textLight}
                value={customName}
                onChangeText={setCustomName}
              />

              {/* Emoji picker */}
              <Text style={[styles.pickerLabel, { color: theme.textLight }]}>
                {lang === 'tr' ? 'Simge seç' : 'Pick icon'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {CUSTOM_EMOJIS.map(e => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiBtn, customEmoji === e && { backgroundColor: theme.primary + '33', borderColor: theme.primary }]}
                    onPress={() => setCustomEmoji(e)}
                  >
                    <Text style={{ fontSize: 22 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Color picker */}
              <Text style={[styles.pickerLabel, { color: theme.textLight }]}>
                {lang === 'tr' ? 'Renk seç' : 'Pick color'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {CUSTOM_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorBtn, { backgroundColor: c }, customColor === c && styles.colorBtnSelected]}
                    onPress={() => setCustomColor(c)}
                  />
                ))}
              </ScrollView>

              {/* Preview */}
              <View style={[styles.customPreview, { backgroundColor: customColor + '22', borderColor: customColor }]}>
                <Text style={{ fontSize: 32 }}>{customEmoji}</Text>
                <Text style={[styles.customPreviewName, { color: theme.text }]}>
                  {customName || (lang === 'tr' ? 'Challenge adı' : 'Challenge name')}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.formBtn, { backgroundColor: customColor }]}
                onPress={handleSaveCustom}
                disabled={savingCustom}
              >
                <Text style={styles.formBtnText}>
                  {savingCustom ? '...' : (lang === 'tr' ? '✓ Oluştur' : '✓ Create')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  topLeft: { flex: 1 },
  topCenter: { flex: 1, alignItems: 'center' },
  topRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  helloText: { fontSize: 12 },
  usernameText: { fontSize: 15, fontWeight: '700' },
  topLogo: { width: 32, height: 32 },
  appName: { fontSize: 12, fontWeight: '800' },
  settingsBtn: { padding: 4 },

  // Scroll
  scroll: { padding: 16 },

  // Greeting
  greetCard: {
    borderRadius: 24, padding: 24, marginBottom: 16, alignItems: 'center',
    shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4,
  },
  greetEmoji: { fontSize: 52, marginBottom: 12 },
  greetLine1: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  greetLine2: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Progress
  progressCard: {
    borderRadius: 20, padding: 16,
    shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3,
  },
  progressCardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  progressEmoji: { fontSize: 22, width: 30 },
  progressBarWrap: { flex: 1 },
  progressLabel: { fontSize: 11, marginBottom: 4 },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressPct: { fontSize: 13, fontWeight: '800', width: 38, textAlign: 'right' },
  progressDay: { fontSize: 11, width: 36, textAlign: 'right' },

  // FAB
  fanBackdrop: { backgroundColor: 'rgba(0,0,0,0.35)' },
  fanItem: { position: 'absolute' },
  fanItemBtn: {
    width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: ITEM_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.35, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 8,
  },
  fanItemEmoji: { fontSize: 22 },
  fanItemDelete: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center',
  },
  fanItemDeleteText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  fab: {
    position: 'absolute', bottom: FAB_BOTTOM, left: FAB_LEFT,
    width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE / 2,
    shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 10,
  },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: FAB_SIZE / 2 },
  fabIcon: { fontSize: 28, color: '#fff', fontWeight: '900' },

  // Settings dropdown
  backdrop: { backgroundColor: 'rgba(0,0,0,0.45)' },
  dropdown: {
    position: 'absolute', top: 0, left: 0, right: 0,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    borderWidth: 1, borderTopWidth: 0,
    shadowOpacity: 0.25, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, elevation: 12,
  },
  dropTabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingTop: 4 },
  dropTab: { flex: 1, alignItems: 'center', paddingVertical: 10, paddingBottom: 12 },
  dropTabLabel: { fontSize: 10, fontWeight: '700', marginTop: 3 },
  dropContent: { padding: 16, paddingBottom: 20 },
  dropTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, padding: 12,
  },
  settingRowLabel: { fontSize: 15 },
  langRow: { flexDirection: 'row', gap: 12 },
  langOption: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6 },
  langLabel: { fontSize: 14, fontWeight: '700' },
  accountCard: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  accountField: { fontSize: 14, fontWeight: '500', padding: 12 },
  accountDivider: { height: 1 },
  accountActionBtn: {
    borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  accountActionText: { fontSize: 14, fontWeight: '600' },
  logoutBtn: { borderWidth: 2, borderRadius: 14, padding: 12, alignItems: 'center', marginTop: 4 },
  logoutText: { fontSize: 15, fontWeight: '700' },
  backRow: { marginBottom: 8 },
  backRowText: { fontSize: 14, fontWeight: '700' },
  formInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 10 },
  formHint: { fontSize: 11, marginBottom: 10 },
  formBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  formBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Add challenge sheet
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40,
    shadowOpacity: 0.2, shadowOffset: { width: 0, height: -4 }, shadowRadius: 12, elevation: 10,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  sheetEmpty: { textAlign: 'center', fontSize: 15, marginVertical: 20 },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  sheetChip: {
    borderWidth: 2, borderRadius: 16, padding: 16, alignItems: 'center', width: 100,
    shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2,
  },
  sheetChipLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  createCustomBtn: {
    borderWidth: 2, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 16,
  },
  createCustomText: { fontSize: 15, fontWeight: '700' },

  // Custom challenge
  pickerLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  emojiBtn: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  colorBtn: { width: 32, height: 32, borderRadius: 16, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
  colorBtnSelected: { borderColor: '#fff', transform: [{ scale: 1.25 }] },
  customPreview: {
    borderWidth: 2, borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', gap: 12, marginBottom: 16,
  },
  customPreviewName: { fontSize: 16, fontWeight: '700', flex: 1 },

  // Empty state
  emptyCard: {
    borderRadius: 24, padding: 32, alignItems: 'center',
    shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
