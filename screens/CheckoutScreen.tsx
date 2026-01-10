import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons'; // For the Back Arrow

import ScreenWrapper from '../components/ScreenWrapper';
import CustomText from '../components/CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Service } from '../types';
import { supabase } from '../lib/supabase';

interface Props {
  service: Service;
  onBack: () => void;
}

export default function CheckoutScreen({ service, onBack }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'GCASH'>('CASH');

  // 1. Get GPS on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need your location to send a therapist.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
    })();
  }, []);

  // 2. Handle Booking Logic
  async function handleConfirmBooking() {
    if (!location) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      const { error } = await supabase.from('bookings').insert([{
        client_id: user.id,
        service_type: service.name, // In a real app, use service_id relation
        total_price: service.price,
        status: 'PENDING',
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: "Pinned Location" // You can add Reverse Geocoding here later
        },
        payment_method: paymentMethod
      }]);

      if (error) throw error;

      Alert.alert('Booking Confirmed!', 'We are finding a therapist for you.', [
        { text: 'OK', onPress: onBack } // Go back home after success
      ]);

    } catch (e: any) {
      Alert.alert('Booking Failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* 1. Header (Floating on top of map) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <CustomText variant="h3">Confirm Location</CustomText>
        <View style={{ width: 40 }} /> 
      </View>

      {/* 2. The Map */}
      <View style={{ flex: 1 }}>
        {location ? (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker coordinate={location.coords} title="Therapist will come here" />
          </MapView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={COLORS.primary} />
            <CustomText>Locating you...</CustomText>
          </View>
        )}
      </View>

      {/* 3. Bottom Sheet (Payment & Confirm) */}
      <View style={styles.bottomSheet}>
        <View style={styles.row}>
          <View>
            <CustomText variant="caption">Service</CustomText>
            <CustomText variant="h3">{service.name}</CustomText>
          </View>
          <View>
            <CustomText variant="caption">Total</CustomText>
            <CustomText variant="h2" color={COLORS.primary}>₱{service.price}</CustomText>
          </View>
        </View>

        {/* Payment Selector */}
        <CustomText variant="caption" style={{ marginTop: 20, marginBottom: 10 }}>Payment Method</CustomText>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            style={[styles.payOption, paymentMethod === 'CASH' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('CASH')}
          >
            <CustomText color={paymentMethod === 'CASH' ? COLORS.primary : COLORS.muted}>Cash</CustomText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.payOption, paymentMethod === 'GCASH' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('GCASH')}
          >
            <CustomText color={paymentMethod === 'GCASH' ? COLORS.primary : COLORS.muted}>GCash</CustomText>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity 
          style={styles.confirmBtn} 
          onPress={handleConfirmBooking}
          disabled={loading || !location}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : (
            <CustomText variant="h3" color={COLORS.white}>Confirm Booking</CustomText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, padding: 10, borderRadius: SIZES.radius,
    ...SHADOWS.light
  },
  backBtn: { padding: 5 },
  bottomSheet: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    paddingBottom: 40,
    borderTopLeftRadius: 25, borderTopRightRadius: 25,
    ...SHADOWS.medium
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payOption: {
    flex: 1, padding: 15, borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center'
  },
  payOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.goldLight },
  confirmBtn: {
    backgroundColor: COLORS.primary, padding: 18, borderRadius: SIZES.radius,
    alignItems: 'center', marginTop: 25, ...SHADOWS.light
  }
});