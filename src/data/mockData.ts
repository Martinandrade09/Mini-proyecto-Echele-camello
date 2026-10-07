import { Category, Worker, ServiceRequest, ChatMessage, ReportItem } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'plomeria',
    name: 'Plomería',
    iconName: 'Wrench',
    count: 28,
    description: 'Fugas, grifería, destapes de cañerías, calentadores y tuberías de agua potable.',
    baseRate: '$45.000 COP / visita'
  },
  {
    id: 'electricidad',
    name: 'Electricidad',
    iconName: 'Zap',
    count: 24,
    description: 'Instalaciones residenciales, tableros de tacos, tomas, lámparas y cortocircuitos.',
    baseRate: '$50.000 COP / visita'
  },
  {
    id: 'pintura',
    name: 'Pintura',
    iconName: 'Paintbrush',
    count: 19,
    description: 'Pintura interior, estuco, fachadas, impermeabilización y acabados finos.',
    baseRate: '$40.000 COP / m²'
  },
  {
    id: 'aseo',
    name: 'Aseo y Desinfección',
    iconName: 'Sparkles',
    count: 32,
    description: 'Aseo profundo de casas, oficinas, lavado de tapetes y desinfección sanitaria.',
    baseRate: '$65.000 COP / jornada'
  },
  {
    id: 'cerrajeria',
    name: 'Cerrajería',
    iconName: 'Key',
    count: 15,
    description: 'Aperturas de emergencia 24/7, cambio de guardas, cerrojos de seguridad y candados.',
    baseRate: '$55.000 COP / servicio'
  },
  {
    id: 'carpinteria',
    name: 'Carpintería',
    iconName: 'Hammer',
    count: 12,
    description: 'Arreglo de puertas, closet, muebles modulares, bisagras y lacados.',
    baseRate: '$50.000 COP / hora'
  }
];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w-1',
    name: 'Jhon Jairo Ramírez',
    trade: 'Maestro Plomero Certificado',
    categoryId: 'plomeria',
    avatar: '/src/assets/images/worker_plumber_avatar_1791407969130.jpg',
    rating: 4.9,
    reviewsCount: 84,
    completedJobsCount: 142,
    distanceKm: 1.8,
    neighborhood: 'Chapinero Alto, Bogotá',
    hourlyRate: 45000,
    baseServiceRate: 50000,
    bio: 'Más de 14 años solucionando fugas difíciles, tuberías PVC/cobre e instalación de calentadores a gas. Puntualidad paisa y garantía de 3 meses por escrito en cada camello.',
    experienceYears: 14,
    phone: '+57 312 458 9012',
    isVerified: true,
    documentStatus: 'VERIFICADO',
    isAvailableToday: true,
    specialties: ['Detección de fugas no destructiva', 'Instalación de grifería y sanitarios', 'Mantenimiento de calentadores Bosch y Haceb'],
    unavailableSlots: ['2026-10-08T09:00', '2026-10-08T11:00'],
    documents: [
      {
        id: 'doc-1-1',
        type: 'cedula',
        title: 'Cédula de Ciudadanía',
        fileName: 'CC_79844201_JhonRamirez.pdf',
        uploadDate: '2026-08-15',
        status: 'VERIFICADO'
      },
      {
        id: 'doc-1-2',
        type: 'antecedentes',
        title: 'Certificado de Antecedentes de Policía',
        fileName: 'Policia_Cert_2026_Vigente.pdf',
        uploadDate: '2026-08-15',
        status: 'VERIFICADO'
      },
      {
        id: 'doc-1-3',
        type: 'certificacion_tecnica',
        title: 'Certificado Técnico SENA - Redes Hidrosanitarias',
        fileName: 'SENA_Tecnico_Plomeria_2015.pdf',
        uploadDate: '2026-08-16',
        status: 'VERIFICADO'
      }
    ],
    reviews: [
      {
        id: 'rev-1',
        clientName: 'Diana Carolina Suárez',
        rating: 5,
        comment: 'Excelente maestro. Llegó en punto, trajo sus propios repuestos y solucionó una fuga que dos plomeros anteriores no pudieron.',
        date: '2026-09-28',
        serviceName: 'Cambio de válvula y sifón de lavaplatos'
      },
      {
        id: 'rev-2',
        clientName: 'Mateo Osorio',
        rating: 5,
        comment: 'Muy honesto con el precio, dejó todo limpio después de terminar el trabajo.',
        date: '2026-09-15',
        serviceName: 'Destape de bajante de aguas lluvias'
      }
    ]
  },
  {
    id: 'w-2',
    name: 'Martha Lucía Gómez',
    trade: 'Técnica Electricista Residencial (CONTE)',
    categoryId: 'electricidad',
    avatar: '/src/assets/images/worker_electrician_avatar_1791407980160.jpg',
    rating: 4.95,
    reviewsCount: 96,
    completedJobsCount: 168,
    distanceKm: 2.4,
    neighborhood: 'Teusaquillo, Bogotá',
    hourlyRate: 50000,
    baseServiceRate: 60000,
    bio: 'Electricista certificada con matrícula CONTE vigente. Especialista en sobrecargas, cambio de acometidas, breakers que se disparan y automatización de iluminación.',
    experienceYears: 10,
    phone: '+57 315 889 2311',
    isVerified: true,
    documentStatus: 'VERIFICADO',
    isAvailableToday: true,
    specialties: ['Revisión de tableros de tacos', 'Cableado estructurado libre de halógeno', 'Instalación de luminarias LED y timbres inteligentes'],
    unavailableSlots: ['2026-10-09T14:00'],
    documents: [
      {
        id: 'doc-2-1',
        type: 'cedula',
        title: 'Cédula de Ciudadanía',
        fileName: 'CC_52391044_MarthaGomez.pdf',
        uploadDate: '2026-07-10',
        status: 'VERIFICADO'
      },
      {
        id: 'doc-2-2',
        type: 'certificacion_tecnica',
        title: 'Tarjeta Profesional CONTE Clase TE-1',
        fileName: 'CONTE_Matricula_TE1_2020.pdf',
        uploadDate: '2026-07-10',
        status: 'VERIFICADO'
      },
      {
        id: 'doc-2-3',
        type: 'antecedentes',
        title: 'Certificado Judicial de la Policía',
        fileName: 'Antecedentes_Martha_2026.pdf',
        uploadDate: '2026-07-11',
        status: 'VERIFICADO'
      }
    ],
    reviews: [
      {
        id: 'rev-3',
        clientName: 'Alejandro Restrepo',
        rating: 5,
        comment: 'Martha es una profesional intachable. Nos encontró un corto en el calentador eléctrico en 20 minutos con su multímetro. 100% recomendada.',
        date: '2026-10-02',
        serviceName: 'Reparación de circuito 220V'
      }
    ]
  },
  {
    id: 'w-3',
    name: 'Alonso ' + 'Pérez',
    trade: 'Maestro Pintor y Acabados',
    categoryId: 'pintura',
    avatar: '/src/assets/images/worker_painter_avatar_1791407989291.jpg',
    rating: 4.8,
    reviewsCount: 62,
    completedJobsCount: 110,
    distanceKm: 3.1,
    neighborhood: 'Usaquén, Bogotá',
    hourlyRate: 40000,
    baseServiceRate: 75000,
    bio: 'Experto en pintura lavable, estuco veneciano, reparación de humedades y resanes invisibles. Cuidado impecable de pisos y muebles con plástico y cinta de enmascarar.',
    experienceYears: 16,
    phone: '+57 320 671 4983',
    isVerified: true,
    documentStatus: 'VERIFICADO',
    isAvailableToday: true,
    specialties: ['Tratamiento de humedades y salitre', 'Estuco plástico y pintura vinilo tipo 1', 'Lacas para carpintería metálica y madera'],
    unavailableSlots: [],
    documents: [
      {
        id: 'doc-3-1',
        type: 'cedula',
        title: 'Cédula de Ciudadanía',
        fileName: 'CC_80124991_AlonsoPerez.pdf',
        uploadDate: '2026-09-01',
        status: 'VERIFICADO'
      },
      {
        id: 'doc-3-2',
        type: 'antecedentes',
        title: 'Certificado de Antecedentes de Policía',
        fileName: 'Cert_Antecedentes_Alonso_2026.pdf',
        uploadDate: '2026-09-01',
        status: 'VERIFICADO'
      }
    ],
    reviews: [
      {
        id: 'rev-4',
        clientName: 'Valeria Morales',
        rating: 5,
        comment: 'Pintó todo el apartamento en 2 días. El trabajo quedó impecable, sin una sola gota en el piso laminado.',
        date: '2026-09-22',
        serviceName: 'Pintura completa de sala comedor'
      }
    ]
  },
  {
    id: 'w-4',
    name: 'Yurani Caicedo',
    trade: 'Especialista en Aseo y Mantenimiento',
    categoryId: 'aseo',
    avatar: '/src/assets/images/worker_cleaning_avatar_1791407998257.jpg',
    rating: 4.9,
    reviewsCount: 112,
    completedJobsCount: 205,
    distanceKm: 1.2,
    neighborhood: 'Chicó Norte, Bogotá',
    hourlyRate: 35000,
    baseServiceRate: 65000,
    bio: 'Brindo servicios de aseo minucioso para casas, apartamentos y oficinas. Manejo de productos ecológicos, desinfección de baños, cocinas y lavado de vidrios altos.',
    experienceYears: 8,
    phone: '+57 318 734 8109',
    isVerified: true,
    documentStatus: 'VERIFICADO',
    isAvailableToday: true,
    specialties: ['Limpieza profunda post-remodelación', 'Desengrase de estufas y campanas extractoras', 'Organización de closets y alacenas'],
    unavailableSlots: ['2026-10-08T08:00', '2026-10-08T13:00'],
    documents: [
      {
        id: 'doc-4-1',
        type: 'cedula',
        title: 'Cédula de Ciudadanía',
        fileName: 'CC_101844209_YuraniCaicedo.pdf',
        uploadDate: '2026-06-20',
        status: 'VERIFICADO'
      },
      {
        id: 'doc-4-2',
        type: 'antecedentes',
        title: 'Certificado Judicial de la Policía',
        fileName: 'Antecedentes_Yurani_2026.pdf',
        uploadDate: '2026-06-20',
        status: 'VERIFICADO'
      }
    ],
    reviews: [
      {
        id: 'rev-5',
        clientName: 'Santiago Londoño',
        rating: 5,
        comment: 'La mejor experiencia de aseo en Bogotá. Confiable, educada y supremamente detallista.',
        date: '2026-10-04',
        serviceName: 'Aseo general de apartamento'
      }
    ]
  },
  {
    id: 'w-5',
    name: 'Hernán Botero',
    trade: 'Técnico Cerrajero Residencial y Automotriz',
    categoryId: 'cerrajeria',
    avatar: '/src/assets/images/worker_plumber_avatar_1791407969130.jpg',
    rating: 4.75,
    reviewsCount: 45,
    completedJobsCount: 78,
    distanceKm: 4.5,
    neighborhood: 'Cedritos, Bogotá',
    hourlyRate: 50000,
    baseServiceRate: 55000,
    bio: 'Cerrajería rápida y segura. Cambio de cilindros Cisa, Yale, Schlage, instalación de cerrojos pasadores y aperturas sin romper la chapa.',
    experienceYears: 12,
    phone: '+57 311 202 5431',
    isVerified: false,
    documentStatus: 'PENDIENTE_DE_VERIFICACION',
    isAvailableToday: false,
    specialties: ['Instalación de cerraduras digitales', 'Apertura de cerraduras de alta seguridad', 'Duplicado de llaves en sitio'],
    unavailableSlots: [],
    documents: [
      {
        id: 'doc-5-1',
        type: 'cedula',
        title: 'Cédula de Ciudadanía',
        fileName: 'CC_71289304_HernanBotero.pdf',
        uploadDate: '2026-10-06',
        status: 'PENDIENTE_DE_VERIFICACION'
      },
      {
        id: 'doc-5-2',
        type: 'antecedentes',
        title: 'Certificado de Policía Nacional',
        fileName: 'Policia_Hernan_Octubre.pdf',
        uploadDate: '2026-10-06',
        status: 'PENDIENTE_DE_VERIFICACION'
      }
    ],
    reviews: [
      {
        id: 'rev-6',
        clientName: 'Camila Pardo',
        rating: 4.5,
        comment: 'Llegó en su moto en menos de 25 minutos y nos abrió la puerta del apartamento que se había trabado.',
        date: '2026-09-18',
        serviceName: 'Apertura de cerradura de seguridad'
      }
    ]
  }
];

export const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-101',
    workerId: 'w-1',
    workerName: 'Jhon Jairo Ramírez',
    workerTrade: 'Maestro Plomero Certificado',
    workerAvatar: '/src/assets/images/worker_plumber_avatar_1791407969130.jpg',
    workerPhone: '+57 312 458 9012',
    clientName: 'Carlos Mendoza',
    clientPhone: '+57 310 908 1234',
    clientAddress: 'Calle 67 # 8-32, Apto 402',
    neighborhood: 'Chapinero, Bogotá',
    categoryName: 'Plomería',
    date: '2026-10-08',
    timeSlot: '09:00 AM - 11:00 AM',
    status: 'ACEPTADA',
    description: 'Tengo una fuga debajo del lavamanos principal que está mojando el mueble de madera. Necesito revisión urgente y cambio de mangueras flexibles.',
    estimatedCost: 65000,
    createdAt: '2026-10-07 10:15 AM'
  },
  {
    id: 'req-102',
    workerId: 'w-2',
    workerName: 'Martha Lucía Gómez',
    workerTrade: 'Técnica Electricista Residencial (CONTE)',
    workerAvatar: '/src/assets/images/worker_electrician_avatar_1791407980160.jpg',
    workerPhone: '+57 315 889 2311',
    clientName: 'Carlos Mendoza',
    clientPhone: '+57 310 908 1234',
    clientAddress: 'Calle 67 # 8-32, Apto 402',
    neighborhood: 'Chapinero, Bogotá',
    categoryName: 'Electricidad',
    date: '2026-10-09',
    timeSlot: '02:00 PM - 04:00 PM',
    status: 'PENDIENTE',
    description: 'Se saltó el taco de la cocina y no sube. Huele levemente a recalentado en la caja de fusibles.',
    estimatedCost: 75000,
    createdAt: '2026-10-07 02:40 PM'
  },
  {
    id: 'req-103',
    workerId: 'w-4',
    workerName: 'Yurani Caicedo',
    workerTrade: 'Especialista en Aseo y Mantenimiento',
    workerAvatar: '/src/assets/images/worker_cleaning_avatar_1791407998257.jpg',
    workerPhone: '+57 318 734 8109',
    clientName: 'Carlos Mendoza',
    clientPhone: '+57 310 908 1234',
    clientAddress: 'Calle 67 # 8-32, Apto 402',
    neighborhood: 'Chapinero, Bogotá',
    categoryName: 'Aseo y Desinfección',
    date: '2026-10-04',
    timeSlot: '08:00 AM - 01:00 PM',
    status: 'COMPLETADA',
    description: 'Aseo general de apartamento de 2 habitaciones, cocina y desinfección de 2 baños.',
    estimatedCost: 70000,
    createdAt: '2026-10-02 09:00 AM',
    review: {
      rating: 5,
      comment: 'Yurani es súper atenta, puntual y dejó todo reluciente. La contrataré de nuevo sin dudarlo.',
      submittedAt: '2026-10-04 02:30 PM'
    }
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    requestId: 'req-101',
    senderRole: 'cliente',
    senderName: 'Carlos Mendoza',
    text: 'Buenas tardes maestro Jhon Jairo, ¿vio la foto de la fuga debajo del sifón?',
    timestamp: '10:20 AM',
    read: true
  },
  {
    id: 'msg-2',
    requestId: 'req-101',
    senderRole: 'trabajador',
    senderName: 'Jhon Jairo Ramírez',
    text: '¡Hola don Carlos! Sí señor, la revisé. Parece que el empaque del acople ya venció. Yo llevo mangueras y empaques nuevos de repuesto.',
    timestamp: '10:23 AM',
    read: true
  },
  {
    id: 'msg-3',
    requestId: 'req-101',
    senderRole: 'trabajador',
    senderName: 'Jhon Jairo Ramírez',
    text: 'Mañana llego a las 9:00 AM en punto a su dirección en Chapinero con las herramientas listas.',
    timestamp: '10:25 AM',
    read: true
  },
  {
    id: 'msg-4',
    requestId: 'req-101',
    senderRole: 'cliente',
    senderName: 'Carlos Mendoza',
    text: 'Listo maestro, aquí lo espero en el apto 402. ¡Muchas gracias por la prontitud!',
    timestamp: '10:28 AM',
    read: true
  }
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    requestId: 'req-98',
    reporterName: 'Felipe Sandoval',
    reporterRole: 'cliente',
    reportedName: 'Carlos Mario Ruiz (Pintura)',
    reason: 'Incumplimiento de horario acordado sin aviso',
    description: 'El trabajador no se presentó en la fecha agendada y no contestó las llamadas ni los mensajes en el chat de la app.',
    createdAt: '2026-10-06 11:30 AM',
    status: 'PENDIENTE'
  }
];
