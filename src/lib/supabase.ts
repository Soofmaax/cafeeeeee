import { createClient } from '@supabase/supabase-js';
import { features } from '@/lib/features';

// Valid local placeholders keep the application importable in preview mode. No
// request is made by application pages while the Supabase feature is disabled.
const supabaseUrl = features.supabase
  ? process.env.NEXT_PUBLIC_SUPABASE_URL!
  : 'http://127.0.0.1:54321';
const supabaseAnonKey = features.supabase
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  : 'preview-mode-no-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ProductVariation {
  id: string;
  name: string;
  sku: string;
  attribute: string;
  price_cents: number;
  weight: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  image: string;
  weight: string;
  stock: number;
  created_at: string;
  sku: string | null;
  category: string | null;
  short_description: string | null;
  origin: string | null;
  aromatic_notes: string | null;
  intensity: string | null;
  preparation_guide: string | null;
  images: string[] | null;
  variations: ProductVariation[] | null;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  email: string;
  total_cents: number;
  shipping_method: string;
  items_snapshot: string;
  created_at: string;
  shipping_type: string | null;
  relay_info: { id?: string; name?: string; address?: string } | null;
  customer_phone: string | null;
  shipping_cost: number;
  stripe_session_id: string | null;
  status: string;
}
