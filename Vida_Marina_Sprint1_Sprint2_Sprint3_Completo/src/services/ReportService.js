/**
 * ================================================================
 * SERVICIO: ReportService (RF05 - Lógica de Negocio de Reportes)
 * ================================================================
 * Orquesta la creación, consulta, validación geográfica y moderación de reportes ambientales.
 */
class ReportService {
  constructor(databaseService, supabaseService) {
    this.db = databaseService;
    this.supabase = supabaseService;
  }

  getApprovedReports() {
    return this.db.reports.filter(r => r.isApproved());
  }

  getAllReportsForAdmin() {
    return this.db.reports;
  }

  getUserReports(userId) {
    return this.db.reports.filter(r => r.reporterId === userId);
  }

  async createReport({ reporterUser, incidentType, description, date, latitude, longitude, address, photos }) {
    if (!reporterUser) {
      return { success: false, error: 'Debe haber iniciado sesión para enviar un reporte ambiental.' };
    }

    if (!description || description.trim().length < 10) {
      return { success: false, error: 'La descripción del incidente debe contener al menos 10 caracteres.' };
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { success: false, error: 'Coordenadas geográficas inválidas.' };
    }

    const newReport = new EnvironmentalReport({
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      reporterId: reporterUser.id,
      reporterName: reporterUser.name,
      reporterEmail: reporterUser.email,
      reporterRole: reporterUser.role,
      incidentType,
      description: description.trim(),
      date: date || new Date().toISOString().split('T')[0],
      latitude: lat,
      longitude: lng,
      address: address || 'Zona Marítima Costera',
      photos: Array.isArray(photos) ? photos : [],
      status: 'pendiente' // Siempre inicia como pendiente de revisión
    });

    this.db.reports.unshift(newReport);
    this.db.saveReports(this.db.reports);

    // Otorga +30 XP al usuario por su participación ciudadana
    reporterUser.addXP(30);
    this.db.saveUsers(this.db.users);

    // Notificación al usuario confirmando recepción
    this.db.addNotification(
      new Notification({
        userId: reporterUser.id,
        title: 'Reporte Ambiental Recibido',
        message: `Tu reporte sobre "${newReport.getIncidentLabel()}" ha sido registrado y está en revisión por la coordinación ambiental.`,
        type: 'report_status'
      })
    );

    // Persistir en Supabase si está activo
    if (this.supabase && this.supabase.isConfigured()) {
      await this.supabase.insertRecord('environmental_reports', newReport.toJSON());
    }

    return { success: true, report: newReport };
  }

  async moderateReport({ reportId, adminUser, approved, notes }) {
    if (!adminUser || !adminUser.canModerate()) {
      return { success: false, error: 'No cuenta con privilegios administrativos para moderar reportes.' };
    }

    const report = this.db.reports.find(r => r.id === reportId);
    if (!report) {
      return { success: false, error: 'Reporte ambiental no encontrado.' };
    }

    const oldStatus = report.status;
    if (approved) {
      report.approve(adminUser.name, notes || 'Reporte verificado y aprobado para visualización pública en el mapa.');
    } else {
      report.reject(adminUser.name, notes || 'El reporte no cumple con las pautas de verificación técnica requeridas.');
    }

    this.db.saveReports(this.db.reports);

    // Registro de auditoría (AuditLog)
    this.db.addAuditLog(
      new AuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: approved ? 'REPORT_APPROVED' : 'REPORT_REJECTED',
        targetType: 'EnvironmentalReport',
        targetId: report.id,
        details: `Reporte ${report.id} (${report.incidentType}) cambiado de [${oldStatus}] a [${report.status}]. Motivo: ${report.moderationNotes}`
      })
    );

    // Notificar al ciudadano que realizó el reporte
    const notifTitle = approved ? '✓ Tu Reporte Ambiental fue Aprobado' : '✕ Actualización de tu Reporte Ambiental';
    const notifMessage = approved
      ? `Tu reporte sobre "${report.getIncidentLabel()}" fue aprobado y ya es visible en el mapa comunitario. Observaciones: ${report.moderationNotes}`
      : `Tu reporte sobre "${report.getIncidentLabel()}" fue rechazado. Motivo indicado por moderación: ${report.moderationNotes}`;

    this.db.addNotification(
      new Notification({
        userId: report.reporterId,
        title: notifTitle,
        message: notifMessage,
        type: 'report_status'
      })
    );

    // Si fue aprobado, otorgar +50 XP adicionales por reporte verificado
    const reporter = this.db.users.find(u => u.id === report.reporterId);
    if (reporter && approved) {
      reporter.addXP(50);
      this.db.saveUsers(this.db.users);
    }

    // Sincronizar con Supabase si está disponible
    if (this.supabase && this.supabase.isConfigured()) {
      await this.supabase.updateRecord(
        'environmental_reports',
        { id: report.id },
        {
          status: report.status,
          moderated_by: report.moderatedBy,
          moderation_notes: report.moderationNotes,
          moderated_at: report.moderatedAt
        }
      );
    }

    return { success: true, report };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReportService };
}
