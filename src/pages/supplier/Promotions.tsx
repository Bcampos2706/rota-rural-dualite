import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/MockStore'; // Updated import
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  Calendar, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Tag
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Promotion } from '../../types';

export const Promotions = () => {
  const navigate = useNavigate();
  const { promotions, addPromotion, togglePromotionStatus, deletePromotion } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    promoPrice: '',
    startDate: '',
    endDate: '',
    imageName: ''
  });

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta promoção?')) {
      await deletePromotion(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPromotion({
      title: formData.title,
      description: formData.description,
      image: "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?auto=format&fit=crop&q=80&w=300&h=200", // Mock Image for now
      originalPrice: Number(formData.originalPrice),
      promoPrice: Number(formData.promoPrice),
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: true
    });

    setIsModalOpen(false);
    setFormData({ title: '', description: '', originalPrice: '', promoPrice: '', startDate: '', endDate: '', imageName: '' });
  };

  // --- Helper para Status ---
  const getStatus = (promo: Promotion) => {
    const today = new Date().toISOString().split('T')[0];
    if (!promo.isActive) return { label: 'Inativa', class: 'bg-gray-100 text-gray-500 border-gray-200' };
    if (promo.endDate < today) return { label: 'Expirada', class: 'bg-red-50 text-red-600 border-red-100' };
    return { label: 'Ativa', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  };

  const filteredPromotions = promotions.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/supplier')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-gray-900">Minhas Promoções</h1>
            <p className="text-xs text-gray-500">Gerencie suas campanhas do slideshow</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar promoção..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> Criar Campanha
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {filteredPromotions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Tag className="opacity-20" size={32} />
            </div>
            <p className="text-sm font-medium">Nenhuma promoção encontrada.</p>
          </div>
        ) : (
          filteredPromotions.map((promo) => {
            const status = getStatus(promo);
            
            return (
              <div key={promo.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group">
                <div className="flex flex-col sm:flex-row">
                  {/* Image Section */}
                  <div className="sm:w-1/3 h-40 sm:h-auto relative">
                    <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border shadow-sm", status.class)}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{promo.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-400 line-through">{formatCurrency(promo.originalPrice)}</span>
                        <span className="text-lg font-bold text-emerald-600">{formatCurrency(promo.promoPrice)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(promo.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <span>até</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(promo.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-50">
                      <button 
                        onClick={() => togglePromotionStatus(promo.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          promo.isActive ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                        title={promo.isActive ? "Desativar" : "Ativar"}
                      >
                        {promo.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      
                      <button className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors" title="Editar">
                        <Edit2 size={18} />
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" 
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL DE CADASTRO (Mantido igual, apenas conectado ao submit real) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            {/* ... Header ... */}
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-xs font-bold flex items-center gap-1 transition-colors">
                <ChevronLeft size={14} /> Voltar
              </button>
              <h2 className="font-bold text-xl text-gray-900">Cadastrar Promoção</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
               {/* ... Campos do formulário (mantidos iguais) ... */}
               <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Título da Promoção</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Ex: Desconto especial" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Descrição</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Detalhes..." rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none text-sm resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Anexar Imagem</label>
                <div className="flex items-center gap-3 border border-gray-300 rounded-lg p-1.5 pl-4 bg-white">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded transition-colors">
                    Escolher arquivo
                    <input type="file" className="hidden" onChange={(e) => setFormData(prev => ({...prev, imageName: e.target.files?.[0]?.name || ''}))} />
                  </label>
                  <span className="text-sm text-gray-500 truncate">{formData.imageName || "Nenhum arquivo escolhido"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Preço Original</label>
                  <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Preço Promocional</label>
                  <input type="number" name="promoPrice" value={formData.promoPrice} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none text-sm" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Início</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Fim</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none text-sm" required />
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-2">
                <button type="submit" className="flex-1 bg-[#0f172a] text-white font-bold py-3 rounded-lg hover:bg-black transition-colors">Cadastrar Promoção</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
