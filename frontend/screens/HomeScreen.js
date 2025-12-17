import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme, currentSeason } = useTheme();
  
  const isLoggedIn = false;
  const username = "John"; 
  
  const seasonEmojis = {
    Fall: '🍂',
    Winter: '❄️',
    Spring: '🌸',
    Summer: '☀️',
  };
  
  const seasonEmoji = seasonEmojis[currentSeason] || '🍂';
  
  const welcomeMessage = isLoggedIn 
    ? `Welcome back, ${username}! ${seasonEmoji}` 
    : `Welcome! ${seasonEmoji}`;
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader />


      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeText, { color: theme.text }]}>{welcomeMessage}</Text>
        <Text style={[styles.promptText, { color: theme.secondaryText }]}>What would you like to explore today?</Text>
      </View>

      {/* Favorite Crops Card */}
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Favorite Crops</Text>
          <Ionicons name="leaf" size={20} color={theme.primary} />
        </View>
        <Text style={[styles.cardNumber, { color: theme.primary }]}>0</Text>
      </View>

      {/* Favorite Recipes Card */}
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Favorite Recipes</Text>
          <Ionicons name="book" size={20} color={theme.primary} />
        </View>
        <Text style={[styles.cardNumber, { color: theme.primary }]}>0</Text>
      </View>

      {/* Current Season Section */}
      <View style={[styles.seasonCard, { backgroundColor: theme.seasonCardBg }]}>
        <View style={styles.seasonHeader}>
          <Text style={[styles.seasonLabel, { color: theme.secondaryText }]}>Current Season</Text>
          <Ionicons name="leaf" size={20} color={theme.primary} />
        </View>
        <Text style={[styles.seasonText, { color: theme.text }]}>{currentSeason}</Text>

      </View>

      {/* Explore Crops Section */}
      <View style={[styles.featureCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={[styles.featureImagePlaceholder, { backgroundColor: theme.imagePlaceholderBg }]}>
          <Ionicons name="leaf" size={60} color={theme.iconColor} />
        </View>
        <View style={styles.featureContent}>
          <View style={styles.featureHeader}>
            <Ionicons name="leaf" size={20} color={theme.primary} />
            <Text style={[styles.featureTitle, { color: theme.text }]}>Explore Crops</Text>
          </View>
          <Text style={[styles.featureDescription, { color: theme.secondaryText }]}>
            Learn about growing vegetables and herbs in your garden
          </Text>
          <TouchableOpacity
            style={[styles.featureButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Crops')}
            accessibilityRole="button"
            accessibilityLabel="View all crops"
          >
            <Text style={styles.featureButtonText}>View All Crops</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Discover Recipes Section */}
      <View style={[styles.featureCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={[styles.featureImagePlaceholder, { backgroundColor: theme.imagePlaceholderBg }]}>
          <Ionicons name="restaurant" size={60} color={theme.iconColor} />
        </View>
        <View style={styles.featureContent}>
          <View style={styles.featureHeader}>
            <Ionicons name="book" size={20} color={theme.primary} />
            <Text style={[styles.featureTitle, { color: theme.text }]}>Discover Recipes</Text>
          </View>
          <Text style={[styles.featureDescription, { color: theme.secondaryText }]}>
            Find delicious ways to use your fresh harvest
          </Text>
          <TouchableOpacity style={[styles.featureButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.featureButtonText}>View All Recipes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 16,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  seasonCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seasonLabel: {
    fontSize: 14,
  },
  seasonText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  seasonImagePlaceholder: {
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  featureImagePlaceholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    padding: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  featureDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  featureButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  featureButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  }});