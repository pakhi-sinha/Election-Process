// public/app.js
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const chatWindow = document.getElementById('chat-window');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const langSelect = document.getElementById('lang-select');
  const contrastToggle = document.getElementById('contrast-toggle');
  const voiceBtn = document.getElementById('voice-btn');
  
  // Text Elements for i18n
  const appTitle = document.getElementById('app-title');
  const appSubtitle = document.getElementById('app-subtitle');
  const sendBtnText = document.getElementById('send-btn-text');

  // --- State ---
  let currentLang = 'en';
  let i18nData = {};
  let isRecording = false;
  
  // --- Initialization ---
  async function init() {
    await loadLanguage(currentLang);
    addMessage(i18nData.welcome_message || 'Welcome to VoteGuide!', 'bot');
  }

  // --- i18n Logic ---
  async function loadLanguage(lang) {
    try {
      const response = await fetch(`i18n/${lang}.json`);
      if (!response.ok) throw new Error('Network response was not ok');
      i18nData = await response.json();
      applyI18n();
    } catch (error) {
      console.error('Failed to load language file:', error);
    }
  }

  function applyI18n() {
    appTitle.textContent = i18nData.title;
    appSubtitle.textContent = i18nData.subtitle;
    chatInput.placeholder = i18nData.input_placeholder;
    sendBtnText.textContent = i18nData.send_button;
    
    // Update ARIA labels
    chatInput.setAttribute('aria-label', i18nData.input_placeholder);
    contrastToggle.setAttribute('aria-label', i18nData.toggle_contrast);
    langSelect.setAttribute('aria-label', i18nData.language_selector);
    voiceBtn.setAttribute('aria-label', isRecording ? i18nData.voice_input_stop : i18nData.voice_input_start);
    voiceBtn.title = isRecording ? i18nData.voice_input_stop : i18nData.voice_input_start;
  }

  langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    document.documentElement.lang = currentLang;
    loadLanguage(currentLang);
  });

  // --- High Contrast Toggle ---
  contrastToggle.addEventListener('click', () => {
    const isHighContrast = document.body.classList.toggle('high-contrast');
    contrastToggle.setAttribute('aria-pressed', isHighContrast);
  });

  // --- Voice Input (Web Speech API) ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isRecording = true;
      voiceBtn.classList.add('recording');
      applyI18n(); // Update title/aria
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      stopRecording();
    };

    recognition.onend = () => {
      stopRecording();
    };
  } else {
    voiceBtn.style.display = 'none'; // Hide if unsupported
  }

  function stopRecording() {
    isRecording = false;
    voiceBtn.classList.remove('recording');
    applyI18n();
  }

  voiceBtn.addEventListener('click', () => {
    if (!recognition) return;
    
    if (isRecording) {
      recognition.stop();
    } else {
      // Set language for recognition based on select
      const langMap = { 'en': 'en-US', 'es': 'es-ES', 'hi': 'hi-IN', 'zh': 'zh-CN' };
      recognition.lang = langMap[currentLang] || 'en-US';
      recognition.start();
    }
  });

  // --- Chat UI Logic ---
  function addMessage(content, sender = 'user', isHtml = false) {
    // Remove typing indicator if it exists
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isHtml) {
      // Use the requested safe fallback pattern
      const safeHTML = window.DOMPurify
        ? DOMPurify.sanitize(marked.parse(content))
        : marked.parse(content);
      contentDiv.innerHTML = safeHTML;
    } else {
      contentDiv.textContent = content;
    }
    
    msgDiv.appendChild(contentDiv);
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    if (sender === 'bot') {
      chatWindow.setAttribute("tabindex", "-1");
      chatWindow.focus();
    }
  }

  function showTypingIndicator() {
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'typing-indicator';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      div.appendChild(dot);
    }
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Handle form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    addMessage(text, 'user');
    chatInput.value = '';
    
    // 2. Show Typing Indicator
    showTypingIndicator();

    // 3. Send to Backend
    try {
      const API_URL = window.location.hostname === "localhost"
        ? "http://127.0.0.1:5001/studio-1814048900-b0590/us-central1/api/api/chat"
        : "/api/chat";
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text, language: currentLang })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Network response was not ok');
      }

      // For now, handling as simple JSON. SSE will be implemented in commit 25
      const data = await response.json();
      const content = data.reply || "I am processing your request. Stay tuned!";
      
      // Pass raw content; addMessage will handle parsing and sanitization
      addMessage(content, 'bot', true);

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage(error.message || i18nData.error_message || "⚠️ Unable to connect. Please try again.", 'bot');
    }
  });

  // Run init
  init();
});
