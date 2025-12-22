import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import useTranslation from '../hooks/useTranslation';
import { useIsFocused } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import { getJwtToken, getItem, saveItem } from '../auth/storage';
import { getUserById, getUserFavoriteCrops, getUserFavoriteRecipes } from '../config/api';
import commonStyles from '../themes/styles';

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme, currentSeason } = useTheme();
  const { t } = useTranslation();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  const focused = useIsFocused();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getJwtToken();
        if (!token) return;
        if (!mounted) return;
        setIsLoggedIn(true);

        // Try to read cached username first
        const cachedName = await getItem('username');
        if (cachedName) {
          setUsername(cachedName);
          return;
        }

        // If no cached username, try to fetch using saved user id
        const userId = await getItem('user_id');
        if (userId) {
          try {
            const user = await getUserById(userId);
            const name = user?.userName || user?.name || null;
            if (name) {
              await saveItem('username', String(name));
              if (mounted) setUsername(name);
            }
          } catch (e) {
            // ignore errors - user will see generic welcome
            if (__DEV__) console.warn('Failed to fetch user for welcome', e);
          }
        }
      } catch (e) {
        if (__DEV__) console.warn('Failed to load auth info', e);
      }
    })();
    return () => { mounted = false; };
  }, [focused]);

  const [favoriteCropsCount, setFavoriteCropsCount] = useState(0);
  const [favoriteRecipesCount, setFavoriteRecipesCount] = useState(0);

  // load favorite counts when logged in
  useEffect(() => {
    let mounted = true;
    if (!isLoggedIn) {
      setFavoriteCropsCount(0);
      setFavoriteRecipesCount(0);
      return;
    }
    (async () => {
      try {
        const userIdStr = await getItem('user_id');
        if (!userIdStr) return;
        const userId = Number(userIdStr);
        if (!userId) return;
        const [crops, recipes] = await Promise.all([
          getUserFavoriteCrops(userId).catch(() => []),
          getUserFavoriteRecipes(userId).catch(() => []),
        ]);
        if (!mounted) return;
        setFavoriteCropsCount(Array.isArray(crops) ? crops.length : (crops?.length ?? 0));
        setFavoriteRecipesCount(Array.isArray(recipes) ? recipes.length : (recipes?.length ?? 0));
      } catch (e) {
        if (__DEV__) console.warn('Failed to load favorite counts', e);
      }
    })();
    return () => { mounted = false; };
  }, [isLoggedIn, focused]);
  
  const seasonEmojis = {
    fall: '🍂',
    winter: '❄️',
    spring: '🌸',
    summer: '☀️',
  };
  const seasonKey = (currentSeason || '').toString().toLowerCase();
  const seasonEmoji = seasonEmojis[seasonKey] || '🍂';
  
  const welcomeMessage = (() => {
    if (isLoggedIn) {
      if (username) {
        const tpl = t ? t('home.welcomeBack') : 'Welcome back, {name}! {emoji}';
        return tpl.replace('{name}', username).replace('{emoji}', seasonEmoji);
      }
      const tpl = t ? t('home.welcome') : 'Welcome! {emoji}';
      return tpl.replace('{emoji}', seasonEmoji);
    }
    const tpl = t ? t('home.welcome') : 'Welcome! {emoji}';
    return tpl.replace('{emoji}', seasonEmoji);
  })();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader />


      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text
          style={[styles.welcomeText, { color: theme.text }]}
          accessibilityRole="header"
          accessibilityLabel={welcomeMessage}
        >
          {welcomeMessage}
        </Text>
        <Text
          style={[styles.promptText, { color: theme.secondaryText }]}
          accessibilityLabel={t ? t('home.promptExplore') : 'What would you like to explore today?'}
        >
          {t ? t('home.promptExplore') : 'What would you like to explore today?'}
        </Text>
      </View>

      {/* Favorite Crops Card */}
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]} accessibilityLabel={t ? t('home.favoriteCrops') : 'Favorite Crops'}>
              {t ? t('home.favoriteCrops') : 'Favorite Crops'}
            </Text>
            <Ionicons name="leaf" size={20} color={theme.primary} accessible={false} />
          </View>
          <Text style={[styles.cardNumber, { color: theme.primary }]}>{favoriteCropsCount}</Text>
        </View>
      </View>

      {/* Favorite Recipes Card */}
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]} accessibilityLabel={t ? t('home.favoriteRecipes') : 'Favorite Recipes'}>
              {t ? t('home.favoriteRecipes') : 'Favorite Recipes'}
            </Text>
            <Ionicons name="book" size={20} color={theme.primary} accessible={false} />
          </View>
          <Text style={[styles.cardNumber, { color: theme.primary }]}>{favoriteRecipesCount}</Text>
        </View>
      </View>

      {/* Current Season Section */}
      <View style={[styles.seasonCard, { backgroundColor: theme.seasonCardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.seasonHeader}>
          <Text
            style={[styles.seasonLabel, { color: theme.secondaryText }]}
            accessibilityLabel={t ? t('home.currentSeasonLabel') : 'Current Season'}
          >
            {t ? t('home.currentSeasonLabel') : 'Current Season'}
          </Text>
          <Ionicons name="leaf" size={20} color={theme.primary} accessible={false} />
        </View>
        <Text
          style={[styles.seasonText, { color: theme.text }]}
          accessibilityRole="text"
          accessibilityLabel={t ? (t(`seasons.${seasonKey}`) || currentSeason) : currentSeason}
          accessibilityHint={t ? t('home.currentSeasonA11yHint') : 'Shows the currently selected season'}
        >
          {t ? (t(`seasons.${seasonKey}`) || currentSeason) : currentSeason}
        </Text>

      </View>

      {/* Explore Crops Section */}
      <View style={[styles.featureCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1438109382753-8368e7e1e7cf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
          style={[styles.featureImagePlaceholder, { backgroundColor: theme.imagePlaceholderBg }]}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={t ? t('home.exploreCropsImageA11y') : 'Image showing crops'}
        />
        <View style={styles.featureContent}>
          <View style={styles.featureHeader}>
            <Ionicons name="leaf" size={20} color={theme.primary} />
            <Text style={[styles.featureTitle, { color: theme.text }]}>{t ? t('home.exploreCropsTitle') : 'Explore Crops'}</Text>
          </View>
          <Text style={[styles.featureDescription, { color: theme.secondaryText }]}>
            {t ? t('home.exploreCropsDesc') : 'Learn about growing vegetables and herbs in your garden'}
          </Text>
          <TouchableOpacity
            style={[styles.featureButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Crops')}
            accessibilityRole="button"
            accessibilityLabel={t ? t('home.viewAllCropsA11yLabel') : 'View all crops'}
            accessibilityHint={t ? t('home.viewAllCropsA11yHint') : 'Navigate to the crops list'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.featureButtonText}>{t ? t('home.viewAllCrops') : 'View All Crops'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Discover Recipes Section */}
      <View style={[styles.featureCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
          style={[styles.featureImagePlaceholder, { backgroundColor: theme.imagePlaceholderBg }]}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={t ? t('home.discoverRecipesImageA11y') : 'Image showing prepared recipes'}
        />

        <View style={styles.featureContent}>
          <View style={styles.featureHeader}>
            <Ionicons name="book" size={20} color={theme.primary} />
            <Text style={[styles.featureTitle, { color: theme.text }]}>{t ? t('home.discoverRecipesTitle') : 'Discover Recipes'}</Text>
          </View>
          <Text style={[styles.featureDescription, { color: theme.secondaryText }]}>
            {t ? t('home.discoverRecipesDesc') : 'Find delicious ways to use your fresh harvest'}
          </Text>
            <TouchableOpacity
              style={[styles.featureButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Recipes')}
              accessibilityRole="button"
              accessibilityLabel={t ? t('home.viewAllRecipesA11yLabel') : 'View all recipes'}
              accessibilityHint={t ? t('home.viewAllRecipesA11yHint') : 'Navigate to the recipe list'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.featureButtonText}>{t ? t('home.viewAllRecipes') : 'View All Recipes'}</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  welcomeSection: { padding: 20 },
  welcomeText: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  promptText: { fontSize: 18 },
  seasonText: { fontSize: 30, fontWeight: 'bold', marginBottom: 16 },
  seasonImagePlaceholder: { height: 150, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  seasonCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: 12, overflow: 'hidden', borderWidth: 1, padding: 14 },
  featureHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureDescription: { fontSize: 15, marginBottom: 16, lineHeight: 22 },
  featureButtonText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
});
const styles = { ...commonStyles, ...localStyles };