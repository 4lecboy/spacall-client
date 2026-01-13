import { useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Booking {
    id: string;
    client_id: string;
    service_id: string;
    therapist_id?: string;
    status: 'PENDING' | 'ACCEPTED' | 'ON_WAY' | 'ARRIVED' | 'IN_SESSION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    created_at: string;
    [key: string]: any;
}

interface UseActiveBookingReturn {
    activeBooking: Booking | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Custom hook to manage active booking state and realtime updates
 * Fetches initial booking and subscribes to realtime changes
 */
export const useActiveBooking = (session: Session | null): UseActiveBookingReturn => {
    const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchInitialBooking = useCallback(async (userId: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('bookings')
                .select('*')
                .eq('client_id', userId)
                .in('status', ['PENDING', 'ACCEPTED', 'ON_WAY', 'ARRIVED', 'IN_SESSION'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                // PGRST116 is "no rows returned" which is expected
                throw fetchError;
            }

            setActiveBooking(data || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch active booking');
            setError(error);
            console.error('Error fetching active booking:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const subscribeToBookingUpdates = useCallback((userId: string) => {
        console.log('🔌 Subscribing to booking updates for user:', userId);

        const channel = supabase
            .channel(`booking_updates_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `client_id=eq.${userId}`,
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    console.log('🔔 Booking update received:', newStatus);

                    if (newStatus === 'COMPLETED') {
                        setActiveBooking(null);
                        alert('Massage Completed. Thank you!');
                    } else if (['PENDING', 'ACCEPTED', 'ON_WAY', 'ARRIVED', 'IN_SESSION'].includes(newStatus)) {
                        setActiveBooking((prev) => ({
                            ...(prev as Booking),
                            ...payload.new,
                        } as Booking));
                    }
                }
            )
            .subscribe((status) => {
                console.log('📡 Channel subscription status:', status);
            });

        return channel;
    }, []);

    useEffect(() => {
        let channel: any = null;

        if (session?.user?.id) {
            fetchInitialBooking(session.user.id);
            channel = subscribeToBookingUpdates(session.user.id);
        } else {
            setActiveBooking(null);
            setLoading(false);
        }

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [session?.user?.id, fetchInitialBooking, subscribeToBookingUpdates]);

    return {
        activeBooking,
        loading,
        error,
    };
};
