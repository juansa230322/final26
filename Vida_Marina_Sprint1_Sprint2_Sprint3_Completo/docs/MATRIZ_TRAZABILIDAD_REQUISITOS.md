# 📊 Matriz de Trazabilidad de Requisitos y Criterios de Aceptación
## Plataforma "Vida Marina – ODS 14: Vida Submarina"
**Universidad Manuela Beltrán — Ingeniería de Software**  
**Sprints 1, 2 y 3 Integrados**

---

## 1. Matriz de Requisitos Funcionales vs. Implementación y Pruebas

| Código | Requisito Funcional | Módulo / Clases Implementadas | Casos de Prueba | Criterio de Aceptación Cumplido | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF01** | Registro de nuevos usuarios con rol inicial Ciudadano. | `AuthenticationService`, `Citizen`, `UserFactory` | PA-01, PA-09 | Validación de datos, contraseña de 6+ caracteres, correo único y asignación automática del rol Ciudadano. | **Aprobado** |
| **RF02** | Inicio y cierre de sesión seguro. | `AuthenticationService`, `PlatformManager` | PA-02, PA-09 | Autenticación de credenciales, protección ante cuentas suspendidas y cierre de sesión limpio. | **Aprobado** |
| **RF03** | Perfiles de usuario, XP, niveles e impacto ecológico. | `User`, `Volunteer.calculateEcologicalImpact()` | PA-03 | Cálculo automático de nivel 1 a 5 según umbrales de XP; métricas de horas y residuos calculadas polimórficamente. | **Aprobado** |
| **RF04** | Creación, gestión e inscripción a actividades ecológicas. | `Activity`, `PlatformManager` | PA-04 | Control de cupos en tiempo real, validación de permisos de rol (Voluntario/Experto/Admin) y cancelación de inscripción. | **Aprobado** |
| **RF05** | Reportes ambientales geolocalizados con fotos y moderación. | `EnvironmentalReport`, `ReportService`, `GoogleMapsService` | **PA-05** | Formulario con 5 categorías, coordenadas geográficas, geolocalización GPS, fotos múltiples, estado inicial pendiente, moderación por admin y notificación. | **Aprobado** |
| **RF06** | Directorio de emergencias ambientales con llamadas directas. | `EmergencyContact`, `EmergencyContactService` | **PA-06** | Acceso visible desde navbar/home, 6 categorías oficiales de Colombia, datos 100% reales verificados, botón de llamada `tel:`, administración CRUD. | **Aprobado** |
| **RF07** | Foro comunitario y difusión científica abierta. | `ForumPost`, `ForumComment`, `PlatformManager` | PA-07 | Publicación de temas, distinción de categoría "Investigación Científica" reservada para Expertos/Admins, comentarios, likes y fijación de posts. | **Aprobado** |
| **RF08** | Sistema de insignias y reconocimientos oficiales. | `Badge`, `PlatformManager.grantBadge()` | PA-08 | Desbloqueo automático por participación o concesión formal por parte del Administrador General con +150 XP. | **Aprobado** |
| **RF09** | Sistema RBAC (4 roles) y Panel Administrativo con 2FA TOTP. | `User` (4 subclases), `TotpService`, `PlatformManager` | **PA-09** | Exactamente 4 roles con permisos diferenciados en UI y backend, panel admin con búsqueda y filtros, suspensión/reactivación, 2FA TOTP RFC 6238 real. | **Aprobado** |
| **RF10** | Verificación de investigadores, expertos y ONGs. | `ExpertVerification`, `VerificationDocument`, `VerificationService` | **PA-10** | Formulario de acreditación con documentos PDF/PNG/JPG, revisión administrativa con observaciones, notificación y ascenso a Experto con 2FA. | **Aprobado** |
| **RF11** | Campañas de donación y restauración de arrecifes. | `DonationCampaign`, `PlatformManager.donateToCampaign()` | PA-11 | Visualización de metas, porcentajes de avance, simulación de pago seguro y confirmación con confetti. | **Aprobado** |
| **RF12** | Sistema de notificaciones en tiempo real. | `Notification`, `DatabaseService.addNotification()` | PA-12 | Notificaciones automáticas ante moderación de reportes, verificación de expertos, insignias ganadas y avisos globales. | **Aprobado** |
| **RF13** | Historial de auditoría administrativa inmutable (AuditLog). | `AuditLog`, `DatabaseService.addAuditLog()` | PA-13 | Registro cronológico detallado de cada acción del administrador (cambios de rol, suspensiones, aprobaciones). | **Aprobado** |
| **RF14** | Persistencia en la nube con Supabase (PostgreSQL y Storage). | `SupabaseService`, `DatabaseService`, `supabase_schema.sql` | PA-14 | Script SQL con 17 tablas, RLS, Storage Buckets, Realtime y persistencia híbrida resiliente. | **Aprobado** |
| **RF15** | Diseño visual adaptable y optimizado para móviles. | Tailwind CSS, `index.html`, Plus Jakarta Sans | PA-15 | Totalmente responsive en computadores, tablets, Android e iOS; compatibilidad de botones de llamada y geolocalización. | **Aprobado** |

---

## 2. Matriz de Roles vs. Permisos (RBAC - RF09)

| Funcionalidad / Permiso | Ciudadano | Voluntario | Experto | Administrador General |
| :--- | :---: | :---: | :---: | :---: |
| Consultar información y noticias | ✓ | ✓ | ✓ | ✓ |
| Consultar directorio de emergencias y llamar | ✓ | ✓ | ✓ | ✓ |
| Crear reportes ambientales geolocalizados | ✓ | ✓ | ✓ | ✓ |
| Publicar en el foro general | ✓ | ✓ | ✓ | ✓ |
| Solicitar verificación científica | ✓ | ✓ | N/A | N/A |
| Inscribirse en actividades ecológicas | ✕ | ✓ | ✓ | ✓ |
| Acumular XP y desbloquear insignias | ✕ | ✓ | ✓ | ✓ |
| Publicar en "Investigación Científica" | ✕ | ✕ | ✓ | ✓ |
| Autenticación de Dos Factores (2FA) | Opcional | Opcional | **Obligatorio** | **Obligatorio** |
| Acceder al Panel de Administración | ✕ | ✕ | ✕ | **✓** |
| Moderar reportes ambientales (Aprobar/Rechazar) | ✕ | ✕ | ✕ | **✓** |
| Evaluar solicitudes de verificación de expertos | ✕ | ✕ | ✕ | **✓** |
| Gestionar usuarios (cambiar rol, suspender) | ✕ | ✕ | ✕ | **✓** |
| Administrar contactos de emergencia | ✕ | ✕ | ✕ | **✓** |
| Crear actividades y otorgar insignias | ✕ | ✕ | ✕ | **✓** |
| Consultar registro de auditoría (AuditLog) | ✕ | ✕ | ✕ | **✓** |
