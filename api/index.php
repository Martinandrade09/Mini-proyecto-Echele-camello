<?php
// ========================================================
// API REST de Échele Camello - Servidor PHP para XAMPP
// ========================================================

require_once __DIR__ . '/db.php';

// Obtener la acción solicitada
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Leer cuerpo JSON si existe
$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true) ?? [];

try {
    switch ($action) {
        // ----------------------------------------------------
        // 1. Health check & status
        // ----------------------------------------------------
        case 'health':
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $counts = [];
            foreach (['workers', 'service_requests', 'chat_messages', 'reports', 'categories'] as $tbl) {
                if (in_array($tbl, $tables)) {
                    $cStmt = $pdo->query("SELECT COUNT(*) FROM `$tbl`");
                    $counts[$tbl] = (int)$cStmt->fetchColumn();
                }
            }

            echo json_encode([
                'success' => true,
                'status' => 'online',
                'server' => 'XAMPP Apache & MySQL (MariaDB)',
                'database' => 'echele_camello',
                'tables' => $tables,
                'counts' => $counts,
                'timestamp' => date('Y-m-d H:i:s')
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ----------------------------------------------------
        // 2. Obtener toda la información para el frontend
        // ----------------------------------------------------
        case 'get_all':
            // Categorías
            $catStmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
            $categories = $catStmt->fetchAll();
            foreach ($categories as &$c) {
                $c['count'] = (int)$c['count'];
            }

            // Camelladores
            $workStmt = $pdo->query("SELECT * FROM workers ORDER BY rating DESC");
            $workersRaw = $workStmt->fetchAll();

            $workers = [];
            foreach ($workersRaw as $w) {
                $workerId = $w['id'];

                // Documentos del trabajador
                $docStmt = $pdo->prepare("SELECT * FROM worker_documents WHERE workerId = ? ORDER BY uploadDate DESC");
                $docStmt->execute([$workerId]);
                $docs = $docStmt->fetchAll();

                // Reseñas del trabajador
                $revStmt = $pdo->prepare("SELECT * FROM worker_reviews WHERE workerId = ? ORDER BY date DESC");
                $revStmt->execute([$workerId]);
                $revs = $revStmt->fetchAll();
                foreach ($revs as &$r) {
                    $r['rating'] = (int)$r['rating'];
                }

                // Especialidades y horarios
                $specialties = json_decode($w['specialties'] ?? '[]', true) ?: [];
                $unavailableSlots = json_decode($w['unavailableSlots'] ?? '[]', true) ?: [];

                $workers[] = [
                    'id' => $w['id'],
                    'name' => $w['name'],
                    'trade' => $w['trade'],
                    'categoryId' => $w['categoryId'],
                    'avatar' => $w['avatar'],
                    'rating' => (float)$w['rating'],
                    'reviewsCount' => (int)$w['reviewsCount'],
                    'completedJobsCount' => (int)$w['completedJobsCount'],
                    'distanceKm' => (float)$w['distanceKm'],
                    'neighborhood' => $w['neighborhood'],
                    'hourlyRate' => (int)$w['hourlyRate'],
                    'baseServiceRate' => (int)$w['baseServiceRate'],
                    'bio' => $w['bio'],
                    'experienceYears' => (int)$w['experienceYears'],
                    'phone' => $w['phone'],
                    'isVerified' => (bool)$w['isVerified'],
                    'documentStatus' => $w['documentStatus'],
                    'isAvailableToday' => (bool)$w['isAvailableToday'],
                    'specialties' => $specialties,
                    'unavailableSlots' => $unavailableSlots,
                    'documents' => $docs,
                    'reviews' => $revs
                ];
            }

            // Solicitudes de servicio
            $reqStmt = $pdo->query("SELECT * FROM service_requests ORDER BY id DESC");
            $requestsRaw = $reqStmt->fetchAll();

            $requests = [];
            foreach ($requestsRaw as $req) {
                $reviewObj = null;
                if (!empty($req['reviewRating'])) {
                    $reviewObj = [
                        'rating' => (int)$req['reviewRating'],
                        'comment' => $req['reviewComment'] ?? '',
                        'submittedAt' => $req['reviewSubmittedAt'] ?? ''
                    ];
                }

                $requests[] = [
                    'id' => $req['id'],
                    'workerId' => $req['workerId'],
                    'workerName' => $req['workerName'],
                    'workerTrade' => $req['workerTrade'],
                    'workerAvatar' => $req['workerAvatar'],
                    'workerPhone' => $req['workerPhone'],
                    'clientName' => $req['clientName'],
                    'clientPhone' => $req['clientPhone'],
                    'clientAddress' => $req['clientAddress'],
                    'neighborhood' => $req['neighborhood'],
                    'categoryName' => $req['categoryName'],
                    'date' => $req['date'],
                    'timeSlot' => $req['timeSlot'],
                    'status' => $req['status'],
                    'description' => $req['description'],
                    'estimatedCost' => (int)$req['estimatedCost'],
                    'createdAt' => $req['createdAt'],
                    'rejectionReason' => $req['rejectionReason'] ?? null,
                    'cancellationReason' => $req['cancellationReason'] ?? null,
                    'review' => $reviewObj
                ];
            }

            // Mensajes de chat
            $chatStmt = $pdo->query("SELECT * FROM chat_messages ORDER BY id ASC");
            $chatRaw = $chatStmt->fetchAll();
            $chatMessages = [];
            foreach ($chatRaw as $msg) {
                $chatMessages[] = [
                    'id' => $msg['id'],
                    'requestId' => $msg['requestId'],
                    'senderRole' => $msg['senderRole'],
                    'senderName' => $msg['senderName'],
                    'text' => $msg['text'],
                    'timestamp' => $msg['timestamp'],
                    'read' => (bool)$msg['isRead']
                ];
            }

            // Reportes
            $repStmt = $pdo->query("SELECT * FROM reports ORDER BY id DESC");
            $reports = $repStmt->fetchAll();

            echo json_encode([
                'success' => true,
                'data' => [
                    'categories' => $categories,
                    'workers' => $workers,
                    'requests' => $requests,
                    'chatMessages' => $chatMessages,
                    'reports' => $reports
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ----------------------------------------------------
        // 3. Crear Solicitud de Servicio
        // ----------------------------------------------------
        case 'create_request':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }

            $id = $inputData['id'] ?? ('req-' . time());
            $workerId = $inputData['workerId'] ?? '';
            $workerName = $inputData['workerName'] ?? '';
            $workerTrade = $inputData['workerTrade'] ?? '';
            $workerAvatar = $inputData['workerAvatar'] ?? '';
            $workerPhone = $inputData['workerPhone'] ?? '';
            $clientName = $inputData['clientName'] ?? '';
            $clientPhone = $inputData['clientPhone'] ?? '';
            $clientAddress = $inputData['clientAddress'] ?? '';
            $neighborhood = $inputData['neighborhood'] ?? '';
            $categoryName = $inputData['categoryName'] ?? '';
            $date = $inputData['date'] ?? date('Y-m-d');
            $timeSlot = $inputData['timeSlot'] ?? '';
            $status = $inputData['status'] ?? 'PENDIENTE';
            $description = $inputData['description'] ?? '';
            $estimatedCost = (int)($inputData['estimatedCost'] ?? 0);
            $createdAt = $inputData['createdAt'] ?? date('Y-m-d h:i A');

            $stmt = $pdo->prepare("
                INSERT INTO service_requests (
                    id, workerId, workerName, workerTrade, workerAvatar, workerPhone,
                    clientName, clientPhone, clientAddress, neighborhood, categoryName,
                    date, timeSlot, status, description, estimatedCost, createdAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id, $workerId, $workerName, $workerTrade, $workerAvatar, $workerPhone,
                $clientName, $clientPhone, $clientAddress, $neighborhood, $categoryName,
                $date, $timeSlot, $status, $description, $estimatedCost, $createdAt
            ]);

            // Crear mensaje inicial en el chat automáticamente
            $msgId = 'msg-' . time();
            $msgText = "Hola $workerName, he creado una solicitud para el día $date ($timeSlot): \"$description\"";
            $msgTimestamp = date('h:i A');

            $msgStmt = $pdo->prepare("
                INSERT INTO chat_messages (id, requestId, senderRole, senderName, text, timestamp, isRead)
                VALUES (?, ?, 'cliente', ?, ?, ?, 1)
            ");
            $msgStmt->execute([$msgId, $id, $clientName, $msgText, $msgTimestamp]);

            echo json_encode([
                'success' => true,
                'message' => 'Solicitud creada con éxito en MySQL',
                'request' => array_merge($inputData, ['id' => $id, 'createdAt' => $createdAt]),
                'initialMessage' => [
                    'id' => $msgId,
                    'requestId' => $id,
                    'senderRole' => 'cliente',
                    'senderName' => $clientName,
                    'text' => $msgText,
                    'timestamp' => $msgTimestamp,
                    'read' => true
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ----------------------------------------------------
        // 4. Actualizar Estado de Solicitud (Aceptar, Rechazar, etc.)
        // ----------------------------------------------------
        case 'update_request_status':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }

            $requestId = $inputData['requestId'] ?? '';
            $status = $inputData['status'] ?? '';
            $reason = $inputData['reason'] ?? null;

            if (empty($requestId) || empty($status)) {
                throw new Exception('Faltan parámetros requeridos');
            }

            if ($status === 'RECHAZADA') {
                $stmt = $pdo->prepare("UPDATE service_requests SET status = ?, rejectionReason = ? WHERE id = ?");
                $stmt->execute([$status, $reason, $requestId]);
            } else if ($status === 'CANCELADA') {
                $stmt = $pdo->prepare("UPDATE service_requests SET status = ?, cancellationReason = ? WHERE id = ?");
                $stmt->execute([$status, $reason, $requestId]);
            } else {
                $stmt = $pdo->prepare("UPDATE service_requests SET status = ? WHERE id = ?");
                $stmt->execute([$status, $requestId]);
            }

            echo json_encode([
                'success' => true,
                'message' => "Estado de la solicitud actualizado a $status",
                'requestId' => $requestId,
                'status' => $status
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ----------------------------------------------------
        // 5. Enviar Mensaje de Chat
        // ----------------------------------------------------
        case 'send_message':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }

            $id = $inputData['id'] ?? ('msg-' . time());
            $requestId = $inputData['requestId'] ?? '';
            $senderRole = $inputData['senderRole'] ?? 'cliente';
            $senderName = $inputData['senderName'] ?? '';
            $text = $inputData['text'] ?? '';
            $timestamp = $inputData['timestamp'] ?? date('h:i A');

            if (empty($requestId) || empty($text)) {
                throw new Exception('El requestId y el texto son obligatorios');
            }

            $stmt = $pdo->prepare("
                INSERT INTO chat_messages (id, requestId, senderRole, senderName, text, timestamp, isRead)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            ");
            $stmt->execute([$id, $requestId, $senderRole, $senderName, $text, $timestamp]);

            echo json_encode([
                'success' => true,
                'message' => 'Mensaje guardado en base de datos',
                'chatMessage' => [
                    'id' => $id,
                    'requestId' => $requestId,
                    'senderRole' => $senderRole,
                    'senderName' => $senderName,
                    'text' => $text,
                    'timestamp' => $timestamp,
                    'read' => true
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ----------------------------------------------------
        // 6. Calificar Solicitud y Recalcular Promedio
        // ----------------------------------------------------
        case 'submit_review':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }

            $requestId = $inputData['requestId'] ?? '';
            $rating = (int)($inputData['rating'] ?? 5);
            $comment = $inputData['comment'] ?? '';
            $submittedAt = date('Y-m-d');

            // Obtener datos de la solicitud
            $reqStmt = $pdo->prepare("SELECT * FROM service_requests WHERE id = ?");
            $reqStmt->execute([$requestId]);
            $req = $reqStmt->fetch();

            if (!$req) {
                throw new Exception('Solicitud no encontrada');
            }

            // Actualizar la solicitud con la reseña
            $upReq = $pdo->prepare("
                UPDATE service_requests 
                SET reviewRating = ?, reviewComment = ?, reviewSubmittedAt = ?
                WHERE id = ?
            ");
            $upReq->execute([$rating, $comment, $submittedAt, $requestId]);

            // Insertar en worker_reviews
            $revId = 'rev-' . time();
            $insRev = $pdo->prepare("
                INSERT INTO worker_reviews (id, workerId, clientName, clientAvatar, rating, comment, date, serviceName)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $insRev->execute([
                $revId,
                $req['workerId'],
                $req['clientName'],
                null,
                $rating,
                $comment,
                $submittedAt,
                $req['categoryName']
            ]);

            // Recalcular promedio de estrellas y número de reseñas
            $calcStmt = $pdo->prepare("
                SELECT AVG(rating) as avgRating, COUNT(*) as totalReviews 
                FROM worker_reviews 
                WHERE workerId = ?
            ");
            $calcStmt->execute([$req['workerId']]);
            $calc = $calcStmt->fetch();
            $newAvg = round((float)$calc['avgRating'], 2);
            $total = (int)$calc['totalReviews'];

            $upWorker = $pdo->prepare("
                UPDATE workers 
                SET rating = ?, reviewsCount = ?
                WHERE id = ?
            ");
            $upWorker->execute([$newAvg, $total, $req['workerId']]);

            echo json_encode([
                'success' => true,
                'message' => 'Calificación guardada y promedio actualizado en MySQL',
                'workerId' => $req['workerId'],
                'newRating' => $newAvg,
                'reviewsCount' => $total,
                'review' => [
                    'id' => $revId,
                    'rating' => $rating,
                    'comment' => $comment,
                    'submittedAt' => $submittedAt
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ----------------------------------------------------
        // 7. Crear Reporte de Seguridad
        // ----------------------------------------------------
        case 'create_report':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }

            $id = $inputData['id'] ?? ('rep-' . time());
            $requestId = $inputData['requestId'] ?? null;
            $reporterName = $inputData['reporterName'] ?? '';
            $reporterRole = $inputData['reporterRole'] ?? 'cliente';
            $reportedName = $inputData['reportedName'] ?? '';
            $reason = $inputData['reason'] ?? '';
            $description = $inputData['description'] ?? '';
            $createdAt = $inputData['createdAt'] ?? date('Y-m-d h:i A');
            $status = 'PENDIENTE';

            $stmt = $pdo->prepare("
                INSERT INTO reports (id, requestId, reporterName, reporterRole, reportedName, reason, description, createdAt, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$id, $requestId, $reporterName, $reporterRole, $reportedName, $reason, $description, $createdAt, $status]);

            echo json_encode([
                'success' => true,
                'message' => 'Reporte creado y archivado en MySQL',
                'report' => [
                    'id' => $id,
                    'requestId' => $requestId,
                    'reporterName' => $reporterName,
                    'reporterRole' => $reporterRole,
                    'reportedName' => $reportedName,
                    'reason' => $reason,
                    'description' => $description,
                    'createdAt' => $createdAt,
                    'status' => $status
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ----------------------------------------------------
        // 8. Actualizar Perfil de Camellador
        // ----------------------------------------------------
        case 'update_worker':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }

            $workerId = $inputData['id'] ?? 'w-1';
            $fieldsToUpdate = [];
            $params = [];

            if (isset($inputData['bio'])) {
                $fieldsToUpdate[] = "bio = ?";
                $params[] = $inputData['bio'];
            }
            if (isset($inputData['hourlyRate'])) {
                $fieldsToUpdate[] = "hourlyRate = ?";
                $params[] = (int)$inputData['hourlyRate'];
            }
            if (isset($inputData['baseServiceRate'])) {
                $fieldsToUpdate[] = "baseServiceRate = ?";
                $params[] = (int)$inputData['baseServiceRate'];
            }
            if (isset($inputData['isAvailableToday'])) {
                $fieldsToUpdate[] = "isAvailableToday = ?";
                $params[] = $inputData['isAvailableToday'] ? 1 : 0;
            }
            if (isset($inputData['specialties'])) {
                $fieldsToUpdate[] = "specialties = ?";
                $params[] = json_encode($inputData['specialties'], JSON_UNESCAPED_UNICODE);
            }
            if (isset($inputData['unavailableSlots'])) {
                $fieldsToUpdate[] = "unavailableSlots = ?";
                $params[] = json_encode($inputData['unavailableSlots'], JSON_UNESCAPED_UNICODE);
            }

            if (!empty($fieldsToUpdate)) {
                $params[] = $workerId;
                $sql = "UPDATE workers SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Perfil de trabajador actualizado en MySQL'
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ----------------------------------------------------
        // 9. Subir Documento de Trabajador
        // ----------------------------------------------------
        case 'upload_document':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }

            $workerId = $inputData['workerId'] ?? 'w-1';
            $id = $inputData['id'] ?? ('doc-' . time());
            $type = $inputData['type'] ?? 'cedula';
            $title = $inputData['title'] ?? 'Documento';
            $fileName = $inputData['fileName'] ?? 'documento.pdf';
            $uploadDate = date('Y-m-d');
            $status = 'PENDIENTE_DE_VERIFICACION';

            $stmt = $pdo->prepare("
                INSERT INTO worker_documents (id, workerId, type, title, fileName, uploadDate, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$id, $workerId, $type, $title, $fileName, $uploadDate, $status]);

            // Actualizar estado general del trabajador a pendiente
            $upW = $pdo->prepare("UPDATE workers SET documentStatus = 'PENDIENTE_DE_VERIFICACION' WHERE id = ?");
            $upW->execute([$workerId]);

            echo json_encode([
                'success' => true,
                'message' => 'Documento registrado con éxito en MySQL',
                'document' => [
                    'id' => $id,
                    'type' => $type,
                    'title' => $title,
                    'fileName' => $fileName,
                    'uploadDate' => $uploadDate,
                    'status' => $status
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ----------------------------------------------------
        // 10. Actualizar Estado de Documento (Aprobar/Rechazar en Admin)
        // ----------------------------------------------------
        case 'update_document_status':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }

            $workerId = $inputData['workerId'] ?? '';
            $documentId = $inputData['documentId'] ?? '';
            $status = $inputData['status'] ?? 'VERIFICADO';
            $reason = $inputData['reason'] ?? null;

            $stmt = $pdo->prepare("
                UPDATE worker_documents 
                SET status = ?, rejectionReason = ? 
                WHERE id = ? AND workerId = ?
            ");
            $stmt->execute([$status, $reason, $documentId, $workerId]);

            // Si todos los documentos están verificados, verificar al trabajador
            $chkStmt = $pdo->prepare("SELECT status FROM worker_documents WHERE workerId = ?");
            $chkStmt->execute([$workerId]);
            $allDocs = $chkStmt->fetchAll(PDO::FETCH_COLUMN);

            $allVerified = !empty($allDocs) && count(array_filter($allDocs, fn($s) => $s === 'VERIFICADO')) === count($allDocs);
            $hasRejected = in_array('RECHAZADO', $allDocs);

            $workerDocStatus = $allVerified ? 'VERIFICADO' : ($hasRejected ? 'RECHAZADO' : 'PENDIENTE_DE_VERIFICACION');
            $isVerified = $allVerified ? 1 : 0;

            $upW = $pdo->prepare("UPDATE workers SET isVerified = ?, documentStatus = ? WHERE id = ?");
            $upW->execute([$isVerified, $workerDocStatus, $workerId]);

            echo json_encode([
                'success' => true,
                'message' => "Documento $status",
                'isVerified' => (bool)$isVerified,
                'workerDocStatus' => $workerDocStatus
            ], JSON_UNESCAPED_UNICODE);
            break;

        default:
            echo json_encode([
                'success' => false,
                'message' => 'Acción no válida o no especificada. Usa ?action=health o ?action=get_all',
                'available_actions' => [
                    'health',
                    'get_all',
                    'create_request',
                    'update_request_status',
                    'send_message',
                    'submit_review',
                    'create_report',
                    'update_worker',
                    'upload_document',
                    'update_document_status'
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
