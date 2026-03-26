import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import ChallengeSelectScreen from '../screens/ChallengeSelectScreen';
import PressToEnterScreen from '../screens/PressToEnterScreen';
import HomeScreen from '../screens/HomeScreen';
import SportScreen from '../screens/SportScreen';
import BookScreen from '../screens/BookScreen';
import NutritionScreen from '../screens/NutritionScreen';
import AcademicScreen from '../screens/AcademicScreen';
import PersonalTimeScreen from '../screens/PersonalTimeScreen';
import SocialScreen from '../screens/SocialScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomChallengeScreen from '../screens/CustomChallengeScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  ChallengeSelect: undefined;
  PressToEnter: { challenges: string[] };
  Home: undefined;
  Sport: undefined;
  Book: undefined;
  Nutrition: undefined;
  Academic: undefined;
  PersonalTime: undefined;
  Social: undefined;
  Settings: undefined;
  CustomChallenge: { id: string; name: string; emoji: string; color: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, userData, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : !userData?.startDate ? (
          <>
            <Stack.Screen name="ChallengeSelect" component={ChallengeSelectScreen} />
            <Stack.Screen name="PressToEnter" component={PressToEnterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="PressToEnter" component={PressToEnterScreen} />
            <Stack.Screen name="Sport" component={SportScreen} />
            <Stack.Screen name="Book" component={BookScreen} />
            <Stack.Screen name="Nutrition" component={NutritionScreen} />
            <Stack.Screen name="Academic" component={AcademicScreen} />
            <Stack.Screen name="PersonalTime" component={PersonalTimeScreen} />
            <Stack.Screen name="Social" component={SocialScreen} />
            <Stack.Screen name="CustomChallenge" component={CustomChallengeScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
