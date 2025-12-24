import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';
import useCropDetail from '../hooks/useCropDetail';
import { addFavoriteCrop, removeFavoriteCrop, getUserFavoriteCrops } from '../config/api';
import { getItem } from '../auth/storage';
import MONTHS, { isInRange } from '../lib/months';
import FallbackImage from '../components/FallbackImage';
import useTranslation from '../hooks/useTranslation';
import commonStyles from '../themes/styles';

export default function CropDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, currentSeason } = useTheme();

  const routeCrop = route.params?.crop ?? null;
  const cropId = route.params?.cropId ?? routeCrop?.id ?? null;
  const { crop, relatedRecipes, loading, error, reload } = useCropDetail({ id: cropId, initialCrop: routeCrop });
  const { t } = useTranslation();

  


  function handleBack() {
    if (route.params?.onBack) route.params.onBack();
    else navigation.goBack();
  }

  function handleViewRecipe(id) {
    if (route.params?.onViewRecipe) route.params.onViewRecipe(id);
    else navigation.navigate('Recipes', { screen: 'RecipeDetail', params: { id } });
  }

  React.useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      try {
        if (typeof navigation.replace === 'function') {
          navigation.replace('CropsList');
          return;
        }
      } catch (_) {}

      try {
        if (navigation?.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
          return;
        }
      } catch (_) {}
    });
    return () => unsub && unsub();
  }, [navigation, cropId]);

  const [favLoading, setFavLoading] = React.useState(false);
  const [favSaved, setFavSaved] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userId = await getItem('user_id');
        if (!userId || !cropId) return;
        const res = await getUserFavoriteCrops(userId);
        const ids = Array.isArray(res) ? res.map(r => r.id) : (res?.map ? res.map(r => r.id) : []);
        if (mounted) setFavSaved(ids.includes(cropId));
      } catch (err) {
      }
    })();
    return () => { mounted = false; };
  }, [cropId]);

  async function handleSaveFavorite() {
    if (!crop?.id) return;
    setFavLoading(true);
    try {
      const dbgToken = await getItem('jwt_token');
      console.log('[CropDetail] jwt present?', !!dbgToken, 'userId stored?', await getItem('user_id'));
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
        await removeFavoriteCrop(userId, crop.id);
        setFavSaved(false);
      } else {
        await addFavoriteCrop(userId, crop.id);
        setFavSaved(true);
      }
    } catch (err) {
      console.warn('Failed to add favorite crop', err);
    } finally {
      setFavLoading(false);
    }
  }

  if (loading) return (
    <View style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={{ color: theme.secondaryText, marginTop: 8 }}>{t ? t('cropDetail.loading') : 'Loading crop…'}</Text>
    </View>
  );

  if (error) return (
    <View style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 16 }]}>
      <Text style={{ color: theme.secondaryText, marginBottom: 12 }}>{String(error)}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary, paddingHorizontal: 16 }]}
        onPress={reload}
        accessibilityRole="button"
        accessibilityLabel={t ? t('cropDetail.tryAgain') : 'Try Again'}
        accessibilityHint={t ? t('cropDetail.tryAgain') : 'Retries loading the crop'}
        hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
      >
        <Text style={styles.viewButtonText}>{t ? t('cropDetail.tryAgain') : 'Try Again'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeCardContainer} accessible={true} accessibilityLabel={`${item.name}. ${item.description || ''}`}>
      <View style={[styles.recipeCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <FallbackImage sourceUrl={item.imageURL || item.image} type="recipe" id={item.id} style={styles.recipeImage} accessibilityRole="image" accessibilityLabel={item.name} />
        <View style={styles.recipeBody}>
          <Text accessibilityRole="header" accessibilityLabel={item.name} style={[styles.recipeTitle, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.recipeDesc, { color: theme.secondaryText }]} numberOfLines={2}>{item.description || (item.recipeQuantities ? item.recipeQuantities.map(q => q.ingredientResponse?.name).filter(Boolean).join(', ') : '')}</Text>
          <View style={styles.recipeMeta}>
            <Text style={[styles.metaLabel, { color: theme.text }]}>{t ? t('cropDetail.prepLabel') : 'Prep:'} </Text>
            <Text style={[styles.metaText, { color: theme.secondaryText }]}>{item.prepTime}</Text>
            <Text style={[styles.metaLabel, { color: theme.text }, { marginLeft: 8 }]}>{t ? t('cropDetail.cookLabel') : 'Cook:'} </Text>
            <Text style={[styles.metaText, { color: theme.secondaryText }]}>{item.cookTime}</Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 8, backgroundColor: theme.primary }]}
            onPress={() => handleViewRecipe(item.id)}
            accessibilityRole="button"
            accessibilityLabel={t ? t('cropDetail.viewRecipe') : 'View Recipe'}
            accessibilityHint={t ? t('crop.viewDetailsA11yHint') : 'Open recipe details'}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <Text style={styles.primaryButtonText}>{t ? t('cropDetail.viewRecipe') : 'View Recipe'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />
      <View style={styles.content}>

              <FallbackImage sourceUrl={crop?.image} type="crop" id={crop?.id} style={styles.cropImage} accessibilityRole="image" accessibilityLabel={crop?.name} />
          <View style={styles.titleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text accessibilityRole="header" accessibilityLabel={crop.name} style={[styles.title, { color: theme.text }]}>{crop.name}</Text>

            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.favButton, { marginTop: 8, backgroundColor: favSaved ? theme.primary : theme.primary }]}
                onPress={handleSaveFavorite}
                disabled={favLoading}
                    accessibilityRole="button"
                    accessibilityLabel={favSaved ? (t ? t('cropDetail.saved') : 'Saved') : (favLoading ? (t ? t('cropDetail.saving') : 'Saving…') : (t ? t('cropDetail.save') : 'Save'))}
                    accessibilityHint={t ? t('cropDetail.save') : 'Save this crop to your favorites'}
                    accessibilityState={{ busy: !!favLoading, selected: !!favSaved }}
                    hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              >
                <Text style={styles.favButtonText}>{favSaved ? (t ? t('cropDetail.saved') : 'Saved') : favLoading ? (t ? t('cropDetail.saving') : 'Saving…') : (t ? t('cropDetail.save') : 'Save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        <View style={styles.infoCol}>


          <Text style={[styles.description, { color: theme.secondaryText }]}>{crop.cropDescription}</Text>

          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.text }]}>{t ? t('cropDetail.sowingPeriod') : 'Sowing Period'}</Text>
              <View style={styles.monthsRow}>
                {MONTHS.map((m, i) => {
                  const active = isInRange(i, crop.sowingStart, crop.sowingEnd);
                  return (
                    <View
                      key={m}
                      style={[styles.monthBox, { backgroundColor: active ? theme.seasonCardBg : theme.imagePlaceholderBg }]}
                      accessible={true}
                      accessibilityLabel={m}
                      accessibilityState={{ selected: !!active }}
                    >
                      <Text style={[styles.monthText, { color: active ? theme.primary : theme.secondaryText }]}>{m}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.text }]}>{t ? t('cropDetail.plantingPeriod') : 'Planting Period'}</Text>
              <View style={styles.monthsRow}>
                {MONTHS.map((m, i) => {
                  const active = isInRange(i, crop.plantingStart, crop.plantingEnd);
                  return (
                    <View
                      key={m}
                      style={[styles.monthBox, { backgroundColor: active ? theme.seasonCardBg : theme.imagePlaceholderBg }]}
                      accessible={true}
                      accessibilityLabel={m}
                      accessibilityState={{ selected: !!active }}
                    >
                      <Text style={[styles.monthText, { color: active ? theme.primary : theme.secondaryText }]}>{m}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.text }]}>{t ? t('cropDetail.harvestPeriod') : 'Harvest Period'}</Text>
              <View style={styles.monthsRow}>
                {MONTHS.map((m, i) => {
                  const active = isInRange(i, crop.harvestStart, crop.harvestEnd);
                  return (
                    <View
                      key={m}
                      style={[styles.monthBox, { backgroundColor: active ? theme.seasonCardBg : theme.imagePlaceholderBg }]}
                      accessible={true}
                      accessibilityLabel={m}
                      accessibilityState={{ selected: !!active }}
                    >
                      <Text style={[styles.monthText, { color: active ? theme.primary : theme.secondaryText }]}>{m}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

      <View style={[styles.card, styles.cardPadded, { backgroundColor: theme.seasonCardBg , borderColor: theme.cardBorder }, { borderLeftWidth: 4, borderLeftColor: theme.primary }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t ? t('cropDetail.growingLocationsTitle') : 'Growing locations'}</Text>
        <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>{t ? t('cropDetail.growingLocationsSubtitle') : 'Where can you grow this crop'}</Text>
        <View style={styles.cardContent}>
          <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.inHouse ? `- ${t ? t('cropDetail.canGrowIndoor') : 'This plant can be grown indoors'}` : `- ${t ? t('cropDetail.cannotGrowIndoor') : 'This plant cannot be grown indoors'}`}</Text>
          <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.inGarden ? `- ${t ? t('cropDetail.canGrowGarden') : 'This plant can be grown in a garden'}` : `- ${t ? t('cropDetail.cannotGrowGarden') : 'This plant cannot be grown in a garden'}`}</Text>
          <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.inGreenhouse ? `- ${t ? t('cropDetail.canGrowGreenhouse') : 'This plant can be grown in a greenhouse'}` : `- ${t ? t('cropDetail.cannotGrowGreenhouse') : 'This plant cannot be grown in a greenhouse'}`}</Text>
          <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.inPots ? `- ${t ? t('cropDetail.canGrowPots') : 'This plant can be grown in pots'}` : `- ${t ? t('cropDetail.cannotGrowPots') : 'This plant cannot be grown in pots'}`}</Text>
        </View>
      </View>

      <View style={[styles.card, styles.cardPadded, { backgroundColor: theme.seasonCardBg , borderColor: theme.cardBorder }, { borderLeftWidth: 4, borderLeftColor: theme.primary }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t ? t('cropDetail.tipsTitle') : 'Tips & Tricks'}</Text>
        <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>{t ? t('cropDetail.tipsSubtitle') : 'Expert advice for the best results'}</Text>
        <View style={styles.cardContent}>
              <Text style={[styles.listText, { color: theme.secondaryText }]}>{crop.cropTips}</Text>
        </View>
      </View>

      {relatedRecipes.length > 0 && (
        <View style={[styles.recipesSection, { borderTopWidth: 2, borderTopColor: theme.primary, paddingTop: 8 }]}> 
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t ? t('cropDetail.recipesUsingTitle').replace('{name}', crop.name) : `Recipes Using ${crop.name} ${crop.emoji ?? ''}`}</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>{t ? t('cropDetail.recipesUsingSubtitle') : 'Delicious ways to use your fresh harvest'}</Text>
        </View>
      )}
    </View>
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      data={Array.isArray(relatedRecipes) ? relatedRecipes.slice(0, 6) : []}
      keyExtractor={(r) => String(r.id)}
      renderItem={renderRecipeItem}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListHeader}
    />
  );
}

const localStyles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  cropImage: { aspectRatio: 4 / 3, borderRadius: 12, marginRight: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  description: { marginTop: 8, marginBottom: 12 },
  timeline: { marginTop: 4 },
  timelineItem: { marginBottom: 8 },
  timelineLabel: { fontSize: 15, fontWeight: '600' },
  timelineValue: { fontSize: 14 },
  cardContent: { marginTop: 4 },
  cardPadded: { padding: 14 },
  listText: { flex: 1 },
  recipesSection: { marginTop: 16 },
  sectionTitle: { fontSize: 19, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14 },
  recipeCard: { borderRadius: 10, overflow: 'hidden', marginBottom: 12, borderWidth: 1 },
  recipeCardContainer: { paddingHorizontal: 16 },
  recipeImage: { width: '100%', height: 120 },
  recipeBody: { padding: 8 },
  recipeTitle: { fontSize: 15, fontWeight: '700' },
  recipeDesc: { fontSize: 13, marginTop: 4 },
  recipeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaLabel: { fontWeight: '600', fontSize: 13 },
  metaText: { fontSize: 13 },
  monthsRow: { flexDirection: 'row', marginTop: 8, flexWrap: 'nowrap' },
  monthBox: { width: 26, height: 20, borderRadius: 6, marginRight: 6, alignItems: 'center', justifyContent: 'center' },
  monthText: { fontSize: 11, fontWeight: '700' },
  viewButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  viewButtonText: { color: '#fff', fontWeight: '600' },
  favButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
  favButtonText: { color: '#fff', fontWeight: '700' },
});
const styles = { ...commonStyles, ...localStyles };
