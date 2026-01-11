export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number;
  category: 'Classic' | 'Therapeutic' | 'Premium' | 'Add-on';
  image_url: string | null;
  // Mark top/best/featured services with this flag. Use `featured` for clarity.
  featured?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'CLIENT' | 'THERAPIST' | 'ADMIN';
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
}

// We will add Booking interfaces here later