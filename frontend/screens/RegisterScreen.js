import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import { saveJwtToken, saveItem } from '../auth/storage';
import { register } from '../config/api';
import useTranslation from '../hooks/useTranslation';
import commonStyles from '../themes/styles';

export default function RegisterScreen() {
  const { theme, currentSeason } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  const seasonEmojis = {
    Fall: '🍂',
    Winter: '❄️',
    Spring: '🌸',
    Summer: '☀️',
  };

  async function handleRegister() {
    if (!email || !password) return;
    if (password !== confirmPassword) {
      // small client-side validation; show an error
      setError(t ? t('register.passwordsMismatch') : 'Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      const res = await register(name, normalizedEmail, password);
      if (res?.token) {
        await saveJwtToken(res.token);
        if (res.id) await saveItem('user_id', String(res.id));
        navigation.navigate('Main');
      } else {
        console.warn('Register did not return a token', res);
        const msg = (res && (res.message || res.error)) || 'Registration failed';
        setError(msg);
      }
    } catch (e) {
      console.warn('Register failed', e);
      const buildMsg = (err) => {
        if (!err) return 'Registration failed';
        const m = err.message;
        if (m && m !== 'Error') return m;
        const raw = err.raw ?? err.cause ?? null;
        try {
          if (raw) {
            const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (obj) {
              if (obj.message) return obj.message;
              if (obj.error) return obj.error;
              if (Array.isArray(obj.validationErrors)) return obj.validationErrors.map(v => v.message || v.defaultMessage || JSON.stringify(v)).join('; ');
              return JSON.stringify(obj);
            }
          }
        } catch (_) {}
        // Registration-specific friendly mapping
        if (err.status === 409) return 'Email already exists';
        if (err.status) return `Error ${err.status}${err.statusText ? `: ${err.statusText}` : ''}`;
        return String(err) || 'Registration failed';
      };
      setError(buildMsg(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: theme.headerBg }]}
      contentContainerStyle={styles.wrapper}
      enableOnAndroid={true}
      extraScrollHeight={Platform.select({ ios: 0, android: 80 })}
      keyboardShouldPersistTaps="handled"
    >
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}> 
            <Text style={styles.logoIcon}>✿</Text>
          </View>
          <Text accessibilityRole="header" accessibilityLabel={(t && t('register.title')) || 'Create Account'} style={[styles.title, { color: theme.primary }]}>{(t && t('register.title')) || 'Create Account'}</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{(((t && t('register.subtitle')) || 'Join Gardeners of the Galaxy {emoji}').replace('{emoji}', seasonEmojis[currentSeason] ?? '🍃'))}</Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.secondaryText }]}>{(t && t('register.nameLabel')) || 'Name'}</Text>
            <TextInput
              placeholder={(t && t('register.namePlaceholder')) || 'Enter your name'}
              placeholderTextColor={theme.secondaryText}
              value={name}
              onChangeText={setName}
              style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
            />

            <Text style={[styles.label, { color: theme.secondaryText }]}>{(t && t('register.emailLabel')) || 'Email'}</Text>
            <TextInput
              placeholder={(t && t('register.emailPlaceholder')) || 'Enter your email'}
              placeholderTextColor={theme.secondaryText}
              value={email}
              onChangeText={(t) => setEmail(t?.trim().toLowerCase())}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
            />

            <Text style={[styles.label, { color: theme.secondaryText }]}>{(t && t('register.passwordLabel')) || 'Password'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder={(t && t('register.passwordPlaceholder')) || 'Choose a password'}
                placeholderTextColor={theme.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder, flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={{ marginLeft: 8, padding: 8 }} accessibilityLabel={showPassword ? ((t && t('login.hidePasswordA11y')) || 'Hide password') : ((t && t('login.showPasswordA11y')) || 'Show password')}>
                <Text style={{ color: theme.primary, fontWeight: '700' }}>{showPassword ? ((t && t('login.hide')) || 'Hide') : ((t && t('login.show')) || 'Show')}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.secondaryText }]}>{(t && t('register.confirmPasswordLabel')) || 'Confirm Password'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder={(t && t('register.confirmPasswordPlaceholder')) || 'Repeat your password'}
                placeholderTextColor={theme.secondaryText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder, flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(s => !s)} style={{ marginLeft: 8, padding: 8 }} accessibilityLabel={showConfirmPassword ? (t ? t('login.hidePasswordA11y') : 'Hide password') : (t ? t('login.showPasswordA11y') : 'Show password')}>
                <Text style={{ color: theme.primary, fontWeight: '700' }}>{showConfirmPassword ? (t ? t('login.hide') : 'Hide') : (t ? t('login.show') : 'Show')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={loading || !email || !password}
              accessibilityRole="button"
              accessibilityLabel={(t && t('register.createAccount')) || 'Create Account'}
            >
              <Text style={[styles.signInText, { color: '#fff', fontSize: 16 }]}>{loading ? ((t && t('register.creating')) || 'Creating…') : ((t && t('register.createAccount')) || 'Create Account')}</Text>
            </TouchableOpacity>
            {error ? <Text style={[styles.errorText, { color: '#e74c3c' }]}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary, marginTop: 8 }]}
              onPress={() => navigation.navigate('Main')}
              accessibilityRole="button"
              accessibilityLabel={(t && t('register.continueAsGuest')) || 'Continue as guest'}
            >
              <Text style={[styles.signInText, { color: '#fff', fontSize: 16 }]}>{(t && t('register.continueAsGuest')) || 'Continue as guest'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('Login')} accessibilityRole="button" accessibilityLabel={(t && t('register.backToSignIn')) || 'Back to Sign In'}>
              <Text style={[styles.signUpText, { color: theme.primary }]}>{(t && t('register.backToSignIn')) || 'Back to Sign In'}</Text>
            </TouchableOpacity>
          </View>
        </View>
    </KeyboardAwareScrollView>
  );
}

const localStyles = StyleSheet.create({
  wrapper: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 520, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginTop: -44, marginBottom: 8 },
  logoIcon: { color: '#fff', fontSize: 28 },
  title: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 12 },
  form: { width: '100%', marginTop: 8 },
  label: { fontSize: 12, marginBottom: 6 },
  input: { height: 44, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, marginBottom: 12 },
  signInButton: { height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  signInText: { color: '#fff', fontWeight: '700' },
  signUpButton: { marginTop: 10, alignItems: 'center' },
  signUpText: { fontWeight: '700' },
  errorText: { marginTop: 8, textAlign: 'center' },
});
const styles = { ...commonStyles, ...localStyles };
