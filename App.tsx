import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { COLORS } from './constants/theme';

// Screens
import HomeScreen from './screens/HomeScreen';
import { Service } from './types';
import CheckoutScreen from './screens/CheckoutScreen';
import LoginScreen from './screens/LoginScreen';
import { useAuthSession } from './hooks';

export type ScreenName = 'HOME' | 'CHECKOUT';

export default function App() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold, Lato_400Regular, Lato_700Bold });
  const { session, loading: authLoading, signOut } = useAuthSession();
  const [guestMode, setGuestMode] = useState(false);

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('HOME');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleSkip = () => setGuestMode(true);

  const handleLoginSuccess = () => {
    setGuestMode(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setGuestMode(false);
    setSelectedService(null);
    setCurrentScreen('HOME');
  };

  if (!fontsLoaded || authLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!session && !guestMode) {
    return (
      <SafeAreaProvider>
        <LoginScreen onSkip={handleSkip} onLoginSuccess={handleLoginSuccess} />
      </SafeAreaProvider>
    );
  }

  // Simple Router
  if (currentScreen === 'CHECKOUT' && selectedService) {
    return (
      <SafeAreaProvider>
        <CheckoutScreen
          service={selectedService}
          onBack={() => setCurrentScreen('HOME')}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <HomeScreen
        session={session}
        onSignOut={handleSignOut}
        onNavigateToCheckout={(service) => {
          setSelectedService(service);
          setCurrentScreen('CHECKOUT');
        }}
      />
    </SafeAreaProvider>
  );
}