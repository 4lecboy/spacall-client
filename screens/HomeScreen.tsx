import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomText from '../components/CustomText';
import { COLORS, SIZES } from '../constants/theme';
import { Service } from '../types';
import ServiceDetailModal from '../components/ServiceDetailModal';
import ActiveBookingCard from '../components/ActiveBookingCard';
import AuthModal from '../components/AuthModal';
import ServiceCard from '../components/ServiceCard';
import ServicesGrid from '../components/ServicesGrid';
import FeaturedCarousel from '../components/FeaturedCarousel';
import FooterAuth from '../components/FooterAuth';
import { useServices, useAuthSession, useActiveBooking } from '../hooks';

interface Props {
  onNavigateToCheckout: (service: Service) => void;
}

/**
 * HomeScreen Component
 * Main landing screen displaying services, active bookings, and authentication
 * Orchestrates hooks and modular components for service browsing and booking
 */
export default function HomeScreen({ onNavigateToCheckout }: Props) {
  // State management
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [bookingDetailsVisible, setBookingDetailsVisible] = useState(false);

  // Custom hooks for data fetching and session management
  const { services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices();
  const { session, signOut } = useAuthSession();
  const { activeBooking } = useActiveBooking(session);

  /**
   * Handle service card press - open service detail modal
   */
  const handleServicePress = useCallback((service: Service) => {
    setSelectedService(service);
    setModalVisible(true);
  }, []);

  /**
   * Handle "Book Now" button press
   * Routes to checkout if logged in, otherwise opens auth modal
   */
  const handleBookPress = useCallback(() => {
    // Close the Service Detail modal first
    setModalVisible(false);

    if (session) {
      // SCENARIO A: Logged In -> Go to Checkout
      if (selectedService) {
        onNavigateToCheckout(selectedService);
      }
    } else {
      // SCENARIO B: Guest -> Open Auth Modal
      setAuthModalVisible(true);
    }
  }, [session, selectedService, onNavigateToCheckout]);

  /**
   * Handle successful authentication
   * Close auth modal and proceed to checkout
   */
  const handleAuthSuccess = useCallback(() => {
    setAuthModalVisible(false);
    // Immediate gratification: Go straight to checkout after login
    setTimeout(() => {
      if (selectedService) {
        onNavigateToCheckout(selectedService);
      }
    }, 500);
  }, [selectedService, onNavigateToCheckout]);

  const handleTrack = useCallback(() => {
    alert('Map Tracking coming soon!');
  }, []);

  const openBookingDetails = useCallback(() => {
    setBookingDetailsVisible(true);
  }, []);

  const closeBookingDetails = useCallback(() => {
    setBookingDetailsVisible(false);
  }, []);

  /**
   * Handle sign out
   */
  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <ScreenWrapper>
      {/* Single scrollable area via FlatList (header + featured + grid) */}
      <ServicesGrid
        services={services}
        loading={servicesLoading}
        error={servicesError}
        onServicePress={handleServicePress}
        onRefresh={refetchServices}
        listHeaderComponent={(
          <View>
            {/* Header */}
            <View
              style={{
                marginVertical: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <CustomText variant="caption">Good Morning,</CustomText>
                <CustomText variant="h1">Relaxation awaits.</CustomText>
              </View>

              {session && (
                <TouchableOpacity onPress={handleSignOut} style={{ padding: 8 }}>
                  <CustomText variant="body" color={COLORS.primary}>
                    Log Out
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>

            {/* Featured / Best Services Carousel */}
            <FeaturedCarousel services={services} onPress={handleServicePress} />
          </View>
        )}
      />

      {activeBooking && (
        <>
          <View style={styles.stickyBooking}>
            <ActiveBookingCard
              booking={activeBooking}
              mode="compact"
              onPress={openBookingDetails}
              onTrack={handleTrack}
            />
          </View>

          <Modal
            visible={bookingDetailsVisible}
            transparent
            animationType="slide"
            onRequestClose={closeBookingDetails}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeBookingDetails} />
              <View style={styles.modalCardWrapper}>
                <ActiveBookingCard
                  booking={activeBooking}
                  onTrack={handleTrack}
                  onHelp={() => alert('Support coming soon!')}
                />
              </View>
            </View>
          </Modal>
        </>
      )}

      {/* 2. Footer Authentication Component */}
      <FooterAuth visible={!session} onLoginPress={() => setAuthModalVisible(true)} />

      {/* 3. Modals */}
      <ServiceDetailModal
        visible={modalVisible}
        service={selectedService}
        onClose={() => setModalVisible(false)}
        onBook={handleBookPress}
      />

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={handleAuthSuccess}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  stickyBooking: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: SIZES.padding,
    right: SIZES.padding,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCardWrapper: {
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
});