// Scalable translation system with namespace support
window.TranslationManager = {
    systems: {},
    
    // Register a new translation system
    registerSystem: function(systemName, defaultLang = 'en') {
        this.systems[systemName] = {
            name: systemName,
            translations: {},
            currentLang: defaultLang,
            initCallbacks: []
        };
        
        // Create shorthand methods for this system
        this[systemName] = {
            update: (lang) => this.updateSystem(systemName, lang),
            getLang: () => this.systems[systemName].currentLang,
            getTranslations: () => this.systems[systemName].translations[this.systems[systemName].currentLang] || {},
            onInit: (callback) => {
                this.systems[systemName].initCallbacks.push(callback);
            }
        };
        
        return this.systems[systemName];
    },
    
    // Add translations for a specific system
    addTranslations: function(systemName, lang, translations) {
        if (!this.systems[systemName]) {
            this.registerSystem(systemName, lang);
        }
        
        if (!this.systems[systemName].translations[lang]) {
            this.systems[systemName].translations[lang] = {};
        }
        
        // Deep merge translations
        this.mergeDeep(this.systems[systemName].translations[lang], translations);
    },
    
    // Update a specific system's language
    updateSystem: function(systemName, lang) {
        const system = this.systems[systemName];
        if (!system || !system.translations[lang]) {
            console.error(`Translation system "${systemName}" or language "${lang}" not found`);
            return;
        }
        
        system.currentLang = lang;
        const translations = system.translations[lang];
        
        // Update all elements with data-i18n-[systemName] attribute
        document.querySelectorAll(`[data-i18n-${systemName}]`).forEach(element => {
            const key = element.getAttribute(`data-i18n-${systemName}`);
            const value = this.getNestedValue(translations, key);
            
            if (value !== undefined) {
                if (element.tagName === 'INPUT' && element.type === 'button') {
                    element.value = value;
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = value;
                } else {
                    element.textContent = value;
                }
            }
        });
        
        // Handle RTL languages
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
            document.body.style.direction = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
            document.body.style.direction = 'ltr';
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Save preference - use shared key for compatibility
        localStorage.setItem(`english-hub-preferred-language-${systemName}`, lang);
        localStorage.setItem('english-hub-app-language', lang);
        
        // Trigger callbacks
        system.initCallbacks.forEach(callback => callback(lang));
        
        // NEW: Notify legacy system about language change
        window.dispatchEvent(new CustomEvent('globalLanguageChange', {
            detail: { language: lang }
        }));
    },
    
    // Initialize a system
    initSystem: function(systemName, selectorId = 'language-selector') {
        const system = this.systems[systemName];
        if (!system) {
            console.error(`Translation system "${systemName}" not registered`);
            return;
        }
        
        const languageSelector = document.getElementById(selectorId);
        
        if (!languageSelector) {
            console.warn(`Language selector #${selectorId} not found, using default language`);
            this.updateSystem(systemName, system.currentLang);
            return;
        }
        
        // Set initial language - check shared storage first
        const sharedLanguage = localStorage.getItem('english-hub-app-language');
        const savedLanguage = sharedLanguage || localStorage.getItem(`english-hub-preferred-language-${systemName}`) || system.currentLang;
        
        languageSelector.value = savedLanguage;
        
        // Update immediately
        this.updateSystem(systemName, savedLanguage);
        
        // Add change listener
        languageSelector.addEventListener('change', function() {
            TranslationManager.updateSystem(systemName, this.value);
        });
        
        // NEW: Listen for language changes from legacy system
        window.addEventListener('globalLanguageChange', function(event) {
            const newLang = event.detail.language;
            if (languageSelector.value !== newLang) {
                languageSelector.value = newLang;
                TranslationManager.updateSystem(systemName, newLang);
            }
        });
    },
    
    // Helper: Get nested value from object
    getNestedValue: function(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    },
    
    // Helper: Deep merge objects
    mergeDeep: function(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                this.mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    },
    
    // NEW: Function to sync with legacy system
    syncWithLegacySystem: function() {
        // Check if legacy I18N system exists
        if (window.I18N && typeof updateTranslations === 'function') {
            // Listen for language changes
            window.addEventListener('languageChanged', (event) => {
                const lang = event.detail.language;
                Object.keys(this.systems).forEach(systemName => {
                    if (this.systems[systemName].translations[lang]) {
                        this.updateSystem(systemName, lang);
                    }
                });
            });
            
            // Initialize with current language
            const currentLang = localStorage.getItem('english-hub-app-language') || 'en';
            this.updateSystem(Object.keys(this.systems)[0], currentLang);
        }
    }
};

function updateButtonTooltips() {
    const buttons = document.querySelectorAll('.EH-comprehension-audio-btn');
    buttons.forEach(button => {
        const textSpan = button.querySelector('[data-i18n-comprehension]');
        if (textSpan) {
            button.title = textSpan.textContent || textSpan.innerText;
        }
    });
}
// Global initialization function
function initTranslationSystem(systemName, defaultLang = 'en', selectorId = 'language-selector') {
    if (!TranslationManager.systems[systemName]) {
        TranslationManager.registerSystem(systemName, defaultLang);
    }
    TranslationManager.initSystem(systemName, selectorId);
        updateButtonTooltips();
    
    // NEW: Auto-sync with legacy system
    TranslationManager.syncWithLegacySystem();
}