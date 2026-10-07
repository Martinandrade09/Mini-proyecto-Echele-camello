import React, { useState } from 'react';
import { ServiceRequest, ReportItem, UserRole } from '../types';
import { X, AlertTriangle, ShieldAlert, Send } from 'lucide-react';

interface ReportModalProps {
  request: ServiceRequest | null;
  currentRole: UserRole;
  onClose: () => void;
  onSubmitReport: (report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>) => void;
}

const REPORT_REASONS = [
  'Incumplimiento de horario acordado sin aviso',
  'Cobro excesivo diferente al pactado en la app',
  'Trabajo defectuoso o daño ocasionado',
  'Comportamiento inadecuado o irrespetuoso',
  'Solicitud de pago externo por fuera de la plataforma',
  'Otro motivo de seguridad',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  request,
  currentRole,
  onClose,
  onSubmitReport,
}) => {
  if (!request) return null;

  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportedName = currentRole === 'trabajador' ? request.clientName : request.workerName;
  const reporterName = currentRole === 'trabajador' ? request.workerName : request.clientName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    onSubmitReport({
      requestId: request.id,
      reporterName,
      reporterRole: currentRole,
      reportedName,
      reason,
      description: description.trim(),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#0F172A]">
                Reportar Incidente
              </h3>
              <p className="text-xs text-slate-500">
                A {reportedName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 text-xs text-red-800 leading-relaxed">
            El equipo de auditoría y moderación de <strong>Échele Camello</strong> revisará este reporte, los chats y las bitácoras para tomar medidas correctivas o sanciones de perfil.
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Motivo del reporte
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-red-500 text-xs text-[#0F172A] outline-hidden bg-white"
            >
              {REPORT_REASONS.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Descripción de lo ocurrido *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla de forma precisa la situación presentada..."
              className="w-full p-3 rounded-lg border border-slate-300 focus:border-red-500 text-xs text-[#0F172A] outline-hidden bg-white"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs min-h-[44px] flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Denuncia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
