/**
 * ================================================================
 * CLASE: Notification
 * ================================================================
 * Modela las alertas, avisos de moderación y notificaciones del sistema.
 */
class Notification {
  constructor({
    id,
    userId,
    title,
    message,
    type = 'general', // 'badge' | 'report_status' | 'verification_status' | 'activity' | 'general'
    isRead = false,
    link = null,
    createdAt = null
  }) {
    this.id = id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.userId = userId;
    this.title = title;
    this.message = message;
    this.type = type;
    this.isRead = Boolean(isRead);
    this.link = link;
    this.createdAt = createdAt || new Date().toISOString();
  }

  markAsRead() {
    this.isRead = true;
    return true;
  }

  getTypeIcon() {
    switch (this.type) {
      case 'badge':
        return '🏆';
      case 'report_status':
        return '🌊';
      case 'verification_status':
        return '🔬';
      case 'activity':
        return '📅';
      case 'general':
      default:
        return '🔔';
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      message: this.message,
      type: this.type,
      isRead: this.isRead,
      link: this.link,
      createdAt: this.createdAt
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Notification };
}
