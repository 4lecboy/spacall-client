import { useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UseAuthSessionReturn {
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

/**
 * Custom hook to manage authentication session
 * Handles session retrieval, sign out, and state management
 */
export const useAuthSession = (): UseAuthSessionReturn => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const getSession = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        } catch (error) {
            console.error('Error fetching session:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSignOut = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            setSession(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, []);

    useEffect(() => {
        getSession();

        // Subscribe to auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [getSession]);

    return {
        session,
        loading,
        signOut: handleSignOut,
    };
};
