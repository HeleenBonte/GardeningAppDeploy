import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import { saveJwtToken, saveItem } from '../auth/storage';
import { login } from '../config/api';
import useTranslation from '../hooks/useTranslation';
import commonStyles from '../themes/styles';

export default function LoginScreen() {
  const { theme, currentSeason } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  

  const seasonEmojis = {
    Fall: '🍂',
    Winter: '❄️',
    Spring: '🌸',
    Summer: '☀️',
  };

  async function handleSignIn() {
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      const res = await login(normalizedEmail, password);
      if (res?.token) {
        await saveJwtToken(res.token);
        if (res.id) await saveItem('user_id', String(res.id));
        if (res.name) await saveItem('username', String(res.name));
        navigation.navigate('Main');
      } else {
        const msg = (res && (res.message || res.error)) || 'Login failed';
        console.warn('Login did not return a token', res);
        setError(msg);
      }
    } catch (e) {
      console.warn('Sign in failed', e);
      const buildMsg = (err) => {
        if (!err) return 'Sign in failed';
        if (err.status === 401 || err.status === 403) return 'Invalid email or password';

        
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
        } catch (_) {
        }

        
        if (err.status) return `Error ${err.status}${err.statusText ? `: ${err.statusText}` : ''}`;
        return String(err) || 'Sign in failed';
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
        <View style={[styles.card,  { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
          <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}> 
            <Text style={styles.logoIcon} accessible={false}>✿</Text>
          </View>
          <Text accessibilityRole="header" accessibilityLabel={t ? t('login.title') : 'Gardeners of the Galaxy'} style={[styles.title, { color: theme.primary }]}>{t ? t('login.title') : 'Gardeners of the Galaxy'}</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{(t ? t('login.subtitle') : 'Your journey from garden to table starts here {emoji}').replace('{emoji}', seasonEmojis[currentSeason] ?? '🍃')}</Text>

          <View style={styles.form}>
            <Text style={[styles.label, styles.labelMargin, { color: theme.secondaryText }]}>{t ? t('login.emailLabel') : 'Email'}</Text>
            <TextInput
              placeholder={t ? t('login.emailPlaceholder') : 'Enter your email'}
              placeholderTextColor={theme.secondaryText}
              value={email}
              onChangeText={(t) => setEmail(t?.trim().toLowerCase())}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, styles.inputMargin, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
              accessibilityLabel={t ? t('login.emailLabel') : 'Email'}
              accessibilityHint={t ? t('login.emailA11yHint') : 'Enter your email address'}
            />

            <Text style={[styles.label, styles.labelMargin, { color: theme.secondaryText }]}>{t ? t('login.passwordLabel') : 'Password'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder={t ? t('login.passwordPlaceholder') : 'Enter your password'}
                placeholderTextColor={theme.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, styles.inputMargin, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder, flex: 1 }]}
                accessibilityLabel={t ? t('login.passwordLabel') : 'Password'}
                accessibilityHint={t ? t('login.passwordA11yHint') : 'Enter your password'}
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={{ marginLeft: 8, padding: 8 }} accessibilityRole="button" accessibilityLabel={showPassword ? (t ? t('login.hidePasswordA11y') : 'Hide password') : (t ? t('login.showPasswordA11y') : 'Show password')} accessibilityHint={t ? t('login.showHidePasswordHint') : 'Toggles password visibility'} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                <Text style={{ color: theme.primary, fontWeight: '700' }}>{showPassword ? (t ? t('login.hide') : 'Hide') : (t ? t('login.show') : 'Show')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1, marginTop: 12 }]}
              onPress={handleSignIn}
              disabled={loading || !email}
              accessibilityRole="button"
              accessibilityLabel={t ? t('login.signIn') : 'Sign In'}
            >
              <Text style={styles.signInText}>{loading ? (t ? t('login.signingIn') : 'Signing In…') : (t ? t('login.signIn') : 'Sign In')}</Text>
            </TouchableOpacity>
            {error ? <Text style={[styles.errorText, { color: '#e74c3c' }]}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary, marginTop: 8 }]}
              onPress={() => navigation.navigate('Main')}
              accessibilityRole="button"
              accessibilityLabel={t ? t('login.continueAsGuest') : 'Continue as guest'}
            >
              <Text style={styles.signInText}>{t ? t('login.continueAsGuest') : 'Continue as guest'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.signUpButton]}
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
              accessibilityLabel={t ? t('login.signUp') : 'Sign Up'}
            >
              <Text style={[styles.signUpText, { color: theme.primary }]}>{t ? t('login.signUp') : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>
        </View>
    </KeyboardAwareScrollView>
  );
}

const localStyles = StyleSheet.create({
  wrapper: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { width: '100%', maxWidth: 520, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, marginVertical: 20 },
    logoCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginTop: -44, marginBottom: 8 },
    logoIcon: { color: '#fff', fontSize: 28 },
    cardPadded: { padding: 20 },
  form: { width: '100%', marginTop: 8 },
  labelMargin: { marginBottom: 6 },
  inputMargin: { marginBottom: 12 },
  signUpButton: { marginTop: 10, alignItems: 'center' },
  signUpText: { fontWeight: '700' },
  errorText: { marginTop: 8, textAlign: 'center' },
});
const styles = { ...commonStyles, ...localStyles };
