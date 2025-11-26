import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/MockStore';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Tractor, 
  Store, 
  ArrowRight, 
  ChevronLeft, 
  CheckCircle2, 
  User, 
  FileText, 
  Calendar, 
  Phone, 
  MapPin, 
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- Constants ---
const BRANCHES = ["Matriz", "Filial Norte", "Filial Sul"];

const FALLBACK_CATEGORIES = [
  "Auto Peças",
  "Casa Agropecuária",
  "Ferragens",
  "Materiais de Construção",
  "Peças Agrícolas",
  "Sementes",
  "Veterinária",
  "Nutrição Animal"
];

export const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useStore();

  // --- Global State ---
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- Login State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- Register State ---
  const [registerStep, setRegisterStep] = useState(1);
  const [userType, setUserType] = useState<'producer' | 'supplier' | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    // Common
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    branch: 'Matriz',
    selectedCategories: [] as string[],
    
    // Producer Specific
    cpfCnpj: '',
    birthDate: '',
    farmName: '',
    whatsapp: '',
    
    // Supplier Specific
    companyName: '',
    companyCnpj: '',
  });

  // --- Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Simulação de Login Mock
      // Se o email contiver "fornecedor" ou "supplier", loga como fornecedor
      const role = loginEmail.toLowerCase().includes('fornecedor') || loginEmail.toLowerCase().includes('supplier') 
        ? 'supplier' 
        : 'buyer';
      
      await login(loginEmail, role);

      if (role === 'supplier') {
        navigate('/supplier');
      } else {
        navigate('/buyer');
      }
    } catch (error: any) {
      setErrorMsg('Erro ao realizar login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.email || !formData.password) {
      setErrorMsg("Preencha os campos obrigatórios.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await register({
        ...formData,
        role: userType
      });

      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error("Registration Error:", error);
      setErrorMsg('Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessRedirect = () => {
    setIsSuccessModalOpen(false);
    setActiveTab('login');
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => {
      const current = prev.selectedCategories;
      if (current.includes(cat)) return { ...prev, selectedCategories: current.filter(c => c !== cat) };
      return { ...prev, selectedCategories: [...current, cat] };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderUserTypeCard = (type: 'producer' | 'supplier', icon: any, label: string, desc: string) => (
    <button
      onClick={() => setUserType(type)}
      className={cn(
        "flex flex-col items-center p-4 rounded-xl border-2 transition-all w-full text-center h-full",
        userType === type 
          ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600" 
          : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center mb-3",
        userType === type ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"
      )}>
        {React.createElement(icon, { size: 24 })}
      </div>
      <h3 className={cn("font-bold text-sm mb-1", userType === type ? "text-emerald-900" : "text-gray-800")}>{label}</h3>
      <p className="text-xs text-gray-500 leading-tight">{desc}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Logo Area */}
      <div className="mb-8 text-center">
        <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100 p-2">
          <img 
            src="https://i.ibb.co/67X3xfSV/Design-sem-nome-2.png" 
            alt="AgroMarket Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AgroMarket</h1>
        <p className="text-sm text-gray-500">O marketplace do agronegócio</p>
      </div>

      {/* Main Card */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('login')}
            className={cn(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === 'login' ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Entrar
            {activeTab === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full mx-8" />}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={cn(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === 'register' ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Cadastrar
            {activeTab === 'register' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full mx-8" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-center gap-2 mb-4">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {/* --- LOGIN TAB --- */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Dica: use "fornecedor" no email para testar como Fornecedor</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {isLoading ? 'Entrando...' : (
                  <>Entrar <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}

          {/* --- REGISTER TAB --- */}
          {activeTab === 'register' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", registerStep === 1 ? "bg-emerald-600" : "bg-emerald-200")} />
                <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", registerStep === 2 ? "bg-emerald-600" : "bg-gray-200")} />
              </div>

              {/* STEP 1: User Type Selection */}
              {registerStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="font-bold text-lg text-gray-900">Qual é o seu perfil?</h2>
                    <p className="text-sm text-gray-500">Selecione como você deseja atuar na plataforma</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {renderUserTypeCard('producer', Tractor, 'Produtor Rural', 'Compre insumos e gerencie sua fazenda')}
                    {renderUserTypeCard('supplier', Store, 'Fornecedor', 'Venda produtos e envie orçamentos')}
                  </div>

                  <button 
                    onClick={() => setRegisterStep(2)}
                    disabled={!userType}
                    className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2: Details Form */}
              {registerStep === 2 && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <button 
                    type="button" 
                    onClick={() => setRegisterStep(1)}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 mb-2"
                  >
                    <ChevronLeft size={14} /> Voltar
                  </button>

                  <div className="text-center mb-4">
                    <h2 className="font-bold text-lg text-gray-900">
                      {userType === 'producer' ? 'Cadastro de Produtor' : 'Cadastro de Fornecedor'}
                    </h2>
                    <p className="text-xs text-gray-500">Preencha seus dados para finalizar</p>
                  </div>
                  
                  <div className="h-[400px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                    
                    {/* --- PRODUCER FIELDS --- */}
                    {userType === 'producer' && (
                      <>
                        <InputGroup icon={User} label="Nome Completo" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Seu nome" required />
                        <InputGroup icon={FileText} label="CPF/CNPJ" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleInputChange} placeholder="000.000.000-00" required />
                        <InputGroup icon={Calendar} label="Data de Nascimento" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
                        <InputGroup icon={Tractor} label="Nome da Fazenda" name="farmName" value={formData.farmName} onChange={handleInputChange} placeholder="Ex: Fazenda Santa Fé" />
                      </>
                    )}

                    {/* --- SUPPLIER FIELDS --- */}
                    {userType === 'supplier' && (
                      <>
                        <InputGroup icon={Store} label="Nome da Empresa" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Razão Social" required />
                        <InputGroup icon={FileText} label="CNPJ" name="companyCnpj" value={formData.companyCnpj} onChange={handleInputChange} placeholder="00.000.000/0001-00" required />
                        <InputGroup icon={User} label="Nome do Responsável" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nome completo" required />
                      </>
                    )}

                    {/* --- COMMON FIELDS --- */}
                    <InputGroup icon={Mail} label="E-mail de Acesso" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" required />

                    <div className="grid grid-cols-2 gap-3">
                        <InputGroup icon={Phone} label="Telefone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(00) 0000-0000" required />
                        <InputGroup icon={Phone} label="WhatsApp" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                    </div>
                    
                    <InputGroup icon={MapPin} label="Endereço Completo" name="address" value={formData.address} onChange={handleInputChange} placeholder="Rua, Número, Cidade - UF" required />

                    {/* Branch Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Filial</label>
                      <div className="flex gap-2">
                        <select 
                          name="branch" 
                          value={formData.branch} 
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none bg-white text-sm"
                        >
                          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <button type="button" className="bg-gray-100 p-3 rounded-xl text-gray-600 hover:bg-gray-200">
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Areas of Interest */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">Áreas de Interesse</label>
                      <div className="flex flex-wrap gap-2">
                        {FALLBACK_CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={cn(
                              "text-[10px] font-bold px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1",
                              formData.selectedCategories.includes(cat)
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                            )}
                          >
                            {formData.selectedCategories.includes(cat) && <Check size={10} />}
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Password */}
                    <InputGroup icon={Lock} label="Senha" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required />
                    <InputGroup icon={Lock} label="Confirmar Senha" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" required />
                  
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                  >
                    {isLoading ? 'Salvando...' : (
                      <>Salvar Cadastro <CheckCircle2 size={18} /></>
                    )}
                  </button>
                </form>
              )}

            </div>
          )}
        </div>
      </div>

      {/* --- SUCCESS MODAL --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center animate-in zoom-in-95 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="font-bold text-2xl text-gray-800 mb-2">Cadastro Realizado!</h2>
            <p className="text-gray-500 mb-8 leading-relaxed text-sm">
              Seu cadastro foi salvo com sucesso. <br/>
              Você pode fazer login agora.
            </p>
            <button 
              onClick={handleSuccessRedirect}
              className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Ir para Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper Component for Inputs
const InputGroup = ({ icon: Icon, label, name, type = "text", value, onChange, placeholder, required }: any) => (
  <div>
    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-3 text-gray-400" size={18} />
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
      />
    </div>
  </div>
);
