import React, { useState } from 'react';
import { View, Modal, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur'; // optional polish, standard view works too
import CustomText from './CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Service } from '../types';
import { getServiceImage } from '../constants/serviceImages';

interface Props {
  visible: boolean;
  service: Service | null;
  onClose: () => void;
  onBook: () => void;
}

export default function ServiceDetailModal({ visible, service, onClose, onBook }: Props) {
  if (!service) return null;

  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const local = getServiceImage(service);
  const shouldUseRemote = !!service.image_url && !useLocalFallback;
  const source = shouldUseRemote ? { uri: service.image_url as string } : local;

  const handleImageError = () => {
    if (!useLocalFallback && local) {
      setUseLocalFallback(true);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      {/* 1. Backdrop (Tap to close) */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      {/* 2. Modal Content */}
      <View style={styles.container}>
        {/* Grey Handle Bar (Visual cue to swipe down) */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* 3. Image Header (Placeholder logic for now) */}
        <View style={styles.imageContainer}>
          {source ? (
            <Image
              source={source}
              style={styles.image}
              resizeMode="cover"
              onError={handleImageError}
            />
          ) : (
            <View style={[styles.image, { backgroundColor: COLORS.goldLight }]} />
          )}
        </View>

        {/* 4. Text Content */}
        <ScrollView style={styles.content}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <CustomText variant="h2">{service.name}</CustomText>
              <CustomText variant="caption">{service.category} • {service.duration_min} mins</CustomText>
            </View>
            <CustomText variant="h2" color={COLORS.primary}>₱{service.price}</CustomText>
          </View>

          <View style={styles.divider} />

          <CustomText variant="h3" style={{ marginBottom: 8 }}>Description</CustomText>
          <CustomText variant="body" style={{ lineHeight: 24 }}>
            {service.description}
          </CustomText>
        </ScrollView>

        {/* 5. Sticky Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.bookBtn} onPress={onBook}>
            <CustomText variant="h3" color={COLORS.white}>Book Appointment</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    height: '85%', // Takes up most of the screen
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 'auto',
    ...SHADOWS.medium,
  },
  handleContainer: { alignItems: 'center', paddingVertical: 15 },
  handle: { width: 50, height: 5, backgroundColor: '#E0E0E0', borderRadius: 5 },

  imageContainer: {
    height: 200,
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: { width: '100%', height: '100%' },

  content: { paddingHorizontal: SIZES.padding },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 20 },

  footer: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.light,
  },
});