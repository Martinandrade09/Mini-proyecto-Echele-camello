USE `echele_camello`;

INSERT INTO `workers` (
  `id`, `name`, `trade`, `categoryId`, `avatar`, `rating`, `reviewsCount`, 
  `completedJobsCount`, `distanceKm`, `neighborhood`, `hourlyRate`, `baseServiceRate`, 
  `bio`, `experienceYears`, `phone`, `isVerified`, `documentStatus`, `isAvailableToday`, 
  `specialties`, `unavailableSlots`
) VALUES (
  'w-6', 
  'Héctor Fabio Morales', 
  'Maestro Carpintero y Ebanista', 
  'carpinteria', 
  'assets/images/worker_painter_avatar_1791407989291.jpg', 
  4.95, 
  58, 
  94, 
  2.3, 
  'Chapinero, Bogotá', 
  48000, 
  50000, 
  'Especialista en madera maciza, melamina, armado de closets, reparación de puertas, muebles modulares y lacados finos. Más de 18 años de experiencia.', 
  18, 
  '+57 314 670 1928', 
  1, 
  'VERIFICADO', 
  1, 
  '["Muebles de madera a medida", "Ajuste de puertas y cajones", "Armado de closets y repisas", "Lacados y barnizados"]', 
  '[]'
) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `worker_documents` (`id`, `workerId`, `type`, `title`, `fileName`, `uploadDate`, `status`) VALUES
('doc-6-1', 'w-6', 'cedula', 'Cédula de Ciudadanía', 'CC_79240118_HectorMorales.pdf', '2026-05-12', 'VERIFICADO'),
('doc-6-2', 'w-6', 'certificacion_tecnica', 'Certificado Técnico SENA - Ebanistería y Madera', 'SENA_Ebanisteria_Hector.pdf', '2026-05-12', 'VERIFICADO'),
('doc-6-3', 'w-6', 'antecedentes', 'Certificado Judicial Policía Nacional', 'Policia_Hector_2026.pdf', '2026-05-14', 'VERIFICADO')
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

INSERT INTO `worker_reviews` (`id`, `workerId`, `clientName`, `rating`, `comment`, `date`, `serviceName`) VALUES
('rev-6-1', 'w-6', 'Paola Andrea Castillo', 5, 'Excelente carpintero. Arregló las puertas de los closets de madera que no cerraban y quedaron como nuevas.', '2026-09-29', 'Ajuste de puertas de madera en closet')
ON DUPLICATE KEY UPDATE `rating`=VALUES(`rating`);

INSERT INTO `service_requests` (
  `id`, `workerId`, `workerName`, `workerTrade`, `workerAvatar`, `workerPhone`, 
  `clientName`, `clientPhone`, `clientAddress`, `neighborhood`, `categoryName`, 
  `date`, `timeSlot`, `status`, `description`, `estimatedCost`, `createdAt`
) VALUES (
  'req-104',
  'w-6',
  'Héctor Fabio Morales',
  'Maestro Carpintero y Ebanista',
  'assets/images/worker_painter_avatar_1791407989291.jpg',
  '+57 314 670 1928',
  'Carlos Mendoza',
  '+57 310 908 1234',
  'Calle 67 # 8-32, Apto 402',
  'Chapinero, Bogotá',
  'Carpintería',
  '2026-10-12',
  '02:00 PM - 04:00 PM',
  'COMPLETADA',
  'Reparación de puerta de madera principal que rozaba el piso y cambio de bisagras en mueble de cocina.',
  70000,
  '2026-10-10 11:20 AM'
) ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);
