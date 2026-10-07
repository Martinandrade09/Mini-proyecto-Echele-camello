import React from 'react';
import { Worker } from '../types';
import {
  X,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Award,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface WorkerDetailModalProps {
  worker: Worker | null;
  onClose: () => void;
  onBook: (worker: Worker) => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  onClose,
  onBook,
}) => {
  if (!worker) return null;

  const formattedHourly = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(worker.hourlyRate);

  const formattedBase = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(worker.baseServiceRate);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 my-auto">
        {/* Header Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Perfil Profesional
            </span>
            <StatusBadge status={worker.documentStatus} size="sm" />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Main Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="relative">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm"
                referrerPolicy="no-referrer"
              />
              {worker.isVerified && (
                <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center border-2 border-white shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="flex-1">
              <h2 className="font-heading font-extrabold text-xl text-[#0F172A]">
                {worker.name}
              </h2>
              <p className="text-sm font-semibold text-[#0F766E] mt-0.5">
                {worker.trade}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {worker.neighborhood} (a {worker.distanceKm} km)
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  {worker.experienceYears} años de experiencia
                </span>
              </div>

              {/* Stats badges */}
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEF3C7] text-[#92400E] font-bold text-xs">
                  <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{worker.rating.toFixed(1)}</span>
                  <span className="text-amber-800 font-normal">({worker.reviewsCount} reseñas)</span>
                </div>

                <div className="px-3 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs border border-teal-100">
                  {worker.completedJobsCount} camellos completados
                </div>
              </div>
            </div>
          </div>

          {/* Biografía */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#0F172A] mb-1.5">
              Sobre el profesional
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {worker.bio}
            </p>
          </div>

          {/* Especialidades */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#0F172A] mb-2">
              Especialidades y Habilidades
            </h4>
            <div className="flex flex-wrap gap-2">
              {worker.specialties.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-teal-50/70 border border-teal-200 text-teal-900 text-xs font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Documentos verificados */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#0F172A] mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                Verificación de Identidad y Seguridad
              </span>
              <span className="text-xs text-slate-500 font-normal">Supervisado por Échele Camello</span>
            </h4>
            <div className="space-y-2">
              {worker.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-[#0F766E]" />
                    <div>
                      <p className="font-semibold text-slate-800">{doc.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {doc.fileName} · Cargado {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Tarifas de referencia */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-900 mb-2">
              Tarifas de Referencia Estimadas
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-600 block text-[11px]">Visita técnica / Diagnóstico:</span>
                <span className="font-bold text-[#0F172A] text-sm tabular-nums">{formattedBase}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[11px]">Tarifa hora de trabajo:</span>
                <span className="font-bold text-[#0F172A] text-sm tabular-nums">{formattedHourly}</span>
              </div>
            </div>
            <p className="text-[11px] text-amber-800 mt-2">
              * El valor final se acuerda con el cliente según los materiales o complejidad del servicio.
            </p>
          </div>

          {/* Reseñas recientes */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#0F172A] mb-2.5">
              Opiniones de clientes ({worker.reviews.length})
            </h4>
            <div className="space-y-2.5">
              {worker.reviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">{rev.clientName}</span>
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Servicio: {rev.serviceName} · {rev.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-500 block">Tarifa por hora</span>
            <span className="font-heading font-extrabold text-base text-[#0F172A] tabular-nums">
              {formattedHourly}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px]"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose();
                onBook(worker);
              }}
              className="px-5 py-2.5 text-xs font-bold text-[#0F172A] bg-[#F59E0B] hover:bg-[#D97706] rounded-lg shadow-sm min-h-[48px] flex items-center gap-2 focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar con este Camellador</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
