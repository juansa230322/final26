/**
 * ================================================================
 * SERVICIO: DatabaseService (Patrón Singleton y Factory Hydration)
 * ================================================================
 * Gestiona el almacenamiento y sincronización de datos con persistencia
 * en LocalStorage / Supabase, instanciando clases vivas del modelo POO.
 */
class DatabaseService {
  static instance = null;

  constructor() {
    if (DatabaseService.instance) {
      return DatabaseService.instance;
    }
    this.dbKey = 'VIDA_MARINA_DATABASE_V4';

    // Colecciones reactivas en memoria
    this.users = [];
    this.activities = [];
    this.badges = [];
    this.forumPosts = [];
    this.reports = [];
    this.emergencyContacts = [];
    this.verifications = [];
    this.campaigns = [];
    this.notifications = [];
    this.auditLogs = [];

    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        this.broadcast = new BroadcastChannel('vida_marina_sync_channel');
        this.broadcast.onmessage = (ev) => {
          if (ev.data && ev.data.type) {
            window.dispatchEvent(new CustomEvent('vida_marina_sync', { detail: ev.data }));
          }
        };
      } catch (e) {}
    }

    DatabaseService.instance = this;
  }

  notifySync(type = 'general') {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('vida_marina_sync', { detail: { type } }));
        if (this.broadcast) {
          this.broadcast.postMessage({ type });
        }
      } catch (e) {}
    }
  }

  static getInstance() {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // ==================== FACTORY HYDRATION METHODS ====================
  hydrateUser(raw) {
    if (raw instanceof User) return raw;
    if (typeof UserFactory !== 'undefined') {
      return UserFactory.createUser(raw);
    }
    const role = (raw.role || '').toLowerCase();
    if (role === 'administrador' || role === 'coordinadora' || role === 'admin' || raw.id === 'admin-marina') {
      return new AdminCoordinator(raw);
    }
    if (role === 'experto' || role === 'investigador') {
      return new ExpertResearcher(raw);
    }
    if (role === 'voluntario') {
      return new Volunteer(raw);
    }
    return new Citizen(raw);
  }

  hydrateActivity(raw) {
    if (raw instanceof Activity) return raw;
    return new Activity(raw);
  }

  hydrateBadge(raw) {
    if (raw instanceof Badge) return raw;
    return new Badge(raw);
  }

  hydratePost(raw) {
    if (raw instanceof ForumPost) return raw;
    return new ForumPost(raw);
  }

  hydrateReport(raw) {
    if (raw instanceof EnvironmentalReport) return raw;
    return new EnvironmentalReport(raw);
  }

  hydrateContact(raw) {
    if (raw instanceof EmergencyContact) return raw;
    return new EmergencyContact(raw);
  }

  hydrateVerification(raw) {
    if (raw instanceof ExpertVerification) return raw;
    return new ExpertVerification(raw);
  }

  hydrateCampaign(raw) {
    if (raw instanceof DonationCampaign) return raw;
    return new DonationCampaign(raw);
  }

  hydrateNotification(raw) {
    if (raw instanceof Notification) return raw;
    return new Notification(raw);
  }

  hydrateAuditLog(raw) {
    if (raw instanceof AuditLog) return raw;
    return new AuditLog(raw);
  }

  // ==================== GESTIÓN DE USUARIOS ====================
  loadUsers(seedUsers = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_users');
      const list = data ? JSON.parse(data) : seedUsers;
      this.users = list.map(u => this.hydrateUser(u));
      return this.users;
    } catch (e) {
      this.users = seedUsers.map(u => this.hydrateUser(u));
      return this.users;
    }
  }

  saveUsers(users) {
    try {
      this.users = users;
      localStorage.setItem(this.dbKey + '_users', JSON.stringify(users.map(u => u.toJSON())));
      this.notifySync('users');
    } catch (e) {
      console.error('Error guardando usuarios:', e);
    }
  }

  promoteUserToRole(userId, newRole) {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const current = this.users[idx];
      const json = current.toJSON();
      json.role = newRole;
      const promoted = this.hydrateUser(json);
      this.users[idx] = promoted;
      this.saveUsers(this.users);
      return promoted;
    }
    return null;
  }

  // ==================== GESTIÓN DE SESIÓN ====================
  loadCurrentUserId(defaultId = null) {
    try {
      return sessionStorage.getItem(this.dbKey + '_currentUser') || defaultId;
    } catch (e) {
      return defaultId;
    }
  }

  saveCurrentUserId(id) {
    try {
      if (id) {
        sessionStorage.setItem(this.dbKey + '_currentUser', id);
      } else {
        sessionStorage.removeItem(this.dbKey + '_currentUser');
      }
    } catch (e) {}
  }

  // ==================== ACTIVIDADES ====================
  loadActivities(seedActivities = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_activities');
      const list = data ? JSON.parse(data) : seedActivities;
      this.activities = list.map(a => this.hydrateActivity(a));
      return this.activities;
    } catch (e) {
      this.activities = seedActivities.map(a => this.hydrateActivity(a));
      return this.activities;
    }
  }

  saveActivities(activities) {
    try {
      this.activities = activities;
      localStorage.setItem(this.dbKey + '_activities', JSON.stringify(activities.map(a => a.toJSON())));
    } catch (e) {}
  }

  // ==================== INSIGNIAS ====================
  loadBadges(seedBadges = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_badges');
      const list = data ? JSON.parse(data) : seedBadges;
      this.badges = list.map(b => this.hydrateBadge(b));
      return this.badges;
    } catch (e) {
      this.badges = seedBadges.map(b => this.hydrateBadge(b));
      return this.badges;
    }
  }

  saveBadges(badges) {
    try {
      this.badges = badges;
      localStorage.setItem(this.dbKey + '_badges', JSON.stringify(badges.map(b => b.toJSON())));
      this.notifySync('badges');
    } catch (e) {}
  }

  // ==================== FORO ====================
  loadForum(seedForum = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_forum');
      const list = data ? JSON.parse(data) : seedForum;
      this.forumPosts = list.map(p => this.hydratePost(p));
      return this.forumPosts;
    } catch (e) {
      this.forumPosts = seedForum.map(p => this.hydratePost(p));
      return this.forumPosts;
    }
  }

  saveForum(posts) {
    try {
      this.forumPosts = posts;
      localStorage.setItem(this.dbKey + '_forum', JSON.stringify(posts.map(p => p.toJSON())));
    } catch (e) {}
  }

  // ==================== REPORTES AMBIENTALES (RF05) ====================
  loadReports(seedReports = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_reports');
      const list = data ? JSON.parse(data) : seedReports;
      this.reports = list.map(r => this.hydrateReport(r));
      return this.reports;
    } catch (e) {
      this.reports = seedReports.map(r => this.hydrateReport(r));
      return this.reports;
    }
  }

  saveReports(reports) {
    try {
      this.reports = reports;
      localStorage.setItem(this.dbKey + '_reports', JSON.stringify(reports.map(r => r.toJSON())));
      this.notifySync('reports');
    } catch (e) {}
  }

  // ==================== CONTACTOS DE EMERGENCIA (RF06) ====================
  loadEmergencyContacts(seedContacts = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_contacts');
      const list = data ? JSON.parse(data) : seedContacts;
      this.emergencyContacts = list.map(c => this.hydrateContact(c));
      return this.emergencyContacts;
    } catch (e) {
      this.emergencyContacts = seedContacts.map(c => this.hydrateContact(c));
      return this.emergencyContacts;
    }
  }

  saveEmergencyContacts(contacts) {
    try {
      this.emergencyContacts = contacts;
      localStorage.setItem(this.dbKey + '_contacts', JSON.stringify(contacts.map(c => c.toJSON())));
    } catch (e) {}
  }

  // ==================== VERIFICACIÓN DE EXPERTOS (RF10) ====================
  loadVerifications(seedVerifications = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_verifications');
      const list = data ? JSON.parse(data) : seedVerifications;
      this.verifications = list.map(v => this.hydrateVerification(v));
      return this.verifications;
    } catch (e) {
      this.verifications = seedVerifications.map(v => this.hydrateVerification(v));
      return this.verifications;
    }
  }

  saveVerifications(verifications) {
    try {
      this.verifications = verifications;
      localStorage.setItem(this.dbKey + '_verifications', JSON.stringify(verifications.map(v => v.toJSON())));
    } catch (e) {}
  }

  // ==================== CAMPAÑAS DE DONACIÓN ====================
  loadCampaigns(seedCampaigns = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_campaigns');
      const list = data ? JSON.parse(data) : seedCampaigns;
      this.campaigns = list.map(c => this.hydrateCampaign(c));
      return this.campaigns;
    } catch (e) {
      this.campaigns = seedCampaigns.map(c => this.hydrateCampaign(c));
      return this.campaigns;
    }
  }

  saveCampaigns(campaigns) {
    try {
      this.campaigns = campaigns;
      localStorage.setItem(this.dbKey + '_campaigns', JSON.stringify(campaigns.map(c => c.toJSON())));
      this.notifySync('campaigns');
    } catch (e) {}
  }

  // ==================== NOTIFICACIONES ====================
  loadNotifications(seedNotifications = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_notifications');
      const list = data ? JSON.parse(data) : seedNotifications;
      this.notifications = list.map(n => this.hydrateNotification(n));
      return this.notifications;
    } catch (e) {
      this.notifications = seedNotifications.map(n => this.hydrateNotification(n));
      return this.notifications;
    }
  }

  saveNotifications(notifications) {
    try {
      this.notifications = notifications;
      localStorage.setItem(this.dbKey + '_notifications', JSON.stringify(notifications.map(n => n.toJSON())));
      this.notifySync('notifications');
    } catch (e) {}
  }

  addNotification(notif) {
    const item = this.hydrateNotification(notif);
    this.notifications.unshift(item);
    this.saveNotifications(this.notifications);
    return item;
  }

  getUserNotifications(userId) {
    return this.notifications.filter(n => n.userId === userId || n.userId === 'all');
  }

  markNotificationAsRead(notifId) {
    const notif = this.notifications.find(n => n.id === notifId);
    if (notif) {
      notif.markAsRead();
      this.saveNotifications(this.notifications);
      return true;
    }
    return false;
  }

  // ==================== AUDIT LOG (HISTORIAL ADMINISTRATIVO) ====================
  loadAuditLogs(seedLogs = []) {
    try {
      const data = localStorage.getItem(this.dbKey + '_audit');
      const list = data ? JSON.parse(data) : seedLogs;
      this.auditLogs = list.map(l => this.hydrateAuditLog(l));
      return this.auditLogs;
    } catch (e) {
      this.auditLogs = seedLogs.map(l => this.hydrateAuditLog(l));
      return this.auditLogs;
    }
  }

  saveAuditLogs(logs) {
    try {
      this.auditLogs = logs;
      localStorage.setItem(this.dbKey + '_audit', JSON.stringify(logs.map(l => l.toJSON())));
    } catch (e) {}
  }

  addAuditLog(log) {
    const item = this.hydrateAuditLog(log);
    this.auditLogs.unshift(item);
    this.saveAuditLogs(this.auditLogs);
    return item;
  }

  // ==================== RESET BASE DE DATOS ====================
  resetDatabase() {
    try {
      const keys = [
        '_users',
        '_activities',
        '_badges',
        '_forum',
        '_reports',
        '_contacts',
        '_verifications',
        '_campaigns',
        '_notifications',
        '_audit',
        '_currentUser'
      ];
      keys.forEach(k => {
        localStorage.removeItem(this.dbKey + k);
        sessionStorage.removeItem(this.dbKey + k);
        localStorage.removeItem('VIDA_MARINA_DATABASE_V3' + k);
        localStorage.removeItem('VIDA_MARINA_DATABASE_V2' + k);
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DatabaseService };
}
