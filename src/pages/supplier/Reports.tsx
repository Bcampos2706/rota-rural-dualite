import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/MockStore'; // Updated import
import { 
  ChevronLeft, 
  Calendar, 
  Download, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export const Reports = () => {
  const navigate = useNavigate();
  const { quotes } = useStore();
  const [dateRange, setDateRange] = useState('this_month');

  // --- CÁLCULOS E MÉTRICAS ---
  
  const metrics = useMemo(() => {
    // Filtrar apenas propostas deste fornecedor
    const myProposals = quotes.flatMap(q => 
      q.proposals.filter(p => p.supplierId === 'user-supplier').map(p => ({
        ...p,
        quoteStatus: q.status,
        buyerId: q.buyerId
      }))
    );

    // 1. Pedidos e Status
    const totalProposals = myProposals.length;
    const acceptedProposals = myProposals.filter(p => p.status === 'accepted');
    const rejectedProposals = myProposals.filter(p => p.status === 'rejected');
    const pendingProposals = myProposals.filter(p => p.status === 'pending');

    // 2. Financeiro
    const totalNegotiated = acceptedProposals.reduce((acc, curr) => acc + curr.price, 0);
    // Simulação: Valor a receber (considerando que 80% ainda não foi pago ou está em prazo)
    const receivableValue = totalNegotiated * 0.8; 
    
    // 3. Pedidos Perdidos (Onde o pedido fechou, mas minha proposta foi rejeitada)
    const lostOrdersCount = rejectedProposals.length;
    const lostValue = rejectedProposals.reduce((acc, curr) => acc + curr.price, 0);

    // 4. Conversão
    const conversionRate = totalProposals > 0 
      ? ((acceptedProposals.length / totalProposals) * 100).toFixed(1) 
      : '0.0';

    // 5. Clientes Ativos (Contagem de compradores únicos com propostas aceitas)
    const uniqueClients = new Set(acceptedProposals.map(p => p.buyerId)).size;

    // 6. Mock de Devoluções/Trocas (Dados estáticos pois não existem no modelo)
    const returnsCount = 1;
    const returnsValue = 450.00;

    return {
      totalProposals,
      acceptedCount: acceptedProposals.length,
      rejectedCount: rejectedProposals.length,
      pendingCount: pendingProposals.length,
      totalNegotiated,
      receivableValue,
      lostOrdersCount,
      lostValue,
      conversionRate,
      uniqueClients,
      returnsCount,
      returnsValue
    };
  }, [quotes]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/supplier')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Relatório Gerencial</h1>
              <p className="text-xs text-gray-500">Visão completa do seu negócio</p>
            </div>
          </div>
          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors" title="Exportar PDF">
            <Download size={20} />
          </button>
        </div>

        {/* Filtro de Data */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setDateRange('this_month')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
              dateRange === 'this_month' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Este Mês
          </button>
          <button 
            onClick={() => setDateRange('last_month')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
              dateRange === 'last_month' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Mês Passado
          </button>
          <button 
            onClick={() => setDateRange('year')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
              dateRange === 'year' ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Ano
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* 1. Resumo Financeiro (Big Numbers) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <DollarSign size={16} />
              <span className="text-xs font-bold uppercase tracking-wide">Negociado</span>
            </div>
            <h3 className="text-xl font-bold mb-1">{formatCurrency(metrics.totalNegotiated)}</h3>
            <div className="flex items-center gap-1 text-[10px] bg-emerald-500/30 w-fit px-2 py-0.5 rounded-full">
              <TrendingUp size={10} /> +12% vs mês anterior
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Clock size={16} />
              <span className="text-xs font-bold uppercase tracking-wide">A Receber</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{formatCurrency(metrics.receivableValue)}</h3>
            <p className="text-[10px] text-gray-400">Previsão para próximos 30 dias</p>
          </div>
        </div>

        {/* 2. Funil de Vendas (Status dos Pedidos) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-600" />
            Funil de Pedidos
          </h3>
          
          <div className="space-y-4">
            {/* Ativos / Pendentes */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium flex items-center gap-1">
                  <Clock size={12} /> Cotações Ativas
                </span>
                <span className="font-bold text-gray-800">{metrics.pendingCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            {/* Fechados / Aceitos */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> Pedidos Fechados
                </span>
                <span className="font-bold text-emerald-600">{metrics.acceptedCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Number(metrics.conversionRate)}%` }}></div>
              </div>
            </div>

            {/* Perdidos */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium flex items-center gap-1">
                  <XCircle size={12} /> Pedidos Perdidos
                </span>
                <span className="font-bold text-red-500">{metrics.lostOrdersCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                Perda estimada: {formatCurrency(metrics.lostValue)}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Métricas Operacionais (Grid) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Conversão */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-3">
              <TrendingUp size={20} />
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">Taxa de Conversão</p>
            <h4 className="text-2xl font-bold text-gray-800">{metrics.conversionRate}%</h4>
            <p className="text-[10px] text-green-600 mt-1">Dentro da meta</p>
          </div>

          {/* Tempo de Resposta */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-3">
              <Clock size={20} />
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">Tempo de Resposta</p>
            <h4 className="text-2xl font-bold text-gray-800">18 min</h4>
            <p className="text-[10px] text-orange-600 mt-1">Média das cotações</p>
          </div>

          {/* Clientes Ativos */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-3">
              <Users size={20} />
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">Clientes Ativos</p>
            <h4 className="text-2xl font-bold text-gray-800">{metrics.uniqueClients}</h4>
            <p className="text-[10px] text-gray-400 mt-1">Compraram neste mês</p>
          </div>

          {/* Devoluções/Trocas */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 mb-3">
              <RefreshCw size={20} />
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">Devolução / Troca</p>
            <h4 className="text-2xl font-bold text-gray-800">{metrics.returnsCount}</h4>
            <p className="text-[10px] text-red-400 mt-1">Total: {formatCurrency(metrics.returnsValue)}</p>
          </div>
        </div>

        {/* 4. Banner de Insight */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Oportunidade Identificada</h4>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Você perdeu 3 cotações de "Sementes" por preço alto. Considere revisar sua margem para esta categoria.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
