import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import { saveJwtToken } from '../auth/storage';

export default function LoginScreen() {
  const { theme, currentSeason } = useTheme();
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const seasonEmojis = {
    Fall: '🍂',
    Winter: '❄️',
    Spring: '🌸',
    Summer: '☀️',
  };

  async function handleSignIn() {
    if (!email) return;
    setLoading(true);
    try {
      // In a real app you'd call your API to authenticate and receive a JWT
      // Here we persist a demo token to enable the rest of the UI flows
      await saveJwtToken('demo-jwt-token');
      navigation.navigate('Main');
    } catch (e) {
      console.warn('Sign in failed', e);
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
              onChangeText={setEmail}
              keyboardType="email-address"
              style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
            />

            <Text style={[styles.label, { color: theme.secondaryText }]}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={theme.secondaryText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
            />

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSignIn}
              disabled={loading || !email}
            >
              <Text style={styles.signInText}>{loading ? 'Signing In…' : 'Sign In'}</Text>
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
});
