/**
 * ================================================================
 * SERVICIO: VerificationService (RF10 - Lógica de Negocio de Verificación de Expertos)
 * ================================================================
 * Gestiona el ciclo de vida de solicitudes de acreditación científica:
 * Radicación de documentos -> Revisión de Administrador -> Aprobación -> Configuración 2FA -> Ascenso a Experto.
 */
class VerificationService {
  constructor(databaseService, supabaseService) {
    this.db = databaseService;
    this.supabase = supabaseService;
  }

  getPendingRequests() {
    return this.db.verifications.filter(v => v.isPending());
  }

  getAllRequests() {
    return this.db.verifications;
  }

  getUserRequest(userId) {
    return this.db.verifications.find(v => v.userId === userId) || null;
  }

  async submitVerificationRequest({ user, institution, specialization, professionalBio, documents }) {
    if (!user) {
      return { success: false, error: 'Debe iniciar sesión para solicitar verificación.' };
    }

    if (user.role === 'Experto' || user.role === 'Administrador') {
      return { success: false, error: 'Su cuenta ya cuenta con privilegios especializados.' };
    }

    const existingPending = this.db.verifications.find(v => v.userId === user.id && v.isPending());
    if (existingPending) {
      return { success: false, error: 'Ya tiene una solicitud de verificación pendiente en revisión.' };
    }

    if (!institution || institution.trim().length < 3) {
      return { success: false, error: 'Debe especificar la institución académica u ONG de respaldo.' };
    }

    if (!specialization || specialization.trim().length < 3) {
      return { success: false, error: 'Debe especificar su área de especialización marina.' };
    }

    if (!documents || documents.length === 0) {
      return { success: false, error: 'Debe adjuntar al menos un documento probatorio (tarjeta profesional, certificado o aval).' };
    }

    const newRequest = new ExpertVerification({
      id: `verif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      currentRole: user.role,
      institution: institution.trim(),
      specialization: specialization.trim(),
      professionalBio: professionalBio ? professionalBio.trim() : '',
      documents: documents.map(d => (d instanceof VerificationDocument ? d : new VerificationDocument(d))),
      status: 'pendiente'
    });

    this.db.verifications.unshift(newRequest);
    this.db.saveVerifications(this.db.verifications);

    // Notificación al usuario
    this.db.addNotification(
      new Notification({
        userId: user.id,
        title: 'Solicitud de Verificación Radicada',
        message: 'Tu expediente científico ha sido radicado y está siendo revisado por la coordinación general.',
        type: 'verification_status'
      })
    );

    // Persistir en Supabase si está disponible
    if (this.supabase && this.supabase.isConfigured()) {
      await this.supabase.insertRecord('expert_verifications', newRequest.toJSON());
    }

    return { success: true, verification: newRequest };
  }

  async reviewRequest({ requestId, adminUser, approved, feedback }) {
    if (!adminUser || !adminUser.canModerate()) {
      return { success: false, error: 'No cuenta con permisos para revisar solicitudes de expertos.' };
    }

    const request = this.db.verifications.find(v => v.id === requestId);
    if (!request) {
      return { success: false, error: 'Solicitud de verificación no encontrada.' };
    }

    const targetUser = this.db.users.find(u => u.id === request.userId);

    if (approved) {
      request.approve(adminUser.name, feedback || 'Documentación académica y profesional validada con éxito.');

      // Si el usuario ya tiene 2FA configurado, se asciende de inmediato.
      // Si no tiene 2FA, se le exige activarlo para completar el ascenso formal.
      if (targetUser) {
        targetUser.institution = request.institution;
        targetUser.specialization = request.specialization;
        targetUser.verifiedAt = new Date().toISOString();

        if (targetUser.has2FA()) {
          // Ascenso a Experto completo
          this.db.promoteUserToRole(targetUser.id, 'Experto');
        }

        this.db.saveUsers(this.db.users);
      }
    } else {
      request.reject(adminUser.name, feedback || 'La documentación remitida no satisface los criterios mínimos exigidos.');
    }

    this.db.saveVerifications(this.db.verifications);

    // Registrar en auditoría (AuditLog)
    this.db.addAuditLog(
      new AuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: approved ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
        targetType: 'ExpertVerification',
        targetId: request.id,
        details: `Solicitud de verificación para [${request.userName}] (${request.institution}) fue ${approved ? 'APROBADA' : 'RECHAZADA'}. Obs: ${request.feedback}`
      })
    );

    // Notificar al solicitante
    const notifTitle = approved ? '🎉 ¡Solicitud de Verificación Aprobada!' : '✕ Solicitud de Verificación No Aprobada';
    const notifMessage = approved
      ? `Tu solicitud para ser acreditado como Investigador / Experto ha sido APROBADA. Para activar tus privilegios completos, configura tu segundo factor de autenticación (2FA) en tu perfil. Observaciones: ${request.feedback}`
      : `Tu solicitud de acreditación científica no fue aprobada. Motivo: ${request.feedback}`;

    this.db.addNotification(
      new Notification({
        userId: request.userId,
        title: notifTitle,
        message: notifMessage,
        type: 'verification_status'
      })
    );

    // Sincronizar con Supabase
    if (this.supabase && this.supabase.isConfigured()) {
      await this.supabase.updateRecord(
        'expert_verifications',
        { id: request.id },
        {
          status: request.status,
          reviewed_by: request.reviewedBy,
          feedback: request.feedback,
          reviewed_at: request.reviewedAt
        }
      );
    }

    return { success: true, verification: request };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VerificationService };
}
