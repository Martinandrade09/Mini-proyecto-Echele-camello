<?php
// ========================================================
// Manejador de Acciones y Formularios para Échele Camello
// ========================================================

require_once __DIR__ . '/db.php';

session_start();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') 
          || (isset($_GET['format']) && $_GET['format'] === 'json')
          || (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false);

$rawInput = file_get_contents('php://input');
if (empty($_POST) && !empty($rawInput)) {
    $rawJson = json_decode($rawInput, true);
    if (is_array($rawJson)) {
        $_POST = $rawJson;
        $action = $_POST['action'] ?? $action;
    }
}

function respondSuccess($message, $redirectUrl = 'index.php') {
    global $isAjax;
    if ($isAjax) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['success' => true, 'message' => $message]);
        exit;
    }
    $_SESSION['toast'] = ['type' => 'success', 'text' => $message];
    header("Location: $redirectUrl");
    exit;
}

function respondError($error, $redirectUrl = 'index.php') {
    global $isAjax;
    if ($isAjax) {
        http_response_code(400);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['success' => false, 'error' => $error]);
        exit;
    }
    $_SESSION['toast'] = ['type' => 'error', 'text' => $error];
    header("Location: $redirectUrl");
    exit;
}

try {
    switch ($action) {

        // 1. Obtener detalles de un trabajador para el modal dinámico
        case 'get_worker_json':
            header('Content-Type: application/json; charset=UTF-8');
            $workerId = $_GET['id'] ?? '';
            require_once __DIR__ . '/functions.php';
            $details = getWorkerDetails($pdo, $workerId);
            echo json_encode(['success' => true, 'data' => $details]);
            exit;

        // 2. Obtener mensajes de chat para una solicitud
        case 'get_chat_json':
            header('Content-Type: application/json; charset=UTF-8');
            $requestId = $_GET['request_id'] ?? '';
            require_once __DIR__ . '/functions.php';
            $messages = getChatMessages($pdo, $requestId);
            echo json_encode(['success' => true, 'data' => $messages]);
            exit;

        // 3. Crear Solicitud de Servicio
        case 'create_request':
            $workerId = $_POST['workerId'] ?? '';
            $workerName = $_POST['workerName'] ?? '';
            $workerTrade = $_POST['workerTrade'] ?? '';
            $workerAvatar = $_POST['workerAvatar'] ?? 'assets/images/worker_plumber_avatar_1791407969130.jpg';
            $workerPhone = $_POST['workerPhone'] ?? '+57 312 458 9012';
            $clientName = trim($_POST['clientName'] ?? 'Carlos Mendoza');
            $clientPhone = trim($_POST['clientPhone'] ?? '+57 310 908 1234');
            $clientAddress = trim($_POST['clientAddress'] ?? 'Calle 67 # 8-32, Apto 402');
            $neighborhood = $_POST['neighborhood'] ?? 'Chapinero, Bogotá';
            $categoryName = $_POST['categoryName'] ?? 'Servicio General';
            $date = $_POST['date'] ?? date('Y-m-d');
            $timeSlot = $_POST['timeSlot'] ?? '09:00 AM - 11:00 AM';
            $description = trim($_POST['description'] ?? '');
            $estimatedCost = (int)($_POST['estimatedCost'] ?? 50000);

            if (empty($workerId) || empty($description)) {
                throw new Exception('Por favor completa todos los campos requeridos y describe el servicio.');
            }

            $id = 'req-' . substr(time(), -4);
            $createdAt = date('Y-m-d h:i A');

            $stmt = $pdo->prepare("
                INSERT INTO service_requests (
                    id, workerId, workerName, workerTrade, workerAvatar, workerPhone,
                    clientName, clientPhone, clientAddress, neighborhood, categoryName,
                    date, timeSlot, status, description, estimatedCost, createdAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', ?, ?, ?)
            ");
            $stmt->execute([
                $id, $workerId, $workerName, $workerTrade, $workerAvatar, $workerPhone,
                $clientName, $clientPhone, $clientAddress, $neighborhood, $categoryName,
                $date, $timeSlot, $description, $estimatedCost, $createdAt
            ]);

            // Mensaje inicial en el chat
            $msgId = 'msg-' . time();
            $msgText = "Hola $workerName, he solicitado un servicio para el $date ($timeSlot): \"$description\"";
            $msgStmt = $pdo->prepare("
                INSERT INTO chat_messages (id, requestId, senderRole, senderName, text, timestamp, isRead)
                VALUES (?, ?, 'cliente', ?, ?, ?, 1)
            ");
            $msgStmt->execute([$msgId, $id, $clientName, $msgText, date('h:i A')]);

            respondSuccess("¡Solicitud enviada con éxito a $workerName!", "index.php?tab=solicitudes");
            break;

        // 4. Actualizar estado de solicitud (Aceptar, Rechazar, Completar, Cancelar)
        case 'update_request_status':
            $requestId = $_POST['requestId'] ?? '';
            $status = $_POST['status'] ?? '';
            $reason = trim($_POST['reason'] ?? '');

            if (empty($requestId) || empty($status)) {
                throw new Exception('ID de solicitud y estado son requeridos');
            }

            if ($status === 'RECHAZADA') {
                $stmt = $pdo->prepare("UPDATE service_requests SET status = ?, rejectionReason = ? WHERE id = ?");
                $stmt->execute([$status, $reason ?: 'Rechazado por indisponibilidad de horario', $requestId]);
            } elseif ($status === 'CANCELADA') {
                $stmt = $pdo->prepare("UPDATE service_requests SET status = ?, cancellationReason = ? WHERE id = ?");
                $stmt->execute([$status, $reason ?: 'Cancelado por el cliente', $requestId]);
            } else {
                $stmt = $pdo->prepare("UPDATE service_requests SET status = ? WHERE id = ?");
                $stmt->execute([$status, $requestId]);
            }

            respondSuccess("Estado de la solicitud actualizado a: $status", "index.php?tab=solicitudes");
            break;

        // 5. Enviar mensaje de chat
        case 'send_message':
            $requestId = $_POST['requestId'] ?? '';
            $senderRole = $_POST['senderRole'] ?? 'cliente';
            $senderName = $_POST['senderName'] ?? ($senderRole === 'trabajador' ? 'Jhon Jairo Ramírez' : 'Carlos Mendoza');
            $text = trim($_POST['text'] ?? '');

            if (empty($requestId) || empty($text)) {
                throw new Exception('Debes escribir un mensaje para enviarlo.');
            }

            $msgId = 'msg-' . time();
            $stmt = $pdo->prepare("
                INSERT INTO chat_messages (id, requestId, senderRole, senderName, text, timestamp, isRead)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            ");
            $stmt->execute([$msgId, $requestId, $senderRole, $senderName, $text, date('h:i A')]);

            if ($isAjax) {
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'success' => true,
                    'message' => [
                        'id' => $msgId,
                        'requestId' => $requestId,
                        'senderRole' => $senderRole,
                        'senderName' => $senderName,
                        'text' => $text,
                        'timestamp' => date('h:i A')
                    ]
                ]);
                exit;
            }

            respondSuccess("Mensaje enviado", "index.php?tab=solicitudes&chat_id=$requestId");
            break;

        // 6. Calificar Servicio
        case 'submit_review':
            $requestId = $_POST['requestId'] ?? '';
            $rating = (int)($_POST['rating'] ?? 5);
            $comment = trim($_POST['comment'] ?? '');

            if (empty($requestId)) {
                throw new Exception('Solicitud requerida');
            }

            $reqStmt = $pdo->prepare("SELECT * FROM service_requests WHERE id = ?");
            $reqStmt->execute([$requestId]);
            $req = $reqStmt->fetch();

            if (!$req) {
                throw new Exception('Solicitud no encontrada');
            }

            $dateToday = date('Y-m-d');

            // Actualizar la solicitud
            $upReq = $pdo->prepare("
                UPDATE service_requests 
                SET reviewRating = ?, reviewComment = ?, reviewSubmittedAt = ? 
                WHERE id = ?
            ");
            $upReq->execute([$rating, $comment, $dateToday, $requestId]);

            // Insertar en worker_reviews
            $revId = 'rev-' . time();
            $insRev = $pdo->prepare("
                INSERT INTO worker_reviews (id, workerId, clientName, rating, comment, date, serviceName)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $insRev->execute([
                $revId, $req['workerId'], $req['clientName'], $rating, $comment, $dateToday, $req['categoryName']
            ]);

            // Recalcular promedio de estrellas
            $calcStmt = $pdo->prepare("SELECT AVG(rating) as avgR, COUNT(*) as cnt FROM worker_reviews WHERE workerId = ?");
            $calcStmt->execute([$req['workerId']]);
            $calc = $calcStmt->fetch();

            $newAvg = round((float)$calc['avgR'], 2);
            $newCnt = (int)$calc['cnt'];

            $upW = $pdo->prepare("UPDATE workers SET rating = ?, reviewsCount = ? WHERE id = ?");
            $upW->execute([$newAvg, $newCnt, $req['workerId']]);

            respondSuccess("¡Muchas gracias! Has calificado el servicio con $rating estrellas.", "index.php?tab=solicitudes");
            break;

        // 7. Crear Reporte de Seguridad
        case 'create_report':
            $requestId = $_POST['requestId'] ?? null;
            $reporterName = trim($_POST['reporterName'] ?? 'Carlos Mendoza');
            $reporterRole = $_POST['reporterRole'] ?? 'cliente';
            $reportedName = trim($_POST['reportedName'] ?? 'Prestador de Servicio');
            $reason = trim($_POST['reason'] ?? '');
            $description = trim($_POST['description'] ?? '');

            if (empty($reason) || empty($description)) {
                throw new Exception('Por favor describe el motivo de tu reporte.');
            }

            $id = 'rep-' . substr(time(), -4);
            $createdAt = date('Y-m-d h:i A');

            $stmt = $pdo->prepare("
                INSERT INTO reports (id, requestId, reporterName, reporterRole, reportedName, reason, description, createdAt, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')
            ");
            $stmt->execute([$id, $requestId ?: null, $reporterName, $reporterRole, $reportedName, $reason, $description, $createdAt]);

            respondSuccess("Reporte registrado con éxito. El equipo de soporte investigará el caso.", "index.php?tab=solicitudes");
            break;

        // 8. Actualizar Perfil de Trabajador
        case 'update_worker_profile':
            $workerId = $_POST['workerId'] ?? 'w-1';
            $bio = trim($_POST['bio'] ?? '');
            $hourlyRate = (int)($_POST['hourlyRate'] ?? 45000);
            $baseServiceRate = (int)($_POST['baseServiceRate'] ?? 50000);
            $isAvailableToday = isset($_POST['isAvailableToday']) ? 1 : 0;

            $stmt = $pdo->prepare("
                UPDATE workers 
                SET bio = ?, hourlyRate = ?, baseServiceRate = ?, isAvailableToday = ? 
                WHERE id = ?
            ");
            $stmt->execute([$bio, $hourlyRate, $baseServiceRate, $isAvailableToday, $workerId]);

            respondSuccess("Perfil de trabajador actualizado en la base de datos.", "index.php?tab=panel-trabajador&role=trabajador");
            break;

        // 9. Subir Documento de Trabajador
        case 'upload_document':
            $workerId = $_POST['workerId'] ?? 'w-1';
            $type = $_POST['type'] ?? 'cedula';
            $title = trim($_POST['title'] ?? 'Documento');
            $fileName = trim($_POST['fileName'] ?? 'documento_' . time() . '.pdf');

            $docId = 'doc-' . time();
            $stmt = $pdo->prepare("
                INSERT INTO worker_documents (id, workerId, type, title, fileName, uploadDate, status)
                VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE_DE_VERIFICACION')
            ");
            $stmt->execute([$docId, $workerId, $type, $title, $fileName, date('Y-m-d')]);

            // Actualizar estado general del trabajador
            $upW = $pdo->prepare("UPDATE workers SET documentStatus = 'PENDIENTE_DE_VERIFICACION' WHERE id = ?");
            $upW->execute([$workerId]);

            respondSuccess("Documento cargado correctamente. En espera de verificación por el administrador.", "index.php?tab=panel-trabajador&role=trabajador");
            break;

        // 10. Aprobar o Rechazar Documento (Admin)
        case 'update_document_status':
            $documentId = $_POST['documentId'] ?? '';
            $workerId = $_POST['workerId'] ?? '';
            $status = $_POST['status'] ?? 'VERIFICADO';
            $reason = trim($_POST['reason'] ?? '');

            if (empty($documentId) || empty($workerId)) {
                throw new Exception('Parámetros de documento incompletos.');
            }

            $stmt = $pdo->prepare("UPDATE worker_documents SET status = ?, rejectionReason = ? WHERE id = ?");
            $stmt->execute([$status, $status === 'RECHAZADO' ? $reason : null, $documentId]);

            // Comprobar si todos los documentos del trabajador están aprobados
            $chk = $pdo->prepare("SELECT status FROM worker_documents WHERE workerId = ?");
            $chk->execute([$workerId]);
            $all = $chk->fetchAll(PDO::FETCH_COLUMN);

            $allVerified = !empty($all) && count(array_filter($all, fn($s) => $s === 'VERIFICADO')) === count($all);
            $hasRejected = in_array('RECHAZADO', $all);

            $wStatus = $allVerified ? 'VERIFICADO' : ($hasRejected ? 'RECHAZADO' : 'PENDIENTE_DE_VERIFICACION');
            $isVerified = $allVerified ? 1 : 0;

            $upW = $pdo->prepare("UPDATE workers SET isVerified = ?, documentStatus = ? WHERE id = ?");
            $upW->execute([$isVerified, $wStatus, $workerId]);

            respondSuccess("Documento actualizado a: $status", "index.php?tab=admin&role=admin");
            break;

        // 11. Resolver o Desestimar Reporte (Admin)
        case 'resolve_report':
            $reportId = $_POST['reportId'] ?? '';
            $status = $_POST['status'] ?? 'RESUELTO';

            $stmt = $pdo->prepare("UPDATE reports SET status = ? WHERE id = ?");
            $stmt->execute([$status, $reportId]);

            respondSuccess("Reporte actualizado a: $status", "index.php?tab=admin&role=admin");
            break;

        default:
            respondError("Acción no válida o no especificada.", "index.php");
            break;
    }
} catch (Exception $e) {
    respondError($e->getMessage(), "index.php");
}
