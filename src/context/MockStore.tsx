import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QuoteRequest, Product, Proposal, UserRole, Address, Promotion } from '../types';

// Dados iniciais simulados
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
        supplierId: 'sup-1',
        supplierName: 'AgroTop Insumos',
        price: 25000,
        deliveryDate: '2023-11-15',
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
    status: 'closed', // Pedido fechado (proposta aceita)
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    proposals: [
        {
            id: 'p2',
            supplierId: 'sup-2',
            supplierName: 'Casa do Agricultor',
            price: 12500,
            deliveryDate: '2023-11-10',
            status: 'accepted'
        }
    ]
  }
];

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr1',
    label: 'Sede Principal',
    street: 'Rodovia BR-163, km 20',
    district: 'Zona Rural',
    city: 'Sorriso',
    state: 'MT',
    cep: '78890-000',
    isDefault: true
  },
  {
    id: 'addr2',
    label: 'Retiro São João',
    street: 'Estrada Vicinal 4, km 12',
    district: 'Zona Rural',
    city: 'Sorriso',
    state: 'MT',
    cep: '78890-000',
    isDefault: false
  },
  {
    id: 'addr3',
    label: 'Escritório Central',
    street: 'Av. Blumenau, 1500',
    district: 'Centro',
    city: 'Sorriso',
    state: 'MT',
    cep: '78890-000',
    isDefault: false
  }
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    supplierId: 'sup-1',
    supplierName: 'AgroTop Insumos',
    title: "Desconto em Sementes de Soja",
    description: "Sementes tratadas com alto vigor para a safra 23/24.",
    image: "https://images.unsplash.com/photo-1592322936857-666e0a7918a3?auto=format&fit=crop&q=80&w=300&h=200",
    originalPrice: 450.00,
    promoPrice: 380.00,
    startDate: "2023-11-01",
    endDate: "2023-11-30",
    isActive: true
  },
  {
    id: 2,
    supplierId: 'sup-1',
    supplierName: 'AgroTop Insumos',
    title: "Kit Fertilizante Foliar",
    description: "Compre 10 leve 12. Oferta por tempo limitado.",
    image: "https://images.unsplash.com/photo-1622383563227-0440114a6801?auto=format&fit=crop&q=80&w=300&h=200",
    originalPrice: 1200.00,
    promoPrice: 990.00,
    startDate: "2023-10-01",
    endDate: "2023-10-15",
    isActive: false
  },
  {
    id: 3,
    supplierId: 'sup-2',
    supplierName: 'Sementes Ouro Verde',
    title: "Milho Híbrido Alta Performance",
    description: "Resistência superior a pragas e seca. Saco de 60.000 sementes.",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=300&h=200",
    originalPrice: 500.00,
    promoPrice: 450.00,
    startDate: "2023-11-10",
    endDate: "2023-12-10",
    isActive: true
  }
];

// Dados do Usuário Mockados
const INITIAL_USER = {
  name: 'Bruno Ferreira Campos',
  address: 'Rodovia BR-163, km 20, Sorriso - MT',
  avatar: 'BF'
};

interface StoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: typeof INITIAL_USER;
  quotes: QuoteRequest[];
  products: Product[];
  addresses: Address[];
  promotions: Promotion[];
  addQuote: (quote: Omit<QuoteRequest, 'id' | 'createdAt' | 'proposals' | 'buyerId' | 'buyerName'>) => void;
  addProposal: (quoteId: string, proposal: Omit<Proposal, 'id' | 'supplierId' | 'supplierName' | 'status'>) => void;
  acceptProposal: (quoteId: string, proposalId: string) => void;
  finalizeOrder: (quoteId: string) => void;
  addPromotion: (promo: Omit<Promotion, 'id' | 'supplierId' | 'supplierName'>) => void;
  togglePromotionStatus: (id: number) => void;
  deletePromotion: (id: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>('buyer');
  const [user] = useState(INITIAL_USER);
  const [quotes, setQuotes] = useState<QuoteRequest[]>(INITIAL_QUOTES);
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [addresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);

  const addQuote = (quoteData: any) => {
    const newQuote: QuoteRequest = {
      ...quoteData,
      id: Math.random().toString(36).substr(2, 9),
      buyerId: 'user-buyer',
      buyerName: 'Fazenda Santa Fé',
      createdAt: new Date().toISOString(),
      proposals: [],
      status: 'open',
    };
    setQuotes([newQuote, ...quotes]);
  };

  const addProposal = (quoteId: string, proposalData: any) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        const newProposal: Proposal = {
          ...proposalData,
          id: Math.random().toString(36).substr(2, 9),
          supplierId: 'user-supplier',
          supplierName: 'AgroTop Insumos Ltda',
          status: 'pending',
        };
        return { ...q, proposals: [...q.proposals, newProposal] };
      }
      return q;
    }));
  };

  const acceptProposal = (quoteId: string, proposalId: string) => {
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

  const finalizeOrder = (quoteId: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, status: 'completed' };
      }
      return q;
    }));
  };

  const addPromotion = (promo: Omit<Promotion, 'id' | 'supplierId' | 'supplierName'>) => {
    const newPromo: Promotion = {
        ...promo,
        id: Date.now(),
        supplierId: 'user-supplier',
        supplierName: 'AgroTop Insumos Ltda' // Mocked current user company
    };
    setPromotions([newPromo, ...promotions]);
  };

  const togglePromotionStatus = (id: number) => {
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const deletePromotion = (id: number) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  return (
    <StoreContext.Provider value={{ 
      role, setRole, user, quotes, products, addresses, promotions,
      addQuote, addProposal, acceptProposal, finalizeOrder,
      addPromotion, togglePromotionStatus, deletePromotion
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
