import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import CustomText from './CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface Props {
  booking: any; // TODO: replace with the Booking type once shared to components
  onTrack: () => void; // Opens map tracking
  onHelp?: () => void; // Opens support/help surface
  onPress?: () => void; // Opens detailed view when in compact mode
  mode?: 'full' | 'compact';
  style?: ViewStyle;
}

const STATUS_CONFIG: Record<string, { title: string; subtitle: string; color: string }> = {
  PENDING: {
    title: 'Matching your therapist',
    subtitle: 'Typically under 2 mins based on current demand',
    color: COLORS.primary,
  },
  ACCEPTED: {
    title: 'Therapist confirmed',
    subtitle: 'Getting ready and heading out',
    color: COLORS.success,
  },
  ON_WAY: {
    title: 'On the way',
    subtitle: 'We will notify you when nearby',
    color: COLORS.success,
  },
  IN_PROGRESS: {
    title: 'Session in progress',
    subtitle: 'Hope you are feeling relaxed already',
    color: COLORS.secondary,
  },
};

const PROGRESS_STEPS = ['PENDING', 'ACCEPTED', 'ON_WAY', 'IN_PROGRESS', 'COMPLETED'];

export default function ActiveBookingCard({ booking, onTrack, onHelp, onPress, mode = 'full', style }: Props) {
  if (!booking) return null;

  const status = booking.status || 'PENDING';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const activeIndex = Math.max(PROGRESS_STEPS.indexOf(status), 0);
  const canTrack = ['ACCEPTED', 'ON_WAY', 'IN_PROGRESS'].includes(status);

  const serviceName = booking.service_type || 'Massage service';
  const therapistName = booking.therapist_name || 'Assigned soon';
  const paymentMethod = booking.payment_method || 'On-site payment';

  if (mode === 'compact') {
    const Wrapper: any = onPress ? TouchableOpacity : View;
    return (
      <Wrapper
        style={[styles.compactContainer, style]}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <View>
          <View style={styles.statusPillSmall}>
            <View style={[styles.pillDot, { backgroundColor: config.color }]} />
            <CustomText variant="body" style={styles.pillText}>
              {config.title}
            </CustomText>
          </View>
          <CustomText variant="h3" style={{ marginTop: 6 }}>
            {serviceName}
          </CustomText>
          <CustomText variant="caption" color={COLORS.muted}>
            {therapistName}
          </CustomText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <CustomText variant="caption" color={COLORS.muted}>
            Total
          </CustomText>
          <CustomText variant="h3" color={COLORS.primary}>
            ₱{booking.total_price}
          </CustomText>
          <CustomText variant="body" color={COLORS.secondary} style={{ marginTop: 4, fontWeight: 'bold' }}>
            View >
          </CustomText>
        </View>
      </Wrapper>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.statusPill}>
          <View style={[styles.pillDot, { backgroundColor: config.color }]} />
          <CustomText variant="body" style={styles.pillText}>
            {config.title}
          </CustomText>
        </View>
        <CustomText variant="caption" color={COLORS.muted}>
          ID {booking.id?.slice?.(0, 6) || '—'}
        </CustomText>
      </View>

      <CustomText variant="caption" color={COLORS.muted} style={{ marginBottom: 12 }}>
        {config.subtitle}
      </CustomText>

      <View style={styles.progressRow}>
        {PROGRESS_STEPS.slice(0, -1).map((step, index) => {
          const isActive = activeIndex >= index;
          return (
            <React.Fragment key={step}>
              <View
                style={[
                  styles.stepDot,
                  { backgroundColor: isActive ? config.color : COLORS.border },
                ]}
              />
              {index < PROGRESS_STEPS.length - 2 && (
                <View
                  style={[
                    styles.stepBar,
                    { backgroundColor: activeIndex > index ? config.color : COLORS.border },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.detailGrid}>
        <View style={[styles.detailCell, styles.detailCellRight] }>
          <CustomText variant="caption" color={COLORS.muted}>
            Service
          </CustomText>
          <CustomText variant="h3">{serviceName}</CustomText>
        </View>
        <View style={styles.detailCell}>
          <CustomText variant="caption" color={COLORS.muted}>
            Therapist
          </CustomText>
          <CustomText variant="body">{therapistName}</CustomText>
        </View>
        <View style={[styles.detailCell, styles.detailCellRight] }>
          <CustomText variant="caption" color={COLORS.muted}>
            Payment
          </CustomText>
          <CustomText variant="body" style={{ fontWeight: 'bold' }}>
            {paymentMethod}
          </CustomText>
        </View>
        <View style={styles.detailCell}>
          <CustomText variant="caption" color={COLORS.muted}>
            Total
          </CustomText>
          <CustomText variant="h3" color={COLORS.primary}>
            ₱{booking.total_price}
          </CustomText>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.secondaryBtn, !canTrack && styles.disabledBtn]}
          onPress={onTrack}
          disabled={!canTrack}
        >
          <CustomText variant="body" color={canTrack ? COLORS.secondary : COLORS.muted}>
            {canTrack ? 'Track therapist' : 'We will alert you'}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryBtn, styles.primaryBtnLeft]} onPress={onHelp}>
          <CustomText variant="body" color={COLORS.white}>
            Need help?
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    marginTop: 0,
    borderRadius: SIZES.radius,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.goldLight,
  },
  pillDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  pillText: { fontWeight: 'bold' },
  statusPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: COLORS.goldLight,
    alignSelf: 'flex-start',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepBar: { flex: 1, height: 3, marginHorizontal: 6, borderRadius: 2 },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailCell: {
    flexBasis: '48%',
    marginBottom: 12,
  },
  detailCellRight: {
    marginRight: SIZES.base,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginRight: 12,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  primaryBtnLeft: {
    marginLeft: 0,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
});