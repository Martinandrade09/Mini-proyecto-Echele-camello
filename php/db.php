<?php
// ========================================================
// Conexión PDO a MySQL en XAMPP - Proyecto Échele Camello
// ========================================================

$host = '127.0.0.1';
$port = '3306';
$db   = 'echele_camello';
$user = 'root';
$pass = ''; // Contraseña por defecto en XAMPP
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
    die("
    <div style='font-family:sans-serif; padding:30px; background:#fef2f2; border:2px solid #ef4444; border-radius:12px; max-width:600px; margin:40px auto;'>
        <h2 style='color:#991b1b; margin-top:0;'>⚠️ Error de Conexión con XAMPP MySQL</h2>
        <p style='color:#7f1d1d;'>No se pudo conectar a la base de datos <strong>echele_camello</strong> en MySQL local.</p>
        <p style='color:#4b5563; font-size:14px;'>Detalle: " . htmlspecialchars($e->getMessage()) . "</p>
        <div style='background:white; padding:15px; border-radius:8px; border:1px solid #fca5a5; font-size:13px;'>
            <strong>Pasos para solucionar:</strong>
            <ol style='margin-bottom:0; padding-left:20px;'>
                <li>Abre el <strong>XAMPP Control Panel</strong>.</li>
                <li>Verifica que los módulos <strong>Apache</strong> y <strong>MySQL</strong> estén en verde (Running).</li>
                <li>Verifica que la base de datos <strong>echele_camello</strong> exista en phpMyAdmin (<a href='http://localhost/phpmyadmin/' target='_blank'>http://localhost/phpmyadmin/</a>).</li>
            </ol>
        </div>
    </div>
    ");
}
