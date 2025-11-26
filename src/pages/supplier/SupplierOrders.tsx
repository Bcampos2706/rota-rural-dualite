import React, { useState } from 'react';
import { useStore } from '../../context/MockStore'; // Updated import
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Package,
  MapPin,
  ArrowRight,
  XCircle
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

type FilterType = 'all' | 'available' | 'sent' | 'active' | 'completed' | 'rejected';

export const SupplierOrders = () => {
  const { quotes } = useStore();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Filtering Logic ---
  
  // Disponíveis: Aberto e SEM proposta minha
  const availableQuotes = quotes.filter(q => q.status === 'open' && !q.proposals.some(p => p.supplierId === 'user-supplier'));
  
  // Aguardando: Aberto e COM proposta minha
  const sentQuotes = quotes.filter(q => q.status === 'open' && q.proposals.some(p => p.supplierId === 'user-supplier'));
  
  // Aceitos: Fechado e minha proposta ACEITA
  const activeQuotes = quotes.filter(q => q.status === 'closed' && q.proposals.some(p => p.supplierId === 'user-supplier' && p.status === 'accepted'));
  
  // Finalizados: Completado e minha proposta ACEITA
  const completedQuotes = quotes.filter(q => q.status === 'completed' && q.proposals.some(p => p.supplierId === 'user-supplier' && p.status === 'accepted'));

  // Rejeitados: Fechado e minha proposta REJEITADA (ou seja, o cliente fechou com outro ou rejeitou explicitamente)
  const rejectedQuotes = quotes.filter(q => 
    (q.status === 'closed' || q.status === 'completed') && 
    q.proposals.some(p => p.supplierId === 'user-supplier' && p.status === 'rejected')
  );

  const getFilteredQuotes = () => {
    let list = [];
    switch (activeFilter) {
      case 'available': list = availableQuotes; break;
      case 'sent': list = sentQuotes; break;
      case 'active': list = activeQuotes; break;
      case 'completed': list = completedQuotes; break;
      case 'rejected': list = rejectedQuotes; break;
      default: list = [...availableQuotes, ...sentQuotes, ...activeQuotes, ...completedQuotes, ...rejectedQuotes];
    }

    if (searchTerm) {
      list = list.filter(q => 
        q.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.includes(searchTerm) ||
        q.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return list;
  };

  const filteredList = getFilteredQuotes();

  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'available', label: 'Disponíveis' },
    { id: 'sent', label: 'Aguardando' },
    { id: 'active', label: 'Aceitos' },
    { id: 'completed', label: 'Finalizados' },
    { id: 'rejected', label: 'Rejeitados' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm border-b border-gray-200">
        <h1 className="font-bold text-xl text-gray-900 mb-4">Pedidos</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, produto..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as FilterType)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border",
                activeFilter === f.id 
                  ? "bg-emerald-600 text-white border-emerald-600" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="opacity-20" size={32} />
            </div>
            <p className="text-sm font-medium">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          filteredList.map(quote => {
            // Determine card style based on status logic
            const isAvailable = quote.status === 'open' && !quote.proposals.some(p => p.supplierId === 'user-supplier');
            const isSent = quote.status === 'open' && quote.proposals.some(p => p.supplierId === 'user-supplier');
            const isActive = quote.status === 'closed' && quote.proposals.some(p => p.supplierId === 'user-supplier' && p.status === 'accepted');
            const isCompleted = quote.status === 'completed' && quote.proposals.some(p => p.supplierId === 'user-supplier' && p.status === 'accepted');
            const isRejected = (quote.status === 'closed' || quote.status === 'completed') && quote.proposals.some(p => p.supplierId === 'user-supplier' && p.status === 'rejected');

            const myProposal = quote.proposals.find(p => p.supplierId === 'user-supplier');

            return (
              <div 
                key={quote.id}
                onClick={() => {
                   if (isAvailable) navigate(`/supplier/request/${quote.id}`);
                   else if (isActive) navigate('/chat');
                }}
                className={cn(
                  "bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group cursor-pointer",
                  isRejected && "opacity-75 hover:opacity-100"
                )}
              >
                {/* Status Stripe */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
                  isAvailable ? "bg-blue-500" :
                  isSent ? "bg-purple-500" :
                  isActive ? "bg-orange-500" : 
                  isCompleted ? "bg-emerald-500" : "bg-red-500"
                )} />

                <div className="pl-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{quote.product.name}</h3>
                      <p className="text-xs text-gray-500">{quote.buyerName}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-lg border",
                      isAvailable ? "bg-blue-50 text-blue-600 border-blue-100" :
                      isSent ? "bg-purple-50 text-purple-600 border-purple-100" :
                      isActive ? "bg-orange-50 text-orange-600 border-orange-100" : 
                      isCompleted ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {isAvailable ? 'Disponível' : 
                       isSent ? 'Aguardando' : 
                       isActive ? 'Cotação Aceita' : 
                       isCompleted ? 'Finalizado' : 'Rejeitado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                     <span className="bg-gray-100 px-2 py-0.5 rounded">{quote.quantity} {quote.product.unit}</span>
                     <span>•</span>
                     <span className="flex items-center gap-1"><MapPin size={12}/> {quote.address ? 'Entrega' : 'Retirada'}</span>
                  </div>

                  {/* Footer Info */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </span>
                    
                    {isAvailable ? (
                      <span className="text-blue-600 text-xs font-bold flex items-center gap-1">
                        Cotar <ArrowRight size={14} />
                      </span>
                    ) : isRejected ? (
                      <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                        <XCircle size={14} /> Proposta Perdida
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-gray-700">
                        {myProposal ? formatCurrency(myProposal.price) : '-'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
