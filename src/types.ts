export type UserRole = 'cliente' | 'trabajador' | 'admin';

export type RequestStatus = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'COMPLETADA';

export type DocumentStatus = 'PENDIENTE_DE_VERIFICACION' | 'VERIFICADO' | 'RECHAZADO';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  count: number;
  description: string;
  baseRate: string;
}

export interface Review {
  id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  serviceName: string;
}

export interface WorkerDocument {
  id: string;
  type: 'cedula' | 'antecedentes' | 'certificacion_tecnica' | 'rut';
  title: string;
  fileName: string;
  uploadDate: string;
  status: DocumentStatus;
  rejectionReason?: string;
}

export interface Worker {
  id: string;
  name: string;
  trade: string;
  categoryId: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  completedJobsCount: number;
  distanceKm: number;
  neighborhood: string;
  hourlyRate: number; // in COP
  baseServiceRate: number; // in COP
  bio: string;
  experienceYears: number;
  phone: string;
  isVerified: boolean;
  documentStatus: DocumentStatus;
  isAvailableToday: boolean;
  specialties: string[];
  documents: WorkerDocument[];
  reviews: Review[];
  unavailableSlots: string[]; // e.g., ["2026-10-08T09:00", "2026-10-08T10:00"]
}

export interface ServiceRequest {
  id: string;
  workerId: string;
  workerName: string;
  workerTrade: string;
  workerAvatar: string;
  workerPhone: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  neighborhood: string;
  categoryName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 AM - 11:00 AM"
  status: RequestStatus;
  description: string;
  estimatedCost: number; // COP
  createdAt: string;
  rejectionReason?: string;
  cancellationReason?: string;
  review?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderRole: 'cliente' | 'trabajador';
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ReportItem {
  id: string;
  requestId?: string;
  reporterName: string;
  reporterRole: UserRole;
  reportedName: string;
  reason: string;
  description: string;
  createdAt: string;
  status: 'PENDIENTE' | 'RESUELTO' | 'DESESTIMADO';
  adminNotes?: string;
}
