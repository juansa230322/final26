-- ==============================================================================
-- VIDA MARINA - ODS 14: VIDA SUBMARINA (UNIVERSIDAD MANUELA BELTRÁN)
-- SCRIPT SQL COMPLETO DE CONFIGURACIÓN Y MIGRACIÓN PARA SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Incluye: Tablas, Relaciones (FK), Restricciones (CHECK, UNIQUE), Triggers,
-- Políticas de Seguridad a Nivel de Fila (RLS), Buckets de Almacenamiento,
-- Configuración de Realtime y Datos Semilla Colombianos.
-- ==============================================================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: ROLES (RBAC)
CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLA: PERFILES DE USUARIO (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'Ciudadano' REFERENCES public.roles(id) ON UPDATE CASCADE,
    city VARCHAR(150) DEFAULT 'Cartagena de Indias',
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    level INT DEFAULT 1 CHECK (level >= 1 AND level <= 5),
    xp INT DEFAULT 0 CHECK (xp >= 0),
    two_factor_secret VARCHAR(64),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'activo' CHECK (status IN ('activo', 'suspendido', 'eliminado')),
    institution VARCHAR(255),
    specialization VARCHAR(255),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLA: ACTIVIDADES ECOLÓGICAS
CREATE TABLE IF NOT EXISTS public.activities (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    activity_date DATE NOT NULL,
    time_schedule VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    responsible VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100) DEFAULT 'Conservación',
    total_spots INT DEFAULT 25 CHECK (total_spots >= 1),
    requirements TEXT[],
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABLA: INSCRIPCIONES A ACTIVIDADES
CREATE TABLE IF NOT EXISTS public.activity_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id VARCHAR(100) REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (activity_id, user_id)
);

-- 6. TABLA: INSIGNIAS Y RECONOCIMIENTOS (BADGES)
CREATE TABLE IF NOT EXISTS public.badges (
    id VARCHAR(100) PRIMARY KEY,
    icon VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    requirement TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'Conservación',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABLA: INSIGNIAS DE USUARIOS
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id VARCHAR(100) REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_by VARCHAR(255) DEFAULT 'Coordinación UMB',
    awarded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (user_id, badge_id)
);

-- 8. TABLA: FORO COMUNITARIO Y CIENTÍFICO (PUBLICACIONES)
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id VARCHAR(100) PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    role VARCHAR(50) DEFAULT 'Ciudadano',
    category VARCHAR(100) DEFAULT 'Conservación',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    likes INT DEFAULT 0 CHECK (likes >= 0),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    is_scientific BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. TABLA: COMENTARIOS DEL FORO
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id VARCHAR(100) PRIMARY KEY,
    post_id VARCHAR(100) REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) DEFAULT 'Ciudadano',
    author_avatar TEXT,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. TABLA: NOTICIAS AMBIENTALES
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    category VARCHAR(100) DEFAULT 'ODS 14',
    author_name VARCHAR(255) DEFAULT 'Redacción Vida Marina',
    published_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. TABLA: REPORTES AMBIENTALES GEOLOCALIZADOS (RF05)
CREATE TABLE IF NOT EXISTS public.environmental_reports (
    id VARCHAR(100) PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255),
    reporter_role VARCHAR(50) DEFAULT 'Ciudadano',
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('vertimiento', 'pesca_ilegal', 'derrame', 'plasticos', 'otros')),
    description TEXT NOT NULL,
    incident_date DATE NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude NUMERIC(10, 6) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    address VARCHAR(255) DEFAULT 'Zona Costera Marítima',
    photos TEXT[],
    status VARCHAR(30) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
    moderation_notes TEXT,
    moderated_by VARCHAR(255),
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. TABLA: HISTORIAL DE MODERACIÓN DE REPORTES
CREATE TABLE IF NOT EXISTS public.moderation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(100) REFERENCES public.environmental_reports(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    moderator_name VARCHAR(255) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. TABLA: CONTACTOS DE EMERGENCIA (RF06)
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'lineas_emergencia', 'autoridades_costeras', 'guardia_costera',
        'centros_rescate', 'ongs', 'brigadas'
    )),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    website TEXT,
    location VARCHAR(255) DEFAULT 'Colombia',
    description TEXT,
    is_24h BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 14. TABLA: CAMPAÑAS DE DONACIÓN
CREATE TABLE IF NOT EXISTS public.donation_campaigns (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) DEFAULT 0.00 CHECK (current_amount >= 0),
    donor_count INT DEFAULT 0 CHECK (donor_count >= 0),
    organizer VARCHAR(255) DEFAULT 'Fundación Vida Marina UMB',
    image TEXT,
    deadline DATE,
    status VARCHAR(30) DEFAULT 'activa' CHECK (status IN ('activa', 'completada', 'pausada')),
    category VARCHAR(100) DEFAULT 'Restauración Coralina',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 15. TABLA: SOLICITUDES DE VERIFICACIÓN DE EXPERTOS Y ONG (RF10)
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    current_role VARCHAR(50) DEFAULT 'Ciudadano',
    institution VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    professional_bio TEXT,
    status VARCHAR(30) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
    feedback TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 16. TABLA: DOCUMENTOS DE VERIFICACIÓN (ADJUNTOS)
CREATE TABLE IF NOT EXISTS public.verification_documents (
    id VARCHAR(100) PRIMARY KEY,
    request_id VARCHAR(100) REFERENCES public.verification_requests(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) DEFAULT 'application/pdf',
    document_url TEXT NOT NULL,
    file_size VARCHAR(50),
    uploaded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 17. TABLA: NOTIFICACIONES DEL SISTEMA
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL, -- UUID de usuario o 'all'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 18. TABLA: AUDITORÍA DE ACCIONES ADMINISTRATIVAS (AUDIT LOGS)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    admin_id VARCHAR(100) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 19. FUNCIONES Y TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMPS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_timestamp ON public.profiles;
CREATE TRIGGER trigger_update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_update_reports_timestamp ON public.environmental_reports;
CREATE TRIGGER trigger_update_reports_timestamp
BEFORE UPDATE ON public.environmental_reports
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_update_forum_timestamp ON public.forum_posts;
CREATE TRIGGER trigger_update_forum_timestamp
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==============================================================================
-- 20. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública:
CREATE POLICY "Lectura pública de actividades" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Lectura pública de insignias" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Lectura pública de contactos" ON public.emergency_contacts FOR SELECT USING (true);
CREATE POLICY "Lectura pública de campañas" ON public.donation_campaigns FOR SELECT USING (true);
CREATE POLICY "Lectura pública de publicaciones" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Lectura pública de comentarios" ON public.forum_comments FOR SELECT USING (true);

-- Reportes: los reportes aprobados son públicos; los pendientes o rechazados sólo visibles por el creador o por el admin
CREATE POLICY "Lectura de reportes públicos" ON public.environmental_reports
FOR SELECT USING (
    status = 'aprobado' 
    OR (auth.uid() IS NOT NULL AND auth.uid()::text = reporter_id::text)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id::text = auth.uid()::text AND role = 'Administrador')
);

-- Creación de reportes: cualquier usuario autenticado o anónimo autorizado
CREATE POLICY "Creación de reportes ambientales" ON public.environmental_reports
FOR INSERT WITH CHECK (true);

-- Verificación de documentos: sólo el dueño o el admin pueden leer
CREATE POLICY "Lectura privada de documentos" ON public.verification_documents
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id::text = auth.uid()::text AND role = 'Administrador')
    OR EXISTS (
        SELECT 1 FROM public.verification_requests vr 
        WHERE vr.id = request_id AND vr.user_id::text = auth.uid()::text
    )
);

-- ==============================================================================
-- 21. BUCKETS DE ALMACENAMIENTO DE SUPABASE (STORAGE)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('report-photos', 'report-photos', true),
    ('avatars', 'avatars', true),
    ('activity-images', 'activity-images', true),
    ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Acceso público a fotos de reportes" ON storage.objects
FOR SELECT USING (bucket_id = 'report-photos');

CREATE POLICY "Subida de fotos de reportes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'report-photos');

CREATE POLICY "Documentos de verificación privados" ON storage.objects
FOR SELECT USING (bucket_id = 'verification-docs' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 22. CONFIGURACIÓN DE SUPABASE REALTIME
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.environmental_reports;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignorar si ya están añadidas
END $$;

-- ==============================================================================
-- 23. DATOS SEMILLA (COLOMBIAN SEED DATA)
-- ==============================================================================

-- Inserción de Roles
INSERT INTO public.roles (id, name, description) VALUES
('Administrador', 'Administrador General', 'Control total de la plataforma, moderación, RBAC y auditoría.'),
('Experto', 'Investigador / Experto ODS 14', 'Acreditación científica para publicar investigaciones y análisis.'),
('Voluntario', 'Voluntario Activo', 'Inscripción a actividades, progreso ecológico y reportes.'),
('Ciudadano', 'Ciudadano Consciente', 'Consulta de información, reportes y solicitud de verificación.')
ON CONFLICT (id) DO NOTHING;

-- Inserción de Insignias Oficiales
INSERT INTO public.badges (id, icon, name, description, requirement, category) VALUES
('badge-1', '🛡️', 'Guardián del Océano', 'Reconocimiento a ciudadanos y voluntarios con compromiso ejemplar en la protección marina.', 'Completar 1 actividad oficial de conservación', 'Conservación'),
('badge-2', '🪸', 'Arrecife Vivo', 'Acreditación por participación directa en siembra y restauración de corales.', 'Participar en jornadas de guarderías coralinas', 'Restauración'),
('badge-3', '🔬', 'Científico Marino', 'Distinción a investigadores acreditados que generan ciencia abierta en ODS 14.', 'Completar verificación académica y publicar investigaciones', 'Ciencia'),
('badge-4', '👑', 'Líder de Conservación', 'Máximo reconocimiento directivo en gestión, gobernanza y coordinación marina.', 'Rol directivo o coordinador oficial', 'Liderazgo'),
('badge-5', '🐢', 'Protector de Fauna Marina', 'Compromiso activo en rescate, monitoreo y liberación de especies protegidas.', 'Participar en monitoreo de tortugas o mamíferos', 'Fauna'),
('badge-6', '🌊', 'Observador Costero', 'Aporte de datos y reportes geolocalizados validados sobre el estado de las costas.', 'Reportar incidentes ambientales aprobados en el mapa', 'Reportes'),
('badge-7', '💬', 'Voz Comunitaria', 'Fomento activo del debate constructivo y la educación ecológica en el foro.', 'Publicar temas de interés ambiental en el foro comunitario', 'Comunidad'),
('badge-8', '⭐', 'Voluntario Ejemplar', 'Dedicación constante participando en múltiples actividades de campo.', 'Inscribirse y participar en al menos 3 actividades', 'Voluntariado')
ON CONFLICT (id) DO NOTHING;

-- Inserción de Contactos de Emergencia Reales de Colombia (RF06)
INSERT INTO public.emergency_contacts (id, name, category, phone, email, website, location, description, is_24h, verified) VALUES
('cont-1', 'Línea 146 - Guardacostas Armada Nacional de Colombia', 'guardia_costera', '146', 'guardacostas@armada.mil.co', 'https://www.armada.mil.co', 'Nacional (Caribe y Pacífico)', 'Línea de emergencia marítima nacional para rescate en el mar, interdicción de pesca ilegal y respuesta a naufragios.', true, true),
('cont-2', 'DIMAR - Dirección General Marítima de Colombia', 'autoridades_costeras', '+57 (601) 2200490', 'dimar@dimar.mil.co', 'https://www.dimar.mil.co', 'Bogotá / Capitanías de Puerto Costeras', 'Autoridad marítima colombiana responsable de la seguridad de la navegación y prevención de contaminación marina.', true, true),
('cont-3', 'INVEMAR - Instituto de Investigaciones Marinas y Costeras', 'centros_rescate', '+57 (605) 4329300', 'contacto@invemar.org.co', 'https://www.invemar.org.co', 'Santa Marta, Magdalena', 'Instituto científico líder en biodiversidad marina y Centro de Atención, Valoración y Rehabilitación de Fauna Marina (CAV-R).', false, true),
('cont-4', 'Línea Nacional 123 y PONALSAR (Policía de Salvamento y Rescate)', 'lineas_emergencia', '123', 'ponalsar@policia.gov.co', 'https://www.policia.gov.co', 'Nacional Colombia', 'Línea única de seguridad y emergencias con enlace directo a brigadas de salvamento acuático y rescate costero.', true, true),
('cont-5', 'MinAmbiente - Línea Verde de Denuncias Ambientales', 'lineas_emergencia', '018000 915060', 'servicioalciudadano@minambiente.gov.co', 'https://www.minambiente.gov.co', 'Nacional', 'Canal oficial del Ministerio de Ambiente para denunciar delitos ecológicos, derrames y vertimientos tóxicos en ecosistemas marinos.', true, true),
('cont-6', 'CORALINA - Corporación para el Desarrollo Sostenible de San Andrés', 'autoridades_costeras', '+57 (608) 5126853', 'coralina@coralina.gov.co', 'https://www.coralina.gov.co', 'San Andrés, Providencia y Santa Catalina', 'Autoridad ambiental de la Reserva de Biosfera Seaflower, protección de arrecifes, pastos marinos y manglares.', false, true),
('cont-7', 'CARDIQUE - Corporación Autónoma Regional del Canal del Dique', 'autoridades_costeras', '+57 (605) 6695240', 'contacto@cardique.gov.co', 'https://www.cardique.gov.co', 'Cartagena y Bolívar Costero', 'Control ambiental en la Bahía de Cartagena, ciénagas costeras y el ecosistema del Canal del Dique.', false, true),
('cont-8', 'CORPAMAG - Corporación Autónoma Regional del Magdalena', 'autoridades_costeras', '+57 (605) 4380300', 'contactenos@corpamag.gov.co', 'https://www.corpamag.gov.co', 'Santa Marta, Magdalena', 'Vigilancia ambiental costera, manglares de la Ciénaga Grande y playas turísticas del departamento del Magdalena.', false, true),
('cont-9', 'Fundación Malpelo y Otros Ecosistemas Marinos', 'ongs', '+57 (601) 6127415', 'info@fundacionmalpelo.org', 'https://www.fundacionmalpelo.org', 'Santuario de Flora y Fauna Malpelo, Pacífico', 'Organización pionera en la investigación, conservación y monitoreo de tiburones y ecosistemas pelágicos en el Pacífico.', false, true),
('cont-10', 'WWF Colombia - Fondo Mundial para la Naturaleza', 'ongs', '+57 (602) 5582577', 'contacto@wwf.org.co', 'https://www.wwf.org.co', 'Cali / Oficinas Costeras', 'Organización global de conservación que lidera proyectos de áreas marinas protegidas y pesquerías sostenibles en Colombia.', false, true),
('cont-11', 'Defensa Civil Colombiana - Seccional Costa Atlántica', 'brigadas', '144', 'atlantico@defensacivil.gov.co', 'https://www.defensacivil.gov.co', 'Región Caribe y Costa Pacífica', 'Respuesta inmediata ante desastres naturales costeros, inundaciones, marejadas y rescate de bañistas.', true, true),
('cont-12', 'Centro de Rehabilitación de Tortugas Marinas - Acuario San Martín', 'centros_rescate', '+57 (605) 6655757', 'conservacion@oceanario.co', 'https://www.oceanario.co', 'Islas del Rosario, Cartagena', 'Atención médica veterinaria, cirugía y rehabilitación de tortugas marinas rescatadas de redes de pesca o varamientos.', true, true)
ON CONFLICT (id) DO NOTHING;

-- Inserción de Actividades Iniciales
INSERT INTO public.activities (id, name, description, image, activity_date, time_schedule, location, responsible, activity_type, total_spots, requirements) VALUES
('act-1', 'Gran Limpieza de Playas y Manglares en Barú', 'Jornada comunitaria de recolección de microplásticos y residuos sólidos en el ecosistema de manglar de Playa Blanca, Barú.', 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80', '2026-11-28', '08:00 AM - 01:00 PM', 'Playa Blanca, Isla de Barú, Cartagena', 'Dra. Marina Castillo', 'Limpieza Costera', 30, ARRAY['Guantes de carnaza', 'Termo reutilizable para agua', 'Protector solar biodegradable', 'Ropa cómoda']),
('act-2', 'Siembra y Monitoreo de Fragmentos de Coral Acropora', 'Instalación de guarderías coralinas y siembra de fragmentos de coral cuerno de ciervo en el Parque Nacional Natural Tayrona.', 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80', '2026-12-05', '07:30 AM - 03:00 PM', 'Bahía Concha, PNN Tayrona, Santa Marta', 'Dr. Carlos Arrecife', 'Restauración Coralina', 15, ARRAY['Certificación de Buceo Open Water', 'Equipo básico de snorkel', 'Seguro de buceo vigente']),
('act-3', 'Taller de Conservación de Tortugas Caretta y Carey', 'Capacitación comunitaria sobre protección de nidadas de tortugas marinas en las playas de San Andrés y Providencia.', 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&w=800&q=80', '2026-12-12', '02:00 PM - 06:00 PM', 'Centro de Formación Coralina, San Andrés Islas', 'Sofía Océano', 'Educación Ambiental', 40, ARRAY['Libreta de apuntes', 'Interés en biodiversidad marina']),
('act-4', 'Censo Visual de Peces Loro y Especies Clave', 'Levantamiento de transectos submarinos para evaluar la abundancia de peces herbívoros controladores de macroalgas en arrecifes.', 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=800&q=80', '2026-12-19', '09:00 AM - 02:00 PM', 'Isla de Gorgona, Pacífico Colombiano', 'Dr. Carlos Arrecife', 'Investigación Científica', 12, ARRAY['Experiencia en censo de fauna marina', 'Buceo avanzado'])
ON CONFLICT (id) DO NOTHING;

-- Inserción de Campañas de Donación
INSERT INTO public.donation_campaigns (id, title, description, target_amount, current_amount, donor_count, organizer, image, deadline, status, category) VALUES
('camp-1', 'Restauración de 5.000 Fragmentos de Arrecife en Islas del Rosario', 'Campaña orientada a financiar guarderías de coral y siembra de especies Acropora palmata para proteger la biodiversidad en el Caribe.', 25000000.00, 18750000.00, 42, 'Fundación Vida Marina UMB & Oceanario', 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80', '2026-12-31', 'activa', 'Restauración Coralina'),
('camp-2', 'Protección y Monitoreo Satelital de Tortugas Canaj en La Guajira', 'Instalación de transmisores satelitales en hembras anidadoras de tortuga laúd y protección de playas de desove junto a comunidades Wayúu.', 18000000.00, 14200000.00, 31, 'Red de Conservación de Tortugas Marinas de Colombia', 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&w=800&q=80', '2026-12-15', 'activa', 'Protección de Fauna'),
('camp-3', 'Barrera Atrapaplásticos Flotante para la Bahía de Buenaventura', 'Construcción e instalación de una bio-barrera flotante con mallas biodegradables para retener residuos plásticos antes de llegar al océano.', 30000000.00, 30000000.00, 68, 'Colectivo Pacífico Limpio & Alcaldía de Buenaventura', 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80', '2026-11-20', 'completada', 'Desplastificación Marina')
ON CONFLICT (id) DO NOTHING;
