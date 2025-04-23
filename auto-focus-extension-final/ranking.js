/**
 * Module de classement et grades pour Auto-Focus
 * Système avancé de progression et de récompenses, optimisé avec gestion des erreurs.
 */

class AutoFocusRanking {
  constructor() {
    this.levels = [
      { level: 1, name: "Novice", minXP: 0, maxXP: 100, badge: "🌱" },
      { level: 2, name: "Apprenti", minXP: 100, maxXP: 250, badge: "🌿" },
      { level: 3, name: "Initié", minXP: 250, maxXP: 500, badge: "🍀" },
      { level: 4, name: "Adepte", minXP: 500, maxXP: 1000, badge: "🌻" },
      { level: 5, name: "Expert", minXP: 1000, maxXP: 2000, badge: "🌲" },
      { level: 6, name: "Maître", minXP: 2000, maxXP: 4000, badge: "🌳" },
      { level: 7, name: "Grand Maître", minXP: 4000, maxXP: 7000, badge: "🌴" },
      { level: 8, name: "Légende", minXP: 7000, maxXP: 10000, badge: "🌟" },
      { level: 9, name: "Mythique", minXP: 10000, maxXP: 15000, badge: "🌠" },
      { level: 10, name: "Transcendant", minXP: 15000, maxXP: Infinity, badge: "👑" }
    ];

    this.productivityRanks = [
      { name: "Bronze", minScore: 0, maxScore: 40, icon: "🥉" },
      { name: "Argent", minScore: 40, maxScore: 65, icon: "🥈" },
      { name: "Or", minScore: 65, maxScore: 85, icon: "🥇" },
      { name: "Platine", minScore: 85, maxScore: 95, icon: "💎" },
      { name: "Diamant", minScore: 95, maxScore: 101, icon: "🏆" }
    ];

    this.specializations = [
      { id: "focus_master", name: "Maître de la Concentration", criteria: { focusTime: 10000 } },
      { id: "no_distraction", name: "Immunité aux Distractions", criteria: { distractionResistance: 100 } },
      { id: "morning_person", name: "Lève-tôt", criteria: { morningActivity: 50 } },
      // Autres spécialisations...
    ];

    this.titles = [
      { id: "productivity_visionary", name: "Visionnaire de la Productivité", required: ["focus_master", "no_distraction"] }
      // Autres titres...
    ];

    this.seasons = [
      { id: 1, name: "Saison 1", start: "2025-01-01", end: "2025-03-31" },
      // Autres saisons...
    ];

    this.hallOfFame = { seasons: {}, allTime: [] };

    this.loadData();
  }

  /**
   * Charge les données de classement depuis le stockage.
   */
  loadData() {
    try {
      chrome.storage.sync.get('rankingData', (data) => {
        if (data.rankingData) {
          this.hallOfFame = data.rankingData.hallOfFame || this.hallOfFame;
        }
      });
    } catch (error) {
      console.error("Erreur lors du chargement des données de classement :", error);
    }
  }

  /**
   * Sauvegarde les données de classement dans le stockage.
   */
  saveData() {
    try {
      chrome.storage.sync.set({
        rankingData: { hallOfFame: this.hallOfFame }
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données de classement :", error);
    }
  }

  /**
   * Obtient le niveau actuel en fonction de l'XP.
   * @param {number} xp - Points d'expérience actuels.
   * @returns {object} Niveau actuel.
   */
  getCurrentLevel(xp) {
    return this.levels.find(level => xp >= level.minXP && xp < level.maxXP) || this.levels[0];
  }

  /**
   * Génère un profil de classement complet.
   * @param {object} stats - Statistiques d'utilisation.
   * @param {string} playerName - Nom du joueur.
   * @returns {object} Profil de classement.
   */
  generateRankingProfile(stats, playerName = "Utilisateur") {
    const xp = stats.gamification?.xp || 0;
    const level = this.getCurrentLevel(xp);
    const productivityScore = stats.analytics?.productivityScore || 0;
    const productivityRank = this.getProductivityRank(productivityScore);

    const specializations = this.evaluateSpecializations(stats);
    const currentSeason = this.getCurrentSeason();
    const seasonalReward = this.checkSeasonalReward(productivityScore, currentSeason);

    return {
      playerName,
      level,
      productivityScore,
      productivityRank,
      specializations,
      currentSeason,
      seasonalReward,
      hallOfFame: this.hallOfFame
    };
  }
}

// Création d'une instance globale.
window.ranking = window.ranking || new AutoFocusRanking();