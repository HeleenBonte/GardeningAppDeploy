import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../themes/ThemeContext';
import { getUserFavoriteCrops, getUserFavoriteRecipes, removeFavoriteCrop, removeFavoriteRecipe } from '../config/api';
import { getItem } from '../auth/storage';

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
    if (item.harvestStart != null && item.harvestEnd != null) {
      const start = MONTHS[item.harvestStart] ?? item.harvestStart;
      const end = MONTHS[item.harvestEnd] ?? item.harvestEnd;
      harvestText = `Harvest: ${start} - ${end}`;
    } else if (item.harvestPeriod) harvestText = `Harvest: ${item.harvestPeriod}`;

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.cardImage} />
        ) : null}
        <View style={styles.cardBodyRow}>
          <View style={styles.cardTextCol}>
            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]} numberOfLines={2}>{subtitle}</Text> : null}
            {harvestText ? <Text style={[styles.harvestText, { color: theme.secondaryText }]} numberOfLines={1}>{harvestText}</Text> : null}
            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                if (mode === 'crops') {
                  navigation.navigate('Crops', { screen: 'CropDetail', params: { cropId: item.id, crop: item } });
                } else {
                  navigation.navigate('Recipes', { screen: 'RecipeDetail', params: { id: item.id } });
                }
              }}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardRightCol}>
            <TouchableOpacity
              style={[styles.heartOverlay, { backgroundColor: theme.primary }]}
              disabled={removingIds.has(item.id)}
              onPress={async () => {
                const id = item.id;
                if (!userId) return;
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
                <Ionicons name="heart" size={14} color="#fff" />
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
        <TouchableOpacity onPress={() => setMode('crops')} style={[styles.segment, mode === 'crops' ? { backgroundColor: theme.primary } : { backgroundColor: theme.imagePlaceholderBg }]}>
          <Text style={[styles.segmentText, mode === 'crops' ? { color: '#fff' } : { color: theme.text }]}>Crops</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('recipes')} style={[styles.segment, mode === 'recipes' ? { backgroundColor: theme.primary } : { backgroundColor: theme.imagePlaceholderBg }]}>
          <Text style={[styles.segmentText, mode === 'recipes' ? { color: '#fff' } : { color: theme.text }]}>Recipes</Text>
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
          ListEmptyComponent={<Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 24 }}>No favorites yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', padding: 12, borderBottomWidth: 1 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  segmentText: { fontWeight: '700' },
  card: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSubtitle: { fontSize: 13, marginTop: 4 },
  cardImage: { width: '100%', height: 140, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  cardBodyRow: { flexDirection: 'row', padding: 12, alignItems: 'flex-start' },
  cardTextCol: { flex: 1 },
  cardRightCol: { width: 40, alignItems: 'flex-end', paddingLeft: 8 },
  viewButton: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
  viewButtonText: { color: '#fff', fontWeight: '700' },
  harvestText: { fontSize: 12, marginTop: 6 },
  heartOverlay: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
