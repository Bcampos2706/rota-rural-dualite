import React, { useState, useEffect } from 'react';
import { 
  Send, 
  ChevronLeft, 
  Search, 
  Phone, 
  CheckCircle2, 
  Store,
  Package,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/SupabaseContext'; // Conectado ao Supabase
import { cn, formatCurrency } from '../lib/utils';

// Mock messages generator (ainda simulado pois não temos tabela de mensagens no momento, mas integrado ao fluxo real)
const generateMockMessages = (supplierName: string) => [
  { id: 1, text: `Olá, recebi seu pedido. Podemos confirmar a entrega?`, sender: 'other', time: '10:00' },
  { id: 2, text: 'Bom dia! Sim, o endereço está correto.', sender: 'me', time: '10:05' },
  { id: 3, text: 'Perfeito. Já estamos separando o material.', sender: 'other', time: '10:06' },
];

export const Chat = () => {
  const navigate = useNavigate();
  const { quotes, finalizeOrder } = useStore();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);

  // Filter chats: Only quotes that are 'closed' (accepted) or 'completed'
  const activeChats = quotes.filter(q => 
    (q.status === 'closed' || q.status === 'completed') && 
    q.proposals.some(p => p.status === 'accepted')
  );

  const selectedQuote = activeChats.find(q => q.id === selectedQuoteId);
  const acceptedProposal = selectedQuote?.proposals.find(p => p.status === 'accepted');

  useEffect(() => {
    if (acceptedProposal) {
      setMessages(generateMockMessages(acceptedProposal.supplierName));
    }
  }, [selectedQuoteId, acceptedProposal]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { 
      id: Date.now(), 
      text: input, 
      sender: 'me', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    }]);
    setInput('');
  };

  const handleFinalizeClick = () => {
    setIsFinalizeModalOpen(true);
  };

  const confirmFinalize = () => {
    if (selectedQuoteId) {
      finalizeOrder(selectedQuoteId);
      setIsFinalizeModalOpen(false);
      // Add a system message
      setMessages([...messages, { 
        id: Date.now(), 
        text: 'Este pedido foi marcado como finalizado.', 
        sender: 'system', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    }
  };

  // --- VIEW: CHAT LIST ---
  if (!selectedQuoteId) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Conversas</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar conversa..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-2">
          {activeChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Store className="text-gray-400" size={32} />
              </div>
              <h3 className="font-bold text-gray-700 mb-1">Nenhuma conversa ativa</h3>
              <p className="text-sm text-gray-500">
                Aceite uma proposta em "Meus Pedidos" para iniciar uma negociação.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {activeChats.map((quote) => {
                const proposal = quote.proposals.find(p => p.status === 'accepted');
                if (!proposal) return null;

                return (
                  <button
                    key={quote.id}
                    onClick={() => setSelectedQuoteId(quote.id)}
                    className="w-full bg-white p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left shadow-sm mb-2"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg">
                        {proposal.supplierName.substring(0, 2).toUpperCase()}
                      </div>
                      {quote.status === 'closed' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{proposal.supplierName}</h3>
                        <span className="text-[10px] text-gray-400">10:06</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <Package size={12} /> {quote.product.name}
                      </p>
                      {quote.status === 'completed' && (
                         <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                           Finalizado
                         </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW: CONVERSATION ---
  return (
    <div className="flex flex-col h-[calc(100vh-0px)] bg-gray-50 relative z-50">
      {/* Chat Header */}
      <div className="bg-white p-3 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedQuoteId(null)} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
              {acceptedProposal?.supplierName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm leading-tight">{acceptedProposal?.supplierName}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {selectedQuote?.product.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
           <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
             <Phone size={20} />
           </button>
           
           {selectedQuote?.status === 'closed' && (
             <button 
              onClick={handleFinalizeClick}
              className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors ml-1 shadow-sm"
             >
               Finalizar
             </button>
           )}
           {selectedQuote?.status === 'completed' && (
             <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-lg ml-1 border border-gray-200">
               Finalizado
             </span>
           )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
        {/* Info Banner */}
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 max-w-xs text-center shadow-sm">
            <p className="text-xs text-yellow-800">
              <span className="font-bold">Proposta Aceita:</span> {formatCurrency(acceptedProposal?.price || 0)}
            </p>
            <p className="text-[10px] text-yellow-600 mt-1">
              Combine os detalhes da entrega e pagamento por aqui.
            </p>
          </div>
        </div>

        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full font-medium">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl shadow-sm relative",
                msg.sender === 'me' 
                  ? "bg-emerald-600 text-white rounded-tr-none" 
                  : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
              )}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={cn(
                  "text-[10px] mt-1 flex items-center justify-end gap-1",
                  msg.sender === 'me' ? "text-emerald-100" : "text-gray-400"
                )}>
                  {msg.time}
                  {msg.sender === 'me' && <Check size={12} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100 pb-safe">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={selectedQuote?.status === 'completed'}
            className="flex-1 bg-gray-100 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button 
            type="submit"
            disabled={!input.trim() || selectedQuote?.status === 'completed'}
            className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Finalize Modal */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Finalizar Pedido?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Isso confirmará que você recebeu o produto ou fechou o negócio com sucesso. O pedido será movido para "Finalizados".
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsFinalizeModalOpen(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmFinalize}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
