import React, { useState } from 'react';
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

export default function SettingsScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme, currentSeason, seasonOverride, setSeasonOverride } = useTheme();
  
  const [displayLanguage, setDisplayLanguage] = useState('English');
  const [measurementSystem, setMeasurementSystem] = useState('Metric (Default)');
  const [translationsEnabled, setTranslationsEnabled] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showMeasurementOptions, setShowMeasurementOptions] = useState(false);
  const [showSeasonOptions, setShowSeasonOptions] = useState(false);
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  const languages = ['English', 'Dutch', 'French', 'German', 'Spanish'];
  const measurements = ['Metric (Default)', 'Imperial'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader rightIcon="close" onRightPress={() => navigation?.goBack()} />

      {/* Settings Title */}
      <View style={styles.titleSection}>
        <Ionicons name="settings" size={24} color={theme.primary} />
        <Text style={[styles.titleText, { color: theme.text }]}>Settings</Text>
        <Ionicons name="leaf" size={24} color={theme.primary} />
      </View>

      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        Customize your experience
      </Text>

      {/* Appearance Section */}
      <View style={[styles.section, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, margin: 12, padding: 16 }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette-outline" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>
          Customize how the app looks
        </Text>

        {/* Dark Mode Toggle */}
        <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
              Switch between light and dark themes
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#D0D0D0', true: theme.primary }}
            thumbColor="#FFF"
          />
        </View>

        {/* Current Theme Preview */}
        <View style={styles.themePreviewRow}>
          <View style={[styles.previewCardSmall, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={[styles.circleIcon, { backgroundColor: theme.activeTabBg,    borderWidth: 1,    borderColor: theme.cardBorder }]}> 
              <Ionicons name="leaf" size={20} color={theme.primary} />
            </View>
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <Text style={[styles.previewCardTitle, { color: theme.text, textAlign: 'center' }]}>{currentSeason} Season</Text>
              <Text style={[styles.previewCardSubtitle, { color: theme.secondaryText, textAlign: 'center' }]}>{isDarkMode ? 'Dark mode' : 'Light mode'}</Text>
            </View>
          </View>

          <LinearGradient
            colors={[theme.seasonCardBg, theme.activeTabBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.previewCardLarge, { borderColor: theme.cardBorder }]}
          >
            <Text style={[styles.previewCardTitle, { color: theme.text }]}>Seasonal Colors</Text>
            <Text style={[styles.previewCardSubtitle, { color: theme.secondaryText }]}>Active throughout the app</Text>
          </LinearGradient>
        </View>

        {/* Manual season override for testing */}
        <View style={{ height: 12 }} />
        <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Manual Season (dev)</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>Override detected season for testing</Text>
          </View>
          <Switch
            value={!!seasonOverride}
            onValueChange={(val) => {
              if (!val) setSeasonOverride(null);
              else setSeasonOverride(currentSeason);
            }}
            trackColor={{ false: '#D0D0D0', true: theme.primary }}
            thumbColor="#FFF"
          />
        </View>

        {seasonOverride && (
          <>
            <TouchableOpacity
              style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
              onPress={() => setShowSeasonOptions(!showSeasonOptions)}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Selected Season</Text>
                <Text style={[styles.settingValue, { color: theme.primary }]}>{seasonOverride}</Text>
              </View>
              <Ionicons name={showSeasonOptions ? 'chevron-up' : 'chevron-down'} size={20} color={theme.secondaryText} />
            </TouchableOpacity>

            {showSeasonOptions && (
              <View style={[styles.optionsContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                {seasons.map((season) => (
                  <TouchableOpacity
                    key={season}
                    style={styles.optionRow}
                    onPress={() => {
                      setSeasonOverride(season);
                      setShowSeasonOptions(false);
                    }}
                  >
                    <Text style={[styles.optionText, { color: season === seasonOverride ? theme.primary : theme.text }]}>{season}</Text>
                    {season === seasonOverride && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => { setSeasonOverride(null); setShowSeasonOptions(false); }}
                >
                  <Text style={[styles.optionText, { color: theme.text }]}>Reset to Auto</Text>
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Language</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>Choose your preferred language and translation options</Text>

        {/* Translations Enable Toggle */}
        <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Enable Translations</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>Automatically translate content into your chosen language</Text>
          </View>
          <Switch
            value={translationsEnabled}
            onValueChange={(val) => setTranslationsEnabled(val)}
            trackColor={{ false: '#D0D0D0', true: theme.primary }}
            thumbColor="#FFF"
          />
        </View>

        {/* Display Language */}
        <TouchableOpacity 
          style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
          onPress={() => translationsEnabled && setShowTranslations(!showTranslations)}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{translationsEnabled ? 'Display Language' : 'Display Language (Disabled)'}</Text>
            <Text style={[styles.settingValue, { color: translationsEnabled ? theme.primary : theme.secondaryText }]}>{displayLanguage}</Text>
          </View>
          <Ionicons 
            name={showTranslations ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={translationsEnabled ? theme.secondaryText : '#B0B0B0'} 
          />
        </TouchableOpacity>

        {translationsEnabled && showTranslations && (
          <View style={[styles.optionsContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.optionRow}
                onPress={() => {
                  setDisplayLanguage(lang);
                  setShowTranslations(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  { color: lang === displayLanguage ? theme.primary : theme.text }
                ]}>
                  {lang}
                </Text>
                {lang === displayLanguage && (
                  <Ionicons name="checkmark" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.helperText, { color: theme.secondaryText }]}>Translation feature in-app; enable to translate UI content where available</Text>
      </View>
      
      {/* Units & Measurements Section */}
      <View style={[styles.section, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, margin: 12, padding: 16 }]}> 
        <View style={styles.sectionHeader}>
          <Ionicons name="calculator-outline" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Units & Measurements</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>Choose your preferred measurement system</Text>

        {/* Toggle row */}
        <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{measurementSystem === 'Imperial' ? 'Imperial Units' : 'Metric (Default)'}</Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
              {measurementSystem === 'Imperial'
                ? 'Use inches, feet, Fahrenheit, and cups'
                : 'Use Celsius, centimeters, milliliters, and grams'}
            </Text>
          </View>
          <Switch
            value={measurementSystem !== 'Metric (Default)'}
            onValueChange={(val) => setMeasurementSystem(val ? 'Imperial' : 'Metric (Default)')}
            trackColor={{ false: '#D0D0D0', true: theme.primary }}
            thumbColor="#FFF"
          />
        </View>

        {/* Two-column card showing Metric and Imperial details */}
        <View style={[styles.unitsCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={styles.unitsColumn}>
            <Text style={[styles.unitsTitle, { color: theme.text }]}>Metric (Default)</Text>
            <View style={styles.unitsList}>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>• Celsius (°C)</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>• Centimeters (cm)</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>• Milliliters (ml)</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>• Grams (g)</Text>
            </View>
          </View>

          <View style={styles.unitsColumn}>
            <Text style={[styles.unitsTitle, { color: theme.text }]}>Imperial</Text>
            <View style={styles.unitsList}>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>• Fahrenheit (°F)</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>• Inches (in)</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>• Cups/Ounces (oz)</Text>
              <Text style={[styles.unitsItem, { color: theme.secondaryText }]}>• Pounds (lbs)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={[styles.section, styles.lastSection, { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, margin: 12, padding: 16 }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
        
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: theme.secondaryText }]}>App Version</Text>
          <Text style={[styles.aboutValue, { color: theme.text }]}>1.0.0</Text>
        </View>
        
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: theme.secondaryText }]}>Current Season</Text>
          <Text style={[styles.aboutValue, { color: theme.text }]}>{currentSeason} 🍂</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
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
});
