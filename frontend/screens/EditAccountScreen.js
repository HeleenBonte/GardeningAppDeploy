import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';
import { getItem, saveItem, saveJwtToken } from '../auth/storage';
import { getUserById, updateUser } from '../config/api';
import useTranslation from '../hooks/useTranslation';
import commonStyles from '../themes/styles';

export default function EditAccountScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userIdStr = await getItem('user_id');
        if (!userIdStr) return;
        const userId = Number(userIdStr);
        if (!userId) return;
        const u = await getUserById(userId).catch(() => null);
        if (!mounted || !u) return;
        setName(u.userName ?? '');
        setEmail(u.userEmail ?? '');
      } catch (e) {
        if (__DEV__) console.warn('Failed to load user for edit', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function handleSave() {
    if (!name?.trim()) return Alert.alert(t ? t('editAccount.validationTitle') : 'Validation', t ? t('editAccount.validationName') : 'Please enter a display name');
    if (!email?.includes('@')) return Alert.alert(t ? t('editAccount.validationTitle') : 'Validation', t ? t('editAccount.validationEmail') : 'Please enter a valid email');
    setLoading(true);
    try {
      const userIdStr = await getItem('user_id');
      if (!userIdStr) throw new Error('Missing user id');
      const userId = Number(userIdStr);
      const res = await updateUser(userId, { userName: name.trim(), email: email.trim() });
      // If backend returned a refreshed token, persist it so the user stays logged in
      try {
        if (res && res.token) {
          await saveJwtToken(String(res.token));
        }
      } catch (err) {
        if (__DEV__) console.warn('Failed to save refreshed token', err);
      }
      // persist username and email locally
      try {
        if (res?.id) await saveItem('user_id', String(res.id));
        await saveItem('username', String(name.trim()));
        if (res?.email) await saveItem('user_email', String(res.email));
      } catch (_) {}
      Alert.alert(t ? t('editAccount.savedTitle') : 'Saved', t ? t('editAccount.savedMessage') : 'Your account was updated');
      navigation.goBack();
    } catch (e) {
        if (__DEV__) console.warn('Failed to update user', e);
        // Prefer structured error details returned by the API
        const msg = e?.message || (e?.raw ? (typeof e.raw === 'string' ? e.raw : JSON.stringify(e.raw)) : 'Failed to update account');
        Alert.alert(t ? t('editAccount.errorTitle') : 'Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.text }]}>{t ? t('editAccount.displayNameLabel') : 'Display name'}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t ? t('editAccount.displayNamePlaceholder') : 'Your display name'}
          placeholderTextColor={theme.secondaryText}
          style={[styles.input, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.cardBorder }]}
          accessibilityLabel={t ? t('editAccount.displayNameLabel') : 'Display name'}
          accessibilityHint={t ? t('editAccount.displayNameA11yHint') : 'Enter your display name'}
        />
        <Text style={[styles.label, { color: theme.text }]}>{t ? t('editAccount.emailLabel') : 'Email'}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t ? t('editAccount.emailPlaceholder') : 'you@example.com'}
          placeholderTextColor={theme.secondaryText}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.cardBorder }]}
          accessibilityLabel={t ? t('editAccount.emailLabel') : 'Email'}
          accessibilityHint={t ? t('editAccount.emailA11yHint') : 'Enter your email address'}
        />

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={loading ? (t ? t('editAccount.saving') : 'Saving') : (t ? t('editAccount.save') : 'Save')}
          accessibilityHint={t ? t('editAccount.saveA11yHint') : 'Saves your account changes'}
          accessibilityState={{ busy: loading }}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <Text style={styles.saveText}>{loading ? (t ? t('editAccount.saving') : 'Saving…') : (t ? t('editAccount.save') : 'Save')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  content: { padding: 20 },
  saveButton: { marginTop: 20, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
const styles = { ...commonStyles, ...localStyles };
