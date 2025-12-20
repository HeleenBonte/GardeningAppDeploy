import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import CropScreen from '../screens/CropScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CropDetailScreen from '../screens/CropDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecipeScreen from '../screens/RecipeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import { getJwtToken } from '../auth/storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const CropsStack = createNativeStackNavigator();
const RecipesStack = createNativeStackNavigator();

function MainTabs() {
  const { theme } = useTheme();

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

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Crops" 
        component={CropsStackScreen} 
        options={{ tabBarLabel: 'Crops' }}
      />
      <Tab.Screen 
        name="Recipes" 
        component={RecipesStackScreen} 
        options={{ tabBarLabel: 'Recipes' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ tabBarLabel: 'Favorites' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            (async () => {
              try {
                const token = await getJwtToken();
                if (!token) {
                  e.preventDefault();
                  navigation.navigate('Login');
                }
                // if token exists, allow default tab behavior (navigate to Favorites tab)
              } catch (err) {
                e.preventDefault();
                navigation.navigate('Login');
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
    <CropsStack.Navigator screenOptions={{ headerShown: false }}>
      <CropsStack.Screen name="CropsList" component={CropScreen} />
      <CropsStack.Screen name="CropDetail" component={CropDetailScreen} />
    </CropsStack.Navigator>
  );
}

function RecipesStackScreen() {
  return (
    <RecipesStack.Navigator screenOptions={{ headerShown: false }}>
      <RecipesStack.Screen name="RecipesList" component={RecipeScreen} />
      <RecipesStack.Screen name="AddRecipe" component={AddRecipeScreen} />
      <RecipesStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </RecipesStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
          <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
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
