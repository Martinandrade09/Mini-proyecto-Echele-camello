<?php
// ========================================================
// Échele Camello - Plataforma Web en PHP & MySQL (XAMPP)
// ========================================================

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/functions.php';

session_start();

// Estado de la sesión / Toast
$toast = $_SESSION['toast'] ?? null;
unset($_SESSION['toast']);

// Parámetros de navegación
$activeRole = $_GET['role'] ?? $_SESSION['role'] ?? 'cliente';
$_SESSION['role'] = $activeRole;

$activeTab = $_GET['tab'] ?? 'explorar';
$selectedCategory = $_GET['cat'] ?? null;
$selectedNeighborhood = $_GET['barrio'] ?? 'TODOS';
$searchQuery = trim($_GET['q'] ?? '');
$sortBy = $_GET['sort'] ?? 'rating';

// Parámetros de búsqueda y filtros para la sección de Trabajos / Solicitudes
$requestStatusFilter = $_GET['req_status'] ?? 'TODAS';
$reqSearch = trim($_GET['req_q'] ?? '');
$reqCategory = $_GET['req_cat'] ?? 'TODAS';
$reqNeighborhood = $_GET['req_barrio'] ?? 'TODOS';
$reqSort = $_GET['req_sort'] ?? 'recientes';

// Cargar datos desde MySQL
$categories = getCategories($pdo);
$workers = getWorkers($pdo, $selectedCategory, $selectedNeighborhood, $searchQuery, $sortBy);
$serviceRequests = getServiceRequests($pdo, $activeRole, $requestStatusFilter, $reqSearch, $reqCategory, $reqNeighborhood, $reqSort);
$totalRequestsCount = (int)$pdo->query("SELECT COUNT(*) FROM service_requests")->fetchColumn();
$reports = getReports($pdo);
$dbStats = getDatabaseStats($pdo);

// Camellador actual para el panel de trabajador
$currentWorker = getWorkerDetails($pdo, 'w-1') ?: ($workers[0] ?? null);

// Contadores de solicitudes pendientes
$pendingCount = 0;
foreach ($serviceRequests as $sr) {
    if ($sr['status'] === 'PENDIENTE') $pendingCount++;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Échele Camello | Servicios Técnicos Verificados en Colombia</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        camello: {
                            amber: '#F59E0B',
                            amberDark: '#D97706',
                            teal: '#0F766E',
                            tealDark: '#115E59',
                            dark: '#0F172A',
                            bg: '#F8FAFC'
                        }
                    },
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                        heading: ['Outfit', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #F8FAFC; }
        .font-heading { font-family: 'Outfit', sans-serif; }
        .glass-header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); }
        .badge-verified { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    </style>
</head>
<body class="min-h-screen flex flex-col text-slate-800">

    <!-- Global Toast Notification -->
    <?php if ($toast): ?>
        <div id="toast-banner" class="sticky top-0 z-50 px-4 py-3 text-xs font-semibold flex items-center justify-between shadow-md transition-all <?php echo $toast['type'] === 'success' ? 'bg-[#0F766E] text-white' : 'bg-rose-600 text-white'; ?>">
            <div class="max-w-7xl mx-auto flex items-center gap-2">
                <i data-lucide="<?php echo $toast['type'] === 'success' ? 'check-circle' : 'alert-circle'; ?>" class="w-4 h-4"></i>
                <span><?php echo htmlspecialchars($toast['text']); ?></span>
            </div>
            <button onclick="document.getElementById('toast-banner').remove()" class="p-1 hover:bg-black/10 rounded-full">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    <?php endif; ?>

    <!-- Header / Navbar -->
    <header class="sticky top-0 z-40 glass-header border-b border-slate-200 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            
            <!-- Logo & Brand + XAMPP Status Indicator -->
            <div class="flex items-center gap-3">
                <a href="index.php?tab=explorar&role=<?php echo $activeRole; ?>" class="flex items-center gap-2.5 group">
                    <div class="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-900 font-extrabold text-xl shadow-xs group-hover:bg-amber-600 transition-colors">
                        🐪
                    </div>
                    <div>
                        <span class="font-heading font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
                            Échele Camello
                        </span>
                    </div>
                </a>

                <!-- XAMPP MySQL Status Badge (Clickable) -->
                <button onclick="openXamppModal()" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-2xs" title="Ver estado de conexión con XAMPP y MySQL">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <i data-lucide="database" class="w-3 h-3 opacity-70"></i>
                    <span class="hidden sm:inline">XAMPP</span>
                    <span class="text-[10px] font-bold">MySQL</span>
                </button>
            </div>

            <!-- Navigation Links -->
            <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <a href="index.php?tab=explorar&role=<?php echo $activeRole; ?>" class="pb-1 border-b-2 transition-colors <?php echo $activeTab === 'explorar' ? 'border-[#0F766E] text-[#0F766E] font-bold' : 'border-transparent hover:text-slate-900'; ?>">
                    Explorar Oficios
                </a>

                <a href="index.php?tab=solicitudes&role=<?php echo $activeRole; ?>" class="relative pb-1 border-b-2 transition-colors <?php echo $activeTab === 'solicitudes' ? 'border-[#0F766E] text-[#0F766E] font-bold' : 'border-transparent hover:text-slate-900'; ?>">
                    <?php echo $activeRole === 'trabajador' ? 'Mis Trabajos' : 'Mis Solicitudes'; ?>
                    <?php if ($pendingCount > 0): ?>
                        <span class="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                            <?php echo $pendingCount; ?>
                        </span>
                    <?php endif; ?>
                </a>

                <?php if ($activeRole === 'trabajador'): ?>
                    <a href="index.php?tab=panel-trabajador&role=trabajador" class="pb-1 border-b-2 transition-colors <?php echo $activeTab === 'panel-trabajador' ? 'border-[#0F766E] text-[#0F766E] font-bold' : 'border-transparent hover:text-slate-900'; ?>">
                        Mi Perfil & Docs
                    </a>
                <?php endif; ?>

                <?php if ($activeRole === 'admin'): ?>
                    <a href="index.php?tab=admin&role=admin" class="pb-1 border-b-2 transition-colors <?php echo $activeTab === 'admin' ? 'border-[#0F766E] text-[#0F766E] font-bold' : 'border-transparent hover:text-slate-900'; ?>">
                        Panel Administrador
                    </a>
                <?php endif; ?>

                <a href="index.php?tab=seguridad&role=<?php echo $activeRole; ?>" class="pb-1 border-b-2 transition-colors <?php echo $activeTab === 'seguridad' ? 'border-[#0F766E] text-[#0F766E] font-bold' : 'border-transparent hover:text-slate-900'; ?>">
                    Garantía & Verificación
                </a>
            </nav>

            <!-- Role Selector -->
            <div class="flex items-center gap-2">
                <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
                    <a href="index.php?tab=<?php echo ($activeTab === 'panel-trabajador' || $activeTab === 'admin') ? 'explorar' : $activeTab; ?>&role=cliente" class="px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-all <?php echo $activeRole === 'cliente' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'; ?>">
                        <i data-lucide="user" class="w-3.5 h-3.5 text-amber-600"></i>
                        <span class="hidden sm:inline">Cliente</span>
                    </a>
                    <a href="index.php?tab=panel-trabajador&role=trabajador" class="px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-all <?php echo $activeRole === 'trabajador' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'; ?>">
                        <i data-lucide="briefcase" class="w-3.5 h-3.5 text-teal-700"></i>
                        <span class="hidden sm:inline">Trabajador</span>
                    </a>
                    <a href="index.php?tab=admin&role=admin" class="px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-all <?php echo $activeRole === 'admin' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'; ?>">
                        <i data-lucide="shield-check" class="w-3.5 h-3.5 text-purple-700"></i>
                        <span class="hidden sm:inline">Admin</span>
                    </a>
                </div>
            </div>

        </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        <?php if ($activeTab === 'explorar'): ?>
            <!-- ========================================== -->
            <!-- TAB: EXPLORAR OFICIOS                      -->
            <!-- ========================================== -->

            <!-- Hero Section -->
            <div class="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 min-h-[300px] flex items-center">
                <img src="assets/images/camello_hero_banner_1791407957231.jpg" alt="Échele Camello" class="absolute inset-0 w-full h-full object-cover opacity-35">
                <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-transparent"></div>

                <div class="relative z-10 max-w-2xl p-6 sm:p-10 space-y-4">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 backdrop-blur-xs">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                        <span>Servicios verificados en Bogotá y Colombia (Conectado a MySQL)</span>
                    </div>

                    <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                        El camello bien hecho, directo a tu casa.
                    </h1>

                    <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        Encuentra plomeros, electricistas, pintores y personal de aseo certificados. Tarifas reguladas, cero cobros ocultos y garantía protegida.
                    </p>

                    <!-- Quick Search Bar -->
                    <form action="index.php" method="GET" class="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/20 flex flex-col sm:flex-row items-center gap-2 max-w-xl">
                        <input type="hidden" name="tab" value="explorar">
                        <input type="hidden" name="role" value="<?php echo $activeRole; ?>">
                        <?php if ($selectedCategory): ?>
                            <input type="hidden" name="cat" value="<?php echo htmlspecialchars($selectedCategory); ?>">
                        <?php endif; ?>
                        
                        <div class="flex-1 flex items-center gap-2 px-3 w-full">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400 shrink-0"></i>
                            <input type="text" name="q" value="<?php echo htmlspecialchars($searchQuery); ?>" placeholder="¿Qué necesitas arreglar? (ej. fuga de agua, pintar cuarto...)" class="w-full h-10 text-xs text-slate-900 outline-hidden placeholder:text-slate-400 bg-transparent">
                        </div>

                        <button type="submit" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-xs transition-colors shrink-0">
                            Buscar Camellador
                        </button>
                    </form>
                </div>
            </div>

            <!-- Categories Bar -->
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h2 class="font-heading font-extrabold text-lg text-slate-900">Categorías de Servicio</h2>
                    <?php if ($selectedCategory): ?>
                        <a href="index.php?tab=explorar&role=<?php echo $activeRole; ?>" class="text-xs text-teal-700 hover:underline font-bold">Ver todas</a>
                    <?php endif; ?>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <?php 
                    $catIcons = [
                        'plomeria' => 'wrench',
                        'electricidad' => 'zap',
                        'pintura' => 'paintbrush',
                        'aseo' => 'sparkles',
                        'cerrajeria' => 'key',
                        'carpinteria' => 'hammer'
                    ];
                    foreach ($categories as $cat): 
                        $isSelected = ($selectedCategory === $cat['id']);
                        $icon = $catIcons[$cat['id']] ?? 'briefcase';
                    ?>
                        <a href="index.php?tab=explorar&role=<?php echo $activeRole; ?>&cat=<?php echo $cat['id']; ?><?php echo !empty($searchQuery) ? '&q=' . urlencode($searchQuery) : ''; ?>" class="p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between h-28 group <?php echo $isSelected ? 'bg-teal-800 text-white border-teal-800 shadow-md ring-2 ring-teal-600' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:shadow-xs'; ?>">
                            <div class="flex items-center justify-between">
                                <div class="w-8 h-8 rounded-xl flex items-center justify-center <?php echo $isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 group-hover:bg-amber-200'; ?>">
                                    <i data-lucide="<?php echo $icon; ?>" class="w-4 h-4"></i>
                                </div>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full <?php echo $isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'; ?>">
                                    <?php echo $cat['count']; ?>
                                </span>
                            </div>
                            <div>
                                <div class="font-bold text-xs"><?php echo htmlspecialchars($cat['name']); ?></div>
                                <div class="text-[10px] mt-0.5 line-clamp-1 <?php echo $isSelected ? 'text-teal-100' : 'text-slate-400'; ?>">
                                    <?php echo htmlspecialchars($cat['baseRate']); ?>
                                </div>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Filter Controls Bar -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-700">Zona / Barrio:</span>
                    <form action="index.php" method="GET" class="inline">
                        <input type="hidden" name="tab" value="explorar">
                        <input type="hidden" name="role" value="<?php echo $activeRole; ?>">
                        <?php if ($selectedCategory): ?><input type="hidden" name="cat" value="<?php echo htmlspecialchars($selectedCategory); ?>"><?php endif; ?>
                        <?php if ($searchQuery): ?><input type="hidden" name="q" value="<?php echo htmlspecialchars($searchQuery); ?>"><?php endif; ?>
                        <select name="barrio" onchange="this.form.submit()" class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-teal-600">
                            <option value="TODOS" <?php echo $selectedNeighborhood === 'TODOS' ? 'selected' : ''; ?>>Todos los barrios</option>
                            <option value="Chapinero" <?php echo $selectedNeighborhood === 'Chapinero' ? 'selected' : ''; ?>>Chapinero</option>
                            <option value="Teusaquillo" <?php echo $selectedNeighborhood === 'Teusaquillo' ? 'selected' : ''; ?>>Teusaquillo</option>
                            <option value="Usaquén" <?php echo $selectedNeighborhood === 'Usaquén' ? 'selected' : ''; ?>>Usaquén</option>
                            <option value="Chicó Norte" <?php echo $selectedNeighborhood === 'Chicó Norte' ? 'selected' : ''; ?>>Chicó Norte</option>
                            <option value="Cedritos" <?php echo $selectedNeighborhood === 'Cedritos' ? 'selected' : ''; ?>>Cedritos</option>
                        </select>
                    </form>
                </div>

                <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-700">Ordenar por:</span>
                    <form action="index.php" method="GET" class="inline">
                        <input type="hidden" name="tab" value="explorar">
                        <input type="hidden" name="role" value="<?php echo $activeRole; ?>">
                        <?php if ($selectedCategory): ?><input type="hidden" name="cat" value="<?php echo htmlspecialchars($selectedCategory); ?>"><?php endif; ?>
                        <?php if ($selectedNeighborhood): ?><input type="hidden" name="barrio" value="<?php echo htmlspecialchars($selectedNeighborhood); ?>"><?php endif; ?>
                        <select name="sort" onchange="this.form.submit()" class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-teal-600">
                            <option value="rating" <?php echo $sortBy === 'rating' ? 'selected' : ''; ?>>⭐ Mejor Calificados</option>
                            <option value="distance" <?php echo $sortBy === 'distance' ? 'selected' : ''; ?>>📍 Menor Distancia</option>
                            <option value="price" <?php echo $sortBy === 'price' ? 'selected' : ''; ?>>💰 Menor Tarifa</option>
                        </select>
                    </form>
                </div>
            </div>

            <!-- Workers Grid -->
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-heading font-extrabold text-base text-slate-900">
                        Camelladores Disponibles (<?php echo count($workers); ?> encontrados)
                    </h3>
                </div>

                <?php if (empty($workers)): ?>
                    <div class="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
                        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                            <i data-lucide="search-x" class="w-6 h-6"></i>
                        </div>
                        <h4 class="font-bold text-sm text-slate-800">No se encontraron camelladores</h4>
                        <p class="text-xs text-slate-500">Intenta cambiando el filtro de búsqueda o seleccionando otro barrio.</p>
                        <a href="index.php?tab=explorar&role=<?php echo $activeRole; ?>" class="inline-block px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-bold">Ver todos los camelladores</a>
                    </div>
                <?php else: ?>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <?php foreach ($workers as $worker): ?>
                            <div class="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                                <div class="p-5 space-y-4">
                                    <!-- Header: Avatar, Name & Trade -->
                                    <div class="flex items-start gap-3.5">
                                        <img src="<?php echo htmlspecialchars($worker['avatar_url']); ?>" alt="<?php echo htmlspecialchars($worker['name']); ?>" class="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-1.5 flex-wrap">
                                                <h4 class="font-bold text-sm text-slate-900 truncate">
                                                    <?php echo htmlspecialchars($worker['name']); ?>
                                                </h4>
                                                <?php if ($worker['isVerified']): ?>
                                                    <span class="badge-verified px-1.5 py-0.2 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                                                        <i data-lucide="shield-check" class="w-3 h-3 text-emerald-600"></i> Verificado
                                                    </span>
                                                <?php endif; ?>
                                            </div>
                                            <div class="text-xs text-teal-800 font-semibold line-clamp-1">
                                                <?php echo htmlspecialchars($worker['trade']); ?>
                                            </div>
                                            <div class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                <i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i>
                                                <span><?php echo htmlspecialchars($worker['neighborhood']); ?></span>
                                                <span>·</span>
                                                <span><?php echo $worker['distanceKm']; ?> km</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Rating & Stats Bar -->
                                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                        <div class="flex items-center gap-1">
                                            <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-500"></i>
                                            <span class="font-extrabold text-slate-900"><?php echo number_format($worker['rating'], 2); ?></span>
                                            <span class="text-slate-400 text-[11px]">(<?php echo $worker['reviewsCount']; ?> reseñas)</span>
                                        </div>
                                        <div class="text-slate-500 text-[11px]">
                                            <strong class="text-slate-800 font-bold"><?php echo $worker['completedJobsCount']; ?></strong> camellos hechos
                                        </div>
                                    </div>

                                    <!-- Bio snippet -->
                                    <p class="text-xs text-slate-600 line-clamp-2">
                                        <?php echo htmlspecialchars($worker['bio']); ?>
                                    </p>

                                    <!-- Specialties Tags -->
                                    <?php if (!empty($worker['specialties_list'])): ?>
                                        <div class="flex flex-wrap gap-1.5">
                                            <?php foreach (array_slice($worker['specialties_list'], 0, 2) as $spec): ?>
                                                <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-medium">
                                                    <?php echo htmlspecialchars($spec); ?>
                                                </span>
                                            <?php endforeach; ?>
                                            <?php if (count($worker['specialties_list']) > 2): ?>
                                                <span class="px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-lg text-[10px]">
                                                    +<?php echo count($worker['specialties_list']) - 2; ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <!-- Footer: Rates & Actions -->
                                <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <div>
                                        <div class="text-[10px] text-slate-500 uppercase font-bold">Tarifa Base</div>
                                        <div class="font-extrabold text-slate-900 text-sm">
                                            <?php echo formatCOP($worker['hourlyRate']); ?><span class="text-[10px] font-normal text-slate-500">/h</span>
                                        </div>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <button onclick="openWorkerModal('<?php echo $worker['id']; ?>')" class="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs">
                                            Ver Perfil
                                        </button>
                                        <button onclick="openBookingModal('<?php echo $worker['id']; ?>', '<?php echo htmlspecialchars(addslashes($worker['name'])); ?>', '<?php echo htmlspecialchars(addslashes($worker['trade'])); ?>', '<?php echo $worker['hourlyRate']; ?>', '<?php echo htmlspecialchars(addslashes($worker['avatar_url'])); ?>', '<?php echo htmlspecialchars($worker['phone']); ?>')" class="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1">
                                            <span>Contratar</span>
                                            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Trust Pillars in Explorar -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                <div class="text-center max-w-xl mx-auto space-y-1">
                    <h4 class="font-heading font-extrabold text-base text-slate-900">¿Por qué confiar en Échele Camello?</h4>
                    <p class="text-xs text-slate-500">Conectamos hogares y empresas con mano de obra técnica formal y verificada.</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div class="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
                        <div class="p-2 rounded-xl bg-teal-100 text-teal-800"><i data-lucide="badge-check" class="w-5 h-5"></i></div>
                        <div>
                            <div class="font-bold text-slate-900">Verificación con el SENA</div>
                            <div class="text-slate-500 mt-0.5">Validación de cédulas, antecedentes de policía y certificaciones técnicas colombianas.</div>
                        </div>
                    </div>
                    <div class="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-3">
                        <div class="p-2 rounded-xl bg-amber-100 text-amber-800"><i data-lucide="coins" class="w-5 h-5"></i></div>
                        <div>
                            <div class="font-bold text-slate-900">Tarifas Justas y Claras</div>
                            <div class="text-slate-500 mt-0.5">Precios transparentes en COP para proteger tanto al cliente como al trabajador.</div>
                        </div>
                    </div>
                    <div class="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
                        <div class="p-2 rounded-xl bg-indigo-100 text-indigo-800"><i data-lucide="shield" class="w-5 h-5"></i></div>
                        <div>
                            <div class="font-bold text-slate-900">Garantía de 90 Días</div>
                            <div class="text-slate-500 mt-0.5">Soporte y acompañamiento ante cualquier inconformidad en el trabajo realizado.</div>
                        </div>
                    </div>
                </div>
            </div>

        <?php elseif ($activeTab === 'solicitudes'): ?>
            <!-- ========================================== -->
            <!-- TAB: MIS SOLICITUDES / TRABAJOS           -->
            <!-- ========================================== -->

            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 class="font-heading font-extrabold text-2xl text-slate-900">
                            <?php echo $activeRole === 'trabajador' ? 'Mis Trabajos Asignados' : 'Mis Solicitudes de Camello'; ?>
                        </h2>
                        <p class="text-xs text-slate-500 mt-0.5">
                            Historial completo sincronizado en tiempo real con MySQL en XAMPP.
                        </p>
                    </div>

                    <!-- Filter status pills -->
                    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        <?php
                        $statuses = ['TODAS', 'ACTIVAS', 'PENDIENTE', 'ACEPTADA', 'COMPLETADA', 'RECHAZADA', 'CANCELADA'];
                        foreach ($statuses as $st):
                            $active = ($requestStatusFilter === $st);
                            $urlSt = "index.php?tab=solicitudes&role={$activeRole}&req_status={$st}";
                            if (!empty($reqSearch)) $urlSt .= "&req_q=" . urlencode($reqSearch);
                            if ($reqCategory !== 'TODAS') $urlSt .= "&req_cat=" . urlencode($reqCategory);
                            if ($reqNeighborhood !== 'TODOS') $urlSt .= "&req_barrio=" . urlencode($reqNeighborhood);
                            if ($reqSort !== 'recientes') $urlSt .= "&req_sort=" . urlencode($reqSort);
                        ?>
                            <a href="<?php echo $urlSt; ?>" class="px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 <?php echo $active ? 'bg-teal-800 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'; ?>">
                                <?php echo ucfirst(strtolower($st)); ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Advanced Search & Filter Bar for All Jobs -->
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <form action="index.php" method="GET" class="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                        <input type="hidden" name="tab" value="solicitudes">
                        <input type="hidden" name="role" value="<?php echo $activeRole; ?>">
                        <input type="hidden" name="req_status" value="<?php echo htmlspecialchars($requestStatusFilter); ?>">

                        <!-- Search Input -->
                        <div class="md:col-span-5 relative flex items-center">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"></i>
                            <input type="text" name="req_q" id="req-search-input" value="<?php echo htmlspecialchars($reqSearch); ?>" placeholder="Buscar por cliente, camellador, descripción, dirección o código..." class="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-teal-700 rounded-xl text-slate-900 placeholder:text-slate-400 outline-hidden font-medium">
                            <?php if (!empty($reqSearch)): ?>
                                <a href="index.php?tab=solicitudes&role=<?php echo $activeRole; ?>&req_status=<?php echo $requestStatusFilter; ?>" class="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full" title="Limpiar búsqueda">
                                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                                </a>
                            <?php endif; ?>
                        </div>

                        <!-- Filter by Category -->
                        <div class="md:col-span-3">
                            <select name="req_cat" onchange="this.form.submit()" class="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-teal-600">
                                <option value="TODAS">Categoría: Todas</option>
                                <?php foreach ($categories as $c): ?>
                                    <option value="<?php echo htmlspecialchars($c['name']); ?>" <?php echo $reqCategory === $c['name'] ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($c['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <!-- Filter by Neighborhood -->
                        <div class="md:col-span-2">
                            <select name="req_barrio" onchange="this.form.submit()" class="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-teal-600">
                                <option value="TODOS" <?php echo $reqNeighborhood === 'TODOS' ? 'selected' : ''; ?>>Barrio: Todos</option>
                                <option value="Chapinero" <?php echo $reqNeighborhood === 'Chapinero' ? 'selected' : ''; ?>>Chapinero</option>
                                <option value="Teusaquillo" <?php echo $reqNeighborhood === 'Teusaquillo' ? 'selected' : ''; ?>>Teusaquillo</option>
                                <option value="Usaquén" <?php echo $reqNeighborhood === 'Usaquén' ? 'selected' : ''; ?>>Usaquén</option>
                                <option value="Chicó Norte" <?php echo $reqNeighborhood === 'Chicó Norte' ? 'selected' : ''; ?>>Chicó Norte</option>
                                <option value="Cedritos" <?php echo $reqNeighborhood === 'Cedritos' ? 'selected' : ''; ?>>Cedritos</option>
                            </select>
                        </div>

                        <!-- Sort By -->
                        <div class="md:col-span-2">
                            <select name="req_sort" onchange="this.form.submit()" class="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-teal-600">
                                <option value="recientes" <?php echo $reqSort === 'recientes' ? 'selected' : ''; ?>>Más recientes</option>
                                <option value="antiguos" <?php echo $reqSort === 'antiguos' ? 'selected' : ''; ?>>Más antiguos</option>
                                <option value="precio_mayor" <?php echo $reqSort === 'precio_mayor' ? 'selected' : ''; ?>>Mayor costo</option>
                                <option value="precio_menor" <?php echo $reqSort === 'precio_menor' ? 'selected' : ''; ?>>Menor costo</option>
                            </select>
                        </div>
                    </form>

                    <!-- Summary & Quick Reset -->
                    <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <div class="text-slate-500 font-medium">
                            Mostrando <strong class="text-slate-900 font-bold"><?php echo count($serviceRequests); ?></strong> de <?php echo $totalRequestsCount; ?> trabajos
                            <?php if (!empty($reqSearch)): ?>
                                <span class="ml-1 text-teal-800">
                                    para "<span class="italic font-bold"><?php echo htmlspecialchars($reqSearch); ?></span>"
                                </span>
                            <?php endif; ?>
                        </div>

                        <?php if (!empty($reqSearch) || $reqCategory !== 'TODAS' || $reqNeighborhood !== 'TODOS' || $requestStatusFilter !== 'TODAS' || $reqSort !== 'recientes'): ?>
                            <a href="index.php?tab=solicitudes&role=<?php echo $activeRole; ?>" class="text-teal-800 hover:text-teal-900 font-bold flex items-center gap-1 transition-colors">
                                <i data-lucide="rotate-ccw" class="w-3 h-3"></i>
                                <span>Restablecer filtros</span>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>

                <?php if (empty($serviceRequests)): ?>
                    <div class="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                            <i data-lucide="inbox" class="w-6 h-6"></i>
                        </div>
                        <h4 class="font-bold text-sm text-slate-900">No hay solicitudes en esta sección</h4>
                        <p class="text-xs text-slate-500">Puedes crear una nueva solicitud desde la pestaña Explorar Oficios.</p>
                        <a href="index.php?tab=explorar&role=<?php echo $activeRole; ?>" class="inline-block px-4 py-2 bg-amber-500 text-slate-900 rounded-xl text-xs font-bold">Explorar Camelladores</a>
                    </div>
                <?php else: ?>
                    <div class="space-y-4">
                        <?php foreach ($serviceRequests as $req): 
                            $statusColors = [
                                'PENDIENTE' => 'bg-amber-100 text-amber-900 border-amber-200',
                                'ACEPTADA' => 'bg-blue-100 text-blue-900 border-blue-200',
                                'COMPLETADA' => 'bg-emerald-100 text-emerald-900 border-emerald-200',
                                'RECHAZADA' => 'bg-rose-100 text-rose-900 border-rose-200',
                                'CANCELADA' => 'bg-slate-100 text-slate-700 border-slate-200',
                            ];
                            $badgeClass = $statusColors[$req['status']] ?? 'bg-slate-100 text-slate-700 border-slate-200';
                        ?>
                            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                    <div class="flex items-center gap-3">
                                        <img src="<?php echo htmlspecialchars($req['workerAvatar_url']); ?>" alt="<?php echo htmlspecialchars($req['workerName']); ?>" class="w-11 h-11 rounded-xl object-cover border border-slate-200">
                                        <div>
                                            <div class="flex items-center gap-2">
                                                <h4 class="font-bold text-sm text-slate-900">
                                                    <?php echo $activeRole === 'trabajador' ? htmlspecialchars($req['clientName']) : htmlspecialchars($req['workerName']); ?>
                                                </h4>
                                                <span class="text-[10px] font-mono text-slate-400">#<?php echo htmlspecialchars($req['id']); ?></span>
                                            </div>
                                            <div class="text-xs text-slate-500">
                                                <?php echo htmlspecialchars($req['categoryName']); ?> · <strong><?php echo htmlspecialchars($req['date']); ?> (<?php echo htmlspecialchars($req['timeSlot']); ?>)</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex items-center gap-2 self-start sm:self-center">
                                        <span class="px-2.5 py-1 rounded-full text-xs font-bold border <?php echo $badgeClass; ?>">
                                            ● <?php echo htmlspecialchars($req['status']); ?>
                                        </span>
                                    </div>
                                </div>

                                <!-- Body description -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div class="md:col-span-2 space-y-1">
                                        <span class="font-bold text-slate-700">Detalle del trabajo solicitado:</span>
                                        <p class="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <?php echo htmlspecialchars($req['description']); ?>
                                        </p>
                                        <?php if (!empty($req['rejectionReason'])): ?>
                                            <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] mt-2">
                                                <strong>Motivo de rechazo:</strong> <?php echo htmlspecialchars($req['rejectionReason']); ?>
                                            </div>
                                        <?php endif; ?>
                                        <?php if (!empty($req['cancellationReason'])): ?>
                                            <div class="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] mt-2">
                                                <strong>Motivo de cancelación:</strong> <?php echo htmlspecialchars($req['cancellationReason']); ?>
                                            </div>
                                        <?php endif; ?>
                                    </div>

                                    <div class="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                                        <div>
                                            <div class="text-[11px] text-slate-400 font-bold uppercase">Ubicación & Contacto</div>
                                            <div class="text-slate-800 font-bold mt-1"><?php echo htmlspecialchars($req['clientAddress']); ?></div>
                                            <div class="text-slate-500"><?php echo htmlspecialchars($req['neighborhood']); ?></div>
                                            <div class="text-teal-700 font-semibold mt-1">Tel: <?php echo htmlspecialchars($activeRole === 'trabajador' ? $req['clientPhone'] : $req['workerPhone']); ?></div>
                                        </div>

                                        <div class="border-t border-slate-200 pt-2 flex items-center justify-between">
                                            <span class="text-slate-500">Costo Estimado:</span>
                                            <span class="font-extrabold text-slate-900 text-sm"><?php echo formatCOP($req['estimatedCost']); ?></span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Review Display if exists -->
                                <?php if (!empty($req['reviewRating'])): ?>
                                    <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center gap-3">
                                        <div class="text-amber-500 flex items-center gap-1 font-bold">
                                            <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
                                            <span><?php echo $req['reviewRating']; ?>/5</span>
                                        </div>
                                        <div class="text-slate-700 italic">
                                            "<?php echo htmlspecialchars($req['reviewComment']); ?>"
                                        </div>
                                    </div>
                                <?php endif; ?>

                                <!-- Actions Bar -->
                                <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                                    <div class="flex items-center gap-2">
                                        <!-- Open Chat -->
                                        <button onclick="openChatModal('<?php echo $req['id']; ?>', '<?php echo htmlspecialchars(addslashes($activeRole === 'trabajador' ? $req['clientName'] : $req['workerName'])); ?>', '<?php echo $activeRole; ?>')" class="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                                            <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                                            <span>Chat del Camello</span>
                                        </button>

                                        <!-- Report issue -->
                                        <button onclick="openReportModal('<?php echo $req['id']; ?>', '<?php echo htmlspecialchars(addslashes($activeRole === 'trabajador' ? $req['clientName'] : $req['workerName'])); ?>')" class="px-3 py-1.5 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1">
                                            <i data-lucide="flag" class="w-3.5 h-3.5"></i>
                                            <span>Reportar</span>
                                        </button>
                                    </div>

                                    <!-- Status change actions -->
                                    <div class="flex items-center gap-2">
                                        <?php if ($activeRole === 'trabajador'): ?>
                                            <?php if ($req['status'] === 'PENDIENTE'): ?>
                                                <form action="actions.php" method="POST" class="inline">
                                                    <input type="hidden" name="action" value="update_request_status">
                                                    <input type="hidden" name="requestId" value="<?php echo $req['id']; ?>">
                                                    <input type="hidden" name="status" value="ACEPTADA">
                                                    <button type="submit" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs">
                                                        Aceptar Solicitud
                                                    </button>
                                                </form>

                                                <button onclick="promptStatusChange('<?php echo $req['id']; ?>', 'RECHAZADA', 'Indica el motivo por el cual rechazas esta solicitud:')" class="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                                                    Rechazar
                                                </button>
                                            <?php elseif ($req['status'] === 'ACEPTADA'): ?>
                                                <form action="actions.php" method="POST" class="inline">
                                                    <input type="hidden" name="action" value="update_request_status">
                                                    <input type="hidden" name="requestId" value="<?php echo $req['id']; ?>">
                                                    <input type="hidden" name="status" value="COMPLETADA">
                                                    <button type="submit" class="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs">
                                                        Marcar como Completado
                                                    </button>
                                                </form>
                                            <?php endif; ?>
                                        <?php else: ?>
                                            <!-- Cliente Actions -->
                                            <?php if ($req['status'] === 'PENDIENTE'): ?>
                                                <button onclick="promptStatusChange('<?php echo $req['id']; ?>', 'CANCELADA', '¿Por qué deseas cancelar la solicitud?')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold">
                                                    Cancelar Solicitud
                                                </button>
                                            <?php elseif ($req['status'] === 'COMPLETADA' && empty($req['reviewRating'])): ?>
                                                <button onclick="openRatingModal('<?php echo $req['id']; ?>', '<?php echo htmlspecialchars(addslashes($req['workerName'])); ?>')" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1">
                                                    <i data-lucide="star" class="w-3.5 h-3.5 fill-slate-900"></i>
                                                    <span>Calificar Servicio</span>
                                                </button>
                                            <?php endif; ?>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

        <?php elseif ($activeTab === 'panel-trabajador'): ?>
            <!-- ========================================== -->
            <!-- TAB: MI PERFIL & DOCS (TRABAJADOR)        -->
            <!-- ========================================== -->

            <div class="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 class="font-heading font-extrabold text-2xl text-slate-900">Panel de Camellador: <?php echo htmlspecialchars($currentWorker['name']); ?></h2>
                    <p class="text-xs text-slate-500 mt-0.5">Administra tu perfil laboral, disponibilidad y certificaciones técnicas validadas con el SENA.</p>
                </div>

                <!-- Profile Summary & Rate Form -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div class="flex items-center gap-4">
                            <img src="<?php echo htmlspecialchars($currentWorker['avatar_url']); ?>" alt="<?php echo htmlspecialchars($currentWorker['name']); ?>" class="w-16 h-16 rounded-2xl object-cover border border-slate-200">
                            <div>
                                <h3 class="font-bold text-base text-slate-900"><?php echo htmlspecialchars($currentWorker['name']); ?></h3>
                                <p class="text-xs text-teal-800 font-semibold"><?php echo htmlspecialchars($currentWorker['trade']); ?></p>
                                <div class="text-[11px] text-slate-400 mt-0.5"><?php echo htmlspecialchars($currentWorker['neighborhood']); ?> · <?php echo $currentWorker['experienceYears']; ?> años de experiencia</div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="px-3 py-1.5 rounded-full text-xs font-bold <?php echo $currentWorker['isAvailableToday'] ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'; ?>">
                                ● <?php echo $currentWorker['isAvailableToday'] ? 'Disponible Hoy' : 'No disponible hoy'; ?>
                            </span>
                        </div>
                    </div>

                    <!-- Update Profile Form -->
                    <form action="actions.php" method="POST" class="space-y-4">
                        <input type="hidden" name="action" value="update_worker_profile">
                        <input type="hidden" name="workerId" value="<?php echo $currentWorker['id']; ?>">

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label class="font-bold text-slate-700 block mb-1">Tarifa por Hora (COP):</label>
                                <input type="number" name="hourlyRate" value="<?php echo $currentWorker['hourlyRate']; ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-teal-600">
                            </div>

                            <div>
                                <label class="font-bold text-slate-700 block mb-1">Tarifa Base por Visita / Diagnóstico (COP):</label>
                                <input type="number" name="baseServiceRate" value="<?php echo $currentWorker['baseServiceRate']; ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-teal-600">
                            </div>
                        </div>

                        <div class="text-xs">
                            <label class="font-bold text-slate-700 block mb-1">Descripción de tu perfil y garantía:</label>
                            <textarea name="bio" rows="3" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600"><?php echo htmlspecialchars($currentWorker['bio']); ?></textarea>
                        </div>

                        <div class="flex items-center justify-between pt-2">
                            <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                <input type="checkbox" name="isAvailableToday" value="1" <?php echo $currentWorker['isAvailableToday'] ? 'checked' : ''; ?> class="w-4 h-4 rounded text-teal-800 focus:ring-teal-700">
                                <span>Marcarme disponible para solicitudes hoy</span>
                            </label>

                            <button type="submit" class="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs">
                                Guardar Cambios en MySQL
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Verified Documents Section -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="font-heading font-extrabold text-lg text-slate-900">Documentos de Verificación & Antecedentes</h3>
                            <p class="text-xs text-slate-500">Los documentos son revisados por el equipo administrativo antes de otorgar el sello de verificación oficial.</p>
                        </div>
                    </div>

                    <!-- Upload Form -->
                    <form action="actions.php" method="POST" class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                        <input type="hidden" name="action" value="upload_document">
                        <input type="hidden" name="workerId" value="<?php echo $currentWorker['id']; ?>">
                        
                        <div class="font-bold text-slate-800">Subir Nuevo Documento o Certificado:</div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-slate-600 mb-1">Tipo:</label>
                                <select name="type" class="w-full bg-white border border-slate-200 rounded-xl p-2 font-semibold text-slate-800">
                                    <option value="cedula">Cédula de Ciudadanía</option>
                                    <option value="antecedentes">Antecedentes Judiciales Policía</option>
                                    <option value="certificacion_tecnica">Certificado Técnico SENA / CONTE</option>
                                    <option value="rut">RUT DIAN</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-slate-600 mb-1">Título del Documento:</label>
                                <input type="text" name="title" placeholder="ej. Tarjeta CONTE / Certificado SENA" required class="w-full bg-white border border-slate-200 rounded-xl p-2 font-semibold text-slate-800">
                            </div>

                            <div>
                                <label class="block text-slate-600 mb-1">Nombre de Archivo PDF:</label>
                                <input type="text" name="fileName" placeholder="ej. Certificado_SENA_2026.pdf" required class="w-full bg-white border border-slate-200 rounded-xl p-2 font-semibold text-slate-800">
                            </div>
                        </div>

                        <div class="flex justify-end pt-1">
                            <button type="submit" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-xs">
                                Cargar Documento
                            </button>
                        </div>
                    </form>

                    <!-- Document list -->
                    <div class="space-y-2.5">
                        <?php foreach ($currentWorker['documents'] as $doc): 
                            $docBadge = $doc['status'] === 'VERIFICADO' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ($doc['status'] === 'RECHAZADO' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200');
                        ?>
                            <div class="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 rounded-lg bg-slate-100 text-slate-600">
                                        <i data-lucide="file-text" class="w-4 h-4"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-slate-900"><?php echo htmlspecialchars($doc['title']); ?></div>
                                        <div class="text-[11px] text-slate-400"><?php echo htmlspecialchars($doc['fileName']); ?> · Subido el <?php echo htmlspecialchars($doc['uploadDate']); ?></div>
                                    </div>
                                </div>

                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border <?php echo $docBadge; ?>">
                                        <?php echo htmlspecialchars($doc['status']); ?>
                                    </span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

        <?php elseif ($activeTab === 'admin'): ?>
            <!-- ========================================== -->
            <!-- TAB: PANEL ADMINISTRADOR                  -->
            <!-- ========================================== -->

            <div class="space-y-8">
                <div>
                    <h2 class="font-heading font-extrabold text-2xl text-slate-900">Panel de Control del Administrador</h2>
                    <p class="text-xs text-slate-500 mt-0.5">Auditoría y validación de documentos oficiales y gestión de quejas de usuarios.</p>
                </div>

                <!-- Section 1: Worker Documents Audit -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                            <i data-lucide="shield-check" class="w-5 h-5 text-purple-700"></i>
                            <span>Auditoría de Documentos Técnicos y Judiciales</span>
                        </h3>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                                    <th class="p-3">Trabajador</th>
                                    <th class="p-3">Oficio</th>
                                    <th class="p-3">Documento</th>
                                    <th class="p-3">Archivo</th>
                                    <th class="p-3">Estado</th>
                                    <th class="p-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <?php
                                $allDocsStmt = $pdo->query("
                                    SELECT wd.*, w.name as workerName, w.trade as workerTrade 
                                    FROM worker_documents wd
                                    JOIN workers w ON wd.workerId = w.id
                                    ORDER BY wd.status = 'PENDIENTE_DE_VERIFICACION' DESC, wd.uploadDate DESC
                                ");
                                $allDocs = $allDocsStmt->fetchAll();

                                foreach ($allDocs as $doc):
                                    $stBadge = $doc['status'] === 'VERIFICADO' ? 'bg-emerald-100 text-emerald-800' : ($doc['status'] === 'RECHAZADO' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800');
                                ?>
                                    <tr class="hover:bg-slate-50/80 transition-colors">
                                        <td class="p-3 font-bold text-slate-900"><?php echo htmlspecialchars($doc['workerName']); ?></td>
                                        <td class="p-3 text-slate-500"><?php echo htmlspecialchars($doc['workerTrade']); ?></td>
                                        <td class="p-3 font-semibold text-slate-800"><?php echo htmlspecialchars($doc['title']); ?></td>
                                        <td class="p-3 text-slate-400 font-mono text-[11px]"><?php echo htmlspecialchars($doc['fileName']); ?></td>
                                        <td class="p-3">
                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold <?php echo $stBadge; ?>">
                                                <?php echo htmlspecialchars($doc['status']); ?>
                                            </span>
                                        </td>
                                        <td class="p-3 text-right">
                                            <?php if ($doc['status'] !== 'VERIFICADO'): ?>
                                                <form action="actions.php" method="POST" class="inline">
                                                    <input type="hidden" name="action" value="update_document_status">
                                                    <input type="hidden" name="documentId" value="<?php echo $doc['id']; ?>">
                                                    <input type="hidden" name="workerId" value="<?php echo $doc['workerId']; ?>">
                                                    <input type="hidden" name="status" value="VERIFICADO">
                                                    <button type="submit" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-2xs">
                                                        Aprobar
                                                    </button>
                                                </form>
                                            <?php endif; ?>

                                            <?php if ($doc['status'] !== 'RECHAZADO'): ?>
                                                <form action="actions.php" method="POST" class="inline ml-1">
                                                    <input type="hidden" name="action" value="update_document_status">
                                                    <input type="hidden" name="documentId" value="<?php echo $doc['id']; ?>">
                                                    <input type="hidden" name="workerId" value="<?php echo $doc['workerId']; ?>">
                                                    <input type="hidden" name="status" value="RECHAZADO">
                                                    <input type="hidden" name="reason" value="El documento no es legible o presenta inconsistencias">
                                                    <button type="submit" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px]">
                                                        Rechazar
                                                    </button>
                                                </form>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Section 2: Security & Incident Reports -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <h3 class="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600"></i>
                        <span>Reportes de Incidentes y Quejas</span>
                    </h3>

                    <div class="space-y-3">
                        <?php foreach ($reports as $rep): ?>
                            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                                <div class="flex items-center justify-between">
                                    <div class="font-bold text-slate-900">
                                        Reportado por <?php echo htmlspecialchars($rep['reporterName']); ?> contra <strong><?php echo htmlspecialchars($rep['reportedName']); ?></strong>
                                    </div>
                                    <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] <?php echo $rep['status'] === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'; ?>">
                                        <?php echo htmlspecialchars($rep['status']); ?>
                                    </span>
                                </div>
                                <div class="text-rose-700 font-semibold"><?php echo htmlspecialchars($rep['reason']); ?></div>
                                <p class="text-slate-600"><?php echo htmlspecialchars($rep['description']); ?></p>
                                <div class="flex items-center justify-between pt-2 border-t border-slate-200">
                                    <span class="text-[11px] text-slate-400"><?php echo htmlspecialchars($rep['createdAt']); ?></span>
                                    
                                    <?php if ($rep['status'] === 'PENDIENTE'): ?>
                                        <form action="actions.php" method="POST" class="inline">
                                            <input type="hidden" name="action" value="resolve_report">
                                            <input type="hidden" name="reportId" value="<?php echo $rep['id']; ?>">
                                            <input type="hidden" name="status" value="RESUELTO">
                                            <button type="submit" class="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shadow-2xs">
                                                Marcar como Resuelto
                                            </button>
                                        </form>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

        <?php elseif ($activeTab === 'seguridad'): ?>
            <!-- ========================================== -->
            <!-- TAB: GARANTÍA Y SEGURIDAD                  -->
            <!-- ========================================== -->

            <div class="max-w-4xl mx-auto space-y-8">
                <div class="text-center space-y-2">
                    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                        <i data-lucide="shield-check" class="w-4 h-4"></i> Protocolo de Seguridad Échele Camello
                    </div>
                    <h2 class="font-heading font-extrabold text-3xl text-slate-900">Tu tranquilidad y seguridad son nuestra prioridad</h2>
                    <p class="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">Conoce los filtros de verificación técnica y legal que aplicamos a cada maestro antes de autorizar su ingreso a hogares y empresas.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                        <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                            <i data-lucide="user-check" class="w-6 h-6"></i>
                        </div>
                        <h4 class="font-bold text-base text-slate-900">1. Identidad y Antecedentes</h4>
                        <p class="text-xs text-slate-600 leading-relaxed">
                            Cruce obligatorio de cédula de ciudadanía con la Policía Nacional de Colombia y Procuraduría. Cero antecedentes judiciales vigentes.
                        </p>
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                            <i data-lucide="award" class="w-6 h-6"></i>
                        </div>
                        <h4 class="font-bold text-base text-slate-900">2. Certificaciones SENA / CONTE</h4>
                        <p class="text-xs text-slate-600 leading-relaxed">
                            Verificación de competencias laborales certificadas, matrículas de técnicos electricistas (CONTE) y títulos hidrosanitarios del SENA.
                        </p>
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
                        <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                            <i data-lucide="shield-alert" class="w-6 h-6"></i>
                        </div>
                        <h4 class="font-bold text-base text-slate-900">3. Garantía Escrita 90 Días</h4>
                        <p class="text-xs text-slate-600 leading-relaxed">
                            Si un arreglo falla o presenta fugas dentro del periodo de garantía, el maestro regresa sin costo adicional o asignamos otro especialista.
                        </p>
                    </div>
                </div>
            </div>

        <?php endif; ?>

    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2">
                <span class="font-heading font-extrabold text-slate-900 text-sm">Échele Camello 🐪</span>
                <span>· Conectando talento local verificado con hogares en Colombia</span>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="openXamppModal()" class="text-teal-800 font-bold hover:underline">Base de Datos MySQL (XAMPP)</button>
                <span>·</span>
                <a href="http://localhost/phpmyadmin/index.php?route=/database/structure&db=echele_camello" target="_blank" class="text-slate-600 hover:text-slate-900">phpMyAdmin</a>
            </div>
        </div>
    </footer>

    <!-- ======================================================== -->
    <!-- MODALS SECTION                                           -->
    <!-- ======================================================== -->

    <!-- 1. Modal: Detalle del Camellador -->
    <div id="modal-worker" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 relative">
            <button onclick="closeModal('modal-worker')" class="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div id="modal-worker-content" class="space-y-4">
                <!-- Loaded dynamically via JavaScript -->
            </div>
        </div>
    </div>

    <!-- 2. Modal: Agendar / Contratar Camellador -->
    <div id="modal-booking" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 relative">
            <button onclick="closeModal('modal-booking')" class="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            
            <div class="space-y-1">
                <h3 class="font-heading font-extrabold text-xl text-slate-900">Solicitar Camello</h3>
                <p class="text-xs text-slate-500">Completa tus datos para coordinar la visita técnica del especialista.</p>
            </div>

            <!-- Worker Header Preview -->
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <img id="book-worker-avatar" src="" class="w-12 h-12 rounded-xl object-cover border border-slate-200">
                <div>
                    <h4 id="book-worker-name" class="font-bold text-sm text-slate-900"></h4>
                    <p id="book-worker-trade" class="text-xs text-teal-800 font-semibold"></p>
                </div>
            </div>

            <form action="actions.php" method="POST" class="space-y-3.5 text-xs">
                <input type="hidden" name="action" value="create_request">
                <input type="hidden" id="book-workerId" name="workerId" value="">
                <input type="hidden" id="book-workerName-input" name="workerName" value="">
                <input type="hidden" id="book-workerTrade-input" name="workerTrade" value="">
                <input type="hidden" id="book-workerAvatar-input" name="workerAvatar" value="">
                <input type="hidden" id="book-workerPhone-input" name="workerPhone" value="">

                <div>
                    <label class="font-bold text-slate-700 block mb-1">Tu Nombre Completo:</label>
                    <input type="text" name="clientName" value="Carlos Mendoza" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600 font-semibold">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="font-bold text-slate-700 block mb-1">Teléfono de Contacto:</label>
                        <input type="text" name="clientPhone" value="+57 310 908 1234" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600 font-semibold">
                    </div>
                    <div>
                        <label class="font-bold text-slate-700 block mb-1">Barrio:</label>
                        <select name="neighborhood" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600 font-semibold">
                            <option value="Chapinero, Bogotá">Chapinero, Bogotá</option>
                            <option value="Teusaquillo, Bogotá">Teusaquillo, Bogotá</option>
                            <option value="Usaquén, Bogotá">Usaquén, Bogotá</option>
                            <option value="Chicó Norte, Bogotá">Chicó Norte, Bogotá</option>
                            <option value="Cedritos, Bogotá">Cedritos, Bogotá</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="font-bold text-slate-700 block mb-1">Dirección Exacta (Casa / Apto):</label>
                    <input type="text" name="clientAddress" value="Calle 67 # 8-32, Apto 402" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600 font-semibold">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="font-bold text-slate-700 block mb-1">Fecha Preferida:</label>
                        <input type="date" name="date" value="<?php echo date('Y-m-d', strtotime('+1 day')); ?>" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600 font-semibold">
                    </div>
                    <div>
                        <label class="font-bold text-slate-700 block mb-1">Franja Horaria:</label>
                        <select name="timeSlot" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600 font-semibold">
                            <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                            <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                            <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                            <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="font-bold text-slate-700 block mb-1">Describe lo que necesitas arreglar:</label>
                    <textarea name="description" rows="3" placeholder="ej. Fuga de agua en el lavamanos principal que gotea sobre el mueble de madera..." required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600 font-semibold"></textarea>
                </div>

                <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <span class="text-slate-600 font-medium">Tarifa base estimada:</span>
                    <span id="book-estimated-cost" class="font-extrabold text-slate-900 text-sm"></span>
                    <input type="hidden" id="book-estimated-cost-input" name="estimatedCost" value="">
                </div>

                <button type="submit" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold text-sm shadow-xs transition-colors">
                    Confirmar y Guardar Solicitud en MySQL
                </button>
            </form>
        </div>
    </div>

    <!-- 3. Modal: Chat en Vivo -->
    <div id="modal-chat" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full h-[600px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
            <div class="p-4 bg-teal-800 text-white flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i data-lucide="message-square" class="w-4 h-4"></i></div>
                    <div>
                        <h4 id="chat-counterpart-name" class="font-bold text-sm"></h4>
                        <p class="text-[10px] text-teal-200">Chat en vivo · Guardado en base de datos</p>
                    </div>
                </div>
                <button onclick="closeModal('modal-chat')" class="p-1 text-white hover:bg-white/20 rounded-full"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>

            <!-- Messages Stream -->
            <div id="chat-messages-container" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                <!-- Loaded dynamically -->
            </div>

            <!-- Input Box -->
            <form id="chat-form" onsubmit="submitChatMessage(event)" class="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input type="hidden" id="chat-requestId" value="">
                <input type="hidden" id="chat-senderRole" value="">
                <input type="text" id="chat-input-text" placeholder="Escribe un mensaje al camellador..." required class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-teal-600">
                <button type="submit" class="p-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs"><i data-lucide="send" class="w-4 h-4"></i></button>
            </form>
        </div>
    </div>

    <!-- 4. Modal: Calificar Servicio -->
    <div id="modal-rating" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative">
            <button onclick="closeModal('modal-rating')" class="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:bg-slate-100"><i data-lucide="x" class="w-5 h-5"></i></button>
            <h3 class="font-heading font-extrabold text-xl text-slate-900">Calificar Servicio</h3>
            <p id="rating-worker-text" class="text-xs text-slate-500"></p>

            <form action="actions.php" method="POST" class="space-y-4 text-xs">
                <input type="hidden" name="action" value="submit_review">
                <input type="hidden" id="rating-requestId" name="requestId" value="">

                <div>
                    <label class="font-bold text-slate-700 block mb-1">Estrellas:</label>
                    <select name="rating" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                        <option value="5">⭐⭐⭐⭐⭐ 5 Estrellas - Excelente</option>
                        <option value="4">⭐⭐⭐⭐ 4 Estrellas - Muy Bueno</option>
                        <option value="3">⭐⭐⭐ 3 Estrellas - Regular</option>
                        <option value="2">⭐⭐ 2 Estrellas - Malo</option>
                        <option value="1">⭐ 1 Estrella - Pésimo</option>
                    </select>
                </div>

                <div>
                    <label class="font-bold text-slate-700 block mb-1">Comentario sobre la experiencia:</label>
                    <textarea name="comment" rows="3" placeholder="Llegó a tiempo, trajo sus repuestos y dejó todo limpio..." required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600"></textarea>
                </div>

                <button type="submit" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs shadow-xs">
                    Enviar Calificación a MySQL
                </button>
            </form>
        </div>
    </div>

    <!-- 5. Modal: Reportar Problema -->
    <div id="modal-report" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative">
            <button onclick="closeModal('modal-report')" class="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:bg-slate-100"><i data-lucide="x" class="w-5 h-5"></i></button>
            <h3 class="font-heading font-extrabold text-xl text-slate-900">Reportar Problema</h3>
            
            <form action="actions.php" method="POST" class="space-y-3.5 text-xs">
                <input type="hidden" name="action" value="create_report">
                <input type="hidden" id="report-requestId" name="requestId" value="">
                <input type="hidden" name="reporterRole" value="<?php echo $activeRole; ?>">
                <input type="hidden" id="report-reportedName" name="reportedName" value="">

                <div>
                    <label class="font-bold text-slate-700 block mb-1">Motivo Principal:</label>
                    <select name="reason" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                        <option value="Incumplimiento de horario acordado">Incumplimiento de horario acordado</option>
                        <option value="Cobro superior al acordado">Cobro superior al acordado</option>
                        <option value="Trabajo inconcluso o defectuoso">Trabajo inconcluso o defectuoso</option>
                        <option value="Comportamiento inadecuado">Comportamiento inadecuado</option>
                        <option value="Otro motivo">Otro motivo</option>
                    </select>
                </div>

                <div>
                    <label class="font-bold text-slate-700 block mb-1">Descripción detallada:</label>
                    <textarea name="description" rows="3" placeholder="Describe lo sucedido..." required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-teal-600"></textarea>
                </div>

                <button type="submit" class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs">
                    Enviar Reporte a Soporte
                </button>
            </form>
        </div>
    </div>

    <!-- 6. Modal: Estado y Diagnóstico XAMPP -->
    <div id="modal-xampp" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 relative">
            <button onclick="closeModal('modal-xampp')" class="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:bg-slate-100"><i data-lucide="x" class="w-5 h-5"></i></button>
            
            <div class="flex items-center gap-3">
                <div class="p-3 rounded-2xl bg-emerald-100 text-emerald-800"><i data-lucide="database" class="w-6 h-6"></i></div>
                <div>
                    <h3 class="font-heading font-extrabold text-xl text-slate-900">Estado de Conexión XAMPP</h3>
                    <p class="text-xs text-emerald-700 font-semibold">Base de datos MySQL activa y sincronizada</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div class="text-slate-400 font-medium">Servidor Web</div>
                    <div class="font-bold text-slate-900 text-sm mt-0.5">Apache (XAMPP)</div>
                    <div class="text-slate-500">Puerto 80</div>
                </div>

                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div class="text-slate-400 font-medium">Base de Datos</div>
                    <div class="font-bold text-slate-900 text-sm mt-0.5">MySQL / MariaDB</div>
                    <div class="text-slate-500">Puerto 3306</div>
                </div>

                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl col-span-2">
                    <div class="text-slate-400 font-medium">Nombre de Base de Datos:</div>
                    <div class="font-mono font-bold text-slate-900 text-sm mt-0.5 flex items-center justify-between">
                        <span>echele_camello</span>
                        <span class="text-[10px] font-sans px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold">utf8mb4_unicode_ci</span>
                    </div>
                </div>
            </div>

            <!-- Counts in DB -->
            <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                <div class="font-bold text-slate-700 mb-2">Registros actuales en MySQL:</div>
                <div class="grid grid-cols-4 gap-2 text-center">
                    <div class="p-2 bg-white rounded-xl border border-slate-200">
                        <div class="font-extrabold text-base text-slate-900"><?php echo $dbStats['workers'] ?? 0; ?></div>
                        <div class="text-[10px] text-slate-400">Camelladores</div>
                    </div>
                    <div class="p-2 bg-white rounded-xl border border-slate-200">
                        <div class="font-extrabold text-base text-slate-900"><?php echo $dbStats['requests'] ?? 0; ?></div>
                        <div class="text-[10px] text-slate-400">Solicitudes</div>
                    </div>
                    <div class="p-2 bg-white rounded-xl border border-slate-200">
                        <div class="font-extrabold text-base text-slate-900"><?php echo $dbStats['chats'] ?? 0; ?></div>
                        <div class="text-[10px] text-slate-400">Mensajes</div>
                    </div>
                    <div class="p-2 bg-white rounded-xl border border-slate-200">
                        <div class="font-extrabold text-base text-slate-900"><?php echo $dbStats['categories'] ?? 0; ?></div>
                        <div class="text-[10px] text-slate-400">Categorías</div>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <a href="http://localhost/phpmyadmin/index.php?route=/database/structure&db=echele_camello" target="_blank" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all">
                    <span>Abrir en phpMyAdmin</span>
                    <i data-lucide="external-link" class="w-4 h-4"></i>
                </a>
            </div>
        </div>
    </div>

    <!-- JavaScript Controllers -->
    <script>
        lucide.createIcons();

        function closeModal(id) {
            document.getElementById(id).classList.add('hidden');
        }

        function openXamppModal() {
            document.getElementById('modal-xampp').classList.remove('hidden');
            lucide.createIcons();
        }

        function openBookingModal(id, name, trade, rate, avatar, phone) {
            document.getElementById('book-workerId').value = id;
            document.getElementById('book-workerName-input').value = name;
            document.getElementById('book-workerTrade-input').value = trade;
            document.getElementById('book-workerAvatar-input').value = avatar;
            document.getElementById('book-workerPhone-input').value = phone;

            document.getElementById('book-worker-name').innerText = name;
            document.getElementById('book-worker-trade').innerText = trade;
            document.getElementById('book-worker-avatar').src = avatar;

            const formattedRate = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(rate);
            document.getElementById('book-estimated-cost').innerText = formattedRate;
            document.getElementById('book-estimated-cost-input').value = rate;

            document.getElementById('modal-booking').classList.remove('hidden');
            lucide.createIcons();
        }

        async function openWorkerModal(workerId) {
            const container = document.getElementById('modal-worker-content');
            container.innerHTML = '<div class="text-center py-8 text-slate-400"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-2"></i>Cargando perfil...</div>';
            document.getElementById('modal-worker').classList.remove('hidden');
            lucide.createIcons();

            try {
                const res = await fetch(`actions.php?action=get_worker_json&id=${workerId}`);
                const json = await res.json();
                if (json.success && json.data) {
                    const w = json.data;
                    let docsHtml = '';
                    if (w.documents && w.documents.length) {
                        docsHtml = w.documents.map(d => `
                            <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                <span class="font-bold text-slate-800">${d.title}</span>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${d.status === 'VERIFICADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${d.status}</span>
                            </div>
                        `).join('');
                    } else {
                        docsHtml = '<p class="text-slate-400 text-xs">No tiene documentos registrados.</p>';
                    }

                    let reviewsHtml = '';
                    if (w.reviews && w.reviews.length) {
                        reviewsHtml = w.reviews.map(r => `
                            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-900">${r.clientName}</span>
                                    <span class="text-amber-500 font-bold">⭐ ${r.rating}/5</span>
                                </div>
                                <p class="text-slate-600 italic">"${r.comment}"</p>
                                <span class="text-[10px] text-slate-400">${r.date}</span>
                            </div>
                        `).join('');
                    } else {
                        reviewsHtml = '<p class="text-slate-400 text-xs">Aún no tiene reseñas.</p>';
                    }

                    container.innerHTML = `
                        <div class="flex items-start gap-4">
                            <img src="${w.avatar_url}" class="w-16 h-16 rounded-2xl object-cover border border-slate-200">
                            <div>
                                <h3 class="font-heading font-extrabold text-lg text-slate-900">${w.name}</h3>
                                <p class="text-xs text-teal-800 font-semibold">${w.trade}</p>
                                <div class="text-xs text-slate-500 mt-1">📍 ${w.neighborhood} · ${w.experienceYears} años de experiencia</div>
                            </div>
                        </div>

                        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                            <span class="font-bold text-slate-700 block mb-1">Acerca del trabajador:</span>
                            <p class="text-slate-600">${w.bio}</p>
                        </div>

                        <div class="space-y-2">
                            <h4 class="font-bold text-xs text-slate-800">Documentos Oficiales Verificados:</h4>
                            ${docsHtml}
                        </div>

                        <div class="space-y-2">
                            <h4 class="font-bold text-xs text-slate-800">Reseñas de Clientes (${w.reviewsCount}):</h4>
                            <div class="space-y-2 max-h-48 overflow-y-auto">${reviewsHtml}</div>
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex justify-end">
                            <button onclick="closeModal('modal-worker'); openBookingModal('${w.id}', '${w.name}', '${w.trade}', '${w.hourlyRate}', '${w.avatar_url}', '${w.phone}')" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold shadow-xs">
                                Solicitar Camello
                            </button>
                        </div>
                    `;
                    lucide.createIcons();
                }
            } catch (err) {
                container.innerHTML = '<p class="text-rose-600 text-xs text-center">Error al cargar información del trabajador.</p>';
            }
        }

        async function openChatModal(requestId, counterpartName, currentRole) {
            document.getElementById('chat-counterpart-name').innerText = counterpartName;
            document.getElementById('chat-requestId').value = requestId;
            document.getElementById('chat-senderRole').value = currentRole;
            const container = document.getElementById('chat-messages-container');
            container.innerHTML = '<div class="text-center py-8 text-slate-400">Cargando conversación...</div>';
            document.getElementById('modal-chat').classList.remove('hidden');
            lucide.createIcons();

            await reloadChatMessages(requestId, currentRole);
        }

        async function reloadChatMessages(requestId, currentRole) {
            const container = document.getElementById('chat-messages-container');
            try {
                const res = await fetch(`actions.php?action=get_chat_json&request_id=${requestId}`);
                const json = await res.json();
                if (json.success && json.data) {
                    if (json.data.length === 0) {
                        container.innerHTML = '<p class="text-slate-400 text-center py-6">No hay mensajes aún en este chat. Escribe un saludo para iniciar.</p>';
                    } else {
                        container.innerHTML = json.data.map(m => {
                            const isMe = (m.senderRole === currentRole);
                            return `
                                <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
                                    <div class="max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-teal-800 text-white rounded-br-xs' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'}">
                                        <div class="text-[10px] font-bold ${isMe ? 'text-teal-200' : 'text-slate-500'} mb-0.5">${m.senderName}</div>
                                        <div>${m.text}</div>
                                        <div class="text-[9px] text-right mt-1 ${isMe ? 'text-teal-300' : 'text-slate-400'}">${m.timestamp}</div>
                                    </div>
                                </div>
                            `;
                        }).join('');
                        container.scrollTop = container.scrollHeight;
                    }
                }
            } catch(e) {
                container.innerHTML = '<p class="text-rose-500 text-center">Error al cargar chat.</p>';
            }
        }

        async function submitChatMessage(e) {
            e.preventDefault();
            const input = document.getElementById('chat-input-text');
            const text = input.value.trim();
            if (!text) return;

            const requestId = document.getElementById('chat-requestId').value;
            const senderRole = document.getElementById('chat-senderRole').value;

            input.value = '';
            try {
                const res = await fetch('actions.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({
                        action: 'send_message',
                        requestId: requestId,
                        senderRole: senderRole,
                        text: text
                    })
                });
                await reloadChatMessages(requestId, senderRole);
            } catch(err) {
                alert('No se pudo enviar el mensaje.');
            }
        }

        function openRatingModal(requestId, workerName) {
            document.getElementById('rating-requestId').value = requestId;
            document.getElementById('rating-worker-text').innerText = `Califica el camello realizado por ${workerName}`;
            document.getElementById('modal-rating').classList.remove('hidden');
        }

        function openReportModal(requestId, counterpartName) {
            document.getElementById('report-requestId').value = requestId;
            document.getElementById('report-reportedName').value = counterpartName;
            document.getElementById('modal-report').classList.remove('hidden');
        }

        function promptStatusChange(requestId, newStatus, promptMsg) {
            const reason = prompt(promptMsg);
            if (reason !== null) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'actions.php';

                const a1 = document.createElement('input');
                a1.type = 'hidden'; a1.name = 'action'; a1.value = 'update_request_status';
                form.appendChild(a1);

                const a2 = document.createElement('input');
                a2.type = 'hidden'; a2.name = 'requestId'; a2.value = requestId;
                form.appendChild(a2);

                const a3 = document.createElement('input');
                a3.type = 'hidden'; a3.name = 'status'; a3.value = newStatus;
                form.appendChild(a3);

                const a4 = document.createElement('input');
                a4.type = 'hidden'; a4.name = 'reason'; a4.value = reason;
                form.appendChild(a4);

                document.body.appendChild(form);
                form.submit();
            }
        }
    </script>
</body>
</html>
