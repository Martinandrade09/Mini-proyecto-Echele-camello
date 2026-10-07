import React, { useState } from 'react';
import {
  UserRole,
  Worker,
  ServiceRequest,
  ChatMessage,
  ReportItem,
  WorkerDocument,
  RequestStatus,
} from './types';
import {
  CATEGORIES,
  INITIAL_WORKERS,
  INITIAL_REQUESTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_REPORTS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { CategoryBar } from './components/CategoryBar';
import { WorkerCard } from './components/WorkerCard';
import { WorkerDetailModal } from './components/WorkerDetailModal';
import { BookingModal } from './components/BookingModal';
import { ChatModal } from './components/ChatModal';
import { RatingModal } from './components/RatingModal';
import { ReportModal } from './components/ReportModal';
import { RequestsView } from './components/RequestsView';
import { WorkerDashboard } from './components/WorkerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SecurityView } from './components/SecurityView';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  Smartphone,
  Info,
  X
} from 'lucide-react';

export default function App() {
  // State
  const [currentRole, setCurrentRole] = useState<UserRole>('cliente');
  const [activeTab, setActiveTab] = useState<string>('explorar');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Data State
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);

  // Filters State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('TODOS');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');

  // Modals State
  const [selectedWorkerForDetail, setSelectedWorkerForDetail] = useState<Worker | null>(null);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<Worker | null>(null);
  const [activeChatRequest, setActiveChatRequest] = useState<ServiceRequest | null>(null);
  const [activeRatingRequest, setActiveRatingRequest] = useState<ServiceRequest | null>(null);
  const [activeReportRequest, setActiveReportRequest] = useState<ServiceRequest | null>(null);

  // Notification Banner
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage(null);
    }, 5000);
  };

  // Filtered Workers
  const filteredWorkers = workers.filter((w) => {
    // Category match
    if (selectedCategoryId && w.categoryId !== selectedCategoryId) {
      return false;
    }
    // Neighborhood match
    if (selectedNeighborhood !== 'TODOS' && !w.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase())) {
      return false;
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = w.name.toLowerCase().includes(q);
      const matchTrade = w.trade.toLowerCase().includes(q);
      const matchSpecialties = w.specialties.some((s) => s.toLowerCase().includes(q));
      const matchBio = w.bio.toLowerCase().includes(q);
      if (!matchName && !matchTrade && !matchSpecialties && !matchBio) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (sortBy === 'price') return a.hourlyRate - b.hourlyRate;
    return 0;
  });

  // Handlers for Request Lifecycle
  const handleCreateRequest = (newReqData: Omit<ServiceRequest, 'id' | 'createdAt'>) => {
    const newRequest: ServiceRequest = {
      ...newReqData,
      id: `req-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setRequests([newRequest, ...requests]);
    setSelectedWorkerForBooking(null);

    // Initial greeting chat message
    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: newRequest.id,
      senderRole: 'cliente',
      senderName: newRequest.clientName,
      text: `Hola ${newRequest.workerName}, he creado una solicitud para el día ${newRequest.date} (${newRequest.timeSlot}): "${newRequest.description}"`,
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setChatMessages((prev) => [...prev, initialMsg]);

    showBanner(`¡Solicitud enviada a ${newRequest.workerName}! Notificamos al trabajador para su confirmación.`);
    setActiveTab('solicitudes');
  };

  const handleUpdateStatus = (requestId: string, newStatus: RequestStatus, reason?: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: newStatus,
            rejectionReason: newStatus === 'RECHAZADA' ? reason : r.rejectionReason,
            cancellationReason: newStatus === 'CANCELADA' ? reason : r.cancellationReason,
          };
        }
        return r;
      })
    );

    if (newStatus === 'ACEPTADA') {
      showBanner('¡Solicitud aceptada! Ahora puedes coordinar los detalles en el chat.');
    } else if (newStatus === 'COMPLETADA') {
      showBanner('Servicio marcado como completado. ¡Gracias por confiar en Échele Camello!');
    } else if (newStatus === 'RECHAZADA') {
      showBanner('Solicitud rechazada con motivo.');
    } else if (newStatus === 'CANCELADA') {
      showBanner('Solicitud cancelada.');
    }
  };

  // Handlers for Chat
  const handleSendMessage = (requestId: string, text: string) => {
    const senderName = currentRole === 'trabajador' ? 'Jhon Jairo Ramírez' : 'Carlos Mendoza';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId,
      senderRole: currentRole === 'trabajador' ? 'trabajador' : 'cliente',
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Handlers for Rating & Reviews
  const handleSubmitRating = (requestId: string, ratingValue: number, comment: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const newReview = {
      rating: ratingValue,
      comment,
      submittedAt: new Date().toLocaleDateString('es-CO'),
    };

    // Update request
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, review: newReview } : r))
    );

    // Recalculate worker rating in real time
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === req.workerId) {
          const newReviewsList = [
            {
              id: `rev-${Date.now()}`,
              clientName: req.clientName,
              rating: ratingValue,
              comment,
              date: new Date().toISOString().split('T')[0],
              serviceName: req.categoryName,
            },
            ...w.reviews,
          ];
          const sumRatings = newReviewsList.reduce((acc, curr) => acc + curr.rating, 0);
          const newAvg = sumRatings / newReviewsList.length;

          return {
            ...w,
            reviewsCount: newReviewsList.length,
            rating: Number(newAvg.toFixed(2)),
            reviews: newReviewsList,
          };
        }
        return w;
      })
    );

    setActiveRatingRequest(null);
    showBanner(`¡Gracias! Has calificado a ${req.workerName} con ${ratingValue} estrellas.`);
  };

  // Handlers for Report Submission
  const handleSubmitReport = (reportData: Omit<ReportItem, 'id' | 'createdAt' | 'status'>) => {
    const newReport: ReportItem = {
      ...reportData,
      id: `rep-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleString('es-CO'),
      status: 'PENDIENTE',
    };
    setReports([newReport, ...reports]);
    setActiveReportRequest(null);
    showBanner('Reporte enviado al equipo de administración para su investigación.');
  };

  // Handlers for Worker Self Management
  const handleUpdateCurrentWorker = (updatedFields: Partial<Worker>) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === 'w-1' ? { ...w, ...updatedFields } : w))
    );
    showBanner('Perfil de trabajador actualizado.');
  };

  const handleUploadWorkerDocument = (docData: Omit<WorkerDocument, 'id' | 'uploadDate' | 'status'>) => {
    const newDoc: WorkerDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'PENDIENTE_DE_VERIFICACION',
    };

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === 'w-1') {
          return {
            ...w,
            documents: [newDoc, ...w.documents],
            documentStatus: 'PENDIENTE_DE_VERIFICACION',
          };
        }
        return w;
      })
    );
  };

  // Handlers for Admin
  const handleApproveDocument = (workerId: string, documentId: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const updatedDocs = w.documents.map((d) =>
            d.id === documentId ? { ...d, status: 'VERIFICADO' as const, rejectionReason: undefined } : d
          );
          // If all docs are verified, mark worker as verified
          const allVerified = updatedDocs.every((d) => d.status === 'VERIFICADO');
          return {
            ...w,
            documents: updatedDocs,
            isVerified: allVerified ? true : w.isVerified,
            documentStatus: allVerified ? 'VERIFICADO' : 'PENDIENTE_DE_VERIFICACION',
          };
        }
        return w;
      })
    );
    showBanner('Documento aprobado. El camellador cuenta ahora con verificación oficial.');
  };

  const handleRejectDocument = (workerId: string, documentId: string, reason: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const updatedDocs = w.documents.map((d) =>
            d.id === documentId ? { ...d, status: 'RECHAZADO' as const, rejectionReason: reason } : d
          );
          return {
            ...w,
            documents: updatedDocs,
            isVerified: false,
            documentStatus: 'RECHAZADO' as const,
          };
        }
        return w;
      })
    );
    showBanner(`Documento rechazado con motivo: "${reason}".`);
  };

  const handleResolveReport = (reportId: string, action: 'RESUELTO' | 'DESESTIMADO') => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: action } : r))
    );
    showBanner(`Reporte marcado como ${action}.`);
  };

  // Counts
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDIENTE').length;
  const unreadMessagesCount = chatMessages.length > 0 ? 1 : 0;
  const currentWorker = workers.find((w) => w.id === 'w-1') || workers[0];

  // Screen content selector
  const renderScreenContent = () => {
    if (activeTab === 'solicitudes') {
      return (
        <RequestsView
          requests={requests}
          currentRole={currentRole}
          onOpenChat={(req) => setActiveChatRequest(req)}
          onOpenRating={(req) => setActiveRatingRequest(req)}
          onOpenReport={(req) => setActiveReportRequest(req)}
          onUpdateStatus={handleUpdateStatus}
        />
      );
    }

    if (activeTab === 'chat') {
      const targetReq = activeChatRequest || requests[0];
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-xl text-[#0F172A]">
              Centro de Mensajes
            </h2>
            <span className="text-xs text-slate-500">Chats activos</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100">
            {requests.map((req) => (
              <div
                key={req.id}
                onClick={() => setActiveChatRequest(req)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={req.workerAvatar}
                    alt={req.workerName}
                    className="w-11 h-11 rounded-full object-cover border"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#0F172A]">
                      {currentRole === 'trabajador' ? req.clientName : req.workerName}
                    </h4>
                    <p className="text-[11px] text-slate-500">{req.categoryName} · {req.timeSlot}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveChatRequest(req)}
                  className="px-3 py-1.5 bg-[#0F766E] text-white text-xs font-semibold rounded-lg"
                >
                  Abrir Chat
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'panel-trabajador') {
      return (
        <WorkerDashboard
          worker={currentWorker}
          onUpdateWorker={handleUpdateCurrentWorker}
          onUploadDocument={handleUploadWorkerDocument}
        />
      );
    }

    if (activeTab === 'admin') {
      return (
        <AdminDashboard
          workers={workers}
          reports={reports}
          onApproveDocument={handleApproveDocument}
          onRejectDocument={handleRejectDocument}
          onResolveReport={handleResolveReport}
        />
      );
    }

    if (activeTab === 'seguridad') {
      return <SecurityView />;
    }

    // Default: 'explorar' (Home / Catalog)
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 min-h-[300px] flex items-center">
          <img
            src="/src/assets/images/camello_hero_banner_1791407957231.jpg"
            alt="Échele Camello - Profesionales verificados en Colombia"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-transparent" />

          <div className="relative z-10 max-w-2xl p-6 sm:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold border border-[#F59E0B]/30 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Servicios verificados en Bogotá y Colombia</span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              El camello bien hecho, directo a tu casa.
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Encuentra plomeros, electricistas, pintores y especialistas en aseo certificados. Tarifas justas, cero cobros ocultos y garantía protegida.
            </p>

            {/* Quick Search Box in Hero */}
            <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/20 flex flex-col sm:flex-row items-center gap-2 max-w-xl">
              <div className="flex-1 flex items-center gap-2 px-3 w-full">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué necesitas arreglar? (ej. fuga de agua, pintar cuarto...)"
                  className="w-full h-10 text-xs text-[#0F172A] outline-hidden placeholder:text-slate-400 bg-transparent"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="h-10 px-3 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 outline-hidden font-medium"
                >
                  <option value="TODOS">Toda Bogotá</option>
                  <option value="Chapinero">Chapinero</option>
                  <option value="Teusaquillo">Teusaquillo</option>
                  <option value="Usaquén">Usaquén</option>
                  <option value="Chicó">Chicó</option>
                  <option value="Cedritos">Cedritos</option>
                </select>

                <button
                  onClick={() => {}}
                  className="w-full sm:w-auto px-5 h-10 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center justify-center"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-heading font-extrabold text-lg text-[#0F172A]">
              Categorías de Oficios
            </h2>
            <span className="text-xs text-slate-500">6 especialidades disponibles</span>
          </div>
          <CategoryBar
            categories={CATEGORIES}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>

        {/* Filter / Sort Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-base text-[#0F172A]">
              Camelladores Disponibles
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredWorkers.length} resultados
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Ordenar por:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-[#0F172A] font-medium outline-hidden"
            >
              <option value="rating">Mejor Calificación ⭐</option>
              <option value="distance">Más Cercanos 📍</option>
              <option value="price">Tarifa Más Accesible 💵</option>
            </select>
          </div>
        </div>

        {/* Workers Grid */}
        {filteredWorkers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-[#0F172A]">
              No encontramos trabajadores con esos filtros
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Prueba cambiando la zona o seleccionando otra categoría de oficio.
            </p>
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSearchQuery('');
                setSelectedNeighborhood('TODOS');
              }}
              className="px-4 py-2 text-xs font-bold bg-[#0F766E] text-white rounded-lg hover:bg-[#115E59]"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onViewDetails={(w) => setSelectedWorkerForDetail(w)}
                onBook={(w) => setSelectedWorkerForBooking(w)}
              />
            ))}
          </div>
        )}

        {/* Value Proposition Highlights */}
        <div className="bg-slate-100/70 rounded-2xl p-6 sm:p-8 border border-slate-200">
          <div className="max-w-3xl mx-auto text-center space-y-2 mb-6">
            <h3 className="font-heading font-extrabold text-xl text-[#0F172A]">
              ¿Por qué confiar en Échele Camello?
            </h3>
            <p className="text-xs text-slate-600">
              Transformamos el trabajo informal en oportunidades dignas, seguras y de calidad comprobada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
                ✓
              </div>
              <h4 className="font-bold text-[#0F172A]">Antecedentes Revisados</h4>
              <p className="text-slate-600">
                Auditoría obligatoria de pasado judicial y validación de identidad con cédula colombiana.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center font-bold">
                ⭐
              </div>
              <h4 className="font-bold text-[#0F172A]">Tarifas Transparentes</h4>
              <p className="text-slate-600">
                Rangos de precio base establecidos para evitar cobros abusivos o sobrecostos inesperados.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                🛡️
              </div>
              <h4 className="font-bold text-[#0F172A]">Garantía de 90 Días</h4>
              <p className="text-slate-600">
                Acompañamiento y soporte ante cualquier inconveniente técnico en los servicios completados.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Global Notification Banner */}
      {bannerMessage && (
        <div className="sticky top-0 z-50 bg-[#0F766E] text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <CheckCircle2 className="w-4 h-4 text-teal-200 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="w-6 h-6 flex items-center justify-center hover:bg-teal-700 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Main Layout Body: Device Emulator vs Responsive Web Canvas */}
      {isMobileFrame ? (
        /* Mobile Device Frame Emulator */
        <div className="flex-1 py-6 px-4 flex items-center justify-center bg-slate-200/60">
          <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col h-[820px] relative">
            {/* Phone Speaker Notch & Status Bar */}
            <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-[11px] shrink-0 font-medium">
              <span>9:41</span>
              <div className="w-20 h-4 bg-black rounded-full" />
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Mobile App Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B] flex items-center justify-center text-xs font-extrabold text-[#0F172A]">
                  🐪
                </div>
                <span className="font-heading font-extrabold text-sm text-[#0F172A]">Échele Camello</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {currentRole}
              </span>
            </div>

            {/* Scrollable Screen Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC]">
              {renderScreenContent()}
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              pendingRequestsCount={pendingRequestsCount}
              unreadMessagesCount={unreadMessagesCount}
              currentRole={currentRole}
            />
          </div>
        </div>
      ) : (
        /* Full Desktop / Responsive Canvas */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
          {renderScreenContent()}
        </main>
      )}

      {/* Mobile Bottom Bar when not in simulated frame (on actual mobile screens) */}
      {!isMobileFrame && (
        <div className="md:hidden">
          <BottomNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            pendingRequestsCount={pendingRequestsCount}
            unreadMessagesCount={unreadMessagesCount}
            currentRole={currentRole}
          />
        </div>
      )}

      {/* Modals & Dialogs */}
      <WorkerDetailModal
        worker={selectedWorkerForDetail}
        onClose={() => setSelectedWorkerForDetail(null)}
        onBook={(w) => {
          setSelectedWorkerForDetail(null);
          setSelectedWorkerForBooking(w);
        }}
      />

      <BookingModal
        worker={selectedWorkerForBooking}
        onClose={() => setSelectedWorkerForBooking(null)}
        onSubmit={handleCreateRequest}
      />

      <ChatModal
        request={activeChatRequest}
        messages={chatMessages}
        currentRole={currentRole}
        onClose={() => setActiveChatRequest(null)}
        onSendMessage={handleSendMessage}
      />

      <RatingModal
        request={activeRatingRequest}
        onClose={() => setActiveRatingRequest(null)}
        onSubmitRating={handleSubmitRating}
      />

      <ReportModal
        request={activeReportRequest}
        currentRole={currentRole}
        onClose={() => setActiveReportRequest(null)}
        onSubmitReport={handleSubmitReport}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-[#0F172A] text-sm">
              Échele Camello
            </span>
            <span>· Conectando talento local con hogares y empresas en Colombia</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>Términos y Condiciones</span>
            <span>·</span>
            <span>Privacidad de Datos</span>
            <span>·</span>
            <span>Atención al Usuario Bogotá: +57 (601) 745-9000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
