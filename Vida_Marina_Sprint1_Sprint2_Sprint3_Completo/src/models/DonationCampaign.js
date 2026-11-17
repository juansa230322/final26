/**
 * ================================================================
 * CLASE: DonationCampaign
 * ================================================================
 * Modela campañas oficiales de recaudación para conservación marina y restauración de arrecifes.
 */
class DonationCampaign {
  constructor({
    id,
    title,
    description,
    targetAmount = 10000000,
    currentAmount = 0,
    donorCount = 0,
    organizer = 'Fundación Vida Marina UMB',
    image,
    deadline,
    status = 'activa', // 'activa' | 'completada' | 'pausada'
    category = 'Restauración Coralina',
    recentDonations = [],
    createdAt = null
  }) {
    this.id = id || `camp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.title = title;
    this.description = description;
    this.targetAmount = Number(targetAmount) || 10000000;
    this.currentAmount = Number(currentAmount) || 0;
    this.donorCount = Number(donorCount) || 0;
    this.organizer = organizer;
    this.image = image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80';
    this.deadline = deadline || '2026-12-31';
    this.status = status || 'activa';
    this.category = category;
    this.recentDonations = Array.isArray(recentDonations) ? recentDonations : [];
    this.createdAt = createdAt || new Date().toISOString();
  }

  donate(amount, donorName = 'Donante Anónimo') {
    const num = Number(amount);
    if (num > 0) {
      this.currentAmount += num;
      this.donorCount += 1;
      if (this.currentAmount >= this.targetAmount) {
        this.status = 'completada';
      }
      // Registrar en historial de donaciones recientes
      this.recentDonations.unshift({
        id: `don-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        donor: donorName || 'Donante Anónimo',
        amount: num,
        date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      });
      if (this.recentDonations.length > 8) {
        this.recentDonations.pop();
      }
      return true;
    }
    return false;
  }

  getPercentage() {
    if (this.targetAmount <= 0) return 100;
    return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
  }

  isCompleted() {
    return this.status === 'completada' || this.currentAmount >= this.targetAmount;
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      targetAmount: this.targetAmount,
      currentAmount: this.currentAmount,
      donorCount: this.donorCount,
      organizer: this.organizer,
      image: this.image,
      deadline: this.deadline,
      status: this.status,
      category: this.category,
      recentDonations: this.recentDonations,
      createdAt: this.createdAt
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DonationCampaign };
}
