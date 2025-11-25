import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  MapPin, 
  Edit2, 
  Trash2, 
  Check, 
  Plus 
} from 'lucide-react';

interface Address {
  id: number;
  street: string;
  district: string;
  city: string;
  state: string;
  cep: string;
  isDefault: boolean;
}

export const MyAddresses = () => {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      street: "Rua Augusta, 1508",
      district: "Consolação",
      city: "São Paulo",
      state: "SP",
      cep: "01304-001",
      isDefault: true
    },
    {
      id: 2,
      street: "Av. Paulista, 1000 - Apto 501",
      district: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      cep: "01310-100",
      isDefault: false
    }
  ]);

  const handleSetDefault = (id: number) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este endereço?")) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-start justify-center">
      {/* Modal-like Container to match image */}
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

        {/* Address List */}
        <div className="space-y-4 mb-6">
          {addresses.map((addr) => (
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
                
                {/* Actions (Edit/Delete) */}
                <div className="absolute top-4 right-4 flex gap-3">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(addr.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Default Status / Action */}
              <div className="pl-8">
                {addr.isDefault ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <Check size={16} />
                    Endereço padrão
                  </div>
                ) : (
                  <button 
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    Definir como padrão
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Button */}
        <button className="w-full border border-dashed border-emerald-200 rounded-xl py-3 flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm hover:bg-emerald-50 transition-colors">
          <Plus size={18} />
          Adicionar novo endereço
        </button>

      </div>
    </div>
  );
};
