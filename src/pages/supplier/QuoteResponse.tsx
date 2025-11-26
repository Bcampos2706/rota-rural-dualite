import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/MockStore'; // Updated import
import { 
  ChevronLeft, 
  Upload, 
  X,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const QuoteResponse = () => {
  const { id } = useParams();
  const { quotes, addProposal } = useStore();
  const navigate = useNavigate();
  
  const quote = quotes.find(q => q.id === id);
  
  // Form States
  const [productValue, setProductValue] = useState('');
  const [freightValue, setFreightValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [observations, setObservations] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  if (!quote) return <div>Pedido não encontrado</div>;

  // Mock Buyer Details (to match design)
  const buyerDetails = {
    name: quote.buyerName,
    cpf: "085.894.076-08",
    email: "brunocamposinfra@gmail.com",
    address: quote.address || "Não informado"
  };

  // Derived Total
  const totalValue = (Number(productValue) || 0) + (Number(freightValue) || 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    if (!productValue || !deliveryTime || !paymentMethod) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    addProposal(quote.id, {
      price: totalValue,
      deliveryDate: deliveryTime, // Using text for now as per design input "Ex: 5 dias úteis"
      notes: observations,
      attachment: fileName || undefined
    });
    navigate('/supplier');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm">
          <ChevronLeft size={20} />
          Voltar
        </button>
        <h1 className="font-bold text-lg text-gray-900">
          Detalhes do Pedido #{quote.id.substring(0, 8)}
        </h1>
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        
        {/* Card 1: Informações do Cliente */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Informações do Cliente</h2>
          
          <div className="mb-4">
            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full border border-gray-200 font-medium">
              pendente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nome do Cliente</label>
              <p className="text-sm font-medium text-gray-900">{buyerDetails.name}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">CPF/CNPJ</label>
              <p className="text-sm font-medium text-gray-900">{buyerDetails.cpf}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Endereço</label>
              <p className="text-sm font-medium text-gray-900">{buyerDetails.address}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">E-mail</label>
              <p className="text-sm font-medium text-gray-900">{buyerDetails.email}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Itens do Pedido */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Itens do Pedido</h2>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-4">{quote.product.name}</h3>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <label className="block text-xs font-bold text-gray-700">Marca:</label>
                <p className="text-sm text-gray-600">Não informado</p>
              </div>
              <div className="text-right">
                <label className="block text-xs font-bold text-gray-700">Quantidade:</label>
                <p className="text-sm text-gray-600">{quote.quantity}</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700">Unidade:</label>
                <p className="text-sm text-gray-600">{quote.product.unit}</p>
              </div>
              <div className="text-right">
                <label className="block text-xs font-bold text-gray-700">Observações:</label>
                <p className="text-sm text-gray-600">Nenhuma</p>
              </div>
              
              <div className="col-span-2 border-t border-gray-100 pt-2 mt-2">
                <label className="block text-xs font-bold text-gray-700">Tipo de Entrega:</label>
                <p className="text-sm text-gray-600">
                  {quote.deliveryType === 'pickup' ? 'Retirada na Loja' : 'Entrega na Propriedade'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Adicionar Cotação (Anexo) */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Adicionar Cotação</h2>
          
          <label className="block text-sm font-bold text-gray-700 mb-2">Anexar Documento</label>
          <div className="flex gap-2">
            <div className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-white flex items-center truncate">
              {fileName || "Nenhum arquivo escolhido"}
            </div>
            <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
              <Upload size={16} />
              Anexar
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        {/* Card 4: Resumo Financeiro */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Resumo Financeiro</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">Valor Total dos Produtos:</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={productValue}
                  onChange={(e) => setProductValue(e.target.value)}
                  className="w-32 border border-gray-300 rounded-md px-3 py-1.5 text-right text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0,00"
                />
                <span className="text-sm text-gray-500 w-6">R$</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">Frete:</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={freightValue}
                  onChange={(e) => setFreightValue(e.target.value)}
                  className="w-32 border border-gray-300 rounded-md px-3 py-1.5 text-right text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0,00"
                />
                <span className="text-sm text-gray-500 w-6">R$</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <label className="text-base font-bold text-gray-900">Valor Final:</label>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Condições de Pagamento e Entrega */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Condições de Pagamento e Entrega</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Forma de Pagamento</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">Selecione a forma de pagamento</option>
                <option value="boleto_15">Boleto 15 dias</option>
                <option value="boleto_30">Boleto 30 dias</option>
                <option value="pix">PIX à vista</option>
                <option value="cartao">Cartão de Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Prazo de Entrega</label>
              <input 
                type="text" 
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="Ex: 5 dias úteis"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Observações</label>
              <textarea 
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observações sobre a proposta..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/supplier')}
              className="w-full sm:w-auto px-6 py-2.5 bg-red-500 text-white rounded-md font-bold text-sm hover:bg-red-600 transition-colors"
            >
              Rejeitar Pedido
            </button>
            <button 
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#86cfa3] text-white rounded-md font-bold text-sm hover:bg-[#75bd90] transition-colors"
            >
              Salvar e Enviar Proposta
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
