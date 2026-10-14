# Conexión Local con XAMPP & Versión PHP - Proyecto Échele Camello

El proyecto **Échele Camello** ya se encuentra completamente sincronizado y conectado de manera local con **XAMPP** (Apache + MySQL/MariaDB + PHP) tanto a nivel de backend como de frontend web nativo en **lenguaje PHP**.

---

## 🌐 Enlaces de Acceso Inmediato en tu Navegador

| Plataforma / Recurso | Enlace Local | Descripción |
| :--- | :--- | :--- |
| **Página Web en PHP (Nombre del Proyecto)** | [http://localhost/Mini-proyecto-Echele-camello/](http://localhost/Mini-proyecto-Echele-camello/) | Aplicación completa en PHP interactiva servida por Apache en XAMPP. |
| **Página Web en PHP (Enlace Corto)** | [http://localhost/echele-camello/](http://localhost/echele-camello/) | Enlace directo equivalente para comodidad. |
| **phpMyAdmin (Gestión de Base de Datos)** | [http://localhost/phpmyadmin/index.php?route=/database/structure&db=echele_camello](http://localhost/phpmyadmin/index.php?route=/database/structure&db=echele_camello) | Panel de control de tablas y registros en MySQL. |
| **API REST en PHP (Health Check)** | [http://localhost/echele-camello-api/index.php?action=health](http://localhost/echele-camello-api/index.php?action=health) | Estado del servidor y conteo de registros en JSON. |

---

## 📌 Configuración de la Base de Datos MySQL

- **Base de datos**: `echele_camello`
- **Puerto**: `3306`
- **Usuario**: `root`
- **Contraseña**: *(vacía por defecto en XAMPP)*
- **Cotejamiento**: `utf8mb4_unicode_ci`
- **Tablas sincronizadas**:
  1. `categories`: Oficios técnicos (Plomería, Electricidad, Pintura, Aseo, Cerrajería, Carpintería).
  2. `workers`: Perfil de camelladores, tarifas en COP, experiencia, verificación oficial y promedio de estrellas.
  3. `worker_documents`: Documentos técnicos (Cédula de ciudadanía, Certificados de Antecedentes de la Policía, Matrícula CONTE y Certificaciones técnicas SENA).
  4. `worker_reviews`: Reseñas y calificaciones otorgadas por clientes.
  5. `service_requests`: Solicitudes de servicio con estados (`PENDIENTE`, `ACEPTADA`, `COMPLETADA`, `RECHAZADA`, `CANCELADA`).
  6. `chat_messages`: Mensajes de chat en tiempo real asociados a cada solicitud.
  7. `reports`: Reportes de incidentes o incumplimientos para el panel administrativo.

---

## 🛠️ Arquitectura de la Aplicación en Lenguaje PHP (`/php/`)

La carpeta `php/` contiene la aplicación nativa en PHP que se ejecuta directamente en XAMPP:

- **`index.php`**: Página principal con interfaz moderna (Tailwind CSS, Lucide Icons, tipografía Google Fonts), con soporte de:
  - **Selector de Roles**: Modo **Cliente**, Modo **Trabajador** y Modo **Admin**.
  - **Explorador de Oficios**: Búsqueda por palabras clave, filtro por barrio (Chapinero, Usaquén, Teusaquillo, etc.) y ordenamiento por calificación, distancia o tarifa.
  - **Modal de Detalle del Camellador**: Experiencia, biografía, documentos oficiales verificados y reseñas de clientes.
  - **Modal de Contratación**: Agendamiento con fecha, franja horaria, dirección y descripción del arreglo.
  - **Mis Solicitudes / Mis Trabajos**: Historial con filtros por estado (`Pendientes`, `Aceptadas`, `Completadas`, etc.).
  - **Chat en Vivo**: Mensajería entre cliente y trabajador guardada directamente en MySQL.
  - **Calificación con Estrellas**: 1 a 5 estrellas y comentarios con recálculo automático del promedio del camellador.
  - **Mi Perfil & Documentos (Trabajador)**: Edición de tarifas en COP, disponibilidad hoy y subida de certificados.
  - **Panel Administrador (Admin)**: Aprobación/Rechazo de documentos con motivo y resolución de reportes de seguridad.
  - **Modal de Estado XAMPP**: Muestra en tiempo real la conexión con Apache y MySQL, tablas y botón directo a phpMyAdmin.
- **`db.php`**: Conexión PDO a MySQL con control de errores y codificación UTF-8.
- **`functions.php`**: Funciones auxiliares de consulta y formato de moneda en COP.
- **`actions.php`**: Controlador de formularios y peticiones AJAX para inserción y actualización en la base de datos.
- **`assets/images/`**: Fotografías de camelladores y banners publicitarios.

---

## 🚀 Cómo Usar y Probar el Proyecto

1. **Asegúrate de que Apache y MySQL estén activos**:
   - Abre el **XAMPP Control Panel**.
   - Verifica que los botones de **Apache** y **MySQL** estén en verde (**Running**).

2. **Abre el proyecto en tu navegador**:
   - Ingresa a: **[http://localhost/Mini-proyecto-Echele-camello/](http://localhost/Mini-proyecto-Echele-camello/)** (o [http://localhost/echele-camello/](http://localhost/echele-camello/)).

3. **Prueba las interacciones**:
   - **Crear una solicitud**: Selecciona un camellador en la pestaña *Explorar Oficios*, haz clic en *Contratar*, llena los datos y confirma. Verás la solicitud creada en la pestaña *Mis Solicitudes* y guardada en MySQL.
   - **Probar el Chat**: En la solicitud, abre el botón *Chat del Camello* y envía un mensaje.
   - **Cambiar a Modo Trabajador**: En la esquina superior derecha, cambia a *Trabajador*. Verás la solicitud para aceptarla o marcarla como completada.
   - **Calificar el servicio**: Cuando una solicitud pase a estado *Completada*, como *Cliente* podrás pulsar *Calificar Servicio* y asignarle estrellas.
   - **Verificar en phpMyAdmin**: Puedes abrir [phpMyAdmin](http://localhost/phpmyadmin/index.php?route=/database/structure&db=echele_camello) en cualquier momento y verás cómo los registros se actualizan de forma inmediata.

---

## 📂 Reiniciar la Base de Datos

Si deseas reiniciar la base de datos a sus valores iniciales de prueba, puedes ejecutar en PowerShell:
```powershell
& 'C:\xampp\mysql\bin\mysql.exe' -u root --default-character-set=utf8mb4 -e "source database/schema.sql"
```
O importar el archivo `database/schema.sql` directamente desde phpMyAdmin.
