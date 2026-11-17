/**
 * ================================================================
 * CLASE: EmergencyContact (RF06 - Directorio de Emergencias Ambientales)
 * ================================================================
 * Modela un contacto institucional oficial de emergencia marina en Colombia.
 */
class EmergencyContact {
  static CATEGORIES = {
    lineas_emergencia: {
      id: 'lineas_emergencia',
      title: 'Líneas de Atención Ambiental',
      description: 'Líneas directas nacionales y distritales para reporte inmediato de emergencias.',
      icon: '🚨',
      color: 'from-red-500/20 to-rose-500/10 text-red-300 border-red-500/30'
    },
    autoridades_costeras: {
      id: 'autoridades_costeras',
      title: 'Autoridades Ambientales Costeras',
      description: 'Corporaciones Autónomas Regionales e institutos de investigación marina.',
      icon: '🏛️',
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30'
    },
    guardia_costera: {
      id: 'guardia_costera',
      title: 'Guardia Costera y Armada Nacional',
      description: 'Fuerza naval y capitanías de puerto para emergencias marítimas en alta mar.',
      icon: '⚓',
      color: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30'
    },
    centros_rescate: {
      id: 'centros_rescate',
      title: 'Centros de Rescate de Fauna Marina',
      description: 'Atención y rehabilitación de tortugas, mamíferos marinos y aves costeras.',
      icon: '🐢',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30'
    },
    ongs: {
      id: 'ongs',
      title: 'Organizaciones No Gubernamentales',
      description: 'Fundaciones y ONGs aliadas en conservación y rescate de ecosistemas marinos.',
      icon: '🌍',
      color: 'from-teal-500/20 to-green-500/10 text-teal-300 border-teal-500/30'
    },
    brigadas: {
      id: 'brigadas',
      title: 'Brigadas y Respuesta Rápida',
      description: 'Cuerpos de socorro, defensa civil y gestión de riesgos costeros.',
      icon: '🛡️',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30'
    }
  };

  constructor({
    id,
    name,
    category = 'lineas_emergencia',
    phone,
    email = '',
    website = '',
    location = 'Colombia',
    description = '',
    is24h = true,
    verified = true
  }) {
    this.id = id || `contact-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.name = name;
    this.category = category;
    this.phone = phone;
    this.email = email;
    this.website = website;
    this.location = location;
    this.description = description;
    this.is24h = Boolean(is24h);
    this.verified = Boolean(verified);
  }

  getCategoryMeta() {
    return EmergencyContact.CATEGORIES[this.category] || EmergencyContact.CATEGORIES.lineas_emergencia;
  }

  getCategoryLabel() {
    return this.getCategoryMeta().title;
  }

  getCleanPhoneNumber() {
    if (!this.phone) return '';
    // Extrae el número para usar en tel:
    return this.phone.replace(/[^0-9+]/g, '');
  }

  updateDetails({ name, category, phone, email, website, location, description, is24h }) {
    if (name) this.name = name;
    if (category) this.category = category;
    if (phone) this.phone = phone;
    if (email !== undefined) this.email = email;
    if (website !== undefined) this.website = website;
    if (location !== undefined) this.location = location;
    if (description !== undefined) this.description = description;
    if (is24h !== undefined) this.is24h = Boolean(is24h);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      phone: this.phone,
      email: this.email,
      website: this.website,
      location: this.location,
      description: this.description,
      is24h: this.is24h,
      verified: this.verified
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EmergencyContact };
}
