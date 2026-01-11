import { supabase } from './supabase';
import { Service } from '../types';

/**
 * FETCH SERVICES
 * Returns the list of active services from the database.
 * Maps is_featured from DB to featured in TypeScript interface.
 * Used in: Home Screen (Guest Mode)
 */
export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error.message);
    throw new Error(error.message);
  }

  // Map is_featured from DB to featured in TypeScript
  return (data || []).map((service: any) => ({
    ...service,
    featured: service.is_featured ?? false,
  })) as Service[];
}

/**
 * FETCH SINGLE SERVICE
 * Useful if we want to show a detailed modal later
 */
export async function fetchServiceById(id: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Service;
}