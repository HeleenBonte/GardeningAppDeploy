import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import HamburgerMenu from './HamburgerMenu';
import { navigationRef } from '../config/AppNavigator';

export default function AppHeader({ title = 'Gardeners of the Galaxy', rightIcon = 'menu', onRightPress = null }) {
	const { theme, toggleTheme, isDarkMode } = useTheme();
	const navigation = useNavigation();
	const route = useRoute();
	const [menuVisible, setMenuVisible] = useState(false);

	function handleRightPress() {
		console.debug('[AppHeader] handleRightPress rightIcon=', rightIcon, 'hasHandler=', !!onRightPress);
		if (rightIcon === 'menu') {
			setMenuVisible(true);
			return;
		}

		try {
			if (rightIcon === 'close' && route?.name === 'RecipeDetail') {
				if (navigationRef && navigationRef.isReady && navigationRef.isReady()) {
					console.debug('[AppHeader] resetting root to Main->Recipes->RecipesList');
					navigationRef.resetRoot({ index: 0, routes: [{ name: 'Main', state: { index: 0, routes: [{ name: 'Recipes', state: { index: 0, routes: [{ name: 'RecipesList' }] } }] } }] });
					return;
				}
			}
		} catch (e) { console.warn('[AppHeader] resetRoot failed', e); }

		if (onRightPress) {
			try { onRightPress(); } catch (e) { console.warn('[AppHeader] onRightPress threw', e); }
		}
	}

	return (
		<>
			<View style={[styles.header, { backgroundColor: theme.headerBg }]}> 
				<View style={styles.headerContent}>
						<Ionicons name="leaf" size={24} color={theme.primary} accessible={false} />
						<Text accessibilityRole="header" accessibilityLabel={title} style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
						<Ionicons name="leaf" size={24} color={theme.primary} accessible={false} />
				</View>
					<TouchableOpacity onPress={handleRightPress} accessibilityRole="button" accessibilityLabel={rightIcon === 'menu' ? ("Menu") : rightIcon} accessibilityHint={rightIcon === 'menu' ? 'Open menu' : ''} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
							<Ionicons name={rightIcon === 'menu' ? 'menu' : rightIcon} size={28} color={theme.text} accessible={false} />
						</TouchableOpacity>
			</View>

			<HamburgerMenu
				visible={menuVisible}
				onClose={() => setMenuVisible(false)}
				onNavigate={(name, params) => navigation.navigate(name, params)}
				onToggleTheme={() => toggleTheme()}
				isDarkMode={isDarkMode}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 16 },
	headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	headerTitle: { fontSize: 24, fontWeight: 'bold' },
});