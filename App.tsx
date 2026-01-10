import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { COLORS } from './constants/theme';

// Screens
import HomeScreen from './screens/HomeScreen';
// We will create this next
import { Service } from './types';
import CheckoutScreen from './screens/CheckoutScreen';

export type ScreenName = 'HOME' | 'CHECKOUT';

export default function App() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold, Lato_400Regular, Lato_700Bold });
  
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('HOME');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
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
        onNavigateToCheckout={(service) => {
          setSelectedService(service);
          setCurrentScreen('CHECKOUT');
        }} 
      />
    </SafeAreaProvider>
  );
}