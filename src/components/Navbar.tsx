import React from 'react';
import { UserRole } from '../types';
import { Smartphone, Monitor, ShieldCheck, Briefcase, User, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  pendingRequestsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
  isMobileFrame,
  onToggleMobileFrame,
  pendingRequestsCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('explorar')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F59E0B] flex items-center justify-center text-[#0F172A] font-extrabold text-xl shadow-xs group-hover:bg-[#D97706] transition-colors">
              🐪
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl text-[#0F172A] tracking-tight flex items-center gap-1.5">
                Échele Camello
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('explorar')}
            className={`transition-colors hover:text-[#0F172A] pb-1 border-b-2 ${
              activeTab === 'explorar'
                ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                : 'border-transparent text-slate-600'
            }`}
          >
            Explorar Oficios
          </button>

          <button
            onClick={() => onSelectTab('solicitudes')}
            className={`relative transition-colors hover:text-[#0F172A] pb-1 border-b-2 ${
              activeTab === 'solicitudes'
                ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                : 'border-transparent text-slate-600'
            }`}
          >
            {currentRole === 'trabajador' ? 'Mis Trabajos' : 'Mis Solicitudes'}
            {pendingRequestsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-[#F59E0B] text-[#0F172A] text-xs font-bold rounded-full">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {currentRole === 'trabajador' && (
            <button
              onClick={() => onSelectTab('panel-trabajador')}
              className={`transition-colors hover:text-[#0F172A] pb-1 border-b-2 ${
                activeTab === 'panel-trabajador'
                  ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Mi Perfil & Docs
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`transition-colors hover:text-[#0F172A] pb-1 border-b-2 ${
                activeTab === 'admin'
                  ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Panel Administrador
            </button>
          )}

          <button
            onClick={() => onSelectTab('seguridad')}
            className={`transition-colors hover:text-[#0F172A] pb-1 border-b-2 ${
              activeTab === 'seguridad'
                ? 'border-[#0F766E] text-[#0F766E] font-semibold'
                : 'border-transparent text-slate-600'
            }`}
          >
            Garantía & Verificación
          </button>
        </nav>

        {/* Zone 3: Actions - Role Switcher & Device Emulator Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role selector dropdown/segmented */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                onSelectRole('cliente');
                if (activeTab === 'panel-trabajador' || activeTab === 'admin') onSelectTab('explorar');
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                currentRole === 'cliente'
                  ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Cliente que busca contratar servicios"
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Cliente</span>
            </button>

            <button
              onClick={() => {
                onSelectRole('trabajador');
                onSelectTab('panel-trabajador');
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                currentRole === 'trabajador'
                  ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Trabajador / Camellador profesional"
            >
              <Briefcase className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">Trabajador</span>
            </button>

            <button
              onClick={() => {
                onSelectRole('admin');
                onSelectTab('admin');
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                currentRole === 'admin'
                  ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Panel Administrador para validar documentos y reportes"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {/* Toggle Device View (Desktop vs Mobile Frame) */}
          <button
            onClick={onToggleMobileFrame}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              isMobileFrame
                ? 'bg-[#0F766E] text-white border-[#0F766E]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title={isMobileFrame ? 'Cambiar a vista de escritorio amplia' : 'Cambiar a simulador móvil Android'}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-4 h-4" />
                <span className="hidden lg:inline">Vista Web</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span className="hidden lg:inline">Vista Móvil</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
