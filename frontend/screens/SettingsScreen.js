import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';
import { getJwtToken } from '../auth/storage';
import useUnitPreference from '../hooks/useUnitPreference';
import useTranslation from '../hooks/useTranslation';
import { useIsFocused } from '@react-navigation/native';
import { logout } from '../auth/storage';
import commonStyles from '../themes/styles';


export default function SettingsScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme, currentSeason, seasonOverride, setSeasonOverride } = useTheme();
  
  const { t, language, setLanguage, enabled, setEnabled } = useTranslation();
  const { unitSystem, setUnitSystem, loading: unitLoading, isImperial } = useUnitPreference();
  const [showTranslations, setShowTranslations] = useState(false);
  const [showSeasonOptions, setShowSeasonOptions] = useState(false);
  const seasons = ['spring', 'summer', 'fall', 'winter'];
  const languages = ['en', 'nl'];
  const measurements = ['metric', 'imperial'];
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const focused = useIsFocused();

  // translation helper that respects the `enabled` toggle
  const tr = (key, fallback) => {
    if (enabled) return t ? t(key) : (fallback ?? '');
    return fallback ?? (t ? t(key) : '');
  };

  // normalize current/override season into translation keys (spring, summer, fall, winter)
  const seasonKey = (() => {
    try {
      let s = (currentSeason || '').toString().toLowerCase();
      if (!s) return '';
      if (s === 'autumn') s = 'fall';
      return s;
    } catch (_) { return ''; }
  })();

  const overrideKey = (() => {
    try {
      let s = (seasonOverride || '').toString().toLowerCase();
      if (!s) return '';
      if (s === 'autumn') s = 'fall';
      return s;
    } catch (_) { return ''; }
  })();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getJwtToken();
        if (!mounted) return;
        if (!token) {
          setTokenExpiry(null);
          return;
        }
        // decode JWT payload safely
        try {
          const parts = token.split('.');
          if (parts.length >= 2) {
            const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const pad = payloadB64.length % 4;
            const padded = pad ? payloadB64 + '='.repeat(4 - pad) : payloadB64;
            const decoded = typeof atob === 'function' ? atob(padded) : null;
            let json = decoded;
            if (decoded) {
              try {
                json = decodeURIComponent(Array.prototype.map.call(decoded, (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
              } catch (_) { json = decoded; }
            }
            const obj = json ? JSON.parse(json) : null;
            if (obj && obj.exp) {
              setTokenExpiry(new Date(Number(obj.exp) * 1000));
            } else {
              setTokenExpiry(null);
            }
          }
        } catch (e) {
          setTokenExpiry(null);
        }
      } catch (e) {
        setTokenExpiry(null);
      }
    })();
    return () => { mounted = false; };
  }, [focused]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />

      {/* Settings Title */}
      <View style={styles.titleSection}>
        <Ionicons name="settings" size={24} color={theme.primary} accessible={false} />
        <Text accessibilityRole="header" accessibilityLabel={tr('settings','Settings')} style={[styles.titleText, { color: theme.text }]}>{tr('settings','Settings')}</Text>
        <Ionicons name="leaf" size={24} color={theme.primary} accessible={false} />
      </View>

      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {tr('customizeExperience','Customize your experience')}
      </Text>

      {/* Appearance Section */}
      <View style={[styles.section, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, margin: 12, padding: 16 }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette-outline" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{tr('appearance','Appearance')}</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>
          {tr('appearanceSubtitle','Customize how the app looks')}
        </Text>

        {/* Dark Mode Toggle */}
        <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{tr('darkMode','Dark Mode')}</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
              {tr('darkModeDescription','Switch between light and dark themes')}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#D0D0D0', true: theme.primary }}
            thumbColor="#FFF"
            accessibilityLabel={tr('darkMode','Dark Mode')}
            accessibilityHint={tr('darkModeDescription','Switch between light and dark themes')}
          />
        </View>

        {/* Current Theme Preview */}
        <View style={styles.themePreviewRow}>
          <View style={[styles.previewCardSmall, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={[styles.circleIcon, { backgroundColor: theme.activeTabBg,    borderWidth: 1,    borderColor: theme.cardBorder }]}> 
              <Ionicons name="leaf" size={20} color={theme.primary} accessible={false} />
            </View>
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <Text style={[styles.previewCardTitle, { color: theme.text, textAlign: 'center' }]}>{(seasonKey ? tr(`seasons.${seasonKey}`, currentSeason) : currentSeason)} {tr('seasonLabel','Season')}</Text>
              <Text style={[styles.previewCardSubtitle, { color: theme.secondaryText, textAlign: 'center' }]}>{isDarkMode ? tr('darkModeOn','Dark mode') : tr('darkModeOff','Light mode')}</Text>
            </View>
          </View>

          <LinearGradient
            colors={[theme.seasonCardBg, theme.activeTabBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.previewCardLarge, { borderColor: theme.cardBorder }]}
          >
            <Text style={[styles.previewCardTitle, { color: theme.text }]} accessibilityLabel={tr('seasonalColors','Seasonal Colors')}>{tr('seasonalColors','Seasonal Colors')}</Text>
            <Text style={[styles.previewCardSubtitle, { color: theme.secondaryText }]} accessibilityLabel={tr('seasonalColorsDesc','Active throughout the app')}>{tr('seasonalColorsDesc','Active throughout the app')}</Text>
          </LinearGradient>
        </View>

        {/* Manual season override for testing */}
        <View style={{ height: 12 }} />
        <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{tr('manualSeason','Manual Season (dev)')}</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>{tr('manualSeasonDesc','Override detected season for testing')}</Text>
          </View>
          <Switch
            value={!!seasonOverride}
            onValueChange={(val) => {
              if (!val) setSeasonOverride(null);
              else setSeasonOverride(currentSeason);
            }}
            trackColor={{ false: '#D0D0D0', true: theme.primary }}
            thumbColor="#FFF"
            accessibilityLabel={tr('manualSeason','Manual Season (dev)')}
            accessibilityHint={tr('manualSeasonDesc','Override detected season for testing')}
          />
        </View>

        {seasonOverride && (
          <>
            <TouchableOpacity
              style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
              onPress={() => setShowSeasonOptions(!showSeasonOptions)}
              accessibilityRole="button"
              accessibilityLabel={tr('selectedSeason','Selected Season')}
              accessibilityHint={tr('selectedSeason','Selected Season')}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{tr('selectedSeason','Selected Season')}</Text>
                <Text style={[styles.settingValue, { color: theme.primary }]}>{overrideKey ? tr(`seasons.${overrideKey}`, seasonOverride) : seasonOverride}</Text>
              </View>
              <Ionicons name={showSeasonOptions ? 'chevron-up' : 'chevron-down'} size={20} color={theme.secondaryText} accessible={false} />
            </TouchableOpacity>

            {showSeasonOptions && (
              <View style={[styles.optionsContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                {seasons.map((season) => (
                  <TouchableOpacity
                    key={season}
                    style={styles.optionRow}
                    onPress={() => {
                      // store override as the displayed string (keeps existing behavior)
                      setSeasonOverride(season);
                      setShowSeasonOptions(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={tr(`seasons.${season}`, season)}
                    accessibilityState={{ selected: season === overrideKey }}
                    hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                  >
                    <Text style={[styles.optionText, { color: season === overrideKey ? theme.primary : theme.text }]}>{tr(`seasons.${season}`, season)}</Text>
                    {season === overrideKey && <Ionicons name="checkmark" size={20} color={theme.primary} accessible={false} />}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => { setSeasonOverride(null); setShowSeasonOptions(false); }}
                  accessibilityRole="button"
                  accessibilityLabel={tr('resetToAuto','Reset to Auto')}
                  hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                >
                  <Text style={[styles.optionText, { color: theme.text }]}>{tr('resetToAuto','Reset to Auto')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Language Section */}
      <View style={[styles.section, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, margin: 12, padding: 16 }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="language-outline" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{tr('language','Language')}</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>{tr('languageSubtitle','Choose your preferred language and translation options')}</Text>

        {/* Translations Enable Toggle */}
        <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{tr('enableTranslations','Enable Translations')}</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>{tr('enableTranslationsDescription','Automatically translate content into your chosen language')}</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={(val) => setEnabled(val)}
            trackColor={{ false: '#D0D0D0', true: theme.primary }}
            thumbColor="#FFF"
            accessibilityLabel={tr('enableTranslations','Enable Translations')}
            accessibilityHint={tr('enableTranslationsDescription','Automatically translate content into your chosen language')}
          />
        </View>

        {/* Display Language */}
        <TouchableOpacity 
          style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
          onPress={() => enabled && setShowTranslations(!showTranslations)}
          accessibilityRole="button"
          accessibilityLabel={enabled ? tr('displayLanguage','Display Language') : `${tr('displayLanguage','Display Language')} (Disabled)`}
          accessibilityHint={tr('displayLanguage','Display Language')}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{enabled ? tr('displayLanguage','Display Language') : `${tr('displayLanguage','Display Language')} (Disabled)`}</Text>
            <Text style={[styles.settingValue, { color: enabled ? theme.primary : theme.secondaryText }]}>{language === 'nl' ? tr('dutch','Dutch') : tr('english','English')}</Text>
          </View>
          <Ionicons 
            name={showTranslations ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={enabled ? theme.secondaryText : '#B0B0B0'} 
            accessible={false}
          />
        </TouchableOpacity>

        {enabled && showTranslations && (
          <View style={[styles.optionsContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            {languages.map((code) => {
              const label = code === 'nl' ? tr('dutch','Dutch') : tr('english','English');
                return (
                <TouchableOpacity
                  key={code}
                  style={styles.optionRow}
                  onPress={() => {
                    setLanguage(code);
                    setShowTranslations(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: code === language }}
                  hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                >
                  <Text style={[
                    styles.optionText,
                    { color: code === language ? theme.primary : theme.text }
                  ]}>
                    {label}
                  </Text>
                  {code === language && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} accessible={false} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
      
      {/* Units & Measurements Section */}
      <View style={[styles.section, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, margin: 12, padding: 16 }]}> 
        <View style={styles.sectionHeader}>
          <Ionicons name="calculator-outline" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{tr('units','Units & Measurements')}</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>{tr('unitsSubtitle','Choose your preferred measurement system')}</Text>

        {/* Toggle row */}
        <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{isImperial ? (t ? t('imperial') : 'Imperial') : (t ? t('metric') : 'Metric (Default)')}</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
              {isImperial
                ? (t ? t('imperialDescription') : 'Use ounces, fluid ounces, and pounds')
                : (t ? t('metricDescription') : 'Use grams, milliliters, and kilograms')}
            </Text>
          </View>
          <Switch
            value={isImperial}
            onValueChange={(val) => setUnitSystem(val ? 'imperial' : 'metric')}
            trackColor={{ false: '#D0D0D0', true: theme.primary }}
            thumbColor="#FFF"
            accessibilityLabel={tr('units','Units & Measurements')}
            accessibilityHint={tr('unitsSubtitle','Choose your preferred measurement system')}
          />
        </View>

        {/* Two-column card showing Metric and Imperial details */}
        <View style={[styles.unitsCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={styles.unitsColumn}>
            <Text style={[styles.unitsTitle, { color: theme.text }]}>{t ? t('metric') : 'Metric (Default)'}</Text>
            <View style={styles.unitsList}>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>{t ? t('gramsItem') : '• Grams (g)'}</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>{t ? t('millilitersItem') : '• Milliliters (mL)'}</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>{t ? t('kilogramsItem') : '• Kilograms (kg)'}</Text>
            </View>
          </View>

          <View style={styles.unitsColumn}>
            <Text style={[styles.unitsTitle, { color: theme.text }]}>{t ? t('imperial') : 'Imperial'}</Text>
            <View style={styles.unitsList}>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>{t ? t('ouncesItem') : '• Ounces (oz)'}</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>{t ? t('flOzItem') : '• Fluid Ounces (fl oz)'}</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>{t ? t('poundsItem') : '• Pounds (lbs)'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={[styles.section, styles.lastSection, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, margin: 12, padding: 16 }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t ? t('about') : 'About'}</Text>
        
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: theme.secondaryText }]}>{t ? t('appVersion') : 'App Version'}</Text>
          <Text style={[styles.aboutValue, { color: theme.text }]}>1.0.0</Text>
        </View>
        
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: theme.secondaryText }]}>{tr('currentSeason','Current Season')}</Text>
          <Text style={[styles.aboutValue, { color: theme.text }]}>{currentSeason} 🍂</Text>
        </View>

        <View style={[styles.aboutRow, { alignItems: 'center' }]}>
          <Text style={[styles.aboutLabel, { color: theme.secondaryText }]}>{t ? t('session') : 'Session'}</Text>
          {tokenExpiry ? (
            <View style={[styles.expiryBadge, { backgroundColor: theme.cardBorder }]}> 
              <Text style={[styles.expiryText, { color: theme.text }]}>{tokenExpiry <= new Date() ? (t ? t('expired') : 'Expired') : tokenExpiry.toLocaleString()}</Text>
            </View>
          ) : (
            <Text style={[styles.aboutValue, { color: theme.secondaryText }]}>{tr('notSignedIn','Not signed in')}</Text>
          )}
        </View>

        <View style={{ height: 12 }} />
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#e74c3c' }]}
          onPress={async () => {
            try {
              await logout('manual');
            } catch (_) { /* ignore */ }
            try { navigation.navigate('Login'); } catch (_) {}
          }}
          accessibilityRole="button"
          accessibilityLabel={tr('logout','Log Out')}
          accessibilityHint={tr('logout','Log Out')}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <Text style={styles.logoutText}>{tr('logout','Log Out')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  lastSection: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  themePreview: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  themePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  themePreviewBox: {
    padding: 16,
    borderRadius: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewDescription: {
    fontSize: 14,
  },
  themePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  previewCardSmall: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  circleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCardLarge: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  previewCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewCardSubtitle: {
    fontSize: 14,
  },
  unitsCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 12,
  },
  unitsColumn: {
    flex: 1,
    padding: 8,
  },
  unitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  unitsList: {
    paddingLeft: 4,
  },
  unitsItem: {
    fontSize: 13,
    marginBottom: 6,
  },
  optionsContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionText: {
    fontSize: 16,
  },
  measurementOption: {
    flex: 1,
  },
  measurementDetails: {
    marginTop: 8,
    marginLeft: 8,
  },
  measurementUnit: {
    fontSize: 12,
    marginTop: 2,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: -8,
    marginBottom: 12,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  expiryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
const styles = { ...commonStyles, ...localStyles };
