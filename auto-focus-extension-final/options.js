// options.js - Gestion complète des options et paramètres pour l'application Auto-Focus

document.addEventListener('DOMContentLoaded', function () {
  initialize();
});

// Initialisation globale
function initialize() {
  try {
    initTabs();
    loadStoredData();
    setupEventListeners();
    initializeModals();
    initCharts(); // Correction : ajout de l'initialisation des graphiques
  } catch (error) {
    console.error('Erreur lors de l\'initialisation :', error);
  }
}

// Initialisation des onglets
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((button) => button.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
}

// Chargement des données sauvegardées dans le stockage Chrome
function loadStoredData() {
  const keysToFetch = [
    'stats',
    'blockedSites',
    'whitelist',
    'scheduleSettings',
    'categorySettings',
    'settings',
    'focusSettings',
    'advancedSettings',
  ];

  chrome.storage.sync.get(keysToFetch, (data) => {
    try {
      updateDashboard(data.stats || {});
      updateAdvancedSettings(data.advancedSettings || {});
      loadAutomationRules(data.rules || []);
      updateScheduleSettings(data.scheduleSettings || {}); // Correction : ajout de l'appel à la fonction updateScheduleSettings
    } catch (err) {
      console.error('Erreur lors du chargement des données :', err);
    }
  });
}

// Mise à jour de l'interface du tableau de bord
function updateDashboard(stats = {}) {
  setElementText('total-blocked', stats.blockedCount || 0);
  setElementText('total-time', formatTime(stats.totalFocusTime || 0));
  setElementText('sessions-completed', stats.focusSessions?.length || 0);

  const productivityScore = calculateProductivityScore(stats);
  setElementText('productivity-score', `${productivityScore}%`);

  updateTopBlockedSites(stats.blockedSites || {});
  updateCharts(stats);
}

// Calcul du score de productivité
function calculateProductivityScore(stats) {
  const focusTime = stats.totalFocusTime || 0;
  const blockedCount = stats.blockedCount || 1;
  const baseScore = Math.min(Math.round((focusTime / blockedCount) * 10), 100);

  const sessionBonus = Math.min((stats.focusSessions?.length || 0) * 5, 20);
  return Math.min(baseScore + sessionBonus, 100);
}

// Mise à jour de la liste des sites les plus bloqués
function updateTopBlockedSites(blockedSites) {
  const container = document.getElementById('top-sites-list');
  container.innerHTML = '';

  if (!Object.keys(blockedSites).length) {
    container.innerHTML = '<p class="empty-state">Aucun site bloqué</p>';
    return;
  }

  const sortedSites = Object.entries(blockedSites)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxCount = sortedSites[0][1];
  sortedSites.forEach(([domain, count]) => {
    const percentage = Math.round((count / maxCount) * 100);
    const item = `
      <div class="progress-item">
        <div class="progress-label">${domain}</div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${percentage}%;"></div>
          <div class="progress-value">${count} fois</div>
        </div>
      </div>`;
    container.insertAdjacentHTML('beforeend', item);
  });
}

// Initialisation et mise à jour des graphiques
function initCharts() {
  // Correction : Initialiser les graphiques si nécessaire
  const productivityChartCtx = document.getElementById('productivity-chart')?.getContext('2d');
  const sessionsChartCtx = document.getElementById('sessions-chart')?.getContext('2d');

  if (productivityChartCtx) {
    window.productivityChart = new Chart(productivityChartCtx, {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  if (sessionsChartCtx) {
    window.sessionsChart = new Chart(sessionsChartCtx, {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}

function updateCharts(stats) {
  const productivityData = generateChartData(stats, 'productivity');
  const sessionData = generateChartData(stats.focusSessions || [], 'sessions');

  updateChart('productivity-chart', productivityData);
  updateChart('sessions-chart', sessionData);
}

function generateChartData(data, type) {
  const labels = [];
  const values = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);

    labels.push(day.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
    if (type === 'productivity') {
      const score = Math.random() * 100; // Exemple avec des données aléatoires
      values.push(score);
    } else if (type === 'sessions') {
      const sessionCount = (data[i] && data[i].length) || 0; // Exemple
      values.push(sessionCount);
    }
  }

  return { labels, values };
}

function updateChart(chartId, { labels, values }) {
  const chart = document.getElementById(chartId)?.getContext('2d');
  if (!chart) return;

  new Chart(chart, {
    type: chartId === 'productivity-chart' ? 'line' : 'bar',
    data: {
      labels,
      datasets: [
        {
          label: chartId === 'productivity-chart' ? 'Productivité' : 'Sessions',
          data: values,
          backgroundColor: chartId === 'sessions-chart' ? '#4285F4' : 'rgba(66, 133, 244, 0.2)',
          borderColor: '#4285F4',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function formatTime(minutes) {
  return minutes < 60
    ? `${minutes}m`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function setElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

function setupEventListeners() {
  document.getElementById('export-stats')?.addEventListener('click', exportStats);
  document.getElementById('reset-stats')?.addEventListener('click', resetStats);
}

function exportStats() {
  chrome.storage.sync.get('stats', (data) => {
    const jsonBlob = new Blob([JSON.stringify(data.stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'stats.json';
    anchor.click();

    URL.revokeObjectURL(url);
  });
}

function resetStats() {
  if (confirm('Confirmez-vous la réinitialisation des statistiques ?')) {
    chrome.runtime.sendMessage({ action: 'resetStats' }, () => {
      alert('Statistiques réinitialisées avec succès.');
      loadStoredData();
    });
  }
}

function initializeModals() {
  const modal = document.getElementById('rule-modal');
  document.querySelector('.close-modal')?.addEventListener('click', () => modal?.classList.remove('open'));
  document.getElementById('cancel-rule')?.addEventListener('click', () => modal?.classList.remove('open'));
}

function loadAutomationRules(rules) {
  const container = document.getElementById('rules-container');
  container.innerHTML = rules.length
    ? rules.map(createRuleHTML).join('')
    : '<p class="empty-state">Aucune règle définie</p>';
}

function createRuleHTML(rule) {
  return `
    <div class="rule-item" data-rule-id="${rule.id}">
      <div class="rule-header">
        <h4>${rule.name}</h4>
        <div class="rule-actions">
          <button class="icon-btn edit-rule">✏️</button>
          <button class="icon-btn delete-rule">🗑️</button>
        </div>
      </div>
      <div class="rule-body">
        <div><strong>Si:</strong> ${rule.conditions.map(formatCondition).join(' ET ')}</div>
        <div><strong>Alors:</strong> ${rule.actions.map(formatAction).join(', ')}</div>
      </div>
    </div>`;
}

function formatCondition(condition) {
  switch (condition.type) {
    case 'time':
      return `Heure : ${condition.start} - ${condition.end}`;
    case 'day':
      return `Jours : ${condition.days.join(', ')}`;
    default:
      return condition.type;
  }
}

function formatAction(action) {
  return action.type === 'mode' ? `Mode : ${action.mode}` : action.type;
}