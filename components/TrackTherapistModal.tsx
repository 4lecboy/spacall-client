import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import CustomText from './CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface TherapistLocation {
    latitude: number;
    longitude: number;
    timestamp?: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    booking: any;
}

export default function TrackTherapistModal({ visible, onClose, booking }: Props) {
    const mapRef = useRef<MapView>(null);
    const [clientLocation, setClientLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [therapistLocation, setTherapistLocation] = useState<TherapistLocation | null>(null);
    const [estimatedTime, setEstimatedTime] = useState<string>('Calculating...');
    const [distance, setDistance] = useState<string>('--');

    // Get client's current location
    useEffect(() => {
        if (visible) {
            (async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('Location permission not granted');
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                setClientLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            })();
        }
    }, [visible]);

    // Subscribe to therapist location updates
    useEffect(() => {
        if (!visible || !booking?.id) return;

        // Initial fetch
        const fetchTherapistLocation = async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('therapist_latitude, therapist_longitude, therapist_location_updated_at')
                .eq('id', booking.id)
                .single();

            if (data && data.therapist_latitude && data.therapist_longitude) {
                setTherapistLocation({
                    latitude: data.therapist_latitude,
                    longitude: data.therapist_longitude,
                    timestamp: data.therapist_location_updated_at,
                });
            }
        };

        fetchTherapistLocation();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`therapist_location_${booking.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${booking.id}`,
                },
                (payload) => {
                    const { therapist_latitude, therapist_longitude, therapist_location_updated_at } = payload.new;
                    if (therapist_latitude && therapist_longitude) {
                        setTherapistLocation({
                            latitude: therapist_latitude,
                            longitude: therapist_longitude,
                            timestamp: therapist_location_updated_at,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [visible, booking?.id]);

    // Calculate distance and ETA
    useEffect(() => {
        if (clientLocation && therapistLocation) {
            const dist = calculateDistance(
                clientLocation.latitude,
                clientLocation.longitude,
                therapistLocation.latitude,
                therapistLocation.longitude
            );
            setDistance(dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`);

            // Estimate time: Assume average speed of 30 km/h in city
            const estimatedMinutes = Math.round((dist / 30) * 60);
            setEstimatedTime(estimatedMinutes < 1 ? '< 1 min' : `${estimatedMinutes} min`);

            // Fit map to show both locations
            if (mapRef.current) {
                mapRef.current.fitToCoordinates(
                    [clientLocation, therapistLocation],
                    {
                        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                        animated: true,
                    }
                );
            }
        }
    }, [clientLocation, therapistLocation]);

    // Haversine formula to calculate distance between two coordinates
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const toRad = (value: number): number => {
        return (value * Math.PI) / 180;
    };

    if (!clientLocation) {
        return (
            <Modal visible={visible} animationType="slide" transparent={false}>
                <View style={styles.loadingContainer}>
                    <CustomText variant="h3">Loading map...</CustomText>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <CustomText variant="h3">Track Therapist</CustomText>
                        <CustomText variant="caption" color={COLORS.muted}>
                            {booking?.therapist_name || 'Therapist'}
                        </CustomText>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color={COLORS.secondary} />
                    </TouchableOpacity>
                </View>

                {/* Map */}
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                        latitude: clientLocation.latitude,
                        longitude: clientLocation.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {/* Client Location Marker */}
                    <Marker
                        coordinate={clientLocation}
                        title="Your Location"
                        description="Therapist is coming here"
                        pinColor={COLORS.primary}
                    >
                        <View style={styles.clientMarker}>
                            <Ionicons name="home" size={24} color={COLORS.white} />
                        </View>
                    </Marker>

                    {/* Therapist Location Marker */}
                    {therapistLocation && (
                        <Marker
                            coordinate={therapistLocation}
                            title={booking?.therapist_name || 'Therapist'}
                            description="Current location"
                        >
                            <View style={styles.therapistMarker}>
                                <Ionicons name="person" size={24} color={COLORS.white} />
                            </View>
                        </Marker>
                    )}

                    {/* Route Line */}
                    {therapistLocation && (
                        <Polyline
                            coordinates={[therapistLocation, clientLocation]}
                            strokeColor={COLORS.secondary}
                            strokeWidth={3}
                            lineDashPattern={[5, 5]}
                        />
                    )}
                </MapView>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location" size={20} color={COLORS.secondary} />
                            <View style={{ marginLeft: 8 }}>
                                <CustomText variant="caption" color={COLORS.muted}>
                                    Distance
                                </CustomText>
                                <CustomText variant="h3">{distance}</CustomText>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="time" size={20} color={COLORS.secondary} />
                            <View style={{ marginLeft: 8 }}>
                                <CustomText variant="caption" color={COLORS.muted}>
                                    ETA
                                </CustomText>
                                <CustomText variant="h3">{estimatedTime}</CustomText>
                            </View>
                        </View>
                    </View>

                    {therapistLocation?.timestamp && (
                        <CustomText variant="caption" color={COLORS.muted} style={{ marginTop: 12, textAlign: 'center' }}>
                            Last updated: {new Date(therapistLocation.timestamp).toLocaleTimeString()}
                        </CustomText>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 16,
        backgroundColor: COLORS.white,
        ...SHADOWS.medium,
    },
    closeButton: {
        padding: 8,
    },
    map: {
        flex: 1,
        width: width,
        height: height,
    },
    clientMarker: {
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: COLORS.white,
        ...SHADOWS.medium,
    },
    therapistMarker: {
        backgroundColor: COLORS.secondary,
        padding: 10,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: COLORS.white,
        ...SHADOWS.medium,
    },
    infoCard: {
        position: 'absolute',
        bottom: 30,
        left: SIZES.padding,
        right: SIZES.padding,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 20,
        ...SHADOWS.medium,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
