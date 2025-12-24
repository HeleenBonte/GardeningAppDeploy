import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';
import { getItem, logout } from '../auth/storage';
import useTranslation from '../hooks/useTranslation';
import commonStyles from '../themes/styles';
import { getUserById, getUserFavoriteCrops, getUserFavoriteRecipes, getRecipes, deleteUser } from '../config/api';
import { useIsFocused } from '@react-navigation/native';

export default function AccountScreen({ navigation }) {
  const { theme } = useTheme();
  const focused = useIsFocused();
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [cropsCount, setCropsCount] = useState(0);
  const [recipesCount, setRecipesCount] = useState(0);
  const [createdRecipesCount, setCreatedRecipesCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  async function loadAccountData() {
    let mounted = true;
    setRefreshing(true);
    try {
      const userIdStr = await getItem('user_id');
      if (!userIdStr) {
        setUser(null);
        setCropsCount(0);
        setRecipesCount(0);
        return;
      }
      const userId = Number(userIdStr);
      if (!userId) return;

      const u = await getUserById(userId).catch(() => null);
      if (!mounted) return;
      setUser(u);

      const [crops, recipes, allRecipes] = await Promise.all([
        getUserFavoriteCrops(userId).catch(() => []),
        getUserFavoriteRecipes(userId).catch(() => []),
        getRecipes().catch(() => []),
      ]);
      if (!mounted) return;
      setCropsCount(Array.isArray(crops) ? crops.length : (crops?.length ?? 0));
      setRecipesCount(Array.isArray(recipes) ? recipes.length : (recipes?.length ?? 0));
      try {
        const created = Array.isArray(allRecipes) ? allRecipes.filter(r => Number(r?.authorId) === Number(userId)) : [];
        setCreatedRecipesCount(created.length);
      } catch (_) {
        setCreatedRecipesCount(0);
      }
    } catch (e) {
      console.warn('Failed to load account details', e);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (focused) {
      loadAccountData();
    }
  }, [focused]);

  const totalFavorites = cropsCount + recipesCount;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAccountData} tintColor={theme.primary} />}
    >
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />

      <View style={styles.headerWrap}>
        <Text style={[styles.title, { color: theme.text }]}>{t ? t('account.title') : 'My Account'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{t ? t('account.subtitle') : 'Manage your profile and preferences'}</Text>
          <TouchableOpacity onPress={loadAccountData} style={{ padding: 8 }} accessibilityLabel={t ? t('account.refreshLabel') : 'Refresh account'}>
            {refreshing ? <ActivityIndicator size="small" color={theme.primary} /> : <Ionicons name="refresh" size={18} color={theme.primary} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
        <View style={styles.profileCardInner}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>{user?.userName ?? '—'}</Text>
              <Text style={[styles.profileEmail, { color: theme.secondaryText }]}>{user?.userEmail ?? ''}</Text>
          </View>
              <TouchableOpacity
                style={[styles.editButton, { borderColor: theme.cardBorder }]}
                onPress={() => navigation.navigate('EditAccount')}
                accessibilityRole="button"
                accessibilityLabel={t ? t('account.edit') : 'Edit'}
                accessibilityHint={t ? t('account.edit') : 'Edit your account'}
                hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              >
                <Text style={[styles.editText, { color: theme.primary }]}>{t ? t('account.edit') : 'Edit'}</Text>
              </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, padding: 16 }]}> 
          <Text style={[styles.cardTitle, { color: theme.text }]}>{t ? t('account.yourActivity') : 'Your Activity'}</Text>
          <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>{t ? t('account.trackActivity') : 'Track your favorites and contributions'}</Text>

        <View style={styles.statsColumn}>
          <View style={[styles.statCard, { borderColor: theme.cardBorder, backgroundColor: theme.background }]}> 
            <View style={styles.statLeft}>
              <Ionicons name="leaf" size={22} color={theme.primary} />
            </View>
            <View style={styles.statRight}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{cropsCount}</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t ? t('account.favoriteCrops') : 'Favorite Crops'}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { borderColor: theme.cardBorder, backgroundColor: theme.background }]}> 
            <View style={styles.statLeft}>
              <Ionicons name="book" size={22} color={theme.primary} />
            </View>
            <View style={styles.statRight}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{recipesCount}</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t ? t('account.favoriteRecipes') : 'Favorite Recipes'}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { borderColor: theme.cardBorder, backgroundColor: theme.background }]}> 
            <View style={styles.statLeft}>
              <Ionicons name="heart" size={22} color={theme.primary} />
            </View>
            <View style={styles.statRight}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{totalFavorites}</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t ? t('account.totalFavorites') : 'Total Favorites'}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { borderColor: theme.cardBorder, backgroundColor: theme.background }]}> 
            <View style={styles.statLeft}>
              <Ionicons name="clipboard" size={22} color={theme.primary} />
            </View>
            <View style={styles.statRight}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{createdRecipesCount}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t ? t('account.createdRecipes') : 'Recipes Created'}</Text>
                <TouchableOpacity
                  onPress={() => navigation?.navigate('OwnRecipes')}
                  style={{ marginLeft: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: theme.primary }}
                  accessibilityRole="button"
                  accessibilityLabel={t ? t('view') : 'View'}
                  accessibilityHint={t ? t('account.createdRecipes') : 'View your created recipes'}
                  hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{t ? t('view') : 'View'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#c0392b' }]}
          onPress={() => {
            Alert.alert(
              (t && t('account.removeConfirmTitle')) || 'Remove account',
              (t && t('account.removeConfirmMessage')) || 'This will permanently delete your account and all related data. This action cannot be undone. Are you sure?',
              [
                { text: (t && t('cancel')) || 'Cancel', style: 'cancel' },
                {
                  text: (t && t('account.remove')) || 'Remove',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const userIdStr = await getItem('user_id');
                      if (!userIdStr) throw new Error('No user id');
                      const userId = Number(userIdStr);
                      await deleteUser(userId);
                      try { await logout('deleted'); } catch (_) {}
                      try { navigation.navigate('Login'); } catch (_) {}
                    } catch (e) {
                      console.warn('Failed to delete account', e);
                      Alert.alert((t && t('error')) || 'Error', e?.message || ((t && t('account.removeFailed')) || 'Failed to remove account.'));
                    }
                  }
                }
              ]
            );
          }}
          accessibilityRole="button"
          accessibilityLabel={(t && t('account.remove')) || 'Remove account'}
          accessibilityHint={(t && t('account.removeHint')) || 'Permanently deletes your account'}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="trash" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>{(t && t('account.remove')) || 'Remove account'}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#e74c3c' }]}
          onPress={async () => {
            try { await logout('manual'); } catch (_) {}
            try { navigation.navigate('Login'); } catch (_) {}
          }}
          accessibilityRole="button"
          accessibilityLabel={t ? t('logout') : 'Logout'}
          accessibilityHint={t ? t('logout') : 'Logs you out'}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <Text style={styles.logoutText}>{t ? t('logout') : 'Logout'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  
  profileRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 6 },
  
  activityRow: { flexDirection: 'column', gap: 12 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 10 },
  activityNumber: { fontSize: 20, fontWeight: '700', marginLeft: 12 },
  activityLabel: { fontSize: 13, marginLeft: 12 },
  totalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  totalNumber: { fontSize: 20, fontWeight: '700' },
  totalLabel: { fontSize: 13 },
  profileCardInner: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  profileInfo: { flex: 1, marginLeft: 12 },
  statsColumn: { marginTop: 8 },
  statCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 10 },
  statLeft: { width: 40, alignItems: 'center' },
  statRight: { marginLeft: 12 },
  logoutButton: { marginTop: 12, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700' },
});
const styles = { ...commonStyles, ...localStyles };
