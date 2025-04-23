/**
 * Module d'intégration pour Auto-Focus
 * Permet d'intégrer Auto-Focus avec d'autres outils et services.
 * Optimisations incluses : modularisation, gestion des erreurs, et compatibilité étendue.
 */

class AutoFocusIntegration {
  constructor() {
    this.integrations = {
      calendar: false,
      tasklist: false,
      pomodoro: false,
      email: false,
      notes: false
    };

    this.serviceConnections = {
      google: { connected: false, scopes: [] },
      microsoft: { connected: false, scopes: [] },
      notion: { connected: false, token: null },
      todoist: { connected: false, token: null },
      trello: { connected: false, token: null }
    };

    this.loadData();
  }

  /**
   * Charge les données d'intégration depuis le stockage.
   */
  loadData() {
    chrome.storage.sync.get(['integrations', 'serviceConnections'], (data) => {
      if (data.integrations) this.integrations = data.integrations;
      if (data.serviceConnections) this.serviceConnections = data.serviceConnections;
    });
  }

  /**
   * Sauvegarde les données d'intégration dans le stockage.
   */
  saveData() {
    chrome.storage.sync.set({
      integrations: this.integrations,
      serviceConnections: this.serviceConnections
    });
  }

  /**
   * Connecte un service externe.
   * @param {string} service - Le service à connecter (google, microsoft, notion, todoist, trello).
   * @param {object} options - Options de connexion (scopes, token, etc.).
   */
  async connectService(service, options = {}) {
    if (!this.serviceConnections[service]) {
      console.error(`Service inconnu : ${service}`);
      return false;
    }

    try {
      switch (service) {
        case 'google':
          return await this.connectGoogle(options.scopes || []);
        case 'microsoft':
          return await this.connectMicrosoft(options.scopes || []);
        case 'notion':
        case 'todoist':
        case 'trello':
          return await this.connectWithToken(service, options.token);
        default:
          console.error(`Connexion non implémentée pour le service : ${service}`);
          return false;
      }
    } catch (error) {
      console.error(`Erreur lors de la connexion au service ${service} :`, error);
      return false;
    }
  }

  /**
   * Connecte Google (Calendrier, Gmail, Tasks, etc.).
   * @param {array} scopes - Les scopes à demander.
   */
  async connectGoogle(scopes = []) {
    console.log('Connexion à Google avec les scopes :', scopes);

    // Simuler une connexion réussie.
    this.serviceConnections.google.connected = true;
    this.serviceConnections.google.scopes = scopes;
    this.saveData();

    return true;
  }

  /**
   * Connecte Microsoft (Outlook, ToDo, etc.).
   * @param {array} scopes - Les scopes à demander.
   */
  async connectMicrosoft(scopes = []) {
    console.log('Connexion à Microsoft avec les scopes :', scopes);

    // Simuler une connexion réussie.
    this.serviceConnections.microsoft.connected = true;
    this.serviceConnections.microsoft.scopes = scopes;
    this.saveData();

    return true;
  }

  /**
   * Connecte un service avec un token API.
   * @param {string} service - Le service à connecter.
   * @param {string} token - Le token API.
   */
  async connectWithToken(service, token) {
    if (!token || !this.serviceConnections[service]) {
      console.error(`Connexion impossible : token invalide ou service inconnu (${service}).`);
      return false;
    }

    // Simuler une validation du token.
    const isValid = token.length >= 10;

    if (isValid) {
      this.serviceConnections[service].connected = true;
      this.serviceConnections[service].token = token;
      this.saveData();
      return true;
    } else {
      console.error(`Token invalide pour le service : ${service}`);
      return false;
    }
  }

  /**
   * Déconnecte un service externe.
   * @param {string} service - Le service à déconnecter.
   */
  disconnectService(service) {
    if (!this.serviceConnections[service]) {
      console.error(`Service inconnu : ${service}`);
      return false;
    }

    this.serviceConnections[service].connected = false;

    if (service === 'google' || service === 'microsoft') {
      this.serviceConnections[service].scopes = [];
    } else {
      this.serviceConnections[service].token = null;
    }

    this.saveData();
    return true;
  }

  /**
   * Active ou désactive une intégration.
   * @param {string} type - Le type d'intégration (calendar, tasklist, pomodoro, email, notes).
   * @param {boolean} enabled - État d'activation.
   */
  toggleIntegration(type, enabled) {
    if (this.integrations[type] !== undefined) {
      this.integrations[type] = enabled;
      this.saveData();
      return true;
    } else {
      console.error(`Type d'intégration inconnu : ${type}`);
      return false;
    }
  }

  /**
   * Vérifie si un service est connecté.
   * @param {string} service - Le service à vérifier.
   */
  isServiceConnected(service) {
    return this.serviceConnections[service]?.connected || false;
  }

  /**
   * Récupère les événements du calendrier.
   * @param {Date} startDate - Date de début.
   * @param {Date} endDate - Date de fin.
   */
  async getCalendarEvents(startDate, endDate) {
    if (!this.integrations.calendar) return [];

    if (this.isServiceConnected('google') &&
        this.serviceConnections.google.scopes.includes('https://www.googleapis.com/auth/calendar.readonly')) {
      return await this.getGoogleCalendarEvents(startDate, endDate);
    }

    if (this.isServiceConnected('microsoft') &&
        this.serviceConnections.microsoft.scopes.includes('Calendars.Read')) {
      return await this.getMicrosoftCalendarEvents(startDate, endDate);
    }

    return [];
  }

  /**
   * Récupère les tâches de tous les services connectés.
   */
  async getTasks() {
    if (!this.integrations.tasklist) return [];

    const tasks = await Promise.all([
      this.isServiceConnected('google') ? this.getGoogleTasks() : [],
      this.isServiceConnected('microsoft') ? this.getMicrosoftTasks() : [],
      this.isServiceConnected('todoist') ? this.getTodoistTasks() : [],
      this.isServiceConnected('trello') ? this.getTrelloTasks() : []
    ]);

    return tasks.flat();
  }

  /**
   * Récupère les e-mails importants.
   * @param {number} limit - Nombre maximum d'e-mails à récupérer.
   */
  async getImportantEmails(limit = 5) {
    if (!this.integrations.email) return [];

    if (this.isServiceConnected('google') &&
        this.serviceConnections.google.scopes.includes('https://www.googleapis.com/auth/gmail.readonly')) {
      return await this.getGmailEmails(limit);
    }

    if (this.isServiceConnected('microsoft') &&
        this.serviceConnections.microsoft.scopes.includes('Mail.Read')) {
      return await this.getOutlookEmails(limit);
    }

    return [];
  }

  /**
   * Crée un tableau de bord intégré avec les données des services connectés.
   */
  async createIntegratedDashboard() {
    try {
      const dashboard = {
        calendar: await this.getCalendarEvents(new Date(), new Date(new Date().setDate(new Date().getDate() + 7))),
        tasks: await this.getTasks(),
        emails: await this.getImportantEmails(3),
        notes: await this.getNotes(3),
        connectedServices: Object.keys(this.serviceConnections).filter((service) => this.isServiceConnected(service))
      };

      return dashboard;
    } catch (error) {
      console.error('Erreur lors de la création du tableau de bord intégré :', error);
      return {};
    }
  }
}

// Création d'une instance globale d'intégration
window.integration = window.integration || new AutoFocusIntegration();