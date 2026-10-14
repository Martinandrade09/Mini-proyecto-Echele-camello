-- ========================================================
-- Base de Datos: echele_camello
-- Conexión Local XAMPP (Apache + MariaDB/MySQL + PHP)
-- Proyecto: Échele Camello
-- ========================================================

CREATE DATABASE IF NOT EXISTS `echele_camello` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `echele_camello`;

-- 1. Tabla de Categorías
DROP TABLE IF EXISTS `worker_reviews`;
DROP TABLE IF EXISTS `worker_documents`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `service_requests`;
DROP TABLE IF EXISTS `workers`;
DROP TABLE IF EXISTS `categories`;

CREATE TABLE `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `iconName` VARCHAR(50) NOT NULL,
  `count` INT NOT NULL DEFAULT 0,
  `description` TEXT NOT NULL,
  `baseRate` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Camelladores (Workers)
CREATE TABLE `workers` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `trade` VARCHAR(150) NOT NULL,
  `categoryId` VARCHAR(50) NOT NULL,
  `avatar` VARCHAR(255) NOT NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  `reviewsCount` INT NOT NULL DEFAULT 0,
  `completedJobsCount` INT NOT NULL DEFAULT 0,
  `distanceKm` DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  `neighborhood` VARCHAR(150) NOT NULL,
  `hourlyRate` INT NOT NULL DEFAULT 0,
  `baseServiceRate` INT NOT NULL DEFAULT 0,
  `bio` TEXT NOT NULL,
  `experienceYears` INT NOT NULL DEFAULT 0,
  `phone` VARCHAR(50) NOT NULL,
  `isVerified` TINYINT(1) NOT NULL DEFAULT 0,
  `documentStatus` ENUM('PENDIENTE_DE_VERIFICACION', 'VERIFICADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE_DE_VERIFICACION',
  `isAvailableToday` TINYINT(1) NOT NULL DEFAULT 1,
  `specialties` LONGTEXT NOT NULL,
  `unavailableSlots` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_worker_category` (`categoryId`),
  CONSTRAINT `fk_worker_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Documentos de Trabajadores
CREATE TABLE `worker_documents` (
  `id` VARCHAR(50) NOT NULL,
  `workerId` VARCHAR(50) NOT NULL,
  `type` ENUM('cedula', 'antecedentes', 'certificacion_tecnica', 'rut') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `uploadDate` VARCHAR(50) NOT NULL,
  `status` ENUM('PENDIENTE_DE_VERIFICACION', 'VERIFICADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE_DE_VERIFICACION',
  `rejectionReason` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_document_worker` (`workerId`),
  CONSTRAINT `fk_document_worker` FOREIGN KEY (`workerId`) REFERENCES `workers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Reseñas / Calificaciones de Trabajadores
CREATE TABLE `worker_reviews` (
  `id` VARCHAR(50) NOT NULL,
  `workerId` VARCHAR(50) NOT NULL,
  `clientName` VARCHAR(150) NOT NULL,
  `clientAvatar` VARCHAR(255) DEFAULT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `serviceName` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_review_worker` (`workerId`),
  CONSTRAINT `fk_review_worker` FOREIGN KEY (`workerId`) REFERENCES `workers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Solicitudes de Servicio (Service Requests)
CREATE TABLE `service_requests` (
  `id` VARCHAR(50) NOT NULL,
  `workerId` VARCHAR(50) NOT NULL,
  `workerName` VARCHAR(150) NOT NULL,
  `workerTrade` VARCHAR(150) NOT NULL,
  `workerAvatar` VARCHAR(255) NOT NULL,
  `workerPhone` VARCHAR(50) NOT NULL,
  `clientName` VARCHAR(150) NOT NULL,
  `clientPhone` VARCHAR(50) NOT NULL,
  `clientAddress` VARCHAR(255) NOT NULL,
  `neighborhood` VARCHAR(150) NOT NULL,
  `categoryName` VARCHAR(100) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `timeSlot` VARCHAR(100) NOT NULL,
  `status` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
  `description` TEXT NOT NULL,
  `estimatedCost` INT NOT NULL DEFAULT 0,
  `createdAt` VARCHAR(100) NOT NULL,
  `rejectionReason` TEXT DEFAULT NULL,
  `cancellationReason` TEXT DEFAULT NULL,
  `reviewRating` INT DEFAULT NULL,
  `reviewComment` TEXT DEFAULT NULL,
  `reviewSubmittedAt` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_request_worker` (`workerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla de Mensajes de Chat
CREATE TABLE `chat_messages` (
  `id` VARCHAR(50) NOT NULL,
  `requestId` VARCHAR(50) NOT NULL,
  `senderRole` ENUM('cliente', 'trabajador') NOT NULL,
  `senderName` VARCHAR(150) NOT NULL,
  `text` TEXT NOT NULL,
  `timestamp` VARCHAR(50) NOT NULL,
  `isRead` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_chat_request` (`requestId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla de Reportes de Seguridad / Soporte
CREATE TABLE `reports` (
  `id` VARCHAR(50) NOT NULL,
  `requestId` VARCHAR(50) DEFAULT NULL,
  `reporterName` VARCHAR(150) NOT NULL,
  `reporterRole` ENUM('cliente', 'trabajador', 'admin') NOT NULL,
  `reportedName` VARCHAR(150) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `createdAt` VARCHAR(100) NOT NULL,
  `status` ENUM('PENDIENTE', 'RESUELTO', 'DESESTIMADO') NOT NULL DEFAULT 'PENDIENTE',
  `adminNotes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- DATOS INICIALES (MOCK DATA COMPATIBLE)
-- ========================================================

-- Categorías
INSERT INTO `categories` (`id`, `name`, `iconName`, `count`, `description`, `baseRate`) VALUES
('plomeria', 'Plomería', 'Wrench', 28, 'Fugas, grifería, destapes de cañerías, calentadores y tuberías de agua potable.', '$45.000 COP / visita'),
('electricidad', 'Electricidad', 'Zap', 24, 'Instalaciones residenciales, tableros de tacos, tomas, lámparas y cortocircuitos.', '$50.000 COP / visita'),
('pintura', 'Pintura', 'Paintbrush', 19, 'Pintura interior, estuco, fachadas, impermeabilización y acabados finos.', '$40.000 COP / m²'),
('aseo', 'Aseo y Desinfección', 'Sparkles', 32, 'Aseo profundo de casas, oficinas, lavado de tapetes y desinfección sanitaria.', '$65.000 COP / jornada'),
('cerrajeria', 'Cerrajería', 'Key', 15, 'Aperturas de emergencia 24/7, cambio de guardas, cerrojos de seguridad y candados.', '$55.000 COP / servicio'),
('carpinteria', 'Carpintería', 'Hammer', 12, 'Arreglo de puertas, closet, muebles modulares, bisagras y lacados.', '$50.000 COP / hora');

-- Camelladores (Workers)
INSERT INTO `workers` (`id`, `name`, `trade`, `categoryId`, `avatar`, `rating`, `reviewsCount`, `completedJobsCount`, `distanceKm`, `neighborhood`, `hourlyRate`, `baseServiceRate`, `bio`, `experienceYears`, `phone`, `isVerified`, `documentStatus`, `isAvailableToday`, `specialties`, `unavailableSlots`) VALUES
('w-1', 'Jhon Jairo Ramírez', 'Maestro Plomero Certificado', 'plomeria', '/src/assets/images/worker_plumber_avatar_1791407969130.jpg', 4.90, 84, 142, 1.8, 'Chapinero Alto, Bogotá', 45000, 50000, 'Más de 14 años solucionando fugas difíciles, tuberías PVC/cobre e instalación de calentadores a gas. Puntualidad paisa y garantía de 3 meses por escrito en cada camello.', 14, '+57 312 458 9012', 1, 'VERIFICADO', 1, '["Detección de fugas no destructiva", "Instalación de grifería y sanitarios", "Mantenimiento de calentadores Bosch y Haceb"]', '["2026-10-08T09:00", "2026-10-08T11:00"]'),
('w-2', 'Martha Lucía Gómez', 'Técnica Electricista Residencial (CONTE)', 'electricidad', '/src/assets/images/worker_electrician_avatar_1791407980160.jpg', 4.95, 96, 168, 2.4, 'Teusaquillo, Bogotá', 50000, 60000, 'Electricista certificada con matrícula CONTE vigente. Especialista en sobrecargas, cambio de acometidas, breakers que se disparan y automatización de iluminación.', 10, '+57 315 889 2311', 1, 'VERIFICADO', 1, '["Revisión de tableros de tacos", "Cableado estructurado libre de halógeno", "Instalación de luminarias LED y timbres inteligentes"]', '["2026-10-09T14:00"]'),
('w-3', 'Alonso Pérez', 'Maestro Pintor y Acabados', 'pintura', '/src/assets/images/worker_painter_avatar_1791407989291.jpg', 4.80, 62, 110, 3.1, 'Usaquén, Bogotá', 40000, 75000, 'Experto en pintura lavable, estuco veneciano, reparación de humedades y resanes invisibles. Cuidado impecable de pisos y muebles con plástico y cinta de enmascarar.', 16, '+57 320 671 4983', 1, 'VERIFICADO', 1, '["Tratamiento de humedades y salitre", "Estuco plástico y pintura vinilo tipo 1", "Lacas para carpintería metálica y madera"]', '[]'),
('w-4', 'Yurani Caicedo', 'Especialista en Aseo y Mantenimiento', 'aseo', '/src/assets/images/worker_cleaning_avatar_1791407998257.jpg', 4.90, 112, 205, 1.2, 'Chicó Norte, Bogotá', 35000, 65000, 'Brindo servicios de aseo minucioso para casas, apartamentos y oficinas. Manejo de productos ecológicos, desinfección de baños, cocinas y lavado de vidrios altos.', 8, '+57 318 734 8109', 1, 'VERIFICADO', 1, '["Limpieza profunda post-remodelación", "Desengrase de estufas y campanas extractoras", "Organización de closets y alacenas"]', '["2026-10-08T08:00", "2026-10-08T13:00"]'),
('w-5', 'Hernán Botero', 'Técnico Cerrajero Residencial y Automotriz', 'cerrajeria', '/src/assets/images/worker_plumber_avatar_1791407969130.jpg', 4.75, 45, 78, 4.5, 'Cedritos, Bogotá', 50000, 55000, 'Cerrajería rápida y segura. Cambio de cilindros Cisa, Yale, Schlage, instalación de cerrojos pasadores y aperturas sin romper la chapa.', 12, '+57 311 202 5431', 0, 'PENDIENTE_DE_VERIFICACION', 0, '["Instalación de cerraduras digitales", "Apertura de cerraduras de alta seguridad", "Duplicado de llaves en sitio"]', '[]');

-- Documentos de trabajadores
INSERT INTO `worker_documents` (`id`, `workerId`, `type`, `title`, `fileName`, `uploadDate`, `status`, `rejectionReason`) VALUES
('doc-1-1', 'w-1', 'cedula', 'Cédula de Ciudadanía', 'CC_79844201_JhonRamirez.pdf', '2026-08-15', 'VERIFICADO', NULL),
('doc-1-2', 'w-1', 'antecedentes', 'Certificado de Antecedentes de Policía', 'Policia_Cert_2026_Vigente.pdf', '2026-08-15', 'VERIFICADO', NULL),
('doc-1-3', 'w-1', 'certificacion_tecnica', 'Certificado Técnico SENA - Redes Hidrosanitarias', 'SENA_Tecnico_Plomeria_2015.pdf', '2026-08-16', 'VERIFICADO', NULL),
('doc-2-1', 'w-2', 'cedula', 'Cédula de Ciudadanía', 'CC_52391044_MarthaGomez.pdf', '2026-07-10', 'VERIFICADO', NULL),
('doc-2-2', 'w-2', 'certificacion_tecnica', 'Tarjeta Profesional CONTE Clase TE-1', 'CONTE_Matricula_TE1_2020.pdf', '2026-07-10', 'VERIFICADO', NULL),
('doc-2-3', 'w-2', 'antecedentes', 'Certificado Judicial de la Policía', 'Antecedentes_Martha_2026.pdf', '2026-07-11', 'VERIFICADO', NULL),
('doc-3-1', 'w-3', 'cedula', 'Cédula de Ciudadanía', 'CC_80124991_AlonsoPerez.pdf', '2026-09-01', 'VERIFICADO', NULL),
('doc-3-2', 'w-3', 'antecedentes', 'Certificado de Antecedentes de Policía', 'Cert_Antecedentes_Alonso_2026.pdf', '2026-09-01', 'VERIFICADO', NULL),
('doc-4-1', 'w-4', 'cedula', 'Cédula de Ciudadanía', 'CC_101844209_YuraniCaicedo.pdf', '2026-06-20', 'VERIFICADO', NULL),
('doc-4-2', 'w-4', 'antecedentes', 'Certificado Judicial de la Policía', 'Antecedentes_Yurani_2026.pdf', '2026-06-20', 'VERIFICADO', NULL),
('doc-5-1', 'w-5', 'cedula', 'Cédula de Ciudadanía', 'CC_71289304_HernanBotero.pdf', '2026-10-06', 'PENDIENTE_DE_VERIFICACION', NULL),
('doc-5-2', 'w-5', 'antecedentes', 'Certificado de Policía Nacional', 'Policia_Hernan_Octubre.pdf', '2026-10-06', 'PENDIENTE_DE_VERIFICACION', NULL);

-- Reseñas de trabajadores
INSERT INTO `worker_reviews` (`id`, `workerId`, `clientName`, `clientAvatar`, `rating`, `comment`, `date`, `serviceName`) VALUES
('rev-1', 'w-1', 'Diana Carolina Suárez', NULL, 5, 'Excelente maestro. Llegó en punto, trajo sus propios repuestos y solucionó una fuga que dos plomeros anteriores no pudieron.', '2026-09-28', 'Cambio de válvula y sifón de lavaplatos'),
('rev-2', 'w-1', 'Mateo Osorio', NULL, 5, 'Muy honesto con el precio, dejó todo limpio después de terminar el trabajo.', '2026-09-15', 'Destape de bajante de aguas lluvias'),
('rev-3', 'w-2', 'Alejandro Restrepo', NULL, 5, 'Martha es una profesional intachable. Nos encontró un corto en el calentador eléctrico en 20 minutos con su multímetro. 100% recomendada.', '2026-10-02', 'Reparación de circuito 220V'),
('rev-4', 'w-3', 'Valeria Morales', NULL, 5, 'Pintó todo el apartamento en 2 días. El trabajo quedó impecable, sin una sola gota en el piso laminado.', '2026-09-22', 'Pintura completa de sala comedor'),
('rev-5', 'w-4', 'Santiago Londoño', NULL, 5, 'La mejor experiencia de aseo en Bogotá. Confiable, educada y supremamente detallista.', '2026-10-04', 'Aseo general de apartamento'),
('rev-6', 'w-5', 'Camila Pardo', NULL, 5, 'Llegó en su moto en menos de 25 minutos y nos abrió la puerta del apartamento que se había trabado.', '2026-09-18', 'Apertura de cerradura de seguridad');

-- Solicitudes de Servicio (Service Requests)
INSERT INTO `service_requests` (`id`, `workerId`, `workerName`, `workerTrade`, `workerAvatar`, `workerPhone`, `clientName`, `clientPhone`, `clientAddress`, `neighborhood`, `categoryName`, `date`, `timeSlot`, `status`, `description`, `estimatedCost`, `createdAt`, `rejectionReason`, `cancellationReason`, `reviewRating`, `reviewComment`, `reviewSubmittedAt`) VALUES
('req-101', 'w-1', 'Jhon Jairo Ramírez', 'Maestro Plomero Certificado', '/src/assets/images/worker_plumber_avatar_1791407969130.jpg', '+57 312 458 9012', 'Carlos Mendoza', '+57 310 908 1234', 'Calle 67 # 8-32, Apto 402', 'Chapinero, Bogotá', 'Plomería', '2026-10-08', '09:00 AM - 11:00 AM', 'ACEPTADA', 'Tengo una fuga debajo del lavamanos principal que está mojando el mueble de madera. Necesito revisión urgente y cambio de mangueras flexibles.', 65000, '2026-10-07 10:15 AM', NULL, NULL, NULL, NULL, NULL),
('req-102', 'w-2', 'Martha Lucía Gómez', 'Técnica Electricista Residencial (CONTE)', '/src/assets/images/worker_electrician_avatar_1791407980160.jpg', '+57 315 889 2311', 'Carlos Mendoza', '+57 310 908 1234', 'Calle 67 # 8-32, Apto 402', 'Chapinero, Bogotá', 'Electricidad', '2026-10-09', '02:00 PM - 04:00 PM', 'PENDIENTE', 'Se saltó el taco de la cocina y no sube. Huele levemente a recalentado en la caja de fusibles.', 75000, '2026-10-07 02:40 PM', NULL, NULL, NULL, NULL, NULL),
('req-103', 'w-4', 'Yurani Caicedo', 'Especialista en Aseo y Mantenimiento', '/src/assets/images/worker_cleaning_avatar_1791407998257.jpg', '+57 318 734 8109', 'Carlos Mendoza', '+57 310 908 1234', 'Calle 67 # 8-32, Apto 402', 'Chapinero, Bogotá', 'Aseo y Desinfección', '2026-10-04', '08:00 AM - 01:00 PM', 'COMPLETADA', 'Aseo general de apartamento de 2 habitaciones, cocina y desinfección de 2 baños.', 70000, '2026-10-02 09:00 AM', NULL, NULL, 5, 'Yurani es súper atenta, puntual y dejó todo reluciente. La contrataré de nuevo sin dudarlo.', '2026-10-04 02:30 PM');

-- Mensajes de Chat
INSERT INTO `chat_messages` (`id`, `requestId`, `senderRole`, `senderName`, `text`, `timestamp`, `isRead`) VALUES
('msg-1', 'req-101', 'cliente', 'Carlos Mendoza', 'Buenas tardes maestro Jhon Jairo, ¿vio la foto de la fuga debajo del sifón?', '10:20 AM', 1),
('msg-2', 'req-101', 'trabajador', 'Jhon Jairo Ramírez', '¡Hola don Carlos! Sí señor, la revisé. Parece que el empaque del acople ya venció. Yo llevo mangueras y empaques nuevos de repuesto.', '10:23 AM', 1),
('msg-3', 'req-101', 'trabajador', 'Jhon Jairo Ramírez', 'Mañana llego a las 9:00 AM en punto a su dirección en Chapinero con las herramientas listas.', '10:25 AM', 1),
('msg-4', 'req-101', 'cliente', 'Carlos Mendoza', 'Listo maestro, aquí lo espero en el apto 402. ¡Muchas gracias por la prontitud!', '10:28 AM', 1);

-- Reportes
INSERT INTO `reports` (`id`, `requestId`, `reporterName`, `reporterRole`, `reportedName`, `reason`, `description`, `createdAt`, `status`, `adminNotes`) VALUES
('rep-1', 'req-98', 'Felipe Sandoval', 'cliente', 'Carlos Mario Ruiz (Pintura)', 'Incumplimiento de horario acordado sin aviso', 'El trabajador no se presentó en la fecha agendada y no contestó las llamadas ni los mensajes en el chat de la app.', '2026-10-06 11:30 AM', 'PENDIENTE', NULL);
