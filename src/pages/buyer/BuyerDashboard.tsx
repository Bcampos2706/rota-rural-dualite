import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/MockStore';
import { 
  Search, 
  Wrench, 
  Warehouse, 
  Sprout, 
  Beef, 
  Stethoscope, 
  CircleDot, 
  Car, 
  ChevronRight,
  ArrowRight,
  FileText,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const CATEGORIES = [
  { id: 1, name: 'Peças Agrícolas', icon: Wrench, color: 'bg-orange-100 text-orange-600' },
  { id: 2, name: 'Casa Agro', icon: Warehouse, color: 'bg-blue-100 text-blue-600' },
  { id: 3, name: 'Sementes', icon: Sprout, color: 'bg-green-100 text-green-600' },
  { id: 4, name: 'Nutrição Animal', icon: Beef, color: 'bg-red-100 text-red-600' },
  { id: 5, name: 'Veterinária', icon: Stethoscope, color: 'bg-teal-100 text-teal-600' },
  { id: 6, name: 'Pneus', icon: CircleDot, color: 'bg-gray-100 text-gray-600' },
  { id: 7, name: 'Peças Auto', icon: Car, color: 'bg-indigo-100 text-indigo-600' },
];

export const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { promotions } = useStore();

  // Filter only active promotions
  const activePromotions = promotions.filter(p => p.isActive);

  return (
    <div className="space-y-8 pb-8">
      
      {/* Search Section - Floating over the Layout Header */}
      <div className="px-4 -mt-6 relative z-30">
        <div className="relative shadow-lg rounded-2xl">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="O que você precisa hoje?" 
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </div>

      {/* Section 1: Featured Products (Promotions) */}
      <div className="px-4 pt-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Destaques da Semana</h3>
          <button className="text-emerald-600 text-sm font-medium flex items-center">
            Ver tudo <ChevronRight size={16} />
          </button>
        </div>
        
        {activePromotions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
            Nenhuma promoção ativa no momento.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
            {activePromotions.map((promo) => (
              <div 
                key={promo.id} 
                className="min-w-[260px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden snap-center flex flex-col"
              >
                <div className="h-32 overflow-hidden relative">
                  <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-gray-600 shadow-sm">
                    {promo.supplierName}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{promo.title}</h4>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{promo.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 line-through">{formatCurrency(promo.originalPrice)}</span>
                      <span className="font-bold text-emerald-700 text-lg">{formatCurrency(promo.promoPrice)}</span>
                    </div>
                    <button 
                      onClick={() => navigate('/buyer/create')}
                      className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Cotar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Categories */}
      <div className="px-4">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Categorias</h3>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id}
              className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${cat.color}`}>
                <cat.icon size={24} />
              </div>
              <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
          <button className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors">
             <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-400">
                <ChevronRight size={24} />
             </div>
             <span className="text-[10px] font-medium text-gray-500">Ver Mais</span>
          </button>
        </div>
      </div>

      {/* Section 3: How it works */}
      <div className="px-4">
        <div className="bg-emerald-900 rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-800 rounded-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-800 rounded-full opacity-50 translate-y-1/2 -translate-x-1/3"></div>

          <h3 className="font-bold text-lg mb-6 relative z-10">Como funciona?</h3>
          
          <div className="space-y-6 relative z-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center shrink-0 font-bold border border-emerald-600">1</div>
              <div>
                <h4 className="font-bold text-emerald-100 mb-1 flex items-center gap-2">
                  <FileText size={16} /> Solicite
                </h4>
                <p className="text-xs text-emerald-300 leading-relaxed">
                  Escolha o produto ou categoria e crie sua cotação em segundos.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center shrink-0 font-bold border border-emerald-600">2</div>
              <div>
                <h4 className="font-bold text-emerald-100 mb-1 flex items-center gap-2">
                  <MessageSquare size={16} /> Receba Propostas
                </h4>
                <p className="text-xs text-emerald-300 leading-relaxed">
                  Fornecedores da região enviam orçamentos competitivos para você.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center shrink-0 font-bold border border-emerald-600">3</div>
              <div>
                <h4 className="font-bold text-emerald-100 mb-1 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Feche Negócio
                </h4>
                <p className="text-xs text-emerald-300 leading-relaxed">
                  Escolha a melhor oferta, combine a entrega e pague com segurança.
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/buyer/create')}
            className="w-full mt-8 bg-white text-emerald-900 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
          >
            Começar Agora <ArrowRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};
