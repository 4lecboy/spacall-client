import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

// Hardcoded services for the prototype
const SERVICES = [
  { id: 'swedish', name: 'Swedish Massage', price: 500, duration: '60 min' },
  { id: 'shiatsu', name: 'Shiatsu Massage', price: 600, duration: '60 min' },
  { id: 'thai', name: 'Thai Massage', price: 550, duration: '90 min' },
];

interface ServiceModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  location: { latitude: number; longitude: number };
}

export default function ServiceModal({ visible, onClose, userId, location }: ServiceModalProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleBooking() {
    if (!selectedService) {
      Alert.alert('Select a service first');
      return;
    }

    setLoading(true);

    const serviceDetails = SERVICES.find(s => s.id === selectedService);

    // 1. Insert the booking into Supabase
    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          client_id: userId,
          service_type: serviceDetails?.name,
          total_price: serviceDetails?.price,
          status: 'PENDING',
          location: { // We save the coordinates as a JSON object
            latitude: location.latitude,
            longitude: location.longitude,
            address: "Current GPS Location"
          }
        }
      ]);

    setLoading(false);

    if (error) {
      Alert.alert('Booking Failed', error.message);
      console.log(error);
    } else {
      Alert.alert('Success!', 'Finding a therapist near you...');
      onClose(); // Close the modal
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Service</Text>

          {/* Service List */}
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceItem,
                selectedService === service.id && styles.selectedItem
              ]}
              onPress={() => setSelectedService(service.id)}
            >
              <View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
              </View>
              <Text style={styles.servicePrice}>₱{service.price}</Text>
            </TouchableOpacity>
          ))}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bookButton, !selectedService && styles.disabledButton]}
              onPress={handleBooking}
              disabled={loading || !selectedService}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookText}>Book Now</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background, // Cream background
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: SIZES.padding,
    height: '55%',
    ...SHADOWS.medium,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: COLORS.white, // White cards on cream background
    borderRadius: SIZES.radius,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedItem: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAF6EE', // A very light gold tint
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary
  },
  serviceDuration: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary // Gold price
  },

  buttonRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  cancelButton: { flex: 1, padding: 15, alignItems: 'center' },
  cancelText: { color: 'red', fontWeight: 'bold' },
  bookButton: { flex: 2, backgroundColor: '#841584', padding: 15, borderRadius: 10, alignItems: 'center' },
  disabledButton: { backgroundColor: '#ccc' },
  bookText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});