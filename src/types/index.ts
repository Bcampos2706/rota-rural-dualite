export type UserRole = 'buyer' | 'supplier' | 'transporter';

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
}

export interface Address {
  id: string;
  user_id?: string;
  label?: string;
  street: string;
  district: string;
  city: string;
  state: string;
  cep: string;
  is_default: boolean; // Changed to match DB snake_case convention or mapped
}

export interface QuoteRequest {
  id: string;
  buyerId: string; // Mapped from buyer_id
  buyerName: string; // Mapped from profiles
  product: Product;
  quantity: number;
  deliveryType: 'delivery' | 'pickup'; // Mapped from delivery_type
  radius: number;
  address?: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: string; // Mapped from created_at
  proposals: Proposal[];
}

export interface Proposal {
  id: string;
  quoteId: string; // Mapped from quote_id
  supplierId: string; // Mapped from supplier_id
  supplierName: string; // Mapped from profiles
  price: number;
  deliveryDate: string; // Mapped from delivery_date
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected';
  attachment?: string;
}

export interface Message {
  id: string;
  quote_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_system_message?: boolean;
}

export interface Promotion {
  id: number;
  supplierId: string;
  supplierName: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  promoPrice: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_name?: string;
  document?: string; // CPF/CNPJ
  phone?: string;
  address?: string;
  branch?: string;
  categories?: string[];
  avatar_url?: string;
}
