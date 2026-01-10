import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ServiceModal from './components/ServiceModal';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // 1. Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for login/logout events
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    // Only fetch location if we have a session (user is logged in)
    if (session) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
        setLoading(false);
      })();
    } else {
      setLoading(false); // Stop loading if we are just showing the Auth screen
    }
  }, [session]);

  // SCENARIO 1: User is NOT logged in -> Show Auth Screen
  if (!session) {
    return <Auth />;
  }

  // SCENARIO 2: User IS logged in, but we are fetching GPS -> Show Loading
  if (loading || !location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Finding your location...</Text>
      </View>
    );
  }

  // SCENARIO 3: User IS logged in and we have GPS -> Show Map
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Pickup Location"
          description="I want the massage here"
        />
      </MapView>
      
      {/* Logout Button (Temporary) */}
      <View style={styles.logoutButton}>
        <Text style={{color: 'blue'}} onPress={() => supabase.auth.signOut()}>
          Log Out
        </Text>
      </View>

      {/* NEW: The Book Button */}
      <View style={styles.bottomContainer}>
        <Text style={styles.addressText}>
          Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
        </Text>
        <View style={styles.btnWrapper}> 
            <Text 
                style={styles.bookBtn} 
                onPress={() => setModalVisible(true)}
            >
                Request Massage
            </Text>
        </View>
      </View>

      {/* NEW: The Modal Component */}
      {session && location && (
        <ServiceModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)}
          userId={session.user.id}
          location={{
             latitude: location.coords.latitude, 
             longitude: location.coords.longitude
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addressText: {
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  btnWrapper: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  bookBtn: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  }
});