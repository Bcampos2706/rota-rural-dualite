import React from 'react';
import { useStore } from '../../context/SupabaseContext'; // Updated import
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Package, 
  ArrowRight, 
  Building2, 
  Mail, 
  User, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Lightbulb,
  Star,
  Truck,
  Store,
  Send,
  ClipboardList,
  Tag,
  BarChart3,
  Users,
  PlusSquare,
  DollarSign
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export const SupplierDashboard = () => {
  const { quotes, user } = useStore();
  const navigate = useNavigate();

  // Mock Supplier Data (Fallback if user data is missing)
  const supplierProfile = {
    company: user?.company_name || "AgroTop Insumos Ltda",
    username: user?.full_name || "João Silva",
    email: user?.email || "vendas@agrotop.com.br",
    rating: 4.8
  };

  // Quick Actions Configuration
  const quickActions = [
    { label: 'Pedidos', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', path: '/supplier/orders' },
    { label: 'Promoções', icon: Tag, color: 'text-pink-600', bg: 'bg-pink-50', path: '/supplier/promotions' },
    { label: 'Relatório', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50', path: '/supplier/reports' },
    { label: 'Grupos de usuário', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50', path: '#' },
    { label: 'Cadastro de Produtos', icon: PlusSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '#' },
    { label: 'Financeiro', icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-50', path: '#' },
  ];

  // --- Filtering Logic ---
  
  // 1. Disponíveis: Status 'open' E eu AINDA NÃO enviei proposta
  const availableQuotes = quotes.filter(q => 
    q.status === 'open' && 
    !q.proposals.some(p => p.supplierId === user?.id)
  );

  // 2. Aguardando Aprovação: Status 'open' E eu JÁ enviei proposta
  const awaitingApprovalQuotes = quotes.filter(q => 
    q.status === 'open' && 
    q.proposals.some(p => p.supplierId === user?.id)
  );

  // 3. Em Aberto (Aceitos): Status 'closed' E minha proposta foi aceita
  const activeOrders = quotes.filter(q => 
    q.status === 'closed' &&
    q.proposals.some(p => p.supplierId === user?.id && p.status === 'accepted')
  );

  // 4. Finalizados: Status 'completed'
  const completedOrders = quotes.filter(q => 
    q.status === 'completed' &&
    q.proposals.some(p => p.supplierId === user?.id && p.status === 'accepted')
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* --- CABEÇALHO --- */}
      <div className="bg-emerald-900 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500 rounded-full opacity-10 translate-y-1/3 -translate-x-1/3 blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shrink-0 text-emerald-100">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight">{supplierProfile.company}</h1>
              <div className="flex items-center gap-1 text-emerald-200 text-xs mt-1">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-white">{supplierProfile.rating}</span>
                <span>• Fornecedor Premium</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm text-emerald-100/80 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-3">
              <User size={16} className="text-emerald-400" />
              <span className="text-white">{supplierProfile.username}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-emerald-400" />
              <span className="text-white">{supplierProfile.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-8 relative z-20 -mt-8">
        
        {/* --- SEÇÃO: ACESSO RÁPIDO (CARDS) --- */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              onClick={() => action.path !== '#' && navigate(action.path)}
              className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all min-h-[90px]"
            >
              <div className={cn("p-2.5 rounded-full", action.bg, action.color)}>
                <action.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight line-clamp-2">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* --- SEÇÃO 1: PEDIDOS DISPONÍVEIS --- */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <SearchIconWrapper icon={ShoppingBag} color="blue" />
              Disponíveis
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200">
                {availableQuotes.length}
              </span>
            </h3>
            <button onClick={() => navigate('/supplier/orders')} className="text-xs font-bold text-blue-600">Ver todos</button>
          </div>
          
          {availableQuotes.length === 0 ? (
            <EmptyState message="Nenhuma nova cotação disponível." />
          ) : (
            <div className="space-y-3">
              {availableQuotes.slice(0, 3).map((quote) => (
                <div 
                  key={quote.id}
                  onClick={() => navigate(`/supplier/request/${quote.id}`)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                  
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                        <Package size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{quote.product.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">{quote.quantity} {quote.product.unit} • {quote.product.category}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                      Novo
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg ml-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate max-w-[120px]">{quote.address ? 'Entrega' : 'Retirada'}</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" />
                      <span>Expira em 24h</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 ml-2 flex justify-end">
                    <span className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Cotar Agora <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- SEÇÃO 2: AGUARDANDO APROVAÇÃO --- */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <SearchIconWrapper icon={Send} color="purple" />
              Aguardando Aprovação
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full border border-purple-200">
                {awaitingApprovalQuotes.length}
              </span>
            </h3>
          </div>

          {awaitingApprovalQuotes.length === 0 ? (
            <EmptyState message="Nenhuma proposta aguardando resposta." />
          ) : (
            <div className="space-y-3">
              {awaitingApprovalQuotes.slice(0, 3).map((quote) => {
                const myProposal = quote.proposals.find(p => p.supplierId === user?.id);
                return (
                  <div 
                    key={quote.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden opacity-90"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l-xl"></div>
                    
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{quote.product.name}</h4>
                        <p className="text-xs text-gray-500">{quote.buyerName}</p>
                      </div>
                      <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-purple-100">
                        Enviado
                      </span>
                    </div>

                    <div className="ml-2 mt-3 bg-gray-50 p-2 rounded-lg flex justify-between items-center">
                      <span className="text-xs text-gray-500">Sua Proposta:</span>
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(myProposal?.price || 0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- SEÇÃO 3: COTAÇÕES ACEITAS (Antigo Em Aberto) --- */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <SearchIconWrapper icon={Clock} color="orange" />
              Cotações Aceitas
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full border border-orange-200">
                {activeOrders.length}
              </span>
            </h3>
          </div>

          {activeOrders.length === 0 ? (
            <EmptyState message="Você não tem pedidos pendentes de entrega." />
          ) : (
            <div className="space-y-3">
              {activeOrders.slice(0, 3).map((quote) => {
                 const myProposal = quote.proposals.find(p => p.supplierId === user?.id);
                 
                 return (
                  <div 
                    key={quote.id}
                    onClick={() => navigate('/chat')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-orange-300 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-xl"></div>
                    
                    <div className="flex justify-between items-start mb-3 pl-2">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm mb-1">{quote.buyerName}</h4>
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1 w-fit">
                          <Clock size={10} /> Aguardando {quote.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Valor</p>
                        <p className="font-bold text-emerald-600 text-sm">{formatCurrency(myProposal?.price || 0)}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 ml-2 flex items-center justify-between border border-gray-100">
                      <div className="flex items-center gap-2">
                        {quote.deliveryType === 'delivery' ? (
                          <Truck size={18} className="text-gray-500" />
                        ) : (
                          <Store size={18} className="text-gray-500" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-medium uppercase">
                            {quote.deliveryType === 'delivery' ? 'Entregar em' : 'Cliente retira em'}
                          </span>
                          <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">
                            {quote.deliveryType === 'delivery' ? quote.address : 'Sua Loja'}
                          </span>
                        </div>
                      </div>
                      <button className="bg-white border border-gray-200 text-gray-600 p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- SEÇÃO 4: PEDIDOS FINALIZADOS --- */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <SearchIconWrapper icon={CheckCircle2} color="emerald" />
              Finalizados
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-200">
                {completedOrders.length}
              </span>
            </h3>
          </div>

          {completedOrders.length === 0 ? (
            <EmptyState message="Nenhum pedido finalizado ainda." />
          ) : (
            <div className="space-y-3">
              {completedOrders.slice(0, 3).map((quote) => (
                <div 
                  key={quote.id}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-700 text-sm line-through decoration-gray-400">{quote.product.name}</h4>
                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">
                      Concluído
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- SEÇÃO 5: DICAS E INSIGHTS --- */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Lightbulb className="text-yellow-500 fill-yellow-500" size={20} />
            <h3 className="font-bold text-gray-800 text-lg">Dicas para Vender Mais</h3>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x">
            {/* Tip Card 1 */}
            <div className="min-w-[260px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white snap-center shadow-lg shadow-indigo-200">
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 backdrop-blur-sm">
                <Clock size={20} className="text-white" />
              </div>
              <h4 className="font-bold text-lg mb-1">Seja Rápido</h4>
              <p className="text-xs text-indigo-100 leading-relaxed mb-3">
                Fornecedores que respondem nos primeiros 30 minutos têm 70% mais chance de fechar negócio.
              </p>
            </div>

            {/* Tip Card 2 */}
            <div className="min-w-[260px] bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white snap-center shadow-lg shadow-emerald-200">
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 backdrop-blur-sm">
                <TrendingUp size={20} className="text-white" />
              </div>
              <h4 className="font-bold text-lg mb-1">Preço Competitivo</h4>
              <p className="text-xs text-emerald-100 leading-relaxed mb-3">
                Ofereça descontos para pagamentos à vista. Isso atrai produtores que buscam economia.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Helper Components ---

const SearchIconWrapper = ({ icon: Icon, color }: { icon: any, color: string }) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className={cn("p-1.5 rounded-lg", colorMap[color] || colorMap.blue)}>
      <Icon size={18} />
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-center">
    <p className="text-sm text-gray-400 font-medium">{message}</p>
  </div>
);
