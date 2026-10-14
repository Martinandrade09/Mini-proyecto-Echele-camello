<?php
// ========================================================
// Conexión a la base de datos MySQL en XAMPP
// ========================================================

// Configurar encabezados CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de peticiones preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '127.0.0.1';
$port = '3306';
$db   = 'echele_camello';
$user = 'root';
$pass = ''; // Por defecto en XAMPP no tiene contraseña
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'No se pudo conectar a la base de datos MySQL en XAMPP: ' . $e->getMessage(),
        'tip' => 'Asegúrate de que el módulo MySQL esté iniciado en el panel de control de XAMPP y que la base de datos echele_camello exista.'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
