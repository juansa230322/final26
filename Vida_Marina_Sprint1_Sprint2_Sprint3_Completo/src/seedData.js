/**
 * ================================================================
 * DATOS SEMILLA: SEED_DATA (Vida Marina - ODS 14)
 * ================================================================
 * Datos colombianos reales y verificables para poblar el sistema
 * en los modos LocalStorage y Supabase.
 */
const SEED_DATA = {
  users: [
    {
      id: 'admin-marina',
      name: 'Dra. Marina Castillo',
      email: 'admin@vidamarina.org',
      password: 'adminmarina2026',
      city: 'Cartagena de Indias',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      role: 'Administrador',
      level: 5,
      xp: 3200,
      department: 'Dirección Científica y Comunitaria UMB',
      twoFactorSecret: 'JBSWY3DPEHPK3PXP', // Secreto Base32 pre-configurado
      twoFactorEnabled: true,
      status: 'activo',
      enrolledActivityIds: ['act-1', 'act-2', 'act-3'],
      earnedBadgeIds: ['badge-1', 'badge-2', 'badge-3', 'badge-4', 'badge-5']
    },
    {
      id: 'expert-carlos',
      name: 'Dr. Carlos Arrecife',
      email: 'investigador@invemar.org.co',
      password: 'carlosmarino2026',
      city: 'Santa Marta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Experto',
      level: 4,
      xp: 1850,
      institution: 'INVEMAR - Instituto de Investigaciones Marinas',
      specialization: 'Ecología de Arrecifes de Coral y Acidificación Oceánica',
      twoFactorSecret: 'KRSXG5CTMVRXEZLU',
      twoFactorEnabled: true,
      status: 'activo',
      enrolledActivityIds: ['act-2', 'act-4'],
      earnedBadgeIds: ['badge-2', 'badge-3', 'badge-6']
    },
    {
      id: 'vol-sofia',
      name: 'Sofía Océano',
      email: 'voluntario@vidamarina.org',
      password: 'sofiapass2026',
      city: 'San Andrés Islas',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      role: 'Voluntario',
      level: 3,
      xp: 950,
      status: 'activo',
      enrolledActivityIds: ['act-1', 'act-3'],
      earnedBadgeIds: ['badge-1', 'badge-7']
    },
    {
      id: 'user-mateo',
      name: 'Mateo Costero',
      email: 'ciudadano@colombia.gov.co',
      password: 'mateocosta2026',
      city: 'Buenaventura',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      role: 'Ciudadano',
      level: 1,
      xp: 120,
      status: 'activo',
      enrolledActivityIds: [],
      earnedBadgeIds: []
    }
  ],

  activities: [
    {
      id: 'act-1',
      name: 'Gran Limpieza de Playas y Manglares en Barú',
      description: 'Jornada comunitaria de recolección de microplásticos y residuos sólidos en el ecosistema de manglar de Playa Blanca, Barú.',
      image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80',
      date: '2026-11-28',
      time: '08:00 AM - 01:00 PM',
      location: 'Playa Blanca, Isla de Barú, Cartagena',
      responsible: 'Dra. Marina Castillo',
      type: 'Limpieza Costera',
      totalSpots: 30,
      enrolledCount: 2,
      enrolledUserIds: ['admin-marina', 'vol-sofia'],
      requirements: ['Guantes de carnaza', 'Termo reutilizable para agua', 'Protector solar biodegradable', 'Ropa cómoda']
    },
    {
      id: 'act-2',
      name: 'Siembra y Monitoreo de Fragmentos de Coral Acropora',
      description: 'Instalación de guarderías coralinas y siembra de fragmentos de coral cuerno de ciervo en el Parque Nacional Natural Tayrona.',
      image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80',
      date: '2026-12-05',
      time: '07:30 AM - 03:00 PM',
      location: 'Bahía Concha, PNN Tayrona, Santa Marta',
      responsible: 'Dr. Carlos Arrecife',
      type: 'Restauración Coralina',
      totalSpots: 15,
      enrolledCount: 2,
      enrolledUserIds: ['admin-marina', 'expert-carlos'],
      requirements: ['Certificación de Buceo Open Water', 'Equipo básico de snorkel', 'Seguro de buceo vigente']
    },
    {
      id: 'act-3',
      name: 'Taller de Conservación de Tortugas Caretta y Carey',
      description: 'Capacitación comunitaria sobre protección de nidadas de tortugas marinas en las playas de San Andrés y Providencia.',
      image: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&w=800&q=80',
      date: '2026-12-12',
      time: '02:00 PM - 06:00 PM',
      location: 'Centro de Formación Coralina, San Andrés Islas',
      responsible: 'Sofía Océano',
      type: 'Educación Ambiental',
      totalSpots: 40,
      enrolledCount: 2,
      enrolledUserIds: ['admin-marina', 'vol-sofia'],
      requirements: ['Libreta de apuntes', 'Interés en biodiversidad marina']
    },
    {
      id: 'act-4',
      name: 'Censo Visual de Peces Loro y Especies Clave',
      description: 'Levantamiento de transectos submarinos para evaluar la abundancia de peces herbívoros controladores de macroalgas en arrecifes.',
      image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=800&q=80',
      date: '2026-12-19',
      time: '09:00 AM - 02:00 PM',
      location: 'Isla de Gorgona, Pacífico Colombiano',
      responsible: 'Dr. Carlos Arrecife',
      type: 'Investigación Científica',
      totalSpots: 12,
      enrolledCount: 1,
      enrolledUserIds: ['expert-carlos'],
      requirements: ['Experiencia en censo de fauna marina', 'Buceo avanzado']
    }
  ],

  badges: [
    {
      id: 'badge-1',
      icon: '🛡️',
      name: 'Guardián del Océano',
      description: 'Reconocimiento a ciudadanos y voluntarios con compromiso ejemplar en la protección marina.',
      requirement: 'Completar 1 actividad oficial de conservación',
      earnedAt: '15 de Octubre de 2026'
    },
    {
      id: 'badge-2',
      icon: '🪸',
      name: 'Arrecife Vivo',
      description: 'Acreditación por participación directa en siembra y restauración de corales.',
      requirement: 'Participar en jornadas de guarderías coralinas',
      earnedAt: '20 de Octubre de 2026'
    },
    {
      id: 'badge-3',
      icon: '🔬',
      name: 'Científico Marino',
      description: 'Distinción a investigadores acreditados que generan ciencia abierta en ODS 14.',
      requirement: 'Completar proceso de verificación académica y publicar investigaciones',
      earnedAt: '01 de Noviembre de 2026'
    },
    {
      id: 'badge-4',
      icon: '👑',
      name: 'Líder de Conservación',
      description: 'Máximo reconocimiento directivo en gestión, gobernanza y coordinación marina.',
      requirement: 'Rol directivo o coordinador oficial',
      earnedAt: '10 de Septiembre de 2026'
    },
    {
      id: 'badge-5',
      icon: '🐢',
      name: 'Protector de Fauna Marina',
      description: 'Compromiso activo en rescate, monitoreo y liberación de especies protegidas.',
      requirement: 'Participar en monitoreo de tortugas o mamíferos marinos',
      earnedAt: '05 de Noviembre de 2026'
    },
    {
      id: 'badge-6',
      icon: '🌊',
      name: 'Observador Costero',
      description: 'Aporte de datos y reportes geolocalizados validados sobre el estado de las costas.',
      requirement: 'Reportar incidentes ambientales aprobados en el mapa',
      earnedAt: null
    },
    {
      id: 'badge-7',
      icon: '💬',
      name: 'Voz Comunitaria',
      description: 'Fomento activo del debate constructivo y la educación ecológica en el foro.',
      requirement: 'Publicar temas de interés ambiental en el foro comunitario',
      earnedAt: '12 de Noviembre de 2026'
    },
    {
      id: 'badge-8',
      icon: '⭐',
      name: 'Voluntario Ejemplar',
      description: 'Dedicación constante participando en múltiples actividades de campo.',
      requirement: 'Inscribirse y participar en al menos 3 actividades',
      earnedAt: null
    }
  ],

  forum: [
    {
      id: 'post-1',
      author: 'Dr. Carlos Arrecife',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Experto',
      category: 'Investigación Científica',
      date: 'Hace 3 horas',
      title: 'Resultados del Monitoreo Térmico en los Arrecifes de las Islas del Rosario 2026',
      content:
        'Estimada comunidad científica y voluntaria: presentamos los datos de temperatura superficial del mar recolectados con sondas multiparamétricas en el Parque Nacional Natural Corales del Rosario. Observamos una estabilización térmica gracias a corrientes de surgencia, lo que ha mitigado el blanqueamiento en colonias de Montastraea cavernosa.',
      likes: 18,
      likedByUserIds: ['admin-marina', 'vol-sofia'],
      isPinned: true,
      isScientific: true,
      comments: [
        {
          id: 'comm-1-1',
          author: 'Dra. Marina Castillo',
          role: 'Administrador',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
          date: 'Hace 2 horas',
          text: 'Excelente reporte, Dr. Carlos. Integraremos estos datos en el informe oficial de gestión del ODS 14 para la Universidad Manuela Beltrán.'
        },
        {
          id: 'comm-1-2',
          author: 'Sofía Océano',
          role: 'Voluntario',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          date: 'Hace 1 hora',
          text: '¡Muy esperanzador! En la próxima siembra de corales llevaremos los registros fotográficos submarinos.'
        }
      ]
    },
    {
      id: 'post-2',
      author: 'Sofía Océano',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      role: 'Voluntario',
      category: 'Conservación',
      date: 'Ayer',
      title: 'Experiencia inolvidable en la jornada de limpieza submarina en San Andrés',
      content:
        'El fin de semana logramos retirar más de 120 kg de cuerdas de pesca abandonadas y botellas plásticas cerca a Rocky Cay. Agradecemos a todos los buzos voluntarios de la isla por su compromiso.',
      likes: 24,
      likedByUserIds: ['admin-marina'],
      isPinned: false,
      isScientific: false,
      comments: [
        {
          id: 'comm-2-1',
          author: 'Mateo Costero',
          role: 'Ciudadano',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
          date: 'Ayer',
          text: 'Felicitaciones a todo el equipo. ¿Cuándo se realizará una jornada similar en la costa Pacífica?'
        }
      ]
    }
  ],

  reports: [
    {
      id: 'rep-1',
      reporterId: 'vol-sofia',
      reporterName: 'Sofía Océano',
      reporterEmail: 'voluntario@vidamarina.org',
      reporterRole: 'Voluntario',
      incidentType: 'plasticos',
      description:
        'Acumulación masiva de botellas y artes de pesca plásticos varados en la orilla de los manglares de Bocachica. Afecta el flujo de agua y la fauna asociada.',
      date: '2026-11-14',
      latitude: 10.3235,
      longitude: -75.5862,
      address: 'Bocachica, Isla de Tierrabomba, Cartagena',
      photos: [
        'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=600&q=80'
      ],
      status: 'aprobado',
      moderationNotes: 'Verificado en terreno y reportado a Cardique para jornada de saneamiento.',
      moderatedBy: 'Dra. Marina Castillo',
      moderatedAt: '2026-11-15T10:00:00Z'
    },
    {
      id: 'rep-2',
      reporterId: 'expert-carlos',
      reporterName: 'Dr. Carlos Arrecife',
      reporterEmail: 'investigador@invemar.org.co',
      reporterRole: 'Experto',
      incidentType: 'pesca_ilegal',
      description:
        'Avistamiento de faenas de pesca de arrastre dentro del polígono delimitado del Parque Nacional Natural Tayrona, poniendo en riesgo arrecifes de coral.',
      date: '2026-11-13',
      latitude: 11.3125,
      longitude: -74.1542,
      address: 'Ensenada de Chengue, PNN Tayrona, Magdalena',
      photos: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
      ],
      status: 'aprobado',
      moderationNotes: 'Remitido con coordenadas geográficas a Guardacostas Santa Marta y Parques Nacionales.',
      moderatedBy: 'Dra. Marina Castillo',
      moderatedAt: '2026-11-14T09:30:00Z'
    },
    {
      id: 'rep-3',
      reporterId: 'user-mateo',
      reporterName: 'Mateo Costero',
      reporterEmail: 'ciudadano@colombia.gov.co',
      reporterRole: 'Ciudadano',
      incidentType: 'vertimiento',
      description:
        'Descarga de aguas residuales con coloración oscura y fuerte olor cerca a la bocana del puerto. Se observan peces pequeños flotando.',
      date: '2026-11-16',
      latitude: 3.8821,
      longitude: -77.0694,
      address: 'Zona Portuaria, Bahía de Buenaventura',
      photos: [
        'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80'
      ],
      status: 'pendiente', // Reporte pendiente para prueba PA-05
      moderationNotes: '',
      moderatedBy: null,
      moderatedAt: null
    }
  ],

  contacts: [
    {
      id: 'cont-1',
      name: 'Línea 146 - Guardacostas Armada Nacional de Colombia',
      category: 'guardia_costera',
      phone: '146',
      email: 'guardacostas@armada.mil.co',
      website: 'https://www.armada.mil.co',
      location: 'Nacional (Caribe y Pacífico)',
      description: 'Línea de emergencia marítima nacional para rescate en el mar, interdicción de pesca ilegal y respuesta a naufragios.',
      is24h: true,
      verified: true
    },
    {
      id: 'cont-2',
      name: 'DIMAR - Dirección General Marítima de Colombia',
      category: 'autoridades_costeras',
      phone: '+57 (601) 2200490',
      email: 'dimar@dimar.mil.co',
      website: 'https://www.dimar.mil.co',
      location: 'Bogotá / Capitanías de Puerto Costeras',
      description: 'Autoridad marítima colombiana responsable de la seguridad de la navegación y prevención de contaminación marina.',
      is24h: true,
      verified: true
    },
    {
      id: 'cont-3',
      name: 'INVEMAR - Instituto de Investigaciones Marinas y Costeras',
      category: 'centros_rescate',
      phone: '+57 (605) 4329300',
      email: 'contacto@invemar.org.co',
      website: 'https://www.invemar.org.co',
      location: 'Santa Marta, Magdalena',
      description: 'Instituto científico líder en biodiversidad marina y Centro de Atención, Valoración y Rehabilitación de Fauna Marina (CAV-R).',
      is24h: false,
      verified: true
    },
    {
      id: 'cont-4',
      name: 'Línea Nacional 123 y PONALSAR (Policía de Salvamento y Rescate)',
      category: 'lineas_emergencia',
      phone: '123',
      email: 'ponalsar@policia.gov.co',
      website: 'https://www.policia.gov.co',
      location: 'Nacional Colombia',
      description: 'Línea única de seguridad y emergencias con enlace directo a brigadas de salvamento acuático y rescate costero.',
      is24h: true,
      verified: true
    },
    {
      id: 'cont-5',
      name: 'MinAmbiente - Línea Verde de Denuncias Ambientales',
      category: 'lineas_emergencia',
      phone: '018000 915060',
      email: 'servicioalciudadano@minambiente.gov.co',
      website: 'https://www.minambiente.gov.co',
      location: 'Nacional',
      description: 'Canal oficial del Ministerio de Ambiente para denunciar delitos ecológicos, derrames y vertimientos tóxicos en ecosistemas marinos.',
      is24h: true,
      verified: true
    },
    {
      id: 'cont-6',
      name: 'CORALINA - Corporación para el Desarrollo Sostenible de San Andrés',
      category: 'autoridades_costeras',
      phone: '+57 (608) 5126853',
      email: 'coralina@coralina.gov.co',
      website: 'https://www.coralina.gov.co',
      location: 'San Andrés, Providencia y Santa Catalina',
      description: 'Autoridad ambiental de la Reserva de Biosfera Seaflower, protección de arrecifes, pastos marinos y manglares.',
      is24h: false,
      verified: true
    },
    {
      id: 'cont-7',
      name: 'CARDIQUE - Corporación Autónoma Regional del Canal del Dique',
      category: 'autoridades_costeras',
      phone: '+57 (605) 6695240',
      email: 'contacto@cardique.gov.co',
      website: 'https://www.cardique.gov.co',
      location: 'Cartagena y Bolívar Costero',
      description: 'Control ambiental en la Bahía de Cartagena, ciénagas costeras y el ecosistema del Canal del Dique.',
      is24h: false,
      verified: true
    },
    {
      id: 'cont-8',
      name: 'CORPAMAG - Corporación Autónoma Regional del Magdalena',
      category: 'autoridades_costeras',
      phone: '+57 (605) 4380300',
      email: 'contactenos@corpamag.gov.co',
      website: 'https://www.corpamag.gov.co',
      location: 'Santa Marta, Magdalena',
      description: 'Vigilancia ambiental costera, manglares de la Ciénaga Grande y playas turísticas del departamento del Magdalena.',
      is24h: false,
      verified: true
    },
    {
      id: 'cont-9',
      name: 'Fundación Malpelo y Otros Ecosistemas Marinos',
      category: 'ongs',
      phone: '+57 (601) 6127415',
      email: 'info@fundacionmalpelo.org',
      website: 'https://www.fundacionmalpelo.org',
      location: 'Santuario de Flora y Fauna Malpelo, Pacífico',
      description: 'Organización pionera en la investigación, conservación y monitoreo de tiburones y ecosistemas pelágicos en el Pacífico.',
      is24h: false,
      verified: true
    },
    {
      id: 'cont-10',
      name: 'WWF Colombia - Fondo Mundial para la Naturaleza',
      category: 'ongs',
      phone: '+57 (602) 5582577',
      email: 'contacto@wwf.org.co',
      website: 'https://www.wwf.org.co',
      location: 'Cali / Oficinas Costeras',
      description: 'Organización global de conservación que lidera proyectos de áreas marinas protegidas y pesquerías sostenibles en Colombia.',
      is24h: false,
      verified: true
    },
    {
      id: 'cont-11',
      name: 'Defensa Civil Colombiana - Seccional Costa Atlántica',
      category: 'brigadas',
      phone: '144',
      email: 'atlantico@defensacivil.gov.co',
      website: 'https://www.defensacivil.gov.co',
      location: 'Región Caribe y Costa Pacífica',
      description: 'Respuesta inmediata ante desastres naturales costeros, inundaciones, marejadas y rescate de bañistas.',
      is24h: true,
      verified: true
    },
    {
      id: 'cont-12',
      name: 'Centro de Rehabilitación de Tortugas Marinas - Acuario San Martín',
      category: 'centros_rescate',
      phone: '+57 (605) 6655757',
      email: 'conservacion@oceanario.co',
      website: 'https://www.oceanario.co',
      location: 'Islas del Rosario, Cartagena',
      description: 'Atención médica veterinaria, cirugía y rehabilitación de tortugas marinas rescatadas de redes de pesca o varamientos.',
      is24h: true,
      verified: true
    }
  ],

  verifications: [
    {
      id: 'verif-1',
      userId: 'expert-carlos',
      userName: 'Dr. Carlos Arrecife',
      userEmail: 'investigador@invemar.org.co',
      currentRole: 'Experto',
      institution: 'INVEMAR - Instituto de Investigaciones Marinas',
      specialization: 'Biología Marina y Ecología de Arrecifes de Coral',
      professionalBio: 'Doctor en Ciencias del Mar por la Universidad Nacional con 12 años de trayectoria liderando proyectos de restauración coralina.',
      documents: [
        {
          id: 'doc-1',
          name: 'Tarjeta_Profesional_Biologo_CarlosArrecife.pdf',
          type: 'application/pdf',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          size: '1.4 MB'
        },
        {
          id: 'doc-2',
          name: 'Aval_Institucional_INVEMAR_2026.pdf',
          type: 'application/pdf',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          size: '890 KB'
        }
      ],
      status: 'aprobada',
      feedback: 'Acreditación científica verificada y ratificada por la Coordinación General.',
      reviewedBy: 'Dra. Marina Castillo',
      reviewedAt: '2026-11-01T15:00:00Z'
    },
    {
      id: 'verif-2',
      userId: 'user-mateo',
      userName: 'Mateo Costero',
      userEmail: 'ciudadano@colombia.gov.co',
      currentRole: 'Ciudadano',
      institution: 'Universidad del Valle - Sede Pacífico',
      specialization: 'Ingeniería Ambiental y Monitoreo de Calidad de Aguas Costeras',
      professionalBio: 'Egresado de Ingeniería Ambiental con énfasis en oceanografía química y gestión de vertimientos en zonas estuarinas.',
      documents: [
        {
          id: 'doc-3',
          name: 'Certificado_Grado_Ingenieria_Ambiental.pdf',
          type: 'application/pdf',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          size: '2.1 MB'
        },
        {
          id: 'doc-4',
          name: 'Fotocopia_Cedula_y_Acta_MateoCostero.png',
          type: 'image/png',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
          size: '1.2 MB'
        }
      ],
      status: 'pendiente', // Solicitud pendiente para prueba PA-10
      feedback: '',
      reviewedBy: null,
      reviewedAt: null
    }
  ],

  campaigns: [
    {
      id: 'camp-1',
      title: 'Restauración de 5.000 Fragmentos de Arrecife en Islas del Rosario',
      description: 'Campaña orientada a financiar guarderías de coral y siembra de especies Acropora palmata para proteger la biodiversidad en el Caribe.',
      targetAmount: 25000000,
      currentAmount: 18750000,
      donorCount: 42,
      organizer: 'Fundación Vida Marina UMB & Oceanario',
      image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80',
      deadline: '2026-12-31',
      status: 'activa',
      category: 'Restauración Coralina'
    },
    {
      id: 'camp-2',
      title: 'Protección y Monitoreo Satelital de Tortugas Canaj en La Guajira',
      description: 'Instalación de transmisores satelitales en hembras anidadoras de tortuga laúd y protección de playas de desove junto a comunidades Wayúu.',
      targetAmount: 18000000,
      currentAmount: 14200000,
      donorCount: 31,
      organizer: 'Red de Conservación de Tortugas Marinas de Colombia',
      image: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&w=800&q=80',
      deadline: '2026-12-15',
      status: 'activa',
      category: 'Protección de Fauna'
    },
    {
      id: 'camp-3',
      title: 'Barrera Atrapaplásticos Flotante para la Bahía de Buenaventura',
      description: 'Construcción e instalación de una bio-barrera flotante con mallas biodegradables para retener residuos plásticos antes de llegar al océano.',
      targetAmount: 30000000,
      currentAmount: 30000000,
      donorCount: 68,
      organizer: 'Colectivo Pacífico Limpio & Alcaldía de Buenaventura',
      image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80',
      deadline: '2026-11-20',
      status: 'completada',
      category: 'Desplastificación Marina'
    }
  ],

  notifications: [
    {
      id: 'notif-1',
      userId: 'admin-marina',
      title: 'Nueva Solicitud de Verificación de Experto',
      message: 'El usuario Mateo Costero ha radicado una solicitud para ser acreditado como Investigador / Experto.',
      type: 'verification_status',
      isRead: false
    },
    {
      id: 'notif-2',
      userId: 'admin-marina',
      title: 'Nuevo Reporte Ambiental Pendiente',
      message: 'Se ha recibido un reporte sobre "Vertimiento ilegal de residuos" en Bahía de Buenaventura.',
      type: 'report_status',
      isRead: false
    },
    {
      id: 'notif-3',
      userId: 'vol-sofia',
      title: 'Reporte Ambiental Aprobado',
      message: 'Tu reporte sobre contaminación plástica en Bocachica fue verificado y aprobado para el mapa público.',
      type: 'report_status',
      isRead: true
    }
  ],

  audit: [
    {
      id: 'audit-1',
      adminId: 'admin-marina',
      adminName: 'Dra. Marina Castillo',
      action: 'REPORT_APPROVED',
      targetType: 'EnvironmentalReport',
      targetId: 'rep-1',
      details: 'Reporte de contaminación por plásticos en Bocachica aprobado.',
      timestamp: '2026-11-15T10:00:00Z'
    },
    {
      id: 'audit-2',
      adminId: 'admin-marina',
      adminName: 'Dra. Marina Castillo',
      action: 'VERIFICATION_APPROVED',
      targetType: 'ExpertVerification',
      targetId: 'verif-1',
      details: 'Acreditación científica del Dr. Carlos Arrecife aprobada.',
      timestamp: '2026-11-01T15:00:00Z'
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SEED_DATA };
}
