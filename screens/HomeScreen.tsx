import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, Platform, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomText from '../components/CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { fetchServices } from '../lib/api';
import { Service } from '../types';

interface Props {
  onNavigateToCheckout: (service: Service) => void;
}
import ServiceDetailModal from '../components/ServiceDetailModal';
import ActiveBookingCard from '../components/ActiveBookingCard';
import { supabase } from '../lib/supabase';
import AuthModal from '../components/AuthModal';
import { Session } from '@supabase/supabase-js';

export default function HomeScreen({ onNavigateToCheckout }: Props) {
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [activeBooking, setActiveBooking] = useState<any>(null);

        // When a card is tapped
    const handleServicePress = (service: Service) => {
    setSelectedService(service);
    setModalVisible(true);
    };

    // When "Book Now" is tapped inside the modal
    const handleBookPress = () => {
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
    };

    const handleAuthSuccess = () => {
      setAuthModalVisible(false);
      // Immediate gratification: Go straight to checkout after login
      setTimeout(() => {
        if (selectedService) {
          onNavigateToCheckout(selectedService);
        }
      }, 500);
    };

  useEffect(() => {
    let activeChannel: any = null;

    async function initialize() {
      // 1. Get Session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // 2. Fetch Initial Data
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('client_id', session.user.id)
          .in('status', ['PENDING', 'ACCEPTED', 'ON_WAY']) 
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) setActiveBooking(data);

        // 3. Subscribe to Realtime Updates
        console.log("🔌 Subscribing to updates for user:", session.user.id);
        
        activeChannel = supabase
          .channel('home_booking_updates')
          .on(
            'postgres_changes',
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'bookings', 
              filter: `client_id=eq.${session.user.id}` 
            },
            (payload) => {
              console.log("🔔 UPDATE RECEIVED:", payload.new.status);
              
              if (payload.new.status === 'COMPLETED') {
                setActiveBooking(null);
                alert('Massage Completed. Thank you!');
              } else {
                // Force a state update with the new data
                setActiveBooking(prev => ({ ...prev, ...payload.new }));
              }
            }
          )
          .subscribe((status) => {
            console.log("📡 Channel Status:", status);
          });
      }
    }

    initialize();

    // Cleanup: Unsubscribe when screen closes
    return () => {
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, []);

  async function loadData() {
    try {
      const data = await fetchServices();
      setServices(data);
    } catch (e) {
      console.log(e);
    }
  }

  // Render a Single Service Card (We will move this to its own component later)
  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleServicePress(item)}
      style={{ flex: 1 }}
    >
      <View style={{
        backgroundColor: COLORS.white,
        marginBottom: 16,
        borderRadius: SIZES.radius,
        padding: 12,
        flexDirection: 'column',
        alignItems: 'flex-start',
        ...SHADOWS.light,
        marginHorizontal: 4,
      }}>
        {/* Image/Header */}
        <View style={{
          width: '100%', height: 110, borderRadius: SIZES.radius, backgroundColor: COLORS.goldLight, marginBottom: 12, overflow: 'hidden'
        }} />

        <View style={{ width: '100%' }}>
          <CustomText variant="h3">{item.name}</CustomText>
          <CustomText variant="caption">{item.duration_min} mins • {item.category}</CustomText>
          <CustomText variant="body" color={COLORS.primary} style={{ marginTop: 8 }}>
            ₱{item.price}
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      {/* 1. Header & List (Wrap them in a View with flex:1 to push footer down) */}
      <View style={{ flex: 1 }}>
        <View style={{ marginVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <CustomText variant="caption">Good Morning,</CustomText>
            <CustomText variant="h1">Relaxation awaits.</CustomText>
          </View>

          {session && (
            <TouchableOpacity
              onPress={async () => { await supabase.auth.signOut(); setSession(null); }}
              style={{ padding: 8 }}
            >
              <CustomText variant="body" color={COLORS.primary}>Log Out</CustomText>
            </TouchableOpacity>
          )}
        </View>

        {/* NEW: Show Active Booking if exists */}
        {activeBooking && (
          <View style={{ marginBottom: 20 }}>
            <ActiveBookingCard 
              booking={activeBooking} 
              onTrack={() => alert('Map Tracking coming soon!')} 
            />
          </View>
        )}

        <FlatList 
          data={services}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      </View>

      {/* 2. THE NEW FOOTER (Only visible if NOT logged in) */}
      {!session && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: COLORS.white,
          padding: SIZES.padding,
          paddingBottom: Platform.OS === 'ios' ? 40 : SIZES.padding,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...SHADOWS.medium
        }}>
          <View>
             <CustomText variant="body">Have an account?</CustomText>
             <CustomText variant="caption">Log in to view your bookings.</CustomText>
          </View>

          <TouchableOpacity 
            style={{
              backgroundColor: COLORS.secondary,
              paddingVertical: 12,
              paddingHorizontal: 25,
              borderRadius: SIZES.radius,
            }}
            onPress={() => setAuthModalVisible(true)}
          >
            <CustomText variant="h3" color={COLORS.white}>Log In</CustomText>
          </TouchableOpacity>
        </View>
      )}

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