import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import HamburgerMenu from './HamburgerMenu';

export default function AppHeader({ title = 'Gardeners of the Galaxy', rightIcon = 'menu', onRightPress = null }) {
	const { theme, toggleTheme, isDarkMode } = useTheme();
	const navigation = useNavigation();
	const [menuVisible, setMenuVisible] = useState(false);

	function handleRightPress() {
		if (rightIcon === 'menu') setMenuVisible(true);
		else if (onRightPress) onRightPress();
	}

	return (
		<>
			<View style={[styles.header, { backgroundColor: theme.headerBg }]}> 
				<View style={styles.headerContent}>
					<Ionicons name="leaf" size={24} color={theme.primary} />
					<Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
					<Ionicons name="leaf" size={24} color={theme.primary} />
				</View>
				<TouchableOpacity onPress={handleRightPress}>
					<Ionicons name={rightIcon === 'menu' ? 'menu' : rightIcon} size={28} color={theme.text} />
				</TouchableOpacity>
			</View>

			<HamburgerMenu
				visible={menuVisible}
				onClose={() => setMenuVisible(false)}
				onNavigate={(screen) => navigation.navigate(screen)}
				onToggleTheme={() => toggleTheme()}
				isDarkMode={isDarkMode}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 16 },
	headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	headerTitle: { fontSize: 18, fontWeight: 'bold' },
});