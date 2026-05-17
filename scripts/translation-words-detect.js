// translation-words-detect.js – dual language (cards) + normal translation + theme + RTL
// Storage unified under EH_words_detect_settings

(function() {
    var RTL_LANGUAGES = ['ar'];
    var STORAGE_KEY = 'EH_words_detect_settings';

    // ---- Unified storage helpers ----
    function loadSettings() {
        var defaults = {
            lang: 'en',
            theme: null // null means auto-detect from system
        };

        var settings = null;
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                settings = JSON.parse(raw);
            } catch(e) { /* ignore */ }
        }

        if (!settings) {
            settings = { lang: defaults.lang, theme: defaults.theme };
        }

        // Ensure both properties exist
        if (!settings.hasOwnProperty('lang')) settings.lang = defaults.lang;
        if (!settings.hasOwnProperty('theme')) settings.theme = defaults.theme;

        return settings;
    }

    function saveSettings(settings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    // Get translation for a given key and language
    function getTranslation(lang, key) {
        if (!window.I18N || !window.I18N[lang]) return null;
        var keys = key.split('.');
        var value = window.I18N[lang];
        for (var i = 0; i < keys.length; i++) {
            if (value && typeof value === 'object' && keys[i] in value) {
                value = value[keys[i]];
            } else {
                return null;
            }
        }
        return (typeof value === 'string') ? value : null;
    }

    // Remove all dual wrappers and restore original elements
    function cleanDualWrappers() {
        var wrappers = document.querySelectorAll('.EH-words-detect-dual-text-wrapper');
        for (var i = 0; i < wrappers.length; i++) {
            var wrapper = wrappers[i];
            var originalSpan = wrapper.querySelector('[data-i18n]');
            if (originalSpan) {
                wrapper.parentNode.replaceChild(originalSpan, wrapper);
            }
        }
    }

    // Apply dual language (English text + pill below) – only for cards
    function applyDualTranslation(el, englishText, translation, lang) {
        var wrapper = document.createElement('div');
        wrapper.className = 'EH-words-detect-dual-text-wrapper';
        
        var parent = el.parentNode;
        var nextSibling = el.nextSibling;
        
        // Set English text on the original element
        el.textContent = englishText;
        el.setAttribute('dir', 'ltr');
        el.style.display = 'inline-block';
        
        wrapper.appendChild(el);
        
        var pill = document.createElement('span');
        pill.className = 'EH-words-detect-translation-pill';
        pill.textContent = translation;
        if (lang === 'ar') {
            pill.setAttribute('dir', 'rtl');
        }
        wrapper.appendChild(pill);
        
        if (nextSibling) {
            parent.insertBefore(wrapper, nextSibling);
        } else {
            parent.appendChild(wrapper);
        }
    }

    // Apply normal translation (replace text)
    function applyNormalTranslation(el, text) {
        if (text && typeof text === 'string') {
            el.textContent = text;
        }
    }

    // Main translation function
    function applyTranslations(lang) {
        if (!window.I18N || !window.I18N[lang]) return;
        
        cleanDualWrappers();
        
        var elements = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var key = el.getAttribute('data-i18n');
            
            var isDual = (lang !== 'en') && (el.closest('.EH-words-detect-common-card') !== null);
            
            if (lang === 'en') {
                var englishText = getTranslation('en', key);
                if (englishText) el.textContent = englishText;
            } else if (isDual) {
                var eng = getTranslation('en', key);
                var trans = getTranslation(lang, key);
                if (eng && trans) {
                    applyDualTranslation(el, eng, trans, lang);
                } else if (trans) {
                    el.textContent = trans;
                }
            } else {
                var translation = getTranslation(lang, key);
                if (translation) el.textContent = translation;
            }
        }
    }

    function setRTL(lang) {
        var isRTL = RTL_LANGUAGES.indexOf(lang) !== -1;
        var htmlEl = document.documentElement;
        if (isRTL) {
            htmlEl.setAttribute('dir', 'rtl');
            htmlEl.setAttribute('data-rtl', 'true');
        } else {
            htmlEl.removeAttribute('dir');
            htmlEl.removeAttribute('data-rtl');
        }
    }

    function applyTheme(themeSetting) {
        var isDark;
        if (themeSetting === 'dark') {
            isDark = true;
        } else if (themeSetting === 'light') {
            isDark = false;
        } else {
            // auto: follow system preference
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    function setLanguage(lang) {
        var settings = loadSettings();
        settings.lang = lang;
        saveSettings(settings);
        applyTranslations(lang);
        setRTL(lang);
    }

    function toggleTheme() {
        var settings = loadSettings();
        var currentIsDark = document.documentElement.hasAttribute('data-theme');
        var newTheme = currentIsDark ? 'light' : 'dark';
        settings.theme = newTheme;
        saveSettings(settings);
        applyTheme(newTheme);
    }

    function loadLanguageAndTheme() {
        var settings = loadSettings();
        var lang = settings.lang;
        var theme = settings.theme;

        var select = document.getElementById('EH-words-detect-common-lang-select');
        if (select) select.value = lang;
        applyTranslations(lang);
        setRTL(lang);
        applyTheme(theme);
    }

    document.addEventListener('DOMContentLoaded', function() {
        loadLanguageAndTheme();

        var langSelect = document.getElementById('EH-words-detect-common-lang-select');
        if (langSelect) {
            langSelect.addEventListener('change', function(e) {
                setLanguage(e.target.value);
            });
        }

        var themeBtn = document.getElementById('EH-words-detect-common-theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', toggleTheme);
        }
    });
})();