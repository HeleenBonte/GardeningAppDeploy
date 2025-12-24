import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import useTranslation from '../hooks/useTranslation';

import HomeScreen from '../screens/HomeScreen';
import CropScreen from '../screens/CropScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountScreen from '../screens/AccountScreen';
import EditAccountScreen from '../screens/EditAccountScreen';
import CropDetailScreen from '../screens/CropDetailScreen';
import OwnRecipeScreen from '../screens/OwnRecipeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecipeScreen from '../screens/RecipeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import { getJwtToken, onLogout } from '../auth/storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const CropsStack = createNativeStackNavigator();
const RecipesStack = createNativeStackNavigator();

function MainTabs() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Crops') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Recipes') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} accessible={false} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ tabBarLabel: t ? t('tabs.home') : 'Home', tabBarAccessibilityLabel: t ? t('tabs.home') : 'Home', tabBarAccessibilityHint: t ? t('tabs.homeHint') : 'Go to Home' }}
      />
      <Tab.Screen 
        name="Crops" 
        component={CropsStackScreen} 
        options={{ tabBarLabel: t ? t('tabs.crops') : 'Crops', tabBarAccessibilityLabel: t ? t('tabs.crops') : 'Crops', tabBarAccessibilityHint: t ? t('tabs.cropsHint') : 'Go to Crops' }}
      />
      <Tab.Screen 
        name="Recipes" 
        component={RecipesStackScreen} 
        options={{ tabBarLabel: t ? t('tabs.recipes') : 'Recipes', tabBarAccessibilityLabel: t ? t('tabs.recipes') : 'Recipes', tabBarAccessibilityHint: t ? t('tabs.recipesHint') : 'Go to Recipes' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ tabBarLabel: t ? t('tabs.favorites') : 'Favorites', tabBarAccessibilityLabel: t ? t('tabs.favorites') : 'Favorites', tabBarAccessibilityHint: t ? t('tabs.favoritesHint') : 'Go to Favorites' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            (async () => {
              const state = navigation.getState && navigation.getState();
              const prevRoute = state && state.routes && state.routes[state.index] && state.routes[state.index].name;
              try {
                const token = await getJwtToken();
                if (!token) {
                  e.preventDefault();
                  if (prevRoute) navigation.navigate(prevRoute);
                  const parent = navigation.getParent && navigation.getParent();
                  if (parent && parent.navigate) parent.navigate('Login');
                }
              } catch (err) {
                e.preventDefault();
                const parent = navigation.getParent && navigation.getParent();
                if (parent && parent.navigate) parent.navigate('Login');
              }
            })();
          }
        })}
      />
    </Tab.Navigator>
  );
}

function CropsStackScreen() {
  return (
    <CropsStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <CropsStack.Screen name="CropsList" component={CropScreen} />
      <CropsStack.Screen name="CropDetail" component={CropDetailScreen} />
    </CropsStack.Navigator>
  );
}

function RecipesStackScreen() {
  return (
    <RecipesStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <RecipesStack.Screen name="RecipesList" component={RecipeScreen} />
      <RecipesStack.Screen name="AddRecipe" component={AddRecipeScreen} />
      <RecipesStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </RecipesStack.Navigator>
  );
}

export const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  React.useEffect(() => {
    const unsub = onLogout((reason) => {
      try {
        if (reason === 'expired') {
          try { Alert.alert('Session expired', 'Your login has expired'); } catch (_) { }
        }

        if (navigationRef.isReady && navigationRef.isReady()) {
          if (navigationRef.resetRoot) {
            navigationRef.resetRoot({ index: 0, routes: [{ name: 'Login' }] });
          } else {
            navigationRef.navigate('Login');
          }
        }
      } catch (e) {
      }
    });
    return () => unsub();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureResponseDistance: { horizontal: 35 },
        }}
      >
          <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="EditAccount" component={EditAccountScreen} />
        <Stack.Screen name="OwnRecipes" component={OwnRecipeScreen} />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
