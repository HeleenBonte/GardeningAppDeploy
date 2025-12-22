import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../themes/ThemeContext';
import unitConverter, { UnitSystem } from '../lib/unitConverter';
import useUnitPreference from '../hooks/useUnitPreference';
import useTranslation from '../hooks/useTranslation';

import { getRecipeById, addFavoriteRecipe, removeFavoriteRecipe, getUserFavoriteRecipes } from '../config/api';
import { getItem } from '../auth/storage';
import { navigationRef } from '../config/AppNavigator';
import FallbackImage from '../components/FallbackImage';
import commonStyles from '../themes/styles';

export default function RecipeDetailScreen({ route, navigation }){
  const { theme } = useTheme();
  const { id } = route.params || {};
  const { t } = useTranslation();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const [favSaved, setFavSaved] = useState(false);
  const { unitSystem } = useUnitPreference();

  async function handleSaveFavorite() {
    if (!recipe?.id) return;
    setFavLoading(true);
    try {
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
        setFavLoading(false);
        return;
      }
      if (favSaved) {
        await removeFavoriteRecipe(userId, recipe.id);
        setFavSaved(false);
      } else {
        await addFavoriteRecipe(userId, recipe.id);
        setFavSaved(true);
      }
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

  // Close detail if the screen loses focus (e.g., user switches tabs)
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      try {
        handleClose();
      } catch (e) {
        // ignore
      }
    });
    return unsub;
  }, [navigation]);

  // determine whether this recipe is already saved by the current user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userId = await getItem('user_id');
        if (!userId || !recipe?.id) return;
        const res = await getUserFavoriteRecipes(userId);
        const ids = Array.isArray(res) ? res.map(r => r.id) : (res?.map ? res.map(r => r.id) : []);
        if (mounted) setFavSaved(ids.includes(recipe.id));
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [recipe?.id]);

  if (!id) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={handleClose} />
      <View style={styles.stateWrapper}>
        <Text style={{ color: theme.secondaryText }}>{t ? t('recipeDetail.noSelected') : 'No recipe selected.'}</Text>
      </View>
    </ScrollView>
  );

  if (loading) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={handleClose} />
      <View style={styles.stateWrapper}>
        <ActivityIndicator color={theme.primary} />
      </View>
    </ScrollView>
  );

  if (error) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={handleClose} />
      <View style={styles.stateWrapper}>
        <Text style={{ color: theme.secondaryText }}>{error}</Text>
      </View>
    </ScrollView>
  );

  if (!recipe) return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={handleClose} />
      <View style={styles.stateWrapper}>
        <Text style={{ color: theme.secondaryText }}>{t ? t('recipeDetail.notFound') : 'Recipe not found.'}</Text>
      </View>
    </ScrollView>
  );

  function handleClose() {
    try {
      if (navigation?.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
    } catch (e) { /* ignore */ }

    if (__DEV__) console.debug('[RecipeDetail] handleClose no back history, attempting to reset app/root to RecipesList');

    // Strong action: reset root to Main -> Recipes -> RecipesList so nested stack can't reopen RecipeDetail
    try {
      if (navigationRef && navigationRef.isReady && navigationRef.isReady()) {
        navigationRef.resetRoot({
          index: 0,
          routes: [
            {
              name: 'Main',
              state: {
                index: 0,
                routes: [
                  {
                    name: 'Recipes',
                    state: {
                      index: 0,
                      routes: [{ name: 'RecipesList' }]
                    }
                  }
                ]
              }
            }
          ]
        });
        return;
      }
    } catch (e) { /* ignore */ }

    // If resetRoot isn't available, try switching tabs via parent (jumpTo preferable)
    try {
      const parent = navigation.getParent && navigation.getParent();
      if (parent) {
        if (__DEV__) console.debug('[RecipeDetail] parent navigator found, trying jumpTo Recipes');
        if (parent.jumpTo) {
          parent.jumpTo('Recipes');
          // ensure nested stack shows list instead of previous detail
          try { parent.navigate('Recipes', { screen: 'RecipesList' }); } catch (_) {}
          return;
        }
        if (parent.navigate) {
          parent.navigate('Recipes', { screen: 'RecipesList' });
          return;
        }
      }
    } catch (e) { /* ignore */ }

    // Final fallbacks
    try { navigation.navigate('Recipes', { screen: 'RecipesList' }); return; } catch (e) { /* ignore */ }
    try { navigation.navigate('Main'); } catch (e) { /* ignore */ }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <AppHeader rightIcon="close" onRightPress={handleClose} />
      <View style={styles.content}>
      <FallbackImage
        sourceUrl={recipe.imageURL || recipe.image}
        type="recipe"
        id={recipe.id}
        style={styles.heroImage}
        accessibilityRole="image"
        accessibilityLabel={t ? (t('recipeDetail.imageA11y') || `${recipe.name} image`) : `${recipe.name} image`}
      />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text accessibilityRole="header" accessibilityLabel={recipe.name || recipe.recipeName} style={[styles.title, { color: theme.text, marginBottom: 6 }]} numberOfLines={2}>{recipe.name || recipe.recipeName}</Text>
            <Text
              style={[styles.subtitle, { color: theme.secondaryText, marginBottom: 8 }]}
              numberOfLines={2}
              accessibilityLabel={recipe.description || recipe.recipeDescription}
            >
              {recipe.description || recipe.recipeDescription}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.favButton, { backgroundColor: favSaved ? theme.primary : theme.primary }]}
            onPress={handleSaveFavorite}
            disabled={favLoading}
            accessibilityRole="button"
            accessibilityLabel={favSaved ? (t ? t('recipeDetail.saved') : 'Saved') : (t ? t('recipeDetail.save') : 'Save')}
            accessibilityState={{ busy: !!favLoading, selected: !!favSaved }}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Text style={styles.favButtonText}>{favSaved ? (t ? t('recipeDetail.saved') : 'Saved') : favLoading ? (t ? t('recipeDetail.saving') : 'Saving…') : (t ? t('recipeDetail.save') : 'Save')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: theme.activeTabBg, padding: 8 }]}> 
            <Ionicons name="time-outline" size={14} color={theme.primary} accessible={false} />
            <Text style={[styles.metaText, { color: theme.primary }]} accessibilityLabel={recipe.prepTime ? `${recipe.prepTime} ${t ? t('recipeDetail.prepShort') : 'prep'}` : (t ? t('recipeDetail.prepUnknown') : 'Prep?')}>{recipe.prepTime ? `${recipe.prepTime} ${t ? t('recipeDetail.prepShort') : 'prep'}` : (t ? t('recipeDetail.prepUnknown') : 'Prep?')}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: theme.activeTabBg, padding: 8 }]}> 
            <Ionicons name="flame-outline" size={14} color={theme.primary} accessible={false} />
            <Text style={[styles.metaText, { color: theme.primary }]} accessibilityLabel={recipe.cookTime ? `${recipe.cookTime} ${t ? t('recipeDetail.cookShort') : 'cook'}` : (t ? t('recipeDetail.cookUnknown') : 'Cook?')}>{recipe.cookTime ? `${recipe.cookTime} ${t ? t('recipeDetail.cookShort') : 'cook'}` : (t ? t('recipeDetail.cookUnknown') : 'Cook?')}</Text>
          </View>
        </View>
    </View>
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, marginTop: 0 }]}>
          <View style={styles.cardBody}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t ? t('recipeDetail.ingredients') : 'Ingredients'}</Text>
            {(() => {
              const list = recipe.recipeQuantities || recipe.quantities || recipe.recipe_quantities || [];
              if (!Array.isArray(list) || list.length === 0) return null;
              return list.map((q, i) => {
                const rawValue = q.quantity ?? q.amount ?? q.qty ?? q.quantityValue ?? '';
                const measurementName = (q.measurement?.measurementName || q.measurement?.name || q.measurementName || q.measurementResponse?.name || q.measurementResponse?.measurementName || '').toString().toLowerCase();
                const ingredient = q.ingredient?.ingredientName || q.ingredient?.name || q.ingredientName || q.ingredientResponse?.name || q.ingredientResponse?.ingredientName || '';

                // infer measurement type: weight, volume, temperature, or count
                let type = 'count';
                if (measurementName.includes('g') || measurementName.includes('gram') || measurementName.includes('kg') || measurementName.includes('kilogram')) type = 'weight';
                else if (measurementName.includes('ml') || measurementName.includes('l') || measurementName.includes('tbsp') || measurementName.includes('tsp') || measurementName.includes('fl') || measurementName.includes('ounce')) type = 'volume';
                else if (measurementName.includes('°c') || measurementName.includes('celsius')) type = 'temperature';

                // prefer tsp/tbsp units unchanged when measurementName mentions them
                const preferredUnit = measurementName.includes('tsp') ? 'tsp' : (measurementName.includes('tbsp') ? 'tbsp' : null);

                // Preserve "pieces"/count units from DB (pcs, pc, piece, pieces)
                const isPieces = /\b(piece|pieces|pcs|pc|count|stück|st)\b/i.test(measurementName);
                let display;
                if (isPieces) {
                  const unitLabel = measurementName || 'pieces';
                  display = `${rawValue} ${unitLabel}`;
                } else {
                  // If DB stores kilograms (measurement name contains 'kg'), convert to grams for the formatter
                  let valueToFormat = Number(rawValue);
                  if (measurementName.includes('kg') || measurementName.includes('kilogram')) {
                    valueToFormat = Number(rawValue) * 1000; // kg -> g
                  }
                  display = unitConverter.formatMeasurement(valueToFormat, type, unitSystem === 'imperial' ? UnitSystem.IMPERIAL : UnitSystem.METRIC, { preferredUnit });
                }

                const parts = [display, ingredient].filter(Boolean).join(' — ');
                return (
                  <View key={i} style={styles.ingredientRow} accessible accessibilityLabel={parts}>
                    <Text style={{ color: theme.text }}>{parts}</Text>
                  </View>
                );
              });
            })()}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
          <View style={styles.cardBody}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t ? t('recipeDetail.instructions') : 'Instructions'}</Text>
            {(() => {
              const steps = recipe.recipeStepResponses || recipe.recipeSteps || recipe.steps || [];
              if (!Array.isArray(steps) || steps.length === 0) return null;
              return steps.map((s, idx) => (
                <View key={s.id ?? idx} style={styles.stepRow} accessible accessibilityLabel={`${s.stepNumber ?? s.step_number ?? idx + 1}. ${s.description ?? s.step_description ?? s}`}>
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

const localStyles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 24 },
  heroImage: { aspectRatio: 4 / 3, borderRadius: 12, marginRight: 12, marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  metaText: { fontSize: 14, fontWeight: '600' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  ingredientRow: { paddingVertical: 6 },
  stepRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingVertical: 8 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  favButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
  favButtonText: { color: '#fff', fontWeight: '700' }
});
const styles = { ...commonStyles, ...localStyles };
