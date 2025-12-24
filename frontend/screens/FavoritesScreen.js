import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../themes/ThemeContext';
import commonStyles from '../themes/styles';
import { getUserFavoriteCrops, getUserFavoriteRecipes, removeFavoriteCrop, removeFavoriteRecipe } from '../config/api';
import { getItem } from '../auth/storage';
import FallbackImage from '../components/FallbackImage';
import useTranslation from '../hooks/useTranslation';

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [mode, setMode] = useState('crops');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [userId, setUserId] = useState(null);
  const isFocused = useIsFocused();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const id = await getItem('user_id');
      if (!id) {
        navigation.navigate('Login');
        return;
      }
      setUserId(id);
    })();
  }, []);

  async function loadItems(useLoading = true) {
    if (!userId) return;
    try {
      if (useLoading) setLoading(true);
      else setRefreshing(true);

      if (mode === 'crops') {
        const res = await getUserFavoriteCrops(userId);
        setItems(Array.isArray(res) ? res : (res?.content ?? []));
      } else {
        const res = await getUserFavoriteRecipes(userId);
        setItems(Array.isArray(res) ? res : (res?.content ?? []));
      }
    } catch (err) {
      console.warn('Failed to load favorites', err);
    } finally {
      if (useLoading) setLoading(false);
      else setRefreshing(false);
    }
  }

  useEffect(() => {
    loadItems(true);
  }, [mode, userId]);

  useEffect(() => {
    if (isFocused) loadItems(false);
  }, [isFocused]);

  function renderItem({ item }) {
    const title = item.name || item.title || item.recipeName || item.userName || '';
    const subtitle = item.description || item.cropDescription || item.recipeDescription || '';
    const imageUri = item.image || item.imageURL || null;
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    let harvestText = '';
    const harvestLabel = t ? t('favorites.harvestLabel') : 'Harvest:';
    if (item.harvestStart != null && item.harvestEnd != null) {
      const start = MONTHS[item.harvestStart] ?? item.harvestStart;
      const end = MONTHS[item.harvestEnd] ?? item.harvestEnd;
      harvestText = `${harvestLabel} ${start} - ${end}`;
    } else if (item.harvestPeriod) harvestText = `${harvestLabel} ${item.harvestPeriod}`;

    return (
      <View
        accessible={true}
        accessibilityLabel={`${title}${subtitle ? '. ' + subtitle : ''}${harvestText ? '. ' + harvestText : ''}`}
        style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
      >
        <FallbackImage
          sourceUrl={imageUri}
          type={mode === 'crops' ? 'crop' : 'recipe'}
          id={item.id}
          style={styles.cardImage}
          accessibilityRole="image"
          accessibilityLabel={title}
        />
        <View style={styles.cardBodyRow}>
          <View style={styles.cardTextCol}>
            <Text accessibilityRole="header" accessibilityLabel={title} style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]} numberOfLines={2}>{subtitle}</Text> : null}
            {harvestText ? <Text style={[styles.harvestText, { color: theme.secondaryText }]} numberOfLines={1}>{harvestText}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, styles.buttonSpacing, { backgroundColor: theme.primary }]}
              accessibilityRole="button"
              accessibilityLabel={t ? t('crop.viewDetails') : 'View Details'}
              accessibilityHint={t ? t('crop.viewDetailsA11yHint') : 'Open details for this item'}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              onPress={() => {
                if (mode === 'crops') {
                  navigation.navigate('Crops', { screen: 'CropDetail', params: { cropId: item.id, crop: item } });
                } else {
                  navigation.navigate('Recipes', { screen: 'RecipeDetail', params: { id: item.id } });
                }
              }}
            >
              <Text style={styles.primaryButtonText}>{t ? t('crop.viewDetails') : 'View Details'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardRightCol}>
            <TouchableOpacity
              style={[styles.heartOverlay, { backgroundColor: theme.primary }]}
              accessibilityRole="button"
              accessibilityState={{ busy: removingIds.has(item.id) }}
              accessibilityLabel={removingIds.has(item.id) ? (t ? t('recipe.saving') : 'Saving…') : (t ? t('recipe.removeFromFavorites') : 'Remove from favorites')}
              accessibilityHint={t ? t('favorites.removeA11yHint') : 'Removes this item from your favorites'}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              disabled={removingIds.has(item.id)}
              onPress={async () => {
                const id = item.id;
                if (!userId) {
                  navigation.navigate('Login');
                  return;
                }
                setRemovingIds(prev => new Set(prev).add(id));
                try {
                  if (mode === 'crops') await removeFavoriteCrop(userId, id);
                  else await removeFavoriteRecipe(userId, id);
                  setItems(prev => prev.filter(i => String(i.id) !== String(id)));
                } catch (err) {
                  console.warn('Failed to remove favorite', err);
                } finally {
                  setRemovingIds(prev => {
                    const copy = new Set(prev);
                    copy.delete(id);
                    return copy;
                  });
                }
              }}
            >
              {removingIds.has(item.id) ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="heart" size={14} color="#fff" accessible={false} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader />
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity
          onPress={() => setMode('crops')}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'crops' }}
          accessibilityLabel={t ? t('favorites.crops') : 'Crops'}
          accessibilityHint={t ? t('favorites.crops') : 'Show favorite crops'}
          style={[styles.segment, mode === 'crops' ? { backgroundColor: theme.primary } : { backgroundColor: theme.imagePlaceholderBg }]}
        >
          <Text style={[styles.segmentText, mode === 'crops' ? { color: '#fff' } : { color: theme.text }]}>{t ? t('favorites.crops') : 'Crops'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('recipes')}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === 'recipes' }}
          accessibilityLabel={t ? t('favorites.recipes') : 'Recipes'}
          accessibilityHint={t ? t('favorites.recipes') : 'Show favorite recipes'}
          style={[styles.segment, mode === 'recipes' ? { backgroundColor: theme.primary } : { backgroundColor: theme.imagePlaceholderBg }]}
        >
          <Text style={[styles.segmentText, mode === 'recipes' ? { color: '#fff' } : { color: theme.text }]}>{t ? t('favorites.recipes') : 'Recipes'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 12 }}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={() => loadItems(false)}
          ListEmptyComponent={<Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 24 }}>{t ? t('favorites.noFavorites') : 'No favorites yet.'}</Text>}
        />
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  cardBodyRow: { flexDirection: 'row', padding: 12, alignItems: 'flex-start' },
  cardTextCol: { flex: 1 },
  cardRightCol: { width: 40, alignItems: 'flex-end', paddingLeft: 8 },
  cardTitle: { marginBottom: 6 },
  cardSubtitle: { marginTop: 4 },
  buttonSpacing: { marginTop: 10 },
  harvestText: { fontSize: 13, marginTop: 6 },
});
const styles = { ...commonStyles, ...localStyles };
