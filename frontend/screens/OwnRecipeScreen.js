import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';
import { getItem } from '../auth/storage';
import { getRecipes } from '../config/api';
import useTranslation from '../hooks/useTranslation';
import FallbackImage from '../components/FallbackImage';
import commonStyles from '../themes/styles';

export default function OwnRecipeScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userIdStr = await getItem('user_id');
        if (!userIdStr) {
          if (mounted) setRecipes([]);
          return;
        }
        const userId = Number(userIdStr);
        const all = await getRecipes();
        const mine = Array.isArray(all) ? all.filter(r => Number(r?.authorId) === Number(userId)) : [];
        if (mounted) setRecipes(mine);
      } catch (err) {
        console.warn('Failed to load own recipes', err);
        if (mounted) setRecipes([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={styles.cardImageWrapper}>
        <FallbackImage
          sourceUrl={item.imageURL || item.image}
          type="recipe"
          id={item.id}
          style={styles.cardImage}
          accessibilityRole="image"
          accessibilityLabel={item.name || item.title}
        />
      </View>
      <View style={styles.cardBody}>
        <Text accessibilityRole="header" accessibilityLabel={item.name} style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]} numberOfLines={3} accessibilityLabel={item.description || ''}>{item.description || ''}</Text>
        <View style={styles.row}> 
          <TouchableOpacity
            style={[styles.viewButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation?.navigate('Main', { screen: 'Recipes', params: { screen: 'RecipeDetail', params: { id: item.id } } })}
            accessibilityRole="button"
            accessibilityLabel={t ? t('recipe.viewRecipe') : 'View recipe'}
            accessibilityHint={t ? t('recipe.viewRecipeA11yHint') : 'Open recipe details'}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <Text style={styles.viewButtonText}>{t ? t('view') : 'View'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <View style={styles.stateWrapper}><ActivityIndicator size="large" color={theme.primary} /></View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <View style={styles.headerWrap}>
        <Text style={[styles.title, { color: theme.text }]}>{t ? t('account.createdRecipes') : 'Recipes Created'}</Text>
      </View>
      <FlatList
        data={recipes}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}><Text style={{ color: theme.secondaryText }} accessibilityLabel={t ? t('account.trackActivity') : 'No recipes found'}>{t ? t('account.trackActivity') : 'No recipes found'}</Text></View>
        )}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  stateWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  emptyWrap: { padding: 20, alignItems: 'center' }
});
const styles = { ...commonStyles, ...localStyles };
