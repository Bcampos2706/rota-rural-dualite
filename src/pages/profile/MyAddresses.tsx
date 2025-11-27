import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/SupabaseContext'; // Conectado ao Supabase
import { 
  X, 
  MapPin, 
  Trash2, 
  Check, 
  Plus,
  Loader2 
} from 'lucide-react';

export const MyAddresses = () => {
  const navigate = useNavigate();
  const { addresses, addAddress, deleteAddress, setDefaultAddress, isLoading } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newAddress, setNewAddress] = useState({
    street: '',
    district: '',
    city: '',
    state: '',
    cep: '',
    is_default: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAddress(newAddress);
    setIsAdding(false);
    setNewAddress({ street: '', district: '', city: '', state: '', cep: '', is_default: false });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este endereço?")) {
      await deleteAddress(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-start justify-center">
      <div className="bg-white w-full max-w-md rounded-lg shadow-sm p-6 relative min-h-[500px]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl font-bold text-gray-900">Meus endereços</h1>
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Gerencie os endereços para receber serviços
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-emerald-600" />
          </div>
        )}

        {/* Address List */}
        {!isAdding && !isLoading && (
          <div className="space-y-4 mb-6">
            {addresses.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Nenhum endereço cadastrado.</p>
            ) : (
              addresses.map((addr) => (
                <div 
                  key={addr.id} 
                  className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 relative group hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-emerald-600 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div className="flex-1 pr-16">
                      <h3 className="font-medium text-gray-800">{addr.street}</h3>
                      <p className="text-sm text-gray-500">{addr.district} - {addr.city}/{addr.state}</p>
                      <p className="text-sm text-gray-500">CEP: {addr.cep}</p>
                    </div>
                    
                    <div className="absolute top-4 right-4 flex gap-3">
                      <button 
                        onClick={() => handleDelete(addr.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="pl-8">
                    {addr.is_default ? (
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                        <Check size={16} />
                        Endereço padrão
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors"
                      >
                        Definir como padrão
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Rua e Número</label>
              <input 
                type="text" name="street" value={newAddress.street} onChange={handleInputChange} required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
                <input 
                  type="text" name="district" value={newAddress.district} onChange={handleInputChange} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">CEP</label>
                <input 
                  type="text" name="cep" value={newAddress.cep} onChange={handleInputChange} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Cidade</label>
                <input 
                  type="text" name="city" value={newAddress.city} onChange={handleInputChange} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">UF</label>
                <input 
                  type="text" name="state" value={newAddress.state} onChange={handleInputChange} required maxLength={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                />
              </div>
            </div>
            
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input 
                type="checkbox" name="is_default" checked={newAddress.is_default} onChange={handleInputChange}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              Definir como endereço padrão
            </label>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" onClick={() => setIsAdding(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm font-bold"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
              >
                Salvar
              </button>
            </div>
          </form>
        )}

        {/* Add New Button */}
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full border border-dashed border-emerald-200 rounded-xl py-3 flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm hover:bg-emerald-50 transition-colors"
          >
            <Plus size={18} />
            Adicionar novo endereço
          </button>
        )}

      </div>
    </div>
  );
};
