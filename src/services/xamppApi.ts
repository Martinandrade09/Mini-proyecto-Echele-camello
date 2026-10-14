import {
  Category,
  Worker,
  ServiceRequest,
  ChatMessage,
  ReportItem,
  RequestStatus,
  WorkerDocument
} from '../types';

// Determinación dinámica de la URL base para XAMPP
// Permite trabajar tanto con el proxy de Vite (/api) como directamente contra Apache (http://localhost/echele-camello-api)
const API_BASE_URL = 'http://localhost/echele-camello-api/index.php';

export interface HealthCheckResult {
  isConnected: boolean;
  server?: string;
  database?: string;
  counts?: {
    workers?: number;
    service_requests?: number;
    chat_messages?: number;
    reports?: number;
    categories?: number;
  };
  error?: string;
}

export interface InitialDataResponse {
  categories: Category[];
  workers: Worker[];
  requests: ServiceRequest[];
  chatMessages: ChatMessage[];
  reports: ReportItem[];
}

export const xamppApi = {
  /**
   * Verifica la conexión en tiempo real con Apache y MySQL de XAMPP
   */
  async checkHealth(): Promise<HealthCheckResult> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json = await response.json();
      if (json.success && json.database === 'echele_camello') {
        return {
          isConnected: true,
          server: json.server,
          database: json.database,
          counts: json.counts,
        };
      }
      return { isConnected: false, error: 'Respuesta inválida del servidor' };
    } catch (err: any) {
      return {
        isConnected: false,
        error: err.message || 'No se pudo conectar a XAMPP',
      };
    }
  },

  /**
   * Carga todos los datos iniciales desde la base de datos MySQL en XAMPP
   */
  async fetchAllData(): Promise<InitialDataResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=get_all`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json = await response.json();
      if (json.success && json.data) {
        return json.data as InitialDataResponse;
      }
      return null;
    } catch (err) {
      console.warn('[XAMPP API] Error al obtener datos de MySQL, usando fallback local:', err);
      return null;
    }
  },

  /**
   * Guarda una nueva solicitud de servicio en MySQL
   */
  async createRequest(req: ServiceRequest): Promise<{ request: ServiceRequest; initialMessage?: ChatMessage } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=create_request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      if (json.success) {
        return {
          request: json.request,
          initialMessage: json.initialMessage,
        };
      }
      return null;
    } catch (err) {
      console.error('[XAMPP API] Error al crear solicitud en MySQL:', err);
      return null;
    }
  },

  /**
   * Actualiza el estado de una solicitud (ACEPTADA, RECHAZADA, CANCELADA, COMPLETADA)
   */
  async updateRequestStatus(requestId: string, status: RequestStatus, reason?: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=update_request_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status, reason }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      return !!json.success;
    } catch (err) {
      console.error('[XAMPP API] Error al actualizar estado de solicitud en MySQL:', err);
      return false;
    }
  },

  /**
   * Envía y almacena un mensaje del chat en MySQL
   */
  async sendMessage(msg: ChatMessage): Promise<ChatMessage | null> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=send_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      if (json.success && json.chatMessage) {
        return json.chatMessage;
      }
      return null;
    } catch (err) {
      console.error('[XAMPP API] Error al enviar mensaje en MySQL:', err);
      return null;
    }
  },

  /**
   * Guarda una calificación y actualiza el promedio de estrellas del trabajador en MySQL
   */
  async submitReview(requestId: string, rating: number, comment: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=submit_review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, rating, comment }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      return json.success ? json : null;
    } catch (err) {
      console.error('[XAMPP API] Error al calificar servicio en MySQL:', err);
      return null;
    }
  },

  /**
   * Crea un reporte de seguridad o incidente en MySQL
   */
  async createReport(report: ReportItem): Promise<ReportItem | null> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=create_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      return json.success ? json.report : null;
    } catch (err) {
      console.error('[XAMPP API] Error al crear reporte en MySQL:', err);
      return null;
    }
  },

  /**
   * Actualiza el perfil de un camellador en MySQL
   */
  async updateWorker(workerId: string, fields: Partial<Worker>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=update_worker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: workerId, ...fields }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      return !!json.success;
    } catch (err) {
      console.error('[XAMPP API] Error al actualizar perfil de trabajador en MySQL:', err);
      return false;
    }
  },

  /**
   * Registra un nuevo documento de verificación de trabajador en MySQL
   */
  async uploadDocument(workerId: string, doc: WorkerDocument): Promise<WorkerDocument | null> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=upload_document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, ...doc }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      return json.success ? json.document : null;
    } catch (err) {
      console.error('[XAMPP API] Error al subir documento en MySQL:', err);
      return null;
    }
  },

  /**
   * Actualiza el estado de verificación de un documento por el administrador en MySQL
   */
  async updateDocumentStatus(workerId: string, documentId: string, status: 'VERIFICADO' | 'RECHAZADO', reason?: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=update_document_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, documentId, status, reason }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();
      return !!json.success;
    } catch (err) {
      console.error('[XAMPP API] Error al actualizar documento en MySQL:', err);
      return false;
    }
  }
};
