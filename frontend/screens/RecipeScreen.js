import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../themes/ThemeContext';
import useRecipes from '../hooks/useRecipes';
import useTranslation from '../hooks/useTranslation';
import { getItem } from '../auth/storage';
import { getIngredients } from '../config/api';
import { getUserFavoriteRecipes, addFavoriteRecipe, removeFavoriteRecipe } from '../config/api';
import { useIsFocused } from '@react-navigation/native';
import { filterRecipe } from '../lib/recipeFilters';
import FallbackImage from '../components/FallbackImage';
import commonStyles from '../themes/styles';


function RecipeCard({ recipe, theme, navigation, liked, onToggleFavorite, favLoading }) {
  const { t } = useTranslation();
  const removeLabel = t ? t('recipe.removeFromFavorites') : 'Remove from favorites';
  const saveLabel = t ? t('recipe.saveToFavorites') : 'Save to favorites';
  const viewLabel = t ? t('recipe.viewRecipe') : 'View Recipe';
  const subtitleFallback = t ? t('recipe.subtitle') : 'Discover delicious recipes featuring fresh garden ingredients';

  return (
    <View
      accessible={true}
      accessibilityLabel={`${recipe.name || recipe.title || ''}. ${recipe.description || ''}`}
      style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
    >
      <View style={styles.cardImageWrapper}>
        <FallbackImage
          sourceUrl={recipe.imageURL || recipe.image}
          type="recipe"
          id={recipe.id}
          style={styles.cardImage}
          accessibilityRole="image"
          accessibilityLabel={recipe.name || recipe.title}
        />
        <TouchableOpacity
          style={[styles.heartButton, { backgroundColor: theme.cardBg }]}
          onPress={() => onToggleFavorite(recipe.id)}
          accessibilityRole="button"
          accessibilityLabel={liked ? removeLabel : saveLabel}
          accessibilityHint={liked ? (t ? t('recipe.removeFromFavoritesA11y') : 'Removes this recipe from favorites') : (t ? t('recipe.saveToFavoritesA11y') : 'Save this recipe to your favorites')}
          accessibilityState={{ busy: !!favLoading, selected: !!liked }}
          disabled={favLoading}
          hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? theme.primary : theme.secondaryText} accessible={false} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text accessibilityRole="header" accessibilityLabel={recipe.name} style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{recipe.name}</Text>
        <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]} numberOfLines={3}>{recipe.description || subtitleFallback}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: theme.activeTabBg }]}> 
            <Ionicons name="time-outline" size={14} color={theme.primary} accessible={false} />
            <Text style={[styles.metaText, { color: theme.primary }]} accessibilityLabel={recipe.prepTime ? `${recipe.prepTime} ${t ? t('recipe.prepShort') : 'prep'}` : (t ? t('recipe.prepUnknown') : 'Prep?')}>{recipe.prepTime ? `${recipe.prepTime} ${t ? t('recipe.prepShort') : 'prep'}` : (t ? t('recipe.prepUnknown') : 'Prep?')}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: theme.activeTabBg }]}> 
            <Ionicons name="flame-outline" size={14} color={theme.primary} accessible={false} />
            <Text style={[styles.metaText, { color: theme.primary }]} accessibilityLabel={recipe.cookTime ? `${recipe.cookTime} ${t ? t('recipe.cookShort') : 'cook'}` : (t ? t('recipe.cookUnknown') : 'Cook?')}>{recipe.cookTime ? `${recipe.cookTime} ${t ? t('recipe.cookShort') : 'cook'}` : (t ? t('recipe.cookUnknown') : 'Cook?')}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation?.navigate('RecipeDetail', { id: recipe.id })}
          accessibilityRole="button"
          accessibilityLabel={viewLabel}
          accessibilityHint={t ? t('recipe.viewRecipeA11yHint') : 'Open recipe details'}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <Text style={styles.primaryButtonText}>{viewLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RecipeScreen({ navigation }) {
  const { theme } = useTheme();
  const { recipes, loading, error, reload } = useRecipes();
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const [favoritesIds, setFavoritesIds] = useState(new Set());
  const [favLoadingIds, setFavLoadingIds] = useState(new Set());
  const [allIngredients, setAllIngredients] = useState([]);
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [openIngredient, setOpenIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientFocused, setIngredientFocused] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userId = await getItem('user_id');
        if (!userId) return;
        const res = await getUserFavoriteRecipes(userId);
        const ids = Array.isArray(res) ? res.map(r => r.id) : (res?.map ? res.map(r => r.id) : []);
        if (mounted) setFavoritesIds(new Set(ids));
      } catch (err) {
        console.warn('Failed to load favorite recipes', err);
      }
    })();
    return () => { mounted = false; };
  }, [isFocused]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getIngredients();
        if (mounted && Array.isArray(res)) setAllIngredients(res);
      } catch (err) {
        console.warn('Failed to load ingredients', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const visibleIngredients = React.useMemo(() => {
    const q = (ingredientQuery || '').toString().toLowerCase();
    const list = Array.isArray(allIngredients) ? allIngredients : [];
    const filtered = q ? list.filter(i => (i.name || '').toString().toLowerCase().includes(q)) : list;
    return filtered.slice(0, 5);
  }, [allIngredients, ingredientQuery]);


  async function onToggleFavorite(recipeId) {
    const userId = await getItem('user_id');
    if (!userId) {
      Alert.alert(
        '',
        t ? t('auth.loginRequired') : 'You need to be logged in to add/favorite.',
        [
          { text: t ? t('login.signIn') : 'Login', onPress: () => navigation.navigate('Login') },
          { text: t ? t('common.continue') : 'Continue', style: 'cancel' },
        ],
      );
      return;
    }
    setFavLoadingIds(prev => new Set(prev).add(recipeId));
    try {
      if (favoritesIds.has(recipeId)) {
        await removeFavoriteRecipe(userId, recipeId);
        setFavoritesIds(prev => {
          const copy = new Set(prev);
          copy.delete(recipeId);
          return copy;
        });
      } else {
        await addFavoriteRecipe(userId, recipeId);
        setFavoritesIds(prev => new Set(prev).add(recipeId));
      }
    } catch (err) {
      console.warn('Failed to toggle favorite', err);
    } finally {
      setFavLoadingIds(prev => {
        const copy = new Set(prev);
        copy.delete(recipeId);
        return copy;
      });
    }
  }

  useEffect(() => {
    if (isFocused) reload();
  }, [isFocused, reload]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  };
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);

  const toggleFilter = (key) => setSelectedFilters((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const filteredRecipes = useMemo(() => recipes.filter((r) => filterRecipe(r, { search, selectedFilters })), [recipes, search, selectedFilters]);
  const filteredWithIngredient = useMemo(() => {
    let list = Array.isArray(filteredRecipes) ? filteredRecipes : [];
    if (!selectedIngredient) return list;
    const id = selectedIngredient.id;
    const name = (selectedIngredient.name || '').toLowerCase();
    return list.filter((rec) => {
      const quantities = rec.recipeQuantities || rec.quantities || rec.recipe_quantities || [];
      if (!Array.isArray(quantities) || quantities.length === 0) return false;
      return quantities.some((q) => {
        const ingr = q.ingredientResponse || q.ingredient || {};
        const ingrId = ingr?.id ?? ingr?.ingredientId ?? null;
        const ingrName = (ingr?.name || ingr?.ingredientName || '').toString().toLowerCase();
        if (id && ingrId) return Number(ingrId) === Number(id);
        if (name) return ingrName.includes(name);
        return false;
      });
    });
  }, [filteredRecipes, selectedIngredient]);

  const renderHeader = (
    <View>
      <AppHeader />
      <View style={styles.hero}>
        <View>
          <Text accessibilityRole="header" accessibilityLabel={t ? t('recipe.collectionTitle') : 'Recipe Collection'} style={[styles.title, { color: theme.text }]}>{t ? t('recipe.collectionTitle') : 'Recipe Collection'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={async () => {
            try {
              const userId = await getItem('user_id');
              if (userId) {
                navigation.navigate('Recipes', { screen: 'AddRecipe' });
              } else {
                Alert.alert(
                  '',
                  t ? t('auth.loginRequired') : 'You need to be logged in to add/favorite.',
                  [
                    { text: t ? t('login.signIn') : 'Login', onPress: () => navigation.navigate('Login') },
                    { text: t ? t('common.continue') : 'Continue', style: 'cancel' },
                  ],
                );
              }
            } catch (err) {
              console.warn('Failed to check login state before navigating to AddRecipe', err);
              navigation.navigate('Login');
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={t ? t('recipe.addRecipe') : 'Add Recipe'}
          accessibilityHint={t ? t('recipe.addRecipeA11yHint') : 'Requires sign in; opens login screen if not signed in'}
        >
          <Ionicons name="add" size={26} color="#fff" accessible={false} />
        </TouchableOpacity>
      </View>
            <View style={styles.subtitleSection}>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{t ? t('recipe.subtitle') : 'Discover delicious recipes featuring fresh garden ingredients'}</Text>
        </View>

      <View style={[styles.filterCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.filterHeader}>
          <View style={styles.filterHeaderLeft}>
            <View style={[styles.filterIconCircle, { backgroundColor: theme.activeTabBg }]}>
              <Ionicons name="funnel-outline" size={16} color={theme.primary} />
            </View>
              <Text style={[styles.filterTitle, { color: theme.text }]}>{t ? t('recipe.filterByCrop') : 'Filter'}</Text>
          </View>
            <TouchableOpacity onPress={() => { setSearch(''); setSelectedFilters([]); reload(); }} accessibilityRole="button" accessibilityLabel={t ? t('recipe.reset') : 'Reset'} accessibilityHint={t ? t('recipe.resetA11yHint') : 'Clears filters and search'} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
              <Text style={[styles.clearAll, { color: theme.primary }]}>{t ? t('recipe.reset') : 'Reset'}</Text>
            </TouchableOpacity>
        </View>

          <TextInput placeholder={t ? t('recipe.searchPlaceholder') : 'Search recipes...'} placeholderTextColor={theme.secondaryText} value={search} onChangeText={setSearch} style={[styles.searchInput, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]} accessibilityLabel={t ? t('recipe.searchPlaceholder') : 'Search recipes'} accessibilityHint={t ? t('recipe.searchA11yHint') : 'Type to filter the recipe list'} />

        <View style={{ marginTop: 8 }}>
          <View style={styles.dropdownWrapper}>
            <TextInput
              placeholder={t ? t('recipe.filterByIngredient') : 'Filter by ingredient...'}
              placeholderTextColor={theme.secondaryText}
              value={ingredientQuery}
              onChangeText={(v) => { setIngredientQuery(v); setSelectedIngredient(null); }}
              onFocus={() => { setIngredientFocused(true); }}
              style={[styles.searchInput, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]}
              accessibilityLabel={t ? t('recipe.filterByIngredient') : 'Filter by ingredient'}
              accessibilityHint={t ? t('recipe.filterByIngredientA11y') : 'Type to filter ingredients'}
            />

            
            {ingredientFocused && (
              <View style={[styles.inlineList, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
                {visibleIngredients.length === 0 ? (
                  <Text style={{ color: theme.secondaryText, padding: 8 }}>{t ? t('noMatches') : 'No ingredients'}</Text>
                ) : (
                  <>
                    <TouchableOpacity key="__close" onPress={() => setIngredientFocused(false)} style={styles.inlineItem} accessibilityRole="button" accessibilityLabel={'Hide list'}>
                      <Text style={{ color: theme.primary, paddingVertical: 8 }}>Hide list</Text>
                    </TouchableOpacity>
                    {visibleIngredients.map((ing) => (
                      <TouchableOpacity
                        key={ing.id}
                        onPressIn={() => {
                          setSelectedIngredient(ing);
                          setIngredientQuery(ing.name || '');
                          setIngredientFocused(false);
                          Keyboard.dismiss();
                        }}
                        style={styles.inlineItem}
                      >
                        <Text style={{ color: theme.text, paddingVertical: 8 }}>{ing.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) return (
    <ScrollView keyboardShouldPersistTaps="handled" style={[styles.container, { backgroundColor: theme.background }]}> 
      {renderHeader}
      <View style={styles.stateWrapper}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={{ color: theme.secondaryText, marginTop: 8 }}>{t ? t('recipe.loading') : 'Loading recipes…'}</Text>
      </View>
    </ScrollView>
  );

  if (error) return (
    <ScrollView keyboardShouldPersistTaps="handled" style={[styles.container, { backgroundColor: theme.background }]}> 
      {renderHeader}
      <View style={styles.stateWrapper}>
        <Ionicons name="alert-circle" size={32} color={theme.primary} accessible={false} />
        <Text style={{ color: theme.secondaryText, marginTop: 8 }} accessibilityLabel={error}>{error}</Text>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 12 }]} onPress={reload} accessibilityRole="button" accessibilityLabel={t ? t('tryAgain') : 'Try Again'} accessibilityHint={t ? t('tryAgainA11yHint') : 'Retries loading recipes'} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
          <Text style={styles.primaryButtonText}>{t ? t('tryAgain') : 'Try Again'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <FlatList
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={renderHeader}
        data={filteredWithIngredient}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            theme={theme}
            navigation={navigation}
            liked={favoritesIds.has(item.id)}
            favLoading={favLoadingIds.has(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        )}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={(
          <View style={styles.stateWrapper}>
            <Ionicons name="search-outline" size={32} color={theme.primary} accessible={false} />
            <Text style={{ color: theme.secondaryText, marginTop: 8 }} accessibilityLabel={t ? t('recipe.noFound') : 'No recipes found.'}>{t ? t('recipe.noFound') : 'No recipes found.'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  dropdownWrapper: { zIndex: 9999, elevation: 9999, position: 'relative' },
  inlineList: { borderWidth: 1, borderRadius: 10, marginTop: 8, overflow: 'hidden' },
  inlineItem: { paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  hero: { paddingTop: 20, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  subtitleSection: { paddingHorizontal: 20, paddingBottom: 12 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  addButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },
  addButtonText: { fontWeight: '600', fontSize: 15 },
  filterCard: { marginHorizontal: 20, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, padding: 14, gap: 10, marginBottom: 18, overflow: 'visible' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterIconCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  filterTitle: { fontSize: 17, fontWeight: '700' },
  clearAll: { fontWeight: '600' },
  filterPillsRow: { flexDirection: 'row', gap: 10 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  cardImageWrapper: { position: 'relative' },
  heartButton: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  cardBody: { padding: 14, gap: 10 },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  metaText: { fontSize: 14, fontWeight: '600' },
  stateWrapper: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 6 },
});
const styles = { ...commonStyles, ...localStyles };
