import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import useTranslation from '../hooks/useTranslation';
import { getJwtToken, deleteJwtToken, logout } from '../auth/storage';

export default function HamburgerMenu({ visible, onClose, onNavigate, onToggleTheme, isDarkMode, onLogout }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!visible) return;
    (async () => {
      try {
        const token = await getJwtToken();
        if (!mounted) return;
        setIsLoggedIn(!!token);
      } catch (e) {
        if (!mounted) return;
        setIsLoggedIn(false);
      }
    })();
    return () => { mounted = false; };
  }, [visible]);

  async function handleLogout() {
    try {
      await logout('manual');
    } catch (e) {
      // ignore
    }
    setIsLoggedIn(false);
    onClose();
    if (onNavigate) onNavigate('Main', { screen: 'HomeTab' });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View accessibilityViewIsModal={true} accessible={true} style={[styles.menuContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
            onPress={() => { onClose(); onNavigate && onNavigate('Settings'); }}
            accessibilityRole="button"
            accessibilityLabel={t ? t('settings') : 'Settings'}
            accessibilityHint={t ? t('settings') + ' ' : 'Opens settings'}
          >
            <Ionicons name="settings-outline" size={24} color={theme.text} accessible={false} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>{t ? t('settings') : 'Settings'}</Text>
          </TouchableOpacity>

          {isLoggedIn ? (
            <>
                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
                  onPress={() => { onClose(); onNavigate && onNavigate('Account'); }}
                  accessibilityRole="button"
                  accessibilityLabel={t ? t('account.title') : 'Account'}
                  accessibilityHint={t ? t('account.title') + ' ' : 'Opens account screen'}
                >
                  <Ionicons name="person-circle-outline" size={24} color={theme.text} accessible={false} />
                  <Text style={[styles.menuItemText, { color: theme.text }]}>{t ? t('account.title') : 'Account'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
                  onPress={handleLogout}
                  accessibilityRole="button"
                  accessibilityLabel={t ? t('logout') : 'Log Out'}
                  accessibilityHint={t ? t('logout') + ' ' : 'Logs you out'}
                >
                  <Ionicons name="log-out-outline" size={24} color={theme.text} accessible={false} />
                  <Text style={[styles.menuItemText, { color: theme.text }]}>{t ? t('logout') : 'Log Out'}</Text>
                </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
              onPress={() => { onClose(); onNavigate && onNavigate('Login'); }}
              accessibilityRole="button"
              accessibilityLabel={t ? `${t('login.signIn')} / ${t('login.signUp')}` : 'Login / Sign Up'}
              accessibilityHint={t ? t('login.signIn') + ' ' : 'Opens login screen'}
            >
              <Ionicons name="log-in-outline" size={24} color={theme.text} accessible={false} />
              <Text style={[styles.menuItemText, { color: theme.text }]}>{`${t ? t('login.signIn') : 'Login'} / ${t ? t('login.signUp') : 'Sign Up'}`}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={onClose} accessibilityRole="button" accessibilityLabel={t ? t('close') : 'Close'} accessibilityHint={t ? t('close') + ' ' : 'Closes menu'}>
            <Ionicons name="close-outline" size={24} color={theme.secondaryText} accessible={false} />
            <Text style={[styles.menuItemText, { color: theme.secondaryText }]}>{t ? t('close') : 'Close'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginTop: 80,
    marginRight: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
