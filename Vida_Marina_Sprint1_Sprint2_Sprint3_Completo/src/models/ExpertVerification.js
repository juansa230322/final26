/**
 * ================================================================
 * CLASE: VerificationDocument y ExpertVerification (RF10 - Verificación de Expertos y ONG)
 * ================================================================
 * Gestiona las solicitudes y documentos probatorios para acreditación científica.
 */
class VerificationDocument {
  constructor({ id, name, type = 'application/pdf', fileUrl, size = '1.2 MB', uploadedAt = null }) {
    this.id = id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.name = name;
    this.type = type;
    this.fileUrl = fileUrl;
    this.size = size;
    this.uploadedAt = uploadedAt || new Date().toISOString();
  }

  isPdf() {
    return this.type.includes('pdf') || (this.name && this.name.toLowerCase().endsWith('.pdf'));
  }

  isImage() {
    return this.type.includes('image') || (this.name && /\.(png|jpe?g)$/i.test(this.name));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      fileUrl: this.fileUrl,
      size: this.size,
      uploadedAt: this.uploadedAt
    };
  }
}

class ExpertVerification {
  constructor({
    id,
    userId,
    userName,
    userEmail,
    currentRole = 'Ciudadano',
    institution,
    specialization,
    professionalBio,
    documents = [],
    status = 'pendiente', // 'pendiente' | 'aprobada' | 'rechazada'
    feedback = '',
    reviewedBy = null,
    reviewedAt = null,
    createdAt = null
  }) {
    this.id = id || `verif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
    this.currentRole = currentRole;
    this.institution = institution;
    this.specialization = specialization;
    this.professionalBio = professionalBio || '';
    this.documents = (documents || []).map(d => (d instanceof VerificationDocument ? d : new VerificationDocument(d)));
    this.status = status || 'pendiente';
    this.feedback = feedback || '';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = reviewedAt;
    this.createdAt = createdAt || new Date().toISOString();
  }

  approve(adminName, feedbackNotes = 'Acreditación científica verificada satisfactoriamente con la institución de respaldo.') {
    this.status = 'aprobada';
    this.reviewedBy = adminName || 'Administrador General';
    this.feedback = feedbackNotes;
    this.reviewedAt = new Date().toISOString();
    return true;
  }

  reject(adminName, reasonNotes = 'Los documentos adjuntos no cumplen con los requisitos de acreditación oficial.') {
    this.status = 'rechazada';
    this.reviewedBy = adminName || 'Administrador General';
    this.feedback = reasonNotes;
    this.reviewedAt = new Date().toISOString();
    return true;
  }

  addDocument(docData) {
    const doc = docData instanceof VerificationDocument ? docData : new VerificationDocument(docData);
    this.documents.push(doc);
    return doc;
  }

  isPending() {
    return this.status === 'pendiente';
  }

  isApproved() {
    return this.status === 'aprobada';
  }

  isRejected() {
    return this.status === 'rechazada';
  }

  getStatusBadge() {
    switch (this.status) {
      case 'aprobada':
        return {
          label: 'Aprobada - Pendiente 2FA',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: '✓'
        };
      case 'rechazada':
        return {
          label: 'Rechazada',
          color: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: '✕'
        };
      case 'pendiente':
      default:
        return {
          label: 'En Revisión por Administración',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: '⏳'
        };
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userEmail: this.userEmail,
      currentRole: this.currentRole,
      institution: this.institution,
      specialization: this.specialization,
      professionalBio: this.professionalBio,
      documents: this.documents.map(d => d.toJSON()),
      status: this.status,
      feedback: this.feedback,
      reviewedBy: this.reviewedBy,
      reviewedAt: this.reviewedAt,
      createdAt: this.createdAt
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VerificationDocument, ExpertVerification };
}
