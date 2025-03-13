
import { Json } from "@/integrations/supabase/types";

export interface SupabaseShopVisit {
  id: string;
  location: Json;
  audio_url?: string | null;
  created_at: string;
  salesperson_id: string;
  shop_name: string;
  notes?: string | null;
  status: 'pending' | 'completed' | 'failed';
  updated_at: string;
}

export interface ShopVisit {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  audio_url?: string;
  created_at: string;
  salesperson_id: string;
  shop_name: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
}

// Helper function to format dates consistently
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

// Convert Supabase data structure to our frontend model
export const convertSupabaseVisit = (visit: SupabaseShopVisit): ShopVisit => {
  let locationObj = typeof visit.location === 'string' 
    ? JSON.parse(visit.location as string) 
    : visit.location;
  
  return {
    id: visit.id,
    location: {
      latitude: locationObj.latitude,
      longitude: locationObj.longitude,
      address: locationObj.address
    },
    audio_url: visit.audio_url || undefined,
    created_at: visit.created_at,
    salesperson_id: visit.salesperson_id,
    shop_name: visit.shop_name,
    notes: visit.notes || undefined,
    status: visit.status
  };
};
