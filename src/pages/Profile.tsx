import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/MockStore';
import { 
  User, 
  MapPin, 
  Bell, 
  Shield, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Mail, 
  Phone, 
  ChevronRight,
  Building2,
  Users,
  UserPlus,
  Camera,
  Store
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Profile = () => {
  const navigate = useNavigate();
  const { role, setRole } = useStore();

  // Determina se é fornecedor ou produtor para exibir os dados corretos
  const isSupplier = role === 'supplier';

  // Dados mockados para exibição dinâmica
  const profileData = isSupplier ? {
    company: "AgroTop Insumos Ltda",
    username: "João Silva",
    branch: "Matriz - Sorriso/MT",
    roleLabel: "Fornecedor",
    email: "vendas@agrotop.com.br",
    phone: "66 3544-0000",
    initials: "AT"
  } : {
    name: "BRUNO FERREIRA CAMPOS",
    roleLabel: "Produtor Rural",
    email: "brunocamposinfra@gmail.com",
    phone: "66 99721-7811",
    initials: "BF"
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Menu específico para Fornecedor
  const supplierMenuItems = [
    { icon: UserPlus, label: 'Cadastrar usuário', path: '#' },
    { icon: User, label: 'Meu Perfil', path: '/profile/details' },
    { icon: Store, label: 'Filiais', path: '#' },
    { icon: Users, label: 'Grupos de Usuários', path: '#' },
    { icon: Bell, label: 'Notificações', path: '/profile/notifications' },
    { icon: Shield, label: 'Privacidade e Segurança', path: '/profile/security' },
    { icon: HelpCircle, label: 'Ajuda e suporte', path: '/profile/support' },
  ];

  // Menu específico para Comprador (Produtor)
  const buyerMenuItems = [
    { icon: User, label: 'Meu Perfil', path: '/profile/details' },
    { icon: MapPin, label: 'Meus endereços', path: '/profile/addresses' },
    { icon: Bell, label: 'Notificações', path: '/profile/notifications' },
    { icon: Shield, label: 'Privacidade e segurança', path: '/profile/security' },
    { icon: HelpCircle, label: 'Ajuda e suporte', path: '/profile/support' },
    { icon: Settings, label: 'Configurações', path: '/profile/settings' },
  ];

  const menuItems = isSupplier ? supplierMenuItems : buyerMenuItems;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Section */}
      <div className="bg-[#009e45] pt-8 pb-12 px-6 rounded-b-[2rem] shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar com Botão de Edição */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#005c29] border-4 border-[#33b16a] flex items-center justify-center shrink-0 overflow-hidden">
              <span className="text-white text-2xl font-medium">{profileData.initials}</span>
            </div>
            <button className="absolute bottom-0 right-0 bg-white text-[#009e45] p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors">
              <Camera size={14} />
            </button>
          </div>
          
          {/* User Info */}
          <div className="text-white">
            {isSupplier ? (
              <>
                <h1 className="font-bold text-lg leading-tight mb-0.5">{profileData.company}</h1>
                <p className="text-sm font-medium text-emerald-100 mb-1">{profileData.username}</p>
                <div className="flex items-center gap-1 text-[10px] bg-[#005c29]/50 px-2 py-0.5 rounded w-fit">
                  <Store size={10} />
                  <span>{profileData.branch}</span>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-bold text-lg leading-tight mb-1 uppercase">{profileData.name}</h1>
                <span className="inline-block bg-[#33b16a] text-white text-[10px] font-bold px-3 py-0.5 rounded-full mb-1">
                  {profileData.roleLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-2 text-white/90 text-sm pl-2 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <Mail size={16} className="opacity-70" />
            <span>{profileData.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="opacity-70" />
            <span>{profileData.phone}</span>
          </div>
        </div>
      </div>

      {/* Menu Options Card */}
      <div className="mx-4 -mt-6 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0 group"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "text-gray-500 transition-colors",
                  isSupplier ? "group-hover:text-blue-600" : "group-hover:text-[#009e45]"
                )}>
                  <item.icon size={20} strokeWidth={1.5} />
                </div>
                <span className="text-gray-700 font-medium text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full mt-6 bg-white border border-red-200 text-red-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sair da conta
        </button>

        {/* Version */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Versão 1.0.0
        </p>
      </div>
    </div>
  );
};
