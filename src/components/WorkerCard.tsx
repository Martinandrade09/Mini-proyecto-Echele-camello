import React from 'react';
import { Worker } from '../types';
import { Star, MapPin, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

interface WorkerCardProps {
  worker: Worker;
  onBook: (worker: Worker) => void;
  onViewDetails: (worker: Worker) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onBook,
  onViewDetails,
}) => {
  const formattedRate = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(worker.hourlyRate);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Top Header: Avatar + Info */}
        <div className="flex items-start gap-3.5">
          {/* Avatar with verified badge */}
          <div className="relative shrink-0 cursor-pointer" onClick={() => onViewDetails(worker)}>
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-xs"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback avatar container
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {worker.isVerified && (
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center shadow-xs border-2 border-white"
                title="Documentos y antecedentes verificados por Échele Camello"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Name & Trade & Distance */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                onClick={() => onViewDetails(worker)}
                className="font-heading font-bold text-base text-[#0F172A] truncate hover:text-[#0F766E] cursor-pointer transition-colors"
              >
                {worker.name}
              </h3>

              {/* Star rating pill */}
              <div className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold border border-[#FDE68A]">
                <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                <span className="tabular-nums">{worker.rating.toFixed(1)}</span>
                <span className="text-[10px] text-amber-700 font-normal">({worker.reviewsCount})</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-[#0F766E] mt-0.5 truncate">
              {worker.trade}
            </p>

            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{worker.neighborhood}</span>
              </span>
              <span>·</span>
              <span className="shrink-0 font-medium text-slate-700">A {worker.distanceKm} km</span>
            </div>
          </div>
        </div>

        {/* Short Bio snippet */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {worker.bio}
        </p>

        {/* Speciality tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {worker.specialties.slice(0, 2).map((spec, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] truncate max-w-[200px]"
            >
              {spec}
            </span>
          ))}
          {worker.specialties.length > 2 && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[11px]">
              +{worker.specialties.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Price & Action Buttons */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="block text-[11px] text-slate-500 uppercase tracking-wider font-medium">Tarifa base</span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-extrabold text-sm text-[#0F172A] tabular-nums">
              {formattedRate}
            </span>
            <span className="text-[11px] text-slate-500">/ hora</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(worker)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[44px]"
          >
            Perfil
          </button>

          <button
            onClick={() => onBook(worker)}
            className="px-4 py-2 text-xs font-bold text-[#0F172A] bg-[#F59E0B] hover:bg-[#D97706] rounded-lg shadow-xs transition-colors min-h-[44px] flex items-center gap-1.5 focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden"
          >
            <span>Camellar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
