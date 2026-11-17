/**
 * ================================================================
 * CLASE: EnvironmentalReport (RF05 - Reportes Ambientales Geolocalizados)
 * ================================================================
 * Modela un reporte ciudadano de incidente ambiental marino con geolocalización.
 */
class EnvironmentalReport {
  static INCIDENT_CATEGORIES = {
    vertimiento: {
      label: 'Vertimiento ilegal de residuos',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      icon: '☣️'
    },
    pesca_ilegal: {
      label: 'Pesca ilegal o no regulada',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      icon: '🎣'
    },
    derrame: {
      label: 'Derrames de petróleo e hidrocarburos',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: '🛢️'
    },
    plasticos: {
      label: 'Contaminación crítica por plásticos',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      icon: '🧴'
    },
    otros: {
      label: 'Otros incidentes ambientales',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: '🌊'
    }
  };

  constructor({
    id,
    reporterId,
    reporterName,
    reporterEmail,
    reporterRole = 'Ciudadano',
    incidentType = 'plasticos',
    description,
    date,
    latitude,
    longitude,
    address = 'Zona Costera Marítima',
    photos = [],
    status = 'pendiente', // 'pendiente' | 'aprobado' | 'rechazado'
    moderationNotes = '',
    moderatedBy = null,
    moderatedAt = null,
    createdAt = null
  }) {
    this.id = id || `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.reporterId = reporterId;
    this.reporterName = reporterName;
    this.reporterEmail = reporterEmail || '';
    this.reporterRole = reporterRole;
    this.incidentType = incidentType || 'otros';
    this.description = description || '';
    this.date = date || new Date().toISOString().split('T')[0];
    this.latitude = Number(latitude) || 10.3997; // Cartagena por defecto
    this.longitude = Number(longitude) || -75.5144;
    this.address = address;
    this.photos = Array.isArray(photos) ? [...photos] : (photos ? [photos] : []);
    this.status = status || 'pendiente';
    this.moderationNotes = moderationNotes || '';
    this.moderatedBy = moderatedBy;
    this.moderatedAt = moderatedAt;
    this.createdAt = createdAt || new Date().toISOString();
  }

  // Encapsulamiento: Moderación
  approve(adminName, notes = 'Reporte validado y verificado por la coordinación ambiental.') {
    this.status = 'aprobado';
    this.moderatedBy = adminName || 'Administrador General';
    this.moderationNotes = notes;
    this.moderatedAt = new Date().toISOString();
    return true;
  }

  reject(adminName, reason = 'No se encontraron evidencias concluyentes del incidente.') {
    this.status = 'rechazado';
    this.moderatedBy = adminName || 'Administrador General';
    this.moderationNotes = reason;
    this.moderatedAt = new Date().toISOString();
    return true;
  }

  isApproved() {
    return this.status === 'aprobado';
  }

  isPending() {
    return this.status === 'pendiente';
  }

  isRejected() {
    return this.status === 'rechazado';
  }

  addPhoto(photoUrl) {
    if (photoUrl && typeof photoUrl === 'string') {
      this.photos.push(photoUrl);
      return true;
    }
    return false;
  }

  getIncidentLabel() {
    const meta = EnvironmentalReport.INCIDENT_CATEGORIES[this.incidentType];
    return meta ? `${meta.icon} ${meta.label}` : '🌊 Incidente Ambiental';
  }

  getIncidentBadgeColor() {
    const meta = EnvironmentalReport.INCIDENT_CATEGORIES[this.incidentType];
    return meta ? meta.badgeColor : 'bg-slate-500/20 text-slate-300 border-slate-500/40';
  }

  getStatusBadge() {
    switch (this.status) {
      case 'aprobado':
        return {
          label: 'Aprobado',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: '✓'
        };
      case 'rechazado':
        return {
          label: 'Rechazado',
          color: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: '✕'
        };
      case 'pendiente':
      default:
        return {
          label: 'Pendiente de Revisión',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '⏳'
        };
    }
  }

  toJSON() {
    return {
      id: this.id,
      reporterId: this.reporterId,
      reporterName: this.reporterName,
      reporterEmail: this.reporterEmail,
      reporterRole: this.reporterRole,
      incidentType: this.incidentType,
      description: this.description,
      date: this.date,
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address,
      photos: this.photos,
      status: this.status,
      moderationNotes: this.moderationNotes,
      moderatedBy: this.moderatedBy,
      moderatedAt: this.moderatedAt,
      createdAt: this.createdAt
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnvironmentalReport };
}
