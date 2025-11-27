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
  
  // Auth
  login: (email: string, password?: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;

  // Actions
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
      // 1. Tenta buscar na tabela de Produtores
      let { data: producerData } = await supabase
        .from('profile_produtor')
        .select('*')
        .eq('id', userId)
        .single();

      if (producerData) {
        const userProfile: UserProfile = {
            id: producerData.id,
            email: producerData.email,
            full_name: producerData.full_name,
            role: 'producer',
            company_name: producerData.farm_name, // Mapeia nome da fazenda
            document: producerData.cpf_cnpj,
            phone: producerData.phone,
            address: producerData.address,
            categories: producerData.categories
        };
        setUser(userProfile);
        setRole('producer');
        return 'producer';
      }

      // 2. Se não achar, tenta buscar na tabela de Fornecedores
      let { data: supplierData } = await supabase
        .from('profile_fornecedor')
        .select('*')
        .eq('id', userId)
        .single();

      if (supplierData) {
        const userProfile: UserProfile = {
            id: supplierData.id,
            email: supplierData.email,
            full_name: supplierData.full_name,
            role: 'supplier',
            company_name: supplierData.company_name,
            document: supplierData.cnpj,
            phone: supplierData.phone,
            address: supplierData.address,
            branch: supplierData.branch,
            categories: supplierData.categories
        };
        setUser(userProfile);
        setRole('supplier');
        return 'supplier';
      }
      
      // Fallback: Tenta tabela antiga 'profiles' se as novas falharem (compatibilidade)
      const { data: oldProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (oldProfile) {
         const appRole = (oldProfile.user_type === 'producer' ? 'producer' : oldProfile.role) as UserRole;
         setUser({ ...oldProfile, role: appRole });
         setRole(appRole);
         return appRole;
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    return 'buyer';
  };

  const fetchQuotes = async () => {
    try {
      // Precisamos ajustar a query pois agora os nomes vêm de tabelas diferentes
      // Por simplicidade, vamos buscar as cotações e depois enriquecer com os nomes se necessário
      // Ou usar uma View no banco. Aqui vamos manter simples.
      
      const { data: quotesData, error } = await supabase
        .from('quotes')
        .select(`
          *,
          proposals (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Para exibir nomes corretamente, idealmente faríamos joins, mas com tabelas separadas
      // o Supabase requer Views ou queries manuais. Vamos usar placeholders ou dados do user atual.
      
      const mappedQuotes: QuoteRequest[] = quotesData.map((q: any) => ({
        id: q.id,
        buyerId: q.buyer_id,
        buyerName: q.buyer_name || 'Produtor Rural', // Fallback se não tiver join
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
          supplierName: 'Fornecedor', // Será preenchido melhor se tivermos o ID
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
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mappedPromos = data?.map((p: any) => ({
        id: p.id,
        supplierId: p.supplier_id,
        supplierName: 'Fornecedor Parceiro', // Simplificado
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

  // --- Auth Methods ---

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Senha é obrigatória");
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
  };

  const register = async (userData: any) => {
    // Envia os dados brutos para o Supabase Auth.
    // O Trigger no banco de dados vai ler 'role' e decidir se salva em profile_produtor ou profile_fornecedor
    
    const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                role: userData.role, // 'producer' ou 'supplier'
                full_name: userData.fullName,
                document: userData.cpfCnpj || userData.companyCnpj,
                phone: userData.phone,
                whatsapp: userData.whatsapp,
                address: userData.address,
                
                // Producer specific
                birthDate: userData.birthDate,
                company_name: userData.companyName || userData.farmName, // Farm name goes here for producer
                
                // Supplier specific
                branch: userData.branch,
                
                categories: userData.selectedCategories
            }
        }
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('buyer');
  };

  // --- Data Actions ---

  const addQuote = async (quoteData: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('quotes').insert({
        buyer_id: user.id,
        buyer_name: user.full_name, // Salvando nome denormalizado para facilitar exibição
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
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

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
      login,
      register,
      logout,
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
