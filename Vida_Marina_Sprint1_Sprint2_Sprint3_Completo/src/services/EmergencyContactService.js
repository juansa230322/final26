/**
 * ================================================================
 * SERVICIO: EmergencyContactService (RF06 - Directorio de Emergencias)
 * ================================================================
 * Administra el directorio de contactos institucionales de emergencia marina en Colombia.
 */
class EmergencyContactService {
  constructor(databaseService, supabaseService) {
    this.db = databaseService;
    this.supabase = supabaseService;
  }

  getAllContacts() {
    return this.db.emergencyContacts;
  }

  getContactsByCategory(category) {
    if (!category || category === 'todas') return this.db.emergencyContacts;
    return this.db.emergencyContacts.filter(c => c.category === category);
  }

  searchContacts(query, category = 'todas') {
    let list = this.getContactsByCategory(category);
    if (!query || !query.trim()) return list;

    const q = query.toLowerCase().trim();
    return list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }

  async addContact({ adminUser, name, category, phone, email, website, location, description, is24h }) {
    if (!adminUser || !adminUser.canManageDirectory()) {
      return { success: false, error: 'No cuenta con privilegios para gestionar el directorio de emergencias.' };
    }

    if (!name || name.trim().length < 3) {
      return { success: false, error: 'El nombre de la organización debe tener al menos 3 caracteres.' };
    }

    if (!phone || phone.trim().length < 3) {
      return { success: false, error: 'Debe ingresar un número de contacto telefónico válido.' };
    }

    const newContact = new EmergencyContact({
      id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      category: category || 'lineas_emergencia',
      phone: phone.trim(),
      email: email ? email.trim() : '',
      website: website ? website.trim() : '',
      location: location ? location.trim() : 'Colombia',
      description: description ? description.trim() : '',
      is24h: is24h !== undefined ? Boolean(is24h) : true,
      verified: true
    });

    this.db.emergencyContacts.unshift(newContact);
    this.db.saveEmergencyContacts(this.db.emergencyContacts);

    // Auditoría
    this.db.addAuditLog(
      new AuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'CONTACT_CREATED',
        targetType: 'EmergencyContact',
        targetId: newContact.id,
        details: `Nuevo contacto oficial creado: [${newContact.name}] (${newContact.category}, Tel: ${newContact.phone})`
      })
    );

    // Sincronizar con Supabase
    if (this.supabase && this.supabase.isConfigured()) {
      await this.supabase.insertRecord('emergency_contacts', newContact.toJSON());
    }

    return { success: true, contact: newContact };
  }

  async updateContact({ adminUser, id, data }) {
    if (!adminUser || !adminUser.canManageDirectory()) {
      return { success: false, error: 'No cuenta con privilegios para editar contactos de emergencias.' };
    }

    const contact = this.db.emergencyContacts.find(c => c.id === id);
    if (!contact) {
      return { success: false, error: 'Contacto no encontrado en el directorio.' };
    }

    contact.updateDetails(data);
    this.db.saveEmergencyContacts(this.db.emergencyContacts);

    // Auditoría
    this.db.addAuditLog(
      new AuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'CONTACT_UPDATED',
        targetType: 'EmergencyContact',
        targetId: contact.id,
        details: `Contacto actualizado: [${contact.name}]`
      })
    );

    // Sincronizar con Supabase
    if (this.supabase && this.supabase.isConfigured()) {
      await this.supabase.updateRecord('emergency_contacts', { id: contact.id }, contact.toJSON());
    }

    return { success: true, contact };
  }

  async deleteContact({ adminUser, id }) {
    if (!adminUser || !adminUser.canManageDirectory()) {
      return { success: false, error: 'No cuenta con permisos para eliminar contactos.' };
    }

    const idx = this.db.emergencyContacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      const removed = this.db.emergencyContacts.splice(idx, 1)[0];
      this.db.saveEmergencyContacts(this.db.emergencyContacts);

      // Auditoría
      this.db.addAuditLog(
        new AuditLog({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: 'CONTACT_DELETED',
          targetType: 'EmergencyContact',
          targetId: id,
          details: `Contacto eliminado del directorio: [${removed.name}]`
        })
      );

      // Sincronizar con Supabase
      if (this.supabase && this.supabase.isConfigured()) {
        await this.supabase.deleteRecord('emergency_contacts', { id });
      }

      return { success: true };
    }
    return { success: false, error: 'Contacto no encontrado.' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EmergencyContactService };
}
