import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: object;
}

export default function ScreenWrapper({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar style for Android/iOS */}
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={[styles.content, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
});