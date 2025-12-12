import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';

export default function HamburgerMenu({ visible, onClose, onNavigate, onToggleTheme, isDarkMode }) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.menuContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
            onPress={() => { onClose(); onNavigate && onNavigate('Settings'); }}
          >
            <Ionicons name="settings-outline" size={24} color={theme.text} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.cardBorder }]}
            onPress={() => { onToggleTheme && onToggleTheme(); onClose(); }}
          >
            <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={24} color={theme.text} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onClose}>
            <Ionicons name="close-outline" size={24} color={theme.secondaryText} />
            <Text style={[styles.menuItemText, { color: theme.secondaryText }]}>Close</Text>
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
