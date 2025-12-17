import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import sampleCrops from '../data/sampleCrops';

export default function CropDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();

  const crop = route.params?.crop ?? sampleCrops[0];
  const relatedRecipes = route.params?.relatedRecipes ?? (crop.recipes || []);

  function handleBack() {
    if (route.params?.onBack) route.params.onBack();
    else navigation.goBack();
  }

  function handleViewRecipe(id) {
    if (route.params?.onViewRecipe) route.params.onViewRecipe(id);
    else navigation.navigate('Recipe', { recipeId: id });
  }

  const renderRecipeItem = ({ item }) => (
    <View style={[styles.recipeCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeBody}>
        <Text style={[styles.recipeTitle, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.recipeDesc, { color: theme.secondaryText }]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.recipeMeta}>
          <Text style={[styles.metaLabel, { color: theme.text }]}>Prep: </Text>
          <Text style={[styles.metaText, { color: theme.secondaryText }]}>{item.prepTime}</Text>
          <Text style={[styles.metaLabel, { color: theme.text }, { marginLeft: 8 }]}>Cook: </Text>
          <Text style={[styles.metaText, { color: theme.secondaryText }]}>{item.cookTime}</Text>
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => handleViewRecipe(item.id)}>
          <Text style={styles.viewButtonText}>View Recipe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.text }]}>← Back to Crops</Text>
        </TouchableOpacity>
      </View>


        <Image source={{ uri: crop.image }} style={styles.cropImage} />
          <View style={styles.titleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.title, { color: theme.text }]}>{crop.name}</Text>
            </View>
          </View>
        <View style={styles.infoCol}>


          <Text style={[styles.description, { color: theme.secondaryText }]}>{crop.description}</Text>

          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.text }]}>Sowing Period</Text>
              <Text style={[styles.timelineValue, { color: theme.secondaryText }]}>{crop.sowPeriod}</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.text }]}>Planting Period</Text>
              <Text style={[styles.timelineValue, { color: theme.secondaryText }]}>{crop.plantPeriod}</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.text }]}>Harvest Period</Text>
              <Text style={[styles.timelineValue, { color: theme.secondaryText }]}>{crop.harvestPeriod}</Text>
            </View>
          </View>
        </View>


      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Maintenance Guide</Text>
        <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>Essential care instructions for healthy plants</Text>
        <View style={styles.cardContent}>
          {Array.isArray(crop.maintenance) && crop.maintenance.map((m, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={[styles.bullet, { color: theme.text }]}>•</Text>
              <Text style={[styles.listText, { color: theme.secondaryText }]}>{m}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Tips & Tricks</Text>
        <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>Expert advice for the best results</Text>
        <View style={styles.cardContent}>
          {Array.isArray(crop.tips) && crop.tips.map((t, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={[styles.bullet, { color: theme.text }]}>•</Text>
              <Text style={[styles.listText, { color: theme.secondaryText }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {relatedRecipes.length > 0 && (
        <View style={[styles.recipesSection, styles.content]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recipes Using {crop.name} {crop.emoji ?? ''}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>Delicious ways to use your fresh harvest</Text>
        </View>
      )}
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
  emoji: { fontSize: 22, marginLeft: 6 },
  description: { marginTop: 8, marginBottom: 12, color: '#334155' },
  timeline: { marginTop: 4 },
  timelineItem: { marginBottom: 8 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  timelineValue: { fontSize: 13, color: '#475569' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#e6eef6' },
  cardDark: { backgroundColor: '#071426', borderColor: '#1f2b3a' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#071126' },
  cardSubtitle: { fontSize: 13, color: '#475569', marginBottom: 8 },
  cardContent: { marginTop: 4 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { width: 18, fontSize: 16, color: '#0f172a' },
  listText: { flex: 1, color: '#475569' },
  recipesSection: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4, color: '#071126' },
  sectionSubtitle: { fontSize: 13, color: '#475569', marginBottom: 12 },
  recipeRow: { justifyContent: 'space-between' },
  recipeCard: { borderRadius: 10, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#e6eef6' },
  recipeImage: { width: '100%', height: 120 },
  recipeBody: { padding: 8 },
  recipeTitle: { fontSize: 14, fontWeight: '700', color: '#071126' },
  recipeDesc: { fontSize: 12, color: '#475569', marginTop: 4 },
  recipeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaLabel: { fontWeight: '600', color: '#071126', fontSize: 12 },
  metaText: { color: '#475569', fontSize: 12 },
  viewButton: { marginTop: 8, backgroundColor: '#16a34a', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  viewButtonDark: { backgroundColor: '#0b9b3a' },
  viewButtonText: { color: '#fff', fontWeight: '700' },
  textLight: { color: '#e6eef6' },
  textMutedLight: { color: '#aab6c2' },
});
