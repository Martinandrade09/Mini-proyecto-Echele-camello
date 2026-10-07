import React from 'react';
import { RequestStatus, DocumentStatus } from '../types';

interface StatusBadgeProps {
  status: RequestStatus | DocumentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  switch (status) {
    case 'PENDIENTE':
    case 'PENDIENTE_DE_VERIFICACION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          {status === 'PENDIENTE_DE_VERIFICACION' ? 'Pendiente Verificación' : 'Pendiente'}
        </span>
      );

    case 'ACEPTADA':
    case 'VERIFICADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#CCFBF1] text-[#115E59] border border-[#99F6E4] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
          {status === 'VERIFICADO' ? 'Verificado' : 'Aceptada'}
        </span>
      );

    case 'COMPLETADA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          Completada
        </span>
      );

    case 'RECHAZADA':
    case 'RECHAZADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          {status === 'RECHAZADO' ? 'Rechazado' : 'Rechazada'}
        </span>
      );

    case 'CANCELADA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
          Cancelada
        </span>
      );

    default:
      return null;
  }
};
