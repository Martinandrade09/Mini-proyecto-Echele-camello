<?php
// ========================================================
// Funciones del Sistema Échele Camello en PHP & MySQL
// ========================================================

require_once __DIR__ . '/db.php';

/**
 * Obtener todas las categorías
 */
function getCategories($pdo) {
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
    return $stmt->fetchAll();
}

/**
 * Normalizar rutas de avatares para la web PHP
 */
function getAvatarUrl($path) {
    if (empty($path)) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
    $clean = str_replace('/src/', '', $path);
    if (!str_starts_with($clean, 'assets/') && !str_starts_with($clean, 'http')) {
        $clean = 'assets/images/' . basename($clean);
    }
    return $clean;
}

/**
 * Formatear dinero en Pesos Colombianos (COP)
 */
function formatCOP($number) {
    return '$' . number_format($number, 0, ',', '.') . ' COP';
}

/**
 * Obtener trabajadores con filtros opcionales
 */
function getWorkers($pdo, $categoryId = null, $neighborhood = 'TODOS', $search = '', $sortBy = 'rating') {
    $sql = "SELECT * FROM workers WHERE 1=1";
    $params = [];

    if (!empty($categoryId)) {
        $sql .= " AND categoryId = ?";
        $params[] = $categoryId;
    }

    if ($neighborhood !== 'TODOS' && !empty($neighborhood)) {
        $sql .= " AND neighborhood LIKE ?";
        $params[] = "%$neighborhood%";
    }

    if (!empty($search)) {
        $sql .= " AND (name LIKE ? OR trade LIKE ? OR bio LIKE ? OR specialties LIKE ?)";
        $term = "%$search%";
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    // Ordenamiento
    if ($sortBy === 'price') {
        $sql .= " ORDER BY hourlyRate ASC";
    } elseif ($sortBy === 'distance') {
        $sql .= " ORDER BY distanceKm ASC";
    } else {
        $sql .= " ORDER BY rating DESC, completedJobsCount DESC";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $workers = $stmt->fetchAll();

    foreach ($workers as &$w) {
        $w['specialties_list'] = json_decode($w['specialties'] ?? '[]', true) ?: [];
        $w['avatar_url'] = getAvatarUrl($w['avatar']);
    }

    return $workers;
}

/**
 * Obtener un trabajador con todos sus documentos y reseñas
 */
function getWorkerDetails($pdo, $workerId) {
    $stmt = $pdo->prepare("SELECT * FROM workers WHERE id = ?");
    $stmt->execute([$workerId]);
    $worker = $stmt->fetch();

    if (!$worker) return null;

    $worker['specialties_list'] = json_decode($worker['specialties'] ?? '[]', true) ?: [];
    $worker['avatar_url'] = getAvatarUrl($worker['avatar']);

    // Documentos
    $docStmt = $pdo->prepare("SELECT * FROM worker_documents WHERE workerId = ? ORDER BY uploadDate DESC");
    $docStmt->execute([$workerId]);
    $worker['documents'] = $docStmt->fetchAll();

    // Reseñas
    $revStmt = $pdo->prepare("SELECT * FROM worker_reviews WHERE workerId = ? ORDER BY date DESC");
    $revStmt->execute([$workerId]);
    $worker['reviews'] = $revStmt->fetchAll();

    return $worker;
}

/**
 * Obtener solicitudes de servicio según rol, búsqueda y filtros
 */
function getServiceRequests($pdo, $role = 'cliente', $statusFilter = 'TODAS', $search = '', $categoryFilter = 'TODAS', $neighborhoodFilter = 'TODOS', $sortBy = 'recientes') {
    $sql = "SELECT * FROM service_requests WHERE 1=1";
    $params = [];

    // Filtro de Estado
    if ($statusFilter === 'ACTIVAS') {
        $sql .= " AND status IN ('PENDIENTE', 'ACEPTADA')";
    } elseif ($statusFilter !== 'TODAS' && !empty($statusFilter)) {
        $sql .= " AND status = ?";
        $params[] = $statusFilter;
    }

    // Filtro de Categoría
    if ($categoryFilter !== 'TODAS' && !empty($categoryFilter)) {
        $sql .= " AND categoryName = ?";
        $params[] = $categoryFilter;
    }

    // Filtro de Barrio
    if ($neighborhoodFilter !== 'TODOS' && !empty($neighborhoodFilter)) {
        $sql .= " AND neighborhood LIKE ?";
        $params[] = "%$neighborhoodFilter%";
    }

    // Búsqueda por texto (Camellador, Cliente, Oficio, Descripción, Dirección, Código de solicitud)
    if (!empty($search)) {
        $sql .= " AND (workerName LIKE ? OR clientName LIKE ? OR workerTrade LIKE ? OR categoryName LIKE ? OR description LIKE ? OR clientAddress LIKE ? OR neighborhood LIKE ? OR id LIKE ?)";
        $term = "%$search%";
        for ($i = 0; $i < 8; $i++) {
            $params[] = $term;
        }
    }

    // Ordenamiento
    if ($sortBy === 'precio_mayor') {
        $sql .= " ORDER BY estimatedCost DESC";
    } elseif ($sortBy === 'precio_menor') {
        $sql .= " ORDER BY estimatedCost ASC";
    } elseif ($sortBy === 'antiguos') {
        $sql .= " ORDER BY id ASC";
    } else {
        $sql .= " ORDER BY id DESC";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $requests = $stmt->fetchAll();

    foreach ($requests as &$req) {
        $req['workerAvatar_url'] = getAvatarUrl($req['workerAvatar']);
    }

    return $requests;
}

/**
 * Obtener mensajes de chat para una solicitud específica
 */
function getChatMessages($pdo, $requestId) {
    $stmt = $pdo->prepare("SELECT * FROM chat_messages WHERE requestId = ? ORDER BY id ASC");
    $stmt->execute([$requestId]);
    return $stmt->fetchAll();
}

/**
 * Obtener reportes de seguridad para el panel de administración
 */
function getReports($pdo) {
    $stmt = $pdo->query("SELECT * FROM reports ORDER BY id DESC");
    return $stmt->fetchAll();
}

/**
 * Estadísticas de la base de datos para el modal de estado
 */
function getDatabaseStats($pdo) {
    try {
        $stats = [
            'workers' => (int)$pdo->query("SELECT COUNT(*) FROM workers")->fetchColumn(),
            'requests' => (int)$pdo->query("SELECT COUNT(*) FROM service_requests")->fetchColumn(),
            'chats' => (int)$pdo->query("SELECT COUNT(*) FROM chat_messages")->fetchColumn(),
            'reports' => (int)$pdo->query("SELECT COUNT(*) FROM reports")->fetchColumn(),
            'categories' => (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn(),
        ];
        return $stats;
    } catch (Exception $e) {
        return [];
    }
}
