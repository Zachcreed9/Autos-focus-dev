document.addEventListener('DOMContentLoaded', function () {
  console.log('Popup chargé');
  document.body.setAttribute('data-theme', 'blue'); // Thème par défaut
  initTabs();
  loadData();
  initCharts();
  setupEventListeners();
  loadRandomQuote();

  setTimeout(() => {
    showNotification('Auto-Focus est prêt à vous aider à rester concentré!', 'info');
  }, 500);
});

// Initialisation des onglets
function initTabs() {
  document.querySelectorAll('.tab-nav').forEach((nav) => {
    nav.addEventListener('click', () => {
      document.querySelectorAll('.tab-nav, .tab-content').forEach((el) =>
        el.classList.remove('active')
      );
      nav.classList.add('active');
      const tabContent = document.getElementById(`${nav.getAttribute('data-tab')}-tab`);
      if (tabContent) {
        tabContent.classList.add('active');
      } else {
        console.error(`L'onglet correspondant à ${nav.getAttribute('data-tab')} est introuvable.`);
      }
    });
  });
}

// Chargement des données depuis le stockage Chrome
function loadData() {
  chrome.storage.sync.get(null, (data) => {
    if (!data) {
      console.error('Aucune donnée trouvée dans le stockage Chrome.');
      return;
    }
    updateExtensionState(data.enabled);
    updateBlockedSitesList(data.blockedSites || []);
    updateWhitelistSitesList(data.whitelist || []);
    updateScheduleSettings(data.scheduleSettings || {});
    updateGeneralSettings(data.settings || {});
    applyTheme(data.theme || 'blue');
  });
}

// Mise à jour de l'état de l'extension
function updateExtensionState(enabled) {
  const toggle = document.getElementById('toggle-extension');
  if (toggle) {
    toggle.checked = enabled !== false;
  } else {
    console.error('Élément "toggle-extension" introuvable.');
  }
}

// Mise à jour de la liste des sites bloqués
function updateBlockedSitesList(sites = []) {
  const container = document.getElementById('blocked-sites-list');
  if (!container) {
    console.error('Élément "blocked-sites-list" introuvable.');
    return;
  }
  container.innerHTML = sites.length
    ? sites
        .map(
          (site) => `
      <div class="list-item">
        <div class="list-item-content">${site}</div>
        <div class="list-item-actions">
          <button class="icon-btn edit-site" data-site="${site}">✏️</button>
          <button class="icon-btn danger remove-site" data-site="${site}">🗑️</button>
        </div>
      </div>`
        )
        .join('')
    : `<div class="empty-state">Ajoutez des sites à bloquer pour rester concentré</div>`;

  container.querySelectorAll('.edit-site').forEach((btn) =>
    btn.addEventListener('click', () => editSite(btn.dataset.site))
  );
  container.querySelectorAll('.remove-site').forEach((btn) =>
    btn.addEventListener('click', () => removeSite(btn.dataset.site))
  );
}

// Fonction pour supprimer un site bloqué
function removeSite(site) {
  chrome.storage.sync.get('blockedSites', (data) => {
    const updatedSites = (data.blockedSites || []).filter((s) => s !== site);
    chrome.storage.sync.set({ blockedSites: updatedSites }, () => {
      console.log(`Site supprimé définitivement : ${site}`);
      loadData(); // Recharger les données après suppression
    });
  });
}

// Mise à jour de la liste blanche
function updateWhitelistSitesList(sites = []) {
  const container = document.getElementById('whitelist-sites-list');
  if (!container) {
    console.error('Élément "whitelist-sites-list" introuvable.');
    return;
  }
  container.innerHTML = sites.length
    ? sites
        .map(
          (site) => `
      <div class="list-item">
        <div class="list-item-content">${site}</div>
        <div class="list-item-actions">
          <button class="icon-btn edit-whitelist" data-site="${site}">✏️</button>
          <button class="icon-btn danger remove-whitelist" data-site="${site}">🗑️</button>
        </div>
      </div>`
        )
        .join('')
    : `<div class="empty-state">Ajoutez des sites à la liste blanche</div>`;

  container.querySelectorAll('.edit-whitelist').forEach((btn) =>
    btn.addEventListener('click', () => editWhitelistSite(btn.dataset.site))
  );
  container.querySelectorAll('.remove-whitelist').forEach((btn) =>
    btn.addEventListener('click', () => removeWhitelistSite(btn.dataset.site))
  );
}

// Fonction pour supprimer un site de la liste blanche
function removeWhitelistSite(site) {
  chrome.storage.sync.get('whitelist', (data) => {
    const updatedSites = (data.whitelist || []).filter((s) => s !== site);
    chrome.storage.sync.set({ whitelist: updatedSites }, () => {
      console.log(`Site supprimé définitivement de la liste blanche : ${site}`);
      loadData(); // Recharger les données après suppression
    });
  });
}

// Application d'un thème
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  document
    .querySelectorAll('.theme-option')
    .forEach((option) => option.classList.toggle('active', option.dataset.theme === theme));
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
  const toggle = document.getElementById('toggle-extension');
  if (toggle) {
    toggle.addEventListener('change', (e) => toggleExtensionState(e.target.checked));
  } else {
    console.error('Élément "toggle-extension" introuvable.');
  }
}

// Exemple d'une fonction simplifiée pour les notifications
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  if (!notification) {
    console.error('Élément "notification" introuvable.');
    return;
  }
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  setTimeout(() => notification.classList.remove('show'), 3000);
}

// Fonction pour activer/désactiver l'extension
function toggleExtensionState(enabled) {
  chrome.storage.sync.set({ enabled });
}

// Fonction simulée pour des graphiques ou statistiques
function initCharts() {
  console.log('Initialisation des graphiques...');
}

// Fonction simulée pour charger une citation
function loadRandomQuote() {
  console.log('Chargement d\'une citation aléatoire...');
}

// Fonctions d'édition (à implémenter)
function editSite(site) {
  console.log(`Édition du site : ${site}`);
}

function editWhitelistSite(site) {
  console.log(`Édition du site en liste blanche : ${site}`);
}