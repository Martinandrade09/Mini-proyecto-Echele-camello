import React, { useState } from 'react';
import { Database, CheckCircle, AlertTriangle, RefreshCw, ExternalLink, Server, HardDrive, X } from 'lucide-react';
import { HealthCheckResult } from '../services/xamppApi';

interface XamppStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthCheckResult;
  onRefresh: () => Promise<void>;
  isSyncing: boolean;
}

export const XamppStatusModal: React.FC<XamppStatusModalProps> = ({
  isOpen,
  onClose,
  health,
  onRefresh,
  isSyncing,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyDbName = () => {
    navigator.clipboard.writeText('echele_camello');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className={`p-5 flex items-center justify-between text-white ${health.isConnected ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-gradient-to-r from-rose-600 to-amber-700'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Estado de Conexión XAMPP</h3>
              <p className="text-xs text-white/90">
                {health.isConnected ? 'Conectado a MySQL local en tiempo real' : 'Sin conexión con Apache o MySQL'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Main Status Badge */}
          <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${health.isConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
            {health.isConnected ? (
              <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm">
                {health.isConnected ? '¡Conexión establecida con éxito!' : 'No se detecta el servidor XAMPP'}
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                {health.isConnected
                  ? 'Todas las operaciones (solicitudes, chats, calificaciones y trabajadores) se guardan directamente en tu base de datos MySQL local.'
                  : health.error || 'Asegúrate de que Apache y MySQL estén iniciados en el Panel de Control de XAMPP.'}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 font-medium mb-1">
                <Server className="w-4 h-4 text-teal-600" /> Servidor Web
              </div>
              <div className="font-bold text-slate-800 text-sm">Apache 2.4 (XAMPP)</div>
              <div className="text-slate-500 mt-0.5">Puerto 80 / localhost</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 font-medium mb-1">
                <HardDrive className="w-4 h-4 text-amber-600" /> Motor Base de Datos
              </div>
              <div className="font-bold text-slate-800 text-sm">MariaDB / MySQL</div>
              <div className="text-slate-500 mt-0.5">Puerto 3306 (user: root)</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl col-span-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Database className="w-4 h-4 text-indigo-600" /> Base de Datos Activa
                </div>
                <button
                  onClick={copyDbName}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-[11px]"
                >
                  {copied ? '¡Copiado!' : 'Copiar nombre'}
                </button>
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                <span>echele_camello</span>
                <span className="text-xs font-sans px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold">
                  utf8mb4_unicode_ci
                </span>
              </div>
            </div>
          </div>

          {/* Records count in DB */}
          {health.isConnected && health.counts && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs font-bold text-slate-700 mb-2">
                Registros sincronizados en MySQL:
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="font-extrabold text-slate-900 text-base">
                    {health.counts.workers ?? 5}
                  </div>
                  <div className="text-slate-500 text-[10px]">Camelladores</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="font-extrabold text-slate-900 text-base">
                    {health.counts.service_requests ?? 3}
                  </div>
                  <div className="text-slate-500 text-[10px]">Solicitudes</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="font-extrabold text-slate-900 text-base">
                    {health.counts.chat_messages ?? 4}
                  </div>
                  <div className="text-slate-500 text-[10px]">Mensajes</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="font-extrabold text-slate-900 text-base">
                    {health.counts.categories ?? 6}
                  </div>
                  <div className="text-slate-500 text-[10px]">Categorías</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <a
              href="http://localhost/phpmyadmin/index.php?route=/database/structure&db=echele_camello"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <span>Abrir en phpMyAdmin</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => onRefresh()}
              disabled={isSyncing}
              className="w-full sm:w-auto py-2.5 px-4 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Verificando...' : 'Comprobar Conexión'}</span>
            </button>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-slate-400">
              Ubicación API PHP: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">C:\xampp\htdocs\echele-camello-api\</code>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
