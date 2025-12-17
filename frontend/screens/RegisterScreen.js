import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import { saveJwtToken } from '../auth/storage';

export default function RegisterScreen() {
  const { theme, currentSeason } = useTheme();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const seasonEmojis = {
    Fall: '🍂',
    Winter: '❄️',
    Spring: '🌸',
    Summer: '☀️',
  };

  async function handleRegister() {
    if (!email || !password) return;
    if (password !== confirmPassword) {
      // small client-side validation; in a real app show an error
      return;
    }
    setLoading(true);
    try {
      // Replace this with real registration API call
      await saveJwtToken('demo-jwt-token');
      navigation.navigate('Main');
    } catch (e) {
      console.warn('Register failed', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.headerBg }]} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}> 
            <Text style={styles.logoIcon}>✿</Text>
          </View>
          <Text style={[styles.title, { color: theme.primary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Join Gardeners of the Galaxy {seasonEmojis[currentSeason] ?? '🍃'}</Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.secondaryText }]}>Name</Text>
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor={theme.secondaryText}
              value={name}
              onChangeText={setName}
              style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
            />

            <Text style={[styles.label, { color: theme.secondaryText }]}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={theme.secondaryText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
            />

            <Text style={[styles.label, { color: theme.secondaryText }]}>Password</Text>
            <TextInput
              placeholder="Choose a password"
              placeholderTextColor={theme.secondaryText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
            />

            <Text style={[styles.label, { color: theme.secondaryText }]}>Confirm Password</Text>
            <TextInput
              placeholder="Repeat your password"
              placeholderTextColor={theme.secondaryText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
            />

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={loading || !email || !password}
            >
              <Text style={styles.signInText}>{loading ? 'Creating…' : 'Create Account'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.signUpText, { color: theme.primary }]}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
});
