# 🌊 Plataforma "Vida Marina – ODS 14: Vida Submarina"
### Universidad Manuela Beltrán — Facultad de Ingeniería
**Proyecto Integrado de Ingeniería de Software — Sprints 1, 2 y 3 Completos**

[![Universidad Manuela Beltrán](https://img.shields.io/badge/Universidad-Manuela_Beltr%C3%A1n-red.svg)](https://umb.edu.co)
[![ODS 14](https://img.shields.io/badge/ODS%2014-Vida_Submarina-00b4d8.svg)](https://sdgs.un.org/goals/goal14)
[![Arquitectura POO](https://img.shields.io/badge/Arquitectura-POO_Full_Stack-00f5d4.svg)](#)
[![Base de Datos](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ecf8e.svg)](https://supabase.com)
[![2FA](https://img.shields.io/badge/Seguridad-2FA_TOTP_RFC_6238-amber.svg)](#)
[![Estado](https://img.shields.io/badge/Sprint%203-Completado_y_Validado-success.svg)](#)

---

## 📌 1. Descripción General del Proyecto

**Vida Marina** es una plataforma web oficial para la conservación y gobernanza de los ecosistemas marinos y costeros de Colombia, desarrollada en el marco del **Objetivo de Desarrollo Sostenible 14 (ODS 14: Vida Submarina)** de las Naciones Unidas para la **Universidad Manuela Beltrán**.

El proyecto integra de forma unificada las funcionalidades desarrolladas a lo largo de los **Sprints 1, 2 y 3**, evolucionando desde un prototipo de almacenamiento local hacia una plataforma robusta en la nube con arquitectura orientada a objetos (POO), control de acceso basado en roles (RBAC), autenticación de dos factores (2FA TOTP), persistencia en **Supabase (PostgreSQL)**, geolocalización satelital de incidentes marinos y directorio oficial de emergencias de Colombia.

---

## 🏛️ 2. Arquitectura Orientada a Objetos (POO) y Patrones de Diseño

El código fuente respeta rigurosamente los cuatro pilares fundamentales de la POO y los patrones de diseño de software:

### Los 4 Pilares de la POO
1. **Abstracción:** Entidades centrales del mundo real de la conservación marina modeladas formalmente en clases:
   * `User`: Modela usuarios, atributos de identidad y estado de sesión.
   * `EnvironmentalReport`: Modela incidentes ambientales con coordenadas geográficas y fotografías.
   * `EmergencyContact`: Modela instituciones y líneas de atención ambiental en Colombia.
   * `ExpertVerification` y `VerificationDocument`: Modelan el expediente de acreditación científica.
   * `Activity`: Modela jornadas de voluntariado, limpiezas y siembras coralinas.
   * `Badge`: Modela reconocimientos oficiales e insignias de mérito ecológico.
   * `ForumPost` y `ForumComment`: Modelan la divulgación científica y debate comunitario.
   * `DonationCampaign`: Modela proyectos de financiamiento para restauración marina.
   * `AuditLog` y `Notification`: Modelan la trazabilidad y las alertas del sistema.

2. **Encapsulamiento:** Protección de datos sensibles e integridad del estado interno mediante métodos bien definidos:
   * `User.validatePassword()` y `setPassword()`: Validación segura de contraseñas.
   * `User.enable2FA()` y `has2FA()`: Encapsula el secreto Base32 y el estado de doble factor.
   * `User.addXP()` y `calculateLevel()`: Progresión matemática automática de nivel 1 a 5.
   * `Activity.enrollUser()` y `cancelUserEnrollment()`: Validación estricta de cupos disponibles.
   * `EnvironmentalReport.approve()` y `reject()`: Transiciones controladas de estado con notas de moderación.

3. **Herencia (Jerarquía de Roles RBAC):**
   ```
                         ┌─────────────┐
                         │    User     │ (Clase Base)
                         └──────┬──────┘
             ┌──────────────────┼──────────────────┐
             ▼                  ▼                  ▼
      ┌──────────────┐   ┌──────────────┐   ┌────────────────────┐
      │   Citizen    │   │  Volunteer   │   │  ExpertResearcher  │
      └──────────────┘   └──────────────┘   └────────────────────┘
                                │
                                ▼
                     ┌────────────────────┐
                     │  AdminCoordinator  │
                     └────────────────────┘
   ```
   * `Citizen extends User`: Rol inicial de consulta, reportes y solicitud de verificación.
   * `Volunteer extends User`: Miembros activos con cálculo de impacto ecológico (`calculateEcologicalImpact`).
   * `ExpertResearcher extends User`: Especialistas acreditados con capacidad de publicar ciencia marina.
   * `AdminCoordinator extends User`: Coordinadores con control total de moderación y auditoría.

4. **Polimorfismo:** Sobreescritura dinámica de comportamientos según el rol activo:
   * `canModerate()`: `false` en Ciudadano/Voluntario/Experto; `true` en AdminCoordinator.
   * `canPublishScience()`: `true` únicamente en ExpertResearcher y AdminCoordinator.
   * `canEnrollActivities()`: `false` en Ciudadano; `true` en Voluntario, Experto y Administrador.
   * `getRoleBadgeColor()` y `getRoleTitle()`: Retornan el estilo visual y distintivo propio de cada rol.

### Patrones de Diseño Implementados
* **Singleton Pattern:** `DatabaseService` y `SupabaseService` aseguran puntos de acceso globales únicos, garantizando la consistencia de los datos en memoria y almacenamiento.
* **Factory Pattern:** `UserFactory.createUser(data)` instancia dinámicamente la subclase correspondiente según el rol almacenado.
* **Controller / Service Layer:** `PlatformManager` desacopla completamente la lógica de negocio de la interfaz gráfica React, apoyándose en servicios especializados (`ReportService`, `VerificationService`, `EmergencyContactService`, `AuthenticationService`, `TotpService`, `GoogleMapsService`).

---

## 🚀 3. Funcionalidades Integradas por Módulos

### 🌊 RF05 – Reportes Ambientales Geolocalizados (Sprint 3)
* **Formulario Completo:** Selección de 5 categorías críticas (Vertimiento ilegal, Pesca ilegal, Derrames de petróleo, Contaminación por plásticos, Otros incidentes).
* **Geolocalización GPS:** Botón *"📍 Usar mi GPS Actual"* con Geolocation API nativa y geocodificación inversa de municipios costeros de Colombia.
* **Fotografías de Evidencia:** Carga múltiple de imágenes y previsualización.
* **Mapa Interactivo:** Mapa interactivo de alta resolución con coordenadas geográficas de incidentes marinos y compatibilidad con Google Maps JavaScript API.
* **Flujo de Moderación:** Todo reporte inicia en estado `pendiente`. El Administrador inspecciona la evidencia y puede aprobarlo (haciéndolo visible en el mapa comunitario) o rechazarlo, registrando el motivo y notificando automáticamente al usuario.

### 🚨 RF06 – Directorio de Contactos de Emergencia (Sprint 3)
* **Acceso Directo:** Botón de alerta pulsante y visible en el navbar y página de inicio.
* **6 Categorías Oficiales:**
  1. *Líneas de Atención Ambiental:* Línea 123 Nacional, MinAmbiente Línea Verde (018000 915060).
  2. *Guardia Costera:* Línea 146 Guardacostas Armada Nacional de Colombia.
  3. *Autoridades Ambientales Costeras:* DIMAR, Coralina (San Andrés), Cardique (Cartagena), Corpamag (Magdalena).
  4. *Centros de Rescate de Fauna Marina:* CAV-R INVEMAR, Acuario San Martín (Islas del Rosario).
  5. *Organizaciones No Gubernamentales:* Fundación Malpelo, WWF Colombia.
  6. *Brigadas de Respuesta Rápida:* Defensa Civil Colombiana (144), PONALSAR.
* **Llamada Inmediata desde Móviles:** Botón nativo `tel:` que activa el marcador telefónico del dispositivo.
* **Administración CRUD:** El administrador puede crear, editar y eliminar contactos oficiales.

### 👑 RF09 – Roles (RBAC) y Panel de Administración con 2FA (Sprint 3)
* **Control de Acceso Basado en Roles:** Exactamente 4 roles (Administrador, Experto, Voluntario, Ciudadano) con validación estricta en interfaz, controlador y base de datos.
* **Panel de Administración General:**
  * Métricas y gráficos estadísticos con datos reales de la plataforma.
  * Gestión de usuarios: búsqueda, filtros, cambio de rol, suspensión y reactivación de cuentas.
  * Moderación de reportes ambientales y evaluación de expedientes de expertos.
  * Creación y gestión de actividades ecológicas y concesión de insignias.
  * Registro de auditoría inmutable (`AuditLog`) para cada acción administrativa.
* **Autenticación de Dos Factores (2FA - TOTP):**
  * Obligatoria para Administradores y Expertos.
  * Algoritmo criptográfico **RFC 6238** (HMAC-SHA1) real implementado con Web Crypto API.
  * Compatible con Google Authenticator, Microsoft Authenticator y Authy.
  * Generación de código QR y clave secreta Base32. Cero códigos simulados.

### 🔬 RF10 – Verificación de Investigadores, Expertos y ONGs (Sprint 3)
* **Radicación de Expediente:** Carga de documentos probatorios en formato PDF, PNG y JPG (tarjetas profesionales, títulos universitarios, avales de ONG).
* **Evaluación Administrativa:** El administrador descarga e inspecciona los documentos y registra observaciones obligatorias de feedback.
* **Activación Subordinada a 2FA:** Tras la aprobación administrativa, el rol de `Experto` se activa únicamente una vez que el usuario configura su segundo factor de autenticación (2FA).

### 🐬 Sprints 1 y 2 Conservados e Integrados
* Página de inicio moderna con identidad visual marina y diseño ocean-glass.
* Registro y login con persistencia.
* Calendario interactivo mensual de actividades con control de cupos.
* Sistema de niveles (1 al 5) y puntos XP con cálculo de impacto ecológico.
* Galería de insignias oficiales y otorgamiento administrativo con celebración de confetti.
* Foro comunitario con comentarios, me gusta y fijación de temas.
* Campañas de donación marina con metas financieras y simulación segura de pago.
* Diseño 100% responsive para teléfonos Android, iPhone, tablets y computadores.

---

## 🗄️ 4. Base de Datos en la Nube con Supabase

El archivo `supabase_schema.sql` contiene la configuración integral para PostgreSQL en Supabase:
* **17 Tablas Relacionales:** `roles`, `profiles`, `activities`, `activity_enrollments`, `badges`, `user_badges`, `forum_posts`, `forum_comments`, `news`, `environmental_reports`, `report_photos`, `moderation_history`, `emergency_contacts`, `donation_campaigns`, `verification_requests`, `verification_documents`, `notifications`, `audit_logs`.
* **Seguridad RLS (Row Level Security):** Políticas granulares para lectura pública controlada y permisos restringidos de inserción y actualización según el rol.
* **Storage Buckets:** `report-photos`, `verification-docs` (privado), `avatars` y `activity-images`.
* **Triggers de Actualización:** Funciones PL/pgSQL para `updated_at` automático.
* **Motor Híbrido Resiliente:** La plataforma opera tanto en la nube con Supabase como de forma local en `localStorage` sin fallos si las credenciales no han sido configuradas.

---

## 🧪 5. Casos de Prueba Oficiales (Aseguramiento de Calidad)

La plataforma incluye en su barra de navegación el **"Laboratorio de Pruebas Automatizadas"** que permite ejecutar en vivo los cuatro casos de prueba del Sprint 3:

* **PA-05 – Reportes Ambientales:** Valida creación, fijación de coordenadas GPS, almacenamiento en estado pendiente, moderación por admin y notificación al usuario. *(Estado: PASS)*
* **PA-06 – Contactos de Emergencia:** Valida acceso directo en 1 clic, existencia de las 6 categorías, datos colombianos reales y funcionamiento del protocolo `tel:`. *(Estado: PASS)*
* **PA-09 – Roles y Administración 2FA:** Valida permisos de los 4 roles, gestión de usuarios, auditoría y cálculo criptográfico del token TOTP RFC 6238 con WebCrypto API. *(Estado: PASS)*
* **PA-10 – Verificación de Expertos:** Valida carga de archivos probatorios (PDF/PNG), evaluación administrativa con observaciones, notificación y ascenso subordinado a 2FA. *(Estado: PASS)*

---

## 🔑 6. Credenciales de Demostración (Los 4 Roles)

Para facilitar la sustentación universitaria, la plataforma cuenta con 4 usuarios pre-sembrados con datos colombianos reales:

| Rol | Correo Electrónico | Contraseña | Perfil y Particularidad |
| :--- | :--- | :--- | :--- |
| **Administrador General** | `admin@vidamarina.org` | `adminmarina2026` | Dra. Marina Castillo (2FA activo, acceso total al Panel Admin y moderación). |
| **Investigador / Experto** | `investigador@invemar.org.co` | `carlosmarino2026` | Dr. Carlos Arrecife (INVEMAR, 2FA activo, publica en Investigación Científica). |
| **Voluntario Marino** | `voluntario@vidamarina.org` | `sofiapass2026` | Sofía Océano (San Andrés, nivel 3, inscrita en actividades de campo). |
| **Ciudadano Consciente** | `ciudadano@colombia.gov.co` | `mateocosta2026` | Mateo Costero (Buenaventura, reportes ciudadanos, solicita verificación). |

*Nota sobre el inicio de sesión con 2FA:* Al iniciar sesión con Admin o Experto, la ventana de diálogo te permite ingresar tu código de 6 dígitos de tu app Authenticator, o bien configurar uno nuevo desde el perfil.

---

## 📂 7. Estructura del Proyecto

```
vida-marina/
├── index.html                           # Interfaz gráfica React 18 / Tailwind CSS integrada
├── README.md                            # Documento principal de sustentación
├── MANUAL_INSTALACION.md                # Guía técnica paso a paso para Supabase, Vercel y Maps
├── supabase_schema.sql                  # Script SQL completo de Supabase (PostgreSQL + RLS)
├── .env.example                         # Plantilla de variables de entorno
├── .gitignore                           # Exclusión de archivos sensibles para Git
├── assets/                              # Fotografías marinas y logotipo oficial
│   ├── logo_vida_marina.jpg
│   ├── arrecife_coral_1.png
│   ├── peces_arrecife_2.png
│   └── ecosistema_marino_3.png
├── docs/                                # Documentación de ingeniería y diagramas
│   ├── DIAGRAMA_CLASES_UML.md           # Diagrama formal de clases POO en Mermaid
│   ├── DIAGRAMA_CASOS_USO.md            # Diagrama de casos de uso y especificaciones
│   ├── DIAGRAMA_ENTIDAD_RELACION.md     # Diagrama ER de base de datos relacional
│   ├── DIAGRAMA_ARQUITECTURA.md         # Diagrama de arquitectura del sistema en capas
│   ├── MATRIZ_TRAZABILIDAD_REQUISITOS.md# Matriz de requisitos vs clases y pruebas
│   ├── PRUEBAS_FUNCIONALES.md           # Reporte de casos de prueba ejecutados
│   └── LISTADO_ARCHIVOS_CAMBIOS.md      # Inventario de archivos nuevos y modificados
└── src/
    ├── app.js                           # Controlador orquestador PlatformManager
    ├── seedData.js                      # Datos semilla reales de Colombia
    ├── models/                          # Modelos POO del Dominio
    │   ├── User.js                      # User, Citizen, Volunteer, ExpertResearcher, AdminCoordinator
    │   ├── Activity.js                  # Activity
    │   ├── Badge.js                     # Badge
    │   ├── ForumPost.js                 # ForumPost, ForumComment
    │   ├── EnvironmentalReport.js       # EnvironmentalReport (RF05)
    │   ├── EmergencyContact.js          # EmergencyContact (RF06)
    │   ├── ExpertVerification.js        # ExpertVerification, VerificationDocument (RF10)
    │   ├── DonationCampaign.js          # DonationCampaign
    │   ├── Notification.js              # Notification
    │   └── AuditLog.js                  # AuditLog
    └── services/                        # Capa de Servicios de Negocio
        ├── AuthenticationService.js     # Autenticación, contraseñas y 2FA
        ├── TotpService.js               # Algoritmo matemático TOTP RFC 6238 real
        ├── GoogleMapsService.js         # API de Google Maps y geolocalización GPS
        ├── DatabaseService.js           # Singleton de persistencia e hidratación POO
        ├── SupabaseService.js           # Cliente de conexión BaaS en la nube
        ├── ReportService.js             # Lógica de reportes y moderación (RF05)
        ├── VerificationService.js       # Lógica de verificación científica (RF10)
        └── EmergencyContactService.js   # Gestión del directorio de emergencias (RF06)
```

---

## ⚡ 8. Cómo Ejecutar el Proyecto Rápidamente

1. **Doble Clic:** Abre directamente `index.html` en cualquier navegador web. No requiere Node.js ni servidor web para funcionar en modo local.
2. **Servidor Local (Opcional):**
   ```bash
   npx serve . -l 3000
   # o bien: python -m http.server 3000
   ```
   Abre `http://localhost:3000` en tu navegador.
3. Para conectar tu base de datos Supabase o tu Google Maps API Key, haz clic en el icono de nube `☁️` en la barra superior o consulta el archivo [MANUAL_INSTALACION.md](file:///MANUAL_INSTALACION.md).

---

## 🎓 Universidad Manuela Beltrán
* **Facultad de Ingeniería**
* **Programa:** Ingeniería de Software
* **Asignatura:** Desarrollo Web Full Stack y Metodologías Ágiles Scrum
* **Proyecto:** Vida Marina – ODS 14: Vida Submarina
* **Sprints Integrados:** Sprint 1, Sprint 2 y Sprint 3
