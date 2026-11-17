/**
 * ================================================================
 * CLASE BASE: User (Arquitectura POO - Abstracción y Encapsulamiento)
 * ================================================================
 * Modela un usuario base dentro de la plataforma Vida Marina - ODS 14.
 */
class User {
  constructor({
    id,
    name,
    email,
    password = '',
    city = 'Cartagena de Indias',
    avatar,
    role = 'Ciudadano',
    level = 1,
    xp = 0,
    enrolledActivityIds = [],
    earnedBadgeIds = [],
    twoFactorSecret = null,
    twoFactorEnabled = false,
    status = 'activo', // 'activo' | 'suspendido'
    institution = '',
    specialization = '',
    verifiedAt = null,
    createdAt = null
  }) {
    this.id = id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.name = name;
    this.email = email;
    this.password = password; // Encapsulado
    this.city = city;
    this.avatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
    this.role = role;
    this.level = Number(level) || 1;
    this.xp = Number(xp) || 0;
    this.enrolledActivityIds = [...(enrolledActivityIds || [])];
    this.earnedBadgeIds = [...(earnedBadgeIds || [])];
    this.twoFactorSecret = twoFactorSecret;
    this.twoFactorEnabled = Boolean(twoFactorEnabled);
    this.status = status || 'activo';
    this.institution = institution || '';
    this.specialization = specialization || '';
    this.verifiedAt = verifiedAt;
    this.createdAt = createdAt || new Date().toISOString();
  }

  // Encapsulamiento: Contraseña y seguridad
  validatePassword(plainPassword) {
    if (!this.password) return true;
    return this.password === plainPassword;
  }

  setPassword(newPassword) {
    if (typeof newPassword === 'string' && newPassword.length >= 6) {
      this.password = newPassword;
      return true;
    }
    return false;
  }

  // Encapsulamiento: Sistema de niveles y XP
  addXP(points) {
    if (typeof points !== 'number' || points <= 0) return this.xp;
    this.xp += points;
    this.level = this.calculateLevel();
    return this.xp;
  }

  calculateLevel() {
    if (this.xp >= 2500) return 5;
    if (this.xp >= 1500) return 4;
    if (this.xp >= 800) return 3;
    if (this.xp >= 300) return 2;
    return 1;
  }

  // Encapsulamiento: Inscripción de actividades
  enrollInActivity(activityId) {
    if (!this.canEnrollActivities()) return false;
    if (!this.enrolledActivityIds.includes(activityId)) {
      this.enrolledActivityIds.push(activityId);
      return true;
    }
    return false;
  }

  cancelActivityEnrollment(activityId) {
    const idx = this.enrolledActivityIds.indexOf(activityId);
    if (idx !== -1) {
      this.enrolledActivityIds.splice(idx, 1);
      return true;
    }
    return false;
  }

  isEnrolledIn(activityId) {
    return this.enrolledActivityIds.includes(activityId);
  }

  // Encapsulamiento: Insignias
  hasBadge(badgeId) {
    return this.earnedBadgeIds.includes(badgeId);
  }

  awardBadge(badgeId) {
    if (!this.hasBadge(badgeId)) {
      this.earnedBadgeIds.push(badgeId);
      return true;
    }
    return false;
  }

  revokeBadge(badgeId) {
    const idx = this.earnedBadgeIds.indexOf(badgeId);
    if (idx !== -1) {
      this.earnedBadgeIds.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Encapsulamiento: 2FA (TOTP)
  enable2FA(secret) {
    if (secret && typeof secret === 'string') {
      this.twoFactorSecret = secret;
      this.twoFactorEnabled = true;
      return true;
    }
    return false;
  }

  disable2FA() {
    this.twoFactorSecret = null;
    this.twoFactorEnabled = false;
  }

  has2FA() {
    return this.twoFactorEnabled && Boolean(this.twoFactorSecret);
  }

  requires2FA() {
    // 2FA obligatorio para Administrador y Experto
    return this.role === 'Administrador' || this.role === 'Experto' || this.role === 'Coordinadora';
  }

  // Estado de la cuenta
  isActive() {
    return this.status === 'activo';
  }

  isSuspended() {
    return this.status === 'suspendido';
  }

  suspend() {
    this.status = 'suspendido';
  }

  reactivate() {
    this.status = 'activo';
  }

  // Polimorfismo: Métodos sobreescritos en subclases
  canModerate() {
    return false;
  }

  canPublishScience() {
    return false;
  }

  canEnrollActivities() {
    return true;
  }

  canReviewReports() {
    return false;
  }

  canManageDirectory() {
    return false;
  }

  getRoleBadgeColor() {
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  }

  getRoleTitle() {
    return this.role;
  }

  calculateEcologicalImpact() {
    const count = this.enrolledActivityIds.length;
    return {
      volunteerHours: count * 4,
      collectedWasteKg: Number((count * 12.5).toFixed(1)),
      protectedHabitats: Math.min(count, 8),
      treesOrCoralsPlanted: count * 5
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      city: this.city,
      avatar: this.avatar,
      role: this.role,
      level: this.level,
      xp: this.xp,
      enrolledActivityIds: this.enrolledActivityIds,
      earnedBadgeIds: this.earnedBadgeIds,
      twoFactorSecret: this.twoFactorSecret,
      twoFactorEnabled: this.twoFactorEnabled,
      status: this.status,
      institution: this.institution,
      specialization: this.specialization,
      verifiedAt: this.verifiedAt,
      createdAt: this.createdAt
    };
  }
}

/**
 * ================================================================
 * SUBCLASE: Citizen (Herencia y Polimorfismo)
 * ================================================================
 * Rol 1: Ciudadano - Puede consultar, realizar reportes y solicitar verificación.
 */
class Citizen extends User {
  constructor(data) {
    super({ ...data, role: 'Ciudadano' });
  }

  canModerate() {
    return false;
  }

  canPublishScience() {
    return false;
  }

  canEnrollActivities() {
    return false; // Requiere ascender a Voluntario
  }

  canReviewReports() {
    return false;
  }

  getRoleBadgeColor() {
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  }

  getRoleTitle() {
    return '🌊 Ciudadano Costero';
  }
}

/**
 * ================================================================
 * SUBCLASE: Volunteer (Herencia y Polimorfismo)
 * ================================================================
 * Rol 2: Voluntario - Participa activamente en actividades, foro y reportes.
 */
class Volunteer extends User {
  constructor(data) {
    super({ ...data, role: 'Voluntario' });
  }

  canModerate() {
    return false;
  }

  canPublishScience() {
    return false;
  }

  canEnrollActivities() {
    return true;
  }

  getRoleBadgeColor() {
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  }

  getRoleTitle() {
    return '🐬 Voluntario Marino';
  }
}

/**
 * ================================================================
 * SUBCLASE: ExpertResearcher (Herencia y Polimorfismo)
 * ================================================================
 * Rol 3: Experto o Investigador - Acreditado científicamente.
 */
class ExpertResearcher extends User {
  constructor(data) {
    super({ ...data, role: 'Experto' });
    this.institution = data.institution || 'INVEMAR - Instituto de Investigaciones Marinas';
    this.specialization = data.specialization || 'Biología Marina y Conservación de Arrecifes';
    this.verifiedAt = data.verifiedAt || new Date().toISOString();
  }

  canModerate() {
    return false;
  }

  canPublishScience() {
    return true;
  }

  canEnrollActivities() {
    return true;
  }

  canReviewReports() {
    return false; // Sólo el admin aprueba oficialmente, pero experto analiza
  }

  getRoleBadgeColor() {
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }

  getRoleTitle() {
    return '🔬 Investigador / Experto ODS 14';
  }
}

/**
 * ================================================================
 * SUBCLASE: AdminCoordinator (Herencia y Polimorfismo)
 * ================================================================
 * Rol 4: Administrador General - Control total del sistema (RBAC completo).
 */
class AdminCoordinator extends User {
  constructor(data) {
    super({ ...data, role: 'Administrador' });
    this.department = data.department || 'Dirección de Conservación Marina UMB';
  }

  canModerate() {
    return true;
  }

  canPublishScience() {
    return true;
  }

  canEnrollActivities() {
    return true;
  }

  canReviewReports() {
    return true;
  }

  canManageDirectory() {
    return true;
  }

  getRoleBadgeColor() {
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  }

  getRoleTitle() {
    return '👑 Administrador General';
  }
}

/**
 * ================================================================
 * FACTORY PATTERN: UserFactory
 * ================================================================
 * Instancia dinámicamente la subclase correspondiente según el rol.
 */
class UserFactory {
  static createUser(data) {
    if (!data) return null;
    const role = (data.role || '').toLowerCase();
    if (role === 'administrador' || role === 'coordinadora' || role === 'admin' || data.id === 'admin-marina') {
      return new AdminCoordinator(data);
    }
    if (role === 'experto' || role === 'investigador' || role === 'expert') {
      return new ExpertResearcher(data);
    }
    if (role === 'voluntario' || role === 'volunteer') {
      return new Volunteer(data);
    }
    return new Citizen(data);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { User, Citizen, Volunteer, ExpertResearcher, AdminCoordinator, UserFactory };
}
