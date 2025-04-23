/**
 * Module de badges et récompenses pour Auto-Focus
 * Système avancé de badges, trophées et récompenses pour accroître la motivation
 */

class AutoFocusBadges {
  constructor() {
    // Définition des badges
    this.badges = [
      // Badges de concentration
      { 
        id: "focus_starter", 
        name: "Premier pas", 
        description: "Complétez votre première session de concentration", 
        category: "focus",
        icon: "🏁", 
        condition: (stats) => this.getTotalSessions(stats) >= 1
      },
      { 
        id: "focus_regular", 
        name: "Concentration régulière", 
        description: "Complétez 10 sessions de concentration", 
        category: "focus",
        icon: "⏱️", 
        condition: (stats) => this.getTotalSessions(stats) >= 10
      },
      { 
        id: "focus_expert", 
        name: "Expert en concentration", 
        description: "Complétez 50 sessions de concentration", 
        category: "focus",
        icon: "⏳", 
        condition: (stats) => this.getTotalSessions(stats) >= 50
      },
      { 
        id: "focus_master", 
        name: "Maître de la concentration", 
        description: "Complétez 100 sessions de concentration", 
        category: "focus",
        icon: "🧠", 
        condition: (stats) => this.getTotalSessions(stats) >= 100
      },
      { 
        id: "focus_legend", 
        name: "Légende de la concentration", 
        description: "Complétez 500 sessions de concentration", 
        category: "focus",
        icon: "🏆", 
        condition: (stats) => this.getTotalSessions(stats) >= 500
      },
      
      // Badges de temps de concentration
      { 
        id: "time_hour", 
        name: "Une heure de concentration", 
        description: "Accumulez 1 heure de temps de concentration", 
        category: "time",
        icon: "🕐", 
        condition: (stats) => (stats.totalFocusTime || 0) >= 60
      },
      { 
        id: "time_day", 
        name: "Un jour de concentration", 
        description: "Accumulez 24 heures de temps de concentration", 
        category: "time",
        icon: "📅", 
        condition: (stats) => (stats.totalFocusTime || 0) >= 1440
      },
      { 
        id: "time_week", 
        name: "Une semaine de concentration", 
        description: "Accumulez 7 jours de temps de concentration", 
        category: "time",
        icon: "📆", 
        condition: (stats) => (stats.totalFocusTime || 0) >= 10080
      },
      { 
        id: "time_month", 
        name: "Un mois de concentration", 
        description: "Accumulez 30 jours de temps de concentration", 
        category: "time",
        icon: "🗓️", 
        condition: (stats) => (stats.totalFocusTime || 0) >= 43200
      },
      
      // Badges de série
      { 
        id: "streak_3", 
        name: "Trio gagnant", 
        description: "Maintenez une série de 3 jours consécutifs", 
        category: "streak",
        icon: "🔥", 
        condition: (stats) => (stats.gamification?.streak || 0) >= 3
      },
      { 
        id: "streak_7", 
        name: "Semaine parfaite", 
        description: "Maintenez une série de 7 jours consécutifs", 
        category: "streak",
        icon: "🔥🔥", 
        condition: (stats) => (stats.gamification?.streak || 0) >= 7
      },
      { 
        id: "streak_14", 
        name: "Deux semaines de feu", 
        description: "Maintenez une série de 14 jours consécutifs", 
        category: "streak",
        icon: "🔥🔥🔥", 
        condition: (stats) => (stats.gamification?.streak || 0) >= 14
      },
      { 
        id: "streak_30", 
        name: "Mois infernal", 
        description: "Maintenez une série de 30 jours consécutifs", 
        category: "streak",
        icon: "🔥💯", 
        condition: (stats) => (stats.gamification?.streak || 0) >= 30
      },
      { 
        id: "streak_100", 
        name: "Centenaire de feu", 
        description: "Maintenez une série de 100 jours consécutifs", 
        category: "streak",
        icon: "🔥💯🏆", 
        condition: (stats) => (stats.gamification?.streak || 0) >= 100
      },
      
      // Badges de blocage
      { 
        id: "block_first", 
        name: "Premier barrage", 
        description: "Bloquez votre premier site distrayant", 
        category: "block",
        icon: "🛑", 
        condition: (stats) => this.getBlockedSitesCount(stats) >= 1
      },
      { 
        id: "block_5", 
        name: "Gardien de la concentration", 
        description: "Bloquez 5 sites distrayants", 
        category: "block",
        icon: "🚫", 
        condition: (stats) => this.getBlockedSitesCount(stats) >= 5
      },
      { 
        id: "block_10", 
        name: "Maître du blocage", 
        description: "Bloquez 10 sites distrayants", 
        category: "block",
        icon: "⛔", 
        condition: (stats) => this.getBlockedSitesCount(stats) >= 10
      },
      { 
        id: "block_strong", 
        name: "Volonté de fer", 
        description: "Bloquez 100 tentatives de distraction en une journée", 
        category: "block",
        icon: "🔒", 
        condition: (stats) => this.getMaxDailyBlockedCount(stats) >= 100
      },
      
      // Badges de productivité
      { 
        id: "productivity_bronze", 
        name: "Productivité Bronze", 
        description: "Atteignez un score de productivité de 40", 
        category: "productivity",
        icon: "🥉", 
        condition: (stats) => (stats.analytics?.productivityScore || 0) >= 40
      },
      { 
        id: "productivity_silver", 
        name: "Productivité Argent", 
        description: "Atteignez un score de productivité de 65", 
        category: "productivity",
        icon: "🥈", 
        condition: (stats) => (stats.analytics?.productivityScore || 0) >= 65
      },
      { 
        id: "productivity_gold", 
        name: "Productivité Or", 
        description: "Atteignez un score de productivité de 85", 
        category: "productivity",
        icon: "🥇", 
        condition: (stats) => (stats.analytics?.productivityScore || 0) >= 85
      },
      { 
        id: "productivity_diamond", 
        name: "Productivité Diamant", 
        description: "Atteignez un score de productivité de 95", 
        category: "productivity",
        icon: "💎", 
        condition: (stats) => (stats.analytics?.productivityScore || 0) >= 95
      },
      
      // Badges de personnalisation
      { 
        id: "custom_theme", 
        name: "Styliste", 
        description: "Changez le thème de l'extension", 
        category: "customization",
        icon: "🎨", 
        condition: (stats) => stats.customizations?.themeChanged || false
      },
      { 
        id: "custom_rules", 
        name: "Architecte", 
        description: "Créez 3 règles d'automatisation personnalisées", 
        category: "customization",
        icon: "📐", 
        condition: (stats) => (stats.customizations?.rules?.length || 0) >= 3
      },
      { 
        id: "custom_focus", 
        name: "Ergonome", 
        description: "Personnalisez vos paramètres de focus", 
        category: "customization",
        icon: "⚙️", 
        condition: (stats) => stats.customizations?.focusCustomized || false
      },
      
      // Badges de défis
      { 
        id: "challenge_daily", 
        name: "Défiant quotidien", 
        description: "Complétez 5 défis quotidiens", 
        category: "challenge",
        icon: "📋", 
        condition: (stats) => (stats.challenges?.dailyCompleted || 0) >= 5
      },
      { 
        id: "challenge_weekly", 
        name: "Défiant hebdomadaire", 
        description: "Complétez 3 défis hebdomadaires", 
        category: "challenge",
        icon: "📊", 
        condition: (stats) => (stats.challenges?.weeklyCompleted || 0) >= 3
      },
      { 
        id: "challenge_streak", 
        name: "Enchaînement de défis", 
        description: "Complétez des défis pendant 7 jours consécutifs", 
        category: "challenge",
        icon: "🔄", 
        condition: (stats) => (stats.challenges?.streak || 0) >= 7
      },
      
      // Badges horaires
      { 
        id: "early_bird", 
        name: "Lève-tôt", 
        description: "Complétez 5 sessions de concentration avant 9h", 
        category: "time_of_day",
        icon: "🌅", 
        condition: (stats) => this.getMorningSessionsCount(stats, 9) >= 5
      },
      { 
        id: "night_owl", 
        name: "Oiseau de nuit", 
        description: "Complétez 5 sessions de concentration après 20h", 
        category: "time_of_day",
        icon: "🦉", 
        condition: (stats) => this.getEveningSessionsCount(stats, 20) >= 5
      },
      { 
        id: "weekend_warrior", 
        name: "Guerrier du weekend", 
        description: "Complétez 5 sessions de concentration pendant le weekend", 
        category: "time_of_day",
        icon: "🏋️", 
        condition: (stats) => this.getWeekendSessionsCount(stats) >= 5
      },
      
      // Badges spéciaux
      { 
        id: "perfectionist", 
        name: "Perfectionniste", 
        description: "Maintenez un score de productivité de 90+ pendant 7 jours consécutifs", 
        category: "special",
        icon: "💯", 
        condition: (stats) => this.getConsecutiveHighProductivityDays(stats, 90) >= 7
      },
      { 
        id: "comeback", 
        name: "Le Retour", 
        description: "Revenez après une pause de 7 jours et maintenez l'activité pendant 3 jours", 
        category: "special",
        icon: "🔄", 
        condition: (stats) => this.detectComeback(stats)
      },
      { 
        id: "explorer", 
        name: "Explorateur", 
        description: "Utilisez toutes les fonctionnalités principales de l'extension", 
        category: "special",
        icon: "🧭", 
        condition: (stats) => this.hasUsedAllFeatures(stats)
      },
      { 
        id: "share", 
        name: "Ambassadeur", 
        description: "Partagez vos statistiques avec d'autres personnes", 
        category: "special",
        icon: "🌐", 
        condition: (stats) => stats.sharing?.count > 0
      }
    ];
    
    // Définition des trophées (réalisations majeures)
    this.trophies = [
      { 
        id: "iron_will", 
        name: "Volonté de Fer", 
        description: "Maintenez un score de productivité de 90+ pendant 30 jours consécutifs", 
        icon: "🏆", 
        rarity: "rare",
        condition: (stats) => this.getConsecutiveHighProductivityDays(stats, 90) >= 30
      },
      { 
        id: "time_lord", 
        name: "Seigneur du Temps", 
        description: "Accumulez 100 jours de temps de concentration total", 
        icon: "⏳", 
        rarity: "epic",
        condition: (stats) => (stats.totalFocusTime || 0) >= 144000
      },
      { 
        id: "distractionless", 
        name: "Sans Distraction", 
        description: "Passez 7 jours consécutifs sans aucune tentative de distraction", 
        icon: "🛡️", 
        rarity: "rare",
        condition: (stats) => this.getConsecutiveDistractionFreeDays(stats) >= 7
      },
      { 
        id: "challenge_master", 
        name: "Maître des Défis", 
        description: "Complétez 50 défis au total", 
        icon: "🏅", 
        rarity: "uncommon",
        condition: (stats) => (stats.challenges?.dailyCompleted || 0) + (stats.challenges?.weeklyCompleted || 0) >= 50
      },
      { 
        id: "focus_grandmaster", 
        name: "Grand Maître de la Concentration", 
        description: "Complétez 1000 sessions de concentration", 
        icon: "👑", 
        rarity: "legendary",
        condition: (stats) => this.getTotalSessions(stats) >= 1000
      },
      { 
        id: "year_streak", 
        name: "Année de Feu", 
        description: "Maintenez une série de 365 jours consécutifs", 
        icon: "🔥👑", 
        rarity: "legendary",
        condition: (stats) => (stats.gamification?.streak || 0) >= 365
      },
      { 
        id: "all_badges", 
        name: "Collectionneur", 
        description: "Obtenez tous les badges standards", 
        icon: "🎖️", 
        rarity: "epic",
        condition: (stats) => this.getAllBadgesCount(stats) >= 30 // Nombre total de badges standards
      }
    ];
    
    // Récompenses exclusives débloquées par les trophées
    this.exclusiveRewards = [
      {
        id: "custom_badge_creator",
        name: "Créateur de Badges",
        description: "Créez votre propre badge personnalisé",
        trophydId: "all_badges",
        type: "feature"
      },
      {
        id: "ultra_theme",
        name: "Thème Ultra",
        description: "Un thème entièrement personnalisable avec des effets visuels uniques",
        trophydId: "year_streak",
        type: "theme"
      },
      {
        id: "ai_prioritization",
        name: "Priorisation IA Avancée",
        description: "Un système d'IA qui vous aide à prioriser vos tâches les plus importantes",
        trophydId: "time_lord",
        type: "feature"
      },
      {
        id: "vip_stats",
        name: "Statistiques VIP",
        description: "Des statistiques et analyses de productivité ultra-détaillées",
        trophydId: "focus_grandmaster",
        type: "feature"
      },
      {
        id: "time_projections",
        name: "Projections Temporelles",
        description: "Un outil de projection qui vous montre votre progression future basée sur vos habitudes",
        trophydId: "iron_will",
        type: "feature"
      }
    ];
    
    this.earnedBadges = [];
    this.earnedTrophies = [];
    
    this.loadData();
  }
  
  /**
   * Charge les données de badges depuis le stockage
   */
  loadData() {
    chrome.storage.sync.get('badgesData', (data) => {
      if (data.badgesData) {
        this.earnedBadges = data.badgesData.earnedBadges || [];
        this.earnedTrophies = data.badgesData.earnedTrophies || [];
      }
    });
  }
  
  /**
   * Sauvegarde les données de badges dans le stockage
   */
  saveData() {
    chrome.storage.sync.set({
      badgesData: {
        earnedBadges: this.earnedBadges,
        earnedTrophies: this.earnedTrophies
      }
    });
  }
  
  /**
   * Vérifie tous les badges et trophées et attribue ceux qui sont mérités
   * @param {object} stats - Statistiques d'utilisation
   * @returns {object} Nouveaux badges et trophées obtenus
   */
  checkBadgesAndTrophies(stats) {
    const newBadges = [];
    const newTrophies = [];
    
    // Vérifier chaque badge
    this.badges.forEach(badge => {
      // Si le badge n'a pas encore été obtenu et la condition est remplie
      if (!this.hasBadge(badge.id) && badge.condition(stats)) {
        this.earnedBadges.push({
          id: badge.id,
          date: new Date().toISOString()
        });
        
        newBadges.push(badge);
      }
    });
    
    // Vérifier chaque trophée
    this.trophies.forEach(trophy => {
      // Si le trophée n'a pas encore été obtenu et la condition est remplie
      if (!this.hasTrophy(trophy.id) && trophy.condition(stats)) {
        this.earnedTrophies.push({
          id: trophy.id,
          date: new Date().toISOString()
        });
        
        newTrophies.push(trophy);
      }
    });
    
    // Sauvegarder les données si de nouveaux badges ou trophées ont été obtenus
    if (newBadges.length > 0 || newTrophies.length > 0) {
      this.saveData();
    }
    
    return { newBadges, newTrophies };
  }
  
  /**
   * Vérifie si un badge a déjà été obtenu
   * @param {string} badgeId - Identifiant du badge
   * @returns {boolean} Vrai si le badge a été obtenu
   */
  hasBadge(badgeId) {
    return this.earnedBadges.some(badge => badge.id === badgeId);
  }
  
  /**
   * Vérifie si un trophée a déjà été obtenu
   * @param {string} trophyId - Identifiant du trophée
   * @returns {boolean} Vrai si le trophée a été obtenu
   */
  hasTrophy(trophyId) {
    return this.earnedTrophies.some(trophy => trophy.id === trophyId);
  }
  
  /**
   * Obtient le nombre total de sessions de concentration
   * @param {object} stats - Statistiques d'utilisation
   * @returns {number} Nombre total de sessions
   */
  getTotalSessions(stats) {
    return stats.focusSessions?.length || 0;
  }
  
  /**
   * Obtient le nombre de sites bloqués
   * @param {object} stats - Statistiques d'utilisation
   * @returns {number} Nombre de sites bloqués
   */
  getBlockedSitesCount(stats) {
    if (!stats.blockedSites) return 0;
    return Array.isArray(stats.blockedSites) ? stats.blockedSites.length : Object.keys(stats.blockedSites).length;
  }
  
  /**
   * Obtient le nombre maximum de blocages en une journée
   * @param {object} stats - Statistiques d'utilisation
   * @returns {number} Nombre maximum de blocages en une journée
   */
  getMaxDailyBlockedCount(stats) {
    const dailyStats = stats.daily || {};
    
    return Object.values(dailyStats).reduce((max, day) => {
      const dayCount = day.blockedCount || 0;
      return dayCount > max ? dayCount : max;
    }, 0);
  }
  
  /**
   * Obtient le nombre de sessions de concentration avant une heure donnée
   * @param {object} stats - Statistiques d'utilisation
   * @param {number} hour - Heure limite (0-23)
   * @returns {number} Nombre de sessions matinales
   */
  getMorningSessionsCount(stats, hour) {
    const focusSessions = stats.focusSessions || [];
    
    return focusSessions.filter(session => {
      if (!session.startTime) return false;
      
      const sessionHour = new Date(session.startTime).getHours();
      return sessionHour < hour;
    }).length;
  }
  
  /**
   * Obtient le nombre de sessions de concentration après une heure donnée
   * @param {object} stats - Statistiques d'utilisation
   * @param {number} hour - Heure limite (0-23)
   * @returns {number} Nombre de sessions en soirée
   */
  getEveningSessionsCount(stats, hour) {
    const focusSessions = stats.focusSessions || [];
    
    return focusSessions.filter(session => {
      if (!session.startTime) return false;
      
      const sessionHour = new Date(session.startTime).getHours();
      return sessionHour >= hour;
    }).length;
  }
  
  /**
   * Obtient le nombre de sessions de concentration pendant le weekend
   * @param {object} stats - Statistiques d'utilisation
   * @returns {number} Nombre de sessions le weekend
   */
  getWeekendSessionsCount(stats) {
    const focusSessions = stats.focusSessions || [];
    
    return focusSessions.filter(session => {
      if (!session.startTime) return false;
      
      const day = new Date(session.startTime).getDay();
      return day === 0 || day === 6; // 0 = Dimanche, 6 = Samedi
    }).length;
  }
  
  /**
   * Compte le nombre de jours consécutifs avec un score de productivité élevé
   * @param {object} stats - Statistiques d'utilisation
   * @param {number} threshold - Seuil de score de productivité
   * @returns {number} Nombre de jours consécutifs
   */
  getConsecutiveHighProductivityDays(stats, threshold) {
    const dailyStats = stats.daily || {};
    const sortedDays = Object.keys(dailyStats).sort();
    
    let maxStreak = 0;
    let currentStreak = 0;
    let previousDate = null;
    
    for (const dateStr of sortedDays) {
      const date = new Date(dateStr);
      const score = dailyStats[dateStr].productivityScore || 0;
      
      // Vérifier si le score est supérieur au seuil
      if (score >= threshold) {
        // Vérifier si la date est consécutive à la précédente
        if (previousDate !== null) {
          const timeDiff = date.getTime() - previousDate.getTime();
          const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
          
          if (dayDiff === 1) {
            // Jour consécutif, incrémenter la série actuelle
            currentStreak++;
          } else {
            // Non consécutif, réinitialiser la série
            currentStreak = 1;
          }
        } else {
          // Premier jour avec un score élevé
          currentStreak = 1;
        }
        
        previousDate = date;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        // Score trop bas, réinitialiser la série
        currentStreak = 0;
        previousDate = null;
      }
    }
    
    return maxStreak;
  }
  
  /**
   * Compte le nombre de jours consécutifs sans tentative de distraction
   * @param {object} stats - Statistiques d'utilisation
   * @returns {number} Nombre de jours consécutifs
   */
  getConsecutiveDistractionFreeDays(stats) {
    const dailyStats = stats.daily || {};
    const sortedDays = Object.keys(dailyStats).sort();
    
    let maxStreak = 0;
    let currentStreak = 0;
    let previousDate = null;
    
    for (const dateStr of sortedDays) {
      const date = new Date(dateStr);
      const distractions = dailyStats[dateStr].blockedCount || 0;
      
      // Vérifier s'il n'y a pas eu de tentative de distraction
      if (distractions === 0) {
        // Vérifier si la date est consécutive à la précédente
        if (previousDate !== null) {
          const timeDiff = date.getTime() - previousDate.getTime();
          const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
          
          if (dayDiff === 1) {
            // Jour consécutif, incrémenter la série actuelle
            currentStreak++;
          } else {
            // Non consécutif, réinitialiser la série
            currentStreak = 1;
          }
        } else {
          // Premier jour sans distraction
          currentStreak = 1;
        }
        
        previousDate = date;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        // Distractions détectées, réinitialiser la série
        currentStreak = 0;
        previousDate = null;
      }
    }
    
    return maxStreak;
  }
  
  /**
   * Détecte si l'utilisateur a fait un retour après une pause
   * @param {object} stats - Statistiques d'utilisation
   * @returns {boolean} Vrai si un retour est détecté
   */
  detectComeback(stats) {
    const dailyStats = stats.daily || {};
    const days = Object.keys(dailyStats).sort();
    
    if (days.length < 10) return false;
    
    let inactivityDetected = false;
    let comebackDetected = false;
    let inactivityStart = null;
    
    for (let i = 1; i < days.length; i++) {
      const currentDay = new Date(days[i]);
      const previousDay = new Date(days[i-1]);
      
      // Calculer la différence en jours
      const timeDiff = currentDay.getTime() - previousDay.getTime();
      const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff > 7 && !inactivityDetected) {
        // Pause de plus de 7 jours détectée
        inactivityDetected = true;
        inactivityStart = days[i];
      }
      
      if (inactivityDetected && days[i] >= inactivityStart) {
        // Vérifier s'il y a au moins 3 jours d'activité consécutive après la pause
        const activeConsecutiveDays = this.getConsecutiveDaysFromDate(stats, days[i]);
        
        if (activeConsecutiveDays >= 3) {
          comebackDetected = true;
          break;
        }
      }
    }
    
    return comebackDetected;
  }
  
  /**
   * Compte le nombre de jours consécutifs à partir d'une date
   * @param {object} stats - Statistiques d'utilisation
   * @param {string} startDate - Date de départ (format YYYY-MM-DD)
   * @returns {number} Nombre de jours consécutifs
   */
  getConsecutiveDaysFromDate(stats, startDate) {
    const dailyStats = stats.daily || {};
    const days = Object.keys(dailyStats).sort();
    
    const startIndex = days.indexOf(startDate);
    if (startIndex === -1) return 0;
    
    let consecutiveDays = 1; // Le jour de départ compte
    let currentDate = new Date(startDate);
    
    for (let i = startIndex + 1; i < days.length; i++) {
      const nextDate = new Date(days[i]);
      const timeDiff = nextDate.getTime() - currentDate.getTime();
      const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff === 1) {
        consecutiveDays++;
        currentDate = nextDate;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  }
  
  /**
   * Vérifie si l'utilisateur a utilisé toutes les fonctionnalités principales
   * @param {object} stats - Statistiques d'utilisation
   * @returns {boolean} Vrai si toutes les fonctionnalités ont été utilisées
   */
  hasUsedAllFeatures(stats) {
    // Liste des fonctionnalités principales
    const features = [
      stats.focusSessions?.length > 0, // Sessions de concentration
      stats.customizations?.themeChanged || false, // Changement de thème
      this.getBlockedSitesCount(stats) > 0, // Blocage de sites
      stats.pomodoroUsed || false, // Utilisation du Pomodoro
      stats.customizations?.rules?.length > 0, // Création de règles
      stats.whitelistUsed || false, // Utilisation de la liste blanche
      stats.statsViewed || false // Consultation des statistiques
    ];
    
    // Vérifier si toutes les fonctionnalités ont été utilisées
    return features.every(used => used === true);
  }
  
  /**
   * Compte le nombre total de badges obtenus
   * @param {object} stats - Statistiques d'utilisation
   * @returns {number} Nombre total de badges obtenus
   */
  getAllBadgesCount(stats) {
    return this.earnedBadges.length;
  }
  
  /**
   * Obtient les récompenses débloquées par les trophées
   * @returns {array} Liste des récompenses débloquées
   */
  getUnlockedRewards() {
    const unlockedRewards = [];
    
    this.exclusiveRewards.forEach(reward => {
      if (this.hasTrophy(reward.trophydId)) {
        unlockedRewards.push(reward);
      }
    });
    
    return unlockedRewards;
  }
  
  /**
   * Génère un rapport complet des badges et trophées
   * @returns {object} Rapport complet
   */
  generateReport() {
    const earnedBadgeDetails = this.earnedBadges.map(earned => {
      const badge = this.badges.find(b => b.id === earned.id);
      return {
        ...badge,
        date: earned.date
      };
    });
    
    const earnedTrophyDetails = this.earnedTrophies.map(earned => {
      const trophy = this.trophies.find(t => t.id === earned.id);
      return {
        ...trophy,
        date: earned.date
      };
    });
    
    // Trier par catégorie
    const badgesByCategory = {};
    earnedBadgeDetails.forEach(badge => {
      if (!badgesByCategory[badge.category]) {
        badgesByCategory[badge.category] = [];
      }
      badgesByCategory[badge.category].push(badge);
    });
    
    // Trier par date d'obtention
    Object.keys(badgesByCategory).forEach(category => {
      badgesByCategory[category].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    // Trier les trophées par rareté
    const rarityOrder = { legendary: 1, epic: 2, rare: 3, uncommon: 4 };
    earnedTrophyDetails.sort((a, b) => {
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
    
    const unlockedRewards = this.getUnlockedRewards();
    
    return {
      totalEarnedBadges: this.earnedBadges.length,
      totalEarnedTrophies: this.earnedTrophies.length,
      badgesByCategory,
      trophies: earnedTrophyDetails,
      unlockedRewards,
      progress: {
        badgesProgress: `${this.earnedBadges.length}/${this.badges.length}`,
        trophiesProgress: `${this.earnedTrophies.length}/${this.trophies.length}`,
        rewardsProgress: `${unlockedRewards.length}/${this.exclusiveRewards.length}`
      }
    };
  }
}

// Création d'une instance globale de badges
window.badges = window.badges || new AutoFocusBadges();