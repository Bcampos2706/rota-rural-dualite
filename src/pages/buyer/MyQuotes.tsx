import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/MockStore';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Box, 
  Send, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Truck,
  Store,
  DollarSign,
  Lock,
  Archive,
  Calendar,
  Eye,
  FileText,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { QuoteRequest, Proposal } from '../../types';

// --- Types ---
type FilterType = 'all' | 'waiting' | 'analyzing' | 'closed' | 'completed';

// --- Components ---

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  colorClass, 
  bgClass, 
  isActive, 
  onClick 
}: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-3 rounded-xl shadow-sm border flex flex-col justify-between min-w-[100px] flex-1 text-left transition-all duration-200",
      isActive 
        ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500" 
        : "bg-white border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
    )}
  >
    <div className="flex justify-between items-start mb-2 w-full">
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-wider leading-tight",
        isActive ? "text-emerald-800" : "text-gray-500"
      )}>{title}</span>
      <div className={cn("p-1.5 rounded-lg transition-colors shrink-0 ml-2", isActive ? "bg-white" : bgClass)}>
        <Icon size={14} className={colorClass} />
      </div>
    </div>
    <span className={cn(
      "text-2xl font-bold",
      isActive ? "text-emerald-900" : "text-gray-800"
    )}>{value}</span>
  </button>
);

// --- TIMELINE COMPONENT (MATCHING IMAGE) ---
const CustomTimeline = ({ step }: { step: number }) => {
  const steps = [
    { label: 'Pedido Criado', icon: Send },
    { label: 'Visualizado', icon: Clock },
    { label: 'Propostas Recebidas', icon: TrendingUp, count: '(1)' },
    { label: 'Aprovado', icon: CheckCircle },
    { label: 'Finalizado', icon: CheckCircle },
  ];

  return (
    <div className="flex justify-between items-start px-2 relative">
      {/* Connecting Line */}
      <div className="absolute top-3 left-4 right-4 h-[1px] bg-gray-100 -z-10" />
      
      {steps.map((s, index) => {
        const isActive = index + 1 === step;
        const isCompleted = index + 1 < step;
        
        return (
          <div key={index} className="flex flex-col items-center gap-2 bg-white px-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center border transition-colors",
              isActive ? "bg-emerald-600 border-emerald-600 text-white" :
              isCompleted ? "bg-white border-emerald-500 text-emerald-500" :
              "bg-white border-gray-200 text-gray-300"
            )}>
              <s.icon size={12} strokeWidth={2.5} />
            </div>
            <div className="text-center flex flex-col items-center">
              <span className={cn(
                "text-[9px] font-medium leading-tight",
                isActive ? "text-emerald-600 font-bold" : 
                isCompleted ? "text-emerald-600" : "text-gray-400"
              )}>
                {s.label}
              </span>
              {isActive && s.count && (
                <span className="text-[9px] font-bold text-emerald-600">{s.count}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- ANALYZING CARD (MATCHING IMAGE) ---
const AnalyzingOrderCard = ({ quote, onClick }: { quote: QuoteRequest; onClick: () => void }) => {
  const proposalsCount = quote.proposals.length;
  const prices = quote.proposals.map(p => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  
  // Find best proposal (lowest price logic for demo)
  const bestProposal = quote.proposals.sort((a, b) => a.price - b.price)[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="p-4 flex justify-between items-start border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-gray-400">#{quote.id.substring(0, 8)}</span>
          <span className="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
            <TrendingUp size={10} /> Aguardando Análise
          </span>
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold">
            {proposalsCount} proposta{proposalsCount !== 1 && 's'}
          </span>
        </div>
        <div className="text-[10px] text-gray-400 flex items-center gap-1">
          <Calendar size={10} />
          {new Date(quote.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Timeline */}
      <div className="py-6">
        <CustomTimeline step={3} />
      </div>

      {/* Delivery Info Bar */}
      <div className="bg-gray-50 px-4 py-3 flex items-center gap-4 border-y border-gray-100">
        <div className="flex items-center gap-2">
          {quote.deliveryType === 'pickup' ? <Store size={16} className="text-emerald-600" /> : <Truck size={16} className="text-emerald-600" />}
          <span className="text-xs font-bold text-gray-800">
            {quote.deliveryType === 'pickup' ? 'Retirada na Loja' : 'Entrega na Propriedade'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Box size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500">1 item</span>
        </div>
      </div>

      {/* Product Section */}
      <div className="p-4">
        <h4 className="text-xs font-bold text-gray-500 mb-2">Produtos Solicitados</h4>
        <div className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-gray-800">{quote.product.name}</p>
            <p className="text-xs text-gray-500">{quote.product.category}</p>
          </div>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200">
            {quote.quantity}x
          </span>
        </div>
      </div>

      {/* Proposals Section */}
      <div className="px-4 pb-4">
        <h4 className="text-xs font-bold text-gray-500 mb-2">Propostas Recebidas</h4>
        
        <div className="border border-gray-200 rounded-lg p-4">
          {/* Summary Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-800">Propostas Recebidas</p>
              <div className="mt-1">
                <span className="text-[10px] text-gray-500 block">Melhor Preço</span>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(minPrice)}</span>
              </div>
            </div>
            <div className="text-right">
               <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                 {proposalsCount}
               </span>
               <div className="mt-2">
                <span className="text-[10px] text-gray-500 block">Faixa de Preços</span>
                <span className="text-xs font-bold text-gray-800">
                  {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
                </span>
               </div>
            </div>
          </div>

          {/* Best Proposal Card Highlight */}
          {bestProposal && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
              <div className="flex gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Melhor Preço</span>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Aguardando</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Store size={14} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-800">{bestProposal.supplierName}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-1 text-xs">
                <div className="text-gray-500">Total: <span className="text-emerald-600 font-bold">{formatCurrency(bestProposal.price)}</span></div>
                <div className="text-gray-500">Prazo: <span className="text-gray-800 font-bold">1 dia</span></div>
                <div className="text-gray-500">Frete: <span className="text-gray-800 font-bold">Grátis</span></div>
                <div className="text-gray-500">Pgto: <span className="text-gray-800 font-bold">15 dias</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 space-y-2">
        <button 
          onClick={onClick}
          className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          Ver Todas as Propostas ({proposalsCount})
        </button>
        <button 
          onClick={onClick}
          className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Eye size={16} /> Ver Detalhes
        </button>
      </div>

    </div>
  );
};

// --- STANDARD CARD (For other statuses) ---
const StandardOrderCard = ({ quote, onClick }: { quote: QuoteRequest; onClick: () => void }) => {
  const isClosed = quote.status === 'closed' || quote.status === 'completed';
  const acceptedProposal = quote.proposals.find(p => p.status === 'accepted');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 border-b border-gray-50 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">#{quote.id.substring(0, 8)}</span>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
            quote.status === 'open' ? "bg-blue-50 text-blue-600 border-blue-100" : 
            quote.status === 'closed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-600 border-gray-200"
          )}>
            {quote.status === 'open' ? 'Aguardando' : quote.status === 'closed' ? 'Fechado' : 'Finalizado'}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Clock size={10} />
          {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
           <div>
              <h3 className="font-bold text-gray-800 text-sm">{quote.product.name}</h3>
              <p className="text-xs text-gray-400">{quote.product.category}</p>
           </div>
           <div className="bg-gray-50 px-2 py-1 rounded text-xs font-bold text-gray-600">
              {quote.quantity} {quote.product.unit}
           </div>
        </div>

        {isClosed && acceptedProposal && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex justify-between items-center">
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle size={14} /> Pedido Aceito
            </span>
            <span className="text-xs font-bold text-emerald-800">{acceptedProposal.supplierName}</span>
          </div>
        )}

        <button 
          onClick={onClick}
          className="w-full mt-3 bg-white border border-gray-200 text-gray-600 text-xs font-bold py-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};

// --- Main Page ---

export const MyQuotes = () => {
  const { quotes } = useStore();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filter quotes for the current buyer
  const myQuotes = quotes.filter(q => q.buyerId === 'user-buyer');

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      total: myQuotes.length,
      waiting: myQuotes.filter(q => q.status === 'open' && q.proposals.length === 0).length,
      analyzing: myQuotes.filter(q => q.status === 'open' && q.proposals.length > 0).length,
      closed: myQuotes.filter(q => q.status === 'closed').length,
      completed: myQuotes.filter(q => q.status === 'completed').length,
    };
  }, [myQuotes]);

  // Filter Logic
  const filteredQuotes = useMemo(() => {
    switch (activeFilter) {
      case 'waiting':
        return myQuotes.filter(q => q.status === 'open' && q.proposals.length === 0);
      case 'analyzing':
        return myQuotes.filter(q => q.status === 'open' && q.proposals.length > 0);
      case 'closed':
        return myQuotes.filter(q => q.status === 'closed');
      case 'completed':
        return myQuotes.filter(q => q.status === 'completed');
      case 'all':
      default:
        return myQuotes;
    }
  }, [activeFilter, myQuotes]);

  const getFilterLabel = () => {
    switch (activeFilter) {
      case 'waiting': return 'Aguardando Cotação';
      case 'analyzing': return 'Analisando Propostas';
      case 'closed': return 'Fechados';
      case 'completed': return 'Finalizados';
      default: return 'Todos os Pedidos';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Header Section */}
      <div className="bg-white p-5 pb-2 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
            <p className="text-xs text-gray-500 mt-1">Gerencie suas solicitações e propostas</p>
          </div>
          <button 
            onClick={() => navigate('/buyer/create')}
            className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
             <span className="text-xs font-bold">Novo</span>
             <Box size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por produto, ID..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Interactive Stats Grid */}
        <div className="space-y-3">
          {/* Row 1: Total & Waiting */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              title="Total" 
              value={stats.total} 
              icon={Box} 
              bgClass="bg-gray-100" 
              colorClass="text-gray-600"
              isActive={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            />
             <StatCard 
              title="Aguardando" 
              value={stats.waiting} 
              icon={Clock} 
              bgClass="bg-orange-100" 
              colorClass="text-orange-600" 
              isActive={activeFilter === 'waiting'}
              onClick={() => setActiveFilter('waiting')}
            />
          </div>

          {/* Row 2: Analyzing (Full Width for emphasis) */}
          <StatCard 
            title="Analisando Propostas" 
            value={stats.analyzing} 
            icon={TrendingUp} 
            bgClass="bg-blue-100" 
            colorClass="text-blue-600" 
            isActive={activeFilter === 'analyzing'}
            onClick={() => setActiveFilter('analyzing')}
          />

          {/* Row 3: Closed & Completed */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              title="Fechados" 
              value={stats.closed} 
              icon={Lock} 
              bgClass="bg-purple-100" 
              colorClass="text-purple-600" 
              isActive={activeFilter === 'closed'}
              onClick={() => setActiveFilter('closed')}
            />
            <StatCard 
              title="Finalizados" 
              value={stats.completed} 
              icon={Archive} 
              bgClass="bg-emerald-100" 
              colorClass="text-emerald-600" 
              isActive={activeFilter === 'completed'}
              onClick={() => setActiveFilter('completed')}
            />
          </div>
        </div>

        {/* Orders List */}
        <div>
          <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              {getFilterLabel()}
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {filteredQuotes.length}
              </span>
            </h3>
          </div>

          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Box className="opacity-20" size={32} />
              </div>
              <p className="text-sm font-medium text-gray-500">Nenhum pedido com este status.</p>
              {activeFilter !== 'all' && (
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="mt-2 text-emerald-600 font-bold text-xs hover:underline"
                >
                  Ver todos os pedidos
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => {
                // Use the specialized card for "Analyzing" state (Open + Has Proposals)
                if (quote.status === 'open' && quote.proposals.length > 0) {
                  return (
                    <AnalyzingOrderCard 
                      key={quote.id} 
                      quote={quote} 
                      onClick={() => navigate(`/buyer/quote/${quote.id}`)} 
                    />
                  );
                }
                // Use standard card for others
                return (
                  <StandardOrderCard 
                    key={quote.id} 
                    quote={quote} 
                    onClick={() => navigate(`/buyer/quote/${quote.id}`)} 
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
