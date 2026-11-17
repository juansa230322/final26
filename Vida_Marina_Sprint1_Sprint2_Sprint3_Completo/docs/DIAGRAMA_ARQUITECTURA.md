# 🏗️ Diagrama de Arquitectura del Sistema - Vida Marina ODS 14
**Universidad Manuela Beltrán — Ingeniería de Software**  
**Sprints 1, 2 y 3 Integrados (Arquitectura por Capas y BaaS)**

---

## 1. Enfoque Arquitectónico

La plataforma **Vida Marina** implementa una **Arquitectura en Capas (Layered / N-Tier Architecture)** acoplada a un modelo **BaaS (Backend as a Service)** mediante **Supabase**, con un motor resiliente de persistencia dual:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN / VISTA (UI)                    │
│      React 18 + Tailwind CSS + Plus Jakarta Sans + Canvas Confetti     │
│   (Inicio, Mapa RF05, Emergencias RF06, Admin RF09, Acreditación RF10)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Invoca métodos del controlador
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA CONTROLADORA (CONTROLLER LAYER)                 │
│                              PlatformManager                           │
│       (Orquesta el flujo de negocio, eventos y actualización de UI)    │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │ Coordina                               │ Hidrata / Manipula
                ▼                                        ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       CAPA DE SERVICIOS (SERVICES)   │  │   MODELOS DE DOMINIO (POO)   │
│  * AuthenticationService (2FA TOTP)  │  │  * User (4 Subclases RBAC)   │
│  * TotpService (RFC 6238 HMAC-SHA1)  │  │  * EnvironmentalReport (RF05)│
│  * ReportService (RF05)              │  │  * EmergencyContact (RF06)   │
│  * VerificationService (RF10)        │  │  * ExpertVerification (RF10) │
│  * EmergencyContactService (RF06)    │  │  * Activity & Badge          │
│  * GoogleMapsService (GPS / Geocod)  │  │  * ForumPost & Comment       │
│  * SupabaseService (Cliente BaaS)    │  │  * DonationCampaign          │
│  * DatabaseService (Singleton)       │  │  * Notification & AuditLog   │
└──────────────────┬───────────────────┘  └──────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                CAPA DE PERSISTENCIA DUAL (DUAL ENGINE)                 │
│                                                                        │
│   ┌─────────────────────────────────┐   ┌───────────────────────────┐  │
│   │        SUPABASE EN LA NUBE      │   │  LOCALSTORAGE / CACHÉ     │  │
│   │ * PostgreSQL Relacional (Tablas)│   │ * Persistencia local      │  │
│   │ * Supabase Storage (Fotos, PDFs)│   │ * Ejecución Standalone    │  │
│   │ * Row Level Security (RLS)      │   │ * Cero configuración      │  │
│   │ * Supabase Realtime (WebSockets)│   │ * Modo offline/resiliente │  │
│   └─────────────────────────────────┘   └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagrama de Arquitectura de Despliegue y Flujo de Datos (Mermaid)

```mermaid
flowchart TD
    subgraph Clientes ["Dispositivos Clientes"]
        PC["💻 Navegador Escritorio\n(Chrome / Firefox / Edge)"]
        Mobile["📱 Navegador Móvil\n(Android / iPhone)"]
        AuthApp["📲 App Authenticator\n(Google / Microsoft Authenticator)"]
    end

    subgraph Hosting_Vercel ["CDN & Edge Hosting (Vercel)"]
        HTML["index.html\n(Aplicación React 18)"]
        CSS["Tailwind CSS CDN"]
        JS_Models["src/models/*.js\n(Entidades POO)"]
        JS_Services["src/services/*.js\n(Servicios de Negocio)"]
        JS_App["src/app.js\n(PlatformManager)"]
        Assets["assets/\n(Logo, Fotos Marinas)"]
    end

    subgraph Backend_Supabase ["Backend as a Service (Supabase Cloud)"]
        S_Auth["Supabase Authentication\n(JWT, Sesiones)"]
        S_DB["Supabase PostgreSQL DB\n(17 Tablas Relacionales + RLS)"]
        S_Storage["Supabase Storage Buckets\n(report-photos, verification-docs)"]
        S_Realtime["Supabase Realtime\n(PostgreSQL Changes / WebSockets)"]
    end

    subgraph Servicios_Externos ["APIs y Servicios Externos"]
        GMaps["🗺️ Google Maps API / Geolocation\n(Marcadores, Geocodificación)"]
        WebCrypto["🔐 Web Crypto API\n(HMAC-SHA1 RFC 6238)"]
    end

    PC --> HTML
    Mobile --> HTML
    HTML --> JS_Models
    HTML --> JS_Services
    HTML --> JS_App
    HTML --> Assets

    JS_Services --> S_Auth
    JS_Services --> S_DB
    JS_Services --> S_Storage
    JS_Services --> S_Realtime

    JS_Services --> GMaps
    JS_Services --> WebCrypto
    AuthApp <-->|Genera códigos TOTP cada 30s| WebCrypto
    Mobile -->|Llamada telefónica directa tel:| TelCarrier["📞 Red Telefónica Móvil (146 / 123)"]
```

---

## 3. Principios de Diseño y Patrones Aplicados

1. **Separación de Responsabilidades (SoC):** Cada clase y módulo atiende una función exclusiva: los modelos encapsulan estado y reglas de negocio; los servicios gestionan conexiones y cálculos externos; el controlador orquesta la lógica de la aplicación; y la vista React renderiza la interfaz.
2. **Patrón Singleton:** `DatabaseService` y `SupabaseService` garantizan una única instancia compartida durante todo el ciclo de vida de la aplicación, evitando condiciones de carrera en la memoria.
3. **Patrón Factory:** `UserFactory.createUser(data)` analiza el rol del usuario e instancia automáticamente la subclase polimórfica adecuada (`AdminCoordinator`, `ExpertResearcher`, `Volunteer` o `Citizen`).
4. **Resiliencia y Modo Híbrido (Graceful Degradation):** Si la conexión a Supabase no está configurada o se encuentra sin red, el sistema cambia automáticamente al motor local en `localStorage` sin interrumpir la experiencia del usuario ni generar pantallas en blanco.
