import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/MockStore'; // Updated import
import { 
  ArrowLeft, 
  Search, 
  Box, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MessageSquare, 
  Truck,
  FileQuestion,
  Store,
  Mail,
  Phone,
  Eye,
  CheckCircle,
  X,
  DollarSign,
  Building,
  Sparkles,
  Download
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Proposal } from '../../types';

export const QuoteDetails = () => {
  const { id } = useParams();
  const { quotes, acceptProposal } = useStore();
  const navigate = useNavigate();
  
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const quote = quotes.find(q => q.id === id);

  if (!quote) return <div className="p-8 text-center text-gray-500">Pedido não encontrado</div>;

  // Mock data to match the design exactly since these fields aren't in our base model
  const buyerDetails = {
    name: "BRUNO FERREIRA CAMPOS",
    cpf: "085.894.076-08",
    email: "brunocamposinfra@gmail.com",
    phone: "34998313195"
  };

  const hasProposals = quote.proposals.length > 0;
  const isClosed = quote.status === 'closed';

  // Status Steps Configuration
  const steps = [
    { id: 1, label: 'Pedido Criado', icon: Box, completed: true },
    { id: 2, label: 'Enviado aos Fornecedores', icon: Truck, completed: hasProposals || isClosed, current: !hasProposals && !isClosed },
    { id: 3, label: 'Propostas Recebidas', icon: FileText, completed: hasProposals || isClosed, current: hasProposals && !isClosed },
    { id: 4, label: 'Proposta Aceita', icon: CheckCircle2, completed: isClosed, current: false },
    { id: 5, label: 'Finalizado via Chat', icon: MessageSquare, completed: false, current: false },
  ];

  const currentStepIndex = steps.findIndex(s => s.current) + 1;
  const displayStepIndex = currentStepIndex > 0 ? currentStepIndex : (isClosed ? 4 : 3);

  const handleConfirmAccept = () => {
    if (viewingProposal && quote) {
      acceptProposal(quote.id, viewingProposal.id);
      setIsConfirmModalOpen(false);
      // Não limpamos o viewingProposal aqui para usá-lo no modal de sucesso
      setIsSuccessModalOpen(true);
    }
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalOpen(false);
    setViewingProposal(null);
  };

  const handleGoToChat = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar ao Dashboard
          </button>
          <h1 className="font-bold text-lg text-gray-900 ml-2">
            Pedido #{quote.id.substring(0, 8)}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        
        {/* Card 1: Informações do Pedido */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Informações do Pedido</h2>
          
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
              <label className="block text-xs text-gray-500 mb-1">E-mail</label>
              <p className="text-sm font-medium text-gray-900">{buyerDetails.email}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Telefone</label>
              <p className="text-sm font-medium text-gray-900">{buyerDetails.phone}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Tipo de Entrega</label>
              <p className="text-sm font-medium text-gray-900">
                {quote.deliveryType === 'delivery' ? 'Entrega na Propriedade' : 'Retirada na Loja'}
              </p>
              {quote.deliveryType === 'delivery' && (
                <p className="text-xs text-gray-500 mt-1">{quote.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Status do Pedido */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Box size={20} /> Status do Pedido
            </h2>
            <span className="text-xs text-gray-500">Etapa {displayStepIndex} de 5</span>
          </div>

          <div className="mb-6">
            <span className={cn(
              "text-xs font-bold px-3 py-1 rounded-full",
              isClosed ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
            )}>
              {isClosed ? 'Pedido Fechado' : (hasProposals ? 'Propostas Recebidas' : 'Aguardando Propostas')}
            </span>
          </div>

          <div className="space-y-2">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  step.completed ? "bg-green-50 border-green-100" : 
                  step.current ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200" : "bg-gray-50 border-transparent opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-1.5 rounded-full",
                    step.completed ? "text-green-600" : 
                    step.current ? "text-blue-600" : "text-gray-400"
                  )}>
                    <step.icon size={18} />
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    step.completed ? "text-green-800" : 
                    step.current ? "text-blue-800" : "text-gray-500"
                  )}>
                    {step.label}
                  </span>
                </div>
                
                {step.completed && <CheckCircle2 size={18} className="text-green-600" />}
                {step.current && <Clock size={18} className="text-blue-600 animate-pulse" />}
              </div>
            ))}
          </div>

          {/* Status Info Box */}
          {!hasProposals && !isClosed && (
            <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex gap-3">
              <Clock className="text-yellow-600 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-yellow-800 text-sm">Aguardando</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Pedido foi enviado para fornecedores. Aguardando propostas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Pesquisar Produto */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Pesquisar Produto</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar produtos..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            />
          </div>
        </div>

        {/* Card 4: Itens Solicitados */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Itens Solicitados</h2>
          
          <div className="border border-gray-100 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-4">{quote.product.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quantidade:</label>
                <p className="text-sm font-medium text-gray-900">{quote.quantity}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Descrição:</label>
                <p className="text-sm font-medium text-gray-900 max-w-[150px] truncate">
                  {quote.product.name} {quote.product.category}
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Observações:</label>
                <p className="text-sm font-medium text-gray-900">Sem observações</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Propostas dos Fornecedores */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 min-h-[200px]">
          <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
             <CheckCircle className="text-green-600" size={20} />
             Propostas Recebidas ({quote.proposals.length})
          </h2>
          
          {!hasProposals ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-gray-300 mb-4">
                <FileQuestion size={64} strokeWidth={1.5} />
              </div>
              <p className="text-gray-400 font-medium text-sm mb-1">
                Ainda não há propostas para este pedido
              </p>
              <p className="text-gray-400 text-xs">
                Os fornecedores serão notificados automaticamente
              </p>
            </div>
          ) : (
            <div className="space-y-4">
               {quote.proposals.map((proposal) => {
                 const isAccepted = proposal.status === 'accepted';
                 const isRejected = proposal.status === 'rejected';
                 
                 return (
                 <div key={proposal.id} className={cn(
                   "border rounded-xl p-4 transition-shadow",
                   isAccepted ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" : 
                   isRejected ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-200 hover:shadow-md"
                 )}>
                    
                    {/* Top Row: Supplier Info & Price */}
                    <div className="flex flex-col justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                                <Store size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900 text-base truncate">{proposal.supplierName}</h4>
                                    {isAccepted ? (
                                      <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                        <CheckCircle size={10} /> Aceita
                                      </span>
                                    ) : (
                                      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">Enviada</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-2">AgroMais ltda</p>
                                
                                <div className="flex flex-col gap-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Mail size={12} className="text-gray-400 shrink-0" />
                                        <span className="truncate">cfagronegocio@gmail.com</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={12} className="text-gray-400 shrink-0" />
                                        <span>34998313195</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
                            <p className="text-xs text-gray-500">Valor Total</p>
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xl">
                                <span className="text-sm">$</span>
                                {formatCurrency(proposal.price)}
                            </div>
                        </div>
                    </div>

                    {/* Gray Box: Details */}
                    <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] text-gray-500 mb-0.5">Prazo de Entrega:</label>
                            <p className="font-bold text-gray-900 text-xs">1 dia útil</p>
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 mb-0.5">Forma de Pagamento:</label>
                            <p className="font-bold text-gray-900 text-xs">15 dias</p>
                        </div>
                    </div>

                    {/* Footer: Timestamp & Action */}
                    <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 text-center">
                            Enviado em: 24/11/2025 às 11:06:03
                        </p>
                        
                        {!isClosed && (
                          <button 
                             onClick={() => setViewingProposal(proposal)}
                             className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
                          >
                              <Eye size={14} />
                              Ver Detalhes da Proposta
                          </button>
                        )}
                    </div>
                 </div>
               )})}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: DETALHES DA PROPOSTA --- */}
      {viewingProposal && !isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-gray-700" />
                Detalhes da Proposta
              </h3>
              <button 
                onClick={() => setViewingProposal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 pt-0 space-y-4">
              
              {/* Supplier Card */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 shrink-0">
                    <Building size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-gray-900">{viewingProposal.supplierName}</h4>
                      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Enviada</span>
                    </div>
                    <p className="text-xs text-gray-500">Agromais</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">cfagronegocio@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>34998313195</span>
                  </div>
                </div>
              </div>

              {/* Price Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-3xl mb-1">
                  <span className="text-lg">$</span>
                  {formatCurrency(viewingProposal.price)}
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Valor Total</p>
                <p className="text-[10px] text-gray-400">
                  Produtos: {formatCurrency(viewingProposal.price * 0.9)} + Frete: {formatCurrency(viewingProposal.price * 0.1)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Clock size={14} />
                    <span className="text-[10px] font-medium">Prazo de Entrega</span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">5 dias</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <DollarSign size={14} />
                    <span className="text-[10px] font-medium">Forma de Pagamento</span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">15 dias</p>
                </div>
              </div>

              {/* Attachment Section (NEW) */}
              {viewingProposal.attachment && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="bg-white p-1.5 rounded border border-gray-200 text-red-500">
                       <FileText size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[180px]">
                        {viewingProposal.attachment}
                      </span>
                      <span className="text-[10px] text-gray-400">Documento Anexado</span>
                    </div>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2 rounded-full transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-[10px] text-gray-400 text-center pt-2">
                Proposta enviada em: 24/11/2025 às 10:47:22
              </p>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setViewingProposal(null)}
                className="px-4 py-2.5 border border-gray-300 bg-white text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Fechar
              </button>
              
              {quote.status === 'open' && (
                <button 
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Aceitar Proposta
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL: CONFIRMAÇÃO DE ACEITE --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">Aceitar Proposta</h3>
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="font-medium text-gray-800 mb-3 text-sm leading-relaxed">
                Você tem certeza que deseja aceitar esta proposta do fornecedor?
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ao aceitar, você poderá iniciar o chat para finalizar o pedido e as demais propostas serão rejeitadas automaticamente.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmAccept}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Aceitar Proposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: SUCESSO (PARABÉNS) --- */}
      {isSuccessModalOpen && viewingProposal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 relative">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseSuccess}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles className="text-emerald-600" size={32} />
            </div>

            {/* Title & Description */}
            <h2 className="text-emerald-900 font-bold text-xl text-center mb-3 leading-tight">
              Parabéns! Você encontrou a melhor proposta!
            </h2>
            <p className="text-gray-500 text-center text-xs leading-relaxed px-4 mb-4">
              O próximo passo é entrar em contato com o Fornecedor e finalizar o pedido.
            </p>

            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 size={14} />
                Proposta Aceita
              </div>
            </div>

            {/* Card Info */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-6">
              {/* Supplier Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-200 p-2 rounded-full text-emerald-800">
                   <Store size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{viewingProposal.supplierName}</h4>
                  <p className="text-xs text-emerald-700 font-medium">Agromais</p>
                </div>
              </div>

              {/* Price Box */}
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-lg">
                   <span className="text-sm">$</span>
                   {formatCurrency(viewingProposal.price)}
                </div>
                <p className="text-[10px] text-emerald-600 font-medium">Valor Total Aceito</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button 
                onClick={handleGoToChat}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Iniciar Chat com Fornecedor
              </button>
              
              <button 
                onClick={handleCloseSuccess}
                className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Voltar ao Pedido
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-3 border-t border-gray-100 text-center">
               <p className="text-[10px] text-gray-400">
                 Pedido #{quote.id.substring(0, 8)} • Proposta aceita em {new Date().toLocaleDateString()}
               </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
