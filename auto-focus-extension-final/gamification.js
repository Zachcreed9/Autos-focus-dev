/**
 * Module de gamification pour Auto-Focus
 * Ajoute des éléments ludiques pour encourager l'utilisateur à rester productif.
 * Optimisations : modularisation, gestion des erreurs, et structure améliorée.
 */

// Système de niveaux
const LEVELS = [
  { level: 1, name: "Débutant", minXP: 0, maxXP: 100, badge: "🔰" },
  { level: 2, name: "Concentré", minXP: 100, maxXP: 250, badge: "⚡" },
  { level: 3, name: "Discipliné", minXP: 250, maxXP: 500, badge: "🏆" },
  { level: 4, name: "Expert", minXP: 500, maxXP: 1000, badge: "🥇" },
  { level: 5, name: "Maître", minXP: 1000, maxXP: 2000, badge: "🏅" },
  { level: 6, name: "Légende", minXP: 2000, maxXP: 4000, badge: "👑" },
  { level: 7, name: "Superhéros", minXP: 4000, maxXP: 7000, badge: "🦸" },
  { level: 8, name: "Transcendant", minXP: 7000, maxXP: 10000, badge: "✨" },
  { level: 9, name: "Ascendant", minXP: 10000, maxXP: 15000, badge: "🌟" },
  { level: 10, name: "Zénith", minXP: 15000, maxXP: Infinity, badge: "💫" }
];

// Système de badges/réalisations
const ACHIEVEMENTS = [
  { id: "first_block", name: "Premier blocage", description: "Bloquer un site pour la première fois", xp: 10, icon: "🚫" },
  { id: "first_session", name: "Première session", description: "Compléter une session Pomodoro", xp: 20, icon: "⏱️" },
  { id: "rule_master", name: "Maître des règles", description: "Créer 3 règles d'automatisation", xp: 50, icon: "📜" },
  { id: "block_10", name: "Gardien du focus", description: "Bloquer 10 tentatives d'accès à des sites distrayants", xp: 30, icon: "🛡️" },
  { id: "block_50", name: "Mur d'acier", description: "Bloquer 50 tentatives d'accès à des sites distrayants", xp: 100, icon: "🔒" },
  { id: "block_100", name: "Forteresse", description: "Bloquer 100 tentatives d'accès à des sites distrayants", xp: 200, icon: "🏰" },
  { id: "session_5", name: "Marathonien débutant", description: "Compléter 5 sessions Pomodoro", xp: 50, icon: "🏃" },
  { id: "session_25", name: "Marathonien confirmé", description: "Compléter 25 sessions Pomodoro", xp: 150, icon: "🏃‍♀️" },
  { id: "session_100", name: "Marathonien d'élite", description: "Compléter 100 sessions Pomodoro", xp: 300, icon: "🏁" },
  { id: "streak_3", name: "Sur la bonne voie", description: "Utiliser Auto-Focus 3 jours de suite", xp: 30, icon: "📆" },
  { id: "streak_7", name: "Régularité", description: "Utiliser Auto-Focus 7 jours de suite", xp: 70, icon: "🗓️" },
  { id: "streak_30", name: "Habitude", description: "Utiliser Auto-Focus 30 jours de suite", xp: 300, icon: "⚙️" },
  { id: "custom_theme", name: "Personnalisation", description: "Personnaliser le thème de l'extension", xp: 20, icon: "🎨" },
  { id: "share_stats", name: "Partage social", description: "Partager vos statistiques", xp: 15, icon: "📊" },
  { id: "night_focus", name: "Hibou", description: "Utiliser Auto-Focus après minuit", xp: 25, icon: "🦉" },
  { id: "weekend_focus", name: "Motivation du week-end", description: "Utiliser Auto-Focus le week-end", xp: 30, icon: "🏠" }
];

/**
 * Initialise le système de gamification.
 */
function initGamification() {
  chrome.storage.sync.get(['gamification'], function(data) {
    const gamification = data.gamification || createDefaultGamificationData();
    const today = new Date();

    updateLoginStreak(gamification, today);
    resetChallengesIfNeeded(gamification, today);

    chrome.storage.sync.set({ gamification });
  });
}

/**
 * Crée les données par défaut pour la gamification.
 * @returns {object} Données initiales de gamification.
 */
function createDefaultGamificationData() {
  return {
    xp: 0,
    achievements: [],
    lastLogin: null,
    streak: 0,
    challenges: {
      daily: generateDailyChallenges(),
      weekly: generateWeeklyChallenges(),
      lastDailyReset: new Date().toISOString(),
      lastWeeklyReset: getStartOfWeek().toISOString()
    }
  };
}

/**
 * Met à jour la série de connexions.
 * @param {object} gamification - Données de gamification.
 * @param {Date} today - Date actuelle.
 */
function updateLoginStreak(gamification, today) {
  const lastLogin = gamification.lastLogin ? new Date(gamification.lastLogin) : null;

  if (!lastLogin) {
    gamification.streak = 1;
  } else {
    const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      gamification.streak += 1;
      checkStreakAchievements(gamification);
    } else if (diffDays > 1) {
      gamification.streak = 1; // Série interrompue.
    }
  }

  gamification.lastLogin = today.toISOString();
}

/**
 * Vérifie si les défis doivent être réinitialisés.
 * @param {object} gamification - Données de gamification.
 * @param {Date} today - Date actuelle.
 */
function resetChallengesIfNeeded(gamification, today) {
  const lastDailyReset = new Date(gamification.challenges.lastDailyReset);
  const lastWeeklyReset = new Date(gamification.challenges.lastWeeklyReset);

  if (isNewDay(today, lastDailyReset)) {
    gamification.challenges.daily = generateDailyChallenges();
    gamification.challenges.lastDailyReset = today.toISOString();
  }

  if (isNewWeek(today, lastWeeklyReset)) {
    gamification.challenges.weekly = generateWeeklyChallenges();
    gamification.challenges.lastWeeklyReset = getStartOfWeek().toISOString();
  }
}

/**
 * Génère des défis quotidiens aléatoires.
 * @returns {Array} Défis quotidiens.
 */
function generateDailyChallenges() {
  return getRandomChallenges("daily", 2);
}

/**
 * Génère des défis hebdomadaires aléatoires.
 * @returns {Array} Défis hebdomadaires.
 */
function generateWeeklyChallenges() {
  return getRandomChallenges("weekly", 2);
}

/**
 * Sélectionne des défis aléatoires d'un type donné.
 * @param {string} type - Type de défi ("daily" ou "weekly").
 * @param {number} count - Nombre de défis à sélectionner.
 * @returns {Array} Défis sélectionnés.
 */
function getRandomChallenges(type, count) {
  return shuffleArray(CHALLENGES.filter(c => c.type === type))
    .slice(0, count)
    .map(challenge => ({
      ...challenge,
      progress: 0,
      completed: false
    }));
}

/**
 * Vérifie si c'est un nouveau jour.
 * @param {Date} date1 - Date actuelle.
 * @param {Date} date2 - Dernière date.
 * @returns {boolean} Vrai si c'est un nouveau jour.
 */
function isNewDay(date1, date2) {
  return (
    date1.getDate() !== date2.getDate() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getFullYear() !== date2.getFullYear()
  );
}

/**
 * Vérifie si c'est une nouvelle semaine.
 * @param {Date} date1 - Date actuelle.
 * @param {Date} date2 - Dernière date.
 * @returns {boolean} Vrai si c'est une nouvelle semaine.
 */
function isNewWeek(date1, date2) {
  const week1 = getWeekNumber(date1);
  const week2 = getWeekNumber(date2);

  return week1.week !== week2.week || week1.year !== week2.year;
}

/**
 * Obtient le numéro de la semaine pour une date donnée.
 * @param {Date} date - Date.
 * @returns {object} Année et numéro de semaine.
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    year: d.getUTCFullYear(),
    week: Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  };
}

/**
 * Obtient le premier jour de la semaine actuelle.
 * @returns {Date} Premier jour de la semaine.
 */
function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}

/**
 * Mélange un tableau (algorithme de Fisher-Yates).
 * @param {Array} array - Tableau à mélanger.
 * @returns {Array} Tableau mélangé.
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Initialiser le système de gamification lorsque le document est prêt.
document.addEventListener('DOMContentLoaded', initGamification);