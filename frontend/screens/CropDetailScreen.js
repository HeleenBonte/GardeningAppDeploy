import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';
import useCropDetail from '../hooks/useCropDetail';
import { addFavoriteCrop } from '../config/api';
import { getItem } from '../auth/storage';
import MONTHS, { isInRange } from '../lib/months';

export default function CropDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, currentSeason } = useTheme();

  const routeCrop = route.params?.crop ?? null;
  const cropId = route.params?.cropId ?? routeCrop?.id ?? null;
  const { crop, relatedRecipes, loading, error, reload } = useCropDetail({ id: cropId, initialCrop: routeCrop });

  // month helpers moved to ../lib/months.js


  function handleBack() {
    if (route.params?.onBack) route.params.onBack();
    else navigation.goBack();
  }

  function handleViewRecipe(id) {
    if (route.params?.onViewRecipe) route.params.onViewRecipe(id);
    else navigation.navigate('Recipes', { screen: 'RecipeDetail', params: { id } });
  }

  const [favLoading, setFavLoading] = React.useState(false);
  const [favSaved, setFavSaved] = React.useState(false);

  async function handleSaveFavorite() {
    if (!crop?.id) return;
    setFavLoading(true);
    try {
      // debug: check jwt presence
      const dbgToken = await getItem('jwt_token');
      if (__DEV__) console.log('[CropDetail] jwt present?', !!dbgToken, 'userId stored?', await getItem('user_id'));
      const userId = await getItem('user_id');
      if (!userId) return;
      await addFavoriteCrop(userId, crop.id);
      setFavSaved(true);
    } catch (err) {
      console.warn('Failed to add favorite crop', err);
      // optional: show inline error or toast; keep simple for now
    } finally {
      setFavLoading(false);
    }
  }

  if (loading) return (
    <View style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={{ color: theme.secondaryText, marginTop: 8 }}>Loading crop…</Text>
    </View>
  );

  if (error) return (
    <View style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 16 }]}>
      <Text style={{ color: theme.secondaryText, marginBottom: 12 }}>{String(error)}</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary, paddingHorizontal: 16 }]} onPress={reload}>
        <Text style={styles.viewButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeCardContainer}>
      <View style={[styles.recipeCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Image source={{ uri: item.imageURL || item.image }} style={styles.recipeImage} />
        <View style={styles.recipeBody}>
          <Text style={[styles.recipeTitle, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.recipeDesc, { color: theme.secondaryText }]} numberOfLines={2}>{item.description || (item.recipeQuantities ? item.recipeQuantities.map(q => q.ingredientResponse?.name).filter(Boolean).join(', ') : '')}</Text>
          <View style={styles.recipeMeta}>
            <Text style={[styles.metaLabel, { color: theme.text }]}>Prep: </Text>
            <Text style={[styles.metaText, { color: theme.secondaryText }]}>{item.prepTime}</Text>
            <Text style={[styles.metaLabel, { color: theme.text }, { marginLeft: 8 }]}>Cook: </Text>
            <Text style={[styles.metaText, { color: theme.secondaryText }]}>{item.cookTime}</Text>
          </View>
          <TouchableOpacity style={[styles.viewButton, { backgroundColor: theme.primary }]} onPress={() => handleViewRecipe(item.id)}>
            <Text style={styles.viewButtonText}>View Recipe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <View style={styles.content}>

          <Image source={{ uri: crop?.image }} style={styles.cropImage} />
          <View style={styles.titleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.title, { color: theme.text }]}>{crop.name}</Text>

            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.favButton, { backgroundColor: favSaved ? theme.primary : theme.primary }]}
                onPress={handleSaveFavorite}
                disabled={favLoading || favSaved}
              >
                <Text style={styles.favButtonText}>{favSaved ? 'Saved' : favLoading ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        <View style={styles.infoCol}>


          <Text style={[styles.description, { color: theme.secondaryText }]}>{crop.cropDescription}</Text>

          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.text }]}>Sowing Period</Text>
              <View style={styles.monthsRow}>
                {MONTHS.map((m, i) => {
                  const active = isInRange(i, crop.sowingStart, crop.sowingEnd);
                  return (
                    <View
                      key={m}
                      style={[styles.monthBox, { backgroundColor: active ? theme.seasonCardBg : theme.imagePlaceholderBg }]}
                    >
                      <Text style={[styles.monthText, { color: active ? theme.primary : theme.secondaryText }]}>{m}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.text }]}>Planting Period</Text>
              <View style={styles.monthsRow}>
                {MONTHS.map((m, i) => {
                  const active = isInRange(i, crop.plantingStart, crop.plantingEnd);
                  return (
                    <View
                      key={m}
                      style={[styles.monthBox, { backgroundColor: active ? theme.seasonCardBg : theme.imagePlaceholderBg }]}
                    >
                      <Text style={[styles.monthText, { color: active ? theme.primary : theme.secondaryText }]}>{m}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.text }]}>Harvest Period</Text>
              <View style={styles.monthsRow}>
                {MONTHS.map((m, i) => {
                  const active = isInRange(i, crop.harvestStart, crop.harvestEnd);
                  return (
                    <View
                      key={m}
                      style={[styles.monthBox, { backgroundColor: active ? theme.seasonCardBg : theme.imagePlaceholderBg }]}
                    >
                      <Text style={[styles.monthText, { color: active ? theme.primary : theme.secondaryText }]}>{m}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

      <View style={[styles.card, { backgroundColor: theme.seasonCardBg , borderColor: theme.cardBorder }, { borderLeftWidth: 4, borderLeftColor: theme.primary }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Growing locations</Text>
        <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>Where can you grow this crop</Text>
        <View style={styles.cardContent}>
          <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.inHouse ? '- This plant can be grown indoors' : '- This plant cannot be grown indoors'}</Text>
          <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.inGarden ? '- This plant can be grown in a garden' : '- This plant cannot be grown in a garden'}</Text>
          <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.inGreenhouse ? '- This plant can be grown in a greenhouse' : '- This plant cannot be grown in a greenhouse'}</Text>
          <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.inPots ? '- This plant can be grown in pots' : '- This plant cannot be grown in pots'}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.seasonCardBg , borderColor: theme.cardBorder }, { borderLeftWidth: 4, borderLeftColor: theme.primary }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Tips & Tricks</Text>
        <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>Expert advice for the best results</Text>
        <View style={styles.cardContent}>
              <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.cropTips}</Text>
        </View>
      </View>

      {relatedRecipes.length > 0 && (
        <View style={[styles.recipesSection, { borderTopWidth: 2, borderTopColor: theme.primary, paddingTop: 8 }]}> 
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recipes Using {crop.name} {crop.emoji ?? ''}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>Delicious ways to use your fresh harvest</Text>
        </View>
      )}
    </View>
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      data={relatedRecipes}
      keyExtractor={(r) => String(r.id)}
      renderItem={renderRecipeItem}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListHeader}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backButton: {},
  backText: { color: '#0f172a', fontSize: 16 },
  topGrid: { flexDirection: 'row', gap: 12 },
  cropImage: { aspectRatio: 4 / 3, borderRadius: 12, marginRight: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#071126' },
  description: { marginTop: 8, marginBottom: 12, color: '#334155' },
  timeline: { marginTop: 4 },
  timelineItem: { marginBottom: 8 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  timelineValue: { fontSize: 13, color: '#475569' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#e6eef6' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#071126' },
  cardSubtitle: { fontSize: 13, color: '#475569', marginBottom: 8 },
  cardContent: { marginTop: 4 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  listText: { flex: 1, color: '#475569' },
  recipesSection: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4, color: '#071126' },
  sectionSubtitle: { fontSize: 13, color: '#475569'},
  recipeRow: { justifyContent: 'space-between' },
  recipeCard: { borderRadius: 10, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#e6eef6' },
  recipeCardContainer: { paddingHorizontal: 16 },
  recipeImage: { width: '100%', height: 120 },
  recipeBody: { padding: 8 },
  recipeTitle: { fontSize: 14, fontWeight: '700', color: '#071126' },
  recipeDesc: { fontSize: 12, color: '#475569', marginTop: 4 },
  recipeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaLabel: { fontWeight: '600', color: '#071126', fontSize: 12 },
  metaText: { color: '#475569', fontSize: 12 },
  monthsRow: { flexDirection: 'row', marginTop: 8, flexWrap: 'nowrap' },
  monthBox: { width: 26, height: 20, borderRadius: 6, marginRight: 6, alignItems: 'center', justifyContent: 'center' },
  monthText: { fontSize: 10, fontWeight: '700' },
  viewButton: { 		alignSelf: 'flex-start',
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 6, },
  viewButtonText: { 		color: '#fff',
		fontWeight: '600', },
  textLight: { color: '#e6eef6' },
  textMutedLight: { color: '#aab6c2' },
  favButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
  favButtonText: { color: '#fff', fontWeight: '700' },
});
