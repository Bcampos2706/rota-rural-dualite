import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, User, ShoppingBag, FileText, Bell, MapPin, ChevronDown, ClipboardList } from 'lucide-react';
import { useStore } from '../context/MockStore'; // Updated import
import { cn } from '../lib/utils';

export const Layout = () => {
  const { role, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Atualizado para considerar 'producer' como comprador também
  const isBuyer = role === 'buyer' || role === 'producer';
  const isDashboard = location.pathname === '/buyer';

  const navItems = isBuyer ? [
    { icon: Home, label: 'Início', path: '/buyer' },
    { icon: FileText, label: 'Cotações', path: '/buyer/quotes' },
    { icon: PlusCircle, label: 'Cotar', path: '/buyer/create' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
  ] : [
    { icon: Home, label: 'Início', path: '/supplier' },
    { icon: ClipboardList, label: 'Pedidos', path: '/supplier/orders' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Mobile Container Simulator */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Header - Hide on Profile Page to match design */}
        {location.pathname !== '/profile' && (
          <header className={cn(
            "bg-emerald-600 text-white sticky top-0 z-30 shadow-md transition-all duration-300",
            isDashboard ? "pb-10 rounded-b-[2.5rem]" : "p-4"
          )}>
            <div className={cn("flex justify-between items-start", isDashboard ? "p-4 pb-0" : "")}>
              {/* Logo Section */}
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                    <ShoppingBag size={18} className="text-white" />
                </div>
                <h1 className="font-bold text-lg tracking-tight">AgroMarket</h1>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-emerald-600"></span>
                </button>
              </div>
            </div>

            {/* User Info Section - Only on Dashboard */}
            {isDashboard && isBuyer && user && (
              <div className="px-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <h2 className="font-bold text-xl leading-tight mb-1">{user.full_name}</h2>
                <div className="flex items-center gap-1.5 text-emerald-100 text-sm cursor-pointer hover:text-white transition-colors">
                   <MapPin size={14} />
                   <span className="truncate max-w-[250px] font-medium">{user.address || 'Sem endereço cadastrado'}</span>
                   <ChevronDown size={14} className="opacity-70" />
                </div>
              </div>
            )}
          </header>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-y-auto pb-20 bg-gray-50 scroll-smooth",
          location.pathname === '/profile' ? "pt-0" : ""
        )}>
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full max-w-md flex justify-around items-center py-2 text-[10px] font-medium text-gray-500 z-20 pb-safe">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 min-w-[60px] transition-colors rounded-xl",
                  isActive ? "text-emerald-600 bg-emerald-50" : "hover:text-emerald-600 hover:bg-gray-50"
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button 
            onClick={() => navigate('/profile')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 min-w-[60px] transition-colors rounded-xl",
              location.pathname === '/profile' ? "text-emerald-600 bg-emerald-50" : "hover:text-emerald-600 hover:bg-gray-50"
            )}
          >
            <User size={22} strokeWidth={location.pathname === '/profile' ? 2.5 : 2} />
            <span>Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
