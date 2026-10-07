import React from 'react';
import { Search, CalendarCheck, MessageSquare, User, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingRequestsCount: number;
  unreadMessagesCount: number;
  currentRole: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingRequestsCount,
  unreadMessagesCount,
  currentRole,
}) => {
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around">
      <button
        onClick={() => onSelectTab('explorar')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          activeTab === 'explorar' ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Search className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] font-medium leading-none">Explorar</span>
        {activeTab === 'explorar' && <span className="w-1 h-1 bg-[#0F766E] rounded-full mt-1" />}
      </button>

      <button
        onClick={() => onSelectTab('solicitudes')}
        className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          activeTab === 'solicitudes' ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <CalendarCheck className="w-5 h-5 mb-0.5" />
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#F59E0B] text-[#0F172A] text-[10px] font-extrabold flex items-center justify-center">
              {pendingRequestsCount}
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium leading-none">
          {currentRole === 'trabajador' ? 'Trabajos' : 'Solicitudes'}
        </span>
        {activeTab === 'solicitudes' && <span className="w-1 h-1 bg-[#0F766E] rounded-full mt-1" />}
      </button>

      <button
        onClick={() => onSelectTab('chat')}
        className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          activeTab === 'chat' ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 mb-0.5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#0F766E] text-white text-[10px] font-extrabold flex items-center justify-center">
              {unreadMessagesCount}
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium leading-none">Mensajes</span>
        {activeTab === 'chat' && <span className="w-1 h-1 bg-[#0F766E] rounded-full mt-1" />}
      </button>

      {currentRole === 'trabajador' && (
        <button
          onClick={() => onSelectTab('panel-trabajador')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'panel-trabajador' ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Mi Perfil</span>
          {activeTab === 'panel-trabajador' && <span className="w-1 h-1 bg-[#0F766E] rounded-full mt-1" />}
        </button>
      )}

      {currentRole === 'admin' && (
        <button
          onClick={() => onSelectTab('admin')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'admin' ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Admin</span>
          {activeTab === 'admin' && <span className="w-1 h-1 bg-[#0F766E] rounded-full mt-1" />}
        </button>
      )}

      {currentRole === 'cliente' && (
        <button
          onClick={() => onSelectTab('seguridad')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'seguridad' ? 'text-[#0F766E]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-none">Garantía</span>
          {activeTab === 'seguridad' && <span className="w-1 h-1 bg-[#0F766E] rounded-full mt-1" />}
        </button>
      )}
    </nav>
  );
};
