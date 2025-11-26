import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { QuoteRequest, Product, Proposal, UserRole, Address, Promotion, UserProfile } from '../types';

// --- Static Data for UI consistency ---
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Semente de Soja Intacta', category: 'Sementes', unit: 'kg' },
  { id: '2', name: 'Adubo NPK 04-14-08', category: 'Fertilizantes', unit: 'ton' },
  { id: '3', name: 'Glifosato 480', category: 'Defensivos', unit: 'L' },
  { id: '4', name: 'Milho Híbrido', category: 'Sementes', unit: 'sc' },
];

interface StoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: UserProfile | null;
  quotes: QuoteRequest[];
  products: Product[];
  addresses: Address[];
  promotions: Promotion[];
  isLoading: boolean;
  addQuote: (quote: any) => Promise<void>;
  addProposal: (quoteId: string, proposal: any) => Promise<void>;
  acceptProposal: (quoteId: string, proposalId: string) => Promise<void>;
  finalizeOrder: (quoteId: string) => Promise<void>;
  addPromotion: (promo: any) => Promise<void>;
  togglePromotionStatus: (id: string) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'user_id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('buyer');
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (data) {
        setUser(data);
        setRole(data.role as UserRole);
        return data.role;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    return 'buyer';
  };

  const fetchQuotes = async () => {
    try {
      const { data: quotesData, error } = await supabase
        .from('quotes')
        .select(`
          *,
          profiles:buyer_id (full_name),
          proposals (
            *,
            profiles:supplier_id (full_name, company_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedQuotes: QuoteRequest[] = quotesData.map((q: any) => ({
        id: q.id,
        buyerId: q.buyer_id,
        buyerName: q.profiles?.full_name || 'Usuário Desconhecido',
        product: {
          id: q.product_id || 'unknown',
          name: q.product_name,
          category: q.category,
          unit: q.unit
        },
        quantity: q.quantity,
        deliveryType: q.delivery_type,
        radius: q.radius,
        address: q.address,
        status: q.status,
        createdAt: q.created_at,
        proposals: q.proposals.map((p: any) => ({
          id: p.id,
          quoteId: p.quote_id,
          supplierId: p.supplier_id,
          supplierName: p.profiles?.company_name || p.profiles?.full_name || 'Fornecedor',
          price: p.price,
          deliveryDate: p.delivery_date,
          notes: p.notes,
          status: p.status,
          attachment: p.attachment_url
        }))
      }));

      setQuotes(mappedQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*, profiles:supplier_id(company_name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mappedPromos = data?.map((p: any) => ({
        id: p.id,
        supplierId: p.supplier_id,
        supplierName: p.profiles?.company_name || 'Fornecedor',
        title: p.title,
        description: p.description,
        image: p.image_url,
        originalPrice: p.original_price,
        promoPrice: p.promo_price,
        startDate: p.start_date,
        endDate: p.end_date,
        isActive: p.is_active
      })) || [];

      setPromotions(mappedPromos);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([fetchQuotes(), fetchAddresses(), fetchPromotions()]);
    setIsLoading(false);
  };

  // --- Auth Listener ---
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchProfile(session.user.id);
        if (mounted) await refreshData();
      } else {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
        await refreshData();
      } else {
        setUser(null);
        setQuotes([]);
        setAddresses([]);
        setPromotions([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --- Actions ---

  const addQuote = async (quoteData: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('quotes').insert({
        buyer_id: user.id,
        product_name: quoteData.product.name,
        category: quoteData.product.category,
        unit: quoteData.product.unit,
        quantity: quoteData.quantity,
        delivery_type: quoteData.deliveryType,
        radius: quoteData.radius,
        address: quoteData.address,
        status: 'open'
      });

      if (error) throw error;
      await fetchQuotes();
    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Erro ao criar cotação');
    }
  };

  const addProposal = async (quoteId: string, proposalData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('proposals').insert({
        quote_id: quoteId,
        supplier_id: user.id,
        price: proposalData.price,
        delivery_date: proposalData.deliveryDate,
        notes: proposalData.notes,
        attachment_url: proposalData.attachment,
        status: 'pending'
      });

      if (error) throw error;
      await fetchQuotes();
    } catch (error) {
      console.error('Error sending proposal:', error);
      alert('Erro ao enviar proposta');
    }
  };

  const acceptProposal = async (quoteId: string, proposalId: string) => {
    try {
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'closed' })
        .eq('id', quoteId);
      
      if (quoteError) throw quoteError;

      const { error: propError } = await supabase
        .from('proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId);

      if (propError) throw propError;

      await supabase
        .from('proposals')
        .update({ status: 'rejected' })
        .eq('quote_id', quoteId)
        .neq('id', proposalId);

      await fetchQuotes();
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert('Erro ao aceitar proposta');
    }
  };

  const finalizeOrder = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'completed' })
        .eq('id', quoteId);

      if (error) throw error;
      await fetchQuotes();
    } catch (error) {
      console.error('Error finalizing order:', error);
    }
  };

  const addPromotion = async (promo: any) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('promotions').insert({
        supplier_id: user.id,
        title: promo.title,
        description: promo.description,
        image_url: promo.image,
        original_price: promo.originalPrice,
        promo_price: promo.promoPrice,
        start_date: promo.startDate,
        end_date: promo.endDate,
        is_active: promo.isActive
      });

      if (error) throw error;
      await fetchPromotions();
    } catch (error) {
      console.error('Error adding promotion:', error);
      alert('Erro ao criar promoção');
    }
  };

  const togglePromotionStatus = async (id: string) => {
    try {
      const promo = promotions.find(p => p.id === id);
      if (!promo) return;

      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !promo.isActive })
        .eq('id', id);

      if (error) throw error;
      await fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | 'user_id'>) => {
    if (!user) return;
    try {
      // Se for o primeiro endereço ou marcado como padrão, remover padrão dos outros
      if (address.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase.from('addresses').insert({
        user_id: user.id,
        ...address
      });

      if (error) throw error;
      await fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Erro ao adicionar endereço');
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;
    try {
      // Remove default from all
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      await fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  return (
    <StoreContext.Provider value={{ 
      role, 
      setRole: () => {}, 
      user, 
      quotes, 
      products: INITIAL_PRODUCTS, 
      addresses, 
      promotions,
      isLoading,
      addQuote, 
      addProposal, 
      acceptProposal, 
      finalizeOrder,
      addPromotion, 
      togglePromotionStatus, 
      deletePromotion,
      addAddress,
      deleteAddress,
      setDefaultAddress,
      refreshData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within SupabaseProvider');
  return context;
};
