import React, { useState } from 'react';
import { Worker, ReportItem, DocumentStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck2,
  AlertTriangle,
  TrendingUp,
  Users,
  Check,
  X,
  Eye,
  Sliders,
  DollarSign
} from 'lucide-react';

interface AdminDashboardProps {
  workers: Worker[];
  reports: ReportItem[];
  onApproveDocument: (workerId: string, documentId: string) => void;
  onRejectDocument: (workerId: string, documentId: string, reason: string) => void;
  onResolveReport: (reportId: string, action: 'RESUELTO' | 'DESESTIMADO') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  workers,
  reports,
  onApproveDocument,
  onRejectDocument,
  onResolveReport,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'documentos' | 'reportes' | 'metricas'>('documentos');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Collect all documents across all workers
  const pendingDocs = workers.flatMap((w) =>
    w.documents
      .filter((d) => d.status === 'PENDIENTE_DE_VERIFICACION')
      .map((d) => ({ ...d, workerId: w.id, workerName: w.name, workerTrade: w.trade, workerAvatar: w.avatar }))
  );

  const pendingReports = reports.filter((r) => r.status === 'PENDIENTE');

  const handleConfirmRejectDoc = (workerId: string, docId: string) => {
    if (!rejectionReasonText.trim()) return;
    onRejectDocument(workerId, docId, rejectionReasonText.trim());
    setRejectingDocId(null);
    setRejectionReasonText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Title */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              Control Institucional
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-300">Bogotá D.C. & Región</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white mt-1">
            Panel de Supervisión y Confianza
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Valida antecedentes de camelladores, modera reportes ciudadanos y audita los indicadores de servicio de Échele Camello.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 shrink-0">
          <button
            onClick={() => setActiveAdminTab('documentos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'documentos'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Documentos ({pendingDocs.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('reportes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'reportes'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reportes ({pendingReports.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('metricas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'metricas'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>KPIs</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Document Verification */}
      {activeAdminTab === 'documentos' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-base text-[#0F172A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
                Validación de Documentos de Identidad y Antecedentes
              </h3>
              <p className="text-xs text-slate-500">
                Audita cada soporte antes de activar la insignia oficial "Verificado" en el perfil público.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {pendingDocs.length} solicitudes pendientes
            </span>
          </div>

          {pendingDocs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">¡Al día! No hay documentos pendientes por validar.</p>
              <p className="text-slate-500 mt-0.5">Todos los aspirantes han sido auditados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDocs.map((doc) => {
                const isRejecting = rejectingDocId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.workerAvatar}
                          alt={doc.workerName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-sm text-[#0F172A]">
                              {doc.workerName}
                            </h4>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-[#0F766E] font-medium">{doc.workerTrade}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold mt-0.5">
                            {doc.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Archivo adjunto: <span className="font-mono text-slate-700">{doc.fileName}</span> · Subido el {doc.uploadDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          onClick={() => onApproveDocument(doc.workerId, doc.id)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors min-h-[38px]"
                        >
                          <Check className="w-4 h-4" />
                          <span>Aprobar Verificación</span>
                        </button>

                        <button
                          onClick={() => setRejectingDocId(doc.id)}
                          className="px-3.5 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors flex items-center gap-1 min-h-[38px]"
                        >
                          <X className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>

                    {/* Rejection input box */}
                    {isRejecting && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2 mt-2">
                        <label className="text-xs font-bold text-red-900 block">
                          Ingresa la razón del rechazo (para notificar al trabajador):
                        </label>
                        <input
                          type="text"
                          value={rejectionReasonText}
                          onChange={(e) => setRejectionReasonText(e.target.value)}
                          placeholder="Ej: Documento borroso, vencido o no legible..."
                          className="w-full h-9 px-3 text-xs bg-white border border-red-300 rounded-lg outline-hidden"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setRejectingDocId(null)}
                            className="px-3 py-1 text-xs text-slate-600 bg-white border rounded"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleConfirmRejectDoc(doc.workerId, doc.id)}
                            disabled={!rejectionReasonText.trim()}
                            className="px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
                          >
                            Confirmar Rechazo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Reports Moderation */}
      {activeAdminTab === 'reportes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-base text-[#0F172A] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Moderación de Reportes e Incidentes
              </h3>
              <p className="text-xs text-slate-500">
                Resuelve quejas ciudadanas de cumplimiento, tarifas o conducta.
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No se han registrado reportes de incidentes.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                        {rep.reason}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-[#0F172A] mt-0.5">
                        Denunciante: {rep.reporterName} ({rep.reporterRole}) → Reportado: {rep.reportedName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Fecha: {rep.createdAt} · Estado: <strong className="text-slate-700">{rep.status}</strong>
                      </p>
                    </div>

                    {rep.status === 'PENDIENTE' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onResolveReport(rep.id, 'RESUELTO')}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                        >
                          Resolver & Sancionar
                        </button>
                        <button
                          onClick={() => onResolveReport(rep.id, 'DESESTIMADO')}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                          Desestimar
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    "{rep.description}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Operational KPIs */}
      {activeAdminTab === 'metricas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Tasa de Conversión
            </span>
            <span className="font-heading font-extrabold text-3xl text-[#0F172A] mt-2 block tabular-nums">
              74.2%
            </span>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              +5.8% superior al promedio de la industria
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              Búsquedas de oficios que culminan en agendamiento confirmado.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Tiempo Promedio de Respuesta
            </span>
            <span className="font-heading font-extrabold text-3xl text-[#0F172A] mt-2 block tabular-nums">
              18.4 min
            </span>
            <p className="text-xs text-teal-600 font-semibold mt-1">
              Meta operativa alcanzada (&lt; 30 min)
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              Tiempo que tarda el trabajador en aceptar o coordinar la solicitud.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Índice de Confianza & Seguridad
            </span>
            <span className="font-heading font-extrabold text-3xl text-emerald-700 mt-2 block tabular-nums">
              4.88 / 5.0
            </span>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              98.4% servicios sin incidentes
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              Calificación ponderada en más de 850 camellos ejecutados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
