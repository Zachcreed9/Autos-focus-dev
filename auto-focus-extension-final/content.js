// Content script for blocked sites in Auto-Focus extension
// This advanced version includes animations, motivational quotes, productivity timer, and themes

// Save the original content in case we want to restore it later
const originalContent = document.body.innerHTML;
const originalStyles = {
  backgroundColor: document.body.style.backgroundColor,
  overflowY: document.body.style.overflowY
};

// Motivational quotes collection
const motivationalQuotes = [
  { text: "La concentration est la clé du succès.", author: "Bill Gates" },
  { text: "La discipline est le pont entre les objectifs et leur accomplissement.", author: "Jim Rohn" },
  { text: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", author: "Winston Churchill" },
  { text: "Votre temps est limité, ne le gaspillez pas en menant une existence qui n'est pas la vôtre.", author: "Steve Jobs" },
  { text: "La qualité n'est jamais un accident ; c'est toujours le résultat d'un effort intelligent.", author: "John Ruskin" },
  { text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", author: "Winston Churchill" },
  { text: "La persévérance est un talent en soi.", author: "Elon Musk" },
  { text: "Les gagnants trouvent des moyens, les perdants des excuses.", author: "F. D. Roosevelt" },
  { text: "Le plus grand plaisir de la vie est de réaliser ce que les autres vous pensent incapable de réaliser.", author: "Walter Bagehot" },
  { text: "La meilleure façon de prédire l'avenir est de le créer.", author: "Peter Drucker" }
];

// Color themes
const themes = {
  blue: {
    primary: '#4285F4',
    secondary: 'rgba(66, 133, 244, 0.1)',
    background: '#f8f9fa',
    cardBg: 'white',
    text: '#1a1a1a',
    textSecondary: '#5f6368'
  },
  dark: {
    primary: '#BB86FC',
    secondary: 'rgba(187, 134, 252, 0.1)',
    background: '#121212',
    cardBg: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#BBBBBB'
  },
  green: {
    primary: '#0F9D58',
    secondary: 'rgba(15, 157, 88, 0.1)',
    background: '#f4f9f6',
    cardBg: 'white',
    text: '#1a1a1a',
    textSecondary: '#5f6368'
  },
  orange: {
    primary: '#F4B400',
    secondary: 'rgba(244, 180, 0, 0.1)',
    background: '#fffbf2',
    cardBg: 'white',
    text: '#1a1a1a',
    textSecondary: '#5f6368'
  }
};

// Get theme preference or set default
function getTheme() {
  const themeName = localStorage.getItem('autoFocusTheme') || 'blue';
  return themes[themeName];
}

// Function to format time (seconds to MM:SS)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Replace the page content with our blocking message
function blockPage() {
  const theme = getTheme();
  
  // Create container for the block screen with a nice fade-in animation
  const blockContainer = document.createElement('div');
  blockContainer.id = 'auto-focus-block-container';
  blockContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${theme.background};
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: 'Segoe UI', Arial, sans-serif;
    opacity: 0;
    transition: opacity 0.5s ease;
  `;
  
  // Create content block with subtle animation
  const contentBlock = document.createElement('div');
  contentBlock.style.cssText = `
    background-color: ${theme.cardBg};
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    text-align: center;
    transform: translateY(20px);
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;
  
  // Create animated logo/icon with pulse effect
  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = `
    animation: pulse 2s infinite ease-in-out;
  `;
  
  iconContainer.innerHTML = `
    <style>
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes gradient {
        0% { stroke: ${theme.primary}; }
        50% { stroke: #ff5252; }
        100% { stroke: ${theme.primary}; }
      }
      
      .spinner-path {
        animation: gradient 4s infinite, spin 8s linear infinite;
        transform-origin: center;
      }
    </style>
    <svg width="80" height="80" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="16" fill="${theme.primary}"/>
      <circle cx="64" cy="64" r="32" fill="${theme.cardBg}"/>
      <circle cx="64" cy="64" r="16" fill="${theme.primary}"/>
      <path class="spinner-path" d="M16 64C16 37.4903 37.4903 16 64 16" stroke="${theme.cardBg}" stroke-width="8" stroke-linecap="round"/>
      <path class="spinner-path" d="M112 64C112 90.5097 90.5097 112 64 112" stroke="${theme.cardBg}" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `;
  
  // Create title with gradient text
  const title = document.createElement('h1');
  title.textContent = '🚀 AUTO-FOCUS';
  title.style.cssText = `
    font-size: 28px;
    font-weight: 800;
    margin: 24px 0 8px;
    color: ${theme.text};
    letter-spacing: 1px;
    background: linear-gradient(90deg, ${theme.primary}, #ff5252);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `;
  
  // Create subtitle
  const subtitle = document.createElement('h2');
  subtitle.textContent = 'Site bloqué pour maximiser votre productivité';
  subtitle.style.cssText = `
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 24px;
    color: ${theme.textSecondary};
  `;
  
  // Get random quote
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  // Create quote container
  const quoteContainer = document.createElement('div');
  quoteContainer.style.cssText = `
    background-color: ${theme.secondary};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
    position: relative;
  `;
  
  // Create quote text
  const quoteText = document.createElement('p');
  quoteText.textContent = `"${randomQuote.text}"`;
  quoteText.style.cssText = `
    font-size: 16px;
    font-style: italic;
    margin: 0 0 8px;
    color: ${theme.text};
    line-height: 1.5;
  `;
  
  // Create quote author
  const quoteAuthor = document.createElement('p');
  quoteAuthor.textContent = `— ${randomQuote.author}`;
  quoteAuthor.style.cssText = `
    font-size: 14px;
    text-align: right;
    margin: 0;
    color: ${theme.textSecondary};
  `;
  
  // Add quote elements to container
  quoteContainer.appendChild(quoteText);
  quoteContainer.appendChild(quoteAuthor);
  
  // Create timer container
  const timerContainer = document.createElement('div');
  timerContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
  `;
  
  // Create timer label
  const timerLabel = document.createElement('p');
  timerLabel.textContent = 'Temps de concentration restant';
  timerLabel.style.cssText = `
    font-size: 14px;
    margin: 0 0 8px;
    color: ${theme.textSecondary};
  `;
  
  // Create timer display
  const timerDisplay = document.createElement('div');
  timerDisplay.style.cssText = `
    font-size: 32px;
    font-weight: 700;
    color: ${theme.primary};
    margin-bottom: 8px;
  `;
  timerDisplay.textContent = '25:00';
  
  // Create timer progress bar
  const timerProgress = document.createElement('div');
  timerProgress.style.cssText = `
    width: 100%;
    height: 6px;
    background-color: ${theme.secondary};
    border-radius: 3px;
    overflow: hidden;
  `;
  
  const timerProgressFill = document.createElement('div');
  timerProgressFill.style.cssText = `
    width: 100%;
    height: 100%;
    background-color: ${theme.primary};
    border-radius: 3px;
    transition: width 1s linear;
  `;
  
  timerProgress.appendChild(timerProgressFill);
  
  // Add timer elements to container
  timerContainer.appendChild(timerLabel);
  timerContainer.appendChild(timerDisplay);
  timerContainer.appendChild(timerProgress);
  
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 8px;
  `;
  
  // Create override button
  const overrideButton = document.createElement('button');
  overrideButton.textContent = '⏱️ Autoriser 10 min';
  overrideButton.style.cssText = `
    background-color: transparent;
    border: 2px solid ${theme.primary};
    color: ${theme.primary};
    padding: 10px 20px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    outline: none;
  `;
  
  overrideButton.addEventListener('mouseover', () => {
    overrideButton.style.backgroundColor = theme.secondary;
    overrideButton.style.transform = 'translateY(-2px)';
    overrideButton.style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.1)`;
  });
  
  overrideButton.addEventListener('mouseout', () => {
    overrideButton.style.backgroundColor = 'transparent';
    overrideButton.style.transform = 'translateY(0)';
    overrideButton.style.boxShadow = 'none';
  });
  
  // Create stay focused button
  const stayFocusedButton = document.createElement('button');
  stayFocusedButton.textContent = '🎯 Rester concentré';
  stayFocusedButton.style.cssText = `
    background-color: ${theme.primary};
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    outline: none;
  `;
  
  stayFocusedButton.addEventListener('mouseover', () => {
    stayFocusedButton.style.transform = 'translateY(-2px)';
    stayFocusedButton.style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.2)`;
  });
  
  stayFocusedButton.addEventListener('mouseout', () => {
    stayFocusedButton.style.transform = 'translateY(0)';
    stayFocusedButton.style.boxShadow = 'none';
  });
  
  // Create theme switcher container
  const themeContainer = document.createElement('div');
  themeContainer.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
  `;
  
  // Create theme options
  Object.keys(themes).forEach(themeName => {
    const themeButton = document.createElement('button');
    const themeColor = themes[themeName].primary;
    
    themeButton.style.cssText = `
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: ${themeColor};
      border: 2px solid ${themeName === localStorage.getItem('autoFocusTheme') ? 'white' : 'transparent'};
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      outline: none;
    `;
    
    themeButton.addEventListener('mouseover', () => {
      themeButton.style.transform = 'scale(1.1)';
      themeButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    });
    
    themeButton.addEventListener('mouseout', () => {
      themeButton.style.transform = 'scale(1)';
      themeButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    themeButton.addEventListener('click', () => {
      localStorage.setItem('autoFocusTheme', themeName);
      // Reload page to apply new theme
      blockPage();
      document.body.removeChild(blockContainer);
    });
    
    themeContainer.appendChild(themeButton);
  });
  
  // Create productivity tip
  const tipContainer = document.createElement('div');
  tipContainer.style.cssText = `
    margin-top: 24px;
    font-size: 13px;
    color: ${theme.textSecondary};
  `;
  
  const tips = [
    "💡 Astuce : Utilisez la technique Pomodoro - 25 minutes de travail, 5 minutes de pause.",
    "💡 Astuce : Désactivez les notifications pendant vos sessions de travail.",
    "💡 Astuce : Préparez une liste de tâches prioritaires chaque matin.",
    "💡 Astuce : Hydratez-vous régulièrement pour maintenir votre concentration.",
    "💡 Astuce : Faites de courtes pauses actives pour augmenter votre productivité."
  ];
  
  tipContainer.textContent = tips[Math.floor(Math.random() * tips.length)];
  
  // Add event listeners
  overrideButton.addEventListener('click', () => {
    // Show confirmation animation
    contentBlock.style.transform = 'scale(0.95)';
    contentBlock.style.opacity = '0.8';
    
    setTimeout(() => {
      // Remove the block screen with animation
      blockContainer.style.opacity = '0';
      
      setTimeout(() => {
        document.body.removeChild(blockContainer);
        
        // Restore original page content
        document.body.style.backgroundColor = originalStyles.backgroundColor;
        document.body.style.overflowY = originalStyles.overflowY;
        
        // Set a session storage flag to avoid blocking again on refresh
        sessionStorage.setItem('autoFocusOverride', Date.now().toString());
        
        // Optional: Set a timer to re-block after 10 minutes
        setTimeout(() => {
          sessionStorage.removeItem('autoFocusOverride');
          blockPage();
        }, 10 * 60 * 1000);
      }, 500);
    }, 200);
  });
  
  stayFocusedButton.addEventListener('click', () => {
    // Show animation
    stayFocusedButton.style.backgroundColor = '#4CAF50';
    stayFocusedButton.textContent = '✅ Excellent choix!';
    
    setTimeout(() => {
      // Go to the productivity dashboard
      window.location.href = 'https://todoist.com/';
    }, 1000);
  });
  
  // Add buttons to container
  buttonContainer.appendChild(overrideButton);
  buttonContainer.appendChild(stayFocusedButton);
  
  // Add all elements to the container
  contentBlock.appendChild(iconContainer);
  contentBlock.appendChild(title);
  contentBlock.appendChild(subtitle);
  contentBlock.appendChild(quoteContainer);
  contentBlock.appendChild(timerContainer);
  contentBlock.appendChild(buttonContainer);
  contentBlock.appendChild(themeContainer);
  contentBlock.appendChild(tipContainer);
  blockContainer.appendChild(contentBlock);
  
  // Prevent scrolling on the body
  document.body.style.overflowY = 'hidden';
  
  // Add to page
  document.body.appendChild(blockContainer);
  
  // Start animations after a short delay
  setTimeout(() => {
    blockContainer.style.opacity = '1';
    contentBlock.style.transform = 'translateY(0)';
  }, 50);
  
  // Initialize and start timer
  let timeRemaining = 25 * 60; // 25 minutes in seconds
  
  const timer = setInterval(() => {
    timeRemaining--;
    
    if (timeRemaining <= 0) {
      clearInterval(timer);
      sessionStorage.removeItem('autoFocusOverride');
      // Refresh to release the block
      window.location.reload();
    }
    
    // Update timer display
    timerDisplay.textContent = formatTime(timeRemaining);
    
    // Update progress bar
    const percentRemaining = (timeRemaining / (25 * 60)) * 100;
    timerProgressFill.style.width = `${percentRemaining}%`;
    
    // Add pulse animation when time is running low
    if (timeRemaining <= 60) { // last minute
      timerDisplay.style.animation = 'pulse 1s infinite';
      timerDisplay.style.color = '#ff5252';
    }
  }, 1000);
}

// Check if there's a valid override in session storage
const override = sessionStorage.getItem('autoFocusOverride');
const now = Date.now();
const tenMinutesInMs = 10 * 60 * 1000;

if (override && now - parseInt(override) < tenMinutesInMs) {
  // Override is still valid, don't block
  const remainingTime = Math.floor((parseInt(override) + tenMinutesInMs - now) / 1000);
  
  // Add a subtle indicator that the site is temporarily allowed
  const indicatorBar = document.createElement('div');
  indicatorBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335);
    z-index: 9999;
  `;
  
  const indicatorText = document.createElement('div');
  indicatorText.style.cssText = `
    position: fixed;
    top: 5px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #333;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', Arial, sans-serif;
    z-index: 9999;
    cursor: pointer;
  `;
  indicatorText.textContent = `Auto-Focus : Site autorisé pour ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}`;
  
  document.body.appendChild(indicatorBar);
  document.body.appendChild(indicatorText);
  
  // Update the timer every second
  const updateTimer = setInterval(() => {
    const currentTime = Date.now();
    const updatedRemainingTime = Math.floor((parseInt(override) + tenMinutesInMs - currentTime) / 1000);
    
    if (updatedRemainingTime <= 0) {
      clearInterval(updateTimer);
      window.location.reload(); // Refresh to trigger the block
    } else {
      indicatorText.textContent = `Auto-Focus : Site autorisé pour ${Math.floor(updatedRemainingTime / 60)}:${(updatedRemainingTime % 60).toString().padStart(2, '0')}`;
    }
  }, 1000);
  
  // Allow user to click the indicator to re-block immediately
  indicatorText.addEventListener('click', () => {
    clearInterval(updateTimer);
    sessionStorage.removeItem('autoFocusOverride');
    document.body.removeChild(indicatorBar);
    document.body.removeChild(indicatorText);
    blockPage();
  });
} else {
  // Block the page with our amazing interface
  blockPage();
}