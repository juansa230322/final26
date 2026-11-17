/**
 * ================================================================
 * CLASE: AuditLog
 * ================================================================
 * Registra formalmente cada acción administrativa y cambio de estado en la plataforma.
 */
class AuditLog {
  constructor({
    id,
    adminId,
    adminName = 'Coordinador Administrador',
    action, // e.g. 'REPORT_APPROVED', 'ROLE_CHANGED', 'USER_SUSPENDED'
    targetType, // 'User', 'EnvironmentalReport', 'ExpertVerification', 'Badge', etc.
    targetId,
    details = '',
    timestamp = null
  }) {
    this.id = id || `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.adminId = adminId;
    this.adminName = adminName;
    this.action = action;
    this.targetType = targetType;
    this.targetId = targetId;
    this.details = details;
    this.timestamp = timestamp || new Date().toISOString();
  }

  getActionBadgeColor() {
    if (this.action.includes('APPROVED') || this.action.includes('AWARDED') || this.action.includes('REACTIVATED')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (this.action.includes('REJECTED') || this.action.includes('DELETED') || this.action.includes('SUSPENDED')) {
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    }
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  }

  toJSON() {
    return {
      id: this.id,
      adminId: this.adminId,
      adminName: this.adminName,
      action: this.action,
      targetType: this.targetType,
      targetId: this.targetId,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuditLog };
}
