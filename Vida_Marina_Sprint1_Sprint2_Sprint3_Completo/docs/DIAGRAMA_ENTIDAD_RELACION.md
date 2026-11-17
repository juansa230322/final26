# 🗄️ Diagrama Entidad-Relación (ER) - Base de Datos Supabase (PostgreSQL)
**Universidad Manuela Beltrán — Ingeniería de Software**  
**Sprints 1, 2 y 3 Integrados (Modelo Relacional Completo)**

---

## 1. Diagrama Entidad-Relación (Mermaid ERD)

```mermaid
erDiagram
    ROLES ||--o{ PROFILES : "asigna rol a"
    PROFILES ||--o{ ACTIVITY_ENROLLMENTS : "se inscribe en"
    ACTIVITIES ||--o{ ACTIVITY_ENROLLMENTS : "registra cupos de"
    PROFILES ||--o{ USER_BADGES : "posee"
    BADGES ||--o{ USER_BADGES : "otorgada a"
    PROFILES ||--o{ FORUM_POSTS : "publica"
    FORUM_POSTS ||--o{ FORUM_COMMENTS : "contiene"
    PROFILES ||--o{ FORUM_COMMENTS : "escribe"
    PROFILES ||--o{ ENVIRONMENTAL_REPORTS : "reporta incidente"
    ENVIRONMENTAL_REPORTS ||--o{ REPORT_PHOTOS : "adjunta evidencia"
    ENVIRONMENTAL_REPORTS ||--o{ MODERATION_HISTORY : "registra cambios de estado"
    PROFILES ||--o{ VERIFICATION_REQUESTS : "solicita acreditacion"
    VERIFICATION_REQUESTS ||--o{ VERIFICATION_DOCUMENTS : "contiene soportes"
    PROFILES ||--o{ NOTIFICATIONS : "recibe"
    PROFILES ||--o{ AUDIT_LOGS : "ejecuta accion auditada"

    ROLES {
        varchar id PK
        varchar name
        text description
        timestamptz created_at
    }

    PROFILES {
        uuid id PK
        uuid auth_id FK
        varchar name
        varchar email UK
        varchar role FK
        varchar city
        text avatar
        int level
        int xp
        varchar two_factor_secret
        boolean two_factor_enabled
        varchar status
        varchar institution
        varchar specialization
        timestamptz verified_at
        timestamptz created_at
        timestamptz updated_at
    }

    ACTIVITIES {
        varchar id PK
        varchar name
        text description
        text image
        date activity_date
        varchar time_schedule
        varchar location
        varchar responsible
        varchar activity_type
        int total_spots
        text_array requirements
        timestamptz created_at
        timestamptz updated_at
    }

    ACTIVITY_ENROLLMENTS {
        uuid id PK
        varchar activity_id FK
        uuid user_id FK
        timestamptz enrolled_at
    }

    BADGES {
        varchar id PK
        varchar icon
        varchar name UK
        text description
        text requirement
        varchar category
        timestamptz created_at
    }

    USER_BADGES {
        uuid id PK
        uuid user_id FK
        varchar badge_id FK
        varchar awarded_by
        timestamptz awarded_at
    }

    FORUM_POSTS {
        varchar id PK
        uuid author_id FK
        varchar author_name
        text author_avatar
        varchar role
        varchar category
        varchar title
        text content
        text image
        int likes
        boolean is_pinned
        boolean is_edited
        boolean is_scientific
        timestamptz created_at
        timestamptz updated_at
    }

    FORUM_COMMENTS {
        varchar id PK
        varchar post_id FK
        uuid author_id FK
        varchar author_name
        varchar author_role
        text author_avatar
        text comment_text
        timestamptz created_at
    }

    ENVIRONMENTAL_REPORTS {
        varchar id PK
        uuid reporter_id FK
        varchar reporter_name
        varchar reporter_email
        varchar reporter_role
        varchar incident_type
        text description
        date incident_date
        numeric latitude
        numeric longitude
        varchar address
        text_array photos
        varchar status
        text moderation_notes
        varchar moderated_by
        timestamptz moderated_at
        timestamptz created_at
        timestamptz updated_at
    }

    REPORT_PHOTOS {
        uuid id PK
        varchar report_id FK
        text photo_url
        timestamptz created_at
    }

    MODERATION_HISTORY {
        uuid id PK
        varchar report_id FK
        varchar previous_status
        varchar new_status
        uuid moderator_id FK
        varchar moderator_name
        text reason
        timestamptz created_at
    }

    EMERGENCY_CONTACTS {
        varchar id PK
        varchar name
        varchar category
        varchar phone
        varchar email
        text website
        varchar location
        text description
        boolean is_24h
        boolean verified
        timestamptz created_at
    }

    DONATION_CAMPAIGNS {
        varchar id PK
        varchar title
        text description
        numeric target_amount
        numeric current_amount
        int donor_count
        varchar organizer
        text image
        date deadline
        varchar status
        varchar category
        timestamptz created_at
    }

    VERIFICATION_REQUESTS {
        varchar id PK
        uuid user_id FK
        varchar user_name
        varchar user_email
        varchar current_role
        varchar institution
        varchar specialization
        text professional_bio
        varchar status
        text feedback
        varchar reviewed_by
        timestamptz reviewed_at
        timestamptz created_at
    }

    VERIFICATION_DOCUMENTS {
        varchar id PK
        varchar request_id FK
        varchar document_name
        varchar document_type
        text document_url
        varchar file_size
        timestamptz uploaded_at
    }

    NOTIFICATIONS {
        varchar id PK
        varchar user_id
        varchar title
        text message
        varchar notification_type
        boolean is_read
        text link
        timestamptz created_at
    }

    AUDIT_LOGS {
        varchar id PK
        varchar admin_id
        varchar admin_name
        varchar action
        varchar target_type
        varchar target_id
        text details
        timestamptz created_at
    }
```

---

## 2. Diccionario de Datos y Restricciones Principales

| Tabla | Llave Primaria | Llaves Foráneas (FK) | Restricciones Notables |
| :--- | :--- | :--- | :--- |
| `roles` | `id` (VARCHAR) | Ninguna | `name` UNIQUE |
| `profiles` | `id` (UUID) | `role` -> `roles.id`, `auth_id` -> `auth.users.id` | `email` UNIQUE, `level` BETWEEN 1 AND 5, `status` IN ('activo', 'suspendido', 'eliminado') |
| `activities` | `id` (VARCHAR) | Ninguna | `total_spots` >= 1 |
| `activity_enrollments` | `id` (UUID) | `activity_id` -> `activities.id`, `user_id` -> `profiles.id` | UNIQUE(`activity_id`, `user_id`) evita doble inscripción |
| `badges` | `id` (VARCHAR) | Ninguna | `name` UNIQUE |
| `user_badges` | `id` (UUID) | `user_id` -> `profiles.id`, `badge_id` -> `badges.id` | UNIQUE(`user_id`, `badge_id`) evita insignias duplicadas |
| `forum_posts` | `id` (VARCHAR) | `author_id` -> `profiles.id` | `likes` >= 0 |
| `forum_comments` | `id` (VARCHAR) | `post_id` -> `forum_posts.id`, `author_id` -> `profiles.id` | `ON DELETE CASCADE` en eliminación del post padre |
| `environmental_reports` | `id` (VARCHAR) | `reporter_id` -> `profiles.id` | `status` IN ('pendiente', 'aprobado', 'rechazado'), `latitude` [-90, 90], `longitude` [-180, 180] |
| `emergency_contacts` | `id` (VARCHAR) | Ninguna | `category` IN ('lineas_emergencia', 'autoridades_costeras', 'guardia_costera', 'centros_rescate', 'ongs', 'brigadas') |
| `verification_requests` | `id` (VARCHAR) | `user_id` -> `profiles.id` | `status` IN ('pendiente', 'aprobada', 'rechazada') |
| `verification_documents` | `id` (VARCHAR) | `request_id` -> `verification_requests.id` | `ON DELETE CASCADE` |
| `donation_campaigns` | `id` (VARCHAR) | Ninguna | `target_amount` > 0, `current_amount` >= 0 |
| `audit_logs` | `id` (VARCHAR) | Ninguna | Inmutable (sólo operaciones `INSERT`) |
