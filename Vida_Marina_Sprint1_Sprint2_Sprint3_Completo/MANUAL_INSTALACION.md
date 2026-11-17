# 📘 Manual de Instalación, Configuración y Despliegue en la Nube
## Plataforma "Vida Marina – ODS 14: Vida Submarina"
**Universidad Manuela Beltrán — Ingeniería de Software**  
**Sprints 1, 2 y 3 Integrados**

---

## 📋 Tabla de Contenido
1. [Requisitos Previos y Compatibilidad](#1-requisitos-previos-y-compatibilidad)
2. [Paso 1: Configuración de la Base de Datos en Supabase](#paso-1-configuración-de-la-base-de-datos-en-supabase)
3. [Paso 2: Ejecución del Script SQL y Estructura Relacional](#paso-2-ejecución-del-script-sql-y-estructura-relacional)
4. [Paso 3: Creación y Políticas de Buckets de Almacenamiento (Storage)](#paso-3-creación-y-políticas-de-buckets-de-almacenamiento-storage)
5. [Paso 4: Configuración de Variables de Entorno](#paso-4-configuración-de-variables-de-entorno)
6. [Paso 5: Configuración de Google Maps API Key y Restricciones](#paso-5-configuración-de-google-maps-api-key-y-restricciones)
7. [Paso 6: Configuración del Segundo Factor de Autenticación (2FA - TOTP)](#paso-6-configuración-del-segundo-factor-de-autenticación-2fa---totp)
8. [Paso 7: Ejecución del Proyecto en Entorno Local](#paso-7-ejecución-del-proyecto-en-entorno-local)
9. [Paso 8: Actualización y Publicación en Repositorio GitHub](#paso-8-actualización-y-publicación-en-repositorio-github)
10. [Paso 9: Despliegue en Producción mediante Vercel](#paso-9-despliegue-en-producción-mediante-vercel)
11. [Paso 10: Acceso y Navegación desde Dispositivos Móviles (Android / iOS)](#paso-10-acceso-y-navegación-desde-dispositivos-móviles-android--ios)
12. [Costos, Límites y Planes Gratuitos](#costos-límites-y-planes-gratuitos)

---

## 1. Requisitos Previos y Compatibilidad

* **Navegador Web Moderno:** Google Chrome (v90+), Mozilla Firefox (v88+), Microsoft Edge (v90+), Safari (v14+).
* **Cuenta gratuita en Supabase:** [https://supabase.com](https://supabase.com).
* **Cuenta en GitHub:** Para el control de versiones y despliegue continuo.
* **Cuenta gratuita en Vercel:** [https://vercel.com](https://vercel.com).
* **Dispositivo Móvil:** Teléfono inteligente Android o iPhone con aplicación de autenticación TOTP (Google Authenticator, Microsoft Authenticator o Authy).

---

## Paso 1: Configuración de la Base de Datos en Supabase

1. Ingresa a [https://supabase.com](https://supabase.com) e inicia sesión con tu cuenta de GitHub o correo electrónico.
2. En el panel principal (Dashboard), haz clic en el botón verde **"New Project"** (Nuevo Proyecto).
3. Diligencia los siguientes campos del proyecto:
   * **Name (Nombre):** `vida-marina-ods14`
   * **Database Password (Contraseña de Base de Datos):** Define una contraseña robusta y guárdala en un lugar seguro.
   * **Region (Región):** Selecciona la región geográfica más cercana a Colombia (recomendado: `South America (São Paulo)` o `East US (North Virginia)`).
   * **Pricing Plan:** Selecciona el plan gratuito (**Free Plan - $0/mes**).
4. Haz clic en **"Create new project"** y espera aproximadamente 2 minutos mientras Supabase aprovisiona el clúster de PostgreSQL.

---

## Paso 2: Ejecución del Script SQL y Estructura Relacional

1. En el menú lateral izquierdo de Supabase, dirígete a la sección **"SQL Editor"** (icono de terminal `>_`).
2. Haz clic en **"+ New Query"**.
3. Abre el archivo `supabase_schema.sql` provisto en el proyecto, copia la totalidad de su contenido y pégalo en el editor de consultas de Supabase.
4. Haz clic en el botón verde **"Run"** (o presiona `Ctrl + Enter`).
5. Verifica que en la consola inferior aparezca el mensaje de éxito: `Success. No rows returned` o la confirmación de ejecución de bloques.
6. Dirígete a **"Table Editor"** en el menú izquierdo y comprueba que se hayan creado exitosamente las 17 tablas del sistema:
   * `roles`
   * `profiles`
   * `activities`
   * `activity_enrollments`
   * `badges`
   * `user_badges`
   * `forum_posts`
   * `forum_comments`
   * `news`
   * `environmental_reports`
   * `moderation_history`
   * `emergency_contacts`
   * `donation_campaigns`
   * `verification_requests`
   * `verification_documents`
   * `notifications`
   * `audit_logs`

---

## Paso 3: Creación y Políticas de Buckets de Almacenamiento (Storage)

El script SQL crea automáticamente los buckets requeridos. Si deseas verificar o crearlos manualmente:

1. Ve a la sección **"Storage"** en el menú izquierdo de Supabase.
2. Comprueba la existencia de los siguientes buckets:
   * `report-photos` (Público - `Public bucket: ON`): Fotografías de evidencia de incidentes.
   * `avatars` (Público - `Public bucket: ON`): Fotografías de perfil.
   * `activity-images` (Público - `Public bucket: ON`): Imágenes de jornadas de voluntariado.
   * `verification-docs` (Privado - `Public bucket: OFF`): Expedientes y títulos académicos de investigadores (protegidos mediante RLS).
3. Si alguno no se creó automáticamente, haz clic en **"New bucket"**, escribe el nombre exacto y configura su visibilidad según la lista anterior.

---

## Paso 4: Configuración de Variables de Entorno

1. En Supabase, dirígete a **Project Settings** (icono de engranaje) -> **API**.
2. Copia los siguientes dos valores:
   * **Project URL:** `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   * **Project API keys -> anon / public:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. En el directorio raíz del proyecto local:
   * Duplica el archivo `.env.example` y renómbralo a `.env`.
   * Pega tu URL y Anon Key:
     ```env
     SUPABASE_URL="https://tu-proyecto.supabase.co"
     SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     ```
4. También puedes ingresar estas credenciales directamente desde la interfaz web haciendo clic en el icono de nube `☁️` ubicado en el navbar de la plataforma. La aplicación las almacenará de forma segura en `localStorage` con sincronización inmediata.

---

## Paso 5: Configuración de Google Maps API Key y Restricciones

1. Accede a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto o selecciona uno existente (ej. `VidaMarina-ODS14`).
3. Ve a **APIs & Services** -> **Library** y habilita:
   * **Maps JavaScript API**
   * **Geocoding API**
4. Ve a **APIs & Services** -> **Credentials** -> **Create Credentials** -> **API Key**.
5. **Configurar Restricciones de Seguridad (Imprescindible):**
   * En **Application restrictions**, selecciona **Websites** (Restricción por sitios web).
   * En **Website restrictions**, añade los dominios autorizados para evitar cobros no deseados o uso indebido:
     * `http://localhost:*`
     * `http://127.0.0.1:*`
     * `https://*.vercel.app/*`
     * `https://tu-dominio-personalizado.com/*`
   * En **API restrictions**, selecciona **Restrict key** y marca únicamente *Maps JavaScript API* y *Geocoding API*.
6. Copia tu API Key e ingrésala en tu archivo `.env` (`GOOGLE_MAPS_API_KEY`) o en el modal de configuración de la plataforma.
7. *Nota de contingencia:* La plataforma cuenta con un mapa interactivo inteligente de alta precisión con presets satelitales colombianos y soporte de geolocalización HTML5 GPS nativo, permitiendo el funcionamiento 100% operativo incluso si la API Key de Google no está configurada.

---

## Paso 6: Configuración del Segundo Factor de Autenticación (2FA - TOTP)

La plataforma implementa formalmente el estándar criptográfico **RFC 6238** (Time-based One-Time Password) con HMAC-SHA1.

1. Inicia sesión con la cuenta de Administrador o Experto:
   * **Admin:** `admin@vidamarina.org` / Contraseña: `adminmarina2026`
   * **Experto:** `investigador@invemar.org.co` / Contraseña: `carlosmarino2026`
2. Dirígete a la pestaña **"Perfil"** en la barra de navegación superior.
3. En el panel **"Autenticación de Dos Factores (2FA - TOTP)"**, haz clic en **"Configurar con Google / Microsoft Authenticator"**.
4. Abre la aplicación de autenticación en tu teléfono móvil (Google Authenticator, Microsoft Authenticator o Authy) y selecciona **"Escanear código QR"** (o ingresa manualmente la clave Base32).
5. Digita el código de 6 dígitos generado por tu teléfono y presiona **"Verificar y Activar 2FA"**.
6. A partir de ese momento, cada inicio de sesión exigirá de forma real el código dinámico de tu teléfono para permitir el acceso a las funciones protegidas.

---

## Paso 7: Ejecución del Proyecto en Entorno Local

El proyecto fue diseñado con arquitectura resiliente sin dependencias pesadas de compilación previa:

### Opción A: Doble clic directo (Standalone)
1. Descomprime el archivo `Vida_Marina_Sprint1_Sprint2_Sprint3_Completo.zip`.
2. Haz doble clic en el archivo `index.html`.
3. Se abrirá inmediatamente en tu navegador web predeterminado completamente funcional.

### Opción B: Mediante Servidor Local Ligero (Recomendado)
Si cuentas con Node.js, Python o la extensión Live Server de VS Code:
* **Con Live Server (VS Code):** Clic derecho sobre `index.html` -> *Open with Live Server*.
* **Con Python:** Ejecuta en la terminal:
  ```bash
  python -m http.server 3000
  ```
  Abre `http://localhost:3000` en tu navegador.
* **Con Node.js (npx serve):**
  ```bash
  npx serve . -l 3000
  ```

---

## Paso 8: Actualización y Publicación en Repositorio GitHub

Para subir el proyecto completo a GitHub:

1. Abre tu terminal en la carpeta del proyecto:
   ```bash
   git init
   git add .
   git commit -m "feat(sprint-3): Integración completa Sprints 1, 2 y 3 - Vida Marina ODS 14"
   ```
2. Crea un nuevo repositorio en [GitHub](https://github.com/new) denominado `vida-marina-ods14`.
3. Vincula el remoto y sube la rama principal:
   ```bash
   git branch -M main
   git remote add origin https://github.com/tu-usuario/vida-marina-ods14.git
   git push -u origin main --force
   ```

---

## Paso 9: Despliegue en Producción mediante Vercel

1. Ingresa a [https://vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** -> **"Project"**.
3. Selecciona el repositorio `vida-marina-ods14` e impórtalo (**Import**).
4. En **Configure Project**:
   * **Framework Preset:** Selecciona `Other` (al ser HTML5 / Vanilla JS / React CDN).
   * **Root Directory:** `./`
5. En la sección **Environment Variables**, despliega y añade las variables de tu archivo `.env`:
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
   * `GOOGLE_MAPS_API_KEY`
6. Haz clic en **"Deploy"**.
7. En menos de 60 segundos tu plataforma estará en línea con certificado SSL gratuito (ej. `https://vida-marina-ods14.vercel.app`).

---

## Paso 10: Acceso y Navegación desde Dispositivos Móviles (Android / iOS)

1. Abre el navegador Google Chrome, Safari o Firefox en tu teléfono celular.
2. Ingresa la URL generada por Vercel o la IP local de tu computador si estás en la misma red Wi-Fi (ej. `http://192.168.1.15:3000`).
3. La interfaz cuenta con diseño 100% adaptable (**Responsive Web Design**):
   * La barra de navegación se convierte en un menú deslizante táctil.
   * En el módulo de **Contactos de Emergencia (RF06)**, los botones verdes de llamada directa activan la aplicación de teléfono nativa (`tel:146`, `tel:123`, etc.).
   * En el formulario de **Reportes Ambientales (RF05)**, el botón *"📍 Usar mi GPS Actual"* solicita el permiso nativo del dispositivo y fija las coordenadas en tiempo real.
   * Puedes instalar la web como acceso directo en la pantalla de inicio de tu teléfono seleccionando en el menú del navegador: *"Agregar a la pantalla principal"*.

---

## Costos, Límites y Planes Gratuitos

| Servicio | Plan Utilizado | Costo | Límites Gratuitos y Consideraciones |
| :--- | :--- | :--- | :--- |
| **Supabase** | Free Tier | **$0 / mes** | 500 MB base de datos, 1 GB de almacenamiento de archivos, 50.000 usuarios activos mensuales, 2 proyectos activos simultáneos. |
| **Vercel** | Hobby Tier | **$0 / mes** | Despliegue continuo ilimitado, 100 GB ancho de banda mensual, certificado SSL automático. |
| **Google Cloud** | Free Credit Tier | **$0 / mes** | Crédito recurrente gratuito de **$200 USD mensuales** para Maps JavaScript API (aproximadamente 28.000 cargas de mapa gratuitas al mes). Requiere registrar tarjeta para activación de cuenta, pero no cobra dentro del límite. |
| **Web Crypto API (2FA)** | Estándar W3C | **$0** | Nativo del navegador web; no requiere servidores externos ni pasarelas SMS pagas. |
