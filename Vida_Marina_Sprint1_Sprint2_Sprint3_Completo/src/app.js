/**
 * ================================================================
 * CONTROLADOR PRINCIPAL: PlatformManager (Arquitectura POO)
 * ================================================================
 * Orquesta todos los servicios y modelos del sistema Vida Marina:
 * - Autenticación y RBAC (RF09)
 * - Reportes Ambientales Geolocalizados (RF05)
 * - Directorio de Contactos de Emergencia (RF06)
 * - Verificación de Investigadores y Expertos (RF10)
 * - Actividades, Insignias, Foro y Campañas de Donación
 */
class PlatformManager {
  constructor(seedData = {}) {
    this.db = DatabaseService.getInstance();
    this.supabase = SupabaseService.getInstance();

    // Inicializar servicios especializados
    this.authService = new AuthenticationService(this.db, this.supabase);
    this.reportService = new ReportService(this.db, this.supabase);
    this.verificationService = new VerificationService(this.db, this.supabase);
    this.emergencyService = new EmergencyContactService(this.db, this.supabase);

    // Cargar colecciones persistentes
    this.users = this.db.loadUsers(seedData.users || []);
    this.currentUserId = this.db.loadCurrentUserId(null);
    this.activities = this.db.loadActivities(seedData.activities || []);
    this.badges = this.db.loadBadges(seedData.badges || []);
    this.forumPosts = this.db.loadForum(seedData.forum || []);
    this.reports = this.db.loadReports(seedData.reports || []);
    this.emergencyContacts = this.db.loadEmergencyContacts(seedData.contacts || []);
    this.verifications = this.db.loadVerifications(seedData.verifications || []);
    this.campaigns = this.db.loadCampaigns(seedData.campaigns || []);
    this.notifications = this.db.loadNotifications(seedData.notifications || []);
    this.auditLogs = this.db.loadAuditLogs(seedData.audit || []);
  }

  // ==================== GESTIÓN DE SESIÓN ====================
  getCurrentUser() {
    if (!this.currentUserId) return null;
    return this.users.find(u => u.id === this.currentUserId) || null;
  }

  setCurrentUser(userId) {
    this.currentUserId = userId;
    this.db.saveCurrentUserId(userId);
  }

  logout() {
    this.currentUserId = null;
    this.db.saveCurrentUserId(null);
    if (this.supabase) {
      this.supabase.signOut();
    }
  }

  async login(email, password, totpToken = null) {
    const res = await this.authService.login(email, password, totpToken);
    if (res.success && res.user) {
      this.setCurrentUser(res.user.id);
    }
    return res;
  }

  async register(data) {
    const res = await this.authService.register(data);
    if (res.success && res.user) {
      this.users = this.db.users;
      this.setCurrentUser(res.user.id);
    }
    return res;
  }

  // ==================== RBAC Y ADMINISTRACIÓN (RF09) ====================
  changeUserRole(adminUser, targetUserId, newRole) {
    if (!adminUser || !adminUser.canModerate()) {
      return { success: false, error: 'Acceso denegado. Se requieren permisos de Administrador General.' };
    }

    const validRoles = ['Administrador', 'Experto', 'Voluntario', 'Ciudadano'];
    if (!validRoles.includes(newRole)) {
      return { success: false, error: `Rol "${newRole}" no válido en el sistema.` };
    }

    const targetUser = this.users.find(u => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    // Evitar que el último administrador se quite a sí mismo los privilegios
    if (targetUser.id === adminUser.id && newRole !== 'Administrador') {
      const adminCount = this.users.filter(u => u.role === 'Administrador').length;
      if (adminCount <= 1) {
        return { success: false, error: 'No es posible revocar los permisos al único Administrador General activo.' };
      }
    }

    const oldRole = targetUser.role;
    const updated = this.db.promoteUserToRole(targetUserId, newRole);
    if (updated) {
      this.users = this.db.users;

      // Auditoría
      this.db.addAuditLog(
        new AuditLog({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: 'USER_ROLE_CHANGED',
          targetType: 'User',
          targetId: targetUserId,
          details: `Rol de [${targetUser.name}] modificado de [${oldRole}] a [${newRole}].`
        })
      );

      // Notificación al usuario
      this.db.addNotification(
        new Notification({
          userId: targetUserId,
          title: 'Actualización de Rol en la Plataforma',
          message: `Tu rol ha sido actualizado a "${newRole}" por la administración.`,
          type: 'general'
        })
      );

      return { success: true, user: updated };
    }
    return { success: false, error: 'Error al actualizar rol.' };
  }

  suspendUser(adminUser, targetUserId) {
    if (!adminUser || !adminUser.canModerate()) {
      return { success: false, error: 'Permisos insuficientes.' };
    }

    if (adminUser.id === targetUserId) {
      return { success: false, error: 'No puedes suspender tu propia cuenta administrativa.' };
    }

    const target = this.users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Usuario no encontrado.' };

    target.suspend();
    this.db.saveUsers(this.users);

    this.db.addAuditLog(
      new AuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'USER_SUSPENDED',
        targetType: 'User',
        targetId: targetUserId,
        details: `Cuenta de [${target.name}] (${target.email}) suspendida.`
      })
    );

    return { success: true, user: target };
  }

  reactivateUser(adminUser, targetUserId) {
    if (!adminUser || !adminUser.canModerate()) {
      return { success: false, error: 'Permisos insuficientes.' };
    }

    const target = this.users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Usuario no encontrado.' };

    target.reactivate();
    this.db.saveUsers(this.users);

    this.db.addAuditLog(
      new AuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'USER_REACTIVATED',
        targetType: 'User',
        targetId: targetUserId,
        details: `Cuenta de [${target.name}] reactivada.`
      })
    );

    return { success: true, user: target };
  }

  deleteUser(adminUser, targetUserId) {
    if (!adminUser || !adminUser.canModerate()) {
      return { success: false, error: 'Permisos insuficientes.' };
    }

    if (adminUser.id === targetUserId) {
      return { success: false, error: 'No puedes eliminar tu propia cuenta.' };
    }

    const idx = this.users.findIndex(u => u.id === targetUserId);
    if (idx !== -1) {
      const removed = this.users.splice(idx, 1)[0];
      this.db.saveUsers(this.users);

      this.db.addAuditLog(
        new AuditLog({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: 'USER_DELETED',
          targetType: 'User',
          targetId: targetUserId,
          details: `Usuario eliminado definitivamente: [${removed.name}] (${removed.email})`
        })
      );

      return { success: true };
    }
    return { success: false, error: 'Usuario no encontrado.' };
  }

  updateUserProfile(targetUserId, updates) {
    const user = this.users.find(u => u.id === targetUserId);
    if (!user) return { success: false, error: 'Usuario no encontrado.' };

    if (updates.name) user.name = updates.name.trim();
    if (updates.city) user.city = updates.city.trim();
    if (updates.avatar) user.avatar = updates.avatar.trim();
    if (updates.institution !== undefined) user.institution = updates.institution.trim();
    if (updates.specialization !== undefined) user.specialization = updates.specialization.trim();

    this.db.saveUsers(this.users);
    return { success: true, user };
  }

  sendAdminNotification(adminUser, { targetUserId, title, message, type = 'general' }) {
    if (!adminUser || !adminUser.canModerate()) {
      return { success: false, error: 'Permisos insuficientes.' };
    }

    const notif = this.db.addNotification(
      new Notification({
        userId: targetUserId || 'all',
        title: title || 'Aviso Oficial de Coordinación',
        message: message || '',
        type
      })
    );
    return { success: true, notification: notif };
  }

  // ==================== ACTIVIDADES ECOLÓGICAS ====================
  enrollCurrentInActivity(activityId) {
    const user = this.getCurrentUser();
    const activity = this.activities.find(a => a.id === activityId);
    if (!user || !activity) return { success: false, error: 'Usuario o actividad no encontrados.' };

    if (!user.canEnrollActivities()) {
      return {
        success: false,
        error: 'Tu rol actual es Ciudadano. Para inscribirte en jornadas ecológicas, solicita tu acreditación como Voluntario o Experto.'
      };
    }

    const enrolled = activity.enrollUser(user.id);
    if (enrolled) {
      user.enrollInActivity(activityId);
      user.addXP(60);

      // Desbloqueo de insignias por participación
      let newlyUnlockedBadge = null;
      if (user.enrolledActivityIds.length >= 3 && !user.hasBadge('badge-8')) {
        const b8 = this.badges.find(b => b.id === 'badge-8');
        if (b8) {
          b8.awardTo(user, 'Sistema Automático UMB');
          newlyUnlockedBadge = b8;
        }
      }

      this.db.saveActivities(this.activities);
      this.db.saveUsers(this.users);

      this.db.addNotification(
        new Notification({
          userId: user.id,
          title: 'Inscripción Confirmada',
          message: `Te has inscrito exitosamente a la actividad "${activity.name}". ¡Nos vemos el ${activity.date}!`,
          type: 'activity'
        })
      );

      return { success: true, newlyUnlockedBadge };
    }
    return { success: false, error: 'No hay cupos disponibles o ya te encuentras inscrito.' };
  }

  cancelEnrollment(activityId) {
    const user = this.getCurrentUser();
    const activity = this.activities.find(a => a.id === activityId);
    if (!user || !activity) return false;

    activity.cancelUserEnrollment(user.id);
    user.cancelActivityEnrollment(activityId);
    this.db.saveActivities(this.activities);
    this.db.saveUsers(this.users);
    return true;
  }

  createActivity(adminUser, data) {
    if (!adminUser || !adminUser.canModerate()) return null;
    const activity = new Activity(data);
    this.activities.unshift(activity);
    this.db.saveActivities(this.activities);

    this.db.addAuditLog(
      new AuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'ACTIVITY_CREATED',
        targetType: 'Activity',
        targetId: activity.id,
        details: `Nueva actividad creada: [${activity.name}] para el ${activity.date}`
      })
    );

    return activity;
  }

  updateActivity(adminUser, id, data) {
    if (!adminUser || !adminUser.canModerate()) return null;
    const activity = this.activities.find(a => a.id === id);
    if (activity) {
      activity.updateDetails(data);
      this.db.saveActivities(this.activities);
      return activity;
    }
    return null;
  }

  deleteActivity(adminUser, id) {
    if (!adminUser || !adminUser.canModerate()) return false;
    const idx = this.activities.findIndex(a => a.id === id);
    if (idx !== -1) {
      const removed = this.activities.splice(idx, 1)[0];
      this.users.forEach(u => u.cancelActivityEnrollment(id));
      this.db.saveActivities(this.activities);
      this.db.saveUsers(this.users);

      this.db.addAuditLog(
        new AuditLog({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: 'ACTIVITY_DELETED',
          targetType: 'Activity',
          targetId: id,
          details: `Actividad eliminada: [${removed.name}]`
        })
      );

      return true;
    }
    return false;
  }

  // ==================== INSIGNIAS ====================
  grantBadge(adminUser, targetUserId, badgeId) {
    if (!adminUser || !adminUser.canModerate()) {
      return { success: false, error: 'Se requieren permisos de administrador.' };
    }

    const targetUser = this.users.find(u => u.id === targetUserId);
    const badge = this.badges.find(b => b.id === badgeId);
    if (!targetUser || !badge) return { success: false, error: 'Usuario o insignia no encontrados.' };

    const awarded = badge.awardTo(targetUser, adminUser.name);
    if (awarded) {
      this.db.saveUsers(this.users);
      this.db.saveBadges(this.badges);

      this.db.addAuditLog(
        new AuditLog({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: 'BADGE_AWARDED',
          targetType: 'Badge',
          targetId: badge.id,
          details: `Insignia "${badge.name}" otorgada a [${targetUser.name}].`
        })
      );

      this.db.addNotification(
        new Notification({
          userId: targetUser.id,
          title: '🏆 ¡Nueva Insignia Otorgada!',
          message: `Has recibido el reconocimiento oficial "${badge.name}". +150 XP añadidos a tu nivel.`,
          type: 'badge'
        })
      );

      return { success: true, badge, targetUser };
    }
    return { success: false, error: 'El usuario ya posee esta insignia.' };
  }

  revokeBadge(adminUser, targetUserId, badgeId) {
    if (!adminUser || !adminUser.canModerate()) return false;
    const targetUser = this.users.find(u => u.id === targetUserId);
    const badge = this.badges.find(b => b.id === badgeId);
    if (!targetUser || !badge) return false;

    const revoked = badge.revokeFrom(targetUser);
    if (revoked) {
      this.db.saveUsers(this.users);

      this.db.addAuditLog(
        new AuditLog({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: 'BADGE_REVOKED',
          targetType: 'Badge',
          targetId: badge.id,
          details: `Insignia "${badge.name}" revocada a [${targetUser.name}].`
        })
      );

      return true;
    }
    return false;
  }

  // ==================== FORO ====================
  createPost({ title, content, category }) {
    const user = this.getCurrentUser();
    if (!user) return null;

    const isSci = category === 'Investigación Científica';
    const post = new ForumPost({
      author: user.name,
      authorId: user.id,
      avatar: user.avatar,
      role: user.role,
      category,
      isScientific: isSci,
      title: title.trim(),
      content: content.trim()
    });

    user.addXP(30);

    // Insignia Comunitaria
    let newlyUnlockedBadge = null;
    if (!user.hasBadge('badge-7')) {
      const b7 = this.badges.find(b => b.id === 'badge-7');
      if (b7) {
        b7.awardTo(user, 'Coordinación del Foro');
        newlyUnlockedBadge = b7;
      }
    }

    this.forumPosts.unshift(post);
    this.db.saveForum(this.forumPosts);
    this.db.saveUsers(this.users);
    return { post, newlyUnlockedBadge };
  }

  editPost(id, data) {
    const post = this.forumPosts.find(p => p.id === id);
    if (post) {
      post.edit(data);
      this.db.saveForum(this.forumPosts);
      return post;
    }
    return null;
  }

  deletePost(id) {
    const idx = this.forumPosts.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.forumPosts.splice(idx, 1);
      this.db.saveForum(this.forumPosts);
      return true;
    }
    return false;
  }

  togglePinPost(id) {
    const post = this.forumPosts.find(p => p.id === id);
    if (post) {
      post.togglePin();
      this.db.saveForum(this.forumPosts);
      return post.isPinned;
    }
    return false;
  }

  addComment(postId, text) {
    const user = this.getCurrentUser();
    const post = this.forumPosts.find(p => p.id === postId);
    if (!user || !post || !text.trim()) return null;

    const comment = post.addComment({
      author: user.name,
      authorId: user.id,
      role: user.role,
      avatar: user.avatar,
      date: 'Hace un momento',
      text: text.trim()
    });

    user.addXP(15);
    this.db.saveForum(this.forumPosts);
    this.db.saveUsers(this.users);
    return comment;
  }

  deleteComment(postId, commentIndex) {
    const post = this.forumPosts.find(p => p.id === postId);
    if (post) {
      const removed = post.removeComment(commentIndex);
      if (removed) this.db.saveForum(this.forumPosts);
      return removed;
    }
    return false;
  }

  toggleLikePost(postId) {
    const user = this.getCurrentUser();
    const post = this.forumPosts.find(p => p.id === postId);
    if (post) {
      const likes = post.toggleLike(user ? user.id : null);
      this.db.saveForum(this.forumPosts);
      return likes;
    }
    return 0;
  }

  // ==================== CAMPAÑAS DE DONACIÓN ====================
  donateToCampaign(campaignId, amount, donorName) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return { success: false, error: 'Campaña no encontrada.' };

    const success = campaign.donate(amount, donorName);
    if (success) {
      this.db.saveCampaigns(this.campaigns);
      const user = this.getCurrentUser();
      if (user) {
        user.addXP(50);
        this.db.saveUsers(this.users);
        this.db.addNotification(
          new Notification({
            userId: user.id,
            title: '💚 ¡Donación Confirmada!',
            message: `Aporte de ${campaign.formatCurrency(amount)} acreditado a "${campaign.title}". ¡Sumas +50 XP a tu perfil!`,
            type: 'general'
          })
        );
      }
      this.db.addAuditLog(
        new AuditLog({
          adminId: user ? user.id : 'anon',
          adminName: donorName || (user ? user.name : 'Donante Anónimo'),
          action: 'DONATION_RECEIVED',
          targetType: 'DonationCampaign',
          targetId: campaign.id,
          details: `Donación de ${campaign.formatCurrency(amount)} recibida para [${campaign.title}].`
        })
      );
      return { success: true, campaign };
    }
    return { success: false, error: 'Monto de donación inválido.' };
  }

  createCampaign(adminUser, data) {
    if (!adminUser || !adminUser.canModerate()) return null;
    const campaign = new DonationCampaign(data);
    this.campaigns.unshift(campaign);
    this.db.saveCampaigns(this.campaigns);
    return campaign;
  }

  // ==================== ESTADÍSTICAS REALES ====================
  getPlatformStats() {
    const totalUsers = this.users.length;
    const roleCounts = {
      Administrador: this.users.filter(u => u.role === 'Administrador').length,
      Experto: this.users.filter(u => u.role === 'Experto').length,
      Voluntario: this.users.filter(u => u.role === 'Voluntario').length,
      Ciudadano: this.users.filter(u => u.role === 'Ciudadano').length
    };

    const reportStats = {
      total: this.reports.length,
      aprobados: this.reports.filter(r => r.isApproved()).length,
      pendientes: this.reports.filter(r => r.isPending()).length,
      rechazados: this.reports.filter(r => r.isRejected()).length,
      byType: {
        vertimiento: this.reports.filter(r => r.incidentType === 'vertimiento').length,
        pesca_ilegal: this.reports.filter(r => r.incidentType === 'pesca_ilegal').length,
        derrame: this.reports.filter(r => r.incidentType === 'derrame').length,
        plasticos: this.reports.filter(r => r.incidentType === 'plasticos').length,
        otros: this.reports.filter(r => r.incidentType === 'otros').length
      }
    };

    const totalWasteCollectedKg = this.users.reduce((acc, u) => acc + u.calculateEcologicalImpact().collectedWasteKg, 0);
    const totalVolunteerHours = this.users.reduce((acc, u) => acc + u.calculateEcologicalImpact().volunteerHours, 0);

    return {
      totalUsers,
      roleCounts,
      reportStats,
      totalActivities: this.activities.length,
      totalPosts: this.forumPosts.length,
      totalEmergencyContacts: this.emergencyContacts.length,
      pendingVerifications: this.verifications.filter(v => v.isPending()).length,
      totalWasteCollectedKg: Number(totalWasteCollectedKg.toFixed(1)),
      totalVolunteerHours
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlatformManager };
}
