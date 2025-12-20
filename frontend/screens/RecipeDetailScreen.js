import React, { useEffect, useState } from 'react';
import { ScrollView, View, Image, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../themes/ThemeContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop';

import { getRecipeById, addFavoriteRecipe } from '../config/api';
import { getItem } from '../auth/storage';

export default function RecipeDetailScreen({ route, navigation }){
  const { theme } = useTheme();
  const { id } = route.params || {};
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const [favSaved, setFavSaved] = useState(false);

  async function handleSaveFavorite() {
    if (!recipe?.id) return;
    setFavLoading(true);
    try {
      const userId = await getItem('user_id');
      if (!userId) return;
      await addFavoriteRecipe(userId, recipe.id);
      setFavSaved(true);
    } catch (err) {
      console.warn('Failed to add favorite recipe', err);
    } finally {
      setFavLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    setLoading(true);
    setError(null);
    getRecipeById(id).then((r) => { if (mounted) setRecipe(r); }).catch((e) => { if (mounted) setError(e?.message || String(e)); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (!id) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <View style={styles.stateWrapper}>
        <Text style={{ color: theme.secondaryText }}>No recipe selected.</Text>
      </View>
    </ScrollView>
  );

  if (loading) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <View style={styles.stateWrapper}>
        <ActivityIndicator color={theme.primary} />
      </View>
    </ScrollView>
  );

  if (error) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <View style={styles.stateWrapper}>
        <Text style={{ color: theme.secondaryText }}>{error}</Text>
      </View>
    </ScrollView>
  );

  if (!recipe) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <View style={styles.stateWrapper}>
        <Text style={{ color: theme.secondaryText }}>Recipe not found.</Text>
      </View>
    </ScrollView>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <Image source={{ uri: recipe.imageURL || recipe.image || FALLBACK_IMAGE }} style={styles.heroImage} />

      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{recipe.name || recipe.recipeName}</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]} numberOfLines={2}>{recipe.description || recipe.recipeDescription}</Text>
          </View>
          <TouchableOpacity
            style={[styles.favButton, { backgroundColor: favSaved ? theme.primary : theme.primary }]}
            onPress={handleSaveFavorite}
            disabled={favLoading || favSaved}
          >
            <Text style={styles.favButtonText}>{favSaved ? 'Saved' : favLoading ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingredients</Text>
          {(() => {
            const list = recipe.recipeQuantities || recipe.quantities || recipe.recipe_quantities || [];
            if (!Array.isArray(list) || list.length === 0) return null;
            return list.map((q, i) => {
              const quantity = q.quantity ?? q.amount ?? q.qty ?? '';
              const measurement = q.measurement?.measurementName || q.measurement?.name || q.measurementName || q.measurementResponse?.name || q.measurementResponse?.measurementName || '';
              const ingredient = q.ingredient?.ingredientName || q.ingredient?.name || q.ingredientName || q.ingredientResponse?.name || q.ingredientResponse?.ingredientName || '';
              const parts = [quantity, measurement, ingredient].filter(Boolean).join(' ');
              return (
                <View key={i} style={styles.ingredientRow}>
                  <Text style={{ color: theme.text }}>{parts}</Text>
                </View>
              );
            });
          })()}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Instructions</Text>
          {(() => {
            const steps = recipe.recipeStepResponses || recipe.recipeSteps || recipe.steps || [];
            if (!Array.isArray(steps) || steps.length === 0) return null;
            return steps.map((s, idx) => (
              <View key={s.id ?? idx} style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: theme.activeTabBg }]}>
                  <Text style={{ color: theme.primary }}>{s.stepNumber ?? s.step_number ?? idx + 1}</Text>
                </View>
                <Text style={{ color: theme.secondaryText, flex: 1 }}>{s.description ?? s.step_description ?? s}</Text>
              </View>
            ));
          })()}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroImage: { width: '100%', height: 260 },
  card: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  metaText: { fontSize: 13, fontWeight: '600' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  ingredientRow: { paddingVertical: 6 },
  stepRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingVertical: 8 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stateWrapper: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }
  ,
  favButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
  favButtonText: { color: '#fff', fontWeight: '700' }
});
