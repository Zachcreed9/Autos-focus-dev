/**
 * Module d'analyse pour Auto-Focus
 * Fournit des analyses avancées de productivité et des recommandations personnalisées.
 * Améliorations incluses : modularisation, validation des données, gestion des erreurs et optimisation des performances.
 */

class AutoFocusAnalytics {
  constructor() {
    this.data = {
      productivity: {},
      focusPatterns: {},
      sitesUsage: {},
      timeDistribution: {},
      distractionPatterns: {},
      productivityScore: 0,
      lastUpdate: null,
    };

    this.init();
  }

  /**
   * Initialise le module d'analyse
   */
  init() {
    this.loadData();
  }

  /**
   * Charge les données d'analyse depuis le stockage
   */
  loadData() {
    chrome.storage.sync.get('analyticsData', (data) => {
      if (data.analyticsData) {
        this.data = { ...this.data, ...data.analyticsData };
      }
    });
  }

  /**
   * Sauvegarde les données d'analyse dans le stockage
   */
  saveData() {
    chrome.storage.sync.set({ analyticsData: this.data }, () => {
      console.log('Données d\'analyse sauvegardées avec succès.');
    });
  }

  /**
   * Met à jour les données d'analyse avec les dernières statistiques
   */
  updateAnalytics() {
    chrome.storage.sync.get(['stats', 'blockedSites', 'settings'], (data) => {
      try {
        const stats = data.stats || {};
        const blockedSites = data.blockedSites || [];
        const settings = data.settings || {};

        this.updateProductivityPatterns(stats);
        this.updateFocusPatterns(stats);
        this.updateSitesUsage(stats, blockedSites);
        this.updateTimeDistribution(stats);
        this.updateDistractionPatterns(stats, blockedSites);
        this.calculateProductivityScore();

        this.data.lastUpdate = new Date().toISOString();
        this.saveData();
      } catch (error) {
        console.error('Erreur lors de la mise à jour des analyses :', error);
      }
    });
  }

  /**
   * Met à jour les modèles de productivité
   * @param {object} stats - Statistiques d'utilisation
   */
  updateProductivityPatterns(stats) {
    const productivity = {
      daily: {},
      weekly: {},
      monthly: {},
      trend: 'stable',
    };

    const dailyStats = stats.daily || {};
    Object.entries(dailyStats).forEach(([date, dayStats]) => {
      productivity.daily[date] = this.calculateDailyProductivity(dayStats);
    });

    this.calculateTrends(productivity);
    this.data.productivity = productivity;
  }

  /**
   * Calcule la productivité quotidienne
   * @param {object} dayStats - Statistiques d'une journée
   * @returns {number} Score de productivité (0-100)
   */
  calculateDailyProductivity(dayStats) {
    if (!dayStats) return 0;

    const focusTimeFactor = Math.min(dayStats.focusTime / 240, 1) * 40; // 40 points max pour 4 heures
    const blockedCountFactor = Math.min(Math.max(10 - dayStats.blockedCount, 0) / 10, 1) * 20; // 20 points max
    const sessionsFactor = Math.min(dayStats.sessions / 5, 1) * 20; // 20 points max pour 5 sessions
    const peakHoursFactor = Math.min(dayStats.peakHoursWork / 4, 1) * 20; // 20 points max

    return Math.round(focusTimeFactor + blockedCountFactor + sessionsFactor + peakHoursFactor);
  }

  /**
   * Calcule les tendances hebdomadaires et mensuelles
   * @param {object} productivity - Données de productivité
   */
  calculateTrends(productivity) {
    const dates = Object.keys(productivity.daily).sort();

    if (dates.length > 0) {
      const weeklyData = this.groupByWeek(dates, productivity.daily);
      productivity.weekly = this.calculateAverages(weeklyData);

      const trend = this.analyzeTrend(productivity.weekly);
      productivity.trend = trend;

      const monthlyData = this.groupByMonth(dates, productivity.daily);
      productivity.monthly = this.calculateAverages(monthlyData);
    }
  }

  /**
   * Groupe les données par semaine
   * @param {string[]} dates - Liste des dates
   * @param {object} dailyData - Données quotidiennes
   * @returns {object} Données regroupées par semaine
   */
  groupByWeek(dates, dailyData) {
    return dates.reduce((weeks, date) => {
      const week = this.getWeekNumber(new Date(date));
      const weekKey = `${week.year}-W${week.week}`;
      weeks[weekKey] = weeks[weekKey] || [];
      weeks[weekKey].push(dailyData[date]);
      return weeks;
    }, {});
  }

  /**
   * Groupe les données par mois
   * @param {string[]} dates - Liste des dates
   * @param {object} dailyData - Données quotidiennes
   * @returns {object} Données regroupées par mois
   */
  groupByMonth(dates, dailyData) {
    return dates.reduce((months, date) => {
      const month = new Date(date).toISOString().substring(0, 7); // YYYY-MM
      months[month] = months[month] || [];
      months[month].push(dailyData[date]);
      return months;
    }, {});
  }

  /**
   * Calcule les moyennes pour les données regroupées
   * @param {object} groupedData - Données regroupées
   * @returns {object} Moyennes calculées
   */
  calculateAverages(groupedData) {
    return Object.entries(groupedData).reduce((averages, [key, values]) => {
      averages[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return averages;
    }, {});
  }

  /**
   * Analyse les tendances entre les semaines
   * @param {object} weeklyData - Données hebdomadaires
   * @returns {string} Tendance ('improving', 'declining', 'stable')
   */
  analyzeTrend(weeklyData) {
    const weeks = Object.keys(weeklyData).sort();
    if (weeks.length < 2) return 'stable';

    const latestWeek = weeklyData[weeks[weeks.length - 1]];
    const previousWeek = weeklyData[weeks[weeks.length - 2]];

    if (latestWeek > previousWeek * 1.1) return 'improving';
    if (latestWeek < previousWeek * 0.9) return 'declining';
    return 'stable';
  }

  /**
   * Obtient le numéro de la semaine pour une date
   * @param {Date} date - La date
   * @returns {object} Année et numéro de semaine
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return {
      year: d.getUTCFullYear(),
      week: Math.ceil((((d - yearStart) / 86400000) + 1) / 7),
    };
  }
}

// Création d'une instance globale d'analyse
window.analytics = window.analytics || new AutoFocusAnalytics();