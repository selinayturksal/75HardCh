import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'Auth'>;

export default function AuthScreen() {
  const { theme } = useTheme();
  const { t } = useLang();
  const { login, register } = useAuth();
  const navigation = useNavigation<Nav>();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert(t.fillAll);
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (e) {
      Alert.alert(isLogin ? t.errorLogin : t.errorRegister);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.primary }]}>75 Hard</Text>
        <Text style={[styles.subtitle, { color: theme.textLight }]}>
          {isLogin ? t.login : t.register}
        </Text>

        <View style={styles.form}>
          {!isLogin && (
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder={t.username}
              placeholderTextColor={theme.textLight}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder={t.email}
            placeholderTextColor={theme.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder={t.password}
            placeholderTextColor={theme.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '...' : isLogin ? t.login : t.register}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
            <Text style={{ color: theme.secondary }}>
              {isLogin ? t.noAccount : t.hasAccount}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    width: '100%',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
  },
  button: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  switchBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
});