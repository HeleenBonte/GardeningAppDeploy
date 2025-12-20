import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../themes/ThemeContext';
import useRecipes from '../hooks/useRecipes';
import { getItem } from '../auth/storage';
import { getUserFavoriteRecipes, addFavoriteRecipe, removeFavoriteRecipe } from '../config/api';
import { useIsFocused } from '@react-navigation/native';
import { filterRecipe } from '../lib/recipeFilters';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop';

const cropFilters = [
  { key: 'tomato', label: 'Tomatoes' },
  { key: 'carrot', label: 'Carrots' },
  { key: 'basil', label: 'Basil' },
  { key: 'lettuce', label: 'Lettuce' },
];

function RecipeCard({ recipe, theme, navigation, liked, onToggleFavorite, favLoading }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={styles.cardImageWrapper}>
        <Image source={{ uri: recipe.imageURL || recipe.image || FALLBACK_IMAGE }} style={styles.cardImage} />
        <TouchableOpacity
          style={[styles.heartButton, { backgroundColor: theme.cardBg }]}
          onPress={() => onToggleFavorite(recipe.id)}
          accessibilityLabel={liked ? 'Remove from favorites' : 'Save to favorites'}
          disabled={favLoading}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? theme.primary : theme.secondaryText} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{recipe.name}</Text>
        <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]} numberOfLines={3}>{recipe.description || 'Fresh from the garden and ready for the table.'}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: theme.activeTabBg }]}> 
            <Ionicons name="time-outline" size={14} color={theme.primary} />
            <Text style={[styles.metaText, { color: theme.primary }]}>{recipe.prepTime ? `${recipe.prepTime} prep` : 'Prep?'}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: theme.activeTabBg }]}> 
            <Ionicons name="flame-outline" size={14} color={theme.primary} />
            <Text style={[styles.metaText, { color: theme.primary }]}>{recipe.cookTime ? `${recipe.cookTime} cook` : 'Cook?'}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={() => navigation?.navigate('RecipeDetail', { id: recipe.id })} accessibilityLabel="View recipe details">
          <Text style={styles.primaryButtonText}>View Recipe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RecipeScreen({ navigation }) {
  const { theme } = useTheme();
  const { recipes, loading, error, reload } = useRecipes();
  const isFocused = useIsFocused();

  const [favoritesIds, setFavoritesIds] = useState(new Set());
  const [favLoadingIds, setFavLoadingIds] = useState(new Set());

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

  async function onToggleFavorite(recipeId) {
    const userId = await getItem('user_id');
    if (!userId) return;
    // set loading
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

  const renderHeader = (
    <View style={styles.header}>
      <AppHeader />
      <View style={styles.hero}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Recipe Collection</Text>
        </View>
        <TouchableOpacity style={[styles.addButton, { borderColor: theme.primary }]} onPress={() => navigation.navigate('Recipes', { screen: 'AddRecipe' })}> 
          <Ionicons name="add" size={18} color={theme.primary} />
          <Text style={[styles.addButtonText, { color: theme.primary }]}>Add Recipe</Text>
        </TouchableOpacity>
      </View>
            <View style={styles.subtitleSection}>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Discover delicious recipes featuring fresh garden ingredients</Text>
        </View>

      <View style={[styles.filterCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.filterHeader}>
          <View style={styles.filterHeaderLeft}>
            <View style={[styles.filterIconCircle, { backgroundColor: theme.activeTabBg }]}>
              <Ionicons name="funnel-outline" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.filterTitle, { color: theme.text }]}>Filter by Crop</Text>
          </View>
          <TouchableOpacity onPress={() => { setSearch(''); setSelectedFilters([]); reload(); }}>
            <Text style={[styles.clearAll, { color: theme.primary }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <TextInput placeholder="Search recipes..." placeholderTextColor={theme.secondaryText} value={search} onChangeText={setSearch} style={[styles.searchInput, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, borderColor: theme.cardBorder }]} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          {cropFilters.map((filter) => {
            const active = selectedFilters.includes(filter.key);
            return (
              <TouchableOpacity key={filter.key} style={[styles.filterPill, active && { backgroundColor: theme.activeTabBg, borderColor: theme.primary }]} onPress={() => toggleFilter(filter.key)}>
                <Text style={{ color: active ? theme.primary : theme.secondaryText }}>{filter.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  if (loading) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader}
      <View style={styles.stateWrapper}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={{ color: theme.secondaryText, marginTop: 8 }}>Loading recipes…</Text>
      </View>
    </ScrollView>
  );

  if (error) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader}
      <View style={styles.stateWrapper}>
        <Ionicons name="alert-circle" size={32} color={theme.primary} />
        <Text style={{ color: theme.secondaryText, marginTop: 8 }}>{error}</Text>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 12 }]} onPress={reload}>
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.background }]}
      data={filteredRecipes}
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
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={(
        <View style={styles.stateWrapper}>
          <Ionicons name="search-outline" size={32} color={theme.primary} />
          <Text style={{ color: theme.secondaryText, marginTop: 8 }}>No recipes found.</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 24 },
  header: { paddingBottom: 12, gap: 12 },
  hero: { paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  title: { padding: 8, fontSize: 22, fontWeight: '700' },
  subtitleSection: { paddingHorizontal: 20, paddingBottom: 12 },
  subtitle: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  addButtonText: { fontWeight: '600', fontSize: 14 },
  filterCard: { marginHorizontal: 20, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterIconCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  filterTitle: { fontSize: 16, fontWeight: '700' },
  clearAll: { fontWeight: '600' },
  searchInput: { height: 44, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1 },
  filterPillsRow: { flexDirection: 'row', gap: 10 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  card: { marginHorizontal: 20, marginBottom: 14, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  cardImageWrapper: { position: 'relative' },
  cardImage: { width: '100%', height: 180 },
  heartButton: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  cardBody: { padding: 14, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSubtitle: { fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  metaText: { fontSize: 13, fontWeight: '600' },
  primaryButton: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFF', fontWeight: '700' },
  stateWrapper: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 6 },
});
