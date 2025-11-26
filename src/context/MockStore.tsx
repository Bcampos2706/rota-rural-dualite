import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QuoteRequest, Product, Proposal, UserRole, Address, Promotion, UserProfile } from '../types';

// --- DADOS INICIAIS (MOCK) ---

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Semente de Soja Intacta', category: 'Sementes', unit: 'kg' },
  { id: '2', name: 'Adubo NPK 04-14-08', category: 'Fertilizantes', unit: 'ton' },
  { id: '3', name: 'Glifosato 480', category: 'Defensivos', unit: 'L' },
  { id: '4', name: 'Milho Híbrido', category: 'Sementes', unit: 'sc' },
];

const INITIAL_QUOTES: QuoteRequest[] = [
  {
    id: '101',
    buyerId: 'user-buyer',
    buyerName: 'Fazenda Santa Fé',
    product: INITIAL_PRODUCTS[0],
    quantity: 500,
    deliveryType: 'delivery',
    radius: 50,
    address: 'Rodovia BR-163, km 20, Sorriso - MT',
    status: 'open',
    createdAt: new Date().toISOString(),
    proposals: [
      {
        id: 'p1',
        quoteId: '101',
        supplierId: 'sup-1',
        supplierName: 'AgroTop Insumos',
        price: 25000,
        deliveryDate: '5 dias úteis',
        status: 'pending',
      }
    ]
  },
  {
    id: '102',
    buyerId: 'user-buyer',
    buyerName: 'Fazenda Santa Fé',
    product: INITIAL_PRODUCTS[2],
    quantity: 200,
    deliveryType: 'pickup',
    radius: 100,
    address: '',
    status: 'closed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    proposals: [
        {
            id: 'p2',
            quoteId: '102',
            supplierId: 'sup-2',
            supplierName: 'Casa do Agricultor',
            price: 12500,
            deliveryDate: 'Imediata',
            status: 'accepted'
        }
    ]
  }
];

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr1',
    street: 'Rodovia BR-163, km 20',
    district: 'Zona Rural',
    city: 'Sorriso',
    state: 'MT',
    cep: '78890-000',
    is_default: true
  },
  {
    id: 'addr2',
    street: 'Av. Blumenau, 1500',
    district: 'Centro',
    city: 'Sorriso',
    state: 'MT',
    cep: '78890-000',
    is_default: false
  }
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    supplierId: 'user-supplier',
    supplierName: 'AgroTop Insumos',
    title: "Desconto em Sementes de Soja",
    description: "Sementes tratadas com alto vigor para a safra 23/24.",
    image: "https://images.unsplash.com/photo-1592322936857-666e0a7918a3?auto=format&fit=crop&q=80&w=300&h=200",
    originalPrice: 450.00,
    promoPrice: 380.00,
    startDate: "2023-11-01",
    endDate: "2025-12-30",
    isActive: true
  },
  {
    id: '2',
    supplierId: 'user-supplier',
    supplierName: 'AgroTop Insumos',
    title: "Kit Fertilizante Foliar",
    description: "Compre 10 leve 12. Oferta por tempo limitado.",
    image: "https://images.unsplash.com/photo-1622383563227-0440114a6801?auto=format&fit=crop&q=80&w=300&h=200",
    originalPrice: 1200.00,
    promoPrice: 990.00,
    startDate: "2023-10-01",
    endDate: "2023-10-15",
    isActive: false
  }
];

const MOCK_USER_BUYER: UserProfile = {
  id: 'user-buyer',
  email: 'produtor@exemplo.com',
  full_name: 'Bruno Ferreira Campos',
  role: 'buyer',
  phone: '(66) 9999-9999',
  address: 'Rodovia BR-163, km 20, Sorriso - MT',
  categories: ['Sementes', 'Defensivos']
};

const MOCK_USER_SUPPLIER: UserProfile = {
  id: 'user-supplier',
  email: 'fornecedor@exemplo.com',
  full_name: 'João Silva',
  role: 'supplier',
  company_name: 'AgroTop Insumos Ltda',
  branch: 'Matriz - Sorriso/MT',
  phone: '(66) 3333-3333',
  document: '00.000.000/0001-00'
};

// --- INTERFACE DO CONTEXTO ---

interface StoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: UserProfile | null;
  quotes: QuoteRequest[];
  products: Product[];
  addresses: Address[];
  promotions: Promotion[];
  isLoading: boolean;
  
  // Auth Actions
  login: (email: string, role: UserRole) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  
  // Data Actions
  addQuote: (quote: any) => Promise<void>;
  addProposal: (quoteId: string, proposal: any) => Promise<void>;
  acceptProposal: (quoteId: string, proposalId: string) => Promise<void>;
  finalizeOrder: (quoteId: string) => Promise<void>;
  
  addPromotion: (promo: any) => Promise<void>;
  togglePromotionStatus: (id: string) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  
  addAddress: (address: any) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>('buyer');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>(INITIAL_QUOTES);
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [isLoading, setIsLoading] = useState(false);

  // --- ACTIONS ---

  const login = async (email: string, userRole: UserRole) => {
    setIsLoading(true);
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (userRole === 'supplier') {
      setUser(MOCK_USER_SUPPLIER);
      setRole('supplier');
    } else {
      setUser(MOCK_USER_BUYER);
      setRole('buyer'); // Producer é tratado como Buyer na lógica de role
    }
    setIsLoading(false);
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: userData.email,
      full_name: userData.fullName,
      role: userData.role,
      company_name: userData.companyName || userData.farmName,
      phone: userData.phone,
      address: userData.address,
      branch: userData.branch,
      categories: userData.selectedCategories
    };

    setUser(newUser);
    setRole(userData.role === 'producer' ? 'buyer' : 'supplier');
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setRole('buyer');
  };

  const addQuote = async (quoteData: any) => {
    const newQuote: QuoteRequest = {
      id: Math.random().toString(36).substr(2, 9),
      buyerId: user?.id || 'user-buyer',
      buyerName: user?.full_name || 'Usuário',
      product: {
        id: quoteData.product.id,
        name: quoteData.product.name,
        category: quoteData.product.category,
        unit: quoteData.product.unit
      },
      quantity: quoteData.quantity,
      deliveryType: quoteData.deliveryType,
      radius: quoteData.radius,
      address: quoteData.address,
      status: 'open',
      createdAt: new Date().toISOString(),
      proposals: []
    };
    setQuotes([newQuote, ...quotes]);
  };

  const addProposal = async (quoteId: string, proposalData: any) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        const newProposal: Proposal = {
          id: Math.random().toString(36).substr(2, 9),
          quoteId: quoteId,
          supplierId: user?.id || 'user-supplier',
          supplierName: user?.company_name || 'Fornecedor Mock',
          price: proposalData.price,
          deliveryDate: proposalData.deliveryDate,
          notes: proposalData.notes,
          attachment: proposalData.attachment,
          status: 'pending',
        };
        return { ...q, proposals: [...q.proposals, newProposal] };
      }
      return q;
    }));
  };

  const acceptProposal = async (quoteId: string, proposalId: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        return {
          ...q,
          status: 'closed',
          proposals: q.proposals.map(p => ({
            ...p,
            status: p.id === proposalId ? 'accepted' : 'rejected'
          }))
        };
      }
      return q;
    }));
  };

  const finalizeOrder = async (quoteId: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, status: 'completed' };
      }
      return q;
    }));
  };

  const addPromotion = async (promo: any) => {
    const newPromo: Promotion = {
        id: Math.random().toString(36).substr(2, 9),
        supplierId: user?.id || 'user-supplier',
        supplierName: user?.company_name || 'Fornecedor Mock',
        title: promo.title,
        description: promo.description,
        image: promo.image,
        originalPrice: promo.originalPrice,
        promoPrice: promo.promoPrice,
        startDate: promo.startDate,
        endDate: promo.endDate,
        isActive: promo.isActive
    };
    setPromotions([newPromo, ...promotions]);
  };

  const togglePromotionStatus = async (id: string) => {
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const deletePromotion = async (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  const addAddress = async (address: any) => {
    const newAddr: Address = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: user?.id,
      ...address
    };
    
    if (newAddr.is_default) {
      setAddresses(prev => prev.map(a => ({ ...a, is_default: false })).concat(newAddr));
    } else {
      setAddresses(prev => [...prev, newAddr]);
    }
  };

  const deleteAddress = async (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setDefaultAddress = async (id: string) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      is_default: a.id === id
    })));
  };

  const refreshData = async () => {
    // Mock refresh
  };

  return (
    <StoreContext.Provider value={{ 
      role, setRole, user, quotes, products: INITIAL_PRODUCTS, addresses, promotions, isLoading,
      login, register, logout,
      addQuote, addProposal, acceptProposal, finalizeOrder,
      addPromotion, togglePromotionStatus, deletePromotion,
      addAddress, deleteAddress, setDefaultAddress,
      refreshData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
