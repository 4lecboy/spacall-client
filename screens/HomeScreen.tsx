import React, { useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Platform, TextInput, ScrollView } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomText from '../components/CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Service } from '../types';
import ServiceDetailModal from '../components/ServiceDetailModal';
import ActiveBookingCard from '../components/ActiveBookingCard';
import TrackTherapistModal from '../components/TrackTherapistModal';
import AuthModal from '../components/AuthModal';
import ServiceCard from '../components/ServiceCard';
import ServicesGrid from '../components/ServicesGrid';
import FeaturedCarousel from '../components/FeaturedCarousel';
import FooterAuth from '../components/FooterAuth';
import { useServices, useActiveBooking } from '../hooks';
import { Session } from '@supabase/supabase-js';

interface Props {
  onNavigateToCheckout: (service: Service) => void;
  session: Session | null;
  onSignOut: () => Promise<void>;
}

/**
 * HomeScreen Component
 * Main landing screen displaying services, active bookings, and authentication
 * Orchestrates hooks and modular components for service browsing and booking
 */
export default function HomeScreen({ onNavigateToCheckout, session, onSignOut }: Props) {
  // State management
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [bookingDetailsVisible, setBookingDetailsVisible] = useState(false);
  const [trackModalVisible, setTrackModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Service['category']>('All');

  // Custom hooks for data fetching and session management
  const { services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices();
  const { activeBooking } = useActiveBooking(session);

  const categories: Array<'All' | Service['category']> = ['All', 'Classic', 'Therapeutic', 'Premium', 'Add-on'];

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesCategory = selectedCategory === 'All' ? true : s.category === selectedCategory;
      const matchesSearch = searchQuery.trim().length === 0
        ? true
        : s.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

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
    setTrackModalVisible(true);
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
    await onSignOut();
  }, [onSignOut]);

  return (
    <ScreenWrapper>
      {/* Single scrollable area via FlatList (header + featured + grid) */}
      <ServicesGrid
        services={filteredServices}
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
                <CustomText variant="h1">Good Morning!</CustomText>
                <CustomText variant="caption">Spacall App</CustomText>
              </View>

              {session && (
                <TouchableOpacity onPress={handleSignOut} style={{ padding: 8 }}>
                  <CustomText variant="body" color={COLORS.primary}>
                    Log Out
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>

            {/* Search Bar */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor={COLORS.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.searchButton} onPress={() => { /* no-op, live search */ }}>
                <CustomText variant="h3" color={COLORS.white}>🔍</CustomText>
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <View style={{ marginTop: 16 }}>
              <CustomText variant="h3" style={{ marginBottom: 8 }}>Category</CustomText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
                {categories.map(cat => {
                  const active = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={{ marginRight: 16, paddingBottom: 6 }}
                      activeOpacity={0.7}
                    >
                      <CustomText variant="body" color={active ? COLORS.secondary : COLORS.muted}>
                        {cat}
                      </CustomText>
                      <View style={{ height: 3, marginTop: 6, backgroundColor: active ? COLORS.primary : 'transparent', borderRadius: 2 }} />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Featured / Best Services Carousel */}
            <FeaturedCarousel services={filteredServices} onPress={handleServicePress} />
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

      {/* Track Therapist Modal */}
      {activeBooking && (
        <TrackTherapistModal
          visible={trackModalVisible}
          onClose={() => setTrackModalVisible(false)}
          booking={activeBooking}
        />
      )}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.secondary,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderTopRightRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
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