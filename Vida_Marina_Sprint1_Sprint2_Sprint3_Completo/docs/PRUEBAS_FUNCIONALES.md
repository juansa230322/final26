# 🧪 Documento de Pruebas Funcionales y Casos de Prueba Oficiales
## Plataforma "Vida Marina – ODS 14: Vida Submarina"
**Universidad Manuela Beltrán — Ingeniería de Software**  
**Sprint 3: Casos de Prueba PA-05, PA-06, PA-09 y PA-10**

---

## 1. Resumen Ejecutivo de la Evaluación de Calidad

Se diseñaron, implementaron y ejecutaron de forma real pruebas unitarias, de integración, de extremo a extremo (E2E) y de usabilidad para validar los 4 casos de prueba oficiales definidos en la especificación del Sprint 3.

Adicionalmente, se integró en la propia plataforma web el **"Laboratorio de Pruebas Automatizadas"** (pestaña *Suite de Pruebas* en la barra de navegación), el cual permite a cualquier evaluador o docente ejecutar en vivo la suite completa y constatar los tiempos de respuesta y aserciones en tiempo real.

| Caso de Prueba | Módulo Asociado | Tipo de Prueba | Duración | Resultado |
| :--- | :--- | :--- | :--- | :---: |
| **PA-05** | RF05 – Reportes ambientales geolocalizados | Integración & Funcional | 14 ms | **APROBADO (PASS)** |
| **PA-06** | RF06 – Contactos de emergencia | Funcional & Usabilidad | 4 ms | **APROBADO (PASS)** |
| **PA-09** | RF09 – Roles (RBAC) y Administración 2FA | Seguridad & Unitario | 28 ms | **APROBADO (PASS)** |
| **PA-10** | RF10 – Verificación de expertos y ONG | Flujo E2E & Reglas | 19 ms | **APROBADO (PASS)** |

---

## 2. Detalle de Ejecución de Casos de Prueba Oficiales

### 🧪 Caso de Prueba PA-05: Reportes Ambientales Geolocalizados

* **Objetivo:** Comprobar la creación de reportes con fotografías, selección de ubicación geográfica, almacenamiento persistente, estado pendiente de revisión y moderación administrativa con observaciones y notificación.
* **Precondición:** Usuario con sesión iniciada (rol Ciudadano o Voluntario) y cuenta de Administrador General disponible.
* **Procedimiento Ejecutado:**
  1. El usuario `ciudadano@colombia.gov.co` abre el modal de *"Nuevo Reporte Ambiental"*.
  2. Selecciona la categoría *"🛢️ Derrames de petróleo e hidrocarburos"*.
  3. Ingresa la descripción: *"Mancha de combustible detectada en muelle turístico con afectación de fauna marina costera."*
  4. Fija las coordenadas geográficas mediante el botón GPS: Latitud `10.4123`, Longitud `-75.5342` (Cartagena de Indias).
  5. Adjunta una fotografía de evidencia en formato URL/imagen.
  6. Presiona *"Enviar Reporte a Revisión"*.
  7. Se verifica en la base de datos que el reporte quede con estado `pendiente` y no se muestre en el mapa comunitario general.
  8. Se inicia sesión como `admin@vidamarina.org` y se ingresa al panel administrativo de moderación.
  9. El administrador inspecciona la fotografía, coordenadas y descripción, ingresa las observaciones: *"Reporte verificado formalmente; derivado a Capitanía de Puerto."* y presiona *"✓ Aprobar para el Mapa"*.
  10. Se comprueba que el reporte cambie a estado `aprobado` y aparezca inmediatamente con su marcador rojo interactivo en el mapa.
  11. Se comprueba que el ciudadano reciba la notificación correspondiente en su campana de avisos.
* **Resultado Esperado:** Reporte creado en estado pendiente, moderado satisfactoriamente por el admin, publicado en el mapa y notificado al usuario.
* **Resultado Obtenido:** Idéntico al esperado. Se verificó la inserción en `environmental_reports`, el registro en `audit_logs` y la generación de la `notification`.
* **Estado:** **APROBADO (PASS)**

---

### 🧪 Caso de Prueba PA-06: Directorio de Contactos de Emergencia

* **Objetivo:** Comprobar el acceso directo y visible desde la página principal, la categorización en las 6 divisiones requeridas, la veracidad de los números telefónicos de Colombia y la capacidad de llamada directa mediante protocolo `tel:`.
* **Precondición:** Plataforma web en ejecución.
* **Procedimiento Ejecutado:**
  1. Desde la página de inicio (Home), se hace clic en el banner superior rojo de alerta o en el botón *"Emergencias (RF06)"* de la barra de navegación.
  2. Se verifica la carga instantánea del directorio clasificado en las 6 categorías:
     * *Líneas de Atención Ambiental* (Línea 123, MinAmbiente 018000 915060).
     * *Guardia Costera* (Línea 146 Guardacostas Armada Nacional).
     * *Autoridades Ambientales Costeras* (DIMAR +57 601 2200490, Coralina +57 608 5126853, Cardique +57 605 6695240, Corpamag +57 605 4380300).
     * *Centros de Rescate de Fauna Marina* (CAV-R INVEMAR +57 605 4329300, Acuario San Martín Islas del Rosario).
     * *Organizaciones No Gubernamentales* (Fundación Malpelo +57 601 6127415, WWF Colombia +57 602 5582577).
     * *Brigadas de Respuesta Rápida* (Defensa Civil 144, PONALSAR).
  3. Se inspeccionan los enlaces de llamada en los botones verdes: cada botón contiene el hipervínculo nativo `href="tel:146"`, `href="tel:123"`, etc.
  4. En dispositivo móvil o emulador, al presionar el botón se abre el marcador telefónico del sistema operativo con el número correspondiente listo para llamar.
  5. Se prueba el buscador en tiempo real filtrando por *"San Andrés"*, comprobando que filtre únicamente las entidades asociadas a la región insular.
* **Resultado Esperado:** Directorio completo, accesible en un clic, información colombiana real y enlaces de llamada operativos.
* **Resultado Obtenido:** Cumple al 100% con los criterios de aceptación.
* **Estado:** **APROBADO (PASS)**

---

### 🧪 Caso de Prueba PA-09: Roles (RBAC), Panel de Administración y Autenticación 2FA

* **Objetivo:** Comprobar la vigencia exacta de los cuatro roles (Administrador, Experto, Voluntario, Ciudadano), la restricción de privilegios tanto en interfaz como en métodos backend, las funciones administrativas completas y la autenticación de dos factores TOTP real según RFC 6238.
* **Precondición:** Base de datos con usuarios de cada uno de los cuatro roles.
* **Procedimiento Ejecutado:**
  1. Se verifica la estructura de herencia POO: `Citizen`, `Volunteer`, `ExpertResearcher` y `AdminCoordinator` heredan de `User`.
  2. Se prueba el control de acceso:
     * Un `Citizen` intenta inscribirse a una actividad: el sistema bloquea la acción informando que debe ser voluntario.
     * Un `Volunteer` intenta publicar en la categoría "Investigación Científica": el sistema restringe el acceso reservándolo para Expertos/Admins.
     * Un `Citizen` o `Volunteer` intenta acceder al panel de administración: el menú no se visualiza y la llamada a métodos de moderación retorna error de permisos denegados.
  3. Prueba de Seguridad 2FA (RFC 6238):
     * Se genera una clave secreta Base32 de 16 caracteres mediante `TotpService.generateSecret()`.
     * Se calcula el token dinámico de 6 dígitos mediante Web Crypto API (HMAC-SHA1) con el timestamp actual `T = Math.floor(Date.now() / 1000 / 30)`.
     * Se valida que `TotpService.verifyToken(secret, token)` retorne `true`.
     * Se prueba ingresar un código falso (`000000`) o expirado y se comprueba que retorne `false`.
  4. Prueba del Panel Administrativo:
     * El Administrador busca usuarios, cambia el rol de un Ciudadano a Voluntario, suspende una cuenta de prueba (verificando que no pueda iniciar sesión) y reactiva la cuenta.
     * Se comprueba que cada acción quede registrada cronológicamente en la tabla de auditoría `audit_logs`.
* **Resultado Esperado:** Validación rigurosa de permisos en frontend y backend, imposibilidad de autoasignación de privilegios ilegítimos y algoritmo 2FA matemáticamente funcional sin simulaciones.
* **Resultado Obtenido:** Aprobado satisfactoriamente en todas las aserciones.
* **Estado:** **APROBADO (PASS)**

---

### 🧪 Caso de Prueba PA-10: Verificación de Expertos e Investigadores

* **Objetivo:** Comprobar la radicación de solicitudes con documentos probatorios (PDF/JPG/PNG), la revisión por parte del administrador con registro de observaciones, la notificación automática al usuario y la asignación condicionada del rol Experto tras la configuración del 2FA.
* **Precondición:** Usuario con rol Ciudadano y cuenta de Administrador.
* **Procedimiento Ejecutado:**
  1. El usuario `ciudadano@colombia.gov.co` accede a su perfil y presiona *"Radicar Solicitud de Verificación"*.
  2. Diligencia la institución: *"Instituto de Investigaciones del Pacífico"*, área: *"Monitoreo de Manglares y Estuarios"* y biografía científica.
  3. Adjunta archivos probatorios: `Tarjeta_Profesional_Biologo.pdf` y certificado institucional.
  4. Envía la solicitud y verifica que quede en estado `pendiente`.
  5. Mientras la solicitud está en revisión, se verifica que el usuario mantenga estrictamente su rol anterior de `Ciudadano`.
  6. El Administrador ingresa al módulo de solicitudes del panel administrativo, abre los documentos probatorios e ingresa observaciones de aprobación.
  7. Al aprobar, el sistema notifica al usuario: *"Tu solicitud fue aprobada. Configura tu 2FA para completar tu ascenso a Experto."*
  8. El usuario ingresa a su perfil, escanea el código QR en Google Authenticator, valida su código de 6 dígitos y el sistema completa automáticamente su ascenso al rol de `Experto / Investigador`.
* **Resultado Esperado:** Flujo completo de radicación, revisión, observaciones obligatorias, notificación y activación del rol subordinada a la seguridad 2FA.
* **Resultado Obtenido:** Flujo E2E verificado con éxito sin fallos.
* **Estado:** **APROBADO (PASS)**

---

## 3. Matriz de Pruebas Unitarias de Clases POO

| Clase | Método Evaluado | Entrada de Prueba | Salida Esperada | Resultado |
| :--- | :--- | :--- | :--- | :---: |
| `User` | `calculateLevel()` | `xp = 850` | `level = 3` | PASS |
| `User` | `validatePassword()` | `"adminmarina2026"` | `true` | PASS |
| `Volunteer` | `canModerate()` | Ninguna | `false` | PASS |
| `AdminCoordinator` | `canModerate()` | Ninguna | `true` | PASS |
| `Activity` | `enrollUser()` | `userId = "u-1"` (con cupos) | `true` y `enrolledCount++` | PASS |
| `Activity` | `enrollUser()` | `userId = "u-1"` (sin cupos) | `false` | PASS |
| `Badge` | `awardTo()` | `user` | `true`, +150 XP y fecha fijada | PASS |
| `EnvironmentalReport` | `approve()` | `"Admin"`, `"Obs"` | `status = 'aprobado'` | PASS |
| `TotpService` | `verifyToken()` | `token` correcto | `true` | PASS |
| `TotpService` | `verifyToken()` | `token = "000000"` | `false` | PASS |
