# 📁 Listado de Archivos Nuevos y Modificados
## Plataforma "Vida Marina – ODS 14: Vida Submarina"
**Universidad Manuela Beltrán — Ingeniería de Software**  
**Integración de Sprints 1, 2 y 3**

---

## 1. Archivos Nuevos Creados en el Sprint 3

| Archivo | Ubicación | Descripción y Responsabilidad en el Sistema |
| :--- | :--- | :--- |
| `EnvironmentalReport.js` | `src/models/` | Clase modelo para el módulo RF05: representa reportes ambientales geolocalizados, categorías de incidentes, estados de moderación (pendiente, aprobado, rechazado) y métodos de aprobación. |
| `EmergencyContact.js` | `src/models/` | Clase modelo para el módulo RF06: modela entidades institucionales de emergencia en Colombia, 6 categorías oficiales, números telefónicos y formato para llamadas `tel:`. |
| `ExpertVerification.js` | `src/models/` | Clases `VerificationDocument` y `ExpertVerification` para RF10: modelan expedientes de acreditación académica de investigadores, soporte de archivos (PDF/JPG/PNG) y flujo de revisión. |
| `DonationCampaign.js` | `src/models/` | Clase modelo para proyectos de recaudación de fondos y restauración coralina: metas financieras, montos actuales, porcentaje de avance y donaciones. |
| `Notification.js` | `src/models/` | Clase modelo para el sistema de alertas y notificaciones del usuario (cambios de estado de reportes, solicitudes de expertos, insignias). |
| `AuditLog.js` | `src/models/` | Clase modelo para el registro inmutable de auditoría administrativa: fecha, administrador responsable, tipo de acción y detalles técnicos. |
| `TotpService.js` | `src/services/` | Servicio criptográfico para RF09: implementación matemática real del algoritmo TOTP (RFC 6238) con Web Crypto API (HMAC-SHA1), Base32 y generación de códigos QR. Cero códigos simulados. |
| `GoogleMapsService.js` | `src/services/` | Servicio de geolocalización para RF05: carga dinámica de Google Maps JavaScript API, geolocalización HTML5 GPS y geocodificación inversa de costas colombianas. |
| `SupabaseService.js` | `src/services/` | Servicio Singleton de persistencia en la nube: cliente de Supabase (PostgreSQL, Supabase Auth, Storage Buckets y Realtime WebSockets). |
| `ReportService.js` | `src/services/` | Capa de servicio para RF05: orquesta la creación, validación geográfica y moderación de reportes ambientales con registro en auditoría y alertas. |
| `VerificationService.js` | `src/services/` | Capa de servicio para RF10: gestiona el ciclo de vida de acreditación científica, revisión administrativa con feedback y ascenso al rol Experto subordinado a 2FA. |
| `EmergencyContactService.js` | `src/services/` | Capa de servicio para RF06: búsqueda, filtrado por categorías y administración CRUD de contactos oficiales de emergencia marina en Colombia. |
| `AuthenticationService.js` | `src/services/` | Servicio de seguridad y autenticación: control de contraseñas, validación de cuentas suspendidas, login con desafío 2FA y configuración de autenticador. |
| `seedData.js` | `src/` | Conjunto integral de datos semilla con información real y verificable de Colombia (entidades marítimas, coordenadas, reportes, actividades, campañas y perfiles de los 4 roles). |
| `supabase_schema.sql` | Raíz `/` | Script SQL completo para Supabase (PostgreSQL): 17 tablas relacionales, llaves foráneas, triggers de timestamps, políticas RLS, buckets de Storage y datos semilla en SQL. |
| `.env.example` | Raíz `/` | Plantilla de variables de entorno para Supabase, Google Maps y servidor. |
| `.gitignore` | Raíz `/` | Reglas de exclusión para Git (oculta secretos `.env`, `node_modules`, temporales). |
| `MANUAL_INSTALACION.md` | Raíz `/` | Guía técnica paso a paso para Supabase, SQL, Storage, Google Maps, 2FA, ejecución local, GitHub, Vercel y móviles. |
| `DIAGRAMA_CLASES_UML.md` | `docs/` | Diagrama de clases formal en Mermaid con herencia, polimorfismo, atributos y métodos de la arquitectura POO. |
| `DIAGRAMA_CASOS_USO.md` | `docs/` | Diagrama de casos de uso en Mermaid detallando los 4 actores y casos de los Sprints 1, 2 y 3. |
| `DIAGRAMA_ENTIDAD_RELACION.md` | `docs/` | Diagrama ER en Mermaid con cardinalidades y diccionario de datos del esquema PostgreSQL de Supabase. |
| `DIAGRAMA_ARQUITECTURA.md` | `docs/` | Diagrama arquitectónico en capas (N-Tier) y BaaS híbrido con despliegue en Vercel y Supabase. |
| `MATRIZ_TRAZABILIDAD_REQUISITOS.md` | `docs/` | Matriz de trazabilidad cruzando requisitos funcionales (RF01 a RF15), clases, casos de prueba y permisos RBAC. |
| `PRUEBAS_FUNCIONALES.md` | `docs/` | Documentación exhaustiva de los casos de prueba ejecutados realmente (PA-05, PA-06, PA-09, PA-10) y pruebas unitarias. |
| `LISTADO_ARCHIVOS_CAMBIOS.md` | `docs/` | Este documento de control de cambios e inventario de archivos del proyecto. |

---

## 2. Archivos Modificados e Integrados de los Sprints 1 y 2

| Archivo | Ubicación | Modificaciones Realizadas e Integración de Sprints |
| :--- | :--- | :--- |
| `User.js` | `src/models/` | **Ampliación con 4 roles (RF09):** Se crearon las subclases `Citizen` (nuevo), `Volunteer` (actualizado), `ExpertResearcher` (nuevo) y `AdminCoordinator` (actualizado). Se incorporaron métodos para 2FA (`enable2FA`, `disable2FA`, `has2FA`, `requires2FA`), suspensión/reactivación (`suspend`, `reactivate`, `isActive`) y el patrón de diseño `UserFactory`. |
| `ForumPost.js` | `src/models/` | **Soporte científico y seguridad:** Se integró la bandera `isScientific` para publicaciones de investigadores verificados, soporte para likes por usuario único (`likedByUserIds`) y fechas estructuradas en comentarios. |
| `DatabaseService.js` | `src/services/` | **Arquitectura Híbrida y Persistencia Total:** Se transformó en un servicio Singleton completo capaz de hidratar las 10 entidades del modelo POO. Administra colecciones en memoria y persistencia dual en `localStorage` / Supabase, eliminando la pérdida de datos al actualizar la página. |
| `app.js` | `src/` | **Controlador Orquestador `PlatformManager`:** Se integraron los 4 nuevos servicios (`ReportService`, `VerificationService`, `EmergencyContactService`, `AuthenticationService`). Se añadieron métodos para el panel administrativo (cambio de roles, suspensión, borrado de usuarios, otorgamiento de insignias, moderación de reportes y auditoría). |
| `index.html` | Raíz `/` | **Eliminación de duplicación y Nueva Interfaz Gráfica:** Se eliminó la duplicación masiva de código de clases que antes residía dentro del HTML. Ahora carga directamente los archivos modulares de `src/models/` y `src/services/`. Se implementaron las interfaces completas de: Reportes Ambientales en Mapa (RF05), Directorio de Emergencias con llamadas `tel:` (RF06), Panel de Administración RBAC (RF09), Acreditación con carga de documentos (RF10), Laboratorio de Pruebas Automatizadas y Configuración en la Nube. |
| `README.md` | Raíz `/` | **Actualización Completa:** Se reescribió la documentación principal del proyecto para reflejar la integración completa de los Sprints 1, 2 y 3, la sustentación universitaria para la UMB, los diagramas, la arquitectura POO y los casos de prueba. |
