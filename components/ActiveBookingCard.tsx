import React from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface Props {
  booking: any; // We'll type this properly later
  onTrack: () => void; // Click to see map again
}

export default function ActiveBookingCard({ booking, onTrack }: Props) {
  if (!booking) return null;

  const isAccepted = booking.status === 'ACCEPTED';

  return (
    <View style={styles.container}>
      {/* Status Indicator */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.dot, { backgroundColor: isAccepted ? COLORS.success : COLORS.primary }]} />
          <CustomText variant="h3" style={{ marginLeft: 10 }}>
            {isAccepted ? 'Therapist is on the way!' : 'Finding a therapist...'}
          </CustomText>
        </View>
        {!isAccepted && <ActivityIndicator color={COLORS.primary} size="small" />}
      </View>

      <View style={styles.divider} />

      {/* Details */}
      <View style={styles.row}>
        <View>
          <CustomText variant="caption">Service</CustomText>
          <CustomText variant="body">{booking.service_type}</CustomText>
        </View>
        <View>
          <CustomText variant="caption">Price</CustomText>
          <CustomText variant="h3" color={COLORS.primary}>₱{booking.total_price}</CustomText>
        </View>
      </View>
      
      <View style={{ marginTop: 10 }}>
         <CustomText variant="caption">Payment Method</CustomText>
         <CustomText variant="body" style={{fontWeight: 'bold'}}>{booking.payment_method}</CustomText>
      </View>

      {/* Action Button */}
      {isAccepted && (
        <TouchableOpacity style={styles.trackBtn} onPress={onTrack}>
          <CustomText variant="body" color={COLORS.white} style={{ fontWeight: 'bold' }}>
            Track Location
          </CustomText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    marginTop: 0,
    borderRadius: SIZES.radius,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.primary, // Gold border to make it pop
    ...SHADOWS.medium,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  trackBtn: {
    marginTop: 15,
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  }
});