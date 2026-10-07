import React, { useState } from 'react';
import { Worker, WorkerDocument, DocumentStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Award,
  Wallet,
  CalendarCheck
} from 'lucide-react';

interface WorkerDashboardProps {
  worker: Worker;
  onUpdateWorker: (updated: Partial<Worker>) => void;
  onUploadDocument: (doc: Omit<WorkerDocument, 'id' | 'uploadDate' | 'status'>) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  worker,
  onUpdateWorker,
  onUploadDocument,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [docType, setDocType] = useState<WorkerDocument['type']>('antecedentes');
  const [docTitle, setDocTitle] = useState('Certificado de Antecedentes de Policía');
  const [fakeFileName, setFakeFileName] = useState('');
  const [successUploadMessage, setSuccessUploadMessage] = useState<string | null>(null);

  const totalEarnings = worker.completedJobsCount * 65000;

  const handleToggleAvailability = () => {
    onUpdateWorker({ isAvailableToday: !worker.isAvailableToday });
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakeFileName.trim()) return;

    onUploadDocument({
      type: docType,
      title: docTitle,
      fileName: fakeFileName.trim().endsWith('.pdf') ? fakeFileName.trim() : `${fakeFileName.trim()}.pdf`,
    });

    setSuccessUploadMessage(
      `Documento "${docTitle}" subido con éxito. Quedó en estado "PENDIENTE_DE_VERIFICACION" para auditoría del Administrador.`
    );
    setIsUploading(false);
    setFakeFileName('');

    setTimeout(() => {
      setSuccessUploadMessage(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <img
            src={worker.avatar}
            alt={worker.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-heading font-extrabold text-xl text-[#0F172A]">
                {worker.name}
              </h2>
              <StatusBadge status={worker.documentStatus} />
            </div>
            <p className="text-sm font-semibold text-[#0F766E] mt-0.5">
              {worker.trade} · {worker.neighborhood}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              {worker.bio}
            </p>
          </div>
        </div>

        {/* Availability Switch */}
        <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Disponibilidad Inmediata
          </span>
          <button
            onClick={handleToggleAvailability}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              worker.isAvailableToday
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-200 text-slate-600 border border-slate-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                worker.isAvailableToday ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{worker.isAvailableToday ? 'Disponible para Camellar' : 'En Pausa / No Disponible'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
            Camellos Realizados
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-heading font-extrabold text-2xl text-[#0F172A] tabular-nums">
              {worker.completedJobsCount}
            </span>
            <CalendarCheck className="w-5 h-5 text-[#0F766E]" />
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            +12 este mes
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
            Reputación Promedio
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-heading font-extrabold text-2xl text-[#0F172A] tabular-nums">
              {worker.rating.toFixed(2)} ⭐
            </span>
            <Award className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {worker.reviewsCount} opiniones verificadas
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
            Ingresos Estimados
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-heading font-extrabold text-lg text-[#0F172A] tabular-nums">
              ${(totalEarnings).toLocaleString('es-CO')}
            </span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            COP acumulados en la app
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
            Tiempo de Respuesta
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-heading font-extrabold text-2xl text-[#0F172A] tabular-nums">
              14 min
            </span>
            <Clock className="w-5 h-5 text-teal-600" />
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            Excelente tasa de conversión
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {successUploadMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>{successUploadMessage}</div>
        </div>
      )}

      {/* Verification & Documents Module */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-base text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
              Documentación para Certificación y Confianza
            </h3>
            <p className="text-xs text-slate-500">
              Para recibir la insignia de verificación oficial, sube tu cédula y certificados vigentes.
            </p>
          </div>

          <button
            onClick={() => setIsUploading(!isUploading)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start min-h-[40px]"
          >
            <Upload className="w-4 h-4" />
            <span>Cargar Nuevo Documento</span>
          </button>
        </div>

        {/* Upload Form (Expandable) */}
        {isUploading && (
          <form
            onSubmit={handleDocumentSubmit}
            className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/80 space-y-3"
          >
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-teal-900">
              Formulario de carga de archivo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tipo de documento
                </label>
                <select
                  value={docType}
                  onChange={(e) => {
                    const val = e.target.value as WorkerDocument['type'];
                    setDocType(val);
                    if (val === 'cedula') setDocTitle('Cédula de Ciudadanía');
                    if (val === 'antecedentes') setDocTitle('Certificado de Antecedentes de Policía');
                    if (val === 'certificacion_tecnica') setDocTitle('Certificado Técnico o Matrícula CONTE');
                    if (val === 'rut') setDocTitle('RUT DIAN Actualizado');
                  }}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="cedula">Cédula de Ciudadanía (Ambas caras)</option>
                  <option value="antecedentes">Certificado de Antecedentes de Policía</option>
                  <option value="certificacion_tecnica">Certificación Técnica / SENA / CONTE</option>
                  <option value="rut">RUT DIAN</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre descriptivo del archivo
                </label>
                <input
                  type="text"
                  value={fakeFileName}
                  onChange={(e) => setFakeFileName(e.target.value)}
                  placeholder="Ej: Cedula_JhonRamirez_2026.pdf"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-teal-200 text-xs text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F766E]" />
                Formato admitido: PDF, JPG, PNG (Máx 15MB)
              </span>
              <span className="text-[11px] text-teal-800 font-semibold">Listo para auditar</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-white border rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg"
              >
                Subir para Verificación
              </button>
            </div>
          </form>
        )}

        {/* Existing Documents List */}
        <div className="space-y-2.5">
          {worker.documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-100/70 text-[#0F766E] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900">{doc.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Archivo: <span className="font-mono text-slate-700">{doc.fileName}</span> · Subido el {doc.uploadDate}
                  </p>
                  {doc.rejectionReason && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      Motivo de rechazo: {doc.rejectionReason} (Puedes volver a cargar una versión corregida)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <StatusBadge status={doc.status} size="sm" />
                {doc.status === 'RECHAZADO' && (
                  <button
                    onClick={() => {
                      setDocType(doc.type);
                      setDocTitle(doc.title);
                      setIsUploading(true);
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                  >
                    Reintentar carga
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
