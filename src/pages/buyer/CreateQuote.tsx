import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/MockStore';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  MapPin, 
  Search, 
  Truck, 
  Store, 
  Package, 
  Plus, 
  Upload, 
  FileText, 
  Send, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Circle,
  CheckCircle,
  Camera,
  Image as ImageIcon,
  Navigation,
  Map,
  ChevronDown
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Product } from '../../types';

// Mock categories for the modal
const CATEGORIES_LIST = [
  "Auto Peças",
  "Casa Agropecuária",
  "Ferragens",
  "Materiais de Construção",
  "Peças Agrícolas",
  "Sementes",
  "Veterinária"
];

// Mock search results for the modal
const MOCK_SEARCH_RESULTS = [
  { id: '101', name: 'Enxada', description: 'enxada com cabo de madeira', category: 'Ferragens', unit: 'un' },
  { id: '102', name: 'Ração para cavalo', description: 'saco 40kg alta performance', category: 'Nutrição Animal', unit: 'sc' },
  { id: '103', name: 'Vermífugo', description: 'para cavalo pasta oral', category: 'Veterinária', unit: 'un' },
  { id: '104', name: 'Arame Liso', description: 'Z-700 1000m', category: 'Casa Agropecuária', unit: 'rl' },
];

export const CreateQuote = () => {
  const { addQuote, addresses } = useStore();
  const navigate = useNavigate();

  // --- State Management ---
  const [selectedProducts, setSelectedProducts] = useState<{ product: Product; quantity: number }[]>([]);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup' | null>(null);
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(50); // Default 50km
  
  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  
  // Product Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardCategory, setWizardCategory] = useState('');
  const [wizardSearchTerm, setWizardSearchTerm] = useState('');
  const [wizardSelectedProduct, setWizardSelectedProduct] = useState<any | null>(null);
  const [wizardQuantity, setWizardQuantity] = useState('');

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('un');
  const [newProdImage, setNewProdImage] = useState<string | null>(null);

  // Attachment State
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // Set default address if available
  useEffect(() => {
    if (deliveryType === 'delivery' && !address && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setAddress(`${defaultAddr.street}, ${defaultAddr.district}, ${defaultAddr.city} - ${defaultAddr.state}`);
    }
  }, [deliveryType, addresses]);

  // --- Logic ---

  const resetWizard = () => {
    setCurrentStep(1);
    setWizardCategory('');
    setWizardSearchTerm('');
    setWizardSelectedProduct(null);
    setWizardQuantity('');
    // Reset new product form
    setNewProdName('');
    setNewProdDesc('');
    setNewProdUnit('un');
    setNewProdImage(null);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    resetWizard();
  };

  const handleAddProductFromWizard = () => {
    if (wizardSelectedProduct && wizardQuantity) {
      const newProduct: Product = {
        id: wizardSelectedProduct.id,
        name: wizardSelectedProduct.name,
        category: wizardCategory || wizardSelectedProduct.category,
        unit: wizardSelectedProduct.unit
      };
      
      setSelectedProducts([...selectedProducts, { product: newProduct, quantity: Number(wizardQuantity) }]);
      handleCloseProductModal();
    }
  };

  const handleCreateNewProduct = () => {
    if (!newProdName) return;

    const customProduct = {
      id: `custom-${Date.now()}`,
      name: newProdName,
      description: newProdDesc,
      category: wizardCategory || 'Outros',
      unit: newProdUnit,
      image: newProdImage
    };

    setWizardSelectedProduct(customProduct);
    setIsNewProductModalOpen(false);
    setCurrentStep(3); // Move to quantity step
  };

  const handleRemoveProduct = (index: number) => {
    const newList = [...selectedProducts];
    newList.splice(index, 1);
    setSelectedProducts(newList);
  };

  const handleFileSelect = () => {
    // Simulate file selection
    setTimeout(() => {
      setAttachmentName("lista_de_compras_2023.pdf");
      setIsAttachmentModalOpen(false);
    }, 800);
  };

  const handleImageSelect = (source: 'camera' | 'gallery') => {
    // Simulate image capture/selection
    setTimeout(() => {
      setNewProdImage("https://images.unsplash.com/photo-1530982011887-3cc11cc85693?auto=format&fit=crop&q=80&w=300&h=300");
    }, 500);
  };

  const handleSubmit = () => {
    if (selectedProducts.length === 0 || !deliveryType) return;
    if (deliveryType === 'delivery' && !address) return;

    // Simulate API call
    selectedProducts.forEach(item => {
      addQuote({
        product: item.product,
        quantity: item.quantity,
        deliveryType: deliveryType,
        radius: radius,
        address: address,
        status: 'open'
      });
    });

    setIsSuccessModalOpen(true);
  };

  const isReadyToSubmit = selectedProducts.length > 0 && deliveryType && (deliveryType === 'pickup' || address.length > 0);

  // --- Render Helpers ---

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
            currentStep >= step ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
          )}>
            {step}
          </div>
          {step < 3 && (
            <div className={cn(
              "w-12 h-0.5 transition-colors",
              currentStep > step ? "bg-emerald-500" : "bg-gray-100"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">Solicitar Pedido</h1>
          <span className="ml-auto text-sm font-medium opacity-90">Nova Cotação</span>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-3xl mx-auto mt-4">
        
        {/* Seção 1: Produtos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Package size={20} className="text-emerald-600" />
              Produtos
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">
                {selectedProducts.length}
              </span>
            </h2>
            <button 
              onClick={() => setIsProductModalOpen(true)}
              className="bg-emerald-600 text-white p-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="p-6">
            {selectedProducts.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center text-center bg-gray-50/30">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Package size={32} />
                </div>
                <h3 className="font-bold text-gray-700 mb-1">Nenhum produto adicionado</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">
                  Adicione os produtos que você precisa para começar seu pedido
                </p>
                <button 
                  onClick={() => setIsProductModalOpen(true)}
                  className="flex items-center gap-2 text-emerald-600 font-bold border border-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <Plus size={18} />
                  Adicionar Primeiro Produto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProducts.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-emerald-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs border border-emerald-100">
                        {item.product.unit}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{item.product.name}</h4>
                        <p className="text-xs text-gray-500">{item.product.category} • {item.quantity} {item.product.unit}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveProduct(index)}
                      className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setIsProductModalOpen(true)}
                  className="w-full py-3 border border-dashed border-emerald-300 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Adicionar outro produto
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seção 2: Tipo de Entrega */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 text-lg">Tipo de Entrega</h2>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setDeliveryType('delivery')}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                deliveryType === 'delivery' 
                  ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" 
                  : "border-gray-200 hover:border-emerald-200"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 absolute top-4 left-4 flex items-center justify-center",
                deliveryType === 'delivery' ? "border-emerald-600" : "border-gray-300"
              )}>
                {deliveryType === 'delivery' && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
              </div>
              <div className="flex flex-col items-center text-center mt-2">
                <Truck size={32} className="text-gray-600 mb-2" />
                <h3 className="font-bold text-gray-800">Entrega na Propriedade</h3>
              </div>
            </button>

            <button
              onClick={() => setDeliveryType('pickup')}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                deliveryType === 'pickup' 
                  ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" 
                  : "border-gray-200 hover:border-emerald-200"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 absolute top-4 left-4 flex items-center justify-center",
                deliveryType === 'pickup' ? "border-emerald-600" : "border-gray-300"
              )}>
                {deliveryType === 'pickup' && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
              </div>
              <div className="flex flex-col items-center text-center mt-2">
                <Store size={32} className="text-gray-600 mb-2" />
                <h3 className="font-bold text-gray-800">Retirada na Loja</h3>
              </div>
            </button>
          </div>

          {deliveryType === 'delivery' && (
            <div className="px-4 pb-6 animate-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Endereço</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <select
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none appearance-none bg-white text-gray-700"
                >
                  <option value="" disabled>Selecione um endereço cadastrado</option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={`${addr.street}, ${addr.district}, ${addr.city} - ${addr.state}`}>
                      {addr.label ? `${addr.label} - ` : ''}{addr.street}, {addr.city} {addr.isDefault ? '(Padrão)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
              </div>
              <button 
                onClick={() => navigate('/profile/addresses')}
                className="text-emerald-600 text-xs font-bold mt-2 pl-1 hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Cadastrar novo endereço
              </button>
            </div>
          )}
        </div>

        {/* Seção 3: Raio de Abrangência (NOVA) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Navigation size={20} className="text-emerald-600" />
              Raio de Abrangência
            </h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Map size={16} />
                <span>Distância máxima dos fornecedores</span>
              </div>
              <span className="text-emerald-700 font-bold text-lg bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                {radius} km
              </span>
            </div>

            <div className="relative pt-2 pb-4">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={radius} 
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                <span>0 km</span>
                <span>25 km</span>
                <span>50 km</span>
                <span>75 km</span>
                <span>100 km</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 flex gap-2">
              <div className="mt-0.5 text-emerald-600"><CheckCircle size={14} /></div>
              Fornecedores cadastrados dentro deste raio receberão sua solicitação de cotação.
            </div>
          </div>
        </div>

        {/* Seção 4: Anexos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText size={20} className="text-gray-600" />
              Anexos (Opcional)
            </h2>
          </div>
          
          <div className="p-6">
            {attachmentName ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-3">
                   <FileText className="text-emerald-600" size={20} />
                   <span className="text-sm font-medium text-emerald-900">{attachmentName}</span>
                </div>
                <button onClick={() => setAttachmentName(null)} className="text-gray-400 hover:text-red-500">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsAttachmentModalOpen(true)}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center text-center hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <Upload size={32} className="text-gray-300 group-hover:text-emerald-500 mb-3 transition-colors" />
                <h4 className="font-bold text-gray-700 text-sm mb-1">Anexar arquivo</h4>
                <button className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2 rounded-lg shadow-sm group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all mt-2">
                  Selecionar arquivo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seção 5: Resumo e Envio */}
        <div className={cn(
          "rounded-xl shadow-sm border overflow-hidden transition-all bg-white",
          isReadyToSubmit ? "border-emerald-200" : "border-gray-200"
        )}>
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Package size={18} className="text-emerald-600" />
              Resumo do Pedido
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 pb-3 border-b border-gray-200">
                <span>Total de Itens</span>
                <span className="font-bold text-gray-900">{selectedProducts.length}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  {deliveryType === 'delivery' ? <Truck size={16} /> : deliveryType === 'pickup' ? <Store size={16} /> : <Circle size={16} />}
                  <span>Entrega</span>
                </div>
                <span className="font-medium text-gray-800">
                  {deliveryType === 'delivery' ? 'Entrega na Propriedade' : deliveryType === 'pickup' ? 'Retirada na Loja' : '-'}
                </span>
              </div>

              <div className="flex justify-between text-gray-600 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Navigation size={16} />
                  <span>Raio de Busca</span>
                </div>
                <span className="font-medium text-gray-800">{radius} km</span>
              </div>
            </div>
          </div>

          <div className="p-4">
             <button 
              onClick={handleSubmit}
              disabled={!isReadyToSubmit}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-sm",
                isReadyToSubmit 
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <Send size={18} />
              Enviar Pedido
            </button>
            {!isReadyToSubmit && (
               <p className="text-center text-xs text-gray-400 mt-2">Preencha todos os campos obrigatórios para enviar.</p>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL: ADICIONAR PRODUTO (WIZARD) --- */}
      {isProductModalOpen && !isNewProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Adicionar Produto</h3>
              <button onClick={handleCloseProductModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {renderStepIndicator()}

              {/* STEP 1: CATEGORY */}
              {currentStep === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
                      <Package size={32} />
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg">Selecione a Categoria</h4>
                    <p className="text-sm text-gray-500">Escolha o tipo de produto que deseja adicionar</p>
                  </div>

                  <div className="space-y-3">
                    {CATEGORIES_LIST.map((cat) => (
                      <label 
                        key={cat}
                        className={cn(
                          "flex items-center p-4 rounded-xl border cursor-pointer transition-all",
                          wizardCategory === cat 
                            ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" 
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <input 
                          type="radio" 
                          name="category" 
                          className="w-5 h-5 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                          checked={wizardCategory === cat}
                          onChange={() => setWizardCategory(cat)}
                        />
                        <span className="ml-3 font-medium text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: SEARCH */}
              {currentStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
                      <Search size={32} />
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg">Buscar Produto</h4>
                    <p className="text-sm text-gray-500">Digite o nome do produto que você precisa</p>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        value={wizardSearchTerm}
                        onChange={(e) => setWizardSearchTerm(e.target.value)}
                        placeholder="Digite o nome do produto..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <button className="bg-gray-600 text-white px-4 rounded-lg font-medium text-sm hover:bg-gray-700">
                      Buscar
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h5 className="font-bold text-xs text-gray-500 uppercase">Produtos Disponíveis</h5>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[200px] overflow-y-auto">
                      {MOCK_SEARCH_RESULTS.map((prod) => (
                        <div key={prod.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                          <div>
                            <h6 className="font-bold text-gray-800">{prod.name}</h6>
                            <p className="text-xs text-gray-500">{prod.description}</p>
                          </div>
                          <button 
                            onClick={() => {
                              setWizardSelectedProduct(prod);
                              setCurrentStep(3);
                            }}
                            className="bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-black"
                          >
                            <Plus size={14} /> Adicionar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* New Product Button */}
                  <button 
                    onClick={() => setIsNewProductModalOpen(true)}
                    className="w-full py-3 border-2 border-dashed border-emerald-200 rounded-xl text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Não encontrou? Cadastrar Novo Produto
                  </button>
                </div>
              )}

              {/* STEP 3: QUANTITY */}
              {currentStep === 3 && wizardSelectedProduct && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
                      <Package size={32} />
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg">Definir Quantidade</h4>
                    <p className="text-sm text-gray-500">Quanto você precisa de {wizardSelectedProduct.name}?</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-700">{wizardSelectedProduct.name}</span>
                      <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">{wizardSelectedProduct.category}</span>
                    </div>
                    <p className="text-xs text-gray-500">{wizardSelectedProduct.description}</p>
                    {wizardSelectedProduct.image && (
                      <div className="mt-2">
                        <img src={wizardSelectedProduct.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade ({wizardSelectedProduct.unit})</label>
                    <input 
                      type="number" 
                      value={wizardQuantity}
                      onChange={(e) => setWizardQuantity(e.target.value)}
                      placeholder="0"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 outline-none text-lg font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button 
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : handleCloseProductModal()}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                {currentStep > 1 ? <ArrowLeft size={16} /> : null}
                {currentStep === 1 ? 'Cancelar' : 'Anterior'}
              </button>

              {currentStep === 1 && (
                <button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!wizardCategory}
                  className="px-6 py-2 rounded-lg bg-gray-500 text-white font-bold text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Próximo <ArrowRight size={16} />
                </button>
              )}

              {currentStep === 3 && (
                 <button 
                  onClick={handleAddProductFromWizard}
                  disabled={!wizardQuantity}
                  className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Confirmar <CheckCircle size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: NOVO PRODUTO --- */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-emerald-600 text-white">
              <h3 className="font-bold text-lg">Novo Produto</h3>
              <button onClick={() => setIsNewProductModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Produto</label>
                <input 
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ex: Peça para Trator XYZ"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                <textarea 
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Detalhes, marca, especificações..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Unidade de Medida</label>
                <select 
                  value={newProdUnit}
                  onChange={(e) => setNewProdUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="un">Unidade (un)</option>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="ton">Tonelada (ton)</option>
                  <option value="lt">Litro (lt)</option>
                  <option value="sc">Saca (sc)</option>
                  <option value="cx">Caixa (cx)</option>
                  <option value="m">Metro (m)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Anexar Imagem</label>
                
                {newProdImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 h-40 w-full">
                    <img src={newProdImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setNewProdImage(null)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleImageSelect('camera')}
                      className="flex flex-col items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-emerald-200 transition-all"
                    >
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <Camera size={20} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">Câmera</span>
                    </button>
                    <button 
                      onClick={() => handleImageSelect('gallery')}
                      className="flex flex-col items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-emerald-200 transition-all"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <ImageIcon size={20} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">Galeria</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
              <button 
                onClick={() => setIsNewProductModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateNewProduct}
                disabled={!newProdName}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ANEXO --- */}
      {isAttachmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-4">Selecionar Arquivo</h3>
            <div 
              onClick={handleFileSelect}
              className="border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-xl p-8 cursor-pointer hover:bg-emerald-100 transition-colors"
            >
              <Upload className="mx-auto text-emerald-500 mb-2" size={32} />
              <p className="text-sm text-emerald-700 font-medium">Clique para simular upload</p>
            </div>
            <button 
              onClick={() => setIsAttachmentModalOpen(false)}
              className="mt-4 text-gray-500 text-sm hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL: SUCESSO --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-emerald-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center animate-in zoom-in-95 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="font-bold text-2xl text-gray-800 mb-2">Pedido Enviado!</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Seu pedido foi enviado para os fornecedores da região. <br/>
              <span className="font-medium text-emerald-600">Agora é só aguardar as cotações.</span>
            </p>
            <button 
              onClick={() => navigate('/buyer')}
              className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Fechar e Voltar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
