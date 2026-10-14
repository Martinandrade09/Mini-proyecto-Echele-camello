import React, { useState } from 'react';
import { ServiceRequest, UserRole, RequestStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { matchesSemanticSearch, getSemanticRelatedCategories } from '../utils/searchKeywords';
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Phone,
  FileText,
  Filter,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Lightbulb,
  Tag
} from 'lucide-react';

interface RequestsViewProps {
  requests: ServiceRequest[];
  currentRole: UserRole;
  onOpenChat: (request: ServiceRequest) => void;
  onOpenRating: (request: ServiceRequest) => void;
  onOpenReport: (request: ServiceRequest) => void;
  onUpdateStatus: (requestId: string, newStatus: RequestStatus, reason?: string) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  currentRole,
  onOpenChat,
  onOpenRating,
  onOpenReport,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODAS');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('TODOS');
  const [sortBy, setSortBy] = useState<'recientes' | 'antiguos' | 'precio_mayor' | 'precio_menor'>('recientes');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Unique categories from requests
  const availableCategories = Array.from(new Set(requests.map((r) => r.categoryName).filter(Boolean)));
  const availableNeighborhoods = Array.from(new Set(requests.map((r) => r.neighborhood).filter(Boolean)));

  const hasActiveFilters = searchQuery.trim() !== '' || categoryFilter !== 'TODAS' || neighborhoodFilter !== 'TODOS' || filter !== 'TODAS' || sortBy !== 'recientes';

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('TODAS');
    setNeighborhoodFilter('TODOS');
    setFilter('TODAS');
    setSortBy('recientes');
  };

  const semanticHints = searchQuery.trim() ? getSemanticRelatedCategories(searchQuery) : [];

  const filteredRequests = requests.filter((req) => {
    // 1. Status Filter
    if (filter === 'ACTIVAS') {
      if (req.status !== 'PENDIENTE' && req.status !== 'ACEPTADA') return false;
    } else if (filter !== 'TODAS') {
      if (req.status !== filter) return false;
    }

    // 2. Category Filter
    if (categoryFilter !== 'TODAS' && req.categoryName !== categoryFilter) {
      return false;
    }

    // 3. Neighborhood Filter
    if (neighborhoodFilter !== 'TODOS' && !req.neighborhood.toLowerCase().includes(neighborhoodFilter.toLowerCase())) {
      return false;
    }

    // 4. Semantic text search (keyword-to-category dictionary)
    if (searchQuery.trim()) {
      const matched = matchesSemanticSearch(
        searchQuery,
        [
          req.workerName,
          req.clientName,
          req.workerTrade,
          req.categoryName,
          req.description,
          req.clientAddress,
          req.neighborhood,
          req.id,
        ],
        undefined,       // ServiceRequest has no categoryId; match by categoryName only
        req.categoryName
      );
      if (!matched) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'precio_mayor') return b.estimatedCost - a.estimatedCost;
    if (sortBy === 'precio_menor') return a.estimatedCost - b.estimatedCost;
    if (sortBy === 'antiguos') return a.id.localeCompare(b.id);
    // recientes default
    return b.id.localeCompare(a.id);
  });

  const handleConfirmReject = (requestId: string) => {
    if (!rejectionReason.trim()) return;
    onUpdateStatus(requestId, 'RECHAZADA', rejectionReason.trim());
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-5">
      {/* Header & Main Status Segmented buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-xl text-[#0F172A]">
            {currentRole === 'trabajador' ? 'Gestión de Trabajos' : 'Mis Solicitudes de Camello'}
          </h2>
          <p className="text-xs text-slate-500">
            {currentRole === 'trabajador'
              ? 'Administra las solicitudes entrantes, filtra por clientes, oficios y coordina en campo'
              : 'Haz seguimiento y búsqueda en tiempo real de todos tus servicios técnicos'}
          </p>
        </div>

        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
          {[
            { id: 'TODAS', label: 'Todas' },
            { id: 'ACTIVAS', label: 'Activas' },
            { id: 'PENDIENTE', label: 'Pendientes' },
            { id: 'ACEPTADA', label: 'Aceptadas' },
            { id: 'COMPLETADA', label: 'Completadas' },
            { id: 'RECHAZADA', label: 'Rechazadas' },
            { id: 'CANCELADA', label: 'Canceladas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[34px] ${
                filter === tab.id
                  ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Search & Filtering Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input Box */}
          <div className="md:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, camellador, descripción, dirección o código..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl text-slate-900 placeholder:text-slate-400 outline-hidden transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Category */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-[#0F766E]"
            >
              <option value="TODAS">Categoría: Todas</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Neighborhood */}
          <div className="md:col-span-2">
            <select
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-[#0F766E]"
            >
              <option value="TODOS">Barrio: Todos</option>
              {availableNeighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-[#0F766E]"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="precio_mayor">Mayor costo</option>
              <option value="precio_menor">Menor costo</option>
            </select>
          </div>
        </div>

        {/* Filter Summary, Semantic Hints & Quick Reset */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <div className="text-slate-500 font-medium">
              Mostrando <strong className="text-slate-900 font-bold">{filteredRequests.length}</strong> de {requests.length} trabajos
              {searchQuery && (
                <span className="ml-1 text-teal-700">
                  para "<span className="italic">{searchQuery}</span>"
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[#0F766E] hover:text-[#115E59] font-bold flex items-center gap-1 transition-colors text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer filtros</span>
              </button>
            )}
          </div>

          {/* Semantic Hint Chips */}
          {semanticHints.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold shrink-0">
                <Lightbulb className="w-3 h-3" />
                <span>Búsqueda semántica activa:</span>
              </div>
              {semanticHints.map((hint) => (
                <span
                  key={hint.categoryId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {hint.categoryName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-bold text-base text-[#0F172A]">
            No hay solicitudes en esta sección
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {currentRole === 'trabajador'
              ? 'Cuando un cliente reserve tus servicios, aparecerá aquí para que la aceptes.'
              : 'Explora nuestros profesionales verificados y agenda tu primer servicio.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isRejectingThis = rejectingId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.workerAvatar}
                      alt={req.workerName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-base text-[#0F172A]">
                          {currentRole === 'trabajador' ? req.clientName : req.workerName}
                        </h3>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-[#0F766E]">
                          {req.categoryName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Creada el {req.createdAt}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-700">Ref: #{req.id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">
                      Fecha y Horario
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>{req.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.timeSlot}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">
                      Ubicación del trabajo
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span className="truncate">{req.clientAddress}</span>
                    </div>
                    <span className="text-slate-500 block truncate">
                      Barrio {req.neighborhood}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">
                      Costo estimado
                    </span>
                    <span className="font-heading font-extrabold text-base text-[#0F172A] tabular-nums block">
                      ${req.estimatedCost.toLocaleString('es-CO')} COP
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pago acordado contra entrega
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                  <strong className="text-slate-900 block mb-0.5">Requerimiento del cliente:</strong>
                  <p className="leading-relaxed">{req.description}</p>
                </div>

                {/* Rejection / Cancellation Notes if applicable */}
                {req.rejectionReason && (
                  <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
                    <strong>Motivo de rechazo:</strong> {req.rejectionReason}
                  </div>
                )}
                {req.cancellationReason && (
                  <div className="p-3 bg-slate-100 text-slate-700 text-xs rounded-xl border border-slate-200">
                    <strong>Motivo de cancelación:</strong> {req.cancellationReason}
                  </div>
                )}

                {/* Worker Rejection form toggle */}
                {isRejectingThis && (
                  <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-red-900 block">
                      Indica el motivo del rechazo para informar al cliente:
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ej. Cruce de horario imprevisto, fuera de zona de cobertura..."
                      className="w-full h-10 px-3 text-xs bg-white border border-red-300 rounded-lg outline-hidden"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 bg-white rounded-md border"
                      >
                        Volver
                      </button>
                      <button
                        onClick={() => handleConfirmReject(req.id)}
                        disabled={!rejectionReason.trim()}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                      >
                        Confirmar Rechazo
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews if already completed and rated */}
                {req.review && (
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                        <span>Valoración otorgada:</span>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: req.review.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                        <span>({req.review.rating}.0)</span>
                      </div>
                      <p className="text-emerald-800 mt-1 italic">"{req.review.comment}"</p>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                  {/* Left: Chat & Report buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChat(req)}
                      className="px-3 py-2 text-xs font-semibold text-[#0F766E] bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1.5 min-h-[40px]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat con {currentRole === 'trabajador' ? 'Cliente' : 'Trabajador'}</span>
                    </button>

                    <button
                      onClick={() => onOpenReport(req)}
                      className="px-2.5 py-2 text-xs text-slate-500 hover:text-red-600 rounded-lg transition-colors flex items-center gap-1 min-h-[40px]"
                      title="Reportar problema"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reportar</span>
                    </button>
                  </div>

                  {/* Right: State Transition Actions */}
                  <div className="flex items-center gap-2">
                    {/* If PENDIENTE */}
                    {req.status === 'PENDIENTE' && (
                      <>
                        {currentRole === 'trabajador' ? (
                          <>
                            <button
                              onClick={() => setRejectingId(req.id)}
                              className="px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg min-h-[40px]"
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => onUpdateStatus(req.id, 'ACEPTADA')}
                              className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs min-h-[40px] flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Aceptar Camello</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onUpdateStatus(req.id, 'CANCELADA', 'Cancelado por el cliente')}
                            className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[40px]"
                          >
                            Cancelar Solicitud
                          </button>
                        )}
                      </>
                    )}

                    {/* If ACEPTADA */}
                    {req.status === 'ACEPTADA' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(req.id, 'COMPLETADA')}
                          className="px-4 py-2 text-xs font-bold text-[#0F172A] bg-[#F59E0B] hover:bg-[#D97706] rounded-lg shadow-xs min-h-[40px] flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Marcar como Completado</span>
                        </button>
                      </>
                    )}

                    {/* If COMPLETADA and not reviewed yet (for client) */}
                    {req.status === 'COMPLETADA' && !req.review && currentRole === 'cliente' && (
                      <button
                        onClick={() => onOpenRating(req)}
                        className="px-4 py-2 text-xs font-bold text-[#0F172A] bg-[#F59E0B] hover:bg-[#D97706] rounded-lg shadow-xs min-h-[40px] flex items-center gap-1.5"
                      >
                        <Star className="w-4 h-4 fill-[#0F172A]" />
                        <span>Calificar Servicio</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
