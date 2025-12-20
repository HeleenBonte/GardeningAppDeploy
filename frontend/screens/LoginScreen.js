import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import { saveJwtToken, saveItem } from '../auth/storage';
import { login } from '../config/api';

export default function LoginScreen() {
  const { theme, currentSeason } = useTheme();
  const navigation = useNavigation();
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
        // Auth-specific friendly mapping — prioritize HTTP status for auth flows
        if (err.status === 401 || err.status === 403) return 'Invalid email or password';

        // prefer explicit message if it's not generic
        const m = err.message;
        if (m && m !== 'Error') return m;

        // check structured payload
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
          // ignore parse errors
        }

        // fallback to status + statusText
        if (err.status) return `Error ${err.status}${err.statusText ? `: ${err.statusText}` : ''}`;
        // last resort
        return String(err) || 'Sign in failed';
      };

      setError(buildMsg(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.headerBg }]} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.wrapper}>
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}> 
            <Text style={styles.logoIcon}>✿</Text>
          </View>
          <Text style={[styles.title, { color: theme.primary }]}>Gardeners of the Galaxy</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Your journey from garden to table starts here {seasonEmojis[currentSeason] ?? '🍃'}</Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.secondaryText }]}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={theme.secondaryText}
              value={email}
              onChangeText={(t) => setEmail(t?.trim().toLowerCase())}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
            />

            <Text style={[styles.label, { color: theme.secondaryText }]}>Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={theme.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder, flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={{ marginLeft: 8, padding: 8 }} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                <Text style={{ color: theme.primary, fontWeight: '700' }}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSignIn}
              disabled={loading || !email}
            >
              <Text style={styles.signInText}>{loading ? 'Signing In…' : 'Sign In'}</Text>
            </TouchableOpacity>
            {error ? <Text style={[styles.errorText, { color: '#e74c3c' }]}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary, marginTop: 8 }]}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.signInText}>Continue as guest</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.signUpButton]}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={[styles.signUpText, { color: theme.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  wrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1 },
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
