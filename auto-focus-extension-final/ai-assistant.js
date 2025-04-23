/**
 * Module d'IA pour Auto-Focus
 * Apprend des habitudes de l'utilisateur et améliore automatiquement l'expérience.
 * Optimisé pour la lisibilité, la maintenabilité et la robustesse.
 */

class AutoFocusAI {
  constructor() {
    this.data = {
      sitePreferences: {}, // Préférences par site
      frequentlyBlockedSites: {}, // Sites souvent bloqués manuellement
      focusPatterns: {}, // Schémas d'utilisation
      suggestedSettings: {}, // Paramètres suggérés
      lastAnalysis: null, // Date de la dernière analyse
    };

    this.init();
  }

  /**
   * Initialise le module AutoFocusAI
   * Charge les données existantes et planifie l'analyse hebdomadaire.
   */
  init() {
    this.loadData();
    this.scheduleWeeklyAnalysis();
  }

  /**
   * Charge les données IA depuis le stockage
   */
  loadData() {
    chrome.storage.sync.get('aiData', (result) => {
      if (result.aiData) {
        this.data = { ...this.data, ...result.aiData };
      }
    });
  }

  /**
   * Sauvegarde les données IA dans le stockage
   */
  saveData() {
    chrome.storage.sync.set({ aiData: this.data }, () => {
      console.log('Données AI sauvegardées avec succès.');
    });
  }

  /**
   * Planifie une analyse hebdomadaire des données utilisateur
   */
  scheduleWeeklyAnalysis() {
    const now = new Date();
    const lastAnalysis = this.data.lastAnalysis ? new Date(this.data.lastAnalysis) : null;

    if (!lastAnalysis || this.daysBetween(lastAnalysis, now) >= 7) {
      this.analyzeUserData();
    }

    // Planifie la prochaine vérification dans 24 heures
    setTimeout(() => this.scheduleWeeklyAnalysis(), 24 * 60 * 60 * 1000);
  }

  /**
   * Calcule le nombre de jours entre deux dates
   * @param {Date} date1 
   * @param {Date} date2 
   * @returns {number} Nombre de jours
   */
  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // heures * minutes * secondes * millisecondes
    return Math.round(Math.abs((date1 - date2) / oneDay));
  }

  /**
   * Analyse les données utilisateur pour générer des recommandations
   */
  analyzeUserData() {
    chrome.storage.sync.get(['stats', 'blockedSites', 'whitelist', 'scheduleSettings'], (data) => {
      try {
        this.data.lastAnalysis = new Date().toISOString();

        this.analyzeBlockedSites(data.stats, data.blockedSites);
        this.analyzeTimePatterns(data.stats);
        this.generateSuggestions(data);

        this.saveData();
        this.checkNotifications();
      } catch (error) {
        console.error('Erreur lors de l\'analyse des données utilisateur:', error);
      }
    });
  }

  /**
   * Analyse les sites bloqués pour identifier ceux fréquemment bloqués
   */
  analyzeBlockedSites(stats, blockedSites) {
    if (!stats?.blockedSites) return;

    this.data.frequentlyBlockedSites = Object.entries(stats.blockedSites)
      .filter(([domain, count]) => count > 5 && (!blockedSites || !blockedSites.includes(domain)))
      .reduce((acc, [domain, count]) => {
        acc[domain] = count;
        return acc;
      }, {});
  }

  /**
   * Analyse les schémas temporels d'utilisation
   */
  analyzeTimePatterns(stats) {
    if (!stats?.focusSessions || stats.focusSessions.length === 0) return;

    const hourCounts = Array(24).fill(0);
    const dayCounts = Array(7).fill(0);

    stats.focusSessions.forEach(({ date }) => {
      const sessionDate = new Date(date);
      hourCounts[sessionDate.getHours()]++;
      dayCounts[sessionDate.getDay()]++;
    });

    this.data.focusPatterns = {
      productiveHours: this.getTopIndexes(hourCounts, 3),
      productiveDays: this.getTopIndexes(dayCounts).filter(day => dayCounts[day] > 0),
      totalSessions: stats.focusSessions.length,
    };
  }

  /**
   * Obtient les index des valeurs les plus élevées dans un tableau
   * @param {number[]} counts Tableau de valeurs
   * @param {number} limit Nombre maximum d'index à retourner
   * @returns {number[]} Index triés par ordre décroissant de valeurs
   */
  getTopIndexes(counts, limit = counts.length) {
    return counts
      .map((count, index) => ({ index, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ index }) => index);
  }

  /**
   * Génère des suggestions de paramètres basées sur l'analyse
   */
  generateSuggestions(data) {
    const suggestions = {};

    if (Object.keys(this.data.frequentlyBlockedSites).length > 0) {
      suggestions.sitesToBlock = Object.keys(this.data.frequentlyBlockedSites);
    }

    if (this.data.focusPatterns.productiveHours?.length) {
      const productiveHours = this.data.focusPatterns.productiveHours;
      const scheduleEnabled = data.scheduleSettings?.enabled;

      if (!scheduleEnabled) {
        suggestions.scheduleSettings = {
          enabled: true,
          days: this.data.focusPatterns.productiveDays,
          timeRanges: productiveHours.map(hour => ({
            name: `Période ${hour}`,
            start: `${hour.toString().padStart(2, '0')}:00`,
            end: `${(hour + 3).toString().padStart(2, '0')}:00`,
          })),
        };
      }
    }

    if (data.blockedSites?.length > 10) {
      suggestions.blockingMode = 'strict';
    }

    this.data.suggestedSettings = suggestions;
  }

  /**
   * Vérifie si des notifications doivent être affichées
   */
  checkNotifications() {
    const { sitesToBlock, scheduleSettings, blockingMode } = this.data.suggestedSettings;

    if (sitesToBlock?.length) this.showSuggestedSitesNotification(sitesToBlock);
    if (scheduleSettings) this.showScheduleSuggestionNotification();
    if (blockingMode) this.showBlockingModeSuggestionNotification(blockingMode);
  }

  /**
   * Affiche une notification pour les sites suggérés à bloquer
   */
  showSuggestedSitesNotification(sites) {
    const sitesToShow = sites.slice(0, 3);
    const remainingCount = sites.length - sitesToShow.length;

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon128.png',
      title: 'Suggestion Auto-Focus',
      message: `Sites suggérés à bloquer: ${sitesToShow.join(', ')}${remainingCount > 0 ? ` et ${remainingCount} autres` : ''}`,
      buttons: [{ title: 'Voir les suggestions' }, { title: 'Ignorer' }],
      priority: 0,
    });
  }

  /**
   * Affiche une notification pour la planification suggérée
   */
  showScheduleSuggestionNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon128.png',
      title: 'Amélioration de productivité',
      message: 'Auto-Focus a identifié vos périodes de productivité optimales et propose une planification adaptée.',
      buttons: [{ title: 'Voir la suggestion' }, { title: 'Ignorer' }],
      priority: 0,
    });
  }

  /**
   * Affiche une notification pour le mode de blocage suggéré
   */
  showBlockingModeSuggestionNotification(mode) {
    const modeNames = {
      strict: 'Strict',
      scheduled: 'Planifié',
      pomodoro: 'Pomodoro',
    };

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon128.png',
      title: 'Suggestion de mode de blocage',
      message: `Le mode "${modeNames[mode] || mode}" pourrait améliorer votre concentration.`,
      buttons: [{ title: 'Activer ce mode' }, { title: 'En savoir plus' }],
      priority: 0,
    });
  }
}

// Créer et exporter l'instance
window.autoFocusAI = new AutoFocusAI();