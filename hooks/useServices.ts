import { useEffect, useState, useCallback } from 'react';
import { Service } from '../types';
import { fetchServices } from '../lib/api';

interface UseServicesReturn {
    services: Service[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to manage service fetching and state
 * Handles loading, error states, and provides refetch capability
 */
export const useServices = (): UseServicesReturn => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadServices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchServices();
            setServices(data);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch services');
            setError(error);
            console.error('Error loading services:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    return {
        services,
        loading,
        error,
        refetch: loadServices,
    };
};
