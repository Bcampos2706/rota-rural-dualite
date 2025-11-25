import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  User, 
  FileText, 
  Mail, 
  Calendar, 
  Briefcase, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Plus, 
  Check,
  Save
} from 'lucide-react';

const CATEGORIES = [
  "Auto Peças",
  "Casa Agropecuária",
  "Ferragens",
  "Materiais de Construção",
  "Peças Agrícolas"
];

export const EditProfile = () => {
  const navigate = useNavigate();
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: "BRUNO FERREIRA CAMPOS",
    cpf: "085.894.076-08",
    email: "brunocamposinfra@gmail.com",
    birthDate: "1990-05-15",
    company: "Fazenda Santa Fé",
    phone: "(66) 99721-7811",
    whatsapp: "(66) 99721-7811",
    branch: "Matriz - Sorriso/MT",
    selectedCategories: ["Peças Agrícolas", "Casa Agropecuária"] as string[]
  });

  // Branch Logic
  const [branches, setBranches] = useState(["Matriz - Sorriso/MT", "Filial 1 - Sinop/MT"]);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => {
      const current = prev.selectedCategories;
      if (current.includes(category)) {
        return { ...prev, selectedCategories: current.filter(c => c !== category) };
      } else {
        return { ...prev, selectedCategories: [...current, category] };
      }
    });
  };

  const handleAddBranch = () => {
    if (newBranchName.trim()) {
      setBranches([...branches, newBranchName]);
      setFormData(prev => ({ ...prev, branch: newBranchName }));
      setNewBranchName("");
      setIsAddingBranch(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    alert("Dados atualizados com sucesso!");
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="font-bold text-lg text-gray-900">Meu Perfil</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto space-y-6">
        
        {/* Personal Data Section */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <User size={16} /> Dados Pessoais
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="date" 
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Business Data Section */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Briefcase size={16} /> Dados Comerciais
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa ou Fazenda</label>
            <input 
              type="text" 
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filial</label>
            {isAddingBranch ? (
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Nome da nova filial"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none"
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={handleAddBranch}
                  className="bg-emerald-600 text-white p-2.5 rounded-lg hover:bg-emerald-700"
                >
                  <Check size={20} />
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAddingBranch(false)}
                  className="bg-gray-200 text-gray-600 p-2.5 rounded-lg hover:bg-gray-300"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <select 
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none bg-white appearance-none"
                  >
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAddingBranch(true)}
                  className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100 hover:bg-emerald-100"
                  title="Adicionar Filial"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            Categorias de Interesse
          </h2>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const isSelected = formData.selectedCategories.includes(cat);
              return (
                <label 
                  key={cat}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? "border-emerald-500 bg-emerald-50" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${
                    isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300 bg-white"
                  }`}>
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={isSelected}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span className={`text-sm font-medium ${isSelected ? "text-emerald-900" : "text-gray-700"}`}>
                    {cat}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Atualizar Dados
        </button>

      </form>
    </div>
  );
};
